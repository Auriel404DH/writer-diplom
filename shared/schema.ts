import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  doublePrecision,
  json,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
  cards: many(cards),
  reviews: many(reviews),
}));

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  published: boolean("published").default(false).notNull(),
  rating: doublePrecision("rating").default(0),
  wordCount: integer("word_count").default(0),
  chapterCount: integer("chapter_count").default(0),
  viewCount: integer("view_count").default(0),
  reviewCount: integer("review_count").default(0),
  genres: json("genres").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  publishedAt: timestamp("published_at"),
});

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(users, {
    fields: [books.authorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  reviews: many(reviews),
}));

// Chapters table
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  content: text("content").default(""),
  summary: text("summary"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  publishedAt: timestamp("published_at"),
});

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  book: one(books, {
    fields: [chapters.bookId],
    references: [books.id],
  }),
  cardRelations: many(cardChapters),
}));

// Object Cards table
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'character', 'location', 'item', 'event'
  title: text("title").notNull(),
  description: text("description").default(""),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const cardsRelations = relations(cards, ({ one, many }) => ({
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
  chapterRelations: many(cardChapters),
}));

// Card-Chapter relation table (many-to-many)
export const cardChapters = pgTable("card_chapters", {
  cardId: integer("card_id").references(() => cards.id).notNull(),
  chapterId: integer("chapter_id").references(() => chapters.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.cardId, t.chapterId] }),
}));

export const cardChaptersRelations = relations(cardChapters, ({ one }) => ({
  card: one(cards, {
    fields: [cardChapters.cardId],
    references: [cards.id],
  }),
  chapter: one(chapters, {
    fields: [cardChapters.chapterId],
    references: [chapters.id],
  }),
}));

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").notNull(),
}, (t) => ({
  userBookIdx: uniqueIndex("user_book_idx").on(t.userId, t.bookId),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id],
  }),
}));

// Zod Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Имя пользователя должно содержать не менее 3 символов"),
  password: (schema) => schema.min(6, "Пароль должен содержать не менее 6 символов"),
});

export const insertBookSchema = createInsertSchema(books);
export const insertChapterSchema = createInsertSchema(chapters);
export const insertCardSchema = createInsertSchema(cards);
export const insertReviewSchema = createInsertSchema(reviews, {
  rating: (schema) => schema.min(1, "Минимальная оценка - 1").max(5, "Максимальная оценка - 5"),
  content: (schema) => schema.min(3, "Отзыв должен содержать не менее 3 символов"),
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
