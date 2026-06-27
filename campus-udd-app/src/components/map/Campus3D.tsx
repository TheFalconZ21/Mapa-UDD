'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { BUILDINGS, TERRACES, PATHS, PARKING, FRIENDS, EVENTS, PAL, BuildingDef } from '@/lib/map-data';

// ── Grid Constants ───────────────────────────────────────────────────────────
const UNIT = 2.2;
const HEIGHT_SCALE = 0.16;
const GRID_CX = 6;
const GRID_CY = 8;

const get3DPos = (gx: number, gy: number, gz = 0) => {
  const x = (gx - GRID_CX) * UNIT;
  const z = (gy - GRID_CY) * UNIT;
  const y = gz * HEIGHT_SCALE;
  return [x, y, z] as [number, number, number];
};

// ── Terrain Terrace Component ───────────────────────────────────────────────
function Terrace3D({ t }: { t: any }) {
  const gxs = t.corners.map((c: any[]) => c[0]);
  const gys = t.corners.map((c: any[]) => c[1]);
  const minGx = Math.min(...gxs);
  const maxGx = Math.max(...gxs);
  const minGy = Math.min(...gys);
  const maxGy = Math.max(...gys);

  const w = (maxGx - minGx) * UNIT;
  const d = (maxGy - minGy) * UNIT;
  const h = 1.0 + t.z * HEIGHT_SCALE;
  
  const cx = ((minGx + maxGx) / 2 - GRID_CX) * UNIT;
  const cz = ((minGy + maxGy) / 2 - GRID_CY) * UNIT;
  const cy = t.z * HEIGHT_SCALE - h / 2;

  return (
    <mesh position={[cx, cy, cz]} receiveShadow castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial attach="material-0" color={PAL.cliff} roughness={1} />
      <meshStandardMaterial attach="material-1" color={PAL.cliff} roughness={1} />
      <meshStandardMaterial attach="material-2" color={t.top} roughness={0.95} />
      <meshStandardMaterial attach="material-3" color={PAL.cliff2} roughness={1} />
      <meshStandardMaterial attach="material-4" color={PAL.cliff2} roughness={1} />
      <meshStandardMaterial attach="material-5" color={PAL.cliff} roughness={1} />
    </mesh>
  );
}

// ── Building Component ──────────────────────────────────────────────────────
function Building3D({ b, selected, anySelected, onSelect }: any) {
  const shell = useRef<THREE.Mesh>(null);
  const roof = useRef<THREE.Mesh>(null);
  
  const prog = useRef(0);
  const dim = useRef(1);
  const [hover, setHover] = useState(false);

  const smooth = (a: number, dt: number) => 1 - Math.pow(a, dt);

  useFrame((_, dt) => {
    // Just a simple pop-up animation for now
    const targetDim = selected ? 1.0 : (anySelected ? 0.38 : 1.0);
    dim.current += (targetDim - dim.current) * smooth(0.001, dt);
    
    if (shell.current && !Array.isArray(shell.current.material)) {
      shell.current.material.opacity = dim.current;
      shell.current.material.depthWrite = dim.current > 0.8;
      (shell.current.material as THREE.MeshStandardMaterial).emissiveIntensity = hover && !anySelected ? 0.2 : 0;
      shell.current.visible = dim.current > 0.01;
    }
  });

  return (
    <group position={[b.x, b.baseY, b.z]} rotation={[0, b.ry || 0, 0]}>
      {/* Exterior */}
      <mesh ref={shell} position={[0, b.height / 2, 0]} castShadow receiveShadow
            onClick={(e) => { e.stopPropagation(); onSelect(b.id); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor='pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor='default'; }}>
        <boxGeometry args={b.size} />
        <meshStandardMaterial 
          color={b.color} 
          emissive={b.color} 
          emissiveIntensity={0} 
          transparent 
          opacity={1} 
          roughness={0.75} 
          metalness={0.1} 
        />
      </mesh>

      {/* Roof Cap */}
      <mesh ref={roof} position={[0, b.height / 2 + 0.08, 0]} castShadow>
        <boxGeometry args={[b.size[0] + 0.15, 0.14, b.size[2] + 0.15]} />
        <meshStandardMaterial color={b.roof} transparent opacity={1} roughness={0.8} />
      </mesh>

      {/* Floating title */}
      <Html position={[0, b.height + 0.6, 0]} center className="pointer-events-none select-none">
        <div className="px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100 whitespace-nowrap transition-opacity duration-300"
             style={{ opacity: selected ? 0 : (anySelected ? 0.2 : 1) }}>
          {b.short}
        </div>
      </Html>
    </group>
  );
}

// ── Camera Rig ──────────────────────────────────────────────────────────────
function CameraRig3D({ selected, bSelected }: any) {
  const orbitRef = useRef<any>(null);
  const { camera } = useThree();
  const savedPose = useRef({
    position: new THREE.Vector3(18, 25, 35),
    target: new THREE.Vector3(0, 1.5, 3.5)
  });
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (selected && bSelected) {
      if (orbitRef.current) {
        savedPose.current.position.copy(camera.position);
        savedPose.current.target.copy(orbitRef.current.target);
      }
    }
  }, [selected, bSelected, camera.position]);

  useFrame(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;

    if (selected && bSelected) {
      const targetLook = new THREE.Vector3(bSelected.x, bSelected.baseY + bSelected.height / 3, bSelected.z);
      orbit.target.lerp(targetLook, 0.05);
      isTransitioning.current = true;
    } else {
      orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -80, 60);
      orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, 0, 15);
      orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -60, 50);

      if (isTransitioning.current) {
        camera.position.lerp(savedPose.current.position, 0.08);
        orbit.target.lerp(savedPose.current.target, 0.08);
        if (camera.position.distanceTo(savedPose.current.position) < 0.1) {
          isTransitioning.current = false;
        }
      }
    }
    orbit.update();
  });

  return (
    <OrbitControls 
      ref={orbitRef} 
      enableDamping 
      dampingFactor={0.08}
      minDistance={6} 
      maxDistance={80}
      maxPolarAngle={1.35} 
      enablePan={true}
      target={[0, 1.5, 3.5]}
    />
  );
}

// ── Main Map Component ──────────────────────────────────────────────────────
export default function CampusMap3D() {
  const [selected, setSelected] = useState<string | null>(null);

  const { BUILDINGS_3D, BY_ID } = useMemo(() => {
    const b3d = BUILDINGS.map(b => {
      const height = b.h * 0.42;
      const [x, y, z] = get3DPos(b.gx, b.gy, b.z);
      
      const visualX = x + (b.w * UNIT) / 2;
      const visualZ = z + (b.d * UNIT) / 2;

      return {
        ...b,
        x: visualX,
        z: visualZ,
        baseY: y,
        height,
        size: [b.w * UNIT - 0.12, height, b.d * UNIT - 0.12],
        color: PAL.mats[b.mat]?.[0] || '#ccc',
        roof: PAL.mats[b.mat]?.[1] || '#ccc'
      };
    });
    
    return {
      BUILDINGS_3D: b3d,
      BY_ID: Object.fromEntries(b3d.map(b => [b.id, b]))
    };
  }, []);

  const bSelected = selected ? BY_ID[selected] : null;

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative' }} 
      onClick={() => setSelected(null)}
    >
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [18, 25, 35], fov: 38, near: 0.1, far: 500 }}>
        <color attach="background" args={['#d4dde0']} />
        <fog attach="fog" args={['#d4dde0', 55, 140]} />

        {/* Lights */}
        <hemisphereLight args={['#ffffff', '#b7c1ac', 0.65]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[12, 22, 10]}
          intensity={1.25}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={100}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
          shadow-bias={-0.0003}
        />

        {TERRACES.map(t => (
          <Terrace3D key={t.id} t={t} />
        ))}

        {BUILDINGS_3D.map(b => (
          <Building3D 
            key={b.id} 
            b={b}
            selected={selected === b.id}
            anySelected={!!selected}
            onSelect={setSelected}
          />
        ))}

        <CameraRig3D selected={selected} bSelected={bSelected} />
      </Canvas>
    </div>
  );
}
