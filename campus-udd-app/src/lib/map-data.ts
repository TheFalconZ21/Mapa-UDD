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
  // Front row (A is separate, B-C-D-E are contiguous/spaced)
  { id: 'A', name: 'Edificio A', short: 'A', cat: 'fac', mat: 'white', gx: -3.0, gy: 5.0, w: 2.5, d: 3.0, h: 4.5, z: 0, ry: 0.0 },
  { id: 'B', name: 'Edificio B', short: 'B', cat: 'fac', mat: 'white', gx: -0.5, gy: 5.0, w: 9.5, d: 3.0, h: 4.5, z: 0, ry: 0.0 },
  { id: 'C', name: 'Edificio C', short: 'C', cat: 'fac', mat: 'white', gx: 9.0,  gy: 5.0, w: 2.5, d: 3.0, h: 3.0, z: 0, ry: 0.0 },
  { id: 'D', name: 'Edificio D', short: 'D', cat: 'fac', mat: 'white', gx: 11.5, gy: 5.0, w: 4.5, d: 3.0, h: 4.0, z: 0, ry: 0.0 },
  { id: 'E', name: 'Edificio E', short: 'E', cat: 'fac', mat: 'white', gx: 16.0, gy: 5.0, w: 6.5, d: 3.0, h: 4.0, z: 0, ry: 0.0 },

  // Right side (J) - connected at the corner of O2, angled
  { id: 'J', name: 'Edificio J', short: 'J', cat: 'fac', mat: 'white', gx: 24.2, gy: -2.5, w: 2.5, d: 9.0, h: 4.0, z: 0, ry: -0.5 },

  // Middle section (G, H, O1, O2) - G is massive, contiguous chain G-H-O1-O2
  { id: 'G', name: 'Edificio G', short: 'G', cat: 'fac', mat: 'white', gx: 0.5,  gy: -4.5, w: 8.0, d: 7.5, h: 5.5, z: 0, ry: 0.0 },
  { id: 'H', name: 'Edificio H', short: 'H', cat: 'fac', mat: 'white', gx: 8.5,  gy: -4.5, w: 4.5, d: 3.0, h: 4.0, z: 0, ry: 0.0 },
  { id: 'O1', name: 'Edificio O1', short: 'O1', cat: 'fac', mat: 'white', gx: 13.0, gy: -4.5, w: 6.5, d: 3.0, h: 4.0, z: 0, ry: 0.0 },
  { id: 'O2', name: 'Edificio O2', short: 'O2', cat: 'fac', mat: 'white', gx: 19.5, gy: -4.5, w: 3.5, d: 2.0, h: 4.0, z: 0, ry: 0.0 },

  // Left section (P, Q, R) - P and Q are connected, R is vertical from Q
  { id: 'P', name: 'Edificio P', short: 'P', cat: 'fac', mat: 'white', gx: -9.0,  gy: 4.0,  w: 3.0, d: 4.5, h: 4.0, z: 0, ry: 0.0 },
  { id: 'Q', name: 'Edificio Q', short: 'Q', cat: 'fac', mat: 'white', gx: -17.0, gy: 4.5,  w: 8.0, d: 3.0, h: 4.0, z: 0, ry: 0.0 },
  { id: 'R', name: 'Edificio R', short: 'R', cat: 'fac', mat: 'white', gx: -18.2, gy: 0.5,  w: 2.2, d: 4.0, h: 4.0, z: 0, ry: 0.0 },

  // Behind left section (W, V, X) - side-by-side above Q
  { id: 'W', name: 'Edificio W', short: 'W', cat: 'fac', mat: 'white', gx: -14.5, gy: 1.0, w: 2.0, d: 2.2, h: 3.0, z: 0, ry: 0.0 },
  { id: 'V', name: 'Edificio V', short: 'V', cat: 'fac', mat: 'white', gx: -12.5, gy: 1.0, w: 2.0, d: 2.2, h: 3.0, z: 0, ry: 0.0 },
  { id: 'X', name: 'Edificio X', short: 'X', cat: 'fac', mat: 'white', gx: -10.5, gy: 1.2, w: 2.5, d: 2.0, h: 3.0, z: 0, ry: 0.0 },
  { id: 'I', name: 'Edificio I', short: 'I', cat: 'fac', mat: 'white', gx: -9.5,  gy: -3.0, w: 3.0, d: 4.0, h: 4.0, z: 0, ry: 0.0 },

  // S and I - S is angled above R, Q, W
  { id: 'S', name: 'Edificio S', short: 'S', cat: 'fac', mat: 'white', gx: -20.5, gy: -4.0, w: 9.0, d: 3.5, h: 4.0, z: 0, ry: 0.2 },

  // Back row (Y, K3, K1) - Y is angled, K3 and K1 are side-by-side
  { id: 'Y', name: 'Edificio Y', short: 'Y', cat: 'fac', mat: 'white', gx: -20.0, gy: -9.5, w: 8.5, d: 3.5, h: 4.0, z: 0, ry: 0.2 },
  { id: 'K3', name: 'Edificio K3', short: 'K3', cat: 'fac', mat: 'white', gx: -10.5, gy: -6.5, w: 3.5, d: 3.0, h: 3.0, z: 0, ry: 0.0 },
  { id: 'K1', name: 'Edificio K1', short: 'K1', cat: 'fac', mat: 'white', gx: -6.5,  gy: -6.0, w: 6.5, d: 2.5, h: 3.0, z: 0, ry: 0.0 },
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
