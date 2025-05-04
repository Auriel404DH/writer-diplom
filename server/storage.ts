import { db } from "@db";
import {
  users,
  books,
  chapters,
  cards,
  cardChapters,
  reviews,
  insertUserSchema,
  insertBookSchema,
  insertChapterSchema,
  insertCardSchema,
  insertReviewSchema,
  InsertUser
} from "@shared/schema";
import { eq, and, desc, asc, sql, count, sum, avg } from "drizzle-orm";
import { User, Book, Chapter, ObjectCard, Review } from "@shared/types";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { Pool } from '@neondatabase/serverless';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  createUser(userData: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  
  // Book methods
  createBook(bookData: any): Promise<Book>;
  getBookById(id: number): Promise<Book | null>;
  getBooksByUserId(userId: number): Promise<Book[]>;
  getPublishedBooks(): Promise<Book[]>;
  updateBook(id: number, bookData: any): Promise<Book>;
  updateBookWordCount(id: number): Promise<void>;
  updateBookRating(id: number): Promise<void>;
  
  // Chapter methods
  createChapter(chapterData: any): Promise<Chapter>;
  getChapterById(id: number): Promise<Chapter | null>;
  getChaptersByBookId(bookId: number): Promise<Chapter[]>;
  getAllChaptersByUser(userId: number): Promise<Chapter[]>;
  updateChapter(id: number, chapterData: any): Promise<Chapter>;
  
  // Card methods
  createCard(cardData: any, chapterIds: number[]): Promise<ObjectCard>;
  getCardById(id: number): Promise<ObjectCard | null>;
  getCardsByChapterId(chapterId: number): Promise<ObjectCard[]>;
  getCardsByBookId(bookId: number): Promise<ObjectCard[]>;
  getCardChapterRelationships(chapterId: number): Promise<{cardId: number, chapterId: number}[]>;
  updateCard(id: number, cardData: any, chapterIds?: number[]): Promise<ObjectCard>;
  deleteCard(id: number): Promise<void>;
  
  // Review methods
  createReview(reviewData: any): Promise<Review>;
  getReviewsByBookId(bookId: number): Promise<Review[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }
  
  // User methods
  async createUser(userData: InsertUser): Promise<User> {
    const validatedData = insertUserSchema.parse(userData);
    const [newUser] = await db.insert(users).values(validatedData).returning();
    return newUser;
  }
  
  async getUser(id: number): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return result || null;
  }
  
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    return result || null;
  }
  
  // Book methods
  async createBook(bookData: any): Promise<Book> {
    const validatedData = insertBookSchema.parse({
      ...bookData,
      wordCount: 0,
      chapterCount: 0,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const [newBook] = await db.insert(books).values(validatedData).returning();
    return newBook;
  }
  
  async getBookById(id: number): Promise<Book | null> {
    const book = await db.query.books.findFirst({
      where: eq(books.id, id),
      with: {
        author: true
      }
    });
    
    if (!book) return null;
    
    // Count chapters
    const chaptersResult = await db.select({ 
      count: count()
    })
    .from(chapters)
    .where(eq(chapters.bookId, id));
    
    const chapterCount = chaptersResult[0]?.count || 0;
    
    return {
      ...book,
      authorName: book.author.username,
      chapterCount
    };
  }
  
  async getBooksByUserId(userId: number): Promise<Book[]> {
    const userBooks = await db.query.books.findMany({
      where: eq(books.authorId, userId),
      orderBy: [desc(books.updatedAt)],
      with: {
        author: true
      }
    });
    
    // Get chapter counts for all books
    const bookIds = userBooks.map(book => book.id);
    
    if (bookIds.length === 0) return [];
    
    const chaptersCount = await db.select({
      bookId: chapters.bookId,
      count: count()
    })
    .from(chapters)
    .where(sql`${chapters.bookId} IN ${bookIds}`)
    .groupBy(chapters.bookId);
    
    const chapterCountMap = chaptersCount.reduce((acc, row) => {
      acc[row.bookId] = row.count;
      return acc;
    }, {} as Record<number, number>);
    
    return userBooks.map(book => ({
      ...book,
      authorName: book.author.username,
      chapterCount: chapterCountMap[book.id] || 0
    }));
  }
  
  async getPublishedBooks(): Promise<Book[]> {
    const publishedBooks = await db.query.books.findMany({
      where: eq(books.published, true),
      orderBy: [desc(books.publishedAt), desc(books.createdAt)],
      with: {
        author: true
      }
    });
    
    // Get chapter counts for all books
    const bookIds = publishedBooks.map(book => book.id);
    
    if (bookIds.length === 0) return [];
    
    const chaptersCount = await db.select({
      bookId: chapters.bookId,
      count: count()
    })
    .from(chapters)
    .where(sql`${chapters.bookId} IN ${bookIds}`)
    .groupBy(chapters.bookId);
    
    const chapterCountMap = chaptersCount.reduce((acc, row) => {
      acc[row.bookId] = row.count;
      return acc;
    }, {} as Record<number, number>);
    
    return publishedBooks.map(book => ({
      ...book,
      authorName: book.author.username,
      chapterCount: chapterCountMap[book.id] || 0
    }));
  }
  
  async updateBook(id: number, bookData: any): Promise<Book> {
    const updateData = {
      ...bookData,
      updatedAt: new Date()
    };
    
    const [updatedBook] = await db.update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();
    
    const bookWithAuthor = await this.getBookById(id);
    return bookWithAuthor!;
  }
  
  async updateBookWordCount(id: number): Promise<void> {
    // Calculate total word count from all chapters
    const result = await db.select({
      total: sql`SUM(
        (LENGTH(${chapters.content}) - LENGTH(REPLACE(${chapters.content}, ' ', '')) + 1)
      )`
    })
    .from(chapters)
    .where(eq(chapters.bookId, id));
    
    const wordCount = parseInt(result[0]?.total || '0');
    
    // Update book
    await db.update(books)
      .set({
        wordCount,
        updatedAt: new Date()
      })
      .where(eq(books.id, id));
  }
  
  async updateBookRating(id: number): Promise<void> {
    // Calculate average rating
    const result = await db.select({
      avgRating: avg(reviews.rating),
      count: count()
    })
    .from(reviews)
    .where(eq(reviews.bookId, id));
    
    const rating = result[0]?.avgRating || 0;
    const reviewCount = result[0]?.count || 0;
    
    // Update book
    await db.update(books)
      .set({
        rating,
        reviewCount,
        updatedAt: new Date()
      })
      .where(eq(books.id, id));
  }
  
  // Chapter methods
  async createChapter(chapterData: any): Promise<Chapter> {
    const validatedData = insertChapterSchema.parse({
      ...chapterData,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const [newChapter] = await db.insert(chapters).values(validatedData).returning();
    
    // Update chapter count
    const chaptersCount = await db.select({ count: count() })
      .from(chapters)
      .where(eq(chapters.bookId, chapterData.bookId));
    
    await db.update(books)
      .set({
        chapterCount: chaptersCount[0]?.count || 0,
        updatedAt: new Date()
      })
      .where(eq(books.id, chapterData.bookId));
    
    return newChapter;
  }
  
  async getChapterById(id: number): Promise<Chapter | null> {
    const result = await db.query.chapters.findFirst({
      where: eq(chapters.id, id)
    });
    return result || null;
  }
  
  async getChaptersByBookId(bookId: number): Promise<Chapter[]> {
    return await db.query.chapters.findMany({
      where: eq(chapters.bookId, bookId),
      orderBy: [asc(chapters.id)]
    });
  }
  
  async getAllChaptersByUser(userId: number): Promise<Chapter[]> {
    const userBooks = await db.select({ id: books.id })
      .from(books)
      .where(eq(books.authorId, userId));
    
    const bookIds = userBooks.map(book => book.id);
    
    if (bookIds.length === 0) return [];
    
    return await db.query.chapters.findMany({
      where: sql`${chapters.bookId} IN ${bookIds}`,
      orderBy: [asc(chapters.bookId), asc(chapters.id)]
    });
  }
  
  async updateChapter(id: number, chapterData: any): Promise<Chapter> {
    const updateData = {
      ...chapterData,
      updatedAt: new Date()
    };
    
    const [updatedChapter] = await db.update(chapters)
      .set(updateData)
      .where(eq(chapters.id, id))
      .returning();
    
    return updatedChapter;
  }
  
  // Card methods
  async createCard(cardData: any, chapterIds: number[]): Promise<ObjectCard> {
    const validatedData = insertCardSchema.parse({
      ...cardData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const [newCard] = await db.insert(cards).values(validatedData).returning();
    
    // Create card-chapter associations
    const cardChapterValues = chapterIds.map(chapterId => ({
      cardId: newCard.id,
      chapterId
    }));
    
    await db.insert(cardChapters).values(cardChapterValues);
    
    return {
      ...newCard,
      chapterIds
    };
  }
  
  async getCardById(id: number): Promise<ObjectCard | null> {
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, id)
    });
    
    if (!card) return null;
    
    // Get chapters associated with this card
    const cardChapterRelations = await db.select({ chapterId: cardChapters.chapterId })
      .from(cardChapters)
      .where(eq(cardChapters.cardId, id));
    
    const chapterIds = cardChapterRelations.map(relation => relation.chapterId);
    
    return {
      ...card,
      chapterIds
    };
  }
  
  async getCardChapterRelationships(chapterId: number): Promise<{cardId: number, chapterId: number}[]> {
    // Return all card-chapter relationships for a specific chapter
    return await db.select({ 
      cardId: cardChapters.cardId, 
      chapterId: cardChapters.chapterId 
    })
    .from(cardChapters)
    .where(eq(cardChapters.chapterId, chapterId));
  }
  
  async getCardsByBookId(bookId: number): Promise<ObjectCard[]> {
    // First, get all chapters for this book
    const bookChapters = await this.getChaptersByBookId(bookId);
    
    if (bookChapters.length === 0) return [];
    
    const chapterIds = bookChapters.map(chapter => chapter.id);
    
    // Get card IDs related to these chapters
    const cardChapterRelations = await db.select({ cardId: cardChapters.cardId })
      .from(cardChapters)
      .where(sql`${cardChapters.chapterId} IN ${chapterIds}`);
    
    if (cardChapterRelations.length === 0) return [];
    
    // Extract unique card IDs
    const cardIdSet = new Set<number>();
    cardChapterRelations.forEach(relation => cardIdSet.add(relation.cardId));
    const cardIdArray = Array.from(cardIdSet);
    
    // Get all these cards
    const cardsResult = await db.query.cards.findMany({
      where: sql`${cards.id} IN ${cardIdArray}`,
      orderBy: [asc(cards.type), asc(cards.title)]
    });
    
    // Get all chapter associations for these cards
    const allCardChapterRelations = await db.select()
      .from(cardChapters)
      .where(sql`${cardChapters.cardId} IN ${cardIdArray}`);
    
    // Create a map of card ID to chapter IDs
    const cardChapterMap: Record<number, number[]> = {};
    
    allCardChapterRelations.forEach(relation => {
      if (!cardChapterMap[relation.cardId]) {
        cardChapterMap[relation.cardId] = [];
      }
      cardChapterMap[relation.cardId].push(relation.chapterId);
    });
    
    // Add chapter IDs to each card
    return cardsResult.map(card => ({
      ...card,
      chapterIds: cardChapterMap[card.id] || []
    }));
  }
  
  async getCardsByChapterId(chapterId: number): Promise<ObjectCard[]> {
    // Get card IDs associated with this chapter
    const cardIds = await db.select({ cardId: cardChapters.cardId })
      .from(cardChapters)
      .where(eq(cardChapters.chapterId, chapterId));
    
    if (cardIds.length === 0) return [];
    
    const cardIdArray = cardIds.map(record => record.cardId);
    
    // Get all these cards
    const cardsResult = await db.query.cards.findMany({
      where: sql`${cards.id} IN ${cardIdArray}`,
      orderBy: [asc(cards.type), asc(cards.title)]
    });
    
    // Get all chapter associations for these cards
    const allCardChapterRelations = await db.select()
      .from(cardChapters)
      .where(sql`${cardChapters.cardId} IN ${cardIdArray}`);
    
    // Create a map of card ID to chapter IDs
    const cardChapterMap: Record<number, number[]> = {};
    
    allCardChapterRelations.forEach(relation => {
      if (!cardChapterMap[relation.cardId]) {
        cardChapterMap[relation.cardId] = [];
      }
      cardChapterMap[relation.cardId].push(relation.chapterId);
    });
    
    // Add chapter IDs to each card
    return cardsResult.map(card => ({
      ...card,
      chapterIds: cardChapterMap[card.id] || []
    }));
  }
  
  async updateCard(id: number, cardData: any, chapterIds?: number[]): Promise<ObjectCard> {
    const updateData = {
      ...cardData,
      updatedAt: new Date()
    };
    
    const [updatedCard] = await db.update(cards)
      .set(updateData)
      .where(eq(cards.id, id))
      .returning();
    
    // Update chapter associations if provided
    if (chapterIds && chapterIds.length > 0) {
      // Delete existing associations
      await db.delete(cardChapters).where(eq(cardChapters.cardId, id));
      
      // Create new associations
      const cardChapterValues = chapterIds.map(chapterId => ({
        cardId: id,
        chapterId
      }));
      
      await db.insert(cardChapters).values(cardChapterValues);
    }
    
    // Get updated chapterIds
    const cardChapterRelations = await db.select({ chapterId: cardChapters.chapterId })
      .from(cardChapters)
      .where(eq(cardChapters.cardId, id));
    
    const updatedChapterIds = cardChapterRelations.map(relation => relation.chapterId);
    
    return {
      ...updatedCard,
      chapterIds: updatedChapterIds
    };
  }
  
  async deleteCard(id: number): Promise<void> {
    // Delete chapter associations first
    await db.delete(cardChapters).where(eq(cardChapters.cardId, id));
    
    // Delete the card
    await db.delete(cards).where(eq(cards.id, id));
  }
  
  // Review methods
  async createReview(reviewData: any): Promise<Review> {
    const validatedData = insertReviewSchema.parse({
      ...reviewData,
      createdAt: new Date()
    });
    
    const [newReview] = await db.insert(reviews).values(validatedData).returning({
      id: reviews.id,
      userId: reviews.userId,
      bookId: reviews.bookId,
      content: reviews.content,
      rating: reviews.rating,
      createdAt: reviews.createdAt
    });
    
    const user = await this.getUser(newReview.userId);
    
    return {
      ...newReview,
      username: user?.username || ''
    };
  }
  
  async getReviewsByBookId(bookId: number): Promise<Review[]> {
    const reviewResults = await db.query.reviews.findMany({
      where: eq(reviews.bookId, bookId),
      orderBy: [desc(reviews.createdAt)],
      with: {
        user: true
      }
    });
    
    return reviewResults.map(review => ({
      ...review,
      username: review.user.username
    }));
  }
}

export const storage = new DatabaseStorage();
