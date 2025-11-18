/**
 * AI Insights Widget Component
 *
 * Dashboard için AI destekli analiz ve öneriler widget'ı
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';

export interface AIInsightsWidgetProps {
  dashboardType: 'master' | 'consultant' | 'company';
  companyId?: string;
  programId?: string;
  className?: string;
}

export function AIInsightsWidget({
  dashboardType,
  companyId,
  programId,
  className,
}: AIInsightsWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dashboardType,
      });
      if (companyId) params.append('companyId', companyId);
      if (programId) params.append('programId', programId);

      const response = await fetch(`/api/dashboard/ai-insights?${params.toString()}`);
      if (!response.ok) {
        throw new Error('AI insights alınamadı');
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast.error('AI insights yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [dashboardType, companyId, programId]);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading && !insights) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>AI destekli analiz ve öneriler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>AI destekli analiz ve öneriler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>AI insights yüklenemedi</p>
            <Button onClick={fetchInsights} variant="outline" className="mt-4" size="sm">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>AI destekli analiz ve öneriler</CardDescription>
          </div>
          <Button onClick={fetchInsights} variant="ghost" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yenile'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trends */}
        {insights.trends && insights.trends.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trendler
            </h4>
            <div className="space-y-2">
              {insights.trends.slice(0, 3).map((trend: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{trend.metric}</span>
                  <div className="flex items-center gap-2">
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <span className="h-4 w-4 text-muted-foreground">—</span>
                    )}
                    <span className="text-muted-foreground">{trend.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomalies */}
        {insights.anomalies && insights.anomalies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Anomaliler
            </h4>
            <div className="space-y-2">
              {insights.anomalies.slice(0, 2).map((anomaly: any, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded-md">
                  <div className="font-medium">{anomaly.metric}</div>
                  <div className="text-muted-foreground text-xs mt-1">{anomaly.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Öneriler
            </h4>
            <div className="space-y-2">
              {insights.recommendations.slice(0, 3).map((rec: any, index: number) => (
                <div key={index} className="text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant={getPriorityColor(rec.priority) as any} className="mt-0.5">
                      {rec.priority || 'medium'}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{rec.title}</div>
                      <div className="text-muted-foreground text-xs mt-1">{rec.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Insights */}
        {insights.insights && insights.insights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Genel İçgörüler</h4>
            <div className="space-y-2">
              {insights.insights.slice(0, 2).map((insight: any, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(insight.severity) as any}>
                      {insight.type}
                    </Badge>
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <div className="text-muted-foreground text-xs">{insight.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!insights.trends || insights.trends.length === 0) &&
          (!insights.anomalies || insights.anomalies.length === 0) &&
          (!insights.recommendations || insights.recommendations.length === 0) &&
          (!insights.insights || insights.insights.length === 0) && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Henüz AI insights bulunmuyor
            </div>
          )}
      </CardContent>
    </Card>
  );
}
