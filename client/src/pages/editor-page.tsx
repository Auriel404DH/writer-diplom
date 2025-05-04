import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { SidebarNav } from '@/components/SidebarNav';
import { ChapterList } from '@/components/ChapterList';
import { WritingEnvironment } from '@/components/WritingEnvironment';
import { ObjectCardPanel } from '@/components/ObjectCardPanel';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Chapter } from '@shared/types';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function EditorPage() {
  const { bookId, chapterId } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookTitle, setBookTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const bookIdNum = parseInt(bookId);
  const chapterIdNum = chapterId ? parseInt(chapterId) : undefined;

  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: [`/api/books/${bookIdNum}`],
    enabled: !!bookIdNum,
  });

  const { data: chapter, isLoading: isLoadingChapter } = useQuery<Chapter>({
    queryKey: [`/api/chapters/${chapterIdNum}`],
    enabled: !!chapterIdNum,
  });

  const { data: chapters, isLoading: isLoadingChapters } = useQuery<Chapter[]>({
    queryKey: [`/api/books/${bookIdNum}/chapters`],
    enabled: !!bookIdNum,
  });

  useEffect(() => {
    if (book) {
      setBookTitle(book.title);
    }
  }, [book]);

  useEffect(() => {
    if (bookIdNum && !chapterIdNum && chapters && chapters.length > 0) {
      setLocation(`/editor/${bookIdNum}/${chapters[0].id}`);
    }
  }, [bookIdNum, chapterIdNum, chapters, setLocation]);

  const updateBookTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      await apiRequest("PATCH", `/api/books/${bookIdNum}`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookIdNum}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      setIsEditingTitle(false);
      toast({
        title: "Название обновлено",
        description: "Название книги успешно изменено"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить название: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookTitle(e.target.value);
  };

  const handleTitleSave = () => {
    if (bookTitle.trim()) {
      updateBookTitleMutation.mutate(bookTitle.trim());
    } else {
      setBookTitle(book?.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setBookTitle(book?.title || '');
      setIsEditingTitle(false);
    }
  };

  const isLoading = isLoadingBook || (chapterIdNum && isLoadingChapter);

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
          
          <TabsContent value="editor" className="flex-1 flex flex-col lg:flex-row border-none p-0 mt-0">
            <div className="w-full lg:w-64 border-r border-neutral-200 bg-white">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-700">Моя книга</h2>
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
                        {book?.title || 'Моя книга'}
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
              
              {book && <ChapterList bookId={book.id} currentChapterId={chapterIdNum} />}
            </div>
            
            {chapter ? (
              <WritingEnvironment chapter={chapter} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-neutral-50">
                <div className="text-center p-6">
                  <h3 className="text-xl font-medium mb-2">Выберите главу</h3>
                  <p className="text-muted-foreground">
                    Выберите существующую главу или создайте новую, чтобы начать писать
                  </p>
                </div>
              </div>
            )}
            
            {chapter && <ObjectCardPanel chapterId={chapter.id} />}
          </TabsContent>
          
          <TabsContent value="cards" className="flex-1 border-none p-0 mt-0">
            <div className="container mx-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Все карточки объектов</h2>
              <p className="text-muted-foreground mb-6">
                Здесь будут отображаться все карточки объектов из вашей книги
              </p>
              {/* Card management UI would go here */}
            </div>
          </TabsContent>
          
          <TabsContent value="structure" className="flex-1 border-none p-0 mt-0">
            <div className="container mx-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Структура книги</h2>
              <p className="text-muted-foreground mb-6">
                Здесь вы сможете организовать структуру глав и разделов вашей книги
              </p>
              {/* Structure management UI would go here */}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1 border-none p-0 mt-0">
            <div className="container mx-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Настройки книги</h2>
              <p className="text-muted-foreground mb-6">
                Здесь вы сможете настроить параметры книги, жанры и метаданные
              </p>
              {/* Settings UI would go here */}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
