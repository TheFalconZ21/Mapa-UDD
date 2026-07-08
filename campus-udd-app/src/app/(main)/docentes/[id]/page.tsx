'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Star, BookOpen, MessageSquare, User } from 'lucide-react';
import { PROFESSORS } from '../_components/mock-data';
import { ProfessorAvatar } from '../_components/ProfessorCard';
import { RatingBadge, StarRating } from '../_components/StarRating';
import { ReviewModal } from '../_components/ReviewModal';
import { cn } from '@/lib/utils';

const RATING_COLOR = (r: number) =>
  r >= 4.5 ? 'text-emerald-600 bg-emerald-50' :
  r >= 3.5 ? 'text-amber-600 bg-amber-50' :
  'text-red-500 bg-red-50';

export default function ProfessorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const professor = PROFESSORS.find(p => p.id === id);

  if (!professor) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-slate-500">Docente no encontrado.</p>
        <button onClick={() => router.back()} className="text-blue-600 font-medium text-sm hover:underline">
          Volver
        </button>
      </div>
    );
  }

  const globalRatingBar = (count: number, total: number) => (total > 0 ? (count / total) * 100 : 0);

  // Distribution for the rating bar chart (fake but realistic based on avgRating)
  const ratingDist = [5, 4, 3, 2, 1].map(stars => {
    const base = Math.max(0, professor.avgRating - stars);
    const weight = Math.max(0, 1 - Math.abs(professor.avgRating - stars) * 0.7);
    const count = Math.round(professor.reviewCount * weight * 0.4);
    return { stars, count };
  });

  return (
    <>
      <div className="flex flex-col flex-1">
        {/* Top nav */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 flex items-center gap-3 px-4 h-12 shadow-sm">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Docentes</span>
          </button>
        </div>

        {/* Profile hero */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <ProfessorAvatar fullName={professor.fullName} avatarColor={professor.avatarColor} size="xl" />

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">{professor.department}</p>
              <h1 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                {professor.title} {professor.fullName}
              </h1>
              <div className="mt-2">
                <RatingBadge rating={professor.avgRating} count={professor.reviewCount} size="lg" />
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                Calificar docente
              </button>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-600 leading-relaxed mt-4 max-w-2xl">{professor.bio}</p>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-w-2xl">

          {/* Rating breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <Star className="w-4 h-4 text-amber-400" fill="currentColor" strokeWidth={0} />
              <h2 className="font-semibold text-slate-900 text-sm">Calificación global</h2>
            </div>
            <div className="flex gap-4 p-4">
              {/* Big number */}
              <div className="flex flex-col items-center justify-center w-20 flex-shrink-0">
                <span className="text-4xl font-black text-slate-900">{professor.avgRating.toFixed(1)}</span>
                <StarRating value={professor.avgRating} size="sm" />
                <span className="text-[10px] text-slate-400 mt-1">{professor.reviewCount} reseñas</span>
              </div>
              {/* Bar chart */}
              <div className="flex-1 space-y-1.5">
                {ratingDist.map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 w-3 text-right flex-shrink-0">{stars}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${globalRatingBar(count, professor.reviewCount)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 w-4 flex-shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top tags */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <span className="text-base">💬</span>
              <h2 className="font-semibold text-slate-900 text-sm">Lo que dicen los estudiantes</h2>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {professor.topTags.map((tag, i) => {
                const maxCount = professor.topTags[0].count;
                const intensity = tag.count / maxCount;
                return (
                  <div
                    key={tag.label}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium',
                      i === 0
                        ? 'bg-blue-600 text-white border-blue-600'
                        : intensity > 0.6
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    )}
                  >
                    <span>#{tag.label}</span>
                    <span className={cn(
                      'text-[10px] font-bold rounded-full px-1.5 py-0.5',
                      i === 0 ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                    )}>
                      {tag.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating by course */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-900 text-sm">Rating por ramo</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {professor.courseRatings.map(course => (
                <div key={course.courseId} className="flex items-center justify-between px-4 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{course.name}</p>
                    <p className="text-[11px] text-slate-400">{course.code} · {course.reviewCount} reseñas</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StarRating value={course.avgRating} size="sm" />
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', RATING_COLOR(course.avgRating))}>
                      {course.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-900 text-sm">Reseñas recientes</h2>
            </div>
            {professor.reviews.map(review => (
              <div key={review.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
                {/* Review header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {review.isAnonymous ? 'Estudiante anónimo' : review.studentName}
                      </p>
                      <p className="text-[10px] text-slate-400">{review.courseName} · {review.createdAt}</p>
                    </div>
                  </div>
                  <StarRating value={review.rating} size="sm" />
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA to add review */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 text-sm font-medium transition-colors"
            >
              + Agregar reseña
            </button>
          </div>

          {/* Bottom spacer for mobile nav */}
          <div className="h-4" />
        </div>
      </div>

      {/* Review modal */}
      {showModal && (
        <ReviewModal professor={professor} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
