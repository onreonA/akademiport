'use client';
import { useState } from 'react';
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'İçerik yazın...',
  rows = 10,
  className = '',
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const insertMarkdown = (type: string) => {
    const textarea = document.getElementById(
      'markdown-editor'
    ) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let insertText = '';
    let cursorOffset = 0;
    switch (type) {
      case 'bold':
        insertText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        insertText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'link':
        insertText = `[${selectedText}](url)`;
        cursorOffset = -3;
        break;
      case 'image':
        insertText = `![${selectedText}](image-url)`;
        cursorOffset = -8;
        break;
      case 'heading':
        insertText = `# ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'list':
        insertText = `- ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'code':
        insertText = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      case 'blockquote':
        insertText = `> ${selectedText}`;
        cursorOffset = 2;
        break;
      default:
        return;
    }
    const newValue =
      value.substring(0, start) + insertText + value.substring(end);
    onChange(newValue);
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertText.length + cursorOffset,
        start + insertText.length + cursorOffset
      );
    }, 0);
  };
  const renderMarkdown = (text: string) => {
    // Basit markdown render
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
      )
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(
        /^> (.*$)/gm,
        '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>'
      )
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
      )
      .replace(
        /!\[(.*?)\]\((.*?)\)/g,
        '<img src="$2" alt="$1" class="max-w-full h-auto rounded" />'
      )
      .replace(/\n/g, '<br />');
  };
  return (
    <div className={`w-full ${className}`}>
      {/* Toolbar */}
      <div className='flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg'>
        <button
          type='button'
          onClick={() => insertMarkdown('bold')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='Kalın'
        >
          <i className='ri-bold'></i>
        </button>
        <button
          type='button'
          onClick={() => insertMarkdown('italic')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='İtalik'
        >
          <i className='ri-italic'></i>
        </button>
        <button
          type='button'
          onClick={() => insertMarkdown('heading')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='Başlık'
        >
          <i className='ri-heading'></i>
        </button>
        <button
          type='button'
          onClick={() => insertMarkdown('list')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='Liste'
        >
          <i className='ri-list-check'></i>
        </button>
        <button
          type='button'
          onClick={() => insertMarkdown('link')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='Link'
        >
          <i className='ri-link'></i>
        </button>
        <button
          type='button'
          onClick={() => insertMarkdown('image')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='Resim'
        >
          <i className='ri-image-line'></i>
        </button>
        <button
          type='button'
          onClick={() => insertMarkdown('code')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='Kod'
        >
          <i className='ri-code-line'></i>
        </button>
        <button
          type='button'
          onClick={() => insertMarkdown('blockquote')}
          className='p-1 hover:bg-gray-200 rounded text-sm'
          title='Alıntı'
        >
          <i className='ri-double-quotes-l'></i>
        </button>
        <div className='border-l border-gray-300 mx-1'></div>
        <button
          type='button'
          onClick={() => setShowPreview(!showPreview)}
          className={`p-1 rounded text-sm ${showPreview ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
          title='Önizleme'
        >
          <i className='ri-eye-line'></i>
        </button>
      </div>
      {/* Editor/Preview */}
      <div className='border border-gray-300 rounded-b-lg'>
        {showPreview ? (
          <div
            className='p-3 min-h-[200px] prose prose-sm max-w-none'
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        ) : (
          <textarea
            id='markdown-editor'
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className='w-full p-3 border-0 focus:ring-0 resize-none font-mono text-sm'
          />
        )}
      </div>
      {/* Markdown Yardım */}
      <div className='mt-2 text-xs text-gray-500'>
        <p className='font-medium mb-1'>Markdown Kısayolları:</p>
        <div className='grid grid-cols-2 gap-2'>
          <span>
            **kalın** → <strong>kalın</strong>
          </span>
          <span>
            *italik* → <em>italik</em>
          </span>
          <span>
            # Başlık → <span className='font-bold'>Başlık</span>
          </span>
          <span>- Liste → Liste öğesi</span>
          <span>
            [Link](url) →{' '}
            <a href='#' className='text-blue-600'>
              Link
            </a>
          </span>
          <span>
            `kod` → <code className='bg-gray-100 px-1 rounded'>kod</code>
          </span>
        </div>
      </div>
    </div>
  );
}
