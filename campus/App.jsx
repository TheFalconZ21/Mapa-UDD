// App.jsx — orchestrates the campus prototype. window.CampusApp
const { useState, useEffect, useRef } = React;

const ROUTES = {
  dis:['acc','cas','dis'], bib:['acc','bib'], cas:['acc','cas'], med:['acc','cas','med'],
  rect:['acc','bib','rect'], gym:['acc','gym'], cap:['acc','bib','cap'], acc:['acc'],
};
const routeTo = id => ROUTES[id] || ['acc', id];
const destFloorOf = (room, b) => { if (room) { const m = room.match(/(\d)\d\d/); if (m) return Math.min(+m[1], b.floors); } return 1; };

const FONTS = {
  'Roboto':       { ui:'Roboto', disp:'Roboto' },
  'Plus Jakarta': { ui:'"Plus Jakarta Sans"', disp:'"Plus Jakarta Sans"' },
  'Manrope':      { ui:'Manrope', disp:'Manrope' },
  'DM Sans':      { ui:'"DM Sans"', disp:'"DM Sans"' },
};
const CATG = { admin:'🏛️', fac:'🎓', chapel:'⛪', library:'📖', food:'🍽️', sport:'🏀', gate:'🚪' };

// ── round control button ─────────────────────────────────────────────────────
function Ctl({ glyph, on, onClick, big }) {
  return (
    <button data-nopan onClick={onClick} style={{
      width:46, height:46, borderRadius:13, border:'none', cursor:'pointer',
      background: on ? PAL.navy : '#fff', color: on ? '#fff' : (big ? PAL.blue : PAL.sub),
      boxShadow:'0 3px 12px rgba(10,42,102,0.18)', fontSize: big?20:19, fontWeight:600,
      display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s',
    }}>{glyph}</button>
  );
}

function LayerControls({ layers, toggle }) {
  return (
    <div style={{ position:'absolute', right:14, top:14, display:'flex', flexDirection:'column', gap:9, zIndex:6 }}>
      <Ctl glyph="👥" on={layers.friends} onClick={() => toggle('friends')} />
      <Ctl glyph="📣" on={layers.events}  onClick={() => toggle('events')} />
      <Ctl glyph="🅿️" on={layers.parking} onClick={() => toggle('parking')} />
    </div>
  );
}

function NavControls({ bottom, cam, onRotate, onRecenter }) {
  return (
    <div style={{ position:'absolute', left:14, bottom, display:'flex', flexDirection:'column', gap:9, zIndex:6, transition:'bottom .2s' }}>
      <Ctl glyph="＋" onClick={() => cam.zoomBy(1.35)} />
      <Ctl glyph="－" onClick={() => cam.zoomBy(0.74)} />
      <Ctl glyph="⟳" onClick={onRotate} />
      <Ctl glyph="◎" big onClick={onRecenter} />
    </div>
  );
}

// ── Full-screen 2D floor view (camera-approach entrance, starts at P1) ────────
function FloorView({ building, room, onClose }) {
  const [floor, setFloor] = useState(1);
  const dFloor = room ? destFloorOf(room, building) : null;
  return (
    <div style={{ position:'absolute', inset:0, background:'#F4F7FA', zIndex:20, display:'flex', flexDirection:'column', animation:'fvzoom .42s cubic-bezier(.2,.7,.2,1)', transformOrigin:'50% 42%' }}>
      <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12, background:'#fff', borderBottom:`1px solid ${PAL.line}` }}>
        <button onClick={onClose} style={{ width:34, height:34, borderRadius:17, border:'none', background:PAL.line, color:PAL.ink, fontSize:18, cursor:'pointer' }}>‹</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:17, fontWeight:800, color:PAL.ink, fontFamily:'var(--display)', lineHeight:1.05 }}>{building.name}</div>
          <div style={{ fontSize:12.5, color:PAL.sub, fontFamily:'var(--ui)' }}>Plano interior · piso {floor}{floor===1?' · nivel suelo':''}</div>
        </div>
      </div>
      {room && dFloor && (
        <div style={{ margin:'10px 14px 0', background: floor===dFloor?'#1F9D72':PAL.navy, color:'#fff', borderRadius:12, padding:'9px 13px', display:'flex', alignItems:'center', gap:9, fontFamily:'var(--ui)', transition:'background .2s' }}>
          <span style={{ fontSize:15 }}>📍</span>
          <span style={{ fontSize:13.5, fontWeight:600 }}>{floor===dFloor ? `Estás en el piso de ${room}` : `${room} · sube a Piso ${dFloor}`}</span>
          {floor!==dFloor && <span style={{ marginLeft:'auto', fontSize:16 }} className="bob">↑</span>}
        </div>
      )}
      <div style={{ flex:1, minHeight:0, padding:'8px 6px' }}>
        <FloorPlan building={building} floor={floor} setFloor={setFloor} destRoom={room} />
      </div>
    </div>
  );
}

function SearchOverlay({ onClose, onPickBuilding, onNavigate }) {
  const [q, setQ] = useState('');
  const ref = useRef();
  useEffect(() => { ref.current && ref.current.focus(); }, []);
  const ql = q.trim().toLowerCase();
  const bMatch = BUILDINGS.filter(b => !ql || b.name.toLowerCase().includes(ql) || b.short.toLowerCase().includes(ql));
  const cMatch = TODAY.filter(c => !ql || c.name.toLowerCase().includes(ql) || c.room.toLowerCase().includes(ql));
  return (
    <div style={{ position:'absolute', inset:0, background:'#fff', zIndex:30, display:'flex', flexDirection:'column', animation:'fvin .2s ease' }}>
      <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${PAL.line}` }}>
        <button onClick={onClose} style={{ width:34, height:34, borderRadius:17, border:'none', background:PAL.line, color:PAL.ink, fontSize:18, cursor:'pointer' }}>‹</button>
        <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar sala, edificio o evento…"
               style={{ flex:1, height:42, border:`1.5px solid ${PAL.line}`, borderRadius:12, padding:'0 14px', fontSize:15.5, fontFamily:'var(--ui)', outline:'none', color:PAL.ink }} />
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'4px 16px' }}>
        {cMatch.length > 0 && <div style={{ fontSize:12, fontWeight:800, color:PAL.navy, textTransform:'uppercase', letterSpacing:'.05em', margin:'12px 0 2px', fontFamily:'var(--ui)' }}>Clases</div>}
        {cMatch.map((c, i) => { const b = BUILDINGS.find(x => x.id === c.building); return (
          <Row key={'c'+i} left="📘" title={c.name} sub={`${c.room} · ${b.short} · ${c.time}`} onClick={() => onNavigate(c.building, c.room)} />
        ); })}
        <div style={{ fontSize:12, fontWeight:800, color:PAL.navy, textTransform:'uppercase', letterSpacing:'.05em', margin:'14px 0 2px', fontFamily:'var(--ui)' }}>Lugares</div>
        {bMatch.map(b => (
          <Row key={b.id} left={CATG[b.cat]} title={b.name} sub={`${b.floors} ${b.floors>1?'pisos':'piso'}`} onClick={() => onPickBuilding(b)} />
        ))}
      </div>
    </div>
  );
}

const SNAPS = [118, 360, 600];

function CampusApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const pal = t.palette || ['#0A2A66','#1F6FD6'];
  PAL.navy = pal[0]; PAL.navy2 = pal[0]; PAL.blue = pal[1]; PAL.blueSoft = pal[1] + '1A';

  const [nav, setNav] = useState({ view:'home', payload:null });
  const [selected, setSelected] = useState(null);
  const [route, setRoute] = useState(null);
  const [floorView, setFloorView] = useState(null);
  const [showInterior, setShowInterior] = useState(false);
  const [search, setSearch] = useState(false);
  const [layers, setLayers] = useState({ friends:true, events:true, parking:false });
  const [homeH, setHomeH] = useState(360);
  const [sheetTrans, setSheetTrans] = useState(true);
  const [orient, setOrient] = useState(0);
  
  const [mapLoaded, setMapLoaded] = useState(!!window.CampusMap3D);
  const [selectedFloor, setSelectedFloor] = useState(1);

  const mapRef = useRef();
  const cam = useCamera(mapRef);

  useEffect(() => {
    if (window.CampusMap3D) return;
    const interval = setInterval(() => {
      if (window.CampusMap3D) {
        setMapLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (t.layers) setLayers({ friends: t.layers.includes('friends'), events: t.layers.includes('events'), parking: t.layers.includes('parking') });
  }, [t.layers]);

  const f = FONTS[t.font] || FONTS['Roboto'];
  const relief = t.mapStyle === 'Plano' ? 0.34 : 1;

  const selectBuilding = (id) => {
    if (!id) { 
      if (t.viewMode !== '3D') reset();
      return; 
    }
    const p = PARKING.find(x => x.id === id);
    if (p) { setSelected(null); setNav({ view:'parking', payload:p }); return; }
    const b = BUILDINGS.find(x => x.id === id);
    if (b) { 
      setSelected(id); 
      setSelectedFloor(1);
      setShowInterior(false);
      setNav({ view:'place', payload:b }); 
      if (t.viewMode !== '3D') cam.focusBuilding(id, 460); 
    }
  };
  const handleSelectBuilding = (id) => {
    if (cam.wasDrag()) return;
    selectBuilding(id);
  };
  const navigate = (id, room) => {
    const b = BUILDINGS.find(x => x.id === id); if (!b) return;
    setSelected(id); 
    setSelectedFloor(room ? destFloorOf(room, b) : 1);
    setRoute(routeTo(id)); 
    setSearch(false); 
    if (t.viewMode !== '3D') cam.reset();
    setNav({ view:'route', payload:{ building:b, room } });
  };
  const showFloors = (b, room) => {
    setSelected(b.id); 
    setShowInterior(true);
    if (t.viewMode !== '3D') {
      cam.focusBuilding(b.id, 470);
      window.setTimeout(() => setFloorView({ building:b, room }), 440);
    } else {
      setSelectedFloor(room ? destFloorOf(room, b) : 1);
    }
  };
  const closeFloors = () => { setShowInterior(false); setFloorView(null); if (t.viewMode !== '3D') cam.reset(); };
  const reset = () => { setSelected(null); setShowInterior(false); setRoute(null); setNav({ view:'home', payload:null }); if (t.viewMode !== '3D') cam.reset(); };
  const toggleLayer = (k) => setLayers(s => ({ ...s, [k]: !s[k] }));

  // draggable home sheet
  const homeHRef = useRef(homeH); homeHRef.current = homeH;
  const drag = useRef(null);
  const onGripDown = (e) => {
    if (nav.view !== 'home') return;
    if (!e.target.closest('[data-grip]')) return;
    drag.current = { y:e.clientY, h:homeHRef.current };
    setSheetTrans(false);
    const move = (ev) => { if (!drag.current) return; const nh = Math.min(640, Math.max(96, drag.current.h - (ev.clientY - drag.current.y))); setHomeH(nh); };
    const up = () => { drag.current = null; setSheetTrans(true); setHomeH(h => SNAPS.reduce((a,b) => Math.abs(b-h) < Math.abs(a-h) ? b : a)); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  const fixedH = { place: nav.payload && (FRIENDS.some(x=>x.at===nav.payload.id)||EVENTS.some(x=>x.at===nav.payload.id)) ? 320 : 212, parking: 372, route: t.density==='compact'?300:432 }[nav.view] || 320;
  const curSheetH = nav.view === 'home' ? homeH : fixedH;

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden', '--ui': f.ui, '--display': f.disp, background:PAL.canvas }}>
      <style>{`
        @keyframes fvin { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        @keyframes fvzoom { from { opacity:0; transform:scale(.78) } to { opacity:1; transform:none } }
        @keyframes sheetin { from { transform:translateY(14px); opacity:.6 } to { transform:none; opacity:1 } }
        @keyframes bob { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(3px) } }
        .bob { animation: bob 1.2s ease-in-out infinite; }
      `}</style>

      {/* MAP (2D SVG or 3D WebGL) */}
      {t.viewMode === '3D' ? (
        <div style={{ position:'absolute', inset:0, background:'#d4dde0' }}>
          {mapLoaded ? (
            <CampusMap3D 
              selected={selected} 
              onSelect={selectBuilding} 
              layers={layers} 
              route={route} 
              selectedFloor={selectedFloor}
              showInterior={showInterior}
              destRoom={nav.view === 'route' ? nav.payload.room : null}
            />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#d4dde0', color:'#475569', fontFamily:'var(--ui)', fontSize:'14px' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', border:'3px solid #cbd5e1', borderTopColor:'#1F6FD6', animation:'sp .8s linear infinite', marginBottom:10 }}></div>
              Cargando campus 3D…
            </div>
          )}
        </div>
      ) : (
        <div ref={mapRef} data-map style={{ position:'absolute', inset:0, overflow:'hidden', touchAction:'none', cursor:'grab', background:PAL.canvas }}
             onPointerDown={cam.onPointerDown}
             onClickCapture={(e) => { if (cam.wasDrag()) { e.stopPropagation(); e.preventDefault(); } }}>
          <div style={{ width:'100%', height:'100%', transformOrigin:'0 0', transform:cam.transform, transition: cam.anim ? 'transform .46s cubic-bezier(.4,.1,.2,1)' : 'none' }}>
            <IsoMap selected={selected} onSelect={handleSelectBuilding} onClear={() => { if (!cam.wasDrag() && nav.view!=='home') reset(); }}
                    layers={layers} route={route} userBuilding="acc" density={t.density} relief={relief} orient={orient} />
          </div>
        </div>
      )}

      <LayerControls layers={layers} toggle={toggleLayer} />
      
      {t.viewMode !== '3D' && (
        <NavControls bottom={curSheetH + 14} cam={cam}
                     onRotate={() => setOrient(o => (o + 1) % 4)}
                     onRecenter={() => { cam.reset(); setOrient(0); }} />
      )}

      {/* 3D Floor Selector Overlay */}
      {t.viewMode === '3D' && selected && showInterior && (() => {
        const b = BUILDINGS.find(x => x.id === selected);
        if (!b || b.floors <= 1) return null;
        const floors = [];
        for (let i = b.floors; i >= 1; i--) floors.push(i);
        return (
          <div style={{
            position: 'absolute', right: 14, bottom: curSheetH + 14,
            display: 'flex', flexDirection: 'column', gap: 6, padding: 6,
            background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(10,42,102,0.16)',
            zIndex: 10, animation: 'fvin .2s ease', transition: 'bottom .2s'
          }}>
            {floors.map(fl => {
              const active = fl === selectedFloor;
              const hasDest = (() => {
                const fPlan = window.planFor && window.planFor(b, fl, nav.view === 'route' ? nav.payload.room : null);
                return fPlan && fPlan.rooms.some(r => r.dest);
              })();
              return (
                <button key={fl} onClick={() => setSelectedFloor(fl)} style={{
                  width: 38, height: 38, borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: active ? PAL.navy : '#f1f5f9',
                  color: active ? '#fff' : PAL.sub, fontWeight: 800, fontSize: 13,
                  fontFamily: 'var(--ui)', transition: 'all .15s',
                  position: 'relative'
                }}>
                  P{fl}
                  {hasDest && (
                    <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: active ? '#fff' : '#1F6FD6' }} />
                  )}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* hint */}
      {!selected && (
        <div style={{ position:'absolute', left:14, bottom:curSheetH + 14, zIndex:5, pointerEvents:'none', display: t.density==='compact'?'none':'block', animation:'fvin .2s ease' }}>
          <div style={{ background:'rgba(21,35,59,0.5)', padding:'5px 11px', borderRadius:10, fontSize:11, fontWeight:600, color:'#fff', backdropFilter:'blur(6px)', fontFamily:'var(--ui)' }}>
            {t.viewMode === '3D' 
              ? 'Arrastra para rotar · Clic der. para desplazar · rueda para zoom' 
              : 'Arrastra para desplazar · rueda para zoom'}
          </div>
        </div>
      )}

      {/* BOTTOM SHEET */}
      <div key={nav.view} onPointerDown={onGripDown} style={{
        position:'absolute', left:0, right:0, bottom:0, height:curSheetH, maxHeight:'86%',
        background:'#fff', borderRadius:'22px 22px 0 0', boxShadow:'0 -8px 30px rgba(10,42,102,0.16)',
        zIndex:8, overflow:'auto', animation:'sheetin .26s ease',
        transition: sheetTrans ? 'height .28s cubic-bezier(.4,.1,.2,1)' : 'none',
      }}>
        <Sheet view={nav.view} payload={nav.payload} density={t.density}
               showInterior={showInterior}
               onCloseFloors={closeFloors}
               onSearch={() => setSearch(true)}
               onSelectBuilding={selectBuilding}
               onNavigate={navigate}
               onShowFloors={(b) => showFloors(b, nav.view==='route' ? nav.payload.room : null)}
               onBack={reset}
               onStart={() => showFloors(nav.payload.building, nav.payload.room || 'Entrada')} />
      </div>

      {floorView && <FloorView building={floorView.building} room={floorView.room} onClose={closeFloors} />}
      {search && <SearchOverlay onClose={() => setSearch(false)} onPickBuilding={(b)=>{ setSearch(false); selectBuilding(b.id); }} onNavigate={navigate} />}

      {/* TWEAKS */}
      <TweaksPanel>
        <TweakSection label="Apariencia" />
        <TweakRadio label="Modo de mapa" value={t.viewMode} options={['3D','2D']} onChange={(v)=>setTweak('viewMode', v)} />
        <TweakColor label="Paleta" value={t.palette}
                    options={[['#0A2A66','#1F6FD6'],['#1B3A2A','#2E9E6B'],['#2A1A4A','#7A4FD6'],['#3A1414','#D86A3D']]}
                    onChange={(v) => setTweak('palette', v)} />
        <TweakSelect label="Tipografía" value={t.font} options={Object.keys(FONTS)} onChange={(v)=>setTweak('font', v)} />
        <TweakRadio label="Estilo de mapa" value={t.mapStyle} options={['Relieve','Plano']} onChange={(v)=>setTweak('mapStyle', v)} />
        <TweakRadio label="Densidad" value={t.density} options={['compact','regular','comfy']} onChange={(v)=>setTweak('density', v)} />
        <TweakSection label="Capas del mapa" />
        <TweakSelect label="Activas al abrir" value={t.layers} options={['friends,events','friends,events,parking','friends','none']} onChange={(v)=>setTweak('layers', v)} />
      </TweaksPanel>
    </div>
  );
}

window.CampusApp = CampusApp;
