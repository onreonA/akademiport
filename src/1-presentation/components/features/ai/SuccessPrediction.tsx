/**
 * Success Prediction Component
 *
 * AI ile firma başarı tahmini yapar
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
import { Badge } from '@/1-presentation/components/ui/atoms/badge';
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { toast } from 'sonner';

interface SuccessPredictionProps {
  companyId: string;
  programId?: string;
  onPredicted?: (result: {
    successProbability: number;
    successLevel: 'low' | 'medium' | 'high' | 'very_high';
    prediction: string;
    factors: Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
      weight: number;
    }>;
    recommendations: string[];
  }) => void;
}

export function SuccessPrediction({ companyId, programId, onPredicted }: SuccessPredictionProps) {
  const [loading, setLoading] = useState(false);
  const [predicted, setPredicted] = useState(false);
  const [predictionData, setPredictionData] = useState<{
    successProbability: number;
    successLevel: 'low' | 'medium' | 'high' | 'very_high';
    prediction: string;
    factors: Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
      weight: number;
    }>;
    recommendations: string[];
    historicalComparison?: {
      averageSuccessRate: number;
      percentile: number;
    };
  } | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setPredicted(false);

    try {
      const response = await fetch(`/api/ai/companies/${companyId}/predict-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to predict success' }));
        throw new Error(errorData.error || 'Failed to predict success');
      }

      const data = await response.json();
      setPredicted(true);
      setPredictionData(data);
      if (onPredicted) {
        onPredicted(data);
      }
      toast.success('Başarı tahmini başarıyla tamamlandı!');
    } catch (error) {
      console.error('Error predicting company success:', error);
      toast.error(error instanceof Error ? error.message : 'Başarı tahmini yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const getSuccessColor = (level: string) => {
    switch (level) {
      case 'very_high':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'high':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getSuccessLabel = (level: string) => {
    switch (level) {
      case 'very_high':
        return 'Çok Yüksek';
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Bilinmeyen';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              AI Başarı Tahmini
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePredict}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Tahmin Ediliyor...
                </>
              ) : predicted ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Yeniden Tahmin Et
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI ile Tahmin Et
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {predictionData && (
          <CardContent className="space-y-6">
            {/* Success Probability */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Başarı Olasılığı</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">{predictionData.successProbability}%</span>
                  <Badge className={getSuccessColor(predictionData.successLevel)}>
                    {getSuccessLabel(predictionData.successLevel)}
                  </Badge>
                </div>
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold">{predictionData.successProbability}%</span>
              </div>
            </div>

            {/* Prediction */}
            <div>
              <h4 className="font-semibold mb-2">Tahmin</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {predictionData.prediction}
              </p>
            </div>

            {/* Historical Comparison */}
            {predictionData.historicalComparison && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tarihsel Karşılaştırma</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Ortalama Başarı Oranı</p>
                    <p className="text-lg font-bold">
                      {predictionData.historicalComparison.averageSuccessRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Yüzdelik Dilim</p>
                    <p className="text-lg font-bold">
                      {predictionData.historicalComparison.percentile}. persentil
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Factors */}
            {predictionData.factors && predictionData.factors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Başarı Faktörleri</h4>
                <div className="space-y-2">
                  {predictionData.factors.map((factor, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          {factor.impact === 'positive' && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                          {factor.impact === 'negative' && (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          {factor.impact === 'neutral' && (
                            <Minus className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {(factor.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {predictionData.recommendations && predictionData.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Öneriler</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {predictionData.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
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
