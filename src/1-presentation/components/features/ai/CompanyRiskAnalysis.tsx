/**
 * Company Risk Analysis Component
 *
 * AI ile firma risk analizi yapar
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
import { Sparkles, Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyRiskAnalysisProps {
  companyId: string;
  programId?: string;
  onAnalyzed?: (result: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    analysis: string;
    factors: Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
      score: number;
    }>;
    recommendations: string[];
  }) => void;
}

export function CompanyRiskAnalysis({
  companyId,
  programId,
  onAnalyzed,
}: CompanyRiskAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [riskData, setRiskData] = useState<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    analysis: string;
    factors: Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
      score: number;
    }>;
    recommendations: string[];
    projectProgress: {
      total: number;
      completed: number;
      inProgress: number;
      averageProgress: number;
    };
    trainingProgress: {
      total: number;
      completed: number;
      inProgress: number;
      averageProgress: number;
    };
    eventParticipation: {
      total: number;
      attended: number;
      attendanceRate: number;
    };
  } | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalyzed(false);

    try {
      const response = await fetch(`/api/ai/companies/${companyId}/analyze-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to analyze risk' }));
        throw new Error(errorData.error || 'Failed to analyze risk');
      }

      const data = await response.json();
      setAnalyzed(true);
      setRiskData(data);
      if (onAnalyzed) {
        onAnalyzed(data);
      }
      toast.success('Risk analizi başarıyla tamamlandı!');
    } catch (error) {
      console.error('Error analyzing company risk:', error);
      toast.error(error instanceof Error ? error.message : 'Risk analizi yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low':
        return 'Düşük Risk';
      case 'medium':
        return 'Orta Risk';
      case 'high':
        return 'Yüksek Risk';
      case 'critical':
        return 'Kritik Risk';
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
              <AlertTriangle className="w-5 h-5" />
              AI Risk Analizi
            </CardTitle>
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
        </CardHeader>
        {riskData && (
          <CardContent className="space-y-6">
            {/* Risk Score */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risk Skoru</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">{riskData.riskScore}</span>
                  <Badge className={getRiskColor(riskData.riskLevel)}>
                    {getRiskLabel(riskData.riskLevel)}
                  </Badge>
                </div>
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold">{riskData.riskScore}</span>
              </div>
            </div>

            {/* Analysis */}
            <div>
              <h4 className="font-semibold mb-2">Analiz</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {riskData.analysis}
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Proje İlerlemesi</p>
                <p className="text-2xl font-bold">{riskData.projectProgress.averageProgress}%</p>
                <p className="text-xs text-muted-foreground">
                  {riskData.projectProgress.completed}/{riskData.projectProgress.total} tamamlandı
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Eğitim İlerlemesi</p>
                <p className="text-2xl font-bold">{riskData.trainingProgress.averageProgress}%</p>
                <p className="text-xs text-muted-foreground">
                  {riskData.trainingProgress.completed}/{riskData.trainingProgress.total} tamamlandı
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Etkinlik Katılımı</p>
                <p className="text-2xl font-bold">{riskData.eventParticipation.attendanceRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {riskData.eventParticipation.attended}/{riskData.eventParticipation.total} katılım
                </p>
              </div>
            </div>

            {/* Factors */}
            {riskData.factors && riskData.factors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Risk Faktörleri</h4>
                <div className="space-y-2">
                  {riskData.factors.map((factor, index) => (
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
                          <span className="text-xs text-muted-foreground">{factor.score}/100</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {riskData.recommendations && riskData.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Öneriler</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {riskData.recommendations.map((rec, index) => (
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
