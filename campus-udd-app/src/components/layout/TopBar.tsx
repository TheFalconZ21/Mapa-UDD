'use client';

import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TopBar() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAuth();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/mapa" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">UDD</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-900 hidden sm:block">Campus</span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/mapa" className="text-sm font-medium text-slate-600 hover:text-slate-900">Mapa</Link>
          <Link href="/ramos" className="text-sm font-medium text-slate-600 hover:text-slate-900">Ramos</Link>
          <Link href="/eventos" className="text-sm font-medium text-slate-600 hover:text-slate-900">Eventos</Link>
          <Link href="/docentes" className="text-sm font-medium text-slate-600 hover:text-slate-900">Docentes</Link>
          <Link href="/notificaciones" className="text-sm font-medium text-slate-600 hover:text-slate-900">Notificaciones</Link>
        </nav>

        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200"
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                href="/nosotros/perfil"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setShowMenu(false)}
              >
                Mi Perfil
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
