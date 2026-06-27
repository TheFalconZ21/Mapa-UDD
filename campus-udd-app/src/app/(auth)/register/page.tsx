'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isInstitutionalEmail } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isInstitutionalEmail(email)) {
      setError('Por favor usa tu correo institucional de la universidad (@udd.cl o @alu.udd.cl)');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    // Supabase auth registration
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Usually email confirmation is required by default in Supabase.
    // Assuming for MVP it might be disabled or we just show a message.
    if (data.session) {
      // Create profile record since we might not have a trigger yet
      // Or if there is a trigger, it will create it automatically. 
      // Architecture says trigger `on_profile_created` exists, but we need to insert the profile.
      // Actually Supabase Auth trigger usually handles inserting into `public.profiles`.
      // Let's rely on standard practice: we'll insert manually if needed, or if trigger exists, just proceed.
      // We will insert manually for safety, but check architecture. 
      // Arch: "Profiles: todos leen, solo el dueño modifica". No trigger mentioned for profile creation from auth.users.
      // Let's insert the profile manually.
      
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user!.id,
          full_name: fullName,
          email: email,
        }
      ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      setUser(data.user);
      router.push('/mapa');
      router.refresh();
    } else {
      setError('Revisa tu correo para confirmar tu cuenta.');
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleRegister}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium leading-6 text-slate-900">
            Nombre Completo
          </label>
          <div className="mt-2">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
              placeholder="Juan Pérez"
            />
          </div>
        </div>
        
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
              minLength={6}
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
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
          Inicia sesión aquí
        </Link>
      </p>
    </>
  );
}
