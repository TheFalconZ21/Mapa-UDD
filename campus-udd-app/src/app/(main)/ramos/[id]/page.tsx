'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, MessageSquare, Upload, Star, BookOpen, Trophy, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { RAMOS, getTopProfessorsByCourse, type MaterialCategory } from './_components/mock-data';
import { TipCard } from './_components/TipCard';
import { NewTipModal } from './_components/NewTipModal';
import { MaterialCard } from './_components/MaterialCard';
import { UploadModal } from './_components/UploadModal';
import { ProfessorAvatar } from '@/app/(main)/docentes/_components/ProfessorCard';
import { StarRating } from '@/app/(main)/docentes/_components/StarRating';
import { cn } from '@/lib/utils';

type Tab = 'profesores' | 'consejos' | 'material';
type TipSort = 'top' | 'reciente';
const MATERIAL_FILTERS: { value: MaterialCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'exam', label: '📝 Certámenes' },
  { value: 'notes', label: '📓 Apuntes' },
  { value: 'book', label: '📚 Libros' },
  { value: 'guide', label: '📄 Guías' },
];

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_RING = ['ring-amber-300', 'ring-slate-300', 'ring-orange-300'];

export default function RamoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const ramo = RAMOS.find(r => r.id === id);
  const [tab, setTab] = useState<Tab>('profesores');
  const [tipSort, setTipSort] = useState<TipSort>('top');
  const [matFilter, setMatFilter] = useState<MaterialCategory | 'all'>('all');
  const [votedTips, setVotedTips] = useState<Set<string>>(new Set());
  const [likedMaterials, setLikedMaterials] = useState<Set<string>>(new Set());
  const [showTipModal, setShowTipModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const topProfessors = useMemo(() => ramo ? getTopProfessorsByCourse(ramo.id) : [], [ramo]);

  const sortedTips = useMemo(() => {
    if (!ramo) return [];
    const pinned = ramo.tips.filter(t => t.isPinned);
    const rest = ramo.tips.filter(t => !t.isPinned).sort((a, b) =>
      tipSort === 'top' ? b.voteCount - a.voteCount : 0
    );
    return [...pinned, ...rest];
  }, [ramo, tipSort]);

  const filteredMaterials = useMemo(() => {
    if (!ramo) return [];
    const list = matFilter === 'all' ? ramo.materials : ramo.materials.filter(m => m.category === matFilter);
    return list.sort((a, b) => b.voteCount - a.voteCount);
  }, [ramo, matFilter]);

  if (!ramo) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-slate-500">Ramo no encontrado.</p>
        <button onClick={() => router.back()} className="text-blue-600 font-medium text-sm hover:underline">Volver</button>
      </div>
    );
  }

  const avgRating = topProfessors.length > 0
    ? topProfessors.reduce((s, p) => s + p.avgRating, 0) / topProfessors.length
    : 0;

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">

        {/* ── Top nav ─────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 flex items-center gap-3 px-4 h-12 shadow-sm flex-shrink-0">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Ramos</span>
          </button>
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 pt-5 pb-0 flex-shrink-0">
          <div className="max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full mb-2">
                  {ramo.code}
                </span>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">{ramo.name}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {ramo.credits} créditos · {ramo.career}
                </p>
              </div>
              {avgRating > 0 && (
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Star className="w-4 h-4 text-amber-400" fill="currentColor" strokeWidth={0} />
                  <span className="text-lg font-black text-slate-900 leading-none">{avgRating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400">{topProfessors.length} profes</span>
                </div>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex gap-0 mt-4 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-slate-100 overflow-x-auto scrollbar-none">
              {([
                { key: 'profesores', label: 'Profesores', icon: Trophy },
                { key: 'consejos', label: `Consejos`, badge: ramo.tipCount, icon: MessageSquare },
                { key: 'material', label: `Material`, badge: ramo.materialCount, icon: BookOpen },
              ] as const).map(({ key, label, badge, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
                    tab === key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge !== undefined && (
                    <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded-full', tab === key ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500')}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl px-4 sm:px-6 py-5 space-y-4 mx-auto">

            {/* ════ TAB: PROFESORES ════ */}
            {tab === 'profesores' && (
              <>
                {/* Description */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
                  <h2 className="font-semibold text-slate-900 text-sm">Descripción</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{ramo.description}</p>
                </div>

                {/* Program units */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <h2 className="font-semibold text-slate-900 text-sm">Programa de estudios</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {ramo.programUnits.map((u, i) => (
                      <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <p className="text-sm text-slate-700">{u.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top professors */}
                {topProfessors.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <h2 className="font-semibold text-slate-900 text-sm">Profesores que dictan este ramo</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {topProfessors.map((entry, i) => (
                        <Link
                          key={entry.professor.id}
                          href={`/docentes/${entry.professor.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-lg w-6 flex-shrink-0">{MEDALS[i] ?? `#${i + 1}`}</span>
                          <div className={cn('rounded-full ring-2', MEDAL_RING[i] ?? 'ring-slate-200')}>
                            <ProfessorAvatar fullName={entry.professor.fullName} avatarColor={entry.professor.avatarColor} size="sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {entry.professor.title} {entry.professor.fullName}
                            </p>
                            <p className="text-xs text-slate-400">{entry.reviewCount} reseñas en este ramo</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <StarRating value={entry.avgRating} size="sm" />
                            <span className="text-sm font-bold text-slate-900">{entry.avgRating.toFixed(1)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-slate-100">
                      <Link href="/docentes" className="text-sm text-blue-600 font-medium hover:underline">
                        Ver todos los docentes →
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ════ TAB: CONSEJOS ════ */}
            {tab === 'consejos' && (
              <>
                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setTipSort(s => s === 'top' ? 'reciente' : 'top')}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {tipSort === 'top' ? 'Top votos' : 'Más reciente'}
                  </button>
                  <button
                    onClick={() => setShowTipModal(true)}
                    className="flex items-center gap-1.5 h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Nuevo consejo
                  </button>
                </div>

                {sortedTips.map(tip => (
                  <TipCard
                    key={tip.id}
                    tip={tip}
                    voted={votedTips.has(tip.id)}
                    onVote={id => setVotedTips(prev => {
                      const s = new Set(prev);
                      s.has(id) ? s.delete(id) : s.add(id);
                      return s;
                    })}
                  />
                ))}
              </>
            )}

            {/* ════ TAB: MATERIAL ════ */}
            {tab === 'material' && (
              <>
                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                    {MATERIAL_FILTERS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setMatFilter(f.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
                          matFilter === f.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex-shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Subir
                  </button>
                </div>

                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map(material => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      liked={likedMaterials.has(material.id)}
                      onLike={id => setLikedMaterials(prev => {
                        const s = new Set(prev);
                        s.has(id) ? s.delete(id) : s.add(id);
                        return s;
                      })}
                      onDownload={id => {
                        setLikedMaterials(prev => prev); // just trigger re-render for count
                        const m = ramo.materials.find(x => x.id === id);
                        if (m?.externalUrl) window.open(m.externalUrl, '_blank');
                      }}
                    />
                  ))
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center gap-3">
                    <span className="text-3xl">📭</span>
                    <p className="text-sm text-slate-500 text-center">No hay material en esta categoría aún.</p>
                    <button onClick={() => setShowUploadModal(true)} className="text-sm text-blue-600 font-medium hover:underline">
                      Sé el primero en subir
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="h-4" />
          </div>
        </div>
      </div>

      {showTipModal && (
        <NewTipModal courseName={ramo.name} onClose={() => setShowTipModal(false)} onSubmit={() => {}} />
      )}
      {showUploadModal && (
        <UploadModal course={ramo} onClose={() => setShowUploadModal(false)} onSubmit={() => {}} />
      )}
    </>
  );
}
