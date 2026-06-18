// FloorPlan.jsx — detailed 2D building plan + lateral floor selector. window.FloorPlan
const FP_W = 336, FP_H = 344;

// generic plan for buildings without authored detail
function genFloor(seed, n) {
  const cols = [ [24,118],[150,90],[248,64] ];
  const rooms = [];
  cols.forEach((c, i) => rooms.push({ x:c[0], y:24, w:c[1], h:96, label:`${n}0${i+1}`, type:'room' }));
  rooms.push({ x:24, y:126, w:288, h:64, label:'', type:'hall' });
  rooms.push({ x:24, y:196, w:170, h:124, label:`${n}10`, type:'room' });
  rooms.push({ x:200,y:196, w:112, h:124, label:`${n}11`, type:'room' });
  rooms.push({ x:150,y:132, w:38, h:52, label:'WC', type:'wc' });
  rooms.push({ x:196,y:132, w:34, h:52, label:'', type:'stair' });
  rooms.push({ x:236,y:132, w:34, h:52, label:'', type:'lift' });
  return { label:`P${n}`, rooms };
}

function planFor(building, floor, destRoom) {
  let basePlan;
  if (building.id === 'dis' && window.DIS_FLOORS[floor]) {
    basePlan = window.DIS_FLOORS[floor];
  } else {
    basePlan = genFloor(building.id, floor);
  }
  
  // Clone to avoid mutating static source objects
  const plan = JSON.parse(JSON.stringify(basePlan));
  plan.rooms.forEach(r => { r.dest = false; });
  
  if (destRoom) {
    const cleanDest = destRoom.replace('Sala ', '').trim().toLowerCase();
    const room = plan.rooms.find(r => 
      (r.label && r.label.toLowerCase() === cleanDest) ||
      (r.name && r.name.toLowerCase() === cleanDest) ||
      (r.label && cleanDest.includes(r.label.toLowerCase())) ||
      (r.name && cleanDest.includes(r.name.toLowerCase()))
    );
    if (room) {
      room.dest = true;
    }
  } else {
    // Restore default dest if any
    basePlan.rooms.forEach((r, idx) => {
      if (r.dest) plan.rooms[idx].dest = true;
    });
  }
  return plan;
}

const RTYPE = {
  room:  { fill:'#F4F6FA', stroke:'#D5DCE6', text:'#2B3A52' },
  hall:  { fill:'#ECEFF4', stroke:'#E1E6ED', text:'#8A94A6' },
  wc:    { fill:'#EAF1FB', stroke:'#CFE0F6', text:'#1F6FD6' },
  stair: { fill:'#E8EDF4', stroke:'#CBD5E3', text:'#5C6B82' },
  lift:  { fill:'#E8EDF4', stroke:'#CBD5E3', text:'#5C6B82' },
};

function RoomShape({ r }) {
  const dest = r.dest;
  const t = RTYPE[r.type] || RTYPE.room;
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return (
    <g>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="4"
            fill={dest ? '#1F6FD6' : t.fill} stroke={dest ? '#0A2A66' : t.stroke} strokeWidth={dest ? 2 : 1.2} />
      {r.type === 'stair' && (
        <g stroke="#9AA6B8" strokeWidth="1.4">
          {[0,1,2,3].map(i => <line key={i} x1={r.x+8} y1={r.y+12+i*9} x2={r.x+r.w-8} y2={r.y+12+i*9} />)}
        </g>
      )}
      {r.type === 'lift' && <text x={cx} y={cy+4} textAnchor="middle" fontSize="13">🛗</text>}
      {r.type === 'wc' && <text x={cx} y={cy+4} textAnchor="middle" fontSize="10" fontWeight="700" fill={t.text} fontFamily="Roboto">WC</text>}
      {(r.type==='room') && (
        <text x={cx} y={r.name ? cy : cy+4} textAnchor="middle" fontSize={dest?13:12}
              fontWeight={dest?'800':'700'} fill={dest?'#fff':t.text} fontFamily="Roboto">{r.label}</text>
      )}
      {r.type==='room' && r.name && (
        <text x={cx} y={cy+15} textAnchor="middle" fontSize="9" fill={dest?'rgba(255,255,255,0.9)':'#8A94A6'} fontFamily="Roboto">{r.name}</text>
      )}
      {dest && (
        <g transform={`translate(${cx},${r.y-2})`}>
          <path d="M0 6 L-6 -3 A8 8 0 1 1 6 -3 Z" fill="#0A2A66" />
          <circle cx="0" cy="-5" r="5.5" fill="#fff" />
          <circle cx="0" cy="-5" r="2.4" fill="#0A2A66" />
        </g>
      )}
    </g>
  );
}

function FloorPlan({ building, floor, setFloor, destRoom }) {
  const { useState, useEffect, useRef } = React;
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [dragActive, setDragActive] = useState(false);
  const dragStart = useRef(null);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  }, [floor, building.id]);

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.button !== undefined) return;
    setDragActive(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragStart.current) return;
    const x = e.clientX - dragStart.current.x;
    const y = e.clientY - dragStart.current.y;
    setPan({ x, y });
  };

  const onPointerUp = (e) => {
    setDragActive(false);
    dragStart.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch(err) {}
  };

  const onWheel = (e) => {
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom(z => Math.max(0.7, Math.min(3.5, z * factor)));
  };

  const floors = [];
  for (let i = building.floors; i >= 1; i--) floors.push(i);
  const plan = planFor(building, floor, destRoom);
  // route on floor: from entry hall to dest room (simple L)
  const dest = plan.rooms.find(r => r.dest);
  const entry = plan.rooms.find(r => r.entry) || plan.rooms.find(r => r.type === 'hall');
  let routeD = null;
  if (dest && entry) {
    const sx = entry.x + entry.w / 2, sy = entry.y + entry.h / 2;
    const dx = dest.x + dest.w / 2, dy = dest.y + dest.h - 6;
    routeD = `M${sx} ${sy} L${dx} ${sy} L${dx} ${dy}`;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#F8FAFC', overflow: 'hidden' }}>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        style={{
          width: '100%', height: '100%',
          cursor: dragActive ? 'grabbing' : 'grab',
          touchAction: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <svg 
          viewBox={`0 0 ${FP_W} ${FP_H}`} 
          style={{ 
            display: 'block', 
            width: '100%', height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragActive ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          {/* building slab */}
          <rect x="12" y="12" width={FP_W-24} height={FP_H-24} rx="10" fill="#fff" stroke="#E4E8EF" strokeWidth="1.5" />
          {plan.rooms.map((r, i) => <RoomShape key={i} r={r} />)}
          {routeD && (
            <g>
              <path d={routeD} fill="none" stroke="#0A2A66" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              <path d={routeD} fill="none" stroke="#fff" strokeWidth="1.4" strokeDasharray="1 7" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </div>

      {/* lateral floor selector */}
      <div style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 4, padding: 4,
        background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(10,42,102,0.14)',
      }}>
        {floors.map(fl => {
          const active = fl === floor;
          const hasDest = (() => {
            const fPlan = planFor(building, fl, destRoom);
            return fPlan && fPlan.rooms.some(r => r.dest);
          })();
          return (
            <button key={fl} onClick={() => setFloor(fl)} style={{
              width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: active ? PAL.navy : 'transparent',
              color: active ? '#fff' : PAL.sub, fontWeight: 700, fontSize: 15,
              fontFamily: 'Roboto, system-ui', position: 'relative',
              transition: 'background .15s',
            }}>
              P{fl}
              {hasDest && (
                <span style={{ position: 'absolute', top: 5, right: 6, width: 6, height: 6, borderRadius: 4, background: active ? '#fff' : '#1F6FD6' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.FloorPlan = FloorPlan;
window.planFor = planFor;
