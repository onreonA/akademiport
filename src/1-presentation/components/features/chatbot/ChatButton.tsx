'use client';

import { Button } from '@/presentation/components/ui/atoms/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';

interface ChatButtonProps {
  onClick: () => void;
  className?: string;
}

export function ChatButton({ onClick, className }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      aria-label="Chatbot'u aç"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
