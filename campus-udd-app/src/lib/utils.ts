import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a time string (HH:MM:SS) to display format (HH:MM) */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** Format a date string (YYYY-MM-DD) to locale display */
export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Calculate minutes remaining from now to a time today */
export function minutesUntil(time: string): number {
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));
}

/** Check if a time range is currently active */
export function isLiveNow(startTime: string, endTime: string, date?: string): boolean {
  const now = new Date();
  if (date) {
    const eventDate = new Date(date + 'T00:00:00');
    if (eventDate.toDateString() !== now.toDateString()) return false;
  }
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
}

/** Validate UDD institutional email */
export function isInstitutionalEmail(email: string): boolean {
  return /@(udd\.cl|mail\.udd\.cl)$/i.test(email);
}
