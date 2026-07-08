'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Star, MessageSquare, BookOpen } from 'lucide-react';
import { RAMOS, getTopProfessorsByCourse } from './[id]/_components/mock-data';
import { cn } from '@/lib/utils';

const CAREERS = ['Todos', 'Ingeniería y Ciencias', 'Diseño', 'Tecnologías de la Información', 'Ciencias Básicas', 'Negocios y Economía'];

export default function RamosPage() {
  const [query, setQuery] = useState('');
  const [career, setCareer] = useState('Todos');

  const enriched = useMemo(() => RAMOS.map(r => {
    const profs = getTopProfessorsByCourse(r.id);
    const avgRating = profs.length > 0 ? profs.reduce((s, p) => s + p.avgRating, 0) / profs.length : 0;
    return { ...r, avgRating, professorCount: profs.length };
  }), []);

  const filtered = useMemo(() => {
    let list = enriched;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.career.toLowerCase().includes(q));
    }
    if (career !== 'Todos') list = list.filter(r => r.career === career);
    return list;
  }, [enriched, query, career]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ramos</h1>
        <p className="text-sm text-slate-500 mt-0.5">{RAMOS.length} asignaturas · Campus UDD</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 shadow-sm transition"
        />
      </div>

      {/* Career filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CAREERS.map(c => (
          <button
            key={c}
            onClick={() => setCareer(c)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0',
              career === c ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          <>
            <p className="text-xs text-slate-400 font-medium px-0.5">
              {filtered.length} {filtered.length === 1 ? 'asignatura' : 'asignaturas'}
            </p>
            {filtered.map(ramo => (
              <Link
                key={ramo.id}
                href={`/ramos/${ramo.id}`}
                className="group flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                {/* Code badge */}
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold leading-none opacity-80">{ramo.code.slice(0, 3)}</span>
                  <span className="text-white text-xs font-black leading-none">{ramo.code.slice(3)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 leading-tight">{ramo.name}</p>
                    {ramo.avgRating > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" strokeWidth={0} />
                        <span className="text-sm font-bold text-slate-900">{ramo.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ramo.credits} créditos · {ramo.career}
                    {ramo.professorCount > 0 && ` · ${ramo.professorCount} prof${ramo.professorCount > 1 ? 'es' : '.'}`}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <BookOpen className="w-3 h-3" />
                      {ramo.materialCount} materiales
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MessageSquare className="w-3 h-3" />
                      {ramo.tipCount} consejos
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </>
        ) : (
          <div className="border border-slate-200 rounded-xl p-10 bg-white shadow-sm flex flex-col items-center gap-3">
            <span className="text-3xl">📚</span>
            <div className="text-center">
              <p className="font-medium text-slate-900">Sin resultados</p>
              <p className="text-sm text-slate-500 mt-1">Intenta con otro nombre o carrera.</p>
            </div>
            <button onClick={() => { setQuery(''); setCareer('Todos'); }} className="text-sm text-blue-600 font-medium hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
