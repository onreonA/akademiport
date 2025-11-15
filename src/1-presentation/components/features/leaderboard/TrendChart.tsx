'use client';

import { useLeaderboardHistory } from '@/1-presentation/hooks/useLeaderboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TrendChartProps {
  companyId: string;
  programId: string;
  weeks?: number;
}

export function TrendChart({ companyId, programId, weeks = 12 }: TrendChartProps) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const { data, isLoading, error } = useLeaderboardHistory(companyId, programId, startDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Trend verileri yüklenemedi</p>
      </div>
    );
  }

  const history = data?.history || [];

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Henüz trend verisi yok</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = history.map((item) => ({
    date: format(new Date(item.snapshotDate), 'dd MMM', { locale: tr }),
    total: item.totalScore,
    project: item.projectScore,
    training: item.trainingScore,
    event: item.eventScore,
    forum: item.forumScore,
    news: item.newsScore,
    rank: item.rank,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          strokeWidth={2}
          name="Toplam Puan"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="project"
          stroke="#82ca9d"
          strokeWidth={1}
          name="Proje"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="training"
          stroke="#ffc658"
          strokeWidth={1}
          name="Eğitim"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="event"
          stroke="#ff7300"
          strokeWidth={1}
          name="Etkinlik"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="forum"
          stroke="#00ff00"
          strokeWidth={1}
          name="Forum"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="news"
          stroke="#0088fe"
          strokeWidth={1}
          name="Haberler"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="rank"
          stroke="#ff0000"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Sıralama"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}



