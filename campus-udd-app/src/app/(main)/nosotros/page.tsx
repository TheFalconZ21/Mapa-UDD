export default function NosotrosPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nosotros</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
          Buscar amigos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            👥
          </div>
          <div className="text-center">
            <h3 className="font-medium text-slate-900">Tu red social</h3>
            <p className="text-sm text-slate-500 mt-1">Conecta con tus compañeros, mira quién está en el campus y comparte tu horario.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
