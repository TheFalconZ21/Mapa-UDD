'use client';

import dynamic from 'next/dynamic';

// Cargamos el mapa dinámicamente, desactivando el SSR (Server-Side Rendering) 
// porque Three.js necesita el objeto 'window' que solo existe en el navegador.
const CampusMap3D = dynamic(() => import('@/components/map/Campus3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 text-sm font-medium animate-pulse">Cargando Campus 3D...</p>
    </div>
  ),
});

export default function MapaPage() {
  return (
    <div className="w-full h-full relative flex-1 bg-slate-100">
      <div className="absolute inset-0">
        <CampusMap3D />
      </div>
    </div>
  );
}
