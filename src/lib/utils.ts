import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDatetime(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = countWords(text);
  return Math.ceil(words / wordsPerMinute);
}

export const writingThemes = [
  { id: 1, className: 'writing-theme-1', label: 'Светлая' },
  { id: 2, className: 'writing-theme-2', label: 'Янтарная' },
  { id: 3, className: 'writing-theme-3', label: 'Лавандовая' },
  { id: 4, className: 'writing-theme-4', label: 'Тёмная' },
  { id: 5, className: 'writing-theme-5', label: 'Ночная' }
];

export const soundOptions = [
  { id: 'silence', label: 'Тишина' },
  { id: 'rain', label: 'Дождь' },
  { id: 'fireplace', label: 'Камин' },
  { id: 'space', label: 'Космос' },
  { id: 'forest', label: 'Лес' }
];

export const cardTypes = [
  { id: 'character', label: 'Персонаж', icon: 'user', className: 'card-character', bgClass: 'bg-secondary-50 text-secondary-700', iconClass: 'text-secondary-600' },
  { id: 'location', label: 'Локация', icon: 'map-marker-alt', className: 'card-location', bgClass: 'bg-emerald-50 text-emerald-700', iconClass: 'text-emerald-600' },
  { id: 'item', label: 'Предмет', icon: 'cube', className: 'card-item', bgClass: 'bg-amber-50 text-amber-700', iconClass: 'text-amber-600' },
  { id: 'event', label: 'Событие', icon: 'bolt', className: 'card-event', bgClass: 'bg-red-50 text-red-700', iconClass: 'text-red-600' }
];
