import { useRef, useState, useEffect } from 'react';
import { TiptapEditor, TiptapEditorRef } from '@/components/ui/tiptap-editor';
import { AmbientControl } from '@/components/AmbientControl';
import { cn, countWords, calculateReadingTime } from '@/lib/utils';
import { Chapter } from '@shared/types';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WritingEnvironmentProps {
  chapter: Chapter;
  className?: string;
}

export function WritingEnvironment({ chapter, className = '' }: WritingEnvironmentProps) {
  const editorRef = useRef<TiptapEditorRef>(null);
  const { toast } = useToast();
  const [content, setContent] = useState(chapter.content || '');
  const [theme, setTheme] = useState('writing-theme-1');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset content when chapter changes
    setContent(chapter.content || '');
    // Reset editor content directly
    if (editorRef.current) {
      editorRef.current.setContent(chapter.content || '');
    }
  }, [chapter.id, chapter.content]);

  useEffect(() => {
    if (content) {
      setWordCount(countWords(content));
      setReadingTime(calculateReadingTime(content));
    } else {
      setWordCount(0);
      setReadingTime(0);
    }
  }, [content]);

  const saveChapterMutation = useMutation({
    mutationFn: async (updatedContent: string) => {
      return await apiRequest("PATCH", `/api/chapters/${chapter.id}`, {
        content: updatedContent
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${chapter.bookId}/chapters`] });
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${chapter.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const publishChapterMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/chapters/${chapter.id}/publish`, {
        published: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${chapter.bookId}/chapters`] });
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${chapter.id}`] });
      toast({
        title: "Глава опубликована",
        description: "Глава успешно опубликована и теперь доступна для чтения другим пользователям"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка публикации",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleContentChange = (html: string) => {
    setContent(html);
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      saveChapterMutation.mutate(html);
    }, 2000);
    
    setSaveTimeout(newTimeout);
  };

  const handleSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML();
      saveChapterMutation.mutate(html);
      toast({
        title: "Сохранено",
        description: "Изменения успешно сохранены"
      });
    }
  };

  const handlePublish = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML();
      saveChapterMutation.mutate(html);
      publishChapterMutation.mutate();
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col", theme, className)}>
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-serif font-semibold mb-6">{chapter.title}</h1>
          
          <TiptapEditor 
            ref={editorRef}
            content={content} 
            onChange={handleContentChange} 
          />
        </div>
      </div>
      
      <AmbientControl
        currentTheme={theme}
        onThemeChange={setTheme}
        wordCount={wordCount}
        readingTime={readingTime}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={saveChapterMutation.isPending}
        isPublishing={publishChapterMutation.isPending}
      />
    </div>
  );
}
