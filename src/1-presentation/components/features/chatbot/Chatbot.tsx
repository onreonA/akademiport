'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatButton } from './ChatButton';
import { useChatbotConversations } from '@/1-presentation/hooks/useChatbot';

interface ChatbotProps {
  companyId?: string | null;
  programId?: string | null;
  context?: Record<string, any>;
}

export function Chatbot({ companyId, programId, context }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: conversations } = useChatbotConversations(10, 0);

  // Initialize currentConversationId from conversations data
  const currentConversationId =
    conversations?.data && conversations.data.length > 0 ? conversations.data[0].id : undefined;

  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
    setIsOpen(true);
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setIsOpen(true);
  };

  return (
    <>
      <ChatButton onClick={() => setIsOpen(true)} />
      {isOpen && (
        <ChatWindow
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          conversationId={currentConversationId}
          companyId={companyId}
          programId={programId}
          context={context}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
        />
      )}
    </>
  );
}
