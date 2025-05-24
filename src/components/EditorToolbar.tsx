import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Redo,
  Undo,
  Minus,
  Table,
  Plus,
  Trash,
  Save,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditorToolbarProps {
  editor: Editor;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function EditorToolbar({
  editor,
  onSave,
  onPublish,
  isSaving,
  isPublishing,
}: EditorToolbarProps) {
  if (!editor) return null;

  const headingValue = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p";

  return (
    <div className="border-b border-neutral-200 bg-white p-2 flex flex-wrap items-center gap-1">
      {/* Format Select */}
      <Select
        value={headingValue}
        onValueChange={(value) => {
          editor.chain().focus();
          if (value === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().setHeading({ level: 1 }).run();
        }}
      >
        <SelectTrigger className="text-sm border-0 pr-7 py-1 focus:ring-0 focus:shadow-none h-9 w-[150px]">
          <SelectValue placeholder="Формат" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p">Обычный текст</SelectItem>
          <SelectItem value="h1">Заголовок 1</SelectItem>
          <SelectItem value="h2">Заголовок 2</SelectItem>
          <SelectItem value="h3">Заголовок 3</SelectItem>
        </SelectContent>
      </Select>

      {/* Text formatting */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-neutral-100" : ""}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-neutral-100" : ""}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "bg-neutral-100" : ""}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-neutral-100" : ""}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "bg-neutral-100" : ""}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive("highlight") ? "bg-yellow-100" : ""}
      >
        <Highlighter className="h-4 w-4" />
      </Button>

      {/* Alignment */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={
          editor.isActive({ textAlign: "left" }) ? "bg-neutral-100" : ""
        }
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={
          editor.isActive({ textAlign: "center" }) ? "bg-neutral-100" : ""
        }
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={
          editor.isActive({ textAlign: "right" }) ? "bg-neutral-100" : ""
        }
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      {/* Lists & block */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-neutral-100" : ""}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-neutral-100" : ""}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-neutral-100" : ""}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </Button>

      {/* Undo/Redo */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </Button>

      {/* Table controls */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <Table className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <Trash className="h-4 w-4" />
      </Button>

      {/* Actions */}
      <div className="ml-auto flex items-center space-x-2">
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="text-primary hover:text-primary/80 border-primary/20"
          >
            {isSaving ? (
              "Сохранение..."
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                <span>Сохранить</span>
              </>
            )}
          </Button>
        )}

        {onPublish && (
          <Button size="sm" onClick={onPublish} disabled={isPublishing}>
            {isPublishing ? (
              "Публикация..."
            ) : (
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
