import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link2, 
  Image, 
  Save, 
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditorToolbarProps {
  editor: Editor;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function EditorToolbar({ editor, onSave, onPublish, isSaving, isPublishing }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-neutral-200 bg-white p-2 flex items-center space-x-1">
      <div className="flex items-center mr-2">
        <Select 
          value={editor.isActive('heading', { level: 1 }) 
            ? 'h1' 
            : editor.isActive('heading', { level: 2 }) 
              ? 'h2' 
              : editor.isActive('heading', { level: 3 }) 
                ? 'h3' 
                : 'p'
          }
          onValueChange={(value) => {
            if (value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else if (value === 'h1') {
              editor.chain().focus().setHeading({ level: 1 }).run();
            } else if (value === 'h2') {
              editor.chain().focus().setHeading({ level: 2 }).run();
            } else if (value === 'h3') {
              editor.chain().focus().setHeading({ level: 3 }).run();
            }
          }}
        >
          <SelectTrigger className="text-sm border-0 pr-7 py-1 focus:ring-0 focus:shadow-none h-9 w-[150px]">
            <SelectValue placeholder="Формат текста" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Обычный текст</SelectItem>
            <SelectItem value="h1">Заголовок 1</SelectItem>
            <SelectItem value="h2">Заголовок 2</SelectItem>
            <SelectItem value="h3">Заголовок 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-4 border-r border-neutral-200 mx-1"></div>
      
      <Button 
        size="sm"
        variant="ghost" 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        className={editor.isActive('bold') ? 'bg-neutral-100' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        size="sm"
        variant="ghost" 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        className={editor.isActive('italic') ? 'bg-neutral-100' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        size="sm"
        variant="ghost" 
        onClick={() => editor.chain().focus().toggleUnderline().run()} 
        className={editor.isActive('underline') ? 'bg-neutral-100' : ''}
      >
        <Underline className="h-4 w-4" />
      </Button>
      
      <div className="h-4 border-r border-neutral-200 mx-1"></div>
      
      <Button 
        size="sm"
        variant="ghost" 
        onClick={() => editor.chain().focus().setTextAlign('left').run()} 
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-neutral-100' : ''}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button 
        size="sm"
        variant="ghost" 
        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-neutral-100' : ''}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button 
        size="sm"
        variant="ghost" 
        onClick={() => editor.chain().focus().setTextAlign('right').run()} 
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-neutral-100' : ''}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      <div className="h-4 border-r border-neutral-200 mx-1"></div>
      
      <Button size="sm" variant="ghost">
        <Link2 className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost">
        <Image className="h-4 w-4" />
      </Button>
      
      <div className="ml-auto flex items-center space-x-2">
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="text-primary hover:text-primary/80 border-primary/20"
          >
            {isSaving ? 'Сохранение...' : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                <span>Сохранить</span>
              </>
            )}
          </Button>
        )}
        
        {onPublish && (
          <Button
            size="sm"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Публикация...' : (
              <>
                <Upload className="mr-1.5 h-4 w-4" />
                <span>Опубликовать</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
