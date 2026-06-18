// data.jsx — Campus model, isometric projection, palette.
// Pure data + geometry helpers. Exported to window for other babel scripts.

// ── UDD-flavoured palette (institutional navy + blue, campus greens) ──────────
const PAL = {
  navy:    '#0A2A66',
  navy2:   '#06204F',
  blue:    '#1F6FD6',
  blueSoft:'#E8F0FB',
  ink:     '#15233B',
  sub:     '#5C6B82',
  line:    '#E4E8EF',
  surface: '#FFFFFF',
  canvas:  '#EAEFE6',  // map base behind terrain
  // terrain
  grassTop:'#A7C97E',
  grassTop2:'#9BC06F',
  grassMid:'#7FA756',
  cliff:   '#6E5A43',  // exposed earth on the downhill drop
  cliff2:  '#5E4C38',
  path:    '#EDE7D8',
  pathEdge:'#DAD0BB',
  water:   '#9FD0DE',
  // building material sets (top / left / right)
  mats: {
    brick:  ['#C9744E', '#B5623F', '#9B4F30'],
    slate:  ['#7E8AA0', '#67728A', '#525C71'],
    beige:  ['#D8CDB4', '#C6BA9C', '#AEA384'],
    teal:   ['#5E9E97', '#4E8A83', '#3E726C'],
    sand:   ['#D9B98C', '#C7A576', '#AE8C5E'],
    white:  ['#E9ECEF', '#D5DAE0', '#BCC3CC'],
    navy:   ['#2E4A82', '#22396A', '#172A52'],
  },
};

// ── Isometric projection (with 90° grid rotation) ────────────────────────────
// 2:1 dimetric. Grid (gx,gy) rotated by ISO.o*90° around (cx,cy), + height z.
const ISO = { U: 22, Z: 6.5, ox: 250, oy: 150, cx: 6, cy: 8, o: 0 };
function iso(gx, gy, z = 0) {
  let dx = gx - ISO.cx, dy = gy - ISO.cy, rx, ry;
  switch (ISO.o & 3) {
    case 1:  rx =  dy; ry = -dx; break;
    case 2:  rx = -dx; ry = -dy; break;
    case 3:  rx = -dy; ry =  dx; break;
    default: rx =  dx; ry =  dy;
  }
  const X = ISO.cx + rx, Y = ISO.cy + ry;
  return {
    x: ISO.ox + (X - Y) * ISO.U,
    y: ISO.oy + (X + Y) * (ISO.U / 2) - z * ISO.Z,
  };
}
const pts = (arr) => arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

// Build the three visible polygons of an extruded box footprint.
// b: {gx,gy,w,d,h,z}
function boxFaces(b) {
  const { gx, gy, w, d, h, z } = b;
  const zt = z + h;
  // top corners
  const A = iso(gx, gy, zt), B = iso(gx + w, gy, zt), C = iso(gx + w, gy + d, zt), D = iso(gx, gy + d, zt);
  // bottom corners (only need front-right & front-left)
  const Bb = iso(gx + w, gy, z), Cb = iso(gx + w, gy + d, z), Db = iso(gx, gy + d, z);
  return {
    top:   pts([A, B, C, D]),
    right: pts([B, Cb && iso(gx + w, gy + d, z) ? iso(gx + w, gy + d, z) : Cb, Cb, C].slice ? [B, iso(gx + w, gy + d, z), Cb, C] : []),
    // explicit faces below (clearer)
  };
}

// Build the visible polygons of an extruded box for ANY grid orientation.
// The screen-bottom-most base corner is the front; its two adjacent faces show.
function faces(b) {
  const C = [[b.gx, b.gy], [b.gx + b.w, b.gy], [b.gx + b.w, b.gy + b.d], [b.gx, b.gy + b.d]];
  const base = C.map(p => iso(p[0], p[1], b.z));
  const top  = C.map(p => iso(p[0], p[1], b.z + b.h));
  let fi = 0; base.forEach((p, i) => { if (p.y > base[fi].y) fi = i; });
  const Li = (fi + 3) % 4, Ri = (fi + 1) % 4;
  const faceA = [top[fi], top[Li], base[Li], base[fi]];
  const faceB = [top[fi], top[Ri], base[Ri], base[fi]];
  const aLeft = top[Li].x <= top[Ri].x;
  const left  = aLeft ? faceA : faceB;
  const right = aLeft ? faceB : faceA;
  const cx = (top[0].x + top[1].x + top[2].x + top[3].x) / 4;
  const cy = (top[0].y + top[1].y + top[2].y + top[3].y) / 4;
  const topY = Math.min(top[0].y, top[1].y, top[2].y, top[3].y);
  const depth = Math.max(base[0].y, base[1].y, base[2].y, base[3].y);
  return { top: pts(top), left: pts(left), right: pts(right), cx, cy, topY, depth, topCorners: top };
}

// Footprint polygon on the ground (for paths / selection hit area)
function footprint(b, z) {
  const zz = z == null ? b.z : z;
  return pts([iso(b.gx, b.gy, zz), iso(b.gx + b.w, b.gy, zz), iso(b.gx + b.w, b.gy + b.d, zz), iso(b.gx, b.gy + b.d, zz)]);
}

// ── Terrain terraces (the hill). Drawn back-to-front. ────────────────────────
// Each: polygon of grid corners at elevation z, plus a downhill "cliff" skirt.
const TERRACES = [
  { id: 'top',  z: 26, top: PAL.grassTop,  corners: [[-1,-1],[12,-1],[12,5],[-1,5]] },
  { id: 'mid',  z: 12, top: PAL.grassTop2, corners: [[-1,5],[13,5],[13,11],[-1,11]] },
  { id: 'low',  z: 0,  top: PAL.grassMid,  corners: [[-2,11],[15,11],[15,17],[-2,17]] },
];

// ── Buildings ────────────────────────────────────────────────────────────────
// cat drives the pin glyph. floors = number; the destination has detailed plan.
const BUILDINGS = [
  { id:'rect', name:'Rectoría',         short:'Rectoría',   cat:'admin',  mat:'navy',  gx:2,  gy:0, w:3, d:2, h:7,  z:26, floors:3 },
  { id:'med',  name:'Facultad de Medicina', short:'Medicina', cat:'fac',  mat:'white', gx:6,  gy:0, w:4, d:3, h:8,  z:26, floors:4 },
  { id:'cap',  name:'Capilla San Carlos', short:'Capilla',  cat:'chapel', mat:'beige', gx:-1, gy:2, w:2, d:2, h:6,  z:26, floors:1, spire:true },
  { id:'bib',  name:'Biblioteca',       short:'Biblioteca', cat:'library',mat:'sand',  gx:1,  gy:5, w:4, d:4, h:7,  z:12, floors:4 },
  { id:'cas',  name:'Casino Central',   short:'Casino',     cat:'food',   mat:'teal',  gx:6,  gy:5, w:3, d:2, h:5,  z:12, floors:2 },
  { id:'dis',  name:'Edificio Diseño',  short:'Diseño',     cat:'fac',    mat:'brick', gx:6,  gy:8, w:5, d:3, h:9,  z:12, floors:4, dest:true },
  { id:'gym',  name:'Gimnasio UDD',     short:'Gimnasio',   cat:'sport',  mat:'slate', gx:-1, gy:9, w:3, d:3, h:6,  z:0,  floors:2 },
  { id:'acc',  name:'Acceso Principal', short:'Acceso',     cat:'gate',   mat:'sand',  gx:3,  gy:11,w:2, d:1, h:3,  z:0,  floors:1 },
];

// Parking lots (flat) on the low terrace
const PARKING = [
  { id:'p1', name:'Estacionamiento P1', gx:8,  gy:11, w:5, d:5, z:0, total:120, free:14, trend:'subiendo' },
  { id:'p2', name:'Estacionamiento P2', gx:-2, gy:13, w:3, d:4, z:0, total:60,  free:3,  trend:'lleno' },
];

// Pedestrian paths (grid polylines on terrain). z follows nearest terrace.
const PATHS = [
  { z:0,  line:[[4,12],[5,11],[6,10]] },
  { z:12, line:[[6,10],[7,9],[8,8]] },
  { z:12, line:[[3,9],[4,8],[5,7],[6,6]] },
  { z:26, line:[[3,5],[4,4],[5,3]] },
];

// ── Social / events layer (anchored to a building id) ────────────────────────
const FRIENDS = [
  { id:'f1', name:'Benja',  at:'cas', color:'#E0533D', initials:'B' },
  { id:'f2', name:'Caro',   at:'bib', color:'#7A4FD6', initials:'C' },
  { id:'f3', name:'Tomás',  at:'dis', color:'#1F9D72', initials:'T' },
];
const EVENTS = [
  { id:'e1', kind:'Torneo LoL',   at:'cas', emoji:'🎮', when:'Ahora', host:'CAA Ingeniería' },
  { id:'e2', kind:'Venta de completos', at:'acc', emoji:'🌭', when:'12:30', host:'Mechones Diseño' },
  { id:'e3', kind:'Grupo de estudio', at:'bib', emoji:'📚', when:'15:00', host:'Cálculo I' },
];

// ── Detailed floor plans for the destination building (Edificio Diseño) ──────
// Local plan coordinate space ~ 320 x 360. type: room|hall|stair|wc|lift|void
const DIS_FLOORS = {
  4: { label:'P4', rooms:[
    { x:24,  y:24, w:130, h:92,  label:'401', type:'room', name:'Lab Computación' },
    { x:160, y:24, w:152, h:92,  label:'402', type:'room', name:'Oficina Decanato' },
    { x:24,  y:200,w:120, h:120, label:'403', type:'room', name:'Taller Animación' },
    { x:150, y:200,w:162, h:120, label:'Terraza P4', type:'room', name:'Terraza Diseño' },
    { x:24,  y:122,w:288, h:72,  label:'', type:'hall' },
    { x:150, y:130,w:40,  h:56,  label:'WC', type:'wc' },
    { x:196, y:130,w:36,  h:56,  label:'', type:'stair' },
    { x:238, y:130,w:36,  h:56,  label:'', type:'lift' },
  ]},
  3: { label:'P3', rooms:[
    { x:24,  y:24, w:120, h:92,  label:'301', type:'room', dest:true, name:'Taller Diseño I' },
    { x:150, y:24, w:84,  h:92,  label:'302', type:'room' },
    { x:240, y:24, w:72,  h:92,  label:'303', type:'room' },
    { x:24,  y:200,w:96,  h:120, label:'Lab Maqueta', type:'room' },
    { x:126, y:200,w:90,  h:120, label:'305', type:'room' },
    { x:222, y:200,w:90,  h:120, label:'306', type:'room' },
    { x:24,  y:122,w:288, h:72,  label:'', type:'hall' },
    { x:150, y:130,w:40,  h:56,  label:'WC', type:'wc' },
    { x:196, y:130,w:36,  h:56,  label:'', type:'stair' },
    { x:238, y:130,w:36,  h:56,  label:'', type:'lift' },
  ]},
  2: { label:'P2', rooms:[
    { x:24,  y:24, w:140, h:96,  label:'201', type:'room', name:'Sala Crítica' },
    { x:170, y:24, w:142, h:96,  label:'202', type:'room' },
    { x:24,  y:200,w:130, h:120, label:'Taller Madera', type:'room' },
    { x:160, y:200,w:152, h:120, label:'Taller Metal', type:'room' },
    { x:24,  y:126,w:288, h:68,  label:'', type:'hall' },
    { x:150, y:132,w:40,  h:56,  label:'WC', type:'wc' },
    { x:196, y:132,w:36,  h:56,  label:'', type:'stair' },
    { x:238, y:132,w:36,  h:56,  label:'', type:'lift' },
  ]},
  1: { label:'P1', rooms:[
    { x:24,  y:24, w:120, h:96,  label:'Hall', type:'room', name:'Hall de Acceso' },
    { x:150, y:24, w:162, h:96,  label:'Cafetería', type:'room' },
    { x:24,  y:200,w:288, h:120, label:'Auditorio A1', type:'room' },
    { x:24,  y:126,w:288, h:68,  label:'', type:'hall', entry:true },
    { x:196, y:132,w:36,  h:56,  label:'', type:'stair' },
    { x:238, y:132,w:36,  h:56,  label:'', type:'lift' },
  ]},
};

Object.assign(window, {
  PAL, ISO, iso, pts, faces, footprint, boxFaces,
  TERRACES, BUILDINGS, PARKING, PATHS, FRIENDS, EVENTS, DIS_FLOORS,
});
