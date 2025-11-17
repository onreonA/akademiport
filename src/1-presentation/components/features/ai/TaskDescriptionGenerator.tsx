/**
 * Task Description Generator Component
 *
 * AI ile görev açıklaması üretir
 */

'use client';

import { useState } from 'react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Textarea } from '@/1-presentation/components/ui/atoms/textarea';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface TaskDescriptionGeneratorProps {
  taskTitle: string;
  programName?: string;
  companyName?: string;
  projectName?: string;
  subProjectName?: string;
  companyId?: string;
  programId?: string;
  onGenerated: (result: {
    description: string;
    subTasks: Array<{ title: string; description: string }>;
    keyPoints: string[];
  }) => void;
}

export function TaskDescriptionGenerator({
  taskTitle,
  programName,
  companyName,
  projectName,
  subProjectName,
  companyId,
  programId,
  onGenerated,
}: TaskDescriptionGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!taskTitle.trim()) {
      toast.error('Görev başlığı gerekli');
      return;
    }

    setLoading(true);
    setGenerated(false);

    try {
      const response = await fetch('/api/ai/tasks/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskTitle,
          programName,
          companyName,
          projectName,
          subProjectName,
          companyId,
          programId,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to generate description' }));
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const data = await response.json();
      setGenerated(true);
      onGenerated(data);
      toast.success('Görev açıklaması başarıyla üretildi!');
    } catch (error) {
      console.error('Error generating task description:', error);
      toast.error(error instanceof Error ? error.message : 'Görev açıklaması üretilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">AI ile Açıklama Üret</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading || !taskTitle.trim()}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Üretiliyor...
            </>
          ) : generated ? (
            <>
              <Check className="w-4 h-4" />
              Üretildi
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI ile Üret
            </>
          )}
        </Button>
      </div>

      {!taskTitle.trim() && (
        <p className="text-sm text-muted-foreground">
          Görev başlığını girdikten sonra AI ile açıklama üretebilirsiniz.
        </p>
      )}
    </div>
  );
}
