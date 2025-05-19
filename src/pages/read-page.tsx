import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Book, Calendar, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ChapterList } from "@/components/ChapterList";
import { Book as BookType, Chapter } from "@/shared/types";

export default function ReadPage() {
  const { bookId, chapterId } = useParams<{
    bookId: string;
    chapterId?: string;
  }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: book, isLoading: isLoadingBook } = useQuery<BookType>({
    queryKey: [`/api/works/${bookId}`],
  });

  const { data: chapter, isLoading: isLoadingChapter } = useQuery<Chapter>({
    queryKey: [`/api/works/chapters/${chapterId}`],
    enabled: !!chapterId,
  });

  if (isLoadingBook || (chapterId && isLoadingChapter)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-neutral-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-neutral-200 rounded col-span-2"></div>
                <div className="h-2 bg-neutral-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Книга не найдена</h2>
        <p className="text-neutral-600 mb-6">
          Запрошенная книга не существует или не опубликована.
        </p>
        <Button onClick={() => setLocation("/library")}>
          Вернуться в библиотеку
        </Button>
      </div>
    );
  }

  if (!book.published) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Книга не опубликована</h2>
        <p className="text-neutral-600 mb-6">
          Эта книга ещё не опубликована автором.
        </p>
        <Button onClick={() => setLocation("/library")}>
          Вернуться в библиотеку
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto py-4 px-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() =>
              setLocation(chapterId ? `/read/${bookId}` : "/library")
            }
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {chapterId ? "К оглавлению" : "К библиотеке"}
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{book.title}</h1>
              <div className="flex items-center mt-1 text-sm text-neutral-500">
                <div className="flex items-center mr-4">
                  <Book className="h-4 w-4 mr-1" />
                  <span>{book.authorName || "Автор"}</span>
                </div>
                {book.publishedAt && (
                  <div className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(book.publishedAt)}</span>
                  </div>
                )}
                {book.viewCount !== undefined && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{book.viewCount} просмотров</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 md:mt-0">
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {book.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {book.description && (
            <p className="mt-2 text-neutral-600">{book.description}</p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {chapterId ? (
          chapter ? (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold mb-4">{chapter.title}</h2>
              <Separator className="mb-6" />
              <div className="prose prose-neutral max-w-none">
                <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-bold">Глава не найдена</h2>
              <p className="text-neutral-600 mt-2">
                Запрошенная глава не существует или не опубликована.
              </p>
              <Button
                onClick={() => setLocation(`/read/${bookId}`)}
                className="mt-4"
              >
                К оглавлению
              </Button>
            </div>
          )
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">Оглавление</h2>
            <ChapterList
              bookId={parseInt(bookId)}
              mode="read"
              canEdit={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
