import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import Highlight from "@tiptap/extension-highlight";
import History from "@tiptap/extension-history";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import { EditorToolbar } from "@/components/EditorToolbar";
import { forwardRef, useImperativeHandle } from "react";

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
  ({ content, onChange, className = "" }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ history: false }),
        History,
        Document,
        Paragraph,
        Text,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        Underline,
        Strike,
        Code,
        Highlight,
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center", "right"],
          defaultAlignment: "left",
        }),
        Blockquote,
        HorizontalRule,
        BulletList,
        OrderedList,
        ListItem,
        TaskList,
        TaskItem,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      getHTML: () => editor?.getHTML() || "",
      getContent: () => editor?.getText() || "",
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
    }));

    return (
      <div className={`flex flex-col gap-5 ${className}`}>
        {editor && <EditorToolbar editor={editor} />}
        <EditorContent
          editor={editor}
          className={`
            editor-content 
            font-serif text-lg leading-relaxed 
            rounded-2xl p-6 
            bg-white dark:bg-gray-900 
            h-[670px] overflow-auto 
            shadow-md ring-1 ring-gray-200 dark:ring-gray-700 
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 
            transition-all duration-300 ease-in-out
          `}
        />
      </div>
    );
  },
);

TiptapEditor.displayName = "TiptapEditor";
