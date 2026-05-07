import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'HIGH':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'MEDIUM':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'LOW':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    default:
      return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'TODO':
      return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    case 'IN_PROGRESS':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'IN_REVIEW':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'DONE':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    default:
      return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
  }
}

export function getLeaveStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'APPROVED':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'REJECTED':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'CANCELLED':
      return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    default:
      return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=178582&color=fff&size=128`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
