import type { EventCategory, ActivityCategory, UserStatus } from '@/types/database';

// ── Campus Buildings ─────────────────────────────────────────────────────────
export const BUILDINGS = {
  rect: { id: 'rect', name: 'Rectoría', short: 'Rectoría' },
  med:  { id: 'med',  name: 'Facultad de Medicina', short: 'Medicina' },
  cap:  { id: 'cap',  name: 'Capilla San Carlos', short: 'Capilla' },
  bib:  { id: 'bib',  name: 'Biblioteca', short: 'Biblioteca' },
  cas:  { id: 'cas',  name: 'Casino Central', short: 'Casino' },
  dis:  { id: 'dis',  name: 'Edificio Diseño', short: 'Diseño' },
  gym:  { id: 'gym',  name: 'Gimnasio UDD', short: 'Gimnasio' },
  acc:  { id: 'acc',  name: 'Acceso Principal', short: 'Acceso' },
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
