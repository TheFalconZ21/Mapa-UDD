'use client';

import { useState } from 'react';
import { X, Plus, Link2, BookOpen, FileText, Play, Check, Trash2 } from 'lucide-react';
import { type TipSource } from './mock-data';
import { cn } from '@/lib/utils';

interface NewTipModalProps {
  courseName: string;
  onClose: () => void;
  onSubmit: () => void;
}

type SourceType = TipSource['type'];

const SOURCE_OPTS: { type: SourceType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'url', label: 'URL', icon: Link2 },
  { type: 'book', label: 'Libro', icon: BookOpen },
  { type: 'guide', label: 'Guía', icon: FileText },
  { type: 'video', label: 'Video', icon: Play },
];

interface DraftSource { type: SourceType; title: string; url: string; author: string; edition: string }

const emptySource = (type: SourceType): DraftSource => ({ type, title: '', url: '', author: '', edition: '' });

export function NewTipModal({ courseName, onClose, onSubmit }: NewTipModalProps) {
  const [content, setContent] = useState('');
  const [sources, setSources] = useState<DraftSource[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = content.trim().length >= 20;

  function addSource(type: SourceType) {
    setSources(prev => [...prev, emptySource(type)]);
  }

  function updateSource(i: number, field: keyof DraftSource, value: string) {
    setSources(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  function removeSource(i: number) {
    setSources(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => { onSubmit(); onClose(); }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900 text-lg">¡Consejo publicado!</p>
            <p className="text-sm text-slate-500 text-center">Tu aporte ayudará a otros estudiantes.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
              <div>
                <p className="text-xs text-slate-400 font-medium">Nuevo consejo</p>
                <p className="font-semibold text-slate-900">{courseName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tu consejo *</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Comparte una estrategia, recurso o tip para aprobar este ramo. Sé específico: ¿qué te funcionó a ti?"
                  rows={5}
                  maxLength={2000}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none transition"
                />
                <div className="flex justify-between">
                  <p className={cn('text-[11px]', content.length < 20 ? 'text-slate-400' : 'text-emerald-600')}>
                    {content.length < 20 ? `mínimo 20 caracteres (${20 - content.length} restantes)` : '✓ Listo'}
                  </p>
                  <p className="text-[11px] text-slate-400">{content.length}/2000</p>
                </div>
              </div>

              {/* Sources */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Fuentes <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                </div>

                {sources.length > 0 && (
                  <div className="space-y-2">
                    {sources.map((src, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-600 capitalize">
                            {SOURCE_OPTS.find(s => s.type === src.type)?.label}
                          </span>
                          <button onClick={() => removeSource(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          placeholder="Título *"
                          value={src.title}
                          onChange={e => updateSource(i, 'title', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                        />
                        {(src.type === 'url' || src.type === 'video' || src.type === 'guide') && (
                          <input
                            placeholder="URL"
                            value={src.url}
                            onChange={e => updateSource(i, 'url', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                          />
                        )}
                        {src.type === 'book' && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              placeholder="Autor"
                              value={src.author}
                              onChange={e => updateSource(i, 'author', e.target.value)}
                              className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                            />
                            <input
                              placeholder="Edición"
                              value={src.edition}
                              onChange={e => updateSource(i, 'edition', e.target.value)}
                              className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => addSource(opt.type)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        <Icon className="w-3 h-3" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Anonymous toggle */}
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={cn(
                  'flex items-center gap-2.5 w-full p-3 rounded-xl border transition-all text-sm',
                  isAnonymous ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
                )}
              >
                <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0', isAnonymous ? 'bg-blue-600 border-blue-600' : 'border-slate-300')}>
                  {isAnonymous && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium">Publicar como anónimo</span>
              </button>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 pb-6 pt-3 border-t border-slate-100 flex-shrink-0">
              <button onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  'flex-1 h-11 rounded-xl font-semibold text-sm transition-all',
                  canSubmit ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                Publicar consejo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
