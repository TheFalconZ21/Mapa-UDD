'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  size?: keyof typeof SIZE_MAP;
  showValue?: boolean;
  reviewCount?: number;
}

export function StarRating({ value, onChange, size = 'sm', showValue = false, reviewCount }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const isInteractive = !!onChange;
  const display = isInteractive ? (hovered || value) : value;

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('flex items-center gap-0.5', isInteractive && 'cursor-pointer')}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = display >= star;
          return (
            <Star
              key={star}
              className={cn(
                SIZE_MAP[size],
                'transition-colors duration-100',
                filled ? 'text-amber-400' : 'text-slate-200',
                isInteractive && 'hover:scale-110 transition-transform'
              )}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={filled ? 0 : 1.5}
              onMouseEnter={isInteractive ? () => setHovered(star) : undefined}
              onMouseLeave={isInteractive ? () => setHovered(0) : undefined}
              onClick={isInteractive ? () => onChange(star) : undefined}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-400">({reviewCount})</span>
      )}
    </div>
  );
}

// Compact inline version: "★ 4.8 · 32 reseñas"
export function RatingBadge({ rating, count, size = 'sm' }: { rating: number; count: number; size?: 'sm' | 'lg' }) {
  return (
    <div className={cn('flex items-center gap-1', size === 'lg' ? 'gap-2' : 'gap-1')}>
      <Star
        className={cn(size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5', 'text-amber-400')}
        fill="currentColor"
        strokeWidth={0}
      />
      <span className={cn('font-bold text-slate-900', size === 'lg' ? 'text-2xl' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      <span className={cn('text-slate-400', size === 'lg' ? 'text-base' : 'text-xs')}>
        · {count} {count === 1 ? 'reseña' : 'reseñas'}
      </span>
    </div>
  );
}
