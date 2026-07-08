import { BUILDINGS, PATHS, BuildingDef } from './map-data';

const UNIT = 2.2;
const GRID_CX = 6;
const GRID_CY = 8;

// Helper para convertir coordenadas de grilla a 3D local (x, z)
export const get3DPos = (gx: number, gy: number): [number, number] => {
  const x = (gx - GRID_CX) * UNIT;
  const z = (gy - GRID_CY) * UNIT;
  return [x, z];
};

export interface PathNode {
  id: string;
  x: number;
  z: number;
  links: { nodeId: string; weight: number }[];
}

class Pathfinder {
  private nodes: Map<string, PathNode> = new Map();

  constructor() {
    this.buildGraph();
  }

  // Construye el grafo a partir de los senderos (PATHS) y edificios
  private buildGraph() {
    this.nodes.clear();
    const tempPoints: { id: string; x: number; z: number }[] = [];

    // 1. Agregar nodos de senderos (PATHS)
    PATHS.forEach((path, pathIdx) => {
      path.line.forEach((pt, ptIdx) => {
        const [x, z] = get3DPos(pt[0], pt[1]);
        const id = `p_${pathIdx}_${ptIdx}`;
        tempPoints.push({ id, x, z });
      });
    });

    // 2. Fusionar nodos de senderos que estén en la misma posición (intersecciones)
    const mergedIds: Map<string, string> = new Map(); // originalId -> mergedId
    const pointsToUse: { id: string; x: number; z: number }[] = [];

    tempPoints.forEach(p => {
      // Buscar si ya existe un punto en esa posición
      const match = pointsToUse.find(existing => 
        Math.hypot(existing.x - p.x, existing.z - p.z) < 0.2
      );

      if (match) {
        mergedIds.set(p.id, match.id);
      } else {
        pointsToUse.push(p);
        mergedIds.set(p.id, p.id);
        this.nodes.set(p.id, { id: p.id, x: p.x, z: p.z, links: [] });
      }
    });

    // 3. Conectar nodos adyacentes en cada sendero
    PATHS.forEach((path, pathIdx) => {
      for (let i = 0; i < path.line.length - 1; i++) {
        const rawId1 = `p_${pathIdx}_${i}`;
        const rawId2 = `p_${pathIdx}_${i + 1}`;

        const id1 = mergedIds.get(rawId1)!;
        const id2 = mergedIds.get(rawId2)!;

        if (id1 === id2) continue;

        const n1 = this.nodes.get(id1)!;
        const n2 = this.nodes.get(id2)!;

        const dist = Math.hypot(n1.x - n2.x, n1.z - n2.z);

        // Enlace bidireccional
        if (!n1.links.some(l => l.nodeId === id2)) {
          n1.links.push({ nodeId: id2, weight: dist });
        }
        if (!n2.links.some(l => l.nodeId === id1)) {
          n2.links.push({ nodeId: id1, weight: dist });
        }
      }
    });

    // 4. Agregar edificios y conectarlos al nodo de sendero más cercano (puerta/acceso)
    BUILDINGS.forEach(b => {
      // Calcular centro visual del edificio
      const [bx, bz] = get3DPos(b.gx, b.gy);
      const height = b.h * 0.42;
      const x = bx + (b.w * UNIT) / 2;
      const z = bz + (b.d * UNIT) / 2;

      // Crear nodo del edificio
      this.nodes.set(b.id, { id: b.id, x, z, links: [] });

      // Encontrar el nodo de sendero más cercano
      let closestNode: PathNode | null = null;
      let minDist = Infinity;

      this.nodes.forEach(n => {
        if (n.id === b.id || b.id === n.id.slice(2)) return; // Evitar conectarse a sí mismo
        // Solo conectar con nodos de senderos (ID empieza con p_)
        if (!n.id.startsWith('p_')) return;

        const dist = Math.hypot(n.x - x, n.z - z);
        if (dist < minDist) {
          minDist = dist;
          closestNode = n;
        }
      });

      if (closestNode) {
        const node = this.nodes.get(b.id)!;
        const targetNode = closestNode as PathNode;
        // Conectar edificio al sendero
        node.links.push({ nodeId: targetNode.id, weight: minDist });
        targetNode.links.push({ nodeId: b.id, weight: minDist });
      }
    });
  }

  // Encuentra el camino más corto entre startId y endId usando Dijkstra
  public findPath(startId: string, endId: string): [number, number][] | null {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
      // Si el inicio es una coordenada libre (GPS), buscaremos el nodo más cercano
      return null;
    }

    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const queue: string[] = [];

    this.nodes.forEach(node => {
      distances.set(node.id, node.id === startId ? 0 : Infinity);
      previous.set(node.id, null);
      queue.push(node.id);
    });

    while (queue.length > 0) {
      // Encontrar nodo con distancia mínima en la cola
      queue.sort((a, b) => distances.get(a)! - distances.get(b)!);
      const currentId = queue.shift()!;

      if (currentId === endId) {
        break; // Destino alcanzado
      }

      const currentDistance = distances.get(currentId)!;
      if (currentDistance === Infinity) {
        break; // Nodos restantes inalcanzables
      }

      const currentNode = this.nodes.get(currentId)!;
      currentNode.links.forEach(link => {
        if (!queue.includes(link.nodeId)) return; // Ya visitado

        const alt = currentDistance + link.weight;
        if (alt < distances.get(link.nodeId)!) {
          distances.set(link.nodeId, alt);
          previous.set(link.nodeId, currentId);
        }
      });
    }

    // Reconstruir el camino
    const path: [number, number][] = [];
    let current: string | null = endId;

    while (current !== null) {
      const node = this.nodes.get(current)!;
      path.unshift([node.x, node.z]);
      current = previous.get(current) || null;
    }

    // Si el primer nodo no es el de inicio, no hay camino viable
    if (path.length > 0 && this.nodes.get(startId)!.x === path[0][0] && this.nodes.get(startId)!.z === path[0][1]) {
      return path;
    }

    return null;
  }

  // Encuentra el nodo más cercano a una coordenada 3D dada
  public getClosestNodeId(x: number, z: number): string | null {
    let closestId: string | null = null;
    let minDist = Infinity;

    this.nodes.forEach(node => {
      // Preferimos conectarnos a nodos peatonales (no directamente a edificios) para iniciar el camino
      if (!node.id.startsWith('p_')) return;

      const dist = Math.hypot(node.x - x, node.z - z);
      if (dist < minDist) {
        minDist = dist;
        closestId = node.id;
      }
    });

    return closestId;
  }

  // Encuentra la ruta más corta desde una coordenada libre (GPS) a un edificio destino
  public findPathFromCoords(startX: number, startZ: number, destBuildingId: string): [number, number][] | null {
    const closestNodeId = this.getClosestNodeId(startX, startZ);
    if (!closestNodeId) return null;

    const path = this.findPath(closestNodeId, destBuildingId);
    if (path) {
      // Insertar el punto de partida libre al inicio del trayecto
      path.unshift([startX, startZ]);
      return path;
    }

    return null;
  }
}

export const pathfinder = new Pathfinder();
