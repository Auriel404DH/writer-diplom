import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Book } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

export function SidebarNav({ currentBookId }: { currentBookId?: number }) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [newBookTitle, setNewBookTitle] = useState("");
  const [isAddingBook, setIsAddingBook] = useState(false);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/works"],
  });

  const createBookMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/works", { title });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setNewBookTitle("");
      setIsAddingBook(false);
      toast({
        title: "Книга создана",
        description: "Новая книга успешно создана",
      });
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
    if (newBookTitle.trim()) {
      createBookMutation.mutate(newBookTitle.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold tracking-tight">Мои книги</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddingBook(true)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isAddingBook && (
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
              placeholder="Название книги"
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={handleCreateBook}
              disabled={createBookMutation.isPending}
              className="h-8"
            >
              {createBookMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Создать"
              )}
            </Button>
          </div>
        )}

        <div className="space-y-1">
          {books?.map((book) => (
            <Link key={book.id} href={`/editor/${book.id}`}>
              <Button
                variant={book.id === currentBookId ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-normal",
                  book.id === currentBookId ? "bg-secondary/20" : "",
                )}
              >
                {book.title}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
