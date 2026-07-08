'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Calendar, Bell, GraduationCap, BookOpen } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { href: '/mapa',           icon: Map,          label: 'Mapa'     },
  { href: '/ramos',          icon: BookOpen,      label: 'Ramos'    },
  { href: '/eventos',        icon: Calendar,      label: 'Eventos'  },
  { href: '/docentes',       icon: GraduationCap, label: 'Docentes' },
  { href: '/notificaciones', icon: Bell,          label: 'Notif.'   },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 pb-safe z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
