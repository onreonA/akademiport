/**
 * Training Summary Generator Component
 *
 * AI ile eğitim özeti üretir
 */

'use client';

import { useState } from 'react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/1-presentation/components/ui/atoms/card';
import { Sparkles, Loader2, Check, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingSummaryGeneratorProps {
  trainingId: string;
  companyId?: string;
  programId?: string;
  onGenerated?: (result: {
    summary: string;
    keyPoints: string[];
    learningOutcomes: string[];
    prerequisites?: string[];
  }) => void;
}

export function TrainingSummaryGenerator({
  trainingId,
  companyId,
  programId,
  onGenerated,
}: TrainingSummaryGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [summary, setSummary] = useState<{
    summary: string;
    keyPoints: string[];
    learningOutcomes: string[];
    prerequisites?: string[];
  } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(false);

    try {
      const response = await fetch(`/api/ai/trainings/${trainingId}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          programId,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to generate summary' }));
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setGenerated(true);
      setSummary(data);
      if (onGenerated) {
        onGenerated(data);
      }
      toast.success('Eğitim özeti başarıyla üretildi!');
    } catch (error) {
      console.error('Error generating training summary:', error);
      toast.error(error instanceof Error ? error.message : 'Eğitim özeti üretilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              AI Eğitim Özeti
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
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
                  Yeniden Üret
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI ile Özet Oluştur
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {summary && (
          <CardContent className="space-y-4">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">Özet</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary.summary}</p>
            </div>

            {/* Key Points */}
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Anahtar Noktalar</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {summary.learningOutcomes && summary.learningOutcomes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Öğrenme Çıktıları</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {summary.learningOutcomes.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {summary.prerequisites && summary.prerequisites.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Ön Koşullar</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {summary.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
