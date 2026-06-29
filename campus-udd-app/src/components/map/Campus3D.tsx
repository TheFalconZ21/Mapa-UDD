'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
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

// ── Interior 2D Floor Plan Component ─────────────────────────────────────────
function Interior3D({ b }: { b: any }) {
  const g = useRef<THREE.Group>(null);
  const p = useRef(0);
  const smooth = (a: number, dt: number) => 1 - Math.pow(a, dt);

  useFrame((_, dt) => {
    p.current += (1 - p.current) * smooth(0.001, dt);
    if (!g.current) return;
    g.current.traverse((o: any) => {
      if (o.material && o.userData.fade) {
        o.material.transparent = true;
        o.material.opacity = (o.userData.base ?? 1) * p.current;
      }
    });
  });

  const w = b.size[0];
  const d = b.size[2];
  
  const wall = (key: string, pos: [number, number, number], size: [number, number, number], color = '#cbd5e1') => (
    <mesh key={key} position={pos} userData={{ fade: true, base: 1 }}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} transparent opacity={0} />
    </mesh>
  );

  const quad = [
    [-w / 4, -d / 4],
    [w / 4, -d / 4],
    [-w / 4, d / 4],
    [w / 4, d / 4]
  ] as [number, number][];

  // Map floor room labels
  const labels = b.id === 'dis' ? ['301', '302', 'Taller', 'Lab'] : ['Sala A', 'Sala B', 'Oficina', 'Hall'];
  const destIdx = b.dest ? 0 : -1;

  return (
    <group ref={g} position={[0, 0, 0]}>
      {/* Floor slab base */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ fade: true, base: 1 }}>
        <planeGeometry args={[w * 0.94, d * 0.94]} />
        <meshStandardMaterial color="#f8fafc" roughness={1} transparent opacity={0} />
      </mesh>

      {/* Destination room highlight */}
      {destIdx >= 0 && (
        <mesh position={[quad[destIdx][0], 0.05, quad[destIdx][1]]} rotation={[-Math.PI / 2, 0, 0]} userData={{ fade: true, base: 0.9 }}>
          <planeGeometry args={[w * 0.44, d * 0.44]} />
          <meshStandardMaterial color="#1F6FD6" emissive="#1F6FD6" emissiveIntensity={0.2} roughness={1} transparent opacity={0} />
        </mesh>
      )}

      {/* Interior walls */}
      {wall('w-mid-v', [0, 0.24, 0], [0.06, 0.4, d * 0.92])}
      {wall('w-mid-h1', [-w / 4, 0.24, 0], [w * 0.46, 0.4, 0.06])}
      {wall('w-mid-h2', [w / 4, 0.24, 0], [w * 0.46, 0.4, 0.06])}

      {/* Labels */}
      {quad.map((q, i) => {
        const isDest = i === destIdx;
        return (
          <Html key={i} position={[q[0], 0.12, q[1]]} center className="pointer-events-none select-none">
            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black border tracking-wide leading-none transition-opacity duration-300 ${
              isDest 
                ? 'bg-blue-600 border-blue-700 text-white shadow-sm' 
                : 'bg-white/80 border-slate-200 text-slate-500 shadow-sm'
            }`}>
              {labels[i]}
            </div>
          </Html>
        );
      })}
    </group>
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
    const tp = selected ? 1 : 0;
    prog.current += (tp - prog.current) * smooth(0.0016, dt);
    const p = prog.current;

    if (roof.current && !Array.isArray(roof.current.material)) {
      roof.current.position.y = b.height + 0.07 + p * 2.4;
      const opacity = Math.max(0, 1 - p * 1.5);
      roof.current.material.opacity = opacity;
      roof.current.visible = opacity > 0.02;
    }

    const targetDim = selected ? 0.16 : (anySelected ? 0.42 : 1.0);
    dim.current += (targetDim - dim.current) * smooth(0.0016, dt);

    if (shell.current && !Array.isArray(shell.current.material)) {
      shell.current.material.opacity = dim.current;
      shell.current.material.depthWrite = dim.current > 0.92;
      (shell.current.material as THREE.MeshStandardMaterial).emissiveIntensity = hover && !anySelected ? 0.18 : 0;
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
      <mesh ref={roof} position={[0, b.height + 0.07, 0]} castShadow>
        <boxGeometry args={[b.size[0] + 0.15, 0.14, b.size[2] + 0.15]} />
        <meshStandardMaterial color={b.roof} transparent opacity={1} roughness={0.8} />
      </mesh>

      {/* Interior 2D floor plan */}
      {selected && <Interior3D b={b} />}

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
  const persp = useRef<any>(null);
  const ortho = useRef<any>(null);
  const orbit = useRef<any>(null);
  const { size } = useThree();
  const [planActive, setPlanActive] = useState(false);

  const HOME_POS = useMemo(() => new THREE.Vector3(18, 25, 35), []);
  const HOME_TARGET = useMemo(() => new THREE.Vector3(0, 1.5, 3.5), []);

  const S = useRef({
    p: 0,                                  // 0 orbit → 1 plan
    start: HOME_POS.clone(),               // fly start (captured from live orbit)
    startT: HOME_TARGET.clone(),
    focus: new THREE.Vector3(0, 1.5, 3.5),
    prev: null as string | null,
    plan: false,
  });

  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpTar = useMemo(() => new THREE.Vector3(), []);
  const tmpFocus = useMemo(() => new THREE.Vector3(), []);

  const smooth = (a: number, dt: number) => 1 - Math.pow(a, dt);
  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  useFrame((_, dt) => {
    const s = S.current;
    const c = persp.current;
    const o = ortho.current;
    const ctl = orbit.current;
    if (!c || !o) return;

    // rising / falling edge on selection
    if (selected !== s.prev) {
      if (selected && bSelected) {                       // entering a building
        s.start.copy(c.position);           // start the fly from wherever orbit left us
        if (ctl) s.startT.copy(ctl.target);
        s.focus.set(bSelected.x, bSelected.baseY, bSelected.z);
      }
      s.prev = selected;
    }

    if (selected && bSelected) {
      tmpFocus.set(bSelected.x, bSelected.baseY, bSelected.z);
      s.focus.lerp(tmpFocus, smooth(0.05, dt));
    }

    // progress toward plan / orbit
    const targetP = selected ? 1 : 0;
    s.p += (targetP - s.p) * smooth(0.12, dt);
    if (Math.abs(targetP - s.p) < 0.0015) s.p = targetP;
    const e = easeInOut(s.p);

    // overhead pose for the focused building
    const topPos = tmpPos.set(s.focus.x, s.focus.y + 13, s.focus.z + 0.01);
    const topTar = s.focus;

    const orbiting = !selected && s.p < 0.004;
    if (ctl) ctl.enabled = orbiting;

    if (orbiting) {
      // let OrbitControls drive; remember pose for the next fly
      s.start.copy(c.position);
      if (ctl) s.startT.copy(ctl.target);
    } else {
      // drive the perspective camera along the fly
      c.position.copy(tmpTar.copy(s.start).lerp(topPos, e));
      if (ctl) {
        ctl.target.copy(tmpTar.copy(s.startT).lerp(topTar, e));
      }
      c.lookAt(tmpTar.copy(s.startT).lerp(topTar, e));
    }

    // keep ortho parked overhead, framed to the building
    o.position.copy(topPos);
    o.up.set(0, 0, -1);
    o.lookAt(topTar);
    const minDim = Math.min(size.width, size.height);
    const b = bSelected;
    const fs = b ? Math.max(b.size[0], b.size[2]) : 4;
    o.zoom = minDim / (fs * 1.95);
    o.updateProjectionMatrix();

    const planNow = s.p > 0.985;
    if (planNow !== s.plan) { 
      s.plan = planNow; 
      setPlanActive(planNow); 
    }
  });

  return (
    <>
      <PerspectiveCamera ref={persp} makeDefault={!planActive} fov={38} near={0.1} far={500} position={[18, 25, 35]} />
      <OrthographicCamera ref={ortho} makeDefault={planActive} near={-60} far={500} />
      <OrbitControls 
        ref={orbit} 
        enableDamping 
        dampingFactor={0.08}
        minDistance={6} 
        maxDistance={80}
        maxPolarAngle={1.35} 
        enablePan={true}
        target={[0, 1.5, 3.5]}
      />
    </>
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
