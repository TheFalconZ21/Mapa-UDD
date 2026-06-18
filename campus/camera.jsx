// camera.jsx — pan / zoom camera for the iso map (rotation is grid-based, not here).
// Transform model (origin 0 0):  screen = (x,y) + s * base
function clampS(s) { return Math.min(3.6, Math.max(0.62, s)); }
function zoomAbout(cam, p, ns) {
  const bx = (p.x - cam.x) / cam.s, by = (p.y - cam.y) / cam.s;
  return { x: p.x - ns * bx, y: p.y - ns * by, s: ns };
}

function useCamera(containerRef) {
  const [cam, setCam] = React.useState({ x: 0, y: 0, s: 1 });
  const [anim, setAnim] = React.useState(false);
  const camRef = React.useRef(cam); camRef.current = cam;
  const ptrs = React.useRef(new Map());
  const g = React.useRef(null);
  const moved = React.useRef(false);
  const lastDragTime = React.useRef(0);

  const cp = (e) => { const b = containerRef.current.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const center = () => { const b = containerRef.current.getBoundingClientRect(); return { x: b.width / 2, y: b.height / 2 }; };

  // window-level gesture handlers (stable; read refs) — no pointer capture so
  // building clicks still reach their <g onClick>.
  const onWinMove = React.useCallback((e) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, cp(e));
    const cur = g.current; if (!cur) return;
    if (cur.mode === 'pan' && ptrs.current.size === 1) {
      const p = cp(e);
      if (Math.hypot(p.x - cur.start.x, p.y - cur.start.y) > 4) moved.current = true;
      setCam({ ...cur.cam, x: cur.cam.x + (p.x - cur.start.x), y: cur.cam.y + (p.y - cur.start.y) });
    } else if (ptrs.current.size >= 2) {
      const [a, b] = [...ptrs.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (cur.mode !== 'pinch') { g.current = { mode: 'pinch', dist, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cam: { ...camRef.current } }; return; }
      moved.current = true;
      setCam(zoomAbout(cur.cam, cur.mid, clampS(cur.cam.s * (dist / cur.dist))));
    }
  }, [containerRef]);

  const detach = React.useCallback(() => {
    window.removeEventListener('pointermove', onWinMove);
    window.removeEventListener('pointerup', onWinUp);
    window.removeEventListener('pointercancel', onWinUp);
  }, [onWinMove]);

  function onWinUp(e) {
    ptrs.current.delete(e.pointerId);
    if (moved.current) {
      lastDragTime.current = Date.now();
    }
    if (ptrs.current.size === 1) { const p = [...ptrs.current.values()][0]; g.current = { mode: 'pan', start: p, cam: { ...camRef.current } }; }
    else if (ptrs.current.size === 0) { g.current = null; detach(); }
  }

  const onPointerDown = (e) => {
    if (e.target.closest('[data-grip],[data-nopan],button')) return;
    ptrs.current.set(e.pointerId, cp(e));
    setAnim(false);
    if (ptrs.current.size === 1) {
      moved.current = false;
      g.current = { mode: 'pan', start: cp(e), cam: { ...camRef.current } };
      window.addEventListener('pointermove', onWinMove);
      window.addEventListener('pointerup', onWinUp);
      window.addEventListener('pointercancel', onWinUp);
    } else if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      g.current = { mode: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cam: { ...camRef.current } };
    }
  };

  // wheel zoom toward cursor (non-passive)
  React.useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onWheel = (e) => {
      e.preventDefault(); setAnim(false);
      const r = el.getBoundingClientRect();
      const p = { x: e.clientX - r.left, y: e.clientY - r.top };
      const c = camRef.current;
      setCam(zoomAbout(c, p, clampS(c.s * (e.deltaY < 0 ? 1.12 : 0.89))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [containerRef]);

  React.useEffect(() => detach, [detach]);

  const animateTo = (next, dur = 460) => { setAnim(true); setCam(next); window.setTimeout(() => setAnim(false), dur); };
  const reset = () => animateTo({ x: 0, y: 0, s: 1 });
  const zoomBy = (f) => { const c = camRef.current; animateTo(zoomAbout(c, center(), clampS(c.s * f)), 240); };
  const focusBuilding = (id, dur = 470) => {
    const el = containerRef.current; if (!el) return;
    const node = el.querySelector(`[data-bid="${id}"]`); if (!node) return;
    const cb = el.getBoundingClientRect(), rb = node.getBoundingClientRect();
    const p = { x: rb.left + rb.width / 2 - cb.left, y: rb.top + rb.height / 2 - cb.top };
    const c = camRef.current;
    const ts = Math.min(3.2, Math.max(c.s * 2.1, 2.0));
    const bx = (p.x - c.x) / c.s, by = (p.y - c.y) / c.s;
    const C = center();
    animateTo({ x: C.x - ts * bx, y: C.y - ts * by, s: ts }, dur);
  };

  const transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
  return { cam, anim, transform, onPointerDown, reset, zoomBy, focusBuilding, wasDrag: () => moved.current || (Date.now() - lastDragTime.current < 550) };
}

window.useCamera = useCamera;
