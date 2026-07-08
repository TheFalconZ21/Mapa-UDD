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
    "ry": 0
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
  // For the new layout, we'll use a single flat green terrace as the campus base
  { id: 'base', z: -1, top: PAL.grassMid, corners: [[-30, -18], [30, -18], [30, 15], [-30, 15]] }
];

export const PATHS = [];
export const PARKING = [];
export const FRIENDS = [];
export const EVENTS = [];
export const DIS_FLOORS = {};
