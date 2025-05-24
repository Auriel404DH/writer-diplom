import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ChapterList } from "@/components/ChapterList";
import { WritingEnvironment } from "@/components/WritingEnvironment";
import { ObjectCardPanel } from "@/components/ObjectCardPanel";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Chapter } from "@/shared/types";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EditorPage() {
  const { bookId, chapterId } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookTitle, setBookTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: [`/api/works/${bookId}`],
    enabled: !!bookId,
  });

  const { data: chapter, isLoading: isLoadingChapter } = useQuery<Chapter>({
    queryKey: [`/api/works/chapters/${chapterId}`],
    enabled: !!chapterId,
  });

  const { data: chapters, isLoading: isLoadingChapters } = useQuery<Chapter[]>({
    queryKey: [`/api/works/${bookId}/chapters`],
    enabled: !!bookId,
  });

  useEffect(() => {
    if (book) {
      setBookTitle(book.title);
    }
  }, [book]);

  useEffect(() => {
    if (bookId && !chapterId && chapters && chapters.length > 0) {
      setLocation(`/editor/${bookId}/${chapters[0].id}`);
    }
  }, [bookId, chapterId, chapters, setLocation]);

  const updateBookTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      await apiRequest("PATCH", `/api/works/${bookId}`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/works/${bookId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/works"] });
      setIsEditingTitle(false);
      toast({
        title: "Название обновлено",
        description: "Название книги успешно изменено",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить название: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/works/${bookId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/works/${bookId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/works"] });
      toast({
        title: "Книга опубликована",
        description: "Ваша книга успешно опубликована.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка публикации",
        description: `Не удалось опубликовать книгу: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookTitle(e.target.value);
  };

  const handleTitleSave = () => {
    if (bookTitle.trim()) {
      updateBookTitleMutation.mutate(bookTitle.trim());
    } else {
      setBookTitle(book?.title || "");
      setIsEditingTitle(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setBookTitle(book?.title || "");
      setIsEditingTitle(false);
    }
  };

  const isLoading = isLoadingBook || (chapterId && isLoadingChapter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 flex flex-col">
        <Tabs defaultValue="editor" className="flex-1 flex flex-col">
          <div className="bg-white border-b border-neutral-200">
            <div className="container mx-auto px-4 lg:px-8">
              <TabsList className="h-auto p-0 border-b-0">
                <TabsTrigger
                  value="editor"
                  className="px-4 py-3 rounded-none text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Редактор
                </TabsTrigger>
                <TabsTrigger
                  value="cards"
                  className="px-4 py-3 rounded-none text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Карточки объектов
                </TabsTrigger>
                <TabsTrigger
                  value="structure"
                  className="px-4 py-3 rounded-none text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Структура
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="px-4 py-3 rounded-none text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Настройки
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent
            value="editor"
            className="flex-1 flex flex-col lg:flex-row border-none p-0 mt-0"
          >
            <div className="w-full lg:w-64 border-r border-neutral-200 bg-white flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-700">
                      Моя книга
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <i className="fas fa-ellipsis-h text-xs"></i>
                    </Button>
                  </div>

                  <div className="mt-2 relative">
                    {isEditingTitle ? (
                      <div className="flex items-center">
                        <Input
                          value={bookTitle}
                          onChange={handleTitleChange}
                          onBlur={handleTitleSave}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full text-base font-medium py-1"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div
                          className="w-full text-base font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setIsEditingTitle(true)}
                        >
                          {book?.title || "Моя книга"}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-neutral-700"
                          onClick={() => setIsEditingTitle(true)}
                        >
                          <i className="fas fa-pencil-alt text-xs"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {book && (
                  <ChapterList bookId={book._id} currentChapterId={chapterId} />
                )}
              </div>

              {book && !book.published && (
                <div className="p-1.5 border-t border-neutral-200">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => publishMutation.mutate()}
                  >
                    Опубликовать книгу
                  </Button>
                </div>
              )}
            </div>

            {/* Основной контент */}
            {chapter ? (
              <WritingEnvironment chapter={chapter} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-neutral-50">
                <div className="text-center p-6">
                  <h3 className="text-xl font-medium mb-2">Выберите главу</h3>
                  <p className="text-muted-foreground">
                    Выберите существующую главу или создайте новую, чтобы начать
                    писать
                  </p>
                </div>
              </div>
            )}

            {chapter && (
              <ObjectCardPanel
                bookId={bookId ?? ""}
                chapterId={chapter.id}
                chapters={chapters}
              />
            )}
          </TabsContent>

          <TabsContent value="cards" className="flex-1 border-none p-0 mt-0">
            <div className="flex flex-1">
              {chapter ? (
                <div className="flex flex-col w-full">
                  <div className="container mx-auto p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      Карточки объектов
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Управляйте всеми карточками объектов из вашей книги
                    </p>
                  </div>
                  <div className="flex-1 flex">
                    <ObjectCardPanel
                      bookId={bookId ?? ""}
                      chapterId={chapter.id}
                      chapters={chapters}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-medium mb-2">Выберите главу</h3>
                    <p className="text-muted-foreground">
                      Выберите главу для управления карточками объектов
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="structure"
            className="flex-1 border-none p-0 mt-0"
          >
            <div className="flex flex-1">
              {book ? (
                <div className="flex flex-col w-full">
                  <div className="container mx-auto p-6">
                    <h2 className="text-2xl font-bold mb-4">Структура книги</h2>
                    <p className="text-muted-foreground mb-6">
                      Организуйте главы и создайте сюжетную линию вашей книги
                    </p>
                  </div>
                  <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Chapters Section */}
                      <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">Главы</h3>
                          <p className="text-sm text-muted-foreground">
                            Перетаскивайте главы для изменения порядка
                          </p>
                        </div>

                        {isLoadingChapters ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chapters &&
                              chapters.map((chapter, index) => (
                                <div
                                  key={chapter.id}
                                  draggable={true}
                                  className="flex items-center justify-between p-3 border rounded-md hover:bg-neutral-50 cursor-move"
                                >
                                  <div className="flex items-center">
                                    <span className="text-neutral-500 mr-2 w-6 text-center">
                                      {index + 1}.
                                    </span>
                                    <span>{chapter.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {chapter.published && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                        Опубликовано
                                      </span>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setLocation(
                                          `/editor/${bookId}/${chapter.id}`,
                                        )
                                      }
                                    >
                                      Редактировать
                                    </Button>
                                  </div>
                                </div>
                              ))}

                            {(!chapters || chapters.length === 0) && (
                              <div className="text-center p-6 border border-dashed rounded-md">
                                <p className="text-muted-foreground mb-4">
                                  Добавьте главы к вашей книге
                                </p>
                                <Button
                                  onClick={() => {
                                    setLocation("/editor/" + bookId);
                                  }}
                                >
                                  Добавить главу
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Events/Timeline Section */}
                      <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">
                            Сюжетная линия
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Основные события книги
                          </p>
                        </div>

                        {isLoadingChapters ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : chapters &&
                          chapters.filter((c) => c.summary).length > 0 ? (
                          <div className="space-y-6">
                            {chapters
                              .filter((chapter) => chapter.summary)
                              .map((chapter, index) => (
                                <div
                                  key={chapter.id}
                                  className="relative pl-6 border-l-2 border-primary"
                                >
                                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                                  <h4 className="font-medium">
                                    {chapter.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {chapter.summary}
                                  </p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 border border-dashed rounded-md">
                            <p className="text-muted-foreground mb-4">
                              Добавьте краткие описания событий в редакторе
                              глав, чтобы построить сюжетную линию
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-medium mb-2">
                      Книга не найдена
                    </h3>
                    <p className="text-muted-foreground">
                      Не удалось загрузить информацию о книге
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 border-none p-0 mt-0">
            <div className="flex flex-1">
              {book ? (
                <div className="flex flex-col w-full">
                  <div className="container mx-auto p-6">
                    <h2 className="text-2xl font-bold mb-4">Настройки книги</h2>
                    <p className="text-muted-foreground mb-6">
                      Настройте параметры вашей книги, жанры и метаданные
                    </p>
                  </div>
                  <div className="container mx-auto px-6">
                    <div className="w-full lg:w-1/2 mx-auto">
                      <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-6">
                        <form className="space-y-6">
                          <div>
                            <label
                              htmlFor="title"
                              className="block text-sm font-medium text-neutral-700 mb-1"
                            >
                              Название книги
                            </label>
                            <Input
                              id="title"
                              value={bookTitle}
                              onChange={handleTitleChange}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-neutral-700 mb-1"
                            >
                              Описание
                            </label>
                            <textarea
                              id="description"
                              rows={4}
                              className="w-full rounded-md border border-neutral-300 shadow-sm px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              defaultValue={book.description || ""}
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Статус публикации
                            </label>
                            <div className="mt-1 flex items-center">
                              {book.published ? (
                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                                  Опубликовано
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-amber-700 bg-amber-100 rounded-full">
                                  Черновик
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              type="button"
                              onClick={handleTitleSave}
                              disabled={updateBookTitleMutation.isPending}
                            >
                              {updateBookTitleMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Сохранить изменения
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-medium mb-2">
                      Книга не найдена
                    </h3>
                    <p className="text-muted-foreground">
                      Не удалось загрузить информацию о книге
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
