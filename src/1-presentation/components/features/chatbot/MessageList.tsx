'use client';

import { ChatbotMessage } from '@/3-domain/entities/Chatbot';
import { cn } from '@/presentation/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Loader2, User, Bot } from 'lucide-react';
import { Markdown } from '@/1-presentation/components/ui/molecules/markdown';

interface MessageListProps {
  messages: ChatbotMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Merhaba! Size nasıl yardımcı olabilirim?</p>
        <p className="text-sm text-muted-foreground mt-2">
          Eğitimler, projeler, görevler ve daha fazlası hakkında sorular sorabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}

          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2',
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            {message.role === 'user' ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="text-sm">
                <Markdown content={message.content} />
              </div>
            )}
            <p
              className={cn(
                'text-xs mt-1',
                message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </p>
          </div>

          {message.role === 'user' && (
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div className="bg-muted rounded-lg px-4 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
