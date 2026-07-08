'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { type Professor, ALL_TAGS } from './mock-data';
import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';

interface ReviewModalProps {
  professor: Professor;
  onClose: () => void;
}

const STEP_LABELS = ['Ramo', 'Calificación', 'Comentario'];

const STAR_LABELS = ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

export function ReviewModal({ professor, onClose }: ReviewModalProps) {
  const [step, setStep] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const canNext0 = selectedCourse !== '';
  const canNext1 = rating > 0;

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 5 ? [...prev, tag] : prev
    );
  }

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(onClose, 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900 text-lg text-center">¡Reseña enviada!</p>
            <p className="text-slate-500 text-sm text-center">Gracias por ayudar a tu comunidad.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Calificar docente
                </p>
                <p className="font-semibold text-slate-900 leading-tight">
                  {professor.title} {professor.fullName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0 px-5 py-3 border-b border-slate-100">
              {STEP_LABELS.map((label, i) => (
                <div key={label} className="flex items-center flex-1">
                  <div className={cn(
                    'flex items-center gap-1.5',
                    i <= step ? 'text-blue-600' : 'text-slate-300'
                  )}>
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                      i < step ? 'bg-blue-600 text-white' :
                      i === step ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200' :
                      'bg-slate-100 text-slate-400'
                    )}>
                      {i < step ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className={cn('text-[11px] font-medium hidden sm:block', i <= step ? 'text-slate-700' : 'text-slate-400')}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={cn('h-px flex-1 mx-2', i < step ? 'bg-blue-300' : 'bg-slate-200')} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="px-5 py-4 min-h-[220px]">
              {/* Step 0: Select course */}
              {step === 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">¿En qué ramo cursaste con este docente?</p>
                  <div className="flex flex-wrap gap-2">
                    {professor.courseRatings.map(course => (
                      <button
                        key={course.courseId}
                        onClick={() => setSelectedCourse(course.courseId)}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                          selectedCourse === course.courseId
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                        )}
                      >
                        <span className="block font-semibold">{course.name}</span>
                        <span className={cn('block text-[10px]', selectedCourse === course.courseId ? 'text-blue-200' : 'text-slate-400')}>
                          {course.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Rating + Tags */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">¿Cómo calificarías al docente?</p>
                    <div className="flex flex-col items-center gap-2 py-3">
                      <StarRating value={rating} onChange={setRating} size="lg" />
                      <p className={cn('text-sm font-medium transition-colors', rating > 0 ? 'text-slate-700' : 'text-slate-300')}>
                        {rating > 0 ? STAR_LABELS[rating] : 'Selecciona una calificación'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Tags descriptivos <span className="text-slate-400 font-normal">(máx. 5)</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_TAGS.map(tag => {
                        const selected = selectedTags.includes(tag);
                        const maxed = selectedTags.length >= 5 && !selected;
                        return (
                          <button
                            key={tag}
                            onClick={() => !maxed && toggleTag(tag)}
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                              selected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : maxed
                                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                            )}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Comment + submit */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Comentario <span className="text-slate-400 font-normal">(opcional)</span>
                    </p>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Comparte tu experiencia con este docente..."
                      rows={4}
                      maxLength={300}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none transition"
                    />
                    <p className="text-right text-[11px] text-slate-400">{comment.length}/300</p>
                  </div>

                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={cn(
                      'flex items-center gap-2.5 w-full p-3 rounded-xl border transition-all text-sm',
                      isAnonymous
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                      isAnonymous ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                    )}>
                      {isAnonymous && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium">Publicar como anónimo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 pb-6 pt-2 border-t border-slate-100">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="h-11 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={() => step < 2 ? setStep(s => s + 1) : handleSubmit()}
                disabled={step === 0 ? !canNext0 : step === 1 ? !canNext1 : false}
                className={cn(
                  'flex-1 h-11 rounded-xl font-semibold text-sm transition-all',
                  (step === 0 ? canNext0 : step === 1 ? canNext1 : true)
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                {step < 2 ? 'Continuar' : 'Enviar reseña'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
