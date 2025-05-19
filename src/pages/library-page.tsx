import { AppHeader } from "@/components/AppHeader";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@/shared/types";
import { Loader2, BookOpen, Search, User, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export default function LibraryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books/public"],
  });

  const filteredBooks = books?.filter(
    (book) =>
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authorName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Библиотека</h1>

          <div className="w-full md:w-auto relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск книг и авторов..."
              className="w-full md:w-[300px] pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Все книги</TabsTrigger>
            <TabsTrigger value="new">Новинки</TabsTrigger>
            <TabsTrigger value="popular">Популярные</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBooks && filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isOwner={book.authorId === user?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Книги не найдены</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос."
                    : "В библиотеке пока нет опубликованных книг."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBooks && filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks
                  .sort(
                    (a, b) =>
                      new Date(b.publishedAt || b.createdAt).getTime() -
                      new Date(a.publishedAt || a.createdAt).getTime(),
                  )
                  .slice(0, 6)
                  .map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isOwner={book.authorId === user?.id}
                      isNew
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Новых книг пока нет
                </h3>
                <p className="text-muted-foreground">
                  Загляните позже, скоро здесь появятся новинки.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBooks && filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks
                  .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                  .slice(0, 6)
                  .map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isOwner={book.authorId === user?.id}
                      isPopular
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Популярных книг пока нет
                </h3>
                <p className="text-muted-foreground">
                  Читайте и оценивайте книги, чтобы они появились в этом
                  разделе.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface BookCardProps {
  book: Book;
  isOwner?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}

function BookCard({ book, isOwner, isNew, isPopular }: BookCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
      <div className="border-b p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm space-x-2">
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-amber-500" />
              {book.rating || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <User className="h-3 w-3 mr-1" />
          <span>{book.authorName || "Неизвестный автор"}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm mb-3 line-clamp-3">
          {book.description || "Описание отсутствует"}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {book.genres?.map((genre, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full"
            >
              {genre}
            </span>
          ))}

          {isNew && (
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              Новинка
            </span>
          )}

          {isPopular && (
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
              Популярное
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-4">
          <span>
            Опубликовано: {formatDate(book.publishedAt || book.createdAt)}
          </span>
          <span className="mx-2">•</span>
          <span>{book.chapterCount || 0} глав</span>
          <span className="mx-2">•</span>
          <span>{book.wordCount || 0} слов</span>
        </div>

        <div className="flex justify-between gap-2">
          <Button variant="default" size="sm" asChild>
            <Link href={`/read/${book.id}`}>Читать</Link>
          </Button>

          {isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/editor/${book.id}`}>Редактировать</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
