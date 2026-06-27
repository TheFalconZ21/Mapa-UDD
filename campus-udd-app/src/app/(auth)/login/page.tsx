'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isInstitutionalEmail } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isInstitutionalEmail(email)) {
      setError('Por favor usa tu correo institucional de la universidad (@udd.cl o @alu.udd.cl)');
      setLoading(false);
      return;
    }

    // BYPASS DE PRUEBA: Permite entrar sin base de datos real
    if (email === 'test@udd.cl' && password === '123456') {
      setUser({
        id: '123',
        app_metadata: {},
        user_metadata: { full_name: 'Usuario de Prueba' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'test@udd.cl',
      } as any);
      router.push('/mapa');
      router.refresh();
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message + " (Si no tienes base de datos usa test@udd.cl / 123456)");
        setLoading(false);
        return;
      }

      setUser(data.user);
      router.push('/mapa');
      router.refresh();
    } catch (err: any) {
      setError("Error de conexión a BD. Usa test@udd.cl / 123456 para probar la UI.");
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium leading-6 text-slate-900">
            Correo Institucional
          </label>
          <div className="mt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
              placeholder="juan@udd.cl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-slate-900">
            Contraseña
          </label>
          <div className="mt-2">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-slate-500">
        ¿No tienes una cuenta?{' '}
        <Link href="/register" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
          Regístrate aquí
        </Link>
      </p>
    </>
  );
}
