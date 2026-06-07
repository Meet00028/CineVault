import { theme } from '../constants/theme';

export function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRuntime(minutes) {
  if (!minutes || typeof minutes !== 'number') return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return `${h}h ${m}m`;
}

export function getRatingColor(rating10) {
  if (rating10 == null) return theme.colors.textSecondary;
  if (rating10 >= 7.5) return theme.colors.ratingGreen;
  if (rating10 >= 6) return '#F5C518';
  return theme.colors.primary;
}

export function truncate(str, max = 140) {
  if (!str) return '';
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1).trim()}…`;
}

