'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  BUILDINGS, 
  TERRACES, 
  PAL, 
  PATHS, 
  PARKING, 
  FRIENDS, 
  EVENTS, 
  DIS_FLOORS,
  G_FLOORS 
} from '@/lib/map-data';
import { useGeolocation } from '@/hooks/useGeolocation';
import { pathfinder, get3DPos } from '@/lib/pathfinder';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

// ── Grid Constants ───────────────────────────────────────────────────────────
const UNIT = 2.2;
const HEIGHT_SCALE = 0.16;
const GRID_CX = 6;
const GRID_CY = 8;

// ── Local Floor Plan Helpers ──────────────────────────────────────────────────
function genFloor(seed: string, n: number) {
  const cols = [ [24,118],[150,90],[248,64] ];
  const rooms: any[] = [];
  cols.forEach((c, i) => rooms.push({ x:c[0], y:24, w:c[1], h:96, label:`${n}0${i+1}`, type:'room' }));
  rooms.push({ x:24, y:126, w:288, h:64, label:'', type:'hall' });
  rooms.push({ x:24, y:196, w:170, h:124, label:`${n}10`, type:'room' });
  rooms.push({ x:200,y:196, w:112, h:124, label:`${n}11`, type:'room' });
  rooms.push({ x:150,y:132, w:38, h:52, label:'WC', type:'wc' });
  rooms.push({ x:196,y:132, w:34, h:52, label:'', type:'stair' });
  rooms.push({ x:236,y:132, w:34, h:52, label:'', type:'lift' });
  return { label:`P${n}`, rooms };
}

function planFor(building: any, floor: number, destRoom: string | null) {
  let basePlan;
  if (building.id === 'H' && DIS_FLOORS[floor]) { // Edificio H es Diseño
    basePlan = DIS_FLOORS[floor];
  } else if (building.id === 'G' && G_FLOORS[floor]) { // Edificio G es Gimnasio
    basePlan = G_FLOORS[floor];
  } else {
    basePlan = genFloor(building.id, floor);
  }
  
  const plan = JSON.parse(JSON.stringify(basePlan));
  plan.rooms.forEach((r: any) => { r.dest = false; });
  
  if (destRoom) {
    const cleanDest = destRoom.replace('Sala ', '').trim().toLowerCase();
    const room = plan.rooms.find((r: any) => 
      (r.label && r.label.toLowerCase() === cleanDest) ||
      (r.name && r.name.toLowerCase() === cleanDest) ||
      (r.label && cleanDest.includes(r.label.toLowerCase())) ||
      (r.name && cleanDest.includes(r.name.toLowerCase()))
    );
    if (room) {
      room.dest = true;
    }
  } else {
    basePlan.rooms.forEach((r: any, idx: number) => {
      if (r.dest) plan.rooms[idx].dest = true;
    });
  }
  return plan;
}

// ── 2D SVG Floor Plan Overlay Component ──────────────────────────────────────
interface FloorPlan2DProps {
  building: any;
  floor: number;
  destRoom: string | null;
  activeFriends: any[];
  onClose: () => void;
}

function FloorPlan2D({ building, floor, destRoom, activeFriends, onClose }: FloorPlan2DProps) {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragActive, setDragActive] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const plan = useMemo(() => planFor(building, floor, destRoom), [building, floor, destRoom]);

  const dest = plan.rooms.find((r: any) => r.dest);
  const entry = plan.rooms.find((r: any) => r.entry) || plan.rooms.find((r: any) => r.type === 'hall');
  let routeD = null;
  if (dest && entry) {
    const sx = entry.x + entry.w / 2, sy = entry.y + entry.h / 2;
    const dx = dest.x + dest.w / 2, dy = dest.y + dest.h - 6;
    routeD = `M${sx} ${sy} L${dx} ${sy} L${dx} ${dy}`;
  }

  const RTYPE: Record<string, { fill: string; stroke: string; text: string }> = {
    room:  { fill: '#F4F6FA', stroke: '#D5DCE6', text: '#2B3A52' },
    hall:  { fill: '#ECEFF4', stroke: '#E1E6ED', text: '#8A94A6' },
    wc:    { fill: '#EAF1FB', stroke: '#CFE0F6', text: '#1F6FD6' },
    stair: { fill: '#E8EDF4', stroke: '#CBD5E3', text: '#5C6B82' },
    lift:  { fill: '#E8EDF4', stroke: '#CBD5E3', text: '#5C6B82' },
  };

  const FRIEND_ROOMS: Record<string, { floor: number; roomLabel: string }> = {
    f1: { floor: 1, roomLabel: 'Hall' },
    f2: { floor: 2, roomLabel: '201' },
    f3: { floor: 3, roomLabel: '301' }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragActive(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragActive(false);
    dragStart.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl h-[75vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{building.name}</h3>
            <p className="text-xs text-slate-400">Plano de interiores · Piso {floor}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Plan Canvas */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={(e) => setZoom(z => Math.max(0.7, Math.min(3.0, z * (e.deltaY < 0 ? 1.1 : 0.9))))}
          className="flex-1 bg-slate-50 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        >
          <svg
            viewBox="0 0 336 344"
            className="w-full h-full p-6 select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: dragActive ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <rect x="12" y="12" width="312" height="320" rx="10" fill="#ffffff" stroke="#E4E8EF" strokeWidth="1.5" />
            {plan.rooms.map((r: any, i: number) => {
              const dest = r.dest;
              const t = RTYPE[r.type] || RTYPE.room;
              const cx = r.x + r.w / 2;
              const cy = r.y + r.h / 2;
              return (
                <g key={i}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="4"
                        fill={dest ? '#1F6FD6' : t.fill} stroke={dest ? '#0A2A66' : t.stroke} strokeWidth={dest ? 2 : 1.2} />
                  {r.type === 'stair' && (
                    <g stroke="#9AA6B8" strokeWidth="1.4">
                      {[0,1,2,3].map(step => (
                        <line key={step} x1={r.x+8} y1={r.y+12+step*9} x2={r.x+r.w-8} y2={r.y+12+step*9} />
                      ))}
                    </g>
                  )}
                  {r.type === 'lift' && <text x={cx} y={cy+4} textAnchor="middle" fontSize="13">🛗</text>}
                  {r.type === 'wc' && <text x={cx} y={cy+4} textAnchor="middle" fontSize="9" fontWeight="700" fill={t.text}>WC</text>}
                  {r.type === 'room' && (
                    <text x={cx} y={r.name ? cy : cy+4} textAnchor="middle" fontSize={dest ? 13 : 11}
                          fontWeight="700" fill={dest ? '#fff' : t.text}>{r.label}</text>
                  )}
                  {r.type === 'room' && r.name && (
                    <text x={cx} y={cy+13} textAnchor="middle" fontSize="8" fill={dest ? 'rgba(255,255,255,0.9)' : '#8A94A6'}>{r.name}</text>
                  )}
                  {dest && (
                    <g transform={`translate(${cx},${r.y-2})`}>
                      <path d="M0 6 L-6 -3 A8 8 0 1 1 6 -3 Z" fill="#0A2A66" />
                      <circle cx="0" cy="-5" r="5.5" fill="#fff" />
                      <circle cx="0" cy="-5" r="2.4" fill="#0A2A66" />
                    </g>
                  )}
                  {/* Render Friends inside 2D Room layout */}
                  {activeFriends.map(f => {
                    if (f.at === building.id && FRIEND_ROOMS[f.id]) {
                      const fr = FRIEND_ROOMS[f.id];
                      if (fr.floor === floor && r.label === fr.roomLabel) {
                        return (
                          <g key={f.id} transform={`translate(${cx}, ${cy - 12})`}>
                            <circle cx="0" cy="0" r="8" fill={f.color} stroke="#ffffff" strokeWidth="1" />
                            <text x="0" y="3.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ffffff">{f.initials}</text>
                          </g>
                        );
                      }
                    }
                    return null;
                  })}
                </g>
              );
            })}
            {routeD && (
              <g>
                <path d={routeD} fill="none" stroke="#0A2A66" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                <path d={routeD} fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="1 6" strokeLinecap="round" />
              </g>
            )}
          </svg>

          {/* Zoom hint */}
          <div className="absolute bottom-3 left-3 bg-slate-800/80 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none">
            Arrastra para desplazar · Rueda para zoom
          </div>
        </div>
      </div>
    </div>
  );
}

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

// ── Pedestrian Paths Component ──────────────────────────────────────────────
function Paths3D() {
  return PATHS.map((p, i) => (
    <group key={i}>
      {p.line.slice(1).map(([gx, gy], j) => {
        const [pgx, pgy] = p.line[j];
        const [x1, z1] = get3DPos(gx, gy);
        const [x2, z2] = get3DPos(pgx, pgy);
        
        const dx = x1 - x2;
        const dz = z1 - z2;
        const len = Math.hypot(dx, dz);
        const ang = Math.atan2(dx, dz);
        
        return (
          <mesh key={j} position={[(x1+x2)/2, 0.02, (z1+z2)/2]} rotation={[0, ang, 0]} receiveShadow>
            <boxGeometry args={[0.42, 0.015, len]} />
            <meshStandardMaterial color={PAL.path} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  ));
}

// ── Active Route Render Component ──────────────────────────────────────────
function Route3D({ route }: { route: [number, number][] }) {
  if (route.length < 2) return null;
  return (
    <group>
      {route.slice(1).map(([x, z], i) => {
        const [px, pz] = route[i];
        const dx = x - px;
        const dz = z - pz;
        const len = Math.hypot(dx, dz);
        const ang = Math.atan2(dx, dz);
        
        return (
          <mesh key={i} position={[(x+px)/2, 0.06, (z+pz)/2]} rotation={[0, ang, 0]}>
            <boxGeometry args={[0.26, 0.03, len]} />
            <meshStandardMaterial color="#1F6FD6" emissive="#1F6FD6" emissiveIntensity={0.8} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Dynamic 3D Floor Plan Component ──────────────────────────────────────────
interface ThreeFloorPlanProps {
  building: any;
  floor: number;
  destRoom: string | null;
  activeFriends: any[];
  opacity: number;
}

function ThreeFloorPlan({ building, floor, destRoom, activeFriends, opacity }: ThreeFloorPlanProps) {
  const plan = useMemo(() => planFor(building, floor, destRoom), [building, floor, destRoom]);
  if (!plan) return null;

  const buildingW = building.w * UNIT;
  const buildingD = building.d * UNIT;
  const scaleX = buildingW / 336;
  const scaleZ = buildingD / 344;

  const RTYPE_COLORS: Record<string, string> = {
    room:  '#ffffff',
    hall:  '#f8fafc',
    wc:    '#e0f2fe',
    stair: '#f1f5f9',
    lift:  '#f1f5f9',
  };

  const FRIEND_ROOMS: Record<string, { floor: number; roomLabel: string }> = {
    f1: { floor: 1, roomLabel: 'Hall' },
    f2: { floor: 2, roomLabel: '201' },
    f3: { floor: 3, roomLabel: '301' }
  };

  return (
    <group position={[0, 0.12, 0]}>
      {/* Floor Slab Base */}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[buildingW - 0.08, 0.01, buildingD - 0.08]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={opacity} roughness={1} />
      </mesh>

      {plan.rooms.map((r: any, idx: number) => {
        const rx = (r.x + r.w / 2 - 336 / 2) * scaleX;
        const rz = (r.y + r.h / 2 - 344 / 2) * scaleZ;
        const rw = r.w * scaleX;
        const rh = r.h * scaleZ;
        const isDest = r.dest;
        const color = isDest ? '#1F6FD6' : (RTYPE_COLORS[r.type] || '#ffffff');

        return (
          <group key={idx} position={[rx, 0, rz]}>
            {/* Room Slab */}
            <mesh position={[0, 0.018, 0]}>
              <boxGeometry args={[rw - 0.03, 0.015, rh - 0.03]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={opacity} 
                roughness={0.8} 
                metalness={0.0}
                emissive={isDest ? '#60a5fa' : '#000000'}
                emissiveIntensity={isDest ? 0.35 : 0}
              />
            </mesh>

            {/* Room Walls (Wireframe) */}
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[rw - 0.01, 0.04, rh - 0.01]} />
              <meshStandardMaterial 
                color={isDest ? '#1F6FD6' : '#cbd5e1'} 
                transparent 
                opacity={opacity * 0.9} 
                roughness={1} 
                wireframe 
              />
            </mesh>

            {/* Room label */}
            {r.label && (
              <Html position={[0, 0.055, 0]} center className="pointer-events-none select-none" style={{ opacity }}>
                <div className={`text-[8px] font-extrabold tracking-tight px-1 rounded ${isDest ? 'text-white bg-[#1F6FD6] border border-[#0A2A66]/30' : 'text-slate-500 bg-white/80 border border-slate-200/50'}`}>
                  {r.label}
                </div>
              </Html>
            )}

            {/* Dest Pin */}
            {isDest && (
              <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.09, 16, 16]} />
                <meshStandardMaterial color="#0A2A66" transparent opacity={opacity} emissive="#1F6FD6" emissiveIntensity={opacity * 0.8} />
              </mesh>
            )}

            {/* Friends Pins */}
            {activeFriends.map(f => {
              if (f.at === building.id && FRIEND_ROOMS[f.id]) {
                const fr = FRIEND_ROOMS[f.id];
                if (fr.floor === floor && r.label === fr.roomLabel) {
                  return (
                    <Html key={f.id} position={[0, 0.25, 0]} center style={{ opacity }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white border border-white shadow-md animate-pulse"
                           style={{ background: f.color }}>
                        {f.initials}
                      </div>
                    </Html>
                  );
                }
              }
              return null;
            })}
          </group>
        );
      })}
    </group>
  );
}

// ── Building Component ──────────────────────────────────────────────────────
function Building3D({ b, selected, anySelected, onSelect, selectedFloor, showInterior, destRoom, activeFriends }: any) {
  const shell = useRef<THREE.Mesh>(null);
  const roof = useRef<THREE.Mesh>(null);
  
  const prog = useRef(0);
  const dim = useRef(1);
  const [hover, setHover] = useState(false);

  const smooth = (a: number, dt: number) => 1 - Math.pow(a, dt);

  useFrame((_, dt) => {
    const tp = showInterior ? 1 : 0;
    prog.current += (tp - prog.current) * smooth(0.001, dt);
    const p = prog.current;

    // Slide roof up and fade it out
    if (roof.current && !Array.isArray(roof.current.material)) {
      roof.current.position.y = b.height / 2 + 0.08 + p * 2.8;
      const o = Math.max(0, 1 - p * 1.5);
      roof.current.material.opacity = o;
      roof.current.visible = o > 0.01;
    }

    // Dim other buildings when one is selected, and fade body of current building completely if interior is shown
    const targetDim = selected 
      ? (showInterior ? 0.0 : 1.0) 
      : (anySelected ? 0.38 : 1.0);
    dim.current += (targetDim - dim.current) * smooth(0.001, dt);
    
    if (shell.current && !Array.isArray(shell.current.material)) {
      shell.current.material.opacity = dim.current;
      shell.current.material.depthWrite = dim.current > 0.8;
      (shell.current.material as THREE.MeshStandardMaterial).emissiveIntensity = hover && !anySelected ? 0.2 : 0;
      shell.current.visible = dim.current > 0.01;
    }
  });

  return (
    <group position={[b.x, b.baseY, b.z]}>
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

      {/* Dynamic 3D Floor Plan */}
      {selected && showInterior && (
        <ThreeFloorPlan building={b} floor={selectedFloor} destRoom={destRoom} activeFriends={activeFriends} opacity={1} />
      )}

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
function CameraRig3D({ selected, bSelected, showInterior, lastDragTimeRef }: any) {
  const orbitRef = useRef<any>(null);
  const { camera } = useThree();
  const savedPose = useRef({
    position: new THREE.Vector3(18, 25, 35),
    target: new THREE.Vector3(0, 1.5, 3.5)
  });
  const isTransitioning = useRef(false);
  const hasCenteredInterior = useRef(false);

  useEffect(() => {
    if (!selected || !showInterior) {
      hasCenteredInterior.current = false;
    }
  }, [selected, showInterior]);

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
      if (showInterior) {
        isTransitioning.current = true;
        orbit.enabled = true;
        orbit.enableRotate = false;

        // Map LEFT drag to PAN in interior mode
        orbit.mouseButtons = {
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: -1
        } as any;

        const targetPos = new THREE.Vector3(bSelected.x, bSelected.baseY + 17.5, bSelected.z + 5.5);
        const targetLook = new THREE.Vector3(bSelected.x, bSelected.baseY, bSelected.z);

        if (!hasCenteredInterior.current) {
          camera.position.lerp(targetPos, 0.08);
          orbit.target.lerp(targetLook, 0.08);

          if (camera.position.distanceTo(targetPos) < 0.1 && orbit.target.distanceTo(targetLook) < 0.1) {
            hasCenteredInterior.current = true;
          }
        } else {
          // Centering boundaries
          const prevTarget = orbit.target.clone();
          orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, bSelected.x - 8, bSelected.x + 8);
          orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, bSelected.baseY - 2, bSelected.baseY + 2);
          orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, bSelected.z - 8, bSelected.z + 8);

          const adjustment = orbit.target.clone().sub(prevTarget);
          camera.position.add(adjustment);
        }
      } else {
        orbit.enabled = true;
        orbit.enableRotate = true;
        hasCenteredInterior.current = false;

        orbit.mouseButtons = {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        };

        // Panning limits
        orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -75, 75);
        orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, 0, 15);
        orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -75, 75);

        const targetLook = new THREE.Vector3(bSelected.x, bSelected.baseY + bSelected.height / 3, bSelected.z);
        orbit.target.lerp(targetLook, 0.05);

        if (isTransitioning.current) {
          camera.position.lerp(savedPose.current.position, 0.08);
          if (camera.position.distanceTo(savedPose.current.position) < 0.1) {
            isTransitioning.current = false;
          }
        }
      }
    } else {
      orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -75, 75);
      orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, 0, 15);
      orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -75, 75);
      orbit.enableRotate = true;
      hasCenteredInterior.current = false;

      orbit.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };

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

  const hasDragged = useRef(false);

  return (
    <OrbitControls 
      ref={orbitRef} 
      enableDamping 
      dampingFactor={0.08}
      minDistance={6} 
      maxDistance={150}
      maxPolarAngle={1.35} 
      enablePan={true}
      target={[0, 1.5, 3.5]}
      onStart={() => {
        isTransitioning.current = false;
        hasDragged.current = false;
      }}
      onChange={() => {
        hasDragged.current = true;
      }}
      onEnd={() => {
        if (lastDragTimeRef && hasDragged.current) {
          lastDragTimeRef.current = Date.now();
        }
      }}
    />
  );
}

// ── Building Info Panel ─────────────────────────────────────────────────────
interface BuildingPanelProps {
  building: any;
  onClose: () => void;
  onNavigate: () => void;
  onViewFloors: () => void;
  showInterior: boolean;
  onCloseInterior: () => void;
  onOpen2D: () => void;
}

function BuildingPanel({ building, onClose, onNavigate, onViewFloors, showInterior, onCloseInterior, onOpen2D }: BuildingPanelProps) {
  return (
    <div
      className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mx-auto max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 animate-slide-up overflow-hidden pointer-events-auto">
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-5 pt-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{building.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-semibold">Abierto</span>
                {building.floors ? ` · ${building.floors} ${building.floors > 1 ? 'pisos' : 'piso'}` : ''}
                {' · '}📍 Campus UDD
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-medium transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={onNavigate}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>🧭</span>
              Cómo llegar
            </button>
            {building.floors && (
              <>
                <button 
                  onClick={showInterior ? onCloseInterior : onViewFloors}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🏢</span>
                  {showInterior ? 'Cerrar 3D' : 'Pisos 3D'}
                </button>
                <button 
                  onClick={onOpen2D}
                  className="h-11 px-3.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                  title="Ver plano 2D"
                >
                  <span>📄</span>
                  Plano 2D
                </button>
              </>
            )}
          </div>

          {/* Building meta */}
          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
            <div className="flex gap-4">
              <span>🏢 {building.floors || 1} {building.floors && building.floors > 1 ? 'pisos' : 'piso'}</span>
              <span>🏷️ {building.cat === 'fac' ? 'Facultad' : building.cat === 'admin' ? 'Administración' : building.cat}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Map Component ──────────────────────────────────────────────────────
export default function CampusMap3D() {
  const [selected, setSelected] = useState<string | null>(null);
  const [layers, setLayers] = useState({ friends: true, events: true, parking: false });
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [showInterior, setShowInterior] = useState(false);
  const [show2D, setShow2D] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [simulatedLoc, setSimulatedLoc] = useState<{ x: number, z: number } | null>(null);
  
  // Real-time Database state
  const { user } = useAuth();
  const [realFriends, setRealFriends] = useState<any[]>([]);
  const [realEvents, setRealEvents] = useState<any[]>([]);

  // Geolocation hook
  const { state: userLoc, error: geoError } = useGeolocation();

  // Active user position (real GPS or simulated/fallback)
  const activeUserPos = useMemo(() => {
    if (userLoc && userLoc.isOnCampus) {
      return { x: userLoc.x, z: userLoc.z };
    }
    return simulatedLoc;
  }, [userLoc, simulatedLoc]);

  // Handle building selection
  const clickedBuilding = useRef(false);
  const lastDragTimeRef = useRef(0);

  const { BUILDINGS_3D, BY_ID } = useMemo(() => {
    const b3d = BUILDINGS.map(b => {
      const height = b.h * 0.42;
      const [x, z] = get3DPos(b.gx, b.gy);
      const visualX = x + (b.w * UNIT) / 2;
      const visualZ = z + (b.d * UNIT) / 2;

      return {
        ...b,
        x: visualX,
        z: visualZ,
        baseY: 0,
        height,
        size: [b.w * UNIT - 0.12, height, b.d * UNIT - 0.12] as [number, number, number],
        color: PAL.mats[b.mat]?.[0] || '#ccc',
        roof: PAL.mats[b.mat]?.[1] || '#ccc'
      };
    });

    return {
      BUILDINGS_3D: b3d,
      BY_ID: Object.fromEntries(b3d.map(b => [b.id, b]))
    };
  }, []);

  const PARKING_3D = useMemo(() => {
    return PARKING.map(p => {
      const [x, z] = get3DPos(p.gx, p.gy);
      const visualX = x + (p.w * UNIT) / 2;
      const visualZ = z + (p.d * UNIT) / 2;
      return {
        ...p,
        x: visualX,
        z: visualZ,
        baseY: 0,
        size: [p.w * UNIT - 0.05, 0.03, p.d * UNIT - 0.05] as [number, number, number]
      };
    });
  }, []);

  const bSelected = selected ? BY_ID[selected] : null;

  // 1. Sync User Presence to Supabase
  useEffect(() => {
    if (!user || !activeUserPos) return;
    
    const updatePresence = async () => {
      const supabase = createClient();
      if (!supabase) return;
      
      let nearestBuildingId: string | null = null;
      let isOnCampus = !!userLoc?.isOnCampus || !!simulatedLoc;

      if (isOnCampus) {
        let minDist = Infinity;
        BUILDINGS_3D.forEach(b => {
          const dist = Math.hypot(b.x - activeUserPos.x, b.z - activeUserPos.z);
          if (dist < minDist && dist < 18) { // Proximity within 18 meters
            minDist = dist;
            nearestBuildingId = b.id;
          }
        });
      }
      
      try {
        await supabase.from('campus_presence').upsert({
          user_id: user.id,
          is_on_campus: isOnCampus,
          approximate_building_id: nearestBuildingId,
          last_updated: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error updating presence:', err);
      }
    };
    
    updatePresence();
  }, [user, activeUserPos, userLoc, simulatedLoc, BUILDINGS_3D]);

  // 2. Fetch Friends' Presence from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchFriendsPresence = async () => {
      const supabase = createClient();
      if (!supabase) return;
      
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted');
        
      if (!friendships) return;
      
      const friendIds = friendships.map((f: any) => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      
      if (friendIds.length === 0) return;
      
      const { data: presences } = await supabase
        .from('campus_presence')
        .select(`
          user_id,
          is_on_campus,
          approximate_building_id,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .in('user_id', friendIds)
        .eq('is_on_campus', true);
        
      if (presences) {
        const mapped = presences.map((p: any) => {
          const names = p.profiles.full_name.split(' ');
          const initials = names.map((n: string) => n[0]).join('').slice(0, 2);
          return {
            id: p.user_id,
            name: p.profiles.full_name,
            at: p.approximate_building_id || 'A',
            color: '#7A4FD6',
            initials: initials.toUpperCase()
          };
        });
        setRealFriends(mapped);
      }
    };
    
    fetchFriendsPresence();
    
    // Realtime subscription
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel('presence_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_presence' }, () => {
        fetchFriendsPresence();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 3. Fetch active events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      if (!supabase) return;
      
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: dbEvents } = await supabase
        .from('events')
        .select('id, title, category, building_id, organizer_name')
        .eq('event_date', todayStr);
        
      if (dbEvents && dbEvents.length > 0) {
        const categoryEmojis: Record<string, string> = {
          academic:     '🎓',
          sports:       '⚽',
          cultural:     '🎭',
          party:        '🎉',
          volunteering: '🤝',
          networking:   '🔗',
          other:        '📌',
        };
        const mapped = dbEvents.map((e: any) => ({
          id: e.id,
          kind: e.title,
          at: e.building_id || 'A',
          emoji: categoryEmojis[e.category] || '📌',
          when: 'Hoy',
          host: e.organizer_name
        }));
        setRealEvents(mapped);
      }
    };
    
    fetchEvents();
  }, []);

  const activeFriends = useMemo(() => {
    if (realFriends.length > 0) return realFriends;
    return FRIENDS;
  }, [realFriends]);

  const activeEvents = useMemo(() => {
    if (realEvents.length > 0) return realEvents;
    return EVENTS;
  }, [realEvents]);

  const handleBuildingSelect = (id: string) => {
    const timeSinceLastDrag = Date.now() - lastDragTimeRef.current;
    if (timeSinceLastDrag < 300) return;
    
    clickedBuilding.current = true;
    setSelected(id);
    setSelectedFloor(1);
    setShowInterior(false);
    setShow2D(false);
  };

  const handleCanvasClick = () => {
    if (clickedBuilding.current) {
      clickedBuilding.current = false;
      return;
    }
    setSelected(null);
    setShowInterior(false);
    setShow2D(false);
  };

  // Start Navigation routing
  const handleNavigate = () => {
    if (!selected) return;

    // 1. Determinar punto de inicio: GPS o Acceso (como fallback)
    let startX = 0;
    let startZ = 10;

    if (activeUserPos) {
      startX = activeUserPos.x;
      startZ = activeUserPos.z;
    }

    // 2. Calcular ruta dinámica usando el pathfinder
    const calculatedRoute = pathfinder.findPathFromCoords(startX, startZ, selected);

    if (calculatedRoute) {
      setRoute(calculatedRoute);
      
      // Calcular distancia total y ETA (1.2 metros/segundo de caminata promedio)
      let totalDist = 0;
      for (let i = 0; i < calculatedRoute.length - 1; i++) {
        const [x1, z1] = calculatedRoute[i];
        const [x2, z2] = calculatedRoute[i + 1];
        totalDist += Math.hypot(x2 - x1, z2 - z1);
      }
      
      const mins = Math.max(1, Math.round(totalDist / (1.2 * 60)));
      setEta(mins);
    }
  };

  // Toggle GPS simulation (Acceso)
  const handleToggleSimulation = () => {
    if (simulatedLoc) {
      setSimulatedLoc(null);
      setRoute(null);
      setEta(null);
    } else {
      // Posición simulada en el Acceso Principal (gx: 6, gy: 12)
      const [sx, sz] = get3DPos(6, 12);
      setSimulatedLoc({ x: sx, z: sz });
    }
  };

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onClick={handleCanvasClick}
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

        {/* Stepped base */}
        {TERRACES.map((t: any) => (
          <Terrace3D key={t.id} t={t} />
        ))}

        {/* Pedestrian paths */}
        <Paths3D />

        {/* Active route path */}
        {route && <Route3D route={route} />}

        {/* Buildings */}
        {BUILDINGS_3D.map(b => (
          <Building3D
            key={b.id}
            b={b}
            selected={selected === b.id}
            anySelected={!!selected}
            onSelect={handleBuildingSelect}
            selectedFloor={selectedFloor}
            showInterior={showInterior}
            destRoom={selected === 'H' ? '301' : (selected === 'G' ? 'Pesas' : null)}
            activeFriends={activeFriends}
          />
        ))}

        {/* Friends Layer Pins */}
        {layers.friends && !selected && activeFriends.map(f => {
          const b = BY_ID[f.at];
          if (!b) return null;
          return (
            <Html key={f.id} position={[b.x - 0.7, b.baseY + b.height + 0.9, b.z - 0.5]} center>
              <div 
                onClick={(e) => { e.stopPropagation(); handleBuildingSelect(b.id); }}
                className="w-6 h-6 rounded-full cursor-pointer flex items-center justify-center text-[10px] font-black text-white select-none border-2 border-white shadow-lg animate-bounce"
                style={{ background: f.color, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                {f.initials}
              </div>
            </Html>
          );
        })}

        {/* Events Layer Pins */}
        {layers.events && !selected && activeEvents.map(ev => {
          const b = BY_ID[ev.at];
          if (!b) return null;
          return (
            <Html key={ev.id} position={[b.x + 0.7, b.baseY + b.height + 0.9, b.z + 0.5]} center>
              <div 
                onClick={(e) => { e.stopPropagation(); handleBuildingSelect(b.id); }}
                className="w-6 h-6 rounded-xl cursor-pointer flex items-center justify-center text-sm bg-white select-none border border-rose-300 shadow-lg animate-bounce"
                style={{ animationDelay: '0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                {ev.emoji}
              </div>
            </Html>
          );
        })}

        {/* Parking aprons & pins */}
        {layers.parking && (
          <>
            {PARKING_3D.map(p => (
              <mesh key={p.id} position={[p.x, p.baseY + 0.015, p.z]} receiveShadow>
                <boxGeometry args={p.size} />
                <meshStandardMaterial color="#9AA3AE" roughness={0.9} />
              </mesh>
            ))}
            {!selected && PARKING_3D.map(p => {
              const col = p.free > 10 ? '#1f9d72' : p.free > 4 ? '#d97706' : '#dc2626';
              return (
                <Html key={p.id} position={[p.x, p.baseY + 1.2, p.z]} center>
                  <div 
                    onClick={(e) => { e.stopPropagation(); handleBuildingSelect(p.id); }}
                    className="cursor-pointer select-none bg-white rounded-xl shadow-lg border border-slate-200 flex items-center p-1 px-1.5 gap-1.5 whitespace-nowrap active:scale-95 transition-transform"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    <span className="w-4.5 h-4.5 rounded-lg text-white font-extrabold text-[11px] flex items-center justify-center" style={{ background: col, width: '18px', height: '18px' }}>P</span>
                    <div className="flex flex-col leading-none pr-0.5">
                      <span className="text-[11px] font-extrabold text-slate-800">{p.free}</span>
                      <span className="text-[6.5px] text-slate-400 font-black uppercase">libres</span>
                    </div>
                  </div>
                </Html>
              );
            })}
          </>
        )}

        {/* User Location Indicator */}
        {activeUserPos && (
          <Html position={[activeUserPos.x, 0.08, activeUserPos.z]} center>
            <div className="relative flex items-center justify-center pointer-events-none">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-md"></span>
            </div>
          </Html>
        )}

        <CameraRig3D selected={selected} bSelected={bSelected} showInterior={showInterior} lastDragTimeRef={lastDragTimeRef} />
      </Canvas>

      {/* Floating Layer Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setLayers(prev => ({ ...prev, friends: !prev.friends }))}
          className={`w-11 h-11 rounded-xl shadow-md border border-slate-200/50 flex items-center justify-center text-lg transition-all ${layers.friends ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          title="Ver amigos"
        >
          👥
        </button>
        <button
          onClick={() => setLayers(prev => ({ ...prev, events: !prev.events }))}
          className={`w-11 h-11 rounded-xl shadow-md border border-slate-200/50 flex items-center justify-center text-lg transition-all ${layers.events ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          title="Ver eventos"
        >
          📣
        </button>
        <button
          onClick={() => setLayers(prev => ({ ...prev, parking: !prev.parking }))}
          className={`w-11 h-11 rounded-xl shadow-md border border-slate-200/50 flex items-center justify-center text-lg transition-all ${layers.parking ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          title="Ver estacionamientos"
        >
          🅿️
        </button>
      </div>

      {/* Floating Simulation / GPS status Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto max-w-xs" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleToggleSimulation}
          className={`h-11 px-4 rounded-xl shadow-md border border-slate-200/50 flex items-center gap-2 text-xs font-semibold transition-all ${simulatedLoc ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          <span>🌐</span>
          {simulatedLoc ? 'Detener Simulación GPS' : 'Simular GPS (Acceso)'}
        </button>

        {/* GPS alerts */}
        {userLoc && !userLoc.isOnCampus && !simulatedLoc && (
          <div className="bg-slate-800/90 text-white p-2.5 rounded-xl shadow-md border border-slate-700/50 text-[11px] font-medium backdrop-blur-sm">
            📍 Estás fuera del campus. Elige "Simular GPS" para probar las rutas peatonales.
          </div>
        )}
        {geoError && !simulatedLoc && (
          <div className="bg-red-600/90 text-white p-2.5 rounded-xl shadow-md border border-red-700/50 text-[11px] font-medium backdrop-blur-sm">
            ⚠️ {geoError} Simula tu ubicación para continuar.
          </div>
        )}
      </div>

      {/* Navigation ETA Indicator (Bottom Center / Left) */}
      {route && eta !== null && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-auto bg-white/95 rounded-2xl shadow-xl border border-slate-100 p-4 max-w-xs animate-slide-up flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ruta en curso</span>
          </div>
          <p className="text-2xl font-black text-slate-800">
            {eta} <span className="text-lg font-medium text-slate-500">min</span>
          </p>
          <p className="text-xs text-slate-500">Velocidad de caminata estimada para el Campus UDD.</p>
          <button
            onClick={() => { setRoute(null); setEta(null); }}
            className="mt-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Detener guía
          </button>
        </div>
      )}

      {/* Elevator Floor Plan Switcher (Shown when inside interior view) */}
      {selected && showInterior && bSelected && bSelected.floors && (
        <div className="absolute right-4 bottom-4 z-10 pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col gap-1.5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
          {Array.from({ length: bSelected.floors || 0 }).map((_, idx) => {
            const fl = (bSelected.floors || 0) - idx;
            const active = fl === selectedFloor;
            return (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                P{fl}
              </button>
            );
          })}
        </div>
      )}

      {/* 2D Floor Plan Modal overlay */}
      {show2D && bSelected && (
        <FloorPlan2D 
          building={bSelected} 
          floor={selectedFloor} 
          destRoom={selected === 'H' ? '301' : (selected === 'G' ? 'Pesas' : null)} 
          activeFriends={activeFriends}
          onClose={() => setShow2D(false)} 
        />
      )}

      {/* Detail info panel */}
      {bSelected && !show2D && (
        <BuildingPanel 
          building={bSelected} 
          onClose={() => setSelected(null)} 
          onNavigate={handleNavigate}
          onViewFloors={() => { setShowInterior(true); setSelectedFloor(1); }}
          showInterior={showInterior}
          onCloseInterior={() => setShowInterior(false)}
          onOpen2D={() => { setShow2D(true); setSelectedFloor(1); }}
        />
      )}
    </div>
  );
}
