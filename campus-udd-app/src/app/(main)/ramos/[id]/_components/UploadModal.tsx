'use client';

import { useState, useRef } from 'react';
import { X, Check, Upload, File } from 'lucide-react';
import { type MaterialCategory, CATEGORY_LABEL, CATEGORY_EMOJI, type RamoCourse } from './mock-data';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  course: RamoCourse;
  onClose: () => void;
  onSubmit: () => void;
}

const CATEGORIES: MaterialCategory[] = ['exam', 'notes', 'book', 'guide', 'other'];

const SEMESTERS = ['2024-2', '2024-1', '2023-2', '2023-1', '2022-2', '2022-1', '2021-2', '2021-1'];

export function UploadModal({ course, onClose, onSubmit }: UploadModalProps) {
  const [category, setCategory] = useState<MaterialCategory>('exam');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitId, setUnitId] = useState('');
  const [author, setAuthor] = useState('');
  const [semester, setSemester] = useState('2024-1');
  const [externalUrl, setExternalUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const needsFile = category !== 'book';
  const canSubmit = title.trim().length > 0 && (selectedFile !== null || externalUrl.trim() !== '');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => { onSubmit(); onClose(); }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900 text-lg">¡Material subido!</p>
            <p className="text-sm text-slate-500 text-center">Gracias por contribuir a la comunidad de {course.name}.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
              <div>
                <p className="text-xs text-slate-400 font-medium">Subir material</p>
                <p className="font-semibold text-slate-900">{course.name}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tipo de material *</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
                        category === cat
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      )}
                    >
                      <span>{CATEGORY_EMOJI[cat]}</span>
                      <span>{CATEGORY_LABEL[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Common fields */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Título *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={
                    category === 'exam' ? 'ej: Certamen 1 — 2024-1' :
                    category === 'book' ? 'ej: Cálculo — James Stewart' :
                    'ej: Apuntes completos Unidad 2'
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Descripción <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Agrega contexto útil sobre el material..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
                />
              </div>

              {/* Unit selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Unidad del programa <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <select
                  value={unitId}
                  onChange={e => setUnitId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-slate-700"
                >
                  <option value="">Selecciona una unidad...</option>
                  <option value="all">Todas las unidades</option>
                  {course.programUnits.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.title}</option>
                  ))}
                </select>
              </div>

              {/* Exam-specific fields */}
              {category === 'exam' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Semestre</label>
                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-slate-700"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Book-specific */}
              {category === 'book' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Autor</label>
                  <input
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="ej: James Stewart"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
                  />
                </div>
              )}

              {/* File upload or external URL */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Archivo *</label>

                {needsFile && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
                      selectedFile
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.zip" onChange={handleFile} className="hidden" />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700 truncate max-w-[200px]">{selectedFile.name}</span>
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600">Arrastra o haz clic para seleccionar</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, PNG · máx. 20 MB</p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {needsFile && <div className="flex-1 h-px bg-slate-200" />}
                  {needsFile && <span className="text-xs text-slate-400 flex-shrink-0">o</span>}
                  {needsFile && <div className="flex-1 h-px bg-slate-200" />}
                </div>

                <div className="space-y-1.5">
                  <input
                    value={externalUrl}
                    onChange={e => setExternalUrl(e.target.value)}
                    placeholder={category === 'book' ? 'URL del libro (Drive, sitio web...)' : 'URL externa (opcional)'}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
                  />
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
                Subir material
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
