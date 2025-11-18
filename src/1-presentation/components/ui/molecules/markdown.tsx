/**
 * Markdown Component
 *
 * Basit markdown renderer (chatbot için)
 */

'use client';

import React from 'react';
import { cn } from '@/presentation/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  // Basit markdown parsing (chatbot için yeterli)
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Bold (**text**)
    const boldRegex = /\*\*(.+?)\*\*/g;
    // Italic (*text*)
    const italicRegex = /\*(.+?)\*/g;
    // Links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    // Code blocks (`code`)
    const codeRegex = /`([^`]+)`/g;
    // Line breaks
    const lineBreakRegex = /\n/g;

    // Basit parsing - önce linkler, sonra bold, sonra italic, sonra code
    const processedText = text
      .replace(linkRegex, (match, text, url) => {
        return `__LINK__${text}__URL__${url}__ENDLINK__`;
      })
      .replace(boldRegex, (match, text) => {
        return `__BOLD__${text}__ENDBOLD__`;
      })
      .replace(italicRegex, (match, text) => {
        return `__ITALIC__${text}__ENDITALIC__`;
      })
      .replace(codeRegex, (match, code) => {
        return `__CODE__${code}__ENDCODE__`;
      });

    // Split by placeholders and render
    const segments = processedText.split(/(__\w+__)/g);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (segment.startsWith('__LINK__')) {
        const text = segments[i + 1];
        const url = segments[i + 3];
        i += 4;
        elements.push(
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {text}
          </a>
        );
      } else if (segment.startsWith('__BOLD__')) {
        const text = segments[i + 1];
        i += 2;
        elements.push(<strong key={i}>{text}</strong>);
      } else if (segment.startsWith('__ITALIC__')) {
        const text = segments[i + 1];
        i += 2;
        elements.push(<em key={i}>{text}</em>);
      } else if (segment.startsWith('__CODE__')) {
        const code = segments[i + 1];
        i += 2;
        elements.push(
          <code key={i} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
            {code}
          </code>
        );
      } else if (segment === '\n') {
        elements.push(<br key={i} />);
      } else if (segment && !segment.startsWith('__')) {
        elements.push(<span key={i}>{segment}</span>);
      }
    }

    return elements.length > 0 ? elements : [<span key="default">{text}</span>];
  };

  return <div className={cn('prose prose-sm max-w-none', className)}>{parseMarkdown(content)}</div>;
}
