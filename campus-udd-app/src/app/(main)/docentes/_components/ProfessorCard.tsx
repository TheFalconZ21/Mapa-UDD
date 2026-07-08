import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { type Professor } from './mock-data';
import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';

interface ProfessorCardProps {
  professor: Professor;
}

export function ProfessorAvatar({ fullName, avatarColor, size = 'md' }: { fullName: string; avatarColor: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const initials = fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const sizeMap = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };
  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0', avatarColor, sizeMap[size])}>
      {initials}
    </div>
  );
}

export function ProfessorCard({ professor }: ProfessorCardProps) {
  const displayTags = professor.topTags.slice(0, 3);
  const extraCount = professor.topTags.length - displayTags.length;

  return (
    <Link
      href={`/docentes/${professor.id}`}
      className="group flex items-start gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
    >
      <ProfessorAvatar fullName={professor.fullName} avatarColor={professor.avatarColor} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 leading-tight truncate">
              {professor.title} {professor.fullName}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{professor.department}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <StarRating value={professor.avgRating} size="sm" showValue reviewCount={professor.reviewCount} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {displayTags.map((tag) => (
            <span
              key={tag.label}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full"
            >
              #{tag.label}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[11px] text-slate-400 font-medium">+{extraCount}</span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
    </Link>
  );
}
