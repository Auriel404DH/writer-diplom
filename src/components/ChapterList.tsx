import { useState, useEffect } from "react";
import { Chapter } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { PlusIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface ChapterListProps {
  bookId: number;
  currentChapterId?: number;
  mode?: "read" | "edit";
  canEdit?: boolean;
}

export function ChapterList({
  bookId,
  currentChapterId,
  mode = "edit",
  canEdit = true,
}: ChapterListProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: [`/api/works/${bookId}/chapters`],
    enabled: !!bookId,
  });

  const createChapterMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", `/api/works/${bookId}/chapters`, {
        title,
      });
      return res.json();
    },
    onSuccess: (newChapter) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/books/${bookId}/chapters`],
      });
      setNewChapterTitle("");
      setIsAddingChapter(false);
      toast({
        title: "Глава создана",
        description: "Новая глава успешно добавлена",
      });
      setLocation(`/editor/${bookId}/${newChapter.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать главу: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add mutation for reordering chapters - moved before conditional return
  const reorderChaptersMutation = useMutation({
    mutationFn: async (chaptersOrder: number[]) => {
      return await apiRequest(
        "PATCH",
        `/api/works/${bookId}/chapters/reorder`,
        { chaptersOrder },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/books/${bookId}/chapters`],
      });
      toast({
        title: "Порядок изменен",
        description: "Порядок глав успешно обновлен",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось изменить порядок глав: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateChapter = () => {
    if (newChapterTitle.trim()) {
      createChapterMutation.mutate(newChapterTitle.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || !chapters) return;

    const newChapters = [...chapters];
    const draggedChapter = newChapters[draggedIndex];

    // Remove dragged chapter
    newChapters.splice(draggedIndex, 1);
    // Insert at new position
    newChapters.splice(targetIndex, 0, draggedChapter);

    // Get the reordered chapter IDs
    const newOrder = newChapters.map((chapter) => chapter.id);

    // Call API to save the new order
    reorderChaptersMutation.mutate(newOrder);

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-neutral-500">ГЛАВЫ</h3>
        {mode === "edit" && canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingChapter(true)}
            className="text-primary hover:text-primary/80 text-xs font-medium h-6 px-2"
          >
            <PlusIcon className="h-3 w-3 mr-1" /> Добавить
          </Button>
        )}
      </div>

      {mode === "edit" && canEdit && isAddingChapter && (
        <div className="mb-3 flex items-center space-x-1">
          <Input
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="Название главы"
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            className="h-8"
            onClick={handleCreateChapter}
            disabled={createChapterMutation.isPending}
          >
            {createChapterMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Создать"
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setIsAddingChapter(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {chapters?.map((chapter, index) => (
          <div
            key={chapter.id}
            draggable={mode === "edit" && canEdit}
            onDragStart={() =>
              mode === "edit" && canEdit && handleDragStart(index)
            }
            onDragOver={(e) =>
              mode === "edit" && canEdit && handleDragOver(e, index)
            }
            onDrop={() => mode === "edit" && canEdit && handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "relative",
              draggedIndex === index ? "opacity-50" : "opacity-100",
              mode === "edit" && canEdit ? "cursor-move" : "",
            )}
          >
            <Button
              variant="ghost"
              className={cn(
                "flex items-center justify-start w-full p-2 rounded-md text-left",
                chapter.id === currentChapterId
                  ? "bg-primary-50 text-primary-900"
                  : "hover:bg-neutral-100",
              )}
              onClick={() => {
                const path =
                  mode === "edit"
                    ? `/editor/${bookId}/${chapter.id}`
                    : `/read/${bookId}/${chapter.id}`;
                setLocation(path);
              }}
            >
              <span className="text-neutral-400 mr-2">{index + 1}.</span>
              <span className="text-sm truncate">{chapter.title}</span>
              {chapter.published && (
                <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓
                </span>
              )}
            </Button>
          </div>
        ))}

        {chapters?.length === 0 && !isAddingChapter && (
          <div className="text-center py-3 text-sm text-muted-foreground">
            {mode === "edit" && canEdit
              ? "Добавьте первую главу, чтобы начать писать"
              : "В этой книге пока нет глав"}
          </div>
        )}
      </div>
    </div>
  );
}
