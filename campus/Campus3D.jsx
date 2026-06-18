// campus/Campus3D.jsx — Interactive 3D Campus Map Component
// Exposes window.CampusMap3D

import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

// ── Grid Constants ───────────────────────────────────────────────────────────
const UNIT = 2.2;            // size of one grid cell in 3D space
const HEIGHT_SCALE = 0.16;   // scale factor for grid height z to 3D Y
const GRID_CX = 6;           // grid center X
const GRID_CY = 8;           // grid center Y

// Convert grid coordinate (gx, gy, gz) to 3D position (x, y, z)
const get3DPos = (gx, gy, gz = 0) => {
  const x = (gx - GRID_CX) * UNIT;
  const z = (gy - GRID_CY) * UNIT;
  const y = gz * HEIGHT_SCALE;
  return [x, y, z];
};

// ── Terrain Terrace Component ───────────────────────────────────────────────
function Terrace3D({ t }) {
  // Find bounds of the corners
  const gxs = t.corners.map(c => c[0]);
  const gys = t.corners.map(c => c[1]);
  const minGx = Math.min(...gxs);
  const maxGx = Math.max(...gxs);
  const minGy = Math.min(...gys);
  const maxGy = Math.max(...gys);

  const w = (maxGx - minGx) * UNIT;
  const d = (maxGy - minGy) * UNIT;
  
  // Set thickness of terrace to make it look solid
  const h = 1.0 + t.z * HEIGHT_SCALE;
  
  // Midpoints
  const cx = ((minGx + maxGx) / 2 - GRID_CX) * UNIT;
  const cz = ((minGy + maxGy) / 2 - GRID_CY) * UNIT;
  const cy = t.z * HEIGHT_SCALE - h / 2;

  const PAL = window.PAL;

  return (
    <mesh position={[cx, cy, cz]} receiveShadow castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial attach="material-0" color={PAL.cliff}    roughness={1} />
      <meshStandardMaterial attach="material-1" color={PAL.cliff}    roughness={1} />
      <meshStandardMaterial attach="material-2" color={t.top}        roughness={0.95} />
      <meshStandardMaterial attach="material-3" color={PAL.cliff2}   roughness={1} />
      <meshStandardMaterial attach="material-4" color={PAL.cliff2}   roughness={1} />
      <meshStandardMaterial attach="material-5" color={PAL.cliff}    roughness={1} />
    </mesh>
  );
}

// ── Paths Component ─────────────────────────────────────────────────────────
function Paths3D() {
  const PATHS = window.PATHS;
  const PAL = window.PAL;
  if (!PATHS) return null;

  return PATHS.map((p, i) => (
    <group key={i}>
      {p.line.slice(1).map(([gx, gy], j) => {
        const [pgx, pgy] = p.line[j];
        const [x1, y1, z1] = get3DPos(gx, gy, p.z);
        const [x2, y2, z2] = get3DPos(pgx, pgy, p.z);
        
        const dx = x1 - x2;
        const dz = z1 - z2;
        const len = Math.hypot(dx, dz);
        const ang = Math.atan2(dx, dz);
        
        return (
          <mesh key={j} position={[(x1+x2)/2, y1 + 0.02, (z1+z2)/2]} rotation={[0, ang, 0]} receiveShadow>
            <boxGeometry args={[0.42, 0.03, len]} />
            <meshStandardMaterial color={PAL.path} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  ));
}

// ── Detailed 3D Floor Plan Component ─────────────────────────────────────────
function ThreeFloorPlan({ building, floor, destRoom }) {
  const [currentFloor, setCurrentFloor] = useState(floor);
  const [transitionState, setTransitionState] = useState({
    prevFloor: null,
    progress: 1, // 1 = done
    direction: 1 // 1 = up, -1 = down
  });

  useEffect(() => {
    if (floor !== currentFloor) {
      setTransitionState({
        prevFloor: currentFloor,
        progress: 0,
        direction: floor > currentFloor ? 1 : -1
      });
      setCurrentFloor(floor);
    }
  }, [floor, currentFloor]);

  useFrame((_, dt) => {
    if (transitionState.progress < 1) {
      setTransitionState(prev => {
        const nextProgress = Math.min(1, prev.progress + dt * 3.5); // transition takes ~280ms
        return {
          ...prev,
          progress: nextProgress
        };
      });
    }
  });

  const { progress, prevFloor, direction } = transitionState;

  // Render a floor layout at a specific vertical offset and opacity
  const renderFloorLayout = (fl, yOffset, opacity) => {
    const plan = window.planFor(building, fl, destRoom);
    if (!plan) return null;

    const buildingW = building.w * UNIT;
    const buildingD = building.d * UNIT;
    const scaleX = buildingW / 336;
    const scaleZ = buildingD / 344;

    const RTYPE_COLORS = {
      room:  '#ffffff', // clean white room
      hall:  '#f8fafc', // very light slate hall
      wc:    '#e0f2fe', // soft blue WC
      stair: '#f1f5f9', // soft gray stair
      lift:  '#f1f5f9',
    };

    const FRIEND_ROOMS = {
      f1: { floor: 1, roomLabel: 'Casino' }, // Benja at Casino
      f2: { floor: 2, roomLabel: '201' },    // Caro at Biblioteca
      f3: { floor: 3, roomLabel: 'Lab Maqueta' } // Tomás at Diseño
    };

    return (
      <group position={[0, yOffset + 0.12, 0]}>
        {/* Floor slab base (Clean Light Architectural Slab) */}
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[buildingW - 0.08, 0.01, buildingD - 0.08]} />
          <meshStandardMaterial color="#f1f5f9" transparent opacity={opacity} roughness={1} />
        </mesh>

        {plan.rooms.map((r, idx) => {
          const rx = (r.x + r.w / 2 - 336 / 2) * scaleX;
          const rz = (r.y + r.h / 2 - 344 / 2) * scaleZ;
          const rw = r.w * scaleX;
          const rh = r.h * scaleZ;
          const isDest = r.dest;
          const color = isDest ? '#1F6FD6' : (RTYPE_COLORS[r.type] || '#ffffff');

          return (
            <group key={idx} position={[rx, 0, rz]}>
              {/* Room Slab - Elevated slightly above base slab to prevent z-fighting */}
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

              {/* Room Divider Walls (Wireframe border) - Elevated above room slab */}
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

              {/* Highlight destination room with a floating cyan marker */}
              {isDest && (
                <mesh position={[0, 0.35, 0]}>
                  <sphereGeometry args={[0.09, 16, 16]} />
                  <meshStandardMaterial color="#0A2A66" transparent opacity={opacity} emissive="#1F6FD6" emissiveIntensity={opacity * 0.8} />
                </mesh>
              )}

              {/* Render Friends inside specific rooms */}
              {window.FRIENDS.map(f => {
                if (f.at === building.id && FRIEND_ROOMS[f.id]) {
                  const fr = FRIEND_ROOMS[f.id];
                  if (fr.floor === fl && (r.label === fr.roomLabel || (r.type === 'room' && r.label.includes(fr.roomLabel)))) {
                    return (
                      <Html key={f.id} position={[0, 0.25, 0]} center style={{ opacity }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white border border-white shadow-md active:scale-95 transition-transform"
                             style={{ background: f.color }}>
                          {f.initials}
                        </div>
                      </Html>
                    );
                  }
                }
                return null;
              })}

              {/* Render User inside specific rooms (place user in Hall on floor 1, or room 301 if dest) */}
              {building.id === 'dis' && fl === 3 && r.dest && (
                <Html position={[0, 0.2, 0.15]} center style={{ opacity }}>
                  <div className="relative flex items-center justify-center pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-sky-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 border border-white shadow"></span>
                  </div>
                </Html>
              )}

              {/* General User placement in the entrance hall of the selected building on Floor 1 */}
              {fl === 1 && (r.entry || r.label === 'Hall' || r.type === 'hall') && !window.FRIENDS.some(fr => fr.at === building.id && FRIEND_ROOMS[fr.id].floor === 1) && (
                <Html position={[0, 0.2, 0]} center style={{ opacity }}>
                  <div className="relative flex items-center justify-center pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-sky-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 border border-white shadow"></span>
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    );
  };

  return (
    <group>
      {/* If transitioning, render both floors with slide offset */}
      {progress < 1 && prevFloor && (
        <>
          {/* Previous floor slides out (moves DOWN if going up, i.e., direction = 1) */}
          {renderFloorLayout(prevFloor, -direction * progress * 3.5, 1 - progress)}
          {/* New floor slides in (moves from BELOW to 0) */}
          {renderFloorLayout(currentFloor, direction * (1 - progress) * 3.5, progress)}
        </>
      )}
      {/* If not transitioning, render only current floor */}
      {progress === 1 && renderFloorLayout(currentFloor, 0, 1)}
    </group>
  );
}

// ── Building Component ──────────────────────────────────────────────────────
function Building3D({ b, selected, anySelected, onSelect, selectedFloor, showInterior, destRoom }) {
  const shell = useRef();
  const roof = useRef();
  
  // Animation states using refs to prevent render lag
  const prog = useRef(0);
  const dim = useRef(1);
  const [hover, setHover] = useState(false);

  // Framerate independent smooth animation factor
  const smooth = (a, dt) => 1 - Math.pow(a, dt);

  useFrame((_, dt) => {
    const tp = showInterior ? 1 : 0;
    prog.current += (tp - prog.current) * smooth(0.001, dt);
    const p = prog.current;

    // Slide roof up and fade it out
    if (roof.current) {
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
    
    if (shell.current) {
      shell.current.material.opacity = dim.current;
      shell.current.material.depthWrite = dim.current > 0.8;
      shell.current.material.emissiveIntensity = hover && !anySelected ? 0.2 : 0;
      shell.current.visible = dim.current > 0.01;
    }
  });

  return (
    <group position={[b.x, b.baseY, b.z]}>

      {/* Building Exterior Body */}
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

      {/* Spire for Chapel */}
      {b.spire && (
        <mesh position={[0, b.height + 0.8, 0]} castShadow>
          <coneGeometry args={[0.4 * UNIT, 1.8, 4]} />
          <meshStandardMaterial color={b.roof} roughness={0.8} />
        </mesh>
      )}

      {/* Dynamic 3D Floor Plan */}
      {selected && showInterior && <ThreeFloorPlan building={b} floor={selectedFloor} destRoom={destRoom} />}

      {/* Floating building title */}
      <Html position={[0, b.height + 0.6, 0]} center className="pointer-events-none select-none">
        <div className="px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100 whitespace-nowrap transition-opacity duration-300"
             style={{ opacity: selected ? 0 : (anySelected ? 0.2 : 1) }}>
          {b.short}
        </div>
      </Html>
    </group>
  );
}

// ── Route Connector line in 3D ──────────────────────────────────────────────
function Route3D({ route, BY_ID }) {
  if (!route || route.length < 2) return null;

  return route.slice(1).map((id, i) => {
    const prevId = route[i];
    const b1 = BY_ID[prevId];
    const b2 = BY_ID[id];
    if (!b1 || !b2) return null;

    const p1 = [b1.x, b1.baseY + 0.05, b1.z];
    const p2 = [b2.x, b2.baseY + 0.05, b2.z];
    
    const dx = p2[0] - p1[0];
    const dz = p2[2] - p1[2];
    const len = Math.hypot(dx, dz);
    const ang = Math.atan2(dx, dz);

    return (
      <mesh key={i} position={[(p1[0]+p2[0])/2, (p1[1]+p2[1])/2 + 0.03, (p1[2]+p2[2])/2]} rotation={[0, ang, 0]}>
        <boxGeometry args={[0.3, 0.05, len]} />
        <meshStandardMaterial color="#1F6FD6" emissive="#1F6FD6" emissiveIntensity={0.6} roughness={1} />
      </mesh>
    );
  });
}

// ── Camera Rig Component (Single Camera Lerp Animation & Elevator Shake) ──────
function CameraRig3D({ selected, bSelected, selectedFloor, showInterior, lastDragTimeRef }) {
  const orbitRef = useRef();
  const { camera } = useThree();

  const savedPose = useRef({
    position: new THREE.Vector3(18, 14, 29),
    target: new THREE.Vector3(0, 1.5, 3.5)
  });

  const isTransitioning = useRef(false);
  const hasCenteredInterior = useRef(false);

  // Reset centering flag when exiting interior view
  useEffect(() => {
    if (!selected || !showInterior) {
      hasCenteredInterior.current = false;
    }
  }, [selected, showInterior]);

  // Trigger camera elevator shake when selectedFloor changes
  useEffect(() => {
    if (selected && selectedFloor !== prevFloor.current) {
      shakeTime.current = 0.35;       // shake for 350ms
      shakeIntensity.current = 0.09;  // amplitude
      prevFloor.current = selectedFloor;
    }
  }, [selected, selectedFloor]);

  // Camera shake effect states
  const shakeTime = useRef(0);
  const shakeIntensity = useRef(0);
  const prevFloor = useRef(selectedFloor);

  useEffect(() => {
    if (selected && bSelected) {
      // Save camera position before focusing building
      if (orbitRef.current) {
        savedPose.current.position.copy(camera.position);
        savedPose.current.target.copy(orbitRef.current.target);
      }
    }
  }, [selected, bSelected]);

  // Trigger camera elevator shake when selectedFloor changes
  useEffect(() => {
    if (selected && selectedFloor !== prevFloor.current) {
      shakeTime.current = 0.35;       // shake for 350ms
      shakeIntensity.current = 0.09;  // amplitude
      prevFloor.current = selectedFloor;
    }
  }, [selected, selectedFloor]);

  useFrame((_, dt) => {
    const orbit = orbitRef.current;
    if (!orbit) return;

    if (selected && bSelected) {
      if (showInterior) {
        // Animate Camera overhead looking down at building with a slight 18-degree slant 
        // to prevent zenith singularity (180 deg yaw flips) and framing it completely by raising height to 17.5
        isTransitioning.current = true;
        
        // Enable OrbitControls for panning and zooming, but disable rotation to stay aligned
        orbit.enabled = true;
        orbit.enableRotate = false;

        // Map LEFT click drag and single-finger touch drag directly to PAN
        orbit.mouseButtons = {
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.NONE
        };
        orbit.touches = {
          ONE: THREE.TOUCH.PAN,
          TWO: THREE.TOUCH.DOLLY_PAN
        };

        const targetPos = new THREE.Vector3(bSelected.x, bSelected.baseY + 17.5, bSelected.z + 5.5);
        const targetLook = new THREE.Vector3(bSelected.x, bSelected.baseY, bSelected.z);

        if (!hasCenteredInterior.current) {
          camera.position.lerp(targetPos, 0.08);
          orbit.target.lerp(targetLook, 0.08);

          if (camera.position.distanceTo(targetPos) < 0.1 && orbit.target.distanceTo(targetLook) < 0.1) {
            hasCenteredInterior.current = true;
          }
        } else {
          // Keep panning within reasonable boundaries of the selected building
          const prevTarget = orbit.target.clone();
          orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, bSelected.x - 8, bSelected.x + 8);
          orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, bSelected.baseY - 2, bSelected.baseY + 2);
          orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, bSelected.z - 8, bSelected.z + 8);

          // Adjust camera position by the same offset to prevent unwanted rotation/tilt at boundaries
          const adjustment = orbit.target.clone().sub(prevTarget);
          camera.position.add(adjustment);
        }
      } else {
        // Exterior view: Just center the camera target on the building,
        // but DO NOT zoom in the camera position, and keep OrbitControls fully active!
        orbit.enabled = true;
        orbit.enableRotate = true;
        hasCenteredInterior.current = false;

        // Restore default LEFT click rotates, RIGHT click/drag pans
        orbit.mouseButtons = {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        };
        orbit.touches = {
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        };

        // Panning limits
        orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -16, 16);
        orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, 0, 5);
        orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -16, 18);

        const targetLook = new THREE.Vector3(bSelected.x, bSelected.baseY + bSelected.height / 3, bSelected.z);
        orbit.target.lerp(targetLook, 0.05);

        // If we transitioned back from interior view, lerp camera position to its saved pose
        if (isTransitioning.current) {
          camera.position.lerp(savedPose.current.position, 0.08);
          if (camera.position.distanceTo(savedPose.current.position) < 0.1) {
            isTransitioning.current = false;
          }
        }
      }
    } else {
      // Limitar el desplazamiento del centro de la cámara (panning limits)
      orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -16, 16);
      orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, 0, 5);
      orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -16, 18);
      orbit.enableRotate = true;
      hasCenteredInterior.current = false;

      // Restore default configurations
      orbit.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      orbit.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      };

      // Lerp back to saved position
      if (isTransitioning.current) {
        camera.position.lerp(savedPose.current.position, 0.08);
        orbit.target.lerp(savedPose.current.target, 0.08);

        if (camera.position.distanceTo(savedPose.current.position) < 0.1) {
          isTransitioning.current = false;
          orbit.enabled = true;
        }
      }
    }
    
    // Apply camera shake if active
    if (shakeTime.current > 0) {
      shakeTime.current -= dt;
      const currentIntensity = shakeIntensity.current * (shakeTime.current / 0.35);
      const shakeOffset = new THREE.Vector3(
        (Math.random() - 0.5) * currentIntensity,
        (Math.random() - 0.5) * currentIntensity,
        (Math.random() - 0.5) * currentIntensity
      );
      camera.position.add(shakeOffset);
    }
    
    orbit.update();
  });

  const hasMoved = useRef(false);

  return (
    <OrbitControls 
      ref={orbitRef} 
      enableDamping 
      dampingFactor={0.08}
      minDistance={6} 
      maxDistance={65}
      maxPolarAngle={1.35} 
      enablePan={true}
      target={[0, 1.5, 3.5]}
      onStart={() => {
        hasMoved.current = false;
        if (showInterior) {
          hasCenteredInterior.current = true;
        }
        isTransitioning.current = false;
      }}
      onChange={() => {
        hasMoved.current = true;
      }}
      onEnd={() => {
        if (hasMoved.current && lastDragTimeRef) {
          lastDragTimeRef.current = Date.now();
        }
      }}
    />
  );
}

// ── Main 3D Canvas Map Component ────────────────────────────────────────────
function CampusMap3D({ selected, onSelect, layers, route, selectedFloor, showInterior, destRoom }) {
  // Pre-calculate positions and size bounds of UDD buildings dynamically
  const { BUILDINGS_3D, BY_ID } = useMemo(() => {
    const b3d = window.BUILDINGS.map(b => {
      const height = b.h * 0.42;
      const [x, y, z] = get3DPos(b.gx, b.gy, b.z);
      
      // Calculate building visual center (midpoint of size box)
      const visualX = x + (b.w * UNIT) / 2;
      const visualZ = z + (b.d * UNIT) / 2;

      return {
        ...b,
        x: visualX,
        z: visualZ,
        baseY: y,
        height,
        size: [b.w * UNIT - 0.12, height, b.d * UNIT - 0.12],
        color: window.PAL.mats[b.mat][0],
        roof: window.PAL.mats[b.mat][1] || window.PAL.mats[b.mat][0]
      };
    });
    
    return {
      BUILDINGS_3D: b3d,
      BY_ID: Object.fromEntries(b3d.map(b => [b.id, b]))
    };
  }, []);

  // Pre-calculate positions of parking lots
  const PARKING_3D = useMemo(() => {
    return window.PARKING.map(p => {
      const [x, y, z] = get3DPos(p.gx, p.gy, p.z);
      const visualX = x + (p.w * UNIT) / 2;
      const visualZ = z + (p.d * UNIT) / 2;
      return {
        ...p,
        x: visualX,
        z: visualZ,
        baseY: y,
        size: [p.w * UNIT - 0.05, 0.03, p.d * UNIT - 0.05]
      };
    });
  }, []);

  const bSelected = selected ? BY_ID[selected] : null;

  const lastDragTimeRef = useRef(0);

  const handleSelect = (id) => {
    const timeSinceLastDrag = Date.now() - lastDragTimeRef.current;
    if (timeSinceLastDrag < 550) {
      return;
    }
    onSelect(id);
  };

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative' }} 
      onClick={() => handleSelect(null)}
    >
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [18, 14, 29], fov: 38, near: 0.1, far: 500 }}>
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
          shadow-camera-far={70}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          shadow-bias={-0.0003}
        />

        {/* Dynamic Stepped Terraces */}
        {window.TERRACES.map(t => (
          <Terrace3D key={t.id} t={t} />
        ))}

        {/* Path lines */}
        <Paths3D />


        {/* Buildings (renders all 8 buildings) */}
        {BUILDINGS_3D.map(b => (
          <Building3D 
            key={b.id} 
            b={b}
            selected={selected === b.id}
            anySelected={!!selected}
            onSelect={handleSelect}
            selectedFloor={selectedFloor}
            showInterior={showInterior}
            destRoom={destRoom}
          />
        ))}

        {/* Active Route Line */}
        <Route3D route={route} BY_ID={BY_ID} />

        {/* Friends Layer Pins */}
        {layers.friends && !selected && window.FRIENDS.map(f => {
          const b = BY_ID[f.at];
          if (!b) return null;
          return (
            <Html key={f.id} position={[b.x - 0.7, b.baseY + b.height + 0.9, b.z - 0.5]} center>
              <div 
                onClick={(e) => { e.stopPropagation(); handleSelect(b.id); }}
                className="w-6 h-6 rounded-full cursor-pointer flex items-center justify-center text-[10px] font-black text-white select-none border-2 border-white shadow-lg animate-bounce"
                style={{ background: f.color, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                {f.initials}
              </div>
            </Html>
          );
        })}

        {/* Events Layer Pins */}
        {layers.events && !selected && window.EVENTS.map(ev => {
          const b = BY_ID[ev.at];
          if (!b) return null;
          return (
            <Html key={ev.id} position={[b.x + 0.7, b.baseY + b.height + 0.9, b.z + 0.5]} center>
              <div 
                onClick={(e) => { e.stopPropagation(); handleSelect(b.id); }}
                className="w-6 h-6 rounded-xl cursor-pointer flex items-center justify-center text-sm bg-white select-none border border-rose-300 shadow-lg animate-bounce"
                style={{ animationDelay: '0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                {ev.emoji}
              </div>
            </Html>
          );
        })}

        {/* Parking Pins Layer */}
        {layers.parking && !selected && PARKING_3D.map(p => {
          const col = p.free > 10 ? '#1f9d72' : p.free > 4 ? '#d97706' : '#dc2626';
          return (
            <Html key={p.id} position={[p.x, p.baseY + 1.3, p.z]} center>
              <div 
                onClick={(e) => { e.stopPropagation(); handleSelect(p.id); }}
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

        {/* User Location Indicator ("Acceso Principal" building) */}
        {!selected && BY_ID.acc && (
          <Html position={[BY_ID.acc.x, BY_ID.acc.baseY + BY_ID.acc.height + 0.1, BY_ID.acc.z]} center>
            <div className="relative flex items-center justify-center pointer-events-none">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-md"></span>
            </div>
          </Html>
        )}

        {/* Camera controls */}
        <CameraRig3D selected={selected} bSelected={bSelected} selectedFloor={selectedFloor} showInterior={showInterior} lastDragTimeRef={lastDragTimeRef} />
      </Canvas>
    </div>
  );
}

window.CampusMap3D = CampusMap3D;
