/**
 * Rich Text Editor Component
 * Sprint 23: CMS
 *
 * TipTap-based rich text editor for CMS content editing
 */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/presentation/lib/utils';
import { useCallback } from 'react';

export interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>; // Returns image URL
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content = '',
  placeholder = 'İçerik yazın...',
  onChange,
  onImageUpload,
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor || !onImageUpload) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        'border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          {/* Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive('bold') && 'bg-gray-200 dark:bg-gray-700')}
            title="Kalın"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive('italic') && 'bg-gray-200 dark:bg-gray-700')}
            title="İtalik"
          >
            <Italic className="h-4 w-4" />
          </Button>

          {/* Headings */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              editor.isActive('heading', { level: 1 }) && 'bg-gray-200 dark:bg-gray-700'
            )}
            title="Başlık 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              editor.isActive('heading', { level: 2 }) && 'bg-gray-200 dark:bg-gray-700'
            )}
            title="Başlık 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              editor.isActive('heading', { level: 3 }) && 'bg-gray-200 dark:bg-gray-700'
            )}
            title="Başlık 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          {/* Lists */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(editor.isActive('bulletList') && 'bg-gray-200 dark:bg-gray-700')}
            title="Madde İşareti"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(editor.isActive('orderedList') && 'bg-gray-200 dark:bg-gray-700')}
            title="Numaralı Liste"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          {/* Blockquote */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(editor.isActive('blockquote') && 'bg-gray-200 dark:bg-gray-700')}
            title="Alıntı"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(editor.isActive('codeBlock') && 'bg-gray-200 dark:bg-gray-700')}
            title="Kod Bloğu"
          >
            <Code className="h-4 w-4" />
          </Button>

          {/* Links & Images */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={setLink}
            className={cn(editor.isActive('link') && 'bg-gray-200 dark:bg-gray-700')}
            title="Link Ekle"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          {onImageUpload && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={addImage}
              title="Görsel Ekle"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          )}

          {/* Undo/Redo */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Geri Al"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Yinele"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert p-4 min-h-[300px] focus-within:outline-none">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 300px;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }

        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }

        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
