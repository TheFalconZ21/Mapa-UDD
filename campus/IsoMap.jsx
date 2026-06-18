// IsoMap.jsx — the isometric 3D campus overview (SVG). Exports window.IsoMap
const { useMemo } = React;
const BASE_Z = ISO.Z;

// world bounds so the viewBox auto-fits (all corners, current orientation)
function worldBox() {
  const xs = [], ys = [];
  const add = (gx, gy, z) => { const p = iso(gx, gy, z); xs.push(p.x); ys.push(p.y); };
  TERRACES.forEach(t => t.corners.forEach(([gx, gy]) => { add(gx, gy, t.z); add(gx, gy, Math.max(0, t.z - 8)); }));
  BUILDINGS.forEach(b => {
    [[b.gx,b.gy],[b.gx+b.w,b.gy],[b.gx+b.w,b.gy+b.d],[b.gx,b.gy+b.d]].forEach(([gx,gy]) => { add(gx,gy,b.z); add(gx,gy,b.z+b.h); });
  });
  const minX = Math.min(...xs) - 16, maxX = Math.max(...xs) + 16;
  const minY = Math.min(...ys) - 16, maxY = Math.max(...ys) + 16;
  return { minX, minY, w: maxX - minX, h: maxY - minY };
}

function Terrace({ t, below }) {
  const zb = below != null ? below : t.z - 7;
  const C = t.corners;
  const top = C.map(p => iso(p[0], p[1], t.z));
  // screen-bottom-most corner is the front; its two adjacent edges get earth skirts
  let fi = 0; top.forEach((p, i) => { if (p.y > top[fi].y) fi = i; });
  const edge = (a, bI, fill) => {
    const ta = iso(C[a][0], C[a][1], t.z), tb = iso(C[bI][0], C[bI][1], t.z);
    const ba = iso(C[a][0], C[a][1], zb), bb = iso(C[bI][0], C[bI][1], zb);
    return <polygon points={pts([ta, tb, bb, ba])} fill={fill} />;
  };
  return (
    <g>
      {edge((fi + 3) % 4, fi, PAL.cliff)}
      {edge(fi, (fi + 1) % 4, PAL.cliff2)}
      <polygon points={pts(top)} fill={t.top} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
    </g>
  );
}

function Path({ p }) {
  const d = p.line.map(([gx, gy], i) => { const q = iso(gx, gy, p.z); return `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join(' ');
  return (
    <g>
      <path d={d} fill="none" stroke={PAL.pathEdge} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={PAL.path} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Building({ b, selected, dimmed, onSelect, density }) {
  const f = faces(b);
  const m = PAL.mats[b.mat];
  const op = dimmed ? 0.42 : 1;
  return (
    <g data-bid={b.id} style={{ cursor: 'pointer', transition: 'opacity .35s' }} opacity={op}
       onClick={(e) => { e.stopPropagation(); onSelect(b.id); }}>
      {/* soft ground shadow */}
      <polygon points={footprint({ ...b, gx: b.gx + 0.25, gy: b.gy + 0.25 }, b.z)} fill="rgba(20,30,50,0.16)" />
      <polygon points={f.left}  fill={m[1]} />
      <polygon points={f.right} fill={m[2]} />
      <polygon points={f.top}   fill={m[0]} stroke={selected ? PAL.blue : 'rgba(0,0,0,0.06)'} strokeWidth={selected ? 2.5 : 1} />
      {b.spire && <polygon points={pts([iso(b.gx+0.7,b.gy+0.7,b.z+b.h),iso(b.gx+1.3,b.gy+0.7,b.z+b.h),iso(b.gx+1,b.gy+1,b.z+b.h+5)])} fill={m[0]} />}
      {selected && <polygon points={f.top} fill="none" stroke={PAL.blue} strokeWidth="3" />}
    </g>
  );
}

// glyph for category
const CAT = { admin:'🏛️', fac:'🎓', chapel:'⛪', library:'📖', food:'🍽️', sport:'🏀', gate:'🚪' };

function MapPin({ x, y, children, onClick, z = 1 }) {
  return <g transform={`translate(${x},${y})`} style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>{children}</g>;
}

function IsoMap({ selected, onSelect, layers, route, userBuilding, density, onClear, relief = 1, orient = 0 }) {
  ISO.Z = BASE_Z * relief;
  ISO.o = orient & 3;
  const vb = useMemo(worldBox, [relief, ISO.o]);
  const order = [...BUILDINGS].sort((a, b) => faces(a).depth - faces(b).depth);
  const terrainOrder = [...TERRACES].map(t => ({ t, d: Math.max(...t.corners.map(c => iso(c[0], c[1], t.z).y)) })).sort((a, b) => a.d - b.d);
  const belowZ = (t) => { const lower = TERRACES.filter(x => x.z < t.z).sort((a, b) => b.z - a.z)[0]; return lower ? lower.z : 0; };
  const labelFor = (id) => BUILDINGS.find(x => x.id === id);

  // route polyline through building anchors
  const routePath = route && route.length > 1
    ? route.map((id, i) => { const b = labelFor(id); const f = faces(b); return `${i ? 'L' : 'M'}${f.cx.toFixed(1)} ${(f.cy + 4).toFixed(1)}`; }).join(' ')
    : null;

  const showLabels = density !== 'compact';

  return (
    <svg viewBox={`${vb.minX} ${vb.minY} ${vb.w} ${vb.h}`} width="100%" height="100%"
         style={{ display: 'block', background: PAL.canvas }} onClick={onClear}>
      <defs>
        <filter id="pinsh" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0A2A66" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* terrain back-to-front (depth-sorted for current orientation) */}
      {terrainOrder.map(({ t }) => <Terrace key={t.id} t={t} below={belowZ(t)} />)}
      {/* parking aprons */}
      {PARKING.map(p => (
        <g key={p.id}>
          <polygon points={footprint(p, p.z)} fill="#9AA3AE" stroke="#828B96" strokeWidth="1" />
        </g>
      ))}
      {PATHS.map((p, i) => <Path key={i} p={p} />)}

      {/* buildings */}
      {order.map(b => (
        <Building key={b.id} b={b} density={density}
                  selected={selected === b.id}
                  dimmed={!!selected && selected !== b.id}
                  onSelect={onSelect} />
      ))}

      {/* route line */}
      {routePath && (
        <g>
          <path d={routePath} fill="none" stroke="#06204F" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={routePath} fill="none" stroke={PAL.blue} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={routePath} fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="1 9" strokeLinecap="round" />
        </g>
      )}

      {/* labels for major buildings */}
      {showLabels && order.map(b => {
        if (selected && selected !== b.id) return null;
        const f = faces(b);
        return (
          <g key={'l' + b.id} transform={`translate(${f.cx},${f.topY - 8})`} style={{ pointerEvents: 'none' }}>
            <g opacity={selected === b.id ? 0 : 0.92}>
              <rect x={-(b.short.length * 3.4 + 8)} y="-11" width={b.short.length * 6.8 + 16} height="18" rx="9" fill="rgba(255,255,255,0.92)" />
              <text x="0" y="2" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={PAL.ink}
                    fontFamily="Roboto, system-ui">{b.short}</text>
            </g>
          </g>
        );
      })}

      {/* PARKING layer pins */}
      {layers.parking && PARKING.map(p => {
        const c = iso(p.gx + p.w / 2, p.gy + p.d / 2, p.z);
        const col = p.free > 10 ? '#1F9D72' : p.free > 4 ? '#E0913D' : '#D8453B';
        return (
          <MapPin key={p.id} x={c.x} y={c.y} onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}>
            <g filter="url(#pinsh)">
              <rect x="-20" y="-15" width="40" height="26" rx="7" fill="#fff" />
              <rect x="-20" y="-15" width="15" height="26" rx="7" fill={col} />
              <text x="-12.5" y="3" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="Roboto">P</text>
              <text x="6" y="-2" textAnchor="middle" fontSize="11" fontWeight="800" fill={PAL.ink} fontFamily="Roboto">{p.free}</text>
              <text x="6" y="8" textAnchor="middle" fontSize="6.5" fontWeight="600" fill={PAL.sub} fontFamily="Roboto">libres</text>
            </g>
          </MapPin>
        );
      })}

      {/* EVENTS layer pins */}
      {layers.events && EVENTS.map(ev => {
        const b = labelFor(ev.at); if (!b) return null; const f = faces(b);
        return (
          <MapPin key={ev.id} x={f.cx + 14} y={f.topY - 16} onClick={(e) => { e.stopPropagation(); onSelect(ev.at); }}>
            <g filter="url(#pinsh)">
              <path d="M0 8 L-7 -2 A11 11 0 1 1 7 -2 Z" fill="#E0533D" />
              <circle cx="0" cy="-6" r="8.5" fill="#fff" />
              <text x="0" y="-2.5" textAnchor="middle" fontSize="10">{ev.emoji}</text>
            </g>
          </MapPin>
        );
      })}

      {/* FRIENDS layer pins */}
      {layers.friends && FRIENDS.map(fr => {
        const b = labelFor(fr.at); if (!b) return null; const f = faces(b);
        return (
          <MapPin key={fr.id} x={f.cx - 14} y={f.topY - 14}>
            <g filter="url(#pinsh)">
              <circle cx="0" cy="0" r="11" fill="#fff" />
              <circle cx="0" cy="0" r="9" fill={fr.color} />
              <text x="0" y="3.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Roboto">{fr.initials}</text>
            </g>
          </MapPin>
        );
      })}

      {/* YOU ARE HERE */}
      {userBuilding && (() => {
        const b = labelFor(userBuilding); if (!b) return null; const f = faces(b);
        return (
          <MapPin x={f.cx} y={f.cy}>
            <circle cx="0" cy="0" r="13" fill={PAL.blue} opacity="0.22">
              <animate attributeName="r" values="9;17;9" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="6.5" fill={PAL.blue} stroke="#fff" strokeWidth="2.5" filter="url(#pinsh)" />
          </MapPin>
        );
      })()}
    </svg>
  );
}

window.IsoMap = IsoMap;
