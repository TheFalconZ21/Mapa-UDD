export default function NotificacionesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notificaciones</h1>
      </div>

      <div className="border border-slate-200 rounded-lg p-8 bg-white shadow-sm flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          🔔
        </div>
        <div className="text-center">
          <h3 className="font-medium text-slate-900">Estás al día</h3>
          <p className="text-sm text-slate-500 mt-1">No tienes notificaciones nuevas por ahora.</p>
        </div>
      </div>
    </div>
  );
}
