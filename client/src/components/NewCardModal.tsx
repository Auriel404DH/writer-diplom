import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ObjectCard, cardTypesMap, cardTypes } from '@shared/types';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface NewCardModalProps {
  open: boolean;
  onClose: () => void;
  chapterId: number;
  editCard?: ObjectCard | null;
}

export function NewCardModal({ open, onClose, chapterId, editCard }: NewCardModalProps) {
  const { toast } = useToast();
  const [cardType, setCardType] = useState('character');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);

  const { data: allChapters } = useQuery({
    queryKey: ['/api/chapters'],
  });

  useEffect(() => {
    if (editCard) {
      setCardType(editCard.type);
      setTitle(editCard.title);
      setDescription(editCard.description);
      setTags(editCard.tags?.join(', ') || '');
      setSelectedChapterIds(editCard.chapterIds || [chapterId]);
    } else {
      setCardType('character');
      setTitle('');
      setDescription('');
      setTags('');
      setSelectedChapterIds([chapterId]);
    }
  }, [editCard, chapterId]);

  const createCardMutation = useMutation({
    mutationFn: async (cardData: {
      type: string;
      title: string;
      description: string;
      tags: string[];
      chapterIds: number[];
    }) => {
      const res = await apiRequest("POST", "/api/cards", cardData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${chapterId}/cards`] });
      toast({
        title: "Карточка создана",
        description: "Новая карточка объекта успешно создана"
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать карточку: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: async (cardData: {
      id: number;
      type: string;
      title: string;
      description: string;
      tags: string[];
      chapterIds: number[];
    }) => {
      const res = await apiRequest("PATCH", `/api/cards/${cardData.id}`, cardData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${chapterId}/cards`] });
      toast({
        title: "Карточка обновлена",
        description: "Карточка объекта успешно обновлена"
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить карточку: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Ошибка",
        description: "Название карточки не может быть пустым",
        variant: "destructive"
      });
      return;
    }

    const processedTags = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (editCard) {
      updateCardMutation.mutate({
        id: editCard.id,
        type: cardType,
        title: title.trim(),
        description: description.trim(),
        tags: processedTags,
        chapterIds: selectedChapterIds
      });
    } else {
      createCardMutation.mutate({
        type: cardType,
        title: title.trim(),
        description: description.trim(),
        tags: processedTags,
        chapterIds: selectedChapterIds
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editCard ? 'Редактировать карточку' : 'Новая карточка'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Тип карточки</label>
            <div className="grid grid-cols-4 gap-2">
              {cardTypes.map(type => (
                <Button
                  key={type.id}
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex flex-col items-center justify-center h-auto p-2",
                    cardType === type.id ? type.bgClass + " border-" + type.id + "-200" : ""
                  )}
                  onClick={() => setCardType(type.id)}
                >
                  <i className={`fas fa-${type.icon} mb-1`}></i>
                  <span className="text-xs">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Название</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Теги</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Добавьте теги через запятую"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Привязка к главам</label>
            <Select
              value={chapterId.toString()}
              onValueChange={(value) => {
                const id = parseInt(value);
                setSelectedChapterIds([id]);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите главы..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={chapterId.toString()}>Текущая глава</SelectItem>
                {allChapters?.map((chapter: any) => (
                  chapter.id !== chapterId && (
                    <SelectItem key={chapter.id} value={chapter.id.toString()}>
                      {chapter.title}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createCardMutation.isPending || updateCardMutation.isPending}
          >
            {(createCardMutation.isPending || updateCardMutation.isPending) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {editCard ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
