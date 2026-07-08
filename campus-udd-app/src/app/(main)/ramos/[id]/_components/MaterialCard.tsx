'use client';

import { Download, Heart, User, ExternalLink } from 'lucide-react';
import { type StudyMaterial, CATEGORY_EMOJI, CATEGORY_LABEL, formatBytes } from './mock-data';
import { cn } from '@/lib/utils';

const CATEGORY_BG: Record<StudyMaterial['category'], string> = {
  exam: 'bg-orange-50 text-orange-700 border-orange-200',
  notes: 'bg-blue-50 text-blue-700 border-blue-200',
  book: 'bg-amber-50 text-amber-700 border-amber-200',
  guide: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  other: 'bg-slate-50 text-slate-600 border-slate-200',
};

interface MaterialCardProps {
  material: StudyMaterial;
  liked: boolean;
  onLike: (id: string) => void;
  onDownload: (id: string) => void;
}

export function MaterialCard({ material, liked, onLike, onDownload }: MaterialCardProps) {
  const isExternal = !!material.externalUrl && !material.fileName;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3 hover:border-slate-300 transition-colors">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
          {CATEGORY_EMOJI[material.category]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0', CATEGORY_BG[material.category])}>
              {CATEGORY_LABEL[material.category]}
              {material.examSemester && ` · ${material.examSemester}`}
            </span>
            {material.unitLabel && (
              <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full truncate">
                {material.unitLabel}
              </span>
            )}
          </div>
          <p className="font-semibold text-slate-900 text-sm mt-1.5 leading-tight">{material.title}</p>
          {material.description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{material.description}</p>
          )}
          {material.author && (
            <p className="text-xs text-slate-400 mt-0.5 italic">{material.author}</p>
          )}
        </div>
      </div>

      {/* File info + uploader */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {material.isAnonymous ? (
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-slate-400" />
            </div>
          ) : (
            <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0', material.avatarColor || 'bg-slate-400')}>
              {material.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <p className="text-[11px] text-slate-500 truncate">
            {material.isAnonymous ? 'Anónimo' : material.studentName}
            {' · '}
            {material.fileSizeBytes ? formatBytes(material.fileSizeBytes) : 'Recurso externo'}
            {' · '}
            {material.createdAt}
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        {/* Like */}
        <button
          onClick={() => onLike(material.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
            liked
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-white text-slate-500 border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
          )}
        >
          <Heart className={cn('w-3.5 h-3.5', liked && 'fill-current')} />
          <span>{material.voteCount + (liked ? 1 : 0)}</span>
        </button>

        {/* Downloads */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Download className="w-3.5 h-3.5" />
          <span>{material.downloadCount}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Download / Visit */}
        <button
          onClick={() => onDownload(material.id)}
          className="flex items-center gap-1.5 h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          {isExternal ? (
            <><ExternalLink className="w-3.5 h-3.5" /> Visitar</>
          ) : (
            <><Download className="w-3.5 h-3.5" /> Descargar</>
          )}
        </button>
      </div>
    </div>
  );
}
