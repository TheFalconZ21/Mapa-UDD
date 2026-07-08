import { PROFESSORS } from '@/app/(main)/docentes/_components/mock-data';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProgramUnit = { id: number; title: string };

export type TipSource = {
  id: string;
  type: 'url' | 'book' | 'guide' | 'video';
  title: string;
  url?: string;
  author?: string;
  edition?: string;
};

export type CourseTip = {
  id: string;
  content: string;
  voteCount: number;
  isPinned: boolean;
  isAnonymous: boolean;
  studentName?: string;
  avatarColor?: string;
  sources: TipSource[];
  createdAt: string;
};

export type MaterialCategory = 'exam' | 'notes' | 'book' | 'guide' | 'other';

export type StudyMaterial = {
  id: string;
  title: string;
  description?: string;
  category: MaterialCategory;
  unitLabel?: string;
  fileName?: string;
  fileSizeBytes?: number;
  externalUrl?: string;
  examSemester?: string;
  examYear?: number;
  author?: string;
  voteCount: number;
  downloadCount: number;
  isAnonymous: boolean;
  studentName?: string;
  avatarColor?: string;
  createdAt: string;
};

export type RamoCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  career: string;
  description: string;
  programUnits: ProgramUnit[];
  tipCount: number;
  materialCount: number;
  tips: CourseTip[];
  materials: StudyMaterial[];
};

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const RAMOS: RamoCourse[] = [
  {
    id: 'cal1',
    code: 'MAT101',
    name: 'Cálculo I',
    credits: 5,
    career: 'Ingeniería y Ciencias',
    description:
      'Introducción al cálculo diferencial e integral de funciones de una variable. Desarrolla el pensamiento analítico y la capacidad de modelar fenómenos continuos. Es la base matemática de todas las asignaturas de ingeniería.',
    programUnits: [
      { id: 1, title: 'Unidad 1 — Límites y Continuidad' },
      { id: 2, title: 'Unidad 2 — Derivadas' },
      { id: 3, title: 'Unidad 3 — Aplicaciones de la Derivada' },
      { id: 4, title: 'Unidad 4 — Integrales' },
      { id: 5, title: 'Unidad 5 — Aplicaciones de la Integral' },
    ],
    tipCount: 5,
    materialCount: 7,
    tips: [
      {
        id: 't1',
        content:
          'El secreto para pasar Cálculo I es hacer el problemario oficial de la UDD de principio a fin al menos dos veces antes de cada certamen. El profe Villalobos saca los enunciados casi idénticos. No te saltes los ejercicios de derivadas implícitas, siempre caen en el certamen 2.',
        voteCount: 54,
        isPinned: true,
        isAnonymous: true,
        sources: [
          { id: 's1', type: 'url', title: 'Problemario Oficial MAT101 UDD', url: 'https://canvas.udd.cl' },
          { id: 's2', type: 'video', title: '3Blue1Brown — Essence of Calculus', url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM' },
          { id: 's3', type: 'book', title: 'Cálculo', author: 'James Stewart', edition: '8va edición' },
        ],
        createdAt: 'hace 3 semanas',
      },
      {
        id: 't2',
        content:
          'Para integrales (Unidad 4) usa el método de la "hoja de referencia": escríbete en una hoja todas las fórmulas y métodos en orden. Al memorizar esa hoja entiendes el patrón. El canal de Khan Academy en español tiene videos cortos por técnica (sustitución, partes, fracciones parciales) que son más claros que el libro.',
        voteCount: 38,
        isPinned: false,
        isAnonymous: false,
        studentName: 'Ignacio R.',
        avatarColor: 'bg-indigo-500',
        sources: [
          { id: 's4', type: 'url', title: 'Khan Academy — Integrales', url: 'https://es.khanacademy.org/math/integral-calculus' },
        ],
        createdAt: 'hace 1 mes',
      },
      {
        id: 't3',
        content:
          'No estudies solo de memoria, entiende el concepto geométrico de la derivada antes de intentar cualquier ejercicio. El libro de Apostol es más riguroso que Stewart y te da una base mucho más sólida. Si tienes tiempo, léelo en paralelo.',
        voteCount: 27,
        isPinned: false,
        isAnonymous: true,
        sources: [
          { id: 's5', type: 'book', title: 'Calculus Vol. 1', author: 'Tom M. Apostol', edition: '2da edición' },
        ],
        createdAt: 'hace 2 meses',
      },
      {
        id: 't4',
        content:
          'Consejo práctico: en el certamen 1 siempre viene un ejercicio de límite con indeterminación 0/0. La regla de L\'Hôpital es tu mejor amiga pero recuerda verificar la condición. El profe descuenta si la aplicas sin justificar.',
        voteCount: 21,
        isPinned: false,
        isAnonymous: true,
        sources: [],
        createdAt: 'hace 2 meses',
      },
      {
        id: 't5',
        content:
          'Forma grupos de estudio de máximo 4 personas para el certamen final. Dividanse los temas, cada uno resuelve todos los ejercicios de su unidad y se los explica al resto. Es el método más eficiente que encontré.',
        voteCount: 15,
        isPinned: false,
        isAnonymous: false,
        studentName: 'Valentina S.',
        avatarColor: 'bg-rose-500',
        sources: [],
        createdAt: 'hace 3 meses',
      },
    ],
    materials: [
      { id: 'm1', title: 'Certamen 1 — 2024-1', description: 'Con pauta de corrección incluida', category: 'exam', unitLabel: 'Unidades 1-2', fileName: 'C1_MAT101_2024-1.pdf', fileSizeBytes: 1800000, examSemester: '2024-1', examYear: 2024, voteCount: 67, downloadCount: 312, isAnonymous: true, createdAt: 'hace 2 meses' },
      { id: 'm2', title: 'Certamen 2 — 2023-2', description: 'Incluye ejercicios de integración por partes', category: 'exam', unitLabel: 'Unidades 3-4', fileName: 'C2_MAT101_2023-2.pdf', fileSizeBytes: 2100000, examSemester: '2023-2', examYear: 2023, voteCount: 51, downloadCount: 248, isAnonymous: true, createdAt: 'hace 6 meses' },
      { id: 'm3', title: 'Apuntes completos del semestre', description: 'Resumen de todas las unidades con ejemplos resueltos', category: 'notes', unitLabel: 'Unidades 1-5', fileName: 'apuntes_MAT101_completo.pdf', fileSizeBytes: 5200000, voteCount: 89, downloadCount: 423, isAnonymous: false, studentName: 'Felipe M.', avatarColor: 'bg-emerald-500', createdAt: 'hace 4 meses' },
      { id: 'm4', title: 'Resumen Derivadas', description: 'Tabla de derivadas + reglas de diferenciación con demos', category: 'notes', unitLabel: 'Unidad 2 — Derivadas', fileName: 'resumen_derivadas.pdf', fileSizeBytes: 890000, voteCount: 44, downloadCount: 197, isAnonymous: true, createdAt: 'hace 3 meses' },
      { id: 'm5', title: 'Cálculo — James Stewart 8va ed.', description: 'Enlace al PDF oficial. El libro de referencia del curso.', category: 'book', unitLabel: 'Unidades 1-5', externalUrl: 'https://libgen.is', author: 'James Stewart', voteCount: 112, downloadCount: 534, isAnonymous: true, createdAt: 'hace 8 meses' },
      { id: 'm6', title: 'Guía de ejercicios — Integrales', description: '80 ejercicios ordenados por dificultad con soluciones', category: 'guide', unitLabel: 'Unidad 4 — Integrales', fileName: 'guia_integrales.pdf', fileSizeBytes: 3100000, voteCount: 58, downloadCount: 276, isAnonymous: true, createdAt: 'hace 5 meses' },
      { id: 'm7', title: 'Certamen de Recuperación — 2023-1', category: 'exam', unitLabel: 'Unidades 1-5', fileName: 'recuperacion_2023-1.pdf', fileSizeBytes: 1500000, examSemester: '2023-1', examYear: 2023, voteCount: 33, downloadCount: 189, isAnonymous: true, createdAt: 'hace 10 meses' },
    ],
  },
  {
    id: 'dis1',
    code: 'DIS101',
    name: 'Diseño I',
    credits: 4,
    career: 'Diseño',
    description:
      'Introducción a los fundamentos del diseño visual: composición, tipografía, color y forma. Los estudiantes desarrollan proyectos que exploran principios del diseño a través de técnicas tanto análogas como digitales.',
    programUnits: [
      { id: 1, title: 'Unidad 1 — Fundamentos del Diseño' },
      { id: 2, title: 'Unidad 2 — Tipografía' },
      { id: 3, title: 'Unidad 3 — Color y Forma' },
      { id: 4, title: 'Unidad 4 — Composición' },
      { id: 5, title: 'Unidad 5 — Proyecto Final' },
    ],
    tipCount: 4,
    materialCount: 5,
    tips: [
      {
        id: 't10',
        content: 'La Dra. Rojas valora mucho el proceso: guarda TODAS las versiones de tu trabajo, incluso las malas. En las entregas espera ver evolución, no solo el resultado final. Lleva tu cuaderno de bocetos a cada clase.',
        voteCount: 42,
        isPinned: true,
        isAnonymous: true,
        sources: [],
        createdAt: 'hace 2 semanas',
      },
      {
        id: 't11',
        content: 'Para tipografía, instala la fuente en tu computador y analiza su anatomía antes de usarla en un proyecto. El sitio Fonts In Use es increíble para ver cómo los diseñadores usan las tipografías en contextos reales.',
        voteCount: 31,
        isPinned: false,
        isAnonymous: false,
        studentName: 'Camila V.',
        avatarColor: 'bg-violet-500',
        sources: [
          { id: 's10', type: 'url', title: 'Fonts In Use', url: 'https://fontsinuse.com' },
          { id: 's11', type: 'book', title: 'Thinking with Type', author: 'Ellen Lupton', edition: '2da edición' },
        ],
        createdAt: 'hace 1 mes',
      },
      {
        id: 't12',
        content: 'Usa el libro "Fundamentos del Diseño" de Wucius Wong como referencia para la unidad de composición. Está en la biblioteca UDD digital. Para color, el plugin de Figma "Contrast" es esencial para verificar accesibilidad.',
        voteCount: 25,
        isPinned: false,
        isAnonymous: true,
        sources: [
          { id: 's12', type: 'book', title: 'Fundamentos del Diseño', author: 'Wucius Wong', edition: '3ra edición' },
          { id: 's13', type: 'url', title: 'Plugin Contrast para Figma', url: 'https://www.figma.com/community/plugin/748533339686535718' },
        ],
        createdAt: 'hace 6 semanas',
      },
      {
        id: 't13',
        content: 'No dejes el proyecto final para la última semana. La profe pone nota a cada entrega intermedia y esas notas pesan. Empieza el brief desde el primer día de la unidad 5.',
        voteCount: 19,
        isPinned: false,
        isAnonymous: true,
        sources: [],
        createdAt: 'hace 2 meses',
      },
    ],
    materials: [
      { id: 'm10', title: 'Pauta Proyecto Final 2024', category: 'guide', unitLabel: 'Unidad 5 — Proyecto Final', fileName: 'pauta_pf_2024.pdf', fileSizeBytes: 920000, voteCount: 78, downloadCount: 291, isAnonymous: true, createdAt: 'hace 1 mes' },
      { id: 'm11', title: 'Apuntes de Tipografía', description: 'Resumen de anatomía tipográfica y clasificaciones', category: 'notes', unitLabel: 'Unidad 2 — Tipografía', fileName: 'apuntes_tipografia.pdf', fileSizeBytes: 2400000, voteCount: 55, downloadCount: 178, isAnonymous: false, studentName: 'Martina L.', avatarColor: 'bg-pink-500', createdAt: 'hace 3 meses' },
      { id: 'm12', title: 'Thinking with Type — Ellen Lupton', category: 'book', unitLabel: 'Unidad 2 — Tipografía', externalUrl: 'https://www.thinkingwithtype.com', author: 'Ellen Lupton', voteCount: 91, downloadCount: 344, isAnonymous: true, createdAt: 'hace 5 meses' },
      { id: 'm13', title: 'Guía de Color y Contraste', description: 'Teoría del color aplicada al diseño + ejercicios', category: 'guide', unitLabel: 'Unidad 3 — Color y Forma', fileName: 'guia_color.pdf', fileSizeBytes: 1800000, voteCount: 47, downloadCount: 209, isAnonymous: true, createdAt: 'hace 4 meses' },
      { id: 'm14', title: 'Entrega 1 — Ejemplo con nota 7', description: 'Proyecto real evaluado con 7.0. Referencia de calidad esperada.', category: 'notes', unitLabel: 'Unidad 1 — Fundamentos', fileName: 'ejemplo_nota7_e1.pdf', fileSizeBytes: 4100000, voteCount: 103, downloadCount: 412, isAnonymous: true, createdAt: 'hace 2 meses' },
    ],
  },
  {
    id: 'prog1',
    code: 'INF101',
    name: 'Programación',
    credits: 4,
    career: 'Tecnologías de la Información',
    description:
      'Fundamentos de la programación imperativa y orientada a objetos usando Python. Cubre algoritmia, estructuras de control, funciones, manejo de datos y orientación a objetos aplicada a problemas reales.',
    programUnits: [
      { id: 1, title: 'Unidad 1 — Introducción y Algoritmia' },
      { id: 2, title: 'Unidad 2 — Variables, Tipos y Expresiones' },
      { id: 3, title: 'Unidad 3 — Estructuras de Control' },
      { id: 4, title: 'Unidad 4 — Funciones y Módulos' },
      { id: 5, title: 'Unidad 5 — Listas, Dicts y POO básica' },
    ],
    tipCount: 4,
    materialCount: 5,
    tips: [
      {
        id: 't20',
        content: 'Instala VS Code con las extensiones Python + Pylance desde el día uno. El profe Soto prefiere que entregues el código bien comentado y con nombres de variables en inglés. Si entregas variables como "x" o "var1" te descuenta puntos.',
        voteCount: 39,
        isPinned: true,
        isAnonymous: true,
        sources: [
          { id: 's20', type: 'url', title: 'VS Code — Extensión Python', url: 'https://marketplace.visualstudio.com/items?itemName=ms-python.python' },
        ],
        createdAt: 'hace 1 semana',
      },
      {
        id: 't21',
        content: 'Para los proyectos, usa Google Colab si tu PC no tiene Python instalado. Todo corre en la nube y no necesitas configurar nada. Para aprender algoritmos visualmente, VisuAlgo es increíble.',
        voteCount: 28,
        isPinned: false,
        isAnonymous: false,
        studentName: 'Diego F.',
        avatarColor: 'bg-cyan-500',
        sources: [
          { id: 's21', type: 'url', title: 'Google Colab', url: 'https://colab.research.google.com' },
          { id: 's22', type: 'url', title: 'VisuAlgo — Visualización de Algoritmos', url: 'https://visualgo.net' },
        ],
        createdAt: 'hace 3 semanas',
      },
      {
        id: 't22',
        content: 'El certamen siempre tiene un ejercicio de listas y uno de funciones recursivas. Practica mucho recursión porque la mayoría de la gente no lo entiende bien. El libro de Downey (Think Python) está gratis online y es mejor que las diapositivas del curso.',
        voteCount: 22,
        isPinned: false,
        isAnonymous: true,
        sources: [
          { id: 's23', type: 'book', title: 'Think Python', author: 'Allen B. Downey', edition: '2da edición' },
          { id: 's24', type: 'url', title: 'Think Python — Free PDF', url: 'https://greenteapress.com/wp/think-python-2e/' },
        ],
        createdAt: 'hace 1 mes',
      },
      {
        id: 't23',
        content: 'No copies código de internet sin entenderlo. El profe hace preguntas orales en las entregas y si no sabes explicar tu propio código, te baja la nota a la mitad.',
        voteCount: 17,
        isPinned: false,
        isAnonymous: true,
        sources: [],
        createdAt: 'hace 2 meses',
      },
    ],
    materials: [
      { id: 'm20', title: 'Certamen 1 — 2024-1', description: 'Ejercicios de algoritmos y estructuras básicas', category: 'exam', unitLabel: 'Unidades 1-3', fileName: 'C1_INF101_2024-1.pdf', fileSizeBytes: 1200000, examSemester: '2024-1', examYear: 2024, voteCount: 48, downloadCount: 201, isAnonymous: true, createdAt: 'hace 2 meses' },
      { id: 'm21', title: 'Apuntes de POO con Python', description: 'Clases, objetos, herencia y polimorfismo con ejemplos', category: 'notes', unitLabel: 'Unidad 5 — Listas y POO', fileName: 'apuntes_poo.pdf', fileSizeBytes: 2800000, voteCount: 61, downloadCount: 234, isAnonymous: false, studentName: 'Sofía A.', avatarColor: 'bg-teal-500', createdAt: 'hace 3 meses' },
      { id: 'm22', title: 'Think Python 2e — Allen Downey', category: 'book', unitLabel: 'Unidades 1-5', externalUrl: 'https://greenteapress.com/wp/think-python-2e/', author: 'Allen B. Downey', voteCount: 87, downloadCount: 398, isAnonymous: true, createdAt: 'hace 7 meses' },
      { id: 'm23', title: 'Guía de Recursión y Listas', description: '30 ejercicios resueltos de funciones recursivas', category: 'guide', unitLabel: 'Unidad 4 — Funciones', fileName: 'guia_recursion.pdf', fileSizeBytes: 1600000, voteCount: 39, downloadCount: 176, isAnonymous: true, createdAt: 'hace 4 meses' },
      { id: 'm24', title: 'Cheatsheet Python — Referencia rápida', description: 'Sintaxis esencial en una página', category: 'notes', unitLabel: 'Unidades 1-5', fileName: 'python_cheatsheet.pdf', fileSizeBytes: 450000, voteCount: 95, downloadCount: 489, isAnonymous: true, createdAt: 'hace 5 meses' },
    ],
  },
  {
    id: 'est1',
    code: 'EST101',
    name: 'Estadística',
    credits: 3,
    career: 'Ciencias Básicas',
    description:
      'Introducción a la estadística descriptiva e inferencial. Abarca recolección y análisis de datos, distribuciones de probabilidad, estimación e hipótesis. Se usa software estadístico (R o Excel) para el análisis.',
    programUnits: [
      { id: 1, title: 'Unidad 1 — Estadística Descriptiva' },
      { id: 2, title: 'Unidad 2 — Probabilidad' },
      { id: 3, title: 'Unidad 3 — Distribuciones' },
      { id: 4, title: 'Unidad 4 — Inferencia Estadística' },
    ],
    tipCount: 3,
    materialCount: 4,
    tips: [
      {
        id: 't30',
        content: 'Aprende R desde el inicio aunque el profe permita Excel. Los trabajos que usan R siempre quedan mejor y la librería ggplot2 hace gráficos increíbles. En YouTube el canal "StatQuest with Josh Starmer" explica distribuciones mejor que cualquier libro.',
        voteCount: 33,
        isPinned: false,
        isAnonymous: true,
        sources: [
          { id: 's30', type: 'video', title: 'StatQuest — Distribuciones explicadas', url: 'https://www.youtube.com/@statquest' },
          { id: 's31', type: 'url', title: 'R para Ciencia de Datos (gratis)', url: 'https://es.r4ds.hadley.nz' },
        ],
        createdAt: 'hace 2 semanas',
      },
      {
        id: 't31',
        content: 'El certamen de inferencia (Unidad 4) siempre trae un test de hipótesis completo. Memoriza la estructura: H0, H1, estadístico de prueba, valor-p, conclusión. El prof. Mendoza descuenta si falta algún paso aunque el resultado sea correcto.',
        voteCount: 28,
        isPinned: false,
        isAnonymous: true,
        sources: [],
        createdAt: 'hace 1 mes',
      },
      {
        id: 't32',
        content: 'Usa el libro de Montgomery desde la primera clase. El de Wackerly está bien pero Montgomery tiene mejor cobertura de los temas del certamen. La solución al manual de ejercicios está en la biblioteca.',
        voteCount: 16,
        isPinned: false,
        isAnonymous: false,
        studentName: 'Andrés P.',
        avatarColor: 'bg-blue-500',
        sources: [
          { id: 's32', type: 'book', title: 'Probabilidad y Estadística para Ingeniería', author: 'Douglas Montgomery', edition: '6ta edición' },
        ],
        createdAt: 'hace 6 semanas',
      },
    ],
    materials: [
      { id: 'm30', title: 'Certamen Final — 2023-2', category: 'exam', unitLabel: 'Unidades 1-4', fileName: 'CF_EST101_2023-2.pdf', fileSizeBytes: 1700000, examSemester: '2023-2', examYear: 2023, voteCount: 44, downloadCount: 198, isAnonymous: true, createdAt: 'hace 5 meses' },
      { id: 'm31', title: 'Resumen Distribuciones de Probabilidad', description: 'Tabla comparativa: Normal, t-Student, Chi2, F', category: 'notes', unitLabel: 'Unidad 3 — Distribuciones', fileName: 'resumen_distribuciones.pdf', fileSizeBytes: 780000, voteCount: 57, downloadCount: 267, isAnonymous: true, createdAt: 'hace 3 meses' },
      { id: 'm32', title: 'Guía Test de Hipótesis', description: '25 ejercicios resueltos paso a paso', category: 'guide', unitLabel: 'Unidad 4 — Inferencia', fileName: 'guia_hipotesis.pdf', fileSizeBytes: 2200000, voteCount: 49, downloadCount: 221, isAnonymous: false, studentName: 'María J.', avatarColor: 'bg-amber-500', createdAt: 'hace 4 meses' },
      { id: 'm33', title: 'Formulario Oficial Certamen', description: 'El formulario exacto que entrega el profe en el certamen', category: 'guide', unitLabel: 'Unidades 1-4', fileName: 'formulario_oficial.pdf', fileSizeBytes: 320000, voteCount: 88, downloadCount: 356, isAnonymous: true, createdAt: 'hace 8 meses' },
    ],
  },
  {
    id: 'eco1',
    code: 'ECO101',
    name: 'Economía',
    credits: 3,
    career: 'Negocios y Economía',
    description:
      'Introducción a los principios económicos micro y macroeconómicos. Estudia el comportamiento de consumidores y empresas, la formación de precios en mercados, y los indicadores macroeconómicos básicos.',
    programUnits: [
      { id: 1, title: 'Unidad 1 — Principios y Microeconomía' },
      { id: 2, title: 'Unidad 2 — Oferta, Demanda y Mercados' },
      { id: 3, title: 'Unidad 3 — Estructura de Mercados' },
      { id: 4, title: 'Unidad 4 — Macroeconomía Básica' },
    ],
    tipCount: 2,
    materialCount: 3,
    tips: [
      {
        id: 't40',
        content: 'Las clases son muy teóricas pero los certámenes son aplicados. Practica con casos de noticias económicas reales. El Dr. Herrera valora mucho que puedas conectar la teoría con noticias de El Mercurio o Bloomberg.',
        voteCount: 24,
        isPinned: false,
        isAnonymous: true,
        sources: [
          { id: 's40', type: 'url', title: 'Economía — Khan Academy ES', url: 'https://es.khanacademy.org/economics-finance-domain/microeconomics' },
        ],
        createdAt: 'hace 3 semanas',
      },
      {
        id: 't41',
        content: 'Para los gráficos de oferta y demanda, practica dibujándolos a mano. El certamen siempre trae un gráfico que tienes que desplazar y explicar el nuevo equilibrio. Si no lo haces bien, pierdes 2 puntos completos.',
        voteCount: 18,
        isPinned: false,
        isAnonymous: true,
        sources: [],
        createdAt: 'hace 2 meses',
      },
    ],
    materials: [
      { id: 'm40', title: 'Certamen 1 — 2024-1', category: 'exam', unitLabel: 'Unidades 1-2', fileName: 'C1_ECO101_2024-1.pdf', fileSizeBytes: 980000, examSemester: '2024-1', examYear: 2024, voteCount: 31, downloadCount: 142, isAnonymous: true, createdAt: 'hace 3 meses' },
      { id: 'm41', title: 'Resumen Microeconomía', description: 'Toda la unidad 1 y 2 en 8 páginas', category: 'notes', unitLabel: 'Unidades 1-2', fileName: 'resumen_micro.pdf', fileSizeBytes: 1100000, voteCount: 42, downloadCount: 188, isAnonymous: true, createdAt: 'hace 4 meses' },
      { id: 'm42', title: 'Principios de Economía — Mankiw', category: 'book', unitLabel: 'Unidades 1-4', externalUrl: 'https://libgen.is', author: 'N. Gregory Mankiw', edition: '8va edición', voteCount: 76, downloadCount: 311, isAnonymous: true, createdAt: 'hace 9 meses' },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getTopProfessorsByCourse(courseId: string) {
  const results: { professor: (typeof PROFESSORS)[0]; avgRating: number; reviewCount: number }[] = [];
  for (const prof of PROFESSORS) {
    const c = prof.courseRatings.find(r => r.courseId === courseId);
    if (c) results.push({ professor: prof, avgRating: c.avgRating, reviewCount: c.reviewCount });
  }
  return results.sort((a, b) => b.avgRating - a.avgRating);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const CATEGORY_LABEL: Record<MaterialCategory, string> = {
  exam: 'Certamen',
  notes: 'Apunte',
  book: 'Libro',
  guide: 'Guía',
  other: 'Otro',
};

export const CATEGORY_EMOJI: Record<MaterialCategory, string> = {
  exam: '📝',
  notes: '📓',
  book: '📚',
  guide: '📄',
  other: '📎',
};
