import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, BookOpenIcon, LayoutList, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/works"],
  });

  const createBookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/works", {
        title: "Новая книга",
      });
      return res.json();
    },
    onSuccess: (newBook) => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Книга создана",
        description: "Новая книга успешно создана",
      });
      setLocation(`/editor/${newBook.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать книгу: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateBook = () => {
    createBookMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Добро пожаловать, {user?.username || "автор"}!
          </h1>
          <Button
            onClick={handleCreateBook}
            disabled={createBookMutation.isPending}
          >
            {createBookMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="mr-2 h-4 w-4" />
            )}
            Создать книгу
          </Button>
        </div>

        <Tabs defaultValue="my-books" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-books">Мои книги</TabsTrigger>
            <TabsTrigger value="published">Опубликованные</TabsTrigger>
          </TabsList>

          <TabsContent value="my-books">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : books && books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <Card
                    key={book.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{book.title}</CardTitle>
                      <CardDescription>
                        Создано: {formatDate(book.createdAt)}
                        {book.published ? " • Опубликовано" : " • Черновик"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-muted-foreground text-sm">
                        {book.chapterCount || 0} глав • {book.wordCount || 0}{" "}
                        слов
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/editor/${book.id}`}>
                          <LayoutList className="mr-2 h-4 w-4" />
                          Редактировать
                        </Link>
                      </Button>
                      {book.published && (
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/library/${book.id}`}>
                            <BookOpenIcon className="mr-2 h-4 w-4" />
                            Читать
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  У вас пока нет книг
                </h3>
                <p className="text-muted-foreground mb-6">
                  Начните свой творческий путь, создав первую книгу
                </p>
                <Button onClick={handleCreateBook}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Создать книгу
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="published">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : books?.filter((book) => book.published).length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books
                  .filter((book) => book.published)
                  .map((book) => (
                    <Card
                      key={book.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{book.title}</CardTitle>
                        <CardDescription>
                          Опубликовано:{" "}
                          {formatDate(
                            book.publishedAt ||
                              book.updatedAt ||
                              book.createdAt,
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-muted-foreground text-sm">
                          {book.chapterCount || 0} глав • {book.wordCount || 0}{" "}
                          слов
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/editor/${book.id}`}>
                            <LayoutList className="mr-2 h-4 w-4" />
                            Редактировать
                          </Link>
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/library/${book.id}`}>
                            <BookOpenIcon className="mr-2 h-4 w-4" />
                            Читать
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  У вас пока нет опубликованных книг
                </h3>
                <p className="text-muted-foreground mb-6">
                  Опубликуйте свою книгу, чтобы поделиться ею с миром
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
