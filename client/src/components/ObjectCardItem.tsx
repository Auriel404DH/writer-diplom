import { ObjectCard, cardTypesMap } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface ObjectCardItemProps {
  card: ObjectCard;
  onEdit: (card: ObjectCard) => void;
}

export function ObjectCardItem({ card, onEdit }: ObjectCardItemProps) {
  const { toast } = useToast();
  const cardType = cardTypesMap[card.type];

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("DELETE", `/api/cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      toast({
        title: "Карточка удалена",
        description: "Карточка объекта успешно удалена"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className={cn("bg-white rounded-md border border-neutral-200 shadow-sm overflow-hidden", cardType.className)}>
      <div className={cn("flex justify-between items-center p-3", cardType.bgClass)}>
        <div className="flex items-center">
          <i className={cn(`fas fa-${cardType.icon} mr-2`, cardType.iconClass)}></i>
          <span className="font-medium text-sm">{cardType.label}</span>
        </div>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(card)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить карточку?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Карточка будет удалена из всех глав, где она используется.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteCardMutation.mutate(card.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="p-3">
        <h4 className="font-medium">{card.title}</h4>
        <div className="text-sm text-neutral-600 mt-1 space-y-2">
          <div className="grid gap-1">
            {(() => {
              try {
                // Try to parse the description as JSON
                if (card.description && card.description.trim().startsWith('[')) {
                  const fields = JSON.parse(card.description);
                  return fields.map((field: { key: string; value: string }, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-1">
                      <div className="font-medium text-xs">{field.key}:</div>
                      <div className="col-span-2 text-xs">{field.value}</div>
                    </div>
                  ));
                }
                
                // Fallback to displaying as key-value pairs if possible
                const lines = card.description.split('\n').filter(line => line.includes(':'));
                if (lines.length > 0) {
                  return lines.map((line, index) => {
                    const [key, ...value] = line.split(':');
                    return (
                      <div key={index} className="grid grid-cols-3 gap-1">
                        <div className="font-medium text-xs">{key.trim()}:</div>
                        <div className="col-span-2 text-xs">{value.join(':').trim()}</div>
                      </div>
                    );
                  });
                }
                
                // If all else fails, just show the description
                return <p className="text-sm">{card.description}</p>;
              } catch (e) {
                return <p className="text-sm">{card.description}</p>;
              }
            })()}
          </div>
          
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {card.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-neutral-100 text-neutral-700 rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
