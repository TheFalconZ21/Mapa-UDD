// Sheet.jsx — bottom sheet UI (home / place / parking / route) + elevation profile.
// window.Sheet, window.TODAY
const TODAY = [
  { time:'10:30', name:'Taller de Diseño I', room:'Sala 301', building:'dis', soon:true },
  { time:'12:00', name:'Historia del Arte',  room:'Sala 202', building:'bib' },
  { time:'15:30', name:'Taller de Maqueta',  room:'Lab Maqueta', building:'dis' },
  { time:'17:00', name:'Computación Gráfica', room:'Sala 401', building:'dis' },
];

const ICON = {
  search:'🔎', clock:'🕘', walk:'🚶', stairs:'🪜', ramp:'♿', up:'↑',
};

function Pill({ children, onClick, primary, ghost, style }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      height:48, borderRadius:14, border: ghost ? `1.5px solid ${PAL.line}` : 'none', cursor:'pointer',
      background: primary ? PAL.navy : ghost ? '#fff' : PAL.blueSoft,
      color: primary ? '#fff' : PAL.navy, fontWeight:700, fontSize:15,
      fontFamily:'var(--ui)', flex:1, ...style,
    }}>{children}</button>
  );
}

function Grab() {
  return (
    <div data-grip style={{ padding:'11px 0 7px', cursor:'grab', touchAction:'none' }}>
      <div style={{ width:40, height:5, borderRadius:3, background:'#D7DCE4', margin:'0 auto' }} />
    </div>
  );
}

// ── Elevation profile (the ladera differentiator) ───────────────────────────
function ElevationProfile({ profile, markers }) {
  const W = 300, H = 92, pad = 8;
  const ds = profile.map(p => p.d), es = profile.map(p => p.e);
  const dMax = Math.max(...ds), eMax = Math.max(...es) + 2;
  const X = d => pad + (d / dMax) * (W - pad * 2);
  const Y = e => (H - 18) - (e / eMax) * (H - 30);
  const line = profile.map((p, i) => `${i ? 'L' : 'M'}${X(p.d).toFixed(1)} ${Y(p.e).toFixed(1)}`).join(' ');
  const area = `${line} L${X(dMax)} ${H-14} L${X(0)} ${H-14} Z`;
  return (
    <div style={{ background:'#F6F8FB', borderRadius:14, padding:'10px 12px 6px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:2 }}>
        <span style={{ fontSize:12.5, fontWeight:700, color:PAL.ink, fontFamily:'var(--ui)' }}>Perfil de subida</span>
        <span style={{ fontSize:11.5, color:PAL.sub, fontFamily:'var(--ui)' }}>+18 m · 3 pisos</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
        <defs>
          <linearGradient id="elev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1F6FD6" stopOpacity="0.30" />
            <stop offset="1" stopColor="#1F6FD6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#elev)" />
        <path d={line} fill="none" stroke={PAL.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {markers.map((m, i) => (
          <g key={i} transform={`translate(${X(m.d)},${Y(m.e)})`}>
            <circle r="9" fill="#fff" stroke={PAL.blue} strokeWidth="2" />
            <text y="3.5" textAnchor="middle" fontSize="9">{m.icon}</text>
          </g>
        ))}
        <line x1={pad} y1={H-14} x2={W-pad} y2={H-14} stroke="#E2E7EF" strokeWidth="1" />
      </svg>
    </div>
  );
}

const ROUTE_PROFILE = [
  { d:0, e:0 }, { d:55, e:4 }, { d:120, e:9 }, { d:185, e:9 }, { d:210, e:9 }, { d:235, e:18 },
];
const ROUTE_MARKERS = [
  { d:55, e:4, icon:'♿' },     // rampa
  { d:120, e:9, icon:'🪜' },    // escalera campus
  { d:235, e:18, icon:'🛗' },   // ascensor interior
];
const ROUTE_STEPS = [
  { icon:'🚶', txt:'Sal del Acceso Principal hacia el norte', sub:'90 m por sendero' },
  { icon:'♿', txt:'Sube la rampa hacia la terraza media', sub:'Evita 2 tramos de escalera' },
  { icon:'🪜', txt:'Escalera del Casino hasta plaza Diseño', sub:'+5 m de desnivel' },
  { icon:'🛗', txt:'Entra a Edificio Diseño · usa el ascensor a P3', sub:'Sala 301 está al fondo izq.' },
];

function Row({ left, title, sub, right, onClick, accent }) {
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:12, padding:'11px 4px', cursor: onClick?'pointer':'default',
      borderBottom:`1px solid ${PAL.line}`,
    }}>
      <div style={{
        width:40, height:40, borderRadius:11, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background: accent || PAL.blueSoft, fontSize:18,
      }}>{left}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15, fontWeight:600, color:PAL.ink, fontFamily:'var(--ui)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize:12.5, color:PAL.sub, fontFamily:'var(--ui)' }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Sheet({ view, payload, density, showInterior, onCloseFloors, onSearch, onSelectBuilding, onNavigate, onShowFloors, onBack, onStart }) {
  const pad = density === 'compact' ? '0 16px 14px' : '0 18px 18px';

  // ── HOME ──────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <div style={{ padding: pad }}>
        <Grab />
        <button onClick={onSearch} style={{
          display:'flex', alignItems:'center', gap:10, width:'100%', height:50, borderRadius:14,
          border:'none', background:'#fff', boxShadow:'inset 0 0 0 1.5px '+PAL.line, padding:'0 14px',
          cursor:'pointer', marginBottom:14,
        }}>
          <span style={{ fontSize:17 }}>{ICON.search}</span>
          <span style={{ color:PAL.sub, fontSize:15.5, fontFamily:'var(--ui)' }}>Buscar sala, edificio o evento…</span>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
          <span style={{ fontSize:13, fontWeight:800, color:PAL.navy, letterSpacing:'.04em', fontFamily:'var(--ui)', textTransform:'uppercase' }}>Tus clases de hoy</span>
        </div>
        {TODAY.map((c, i) => {
          const b = BUILDINGS.find(x => x.id === c.building);
          return (
            <Row key={i} left={c.soon ? '⏰' : ICON.clock} accent={c.soon ? '#FFE9D6' : PAL.blueSoft}
                 title={`${c.name}`} sub={`${c.room} · ${b.short}`}
                 onClick={() => onNavigate(c.building, c.room)}
                 right={
                   <div style={{ textAlign:'right' }}>
                     <div style={{ fontSize:15, fontWeight:800, color: c.soon ? '#E0533D' : PAL.ink, fontFamily:'var(--ui)' }}>{c.time}</div>
                     {c.soon && <div style={{ fontSize:11, color:'#E0533D', fontFamily:'var(--ui)' }}>en 20 min</div>}
                   </div>
                 } />
          );
        })}
      </div>
    );
  }

  // ── PLACE (building) ──────────────────────────────────────────────────
  if (view === 'place') {
    const b = payload;
    const friends = FRIENDS.filter(f => f.at === b.id);
    const events = EVENTS.filter(e => e.at === b.id);
    return (
      <div style={{ padding: pad }}>
        <Grab />
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:800, color:PAL.ink, fontFamily:'var(--display)', lineHeight:1.1 }}>{b.name}</div>
            <div style={{ fontSize:13.5, color:PAL.sub, marginTop:3, fontFamily:'var(--ui)' }}>
              <span style={{ color:'#1F9D72', fontWeight:700 }}>Abierto</span> · {b.floors} {b.floors>1?'pisos':'piso'} · 4 min a pie
            </div>
          </div>
          <button onClick={onBack} style={{ width:30, height:30, borderRadius:15, border:'none', background:PAL.line, color:PAL.sub, fontSize:16, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'flex', gap:10, marginBottom: (friends.length||events.length)?14:2 }}>
          <Pill primary onClick={() => onNavigate(b.id)}>Cómo llegar</Pill>
          {showInterior ? (
            <Pill ghost onClick={onCloseFloors} style={{ flex:'0 0 auto', padding:'0 18px' }}>Ver exterior</Pill>
          ) : (
            <Pill ghost onClick={() => onShowFloors(b)} style={{ flex:'0 0 auto', padding:'0 18px' }}>Ver pisos</Pill>
          )}
        </div>
        {(friends.length>0 || events.length>0) && (
          <div>
            {friends.map(f => (
              <Row key={f.id} left={<span style={{ width:28,height:28,borderRadius:14,background:f.color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700 }}>{f.initials}</span>}
                   accent="transparent" title={`${f.name} está aquí`} sub="Compartiendo ubicación · hace 2 min" />
            ))}
            {events.map(e => (
              <Row key={e.id} left={e.emoji} accent="#FFF1EC" title={e.kind} sub={`${e.host} · ${e.when}`} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── PARKING ───────────────────────────────────────────────────────────
  if (view === 'parking') {
    const p = payload;
    const col = p.free > 10 ? '#1F9D72' : p.free > 4 ? '#E0913D' : '#D8453B';
    return (
      <div style={{ padding: pad }}>
        <Grab />
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:800, color:PAL.ink, fontFamily:'var(--display)' }}>{p.name}</div>
            <div style={{ fontSize:13.5, color:PAL.sub, marginTop:3, fontFamily:'var(--ui)' }}>{p.total} cupos totales</div>
          </div>
          <button onClick={onBack} style={{ width:30, height:30, borderRadius:15, border:'none', background:PAL.line, color:PAL.sub, fontSize:16, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'flex', gap:10, marginBottom:14 }}>
          <div style={{ flex:1, background:'#F6F8FB', borderRadius:14, padding:'12px 14px' }}>
            <div style={{ fontSize:28, fontWeight:800, color:col, fontFamily:'var(--display)' }}>{p.free}</div>
            <div style={{ fontSize:12, color:PAL.sub, fontFamily:'var(--ui)' }}>cupos libres ahora</div>
          </div>
          <div style={{ flex:1, background:'#F6F8FB', borderRadius:14, padding:'12px 14px' }}>
            <div style={{ fontSize:15, fontWeight:800, color:PAL.ink, fontFamily:'var(--display)', marginTop:4 }}>~6 min</div>
            <div style={{ fontSize:12, color:PAL.sub, fontFamily:'var(--ui)' }}>próximo cupo estimado</div>
          </div>
        </div>
        <div style={{ background:PAL.blueSoft, borderRadius:14, padding:'12px 14px', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:PAL.navy, fontFamily:'var(--ui)', marginBottom:3 }}>Estimación probabilística</div>
          <div style={{ fontSize:12.5, color:PAL.sub, lineHeight:1.45, fontFamily:'var(--ui)' }}>
            2 personas caminan hacia su auto aquí. Cruzamos su velocidad con la salida promedio para estimar cuándo se libera un cupo.
          </div>
        </div>
        <Pill primary>Avisar “voy saliendo” &nbsp;→&nbsp; gana prioridad</Pill>
      </div>
    );
  }

  // ── ROUTE ─────────────────────────────────────────────────────────────
  if (view === 'route') {
    const { building, room } = payload;
    return (
      <div style={{ padding: pad }}>
        <Grab />
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <button onClick={onBack} style={{ width:32, height:32, borderRadius:16, border:'none', background:PAL.line, color:PAL.sub, fontSize:17, cursor:'pointer' }}>‹</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:PAL.ink, fontFamily:'var(--display)', lineHeight:1.05 }}>{room || 'Entrada'} · {building.short}</div>
            <div style={{ fontSize:13, color:PAL.sub, fontFamily:'var(--ui)' }}>
              <b style={{ color:PAL.ink }}>6 min</b> · 235 m · sube 3 pisos
            </div>
          </div>
          {showInterior ? (
            <button onClick={onCloseFloors} style={{ height:34, padding:'0 12px', borderRadius:10, border:`1.5px solid ${PAL.line}`, background:'#fff', color:PAL.navy, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'var(--ui)' }}>Exterior</button>
          ) : (
            <button onClick={() => onShowFloors(building)} style={{ height:34, padding:'0 12px', borderRadius:10, border:`1.5px solid ${PAL.line}`, background:'#fff', color:PAL.navy, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'var(--ui)' }}>Pisos</button>
          )}
        </div>
        <div style={{ marginBottom:12 }}>
          <ElevationProfile profile={ROUTE_PROFILE} markers={ROUTE_MARKERS} />
        </div>
        {density !== 'compact' && ROUTE_STEPS.map((s, i) => (
          <Row key={i} left={s.icon} title={s.txt} sub={s.sub} accent={i===1?'#EAF6F0':PAL.blueSoft} />
        ))}
        <div style={{ marginTop:14 }}>
          <Pill primary onClick={onStart} style={{ height:52 }}>Iniciar navegación</Pill>
        </div>
      </div>
    );
  }
  return null;
}

window.Sheet = Sheet;
window.TODAY = TODAY;
