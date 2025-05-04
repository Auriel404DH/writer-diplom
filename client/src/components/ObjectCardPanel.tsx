import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ObjectCard, cardTypes, Chapter } from '@shared/types';
import { ObjectCardItem } from '@/components/ObjectCardItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, Search } from 'lucide-react';
import { NewCardModal } from '@/components/NewCardModal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ObjectCardPanelProps {
  chapterId: number;
}

export function ObjectCardPanel({ chapterId }: ObjectCardPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ObjectCard | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [bookId, setBookId] = useState<number | null>(null);

  // First, get the chapter to determine the book ID
  const { data: chapter, isLoading: isLoadingChapter } = useQuery<Chapter>({
    queryKey: [`/api/chapters/${chapterId}`],
    enabled: !!chapterId,
    onSuccess: (data) => {
      if (data && data.bookId) {
        setBookId(data.bookId);
      }
    }
  });

  // Then fetch all book cards
  const { data: cards, isLoading: isLoadingCards } = useQuery<ObjectCard[]>({
    queryKey: [`/api/books/${bookId}/cards`],
    enabled: !!bookId,
  });

  // Filter cards related to this chapter
  const chapterCards = cards?.filter(card => 
    card.chapterIds?.includes(chapterId)
  );

  const filteredCards = chapterCards?.filter(card => {
    const matchesSearch = !searchQuery || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.tags && card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesType = !filterType || card.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleEditCard = (card: ObjectCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  const isLoading = isLoadingChapter || isLoadingCards;

  return (
    <div className="w-full lg:w-80 h-full border-l border-neutral-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-700">Карточки объектов <span className="text-xs font-normal text-neutral-500">(в книге)</span></h3>
        
        <div className="relative mt-2">
          <Input
            placeholder="Поиск карточек..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-8 py-1.5"
          />
          <Search className="absolute left-2.5 top-2.5 text-neutral-400 h-4 w-4" />
        </div>
        
        <div className="flex mt-3 space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 text-xs py-1 rounded font-medium",
              !filterType ? "bg-neutral-100 hover:bg-neutral-200" : "hover:bg-neutral-100"
            )}
            onClick={() => setFilterType(null)}
          >
            Все
          </Button>
          
          {cardTypes.map(type => (
            <Button
              key={type.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 text-xs py-1 rounded font-medium",
                filterType === type.id ? type.bgClass : `hover:${type.bgClass}`
              )}
              onClick={() => setFilterType(filterType === type.id ? null : type.id)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {filteredCards?.map((card) => (
              <ObjectCardItem 
                key={card.id} 
                card={card} 
                onEdit={handleEditCard}
              />
            ))}
            
            {filteredCards?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || filterType ? 
                  "Нет карточек, соответствующих вашему поиску" : 
                  "В книге пока нет карточек объектов"}
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              <span>Добавить карточку</span>
            </Button>
          </>
        )}
      </div>
      
      <NewCardModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        chapterId={chapterId}
        bookId={bookId || undefined}
        editCard={editingCard}
      />
    </div>
  );
}
