'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { Button } from '@/presentation/components/ui/atoms/button';
import { ScrollArea } from '@/1-presentation/components/ui/atoms/scroll-area';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import {
  useChatbotConversation,
  useSendChatbotMessageStream,
} from '@/1-presentation/hooks/useChatbot';
import { Loader2, X, Plus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { ChatbotMessage } from '@/3-domain/entities/Chatbot';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  companyId?: string | null;
  programId?: string | null;
  context?: Record<string, any>;
  onNewConversation?: () => void;
  onSelectConversation?: (conversationId: string) => void;
}

export function ChatWindow({
  isOpen,
  onClose,
  conversationId,
  companyId,
  programId,
  context,
  onNewConversation,
  onSelectConversation,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
    conversationId
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useSendChatbotMessageStream();

  const { data: conversation, isLoading: conversationLoading } = useChatbotConversation(
    currentConversationId || ''
  );

  // Konuşma yüklendiğinde mesajları set et
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  // Mesajlar değiştiğinde scroll yap
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Conversation ID prop değiştiğinde güncelle
  useEffect(() => {
    setCurrentConversationId(conversationId);
  }, [conversationId]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    // Kullanıcı mesajını ekle
    const userMessage: ChatbotMessage = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversationId || 'temp',
      role: 'user',
      content: message,
      intent: null,
      metadata: {},
      tokensUsed: 0,
      costUsd: 0,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Assistant mesajı placeholder
    const assistantMessageId = `temp-assistant-${Date.now()}`;
    const assistantMessage: ChatbotMessage = {
      id: assistantMessageId,
      conversationId: currentConversationId || 'temp',
      role: 'assistant',
      content: '',
      intent: null,
      metadata: {},
      tokensUsed: 0,
      costUsd: 0,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    let fullResponse = '';

    // Streaming mesaj gönder
    sendMessage(
      {
        conversationId: currentConversationId,
        message,
        companyId,
        programId,
        context,
        stream: true,
      },
      (chunk: string) => {
        // Chunk geldiğinde mesajı güncelle
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg
          )
        );
      },
      (fullMessage: string, newConversationId: string) => {
        // Mesaj tamamlandığında
        setCurrentConversationId(newConversationId);
        setIsLoading(false);
        if (onSelectConversation) {
          onSelectConversation(newConversationId);
        }
      },
      (error: string) => {
        // Hata durumunda
        setIsLoading(false);
        toast.error(error);
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      }
    );
  };

  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
    if (onNewConversation) {
      onNewConversation();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col h-[80vh] max-w-2xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Asistan
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                title="Yeni konuşma"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4">
          {conversationLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <MessageInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Mesajınızı yazın..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
