export const PAL = {
  navy:    '#0A2A66',
  navy2:   '#06204F',
  blue:    '#1F6FD6',
  blueSoft:'#E8F0FB',
  ink:     '#15233B',
  sub:     '#5C6B82',
  line:    '#E4E8EF',
  surface: '#FFFFFF',
  canvas:  '#EAEFE6',
  grassTop:'#A7C97E',
  grassTop2:'#9BC06F',
  grassMid:'#7FA756',
  cliff:   '#6E5A43',
  cliff2:  '#5E4C38',
  path:    '#EDE7D8',
  pathEdge:'#DAD0BB',
  water:   '#9FD0DE',
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

export interface BuildingDef {
  id: string;
  name: string;
  short: string;
  cat: string;
  mat: keyof typeof PAL.mats;
  gx: number;
  gy: number;
  w: number;
  d: number;
  h: number;
  z: number;
  ry?: number; // Y rotation in radians
  floors?: number;
}

export const BUILDINGS: BuildingDef[] = [
  {
    "id": "A",
    "name": "Edificio A",
    "short": "A",
    "cat": "fac",
    "mat": "white",
    "gx": -3,
    "gy": 5,
    "w": 2.5,
    "d": 3,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "B",
    "name": "Edificio B",
    "short": "B",
    "cat": "fac",
    "mat": "white",
    "gx": -0.5,
    "gy": 5,
    "w": 9.5,
    "d": 3,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "C",
    "name": "Edificio C",
    "short": "C",
    "cat": "fac",
    "mat": "white",
    "gx": 9,
    "gy": 5,
    "w": 2.5,
    "d": 3,
    "h": 1.2,
    "z": 0,
    "ry": 0
  },
  {
    "id": "D",
    "name": "Edificio D",
    "short": "D",
    "cat": "fac",
    "mat": "white",
    "gx": 11.5,
    "gy": 5,
    "w": 4.5,
    "d": 3,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "E",
    "name": "Edificio E",
    "short": "E",
    "cat": "fac",
    "mat": "white",
    "gx": 16,
    "gy": 5,
    "w": 8.1,
    "d": 3,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "J",
    "name": "Edificio J",
    "short": "J",
    "cat": "fac",
    "mat": "white",
    "gx": 24,
    "gy": -7.2,
    "w": 5.9,
    "d": 10,
    "h": 12,
    "z": 0,
    "ry": 0
  },
  {
    "id": "G",
    "name": "Edificio G",
    "short": "G",
    "cat": "fac",
    "mat": "white",
    "gx": 0.5,
    "gy": -6.8,
    "w": 8,
    "d": 8.8,
    "h": 15,
    "z": 0,
    "ry": 0,
    "floors": 4
  },
  {
    "id": "H",
    "name": "Edificio H",
    "short": "H",
    "cat": "fac",
    "mat": "white",
    "gx": 8.5,
    "gy": -6.9,
    "w": 4.5,
    "d": 3.9,
    "h": 6.1,
    "z": 0,
    "ry": 0
  },
  {
    "id": "O1",
    "name": "Edificio O1",
    "short": "O1",
    "cat": "fac",
    "mat": "white",
    "gx": 13,
    "gy": -6.9,
    "w": 6.5,
    "d": 3.9,
    "h": 12.6,
    "z": 0,
    "ry": 0
  },
  {
    "id": "O2",
    "name": "Edificio O2",
    "short": "O2",
    "cat": "fac",
    "mat": "white",
    "gx": 19.5,
    "gy": -6.9,
    "w": 4.7,
    "d": 2.1,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "P",
    "name": "Edificio P",
    "short": "P",
    "cat": "fac",
    "mat": "white",
    "gx": -9,
    "gy": 4,
    "w": 3,
    "d": 4.5,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "Q",
    "name": "Edificio Q",
    "short": "Q",
    "cat": "fac",
    "mat": "white",
    "gx": -17,
    "gy": 4.5,
    "w": 8,
    "d": 3,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "R",
    "name": "Edificio R",
    "short": "R",
    "cat": "fac",
    "mat": "white",
    "gx": -18.2,
    "gy": 0.5,
    "w": 2.2,
    "d": 4,
    "h": 8,
    "z": 0,
    "ry": 0
  },
  {
    "id": "W",
    "name": "Edificio W",
    "short": "W",
    "cat": "fac",
    "mat": "white",
    "gx": -14.5,
    "gy": 0.1,
    "w": 2,
    "d": 2.2,
    "h": 3,
    "z": 0,
    "ry": 0
  },
  {
    "id": "V",
    "name": "Edificio V",
    "short": "V",
    "cat": "fac",
    "mat": "white",
    "gx": -12.5,
    "gy": 0.1,
    "w": 2,
    "d": 2.2,
    "h": 3,
    "z": 0,
    "ry": 0
  },
  {
    "id": "X",
    "name": "Edificio X",
    "short": "X",
    "cat": "fac",
    "mat": "white",
    "gx": -10.5,
    "gy": -0.3,
    "w": 2.7,
    "d": 2.6,
    "h": 3,
    "z": 0,
    "ry": 0
  },
  {
    "id": "I",
    "name": "Edificio I",
    "short": "I",
    "cat": "fac",
    "mat": "white",
    "gx": -11.1,
    "gy": -5.2,
    "w": 3,
    "d": 4.7,
    "h": 8,
    "z": 0,
    "ry": 0.02
  },
  {
    "id": "S",
    "name": "Edificio S",
    "short": "S",
    "cat": "fac",
    "mat": "white",
    "gx": -25.5,
    "gy": -4.9,
    "w": 13.9,
    "d": 3.5,
    "h": 12,
    "z": 0,
    "ry": 0.04
  },
  {
    "id": "Y",
    "name": "Edificio Y",
    "short": "Y",
    "cat": "fac",
    "mat": "white",
    "gx": -27.9,
    "gy": -14.9,
    "w": 11.4,
    "d": 3.5,
    "h": 12,
    "z": 0,
    "ry": 0.01
  },
  {
    "id": "K3",
    "name": "Edificio K3",
    "short": "K3",
    "cat": "fac",
    "mat": "white",
    "gx": -15.5,
    "gy": -16.8,
    "w": 3.4,
    "d": 1.9,
    "h": 3,
    "z": 0,
    "ry": 0
  },
  {
    "id": "K1",
    "name": "Edificio K1",
    "short": "K1",
    "cat": "fac",
    "mat": "white",
    "gx": -9.2,
    "gy": -16.8,
    "w": 10.9,
    "d": 2.5,
    "h": 3,
    "z": 0,
    "ry": -0.12
  }
];

export const TERRACES = [
  { id: 'base', z: -1, top: PAL.grassMid, corners: [[-30, -18], [30, -18], [30, 15], [-30, 15]] }
];

export const PATHS = [
  { z: 0, line: [[-22, 8], [-15, 8], [-9, 8], [-3, 8], [0, 8], [3, 8], [9, 8], [11.5, 8], [16, 8], [24, 8]] },
  { z: 0, line: [[-27.9, -3], [-18.2, -3], [-10.5, -3], [0.5, -3], [8.5, -3], [13, -3], [19.5, -3], [24, -3]] },
  { z: 0, line: [[-18.2, 8], [-18.2, 0.5], [-18.2, -3]] },
  { z: 0, line: [[-9.2, 8], [-9.2, 0.5], [-9.2, -3], [-9.2, -14.3]] },
  { z: 0, line: [[0.5, 8], [0.5, 3], [0.5, -3], [0.5, -6.8]] },
  { z: 0, line: [[8.5, 8], [8.5, 3], [8.5, -3], [8.5, -6.9]] },
  { z: 0, line: [[19.5, 8], [19.5, 3], [19.5, -3], [19.5, -6.9]] }
];

export const PARKING = [
  { id: 'p1', name: 'Estacionamiento P1', gx: 2, gy: -15, w: 5, d: 5, z: 0, total: 120, free: 14, trend: 'subiendo' },
  { id: 'p2', name: 'Estacionamiento P2', gx: -20, gy: -15, w: 4, d: 4, z: 0, total: 60, free: 3, trend: 'lleno' }
];

export const FRIENDS = [
  { id: 'f1', name: 'Benja', at: 'R', color: '#E0533D', initials: 'B' },
  { id: 'f2', name: 'Caro', at: 'H', color: '#7A4FD6', initials: 'C' },
  { id: 'f3', name: 'Tomás', at: 'A', color: '#1F9D72', initials: 'T' }
];

export const EVENTS = [
  { id: 'e1', kind: 'Torneo LoL', at: 'R', emoji: '🎮', when: 'Ahora', host: 'CAA Ingeniería' },
  { id: 'e2', kind: 'Venta de completos', at: 'A', emoji: '🌭', when: '12:30', host: 'Mechones Diseño' },
  { id: 'e3', kind: 'Grupo de estudio', at: 'H', emoji: '📚', when: '15:00', host: 'Cálculo I' }
];

export interface RoomDef {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  type: 'room' | 'hall' | 'wc' | 'stair' | 'lift' | 'void';
  name?: string;
  dest?: boolean;
  entry?: boolean;
}

export interface FloorDef {
  label: string;
  rooms: RoomDef[];
}

export const DIS_FLOORS: Record<number, FloorDef> = {
  4: { label: 'P4', rooms: [
    { x: 24,  y: 24, w: 130, h: 92,  label: '401', type: 'room', name: 'Lab Computación' },
    { x: 160, y: 24, w: 152, h: 92,  label: '402', type: 'room', name: 'Oficina Decanato' },
    { x: 24,  y: 200, w: 120, h: 120, label: '403', type: 'room', name: 'Taller Animación' },
    { x: 150, y: 200, w: 162, h: 120, label: 'Terraza P4', type: 'room', name: 'Terraza Diseño' },
    { x: 24,  y: 122, w: 288, h: 72,  label: '', type: 'hall' },
    { x: 150, y: 130, w: 40,  h: 56,  label: 'WC', type: 'wc' },
    { x: 196, y: 130, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 130, w: 36,  h: 56,  label: '', type: 'lift' }
  ]},
  3: { label: 'P3', rooms: [
    { x: 24,  y: 24, w: 120, h: 92,  label: '301', type: 'room', name: 'Taller Diseño I', dest: true },
    { x: 150, y: 24, w: 84,  h: 92,  label: '302', type: 'room' },
    { x: 240, y: 24, w: 72,  h: 92,  label: '303', type: 'room' },
    { x: 24,  y: 200, w: 96,  h: 120, label: 'Lab Maqueta', type: 'room' },
    { x: 126, y: 200, w: 90,  h: 120, label: '305', type: 'room' },
    { x: 222, y: 200, w: 90,  h: 120, label: '306', type: 'room' },
    { x: 24,  y: 122, w: 288, h: 72,  label: '', type: 'hall' },
    { x: 150, y: 130, w: 40,  h: 56,  label: 'WC', type: 'wc' },
    { x: 196, y: 130, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 130, w: 36,  h: 56,  label: '', type: 'lift' }
  ]},
  2: { label: 'P2', rooms: [
    { x: 24,  y: 24, w: 140, h: 96,  label: '201', type: 'room', name: 'Sala Crítica' },
    { x: 170, y: 24, w: 142, h: 96,  label: '202', type: 'room' },
    { x: 24,  y: 200, w: 130, h: 120, label: 'Taller Madera', type: 'room' },
    { x: 160, y: 200, w: 152, h: 120, label: 'Taller Metal', type: 'room' },
    { x: 24,  y: 126, w: 288, h: 68,  label: '', type: 'hall' },
    { x: 150, y: 132, w: 40,  h: 56,  label: 'WC', type: 'wc' },
    { x: 196, y: 132, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 132, w: 36,  h: 56,  label: '', type: 'lift' }
  ]},
  1: { label: 'P1', rooms: [
    { x: 24,  y: 24, w: 120, h: 96,  label: 'Hall', type: 'room', name: 'Hall de Acceso' },
    { x: 150, y: 24, w: 162, h: 96,  label: 'Cafetería', type: 'room' },
    { x: 24,  y: 200, w: 288, h: 120, label: 'Auditorio A1', type: 'room' },
    { x: 24,  y: 126, w: 288, h: 68,  label: '', type: 'hall', entry: true },
    { x: 196, y: 132, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 132, w: 36,  h: 56,  label: '', type: 'lift' }
  ]}
};

export const G_FLOORS: Record<number, FloorDef> = {
  4: { label: 'P4', rooms: [
    { x: 24,  y: 24, w: 140, h: 92,  label: 'Yoga', type: 'room', name: 'Sala Yoga & Pilates' },
    { x: 170, y: 24, w: 142, h: 92,  label: 'Dojo', type: 'room', name: 'Sala Artes Marciales' },
    { x: 24,  y: 200, w: 110, h: 120, label: 'Café Fit', type: 'room', name: 'Nutrición & Snack' },
    { x: 140, y: 200, w: 172, h: 120, label: 'Terraza G', type: 'room', name: 'Mirador Deportivo' },
    { x: 24,  y: 122, w: 288, h: 72,  label: '', type: 'hall' },
    { x: 150, y: 130, w: 40,  h: 56,  label: 'WC', type: 'wc' },
    { x: 196, y: 130, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 130, w: 36,  h: 56,  label: '', type: 'lift' }
  ]},
  3: { label: 'P3', rooms: [
    { x: 24,  y: 24, w: 150, h: 92,  label: 'Cardio', type: 'room', name: 'Área Cardiovascular' },
    { x: 180, y: 24, w: 132, h: 92,  label: 'Crossfit', type: 'room', name: 'Zona Entrenamiento Funcional' },
    { x: 24,  y: 200, w: 180, h: 120, label: 'Pesas', type: 'room', name: 'Sala de Musculación', dest: true },
    { x: 210, y: 200, w: 102, h: 120, label: 'Kine G', type: 'room', name: 'Box Rehabilitación' },
    { x: 24,  y: 122, w: 288, h: 72,  label: '', type: 'hall' },
    { x: 150, y: 130, w: 40,  h: 56,  label: 'WC', type: 'wc' },
    { x: 196, y: 130, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 130, w: 36,  h: 56,  label: '', type: 'lift' }
  ]},
  2: { label: 'P2', rooms: [
    { x: 24,  y: 24, w: 288, h: 96,  label: 'Cancha', type: 'room', name: 'Gimnasio Multiuso Superior' },
    { x: 24,  y: 200, w: 150, h: 120, label: 'Spinning', type: 'room', name: 'Sala de Ciclismo Indoor' },
    { x: 180, y: 200, w: 132, h: 120, label: 'Oficinas', type: 'room', name: 'Dirección Deportes' },
    { x: 24,  y: 126, w: 288, h: 68,  label: '', type: 'hall' },
    { x: 150, y: 132, w: 40,  h: 56,  label: 'WC', type: 'wc' },
    { x: 196, y: 132, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 132, w: 36,  h: 56,  label: '', type: 'lift' }
  ]},
  1: { label: 'P1', rooms: [
    { x: 24,  y: 24, w: 150, h: 96,  label: 'Recepción', type: 'room', name: 'Acceso Principal' },
    { x: 180, y: 24, w: 132, h: 96,  label: 'Enfermería', type: 'room', name: 'Atención Médica UDD' },
    { x: 24,  y: 200, w: 138, h: 120, label: 'Camarín D', type: 'room', name: 'Camarines Damas' },
    { x: 174, y: 200, w: 138, h: 120, label: 'Camarín V', type: 'room', name: 'Camarines Varones' },
    { x: 24,  y: 126, w: 288, h: 68,  label: '', type: 'hall', entry: true },
    { x: 196, y: 132, w: 36,  h: 56,  label: '', type: 'stair' },
    { x: 238, y: 132, w: 36,  h: 56,  label: '', type: 'lift' }
  ]}
};
