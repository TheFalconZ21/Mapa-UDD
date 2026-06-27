export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-10 text-center text-3xl font-bold tracking-tight text-slate-900">
          Campus UDD
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Tu red social universitaria
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white py-8 px-6 shadow rounded-lg">
        {children}
      </div>
    </div>
  );
}
