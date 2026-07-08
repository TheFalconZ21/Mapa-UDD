'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { TOP3_COURSES, getTop3ByCourse } from './mock-data';
import { ProfessorAvatar } from './ProfessorCard';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = [
  'ring-amber-300 bg-amber-50',
  'ring-slate-300 bg-slate-50',
  'ring-orange-300 bg-orange-50',
];

export function Top3Section() {
  const [activeCourse, setActiveCourse] = useState(TOP3_COURSES[0]?.id ?? '');
  const top3 = getTop3ByCourse(activeCourse);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
          <Trophy className="w-4 h-4 text-amber-500" />
        </div>
        <h2 className="font-semibold text-slate-900 text-sm">Top 3 por Ramo</h2>
      </div>

      {/* Course pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-slate-100">
        {TOP3_COURSES.map((course) => (
          <button
            key={course.id}
            onClick={() => setActiveCourse(course.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              activeCourse === course.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {course.name}
          </button>
        ))}
      </div>

      {/* Top 3 cards */}
      <div className="grid grid-cols-3 gap-px bg-slate-100 border-t border-slate-100">
        {top3.length === 0 ? (
          <div className="col-span-3 bg-white py-8 text-center text-sm text-slate-400">
            Sin suficientes reseñas para este ramo
          </div>
        ) : (
          top3.map((entry, i) => (
            <Link
              key={entry.professor.id}
              href={`/docentes/${entry.professor.id}`}
              className={cn(
                'bg-white flex flex-col items-center gap-2 py-4 px-2 hover:bg-slate-50 transition-colors',
                i === 0 && 'relative'
              )}
            >
              <span className="text-lg">{MEDALS[i]}</span>
              <div className={cn('rounded-full ring-2', MEDAL_COLORS[i])}>
                <ProfessorAvatar
                  fullName={entry.professor.fullName}
                  avatarColor={entry.professor.avatarColor}
                  size="sm"
                />
              </div>
              <div className="text-center min-w-0 w-full">
                <p className="text-xs font-semibold text-slate-800 truncate px-1 leading-tight">
                  {entry.professor.title} {entry.professor.fullName.split(' ')[0]}
                </p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Star className="w-3 h-3 text-amber-400" fill="currentColor" strokeWidth={0} />
                  <span className="text-xs font-bold text-slate-700">{entry.avgRating.toFixed(1)}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{entry.reviewCount} reseñas</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
