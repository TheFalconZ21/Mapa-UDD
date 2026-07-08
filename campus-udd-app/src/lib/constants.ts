import type { EventCategory, ActivityCategory, UserStatus } from '@/types/database';

// ── Campus Buildings ─────────────────────────────────────────────────────────
export const BUILDINGS = {
  A: { id: 'A', name: 'Edificio A', short: 'Edificio A', cat: 'fac' },
  B: { id: 'B', name: 'Edificio B', short: 'Edificio B', cat: 'fac' },
  C: { id: 'C', name: 'Edificio C', short: 'Edificio C', cat: 'chapel' },
  D: { id: 'D', name: 'Edificio D (Rectoría)', short: 'Rectoría', cat: 'admin' },
  E: { id: 'E', name: 'Edificio E', short: 'Edificio E', cat: 'fac' },
  J: { id: 'J', name: 'Edificio J (Postgrados)', short: 'Edificio J', cat: 'admin' },
  G: { id: 'G', name: 'Edificio G (Gimnasio)', short: 'Gimnasio', cat: 'sport' },
  H: { id: 'H', name: 'Edificio H (Diseño)', short: 'Diseño', cat: 'fac' },
  O1: { id: 'O1', name: 'Edificio O1', short: 'Edificio O1', cat: 'fac' },
  O2: { id: 'O2', name: 'Edificio O2', short: 'Edificio O2', cat: 'fac' },
  P: { id: 'P', name: 'Edificio P', short: 'Edificio P', cat: 'fac' },
  Q: { id: 'Q', name: 'Edificio Q', short: 'Edificio Q', cat: 'fac' },
  R: { id: 'R', name: 'Edificio R (Biblioteca)', short: 'Biblioteca', cat: 'library' },
  W: { id: 'W', name: 'Edificio W', short: 'Edificio W', cat: 'fac' },
  V: { id: 'V', name: 'Edificio V', short: 'Edificio V', cat: 'fac' },
  X: { id: 'X', name: 'Edificio X', short: 'Edificio X', cat: 'fac' },
  I: { id: 'I', name: 'Edificio I (Medicina)', short: 'Medicina', cat: 'fac' },
  S: { id: 'S', name: 'Edificio S', short: 'Edificio S', cat: 'fac' },
  Y: { id: 'Y', name: 'Edificio Y', short: 'Edificio Y', cat: 'fac' },
  K3: { id: 'K3', name: 'Edificio K3', short: 'Edificio K3', cat: 'fac' },
  K1: { id: 'K1', name: 'Edificio K1', short: 'Edificio K1', cat: 'fac' },
} as const;

export type BuildingId = keyof typeof BUILDINGS;

// ── Status labels & colors ───────────────────────────────────────────────────
export const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; dot: string }> = {
  available: { label: 'Disponible', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  in_class:  { label: 'En clases', color: 'text-amber-600', dot: 'bg-amber-500' },
  studying:  { label: 'Estudiando', color: 'text-blue-600', dot: 'bg-blue-500' },
  busy:      { label: 'Ocupado', color: 'text-red-600', dot: 'bg-red-500' },
  offline:   { label: 'Desconectado', color: 'text-slate-400', dot: 'bg-slate-400' },
};

// ── Event category labels & icons ────────────────────────────────────────────
export const EVENT_CATEGORIES: Record<EventCategory, { label: string; emoji: string; color: string }> = {
  academic:     { label: 'Académico', emoji: '🎓', color: 'bg-blue-100 text-blue-700' },
  sports:       { label: 'Deportivo', emoji: '⚽', color: 'bg-green-100 text-green-700' },
  cultural:     { label: 'Cultural', emoji: '🎭', color: 'bg-purple-100 text-purple-700' },
  party:        { label: 'Fiesta', emoji: '🎉', color: 'bg-pink-100 text-pink-700' },
  volunteering: { label: 'Voluntariado', emoji: '🤝', color: 'bg-amber-100 text-amber-700' },
  networking:   { label: 'Networking', emoji: '🔗', color: 'bg-cyan-100 text-cyan-700' },
  other:        { label: 'Otros', emoji: '📌', color: 'bg-slate-100 text-slate-700' },
};

// ── Activity category labels ─────────────────────────────────────────────────
export const ACTIVITY_CATEGORIES: Record<ActivityCategory, { label: string; emoji: string }> = {
  study:   { label: 'Estudio', emoji: '📚' },
  meeting: { label: 'Reunión', emoji: '🤝' },
  project: { label: 'Proyecto', emoji: '💻' },
  lunch:   { label: 'Almuerzo', emoji: '🍽️' },
  sport:   { label: 'Deporte', emoji: '🏀' },
};

// ── Day labels ───────────────────────────────────────────────────────────────
export const DAY_LABELS = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
} as const;

// ── Careers ──────────────────────────────────────────────────────────────────
export const CAREERS = [
  'Ing. Civil Informática',
  'Ing. Civil Industrial',
  'Ing. Civil en Obras Civiles',
  'Ing. Comercial',
  'Arquitectura',
  'Diseño',
  'Medicina',
  'Odontología',
  'Enfermería',
  'Kinesiología',
  'Psicología',
  'Periodismo',
  'Publicidad',
  'Derecho',
  'Ciencias Políticas',
] as const;
