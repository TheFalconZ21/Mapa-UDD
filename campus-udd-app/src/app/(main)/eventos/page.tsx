export default function EventosPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Eventos</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
          Crear Evento
        </button>
      </div>

      <div className="flex space-x-2 pb-2 overflow-x-auto">
        <button className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-sm font-medium whitespace-nowrap">
          Todos
        </button>
        <button className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 whitespace-nowrap">
          Académico
        </button>
        <button className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 whitespace-nowrap">
          Deportivo
        </button>
        <button className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 whitespace-nowrap">
          Fiesta
        </button>
      </div>

      <div className="border border-slate-200 rounded-lg p-8 bg-white shadow-sm flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          📅
        </div>
        <div className="text-center">
          <h3 className="font-medium text-slate-900">No hay eventos próximos</h3>
          <p className="text-sm text-slate-500 mt-1">Sé el primero en organizar algo en el campus.</p>
        </div>
      </div>
    </div>
  );
}
