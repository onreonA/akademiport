/**
 * Trend Analysis Component
 *
 * AI ile firma trend analizi yapar
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/1-presentation/components/ui/atoms/select';
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface TrendAnalysisProps {
  companyId: string;
  programId?: string;
  onAnalyzed?: (result: {
    trends: Array<{
      category: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      description: string;
      changePercentage: number;
    }>;
    insights: string[];
    predictions: Array<{
      metric: string;
      predictedValue: number;
      confidence: number;
      timeframe: string;
    }>;
    recommendations: string[];
  }) => void;
}

export function TrendAnalysis({ companyId, programId, onAnalyzed }: TrendAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [trendData, setTrendData] = useState<{
    trends: Array<{
      category: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      description: string;
      changePercentage: number;
      dataPoints: Array<{ date: string; value: number }>;
    }>;
    insights: string[];
    predictions: Array<{
      metric: string;
      predictedValue: number;
      confidence: number;
      timeframe: string;
    }>;
    recommendations: string[];
  } | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalyzed(false);

    try {
      const response = await fetch(`/api/ai/companies/${companyId}/analyze-trends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId,
          period,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to analyze trends' }));
        throw new Error(errorData.error || 'Failed to analyze trends');
      }

      const data = await response.json();
      setAnalyzed(true);
      setTrendData(data);
      if (onAnalyzed) {
        onAnalyzed(data);
      }
      toast.success('Trend analizi başarıyla tamamlandı!');
    } catch (error) {
      console.error('Error analyzing trends:', error);
      toast.error(error instanceof Error ? error.message : 'Trend analizi yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'decreasing':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'stable':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Artış';
      case 'decreasing':
        return 'Azalış';
      case 'stable':
        return 'Stabil';
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
              <BarChart3 className="w-5 h-5" />
              AI Trend Analizi
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Son Hafta</SelectItem>
                  <SelectItem value="month">Son Ay</SelectItem>
                  <SelectItem value="quarter">Son Çeyrek</SelectItem>
                  <SelectItem value="year">Son Yıl</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : analyzed ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Yeniden Analiz Et
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI ile Analiz Et
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {trendData && (
          <CardContent className="space-y-6">
            {/* Trends */}
            {trendData.trends && trendData.trends.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Trendler</h4>
                <div className="space-y-3">
                  {trendData.trends.map((trend, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{trend.category}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <Badge className={getTrendColor(trend.trend)}>
                            {getTrendLabel(trend.trend)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {trend.changePercentage > 0 ? '+' : ''}
                            {trend.changePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{trend.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {trendData.insights && trendData.insights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">İçgörüler</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {trendData.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predictions */}
            {trendData.predictions && trendData.predictions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tahminler</h4>
                <div className="space-y-2">
                  {trendData.predictions.map((prediction, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{prediction.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{prediction.predictedValue}</span>
                          <span className="text-xs text-muted-foreground">
                            {prediction.confidence}% güven
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{prediction.timeframe}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {trendData.recommendations && trendData.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Öneriler</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {trendData.recommendations.map((rec, index) => (
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
