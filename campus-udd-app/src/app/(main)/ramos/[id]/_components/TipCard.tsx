'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Link2, BookOpen, FileText, Play, Paperclip, User } from 'lucide-react';
import { type CourseTip, type TipSource } from './mock-data';
import { cn } from '@/lib/utils';

const SOURCE_ICON: Record<TipSource['type'], React.FC<{ className?: string }>> = {
  url: Link2,
  book: BookOpen,
  guide: FileText,
  video: Play,
};

const SOURCE_COLOR: Record<TipSource['type'], string> = {
  url: 'bg-blue-50 text-blue-700 border-blue-200',
  book: 'bg-amber-50 text-amber-700 border-amber-200',
  guide: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  video: 'bg-red-50 text-red-700 border-red-200',
};

const SOURCE_LABEL: Record<TipSource['type'], string> = {
  url: 'URL',
  book: 'Libro',
  guide: 'Guía',
  video: 'Video',
};

interface TipCardProps {
  tip: CourseTip;
  voted: boolean;
  onVote: (id: string) => void;
}

export function TipCard({ tip, voted, onVote }: TipCardProps) {
  const [expanded, setExpanded] = useState(tip.isPinned);
  const isLong = tip.content.length > 220;
  const displayText = (!expanded && isLong) ? tip.content.slice(0, 220) + '…' : tip.content;

  return (
    <div className={cn(
      'bg-white border rounded-xl shadow-sm overflow-hidden',
      tip.isPinned ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'
    )}>
      {tip.isPinned && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border-b border-blue-100">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">📌 Consejo destacado</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {tip.isAnonymous ? (
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ) : (
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold', tip.avatarColor || 'bg-slate-400')}>
                {tip.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-700">
                {tip.isAnonymous ? 'Estudiante anónimo' : tip.studentName}
              </p>
              <p className="text-[10px] text-slate-400">{tip.createdAt}</p>
            </div>
          </div>

          {/* Vote */}
          <button
            onClick={() => onVote(tip.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
              voted
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
            )}
          >
            <span>{voted ? '▲' : '△'}</span>
            <span>{tip.voteCount + (voted ? 1 : 0)}</span>
          </button>
        </div>

        {/* Content */}
        <div>
          <p className="text-sm text-slate-700 leading-relaxed">{displayText}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-1.5 hover:underline"
            >
              {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Ver menos</> : <><ChevronDown className="w-3.5 h-3.5" /> Ver más</>}
            </button>
          )}
        </div>

        {/* Sources */}
        {tip.sources.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Fuentes</p>
            <div className="flex flex-wrap gap-1.5">
              {tip.sources.map(src => {
                const Icon = SOURCE_ICON[src.type] || Paperclip;
                return (
                  <a
                    key={src.id}
                    href={src.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-opacity hover:opacity-80',
                      SOURCE_COLOR[src.type]
                    )}
                    onClick={e => !src.url && e.preventDefault()}
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[140px]">
                      {src.type === 'book'
                        ? `${src.title}${src.author ? ` — ${src.author}` : ''}`
                        : src.title}
                    </span>
                    <span className="opacity-60 flex-shrink-0">{SOURCE_LABEL[src.type]}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
