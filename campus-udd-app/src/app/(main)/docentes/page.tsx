'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PROFESSORS, DEPARTMENTS } from './_components/mock-data';
import { ProfessorCard } from './_components/ProfessorCard';
import { Top3Section } from './_components/Top3Section';
import { cn } from '@/lib/utils';

export default function DocentesPage() {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('Todos');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');

  const filtered = useMemo(() => {
    let list = [...PROFESSORS];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.courseRatings.some(c => c.name.toLowerCase().includes(q))
      );
    }

    if (department !== 'Todos') {
      list = list.filter(p => p.department === department);
    }

    list.sort((a, b) =>
      sortBy === 'rating' ? b.avgRating - a.avgRating : b.reviewCount - a.reviewCount
    );

    return list;
  }, [query, department, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Docentes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{PROFESSORS.length} profesores · Campus UDD</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy(s => s === 'rating' ? 'reviews' : 'rating')}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {sortBy === 'rating' ? 'Por rating' : 'Por reseñas'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, ramo o departamento..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 shadow-sm transition"
        />
      </div>

      {/* Department filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => setDepartment(dept)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0',
              department === dept
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Top 3 — only show when no active search/filter */}
      {!query && department === 'Todos' && <Top3Section />}

      {/* Professor list */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          <>
            <p className="text-xs text-slate-400 font-medium px-0.5">
              {filtered.length} {filtered.length === 1 ? 'docente' : 'docentes'}
              {query ? ` · "${query}"` : ''}
            </p>
            {filtered.map(prof => (
              <ProfessorCard key={prof.id} professor={prof} />
            ))}
          </>
        ) : (
          <div className="border border-slate-200 rounded-xl p-10 bg-white shadow-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
              🎓
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900">Sin resultados</p>
              <p className="text-sm text-slate-500 mt-1">Intenta con otro nombre o departamento.</p>
            </div>
            <button
              onClick={() => { setQuery(''); setDepartment('Todos'); }}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
