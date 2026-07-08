// ── Types ────────────────────────────────────────────────────────────────────

export type Tag = { label: string; count: number };

export type CourseRating = {
  courseId: string;
  code: string;
  name: string;
  avgRating: number;
  reviewCount: number;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  tags: string[];
  courseName: string;
  isAnonymous: boolean;
  studentName?: string;
  createdAt: string;
};

export type Professor = {
  id: string;
  fullName: string;
  title: string;
  department: string;
  bio: string;
  avatarColor: string;
  avgRating: number;
  reviewCount: number;
  topTags: Tag[];
  courseRatings: CourseRating[];
  reviews: Review[];
};

export type Course = {
  id: string;
  code: string;
  name: string;
};

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const PROFESSORS: Professor[] = [
  {
    id: '1',
    fullName: 'Andrés Villalobos',
    title: 'Dr.',
    department: 'Ingeniería y Ciencias',
    bio: 'Doctor en Matemáticas Aplicadas por la PUC. Especialista en análisis numérico y métodos computacionales. 15 años de experiencia docente en UDD.',
    avatarColor: 'bg-blue-500',
    avgRating: 4.8,
    reviewCount: 64,
    topTags: [
      { label: 'Claro', count: 48 },
      { label: 'Exigente', count: 39 },
      { label: 'Apasionado', count: 31 },
      { label: 'Justo', count: 27 },
      { label: 'Organizado', count: 22 },
    ],
    courseRatings: [
      { courseId: 'cal1', code: 'MAT101', name: 'Cálculo I', avgRating: 4.9, reviewCount: 38 },
      { courseId: 'alg', code: 'MAT201', name: 'Álgebra Lineal', avgRating: 4.7, reviewCount: 26 },
    ],
    reviews: [
      { id: 'r1', rating: 5, comment: 'El mejor profesor de Cálculo que he tenido. Explica cada concepto desde cero y se asegura que todos entiendan antes de avanzar.', tags: ['Claro', 'Apasionado'], courseName: 'Cálculo I', isAnonymous: true, createdAt: 'hace 2 días' },
      { id: 'r2', rating: 5, comment: 'Muy exigente pero siempre justo. Las notas reflejan exactamente tu nivel de comprensión.', tags: ['Exigente', 'Justo'], courseName: 'Álgebra Lineal', isAnonymous: true, createdAt: 'hace 1 semana' },
      { id: 'r3', rating: 4, comment: 'Excelente didáctica, aunque a veces va rápido en las clases magistrales.', tags: ['Claro', 'Organizado'], courseName: 'Cálculo I', isAnonymous: false, studentName: 'Felipe M.', createdAt: 'hace 2 semanas' },
    ],
  },
  {
    id: '2',
    fullName: 'Camila Rojas',
    title: 'Dra.',
    department: 'Diseño',
    bio: 'Doctora en Diseño por la Universidad de Barcelona. Investigadora en diseño sostenible y experiencia de usuario. Directora del laboratorio UX-UDD.',
    avatarColor: 'bg-rose-500',
    avgRating: 4.6,
    reviewCount: 41,
    topTags: [
      { label: 'Dinámica', count: 33 },
      { label: 'Simpática', count: 29 },
      { label: 'Innovadora', count: 24 },
      { label: 'Práctica', count: 21 },
      { label: 'Disponible', count: 18 },
    ],
    courseRatings: [
      { courseId: 'dis1', code: 'DIS101', name: 'Diseño I', avgRating: 4.8, reviewCount: 22 },
      { courseId: 'hda', code: 'DIS201', name: 'Historia del Arte', avgRating: 4.3, reviewCount: 19 },
    ],
    reviews: [
      { id: 'r4', rating: 5, comment: 'Las clases son increíbles, siempre con casos reales de la industria. Te dan ganas de diseñar.', tags: ['Dinámica', 'Innovadora'], courseName: 'Diseño I', isAnonymous: true, createdAt: 'hace 3 días' },
      { id: 'r5', rating: 4, comment: 'Muy buena profesora. El ritmo de Historia del Arte podría ser más lento al inicio.', tags: ['Simpática', 'Disponible'], courseName: 'Historia del Arte', isAnonymous: true, createdAt: 'hace 1 mes' },
    ],
  },
  {
    id: '3',
    fullName: 'Felipe Mendoza',
    title: 'Prof.',
    department: 'Ciencias Básicas',
    bio: 'Magíster en Estadística por la Universidad de Chile. Docente con enfoque en aprendizaje activo y resolución de problemas aplicados al mundo real.',
    avatarColor: 'bg-emerald-500',
    avgRating: 4.3,
    reviewCount: 29,
    topTags: [
      { label: 'Claro', count: 22 },
      { label: 'Puntual', count: 20 },
      { label: 'Organizado', count: 17 },
      { label: 'Teórico', count: 14 },
    ],
    courseRatings: [
      { courseId: 'cal1', code: 'MAT101', name: 'Cálculo I', avgRating: 4.5, reviewCount: 16 },
      { courseId: 'est1', code: 'EST101', name: 'Estadística', avgRating: 4.1, reviewCount: 13 },
    ],
    reviews: [
      { id: 'r6', rating: 4, comment: 'Muy ordenado en su forma de enseñar. Los apuntes que entrega son excelentes.', tags: ['Organizado', 'Claro'], courseName: 'Cálculo I', isAnonymous: true, createdAt: 'hace 4 días' },
      { id: 'r7', rating: 5, comment: 'El mejor profe de Estadística, lo explica con ejemplos prácticos y reales.', tags: ['Claro', 'Práctico'], courseName: 'Estadística', isAnonymous: true, createdAt: 'hace 2 semanas' },
    ],
  },
  {
    id: '4',
    fullName: 'Valentina Torres',
    title: 'Dra.',
    department: 'Arquitectura y Arte',
    bio: 'Doctora en Arquitectura por la Universidad Politécnica de Madrid. Especialista en arquitectura bioclimática y diseño urbano sostenible.',
    avatarColor: 'bg-violet-500',
    avgRating: 4.7,
    reviewCount: 53,
    topTags: [
      { label: 'Apasionada', count: 41 },
      { label: 'Exigente', count: 35 },
      { label: 'Claro', count: 30 },
      { label: 'Innovadora', count: 25 },
      { label: 'Justo', count: 20 },
    ],
    courseRatings: [
      { courseId: 'arq1', code: 'ARQ101', name: 'Arquitectura I', avgRating: 4.9, reviewCount: 28 },
      { courseId: 'dis1', code: 'DIS101', name: 'Diseño I', avgRating: 4.5, reviewCount: 25 },
    ],
    reviews: [
      { id: 'r8', rating: 5, comment: 'Valentina transforma cada clase en una experiencia. Su pasión por la arquitectura es completamente contagiosa.', tags: ['Apasionada', 'Innovadora'], courseName: 'Arquitectura I', isAnonymous: true, createdAt: 'hace 1 semana' },
      { id: 'r9', rating: 4, comment: 'Muy exigente pero te hace crecer muchísimo como diseñador.', tags: ['Exigente', 'Justo'], courseName: 'Diseño I', isAnonymous: false, studentName: 'Ignacio R.', createdAt: 'hace 3 semanas' },
    ],
  },
  {
    id: '5',
    fullName: 'Ricardo Soto',
    title: 'Prof.',
    department: 'Tecnologías de la Información',
    bio: 'Magíster en Ingeniería de Software. Consultor senior con 10 años de experiencia en empresas de tecnología. Docente orientado 100% a la práctica.',
    avatarColor: 'bg-cyan-500',
    avgRating: 4.1,
    reviewCount: 22,
    topTags: [
      { label: 'Práctico', count: 18 },
      { label: 'Accesible', count: 15 },
      { label: 'Desafiante', count: 12 },
      { label: 'Dinámico', count: 10 },
    ],
    courseRatings: [
      { courseId: 'prog1', code: 'INF101', name: 'Programación', avgRating: 4.2, reviewCount: 14 },
      { courseId: 'cal1', code: 'MAT101', name: 'Cálculo I', avgRating: 3.9, reviewCount: 8 },
    ],
    reviews: [
      { id: 'r10', rating: 4, comment: 'Muy buenas clases, siempre con ejemplos del mundo real. A veces se va por las ramas pero es interesante.', tags: ['Práctico', 'Dinámico'], courseName: 'Programación', isAnonymous: true, createdAt: 'hace 5 días' },
    ],
  },
  {
    id: '6',
    fullName: 'Matías Herrera',
    title: 'Dr.',
    department: 'Negocios y Economía',
    bio: 'Doctor en Economía por la UAI. Investigador en economía conductual y política pública. Consultor del Ministerio de Economía de Chile.',
    avatarColor: 'bg-amber-500',
    avgRating: 3.8,
    reviewCount: 17,
    topTags: [
      { label: 'Teórico', count: 14 },
      { label: 'Exigente', count: 11 },
      { label: 'Organizado', count: 9 },
    ],
    courseRatings: [
      { courseId: 'eco1', code: 'ECO101', name: 'Economía', avgRating: 3.9, reviewCount: 10 },
      { courseId: 'est1', code: 'EST101', name: 'Estadística', avgRating: 3.7, reviewCount: 7 },
    ],
    reviews: [
      { id: 'r11', rating: 4, comment: 'El contenido es muy interesante pero las clases son muy densas. Hay que estudiar harto fuera.', tags: ['Teórico', 'Exigente'], courseName: 'Economía', isAnonymous: true, createdAt: 'hace 2 semanas' },
    ],
  },
  {
    id: '7',
    fullName: 'Sofía Castro',
    title: 'Dra.',
    department: 'Ciencias Sociales',
    bio: 'Doctora en Psicología Organizacional. Especialista en bienestar estudiantil y psicología positiva aplicada al aprendizaje universitario.',
    avatarColor: 'bg-teal-500',
    avgRating: 4.5,
    reviewCount: 35,
    topTags: [
      { label: 'Empática', count: 30 },
      { label: 'Claro', count: 26 },
      { label: 'Disponible', count: 23 },
      { label: 'Motivadora', count: 19 },
    ],
    courseRatings: [
      { courseId: 'psi1', code: 'PSI101', name: 'Psicología', avgRating: 4.6, reviewCount: 35 },
    ],
    reviews: [
      { id: 'r12', rating: 5, comment: 'La profe Castro es increíble. Siempre dispuesta a ayudar y explica con mucha claridad y empatía.', tags: ['Empática', 'Disponible'], courseName: 'Psicología', isAnonymous: true, createdAt: 'hace 1 semana' },
    ],
  },
  {
    id: '8',
    fullName: 'Diego Morales',
    title: 'Prof.',
    department: 'Matemáticas y Estadística',
    bio: 'Magíster en Estadística Computacional. Especialista en machine learning aplicado y análisis de datos para negocios y ciencia.',
    avatarColor: 'bg-indigo-500',
    avgRating: 3.6,
    reviewCount: 14,
    topTags: [
      { label: 'Detallista', count: 11 },
      { label: 'Teórico', count: 9 },
      { label: 'Exigente', count: 8 },
    ],
    courseRatings: [
      { courseId: 'est1', code: 'EST101', name: 'Estadística', avgRating: 3.7, reviewCount: 9 },
      { courseId: 'eco1', code: 'ECO101', name: 'Economía', avgRating: 3.5, reviewCount: 5 },
    ],
    reviews: [
      { id: 'r13', rating: 3, comment: 'El contenido es bueno pero el profesor va muy rápido y no se detiene cuando hay dudas.', tags: ['Teórico', 'Detallista'], courseName: 'Estadística', isAnonymous: true, createdAt: 'hace 1 mes' },
    ],
  },
];

export const COURSES: Course[] = [
  { id: 'cal1', code: 'MAT101', name: 'Cálculo I' },
  { id: 'alg', code: 'MAT201', name: 'Álgebra Lineal' },
  { id: 'est1', code: 'EST101', name: 'Estadística' },
  { id: 'prog1', code: 'INF101', name: 'Programación' },
  { id: 'eco1', code: 'ECO101', name: 'Economía' },
  { id: 'dis1', code: 'DIS101', name: 'Diseño I' },
  { id: 'hda', code: 'DIS201', name: 'Historia del Arte' },
  { id: 'arq1', code: 'ARQ101', name: 'Arquitectura I' },
  { id: 'psi1', code: 'PSI101', name: 'Psicología' },
];

export const ALL_TAGS = [
  'Claro', 'Exigente', 'Simpático', 'Puntual', 'Organizado',
  'Desafiante', 'Justo', 'Disponible', 'Dinámico', 'Teórico',
  'Práctico', 'Innovador', 'Apasionado', 'Empático', 'Motivador',
];

export const DEPARTMENTS = [
  'Todos',
  'Ingeniería y Ciencias',
  'Diseño',
  'Ciencias Básicas',
  'Arquitectura y Arte',
  'Tecnologías de la Información',
  'Negocios y Economía',
  'Ciencias Sociales',
  'Matemáticas y Estadística',
];

export function getTop3ByCourse(courseId: string) {
  const results: { professor: Professor; avgRating: number; reviewCount: number }[] = [];
  for (const prof of PROFESSORS) {
    const course = prof.courseRatings.find(c => c.courseId === courseId);
    if (course && course.reviewCount >= 5) {
      results.push({ professor: prof, avgRating: course.avgRating, reviewCount: course.reviewCount });
    }
  }
  return results.sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
}

// Courses that have at least 2 professors teaching them (eligible for Top 3)
export const TOP3_COURSES = COURSES.filter(c =>
  PROFESSORS.filter(p => p.courseRatings.some(r => r.courseId === c.id && r.reviewCount >= 5)).length >= 2
);
