// Types for frontend use

export interface User {
  id: number;
  username: string;
  password?: string; // Excluded in API responses
}

export interface Book {
  id: number;
  authorId: number;
  authorName?: string;
  title: string;
  description?: string | null;
  published: boolean;
  rating?: number;
  wordCount: number;
  chapterCount: number;
  viewCount?: number;
  reviewCount?: number;
  genres?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date | null;
}

export interface Chapter {
  id: number;
  bookId: number;
  title: string;
  content: string;
  summary?: string | null;
  published: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date | null;
}

export interface ObjectCard {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  chapterIds?: number[];
}

export interface Review {
  id: number;
  userId: number;
  username?: string;
  bookId: number;
  content: string;
  rating: number;
  createdAt: string | Date;
}

// Type definitions for card types
export const cardTypes = [
  { id: 'character', label: 'Персонаж', icon: 'user', className: 'card-character', bgClass: 'bg-secondary-50 text-secondary-700', iconClass: 'text-secondary-600' },
  { id: 'location', label: 'Локация', icon: 'map-marker-alt', className: 'card-location', bgClass: 'bg-emerald-50 text-emerald-700', iconClass: 'text-emerald-600' },
  { id: 'item', label: 'Предмет', icon: 'cube', className: 'card-item', bgClass: 'bg-amber-50 text-amber-700', iconClass: 'text-amber-600' },
  { id: 'event', label: 'Событие', icon: 'bolt', className: 'card-event', bgClass: 'bg-red-50 text-red-700', iconClass: 'text-red-600' }
];

export const cardTypesMap: Record<string, (typeof cardTypes)[number]> = {
  character: cardTypes[0],
  location: cardTypes[1],
  item: cardTypes[2],
  event: cardTypes[3],
};
