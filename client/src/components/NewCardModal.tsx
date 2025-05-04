import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface CardField {
  key: string;
  value: string;
}

function parseCardFields(description: string): CardField[] {
  if (!description) return [];
  
  try {
    // Try to parse as JSON first if it's in JSON format
    if (description.trim().startsWith('[') && description.trim().endsWith(']')) {
      return JSON.parse(description);
    }
  } catch (e) {
    // If parsing fails, continue with the fallback method
  }
  
  // Fallback: Try to parse based on "key: value" format
  const lines = description.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const [key, ...rest] = line.split(':');
    return {
      key: key.trim(),
      value: rest.join(':').trim()
    };
  }).filter(field => field.key && field.value);
}

function stringifyCardFields(fields: CardField[]): string {
  return JSON.stringify(fields);
}

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
  const [fields, setFields] = useState<CardField[]>([{ key: '', value: '' }]);
  const [tags, setTags] = useState('');
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);

  const { data: allChapters = [] } = useQuery({
    queryKey: ['/api/chapters'],
  });

  useEffect(() => {
    if (editCard) {
      setCardType(editCard.type);
      setTitle(editCard.title);
      
      // Parse description into fields
      const parsedFields = parseCardFields(editCard.description);
      setFields(parsedFields.length > 0 ? parsedFields : [{ key: '', value: '' }]);
      
      setTags(editCard.tags?.join(', ') || '');
      setSelectedChapterIds(editCard.chapterIds || [chapterId]);
    } else {
      setCardType('character');
      setTitle('');
      setFields([{ key: '', value: '' }]);
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

    // Filter out empty fields
    const validFields = fields.filter(f => f.key.trim() && f.value.trim());
    
    if (validFields.length === 0) {
      toast({
        title: "Ошибка",
        description: "Необходимо добавить хотя бы одно поле с значением",
        variant: "destructive"
      });
      return;
    }

    const processedTags = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Convert fields to string format
    const descriptionStr = stringifyCardFields(validFields);

    if (editCard) {
      updateCardMutation.mutate({
        id: editCard.id,
        type: cardType,
        title: title.trim(),
        description: descriptionStr,
        tags: processedTags,
        chapterIds: selectedChapterIds
      });
    } else {
      createCardMutation.mutate({
        type: cardType,
        title: title.trim(),
        description: descriptionStr,
        tags: processedTags,
        chapterIds: selectedChapterIds
      });
    }
  };

  const addField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const newFields = [...fields];
      newFields.splice(index, 1);
      setFields(newFields);
    }
  };

  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[index] = { key, value };
    setFields(newFields);
  };

  // Generate field suggestions based on card type
  const getFieldSuggestions = (type: string) => {
    switch (type) {
      case 'character':
        return ['Возраст', 'Профессия', 'Внешность', 'Характер', 'Мотивация', 'История'];
      case 'location':
        return ['Тип', 'Расположение', 'Описание', 'Атмосфера', 'История', 'Значение'];
      case 'item':
        return ['Тип', 'Внешний вид', 'Материал', 'Функция', 'История', 'Владелец'];
      case 'event':
        return ['Дата', 'Место', 'Участники', 'Последствия', 'Значение', 'Связь с сюжетом'];
      default:
        return [];
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700">Характеристики</label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addField}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs">Добавить поле</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={field.key || ""}
                      onValueChange={(value) => updateField(index, value, field.value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите поле..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Выберите поле...</SelectItem>
                        {getFieldSuggestions(cardType)?.map(suggestion => (
                          <SelectItem key={suggestion} value={suggestion}>
                            {suggestion}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Другое...</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {field.key === 'custom' && (
                      <Input
                        value={field.key === 'custom' ? '' : field.key}
                        onChange={(e) => updateField(index, e.target.value, field.value)}
                        placeholder="Название поля"
                        className="w-full mt-1"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Input
                      value={field.value}
                      onChange={(e) => updateField(index, field.key, e.target.value)}
                      placeholder="Значение"
                      className="w-full"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
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
                {Array.isArray(allChapters) && allChapters.map((chapter: any) => (
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
