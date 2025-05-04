import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Books API
  app.get("/api/books", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      const books = await storage.getBooksByUserId(req.user.id);
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Ошибка при получении книг" });
    }
  });

  app.get("/api/books/public", async (req, res) => {
    try {
      const books = await storage.getPublishedBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching public books:", error);
      res.status(500).json({ message: "Ошибка при получении опубликованных книг" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Книга не найдена" });
      }
      
      if (book.authorId !== req.user?.id && !book.published) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Ошибка при получении книги" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const { title } = req.body;
      
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: "Название книги обязательно" });
      }
      
      const book = await storage.createBook({
        title,
        authorId: req.user.id,
      });
      
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(500).json({ message: "Ошибка при создании книги" });
    }
  });

  app.patch("/api/books/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const bookId = parseInt(req.params.id);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Книга не найдена" });
      }
      
      if (book.authorId !== req.user.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const updatedBook = await storage.updateBook(bookId, req.body);
      res.json(updatedBook);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Ошибка при обновлении книги" });
    }
  });

  // Chapters API
  app.get("/api/chapters", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      const chapters = await storage.getAllChaptersByUser(req.user.id);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Ошибка при получении глав" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      const chapter = await storage.getChapterById(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: "Глава не найдена" });
      }
      
      const book = await storage.getBookById(chapter.bookId);
      
      if (book.authorId !== req.user?.id && !book.published) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Ошибка при получении главы" });
    }
  });

  app.get("/api/books/:bookId/chapters", async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Книга не найдена" });
      }
      
      if (book.authorId !== req.user?.id && !book.published) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const chapters = await storage.getChaptersByBookId(bookId);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Ошибка при получении глав" });
    }
  });

  app.post("/api/books/:bookId/chapters", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const bookId = parseInt(req.params.bookId);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Книга не найдена" });
      }
      
      if (book.authorId !== req.user.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Название главы обязательно" });
      }
      
      const chapter = await storage.createChapter({
        title,
        bookId,
        content: "",
      });
      
      res.status(201).json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Ошибка при создании главы" });
    }
  });

  app.patch("/api/chapters/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const chapterId = parseInt(req.params.id);
      const chapter = await storage.getChapterById(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: "Глава не найдена" });
      }
      
      const book = await storage.getBookById(chapter.bookId);
      
      if (book.authorId !== req.user.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const updatedChapter = await storage.updateChapter(chapterId, req.body);
      
      // Update word count for the book
      await storage.updateBookWordCount(chapter.bookId);
      
      res.json(updatedChapter);
    } catch (error) {
      console.error("Error updating chapter:", error);
      res.status(500).json({ message: "Ошибка при обновлении главы" });
    }
  });

  app.patch("/api/chapters/:id/publish", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const chapterId = parseInt(req.params.id);
      const chapter = await storage.getChapterById(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: "Глава не найдена" });
      }
      
      const book = await storage.getBookById(chapter.bookId);
      
      if (book.authorId !== req.user.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      // Set book to published if not already
      if (!book.published) {
        await storage.updateBook(book.id, { published: true, publishedAt: new Date() });
      }
      
      const updatedChapter = await storage.updateChapter(chapterId, { 
        published: true,
        publishedAt: new Date()
      });
      
      res.json(updatedChapter);
    } catch (error) {
      console.error("Error publishing chapter:", error);
      res.status(500).json({ message: "Ошибка при публикации главы" });
    }
  });

  // Object Cards API
  app.get("/api/books/:bookId/cards", async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Книга не найдена" });
      }
      
      if (book.authorId !== req.user?.id && !book.published) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const cards = await storage.getCardsByBookId(bookId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Ошибка при получении карточек" });
    }
  });
  
  // Keep the chapter-specific endpoint for backward compatibility
  app.get("/api/chapters/:chapterId/cards", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const chapter = await storage.getChapterById(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: "Глава не найдена" });
      }
      
      const book = await storage.getBookById(chapter.bookId);
      
      if (book.authorId !== req.user?.id && !book.published) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      // Get all book cards and filter for this chapter
      const allBookCards = await storage.getCardsByBookId(chapter.bookId);
      // Get card chapter relationships to filter cards associated with this chapter
      const chapterCards = await storage.getCardChapterRelationships(chapterId);
      const chapterCardIds = new Set(chapterCards.map(cc => cc.cardId));
      
      // Filter cards that are associated with this chapter
      const cards = allBookCards.filter(card => chapterCardIds.has(card.id));
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Ошибка при получении карточек" });
    }
  });

  app.post("/api/cards", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const { type, title, description, tags, chapterIds } = req.body;
      
      if (!type || !title || !chapterIds || !Array.isArray(chapterIds) || chapterIds.length === 0) {
        return res.status(400).json({ message: "Недостаточно данных для создания карточки" });
      }
      
      // Check access to at least one chapter
      const firstChapter = await storage.getChapterById(chapterIds[0]);
      
      if (!firstChapter) {
        return res.status(404).json({ message: "Глава не найдена" });
      }
      
      const book = await storage.getBookById(firstChapter.bookId);
      
      if (book.authorId !== req.user.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const card = await storage.createCard({
        userId: req.user.id,
        type,
        title,
        description: description || "",
        tags: tags || [],
      }, chapterIds);
      
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating card:", error);
      res.status(500).json({ message: "Ошибка при создании карточки" });
    }
  });

  app.patch("/api/cards/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const cardId = parseInt(req.params.id);
      const card = await storage.getCardById(cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Карточка не найдена" });
      }
      
      if (card.userId !== req.user.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const { chapterIds, ...cardData } = req.body;
      
      const updatedCard = await storage.updateCard(cardId, cardData, chapterIds);
      res.json(updatedCard);
    } catch (error) {
      console.error("Error updating card:", error);
      res.status(500).json({ message: "Ошибка при обновлении карточки" });
    }
  });

  app.delete("/api/cards/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const cardId = parseInt(req.params.id);
      const card = await storage.getCardById(cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Карточка не найдена" });
      }
      
      if (card.userId !== req.user.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      await storage.deleteCard(cardId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ message: "Ошибка при удалении карточки" });
    }
  });

  // Reviews API
  app.get("/api/books/:bookId/reviews", async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Книга не найдена" });
      }
      
      if (!book.published && book.authorId !== req.user?.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const reviews = await storage.getReviewsByBookId(bookId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Ошибка при получении отзывов" });
    }
  });

  app.post("/api/books/:bookId/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Не авторизован" });
      
      const bookId = parseInt(req.params.bookId);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Книга не найдена" });
      }
      
      if (!book.published) {
        return res.status(400).json({ message: "Нельзя оставлять отзывы на неопубликованные книги" });
      }
      
      if (book.authorId === req.user.id) {
        return res.status(400).json({ message: "Нельзя оставлять отзывы на собственные книги" });
      }
      
      const { content, rating } = req.body;
      
      if (!content || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Некорректные данные отзыва" });
      }
      
      const review = await storage.createReview({
        userId: req.user.id,
        bookId,
        content,
        rating,
      });
      
      // Update book rating
      await storage.updateBookRating(bookId);
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Ошибка при создании отзыва" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
