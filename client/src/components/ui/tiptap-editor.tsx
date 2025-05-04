import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Document from '@tiptap/extension-document';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { EditorToolbar } from '@/components/EditorToolbar';
import { useCallback, forwardRef, useImperativeHandle } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}

export interface TiptapEditorRef {
  getEditor: () => Editor | null;
  getHTML: () => string;
  getContent: () => string;
  setContent: (content: string) => void;
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  ({ content, onChange, className = '' }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Document,
        Paragraph,
        Text,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          alignments: ['left', 'center', 'right'],
          defaultAlignment: 'left',
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      getHTML: () => editor?.getHTML() || '',
      getContent: () => editor?.getText() || '',
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
    }));

    return (
      <div className={`flex flex-col ${className}`}>
        {editor && <EditorToolbar editor={editor} />}
        <EditorContent editor={editor} className="editor-content font-serif text-lg leading-relaxed" />
      </div>
    );
  }
);

TiptapEditor.displayName = 'TiptapEditor';
