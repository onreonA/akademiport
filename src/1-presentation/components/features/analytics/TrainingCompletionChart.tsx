/**
 * Training Completion Chart Component
 * Shows training completion rates (bar chart)
 * Sprint 27: Dashboard & Analytics
 */

'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer } from './ChartContainer';

interface TrainingCompletionData {
  trainingName: string;
  completed: number;
  total: number;
  completionRate: number;
}

interface TrainingCompletionChartProps {
  data: TrainingCompletionData[];
  height?: number;
  showCard?: boolean;
}

export function TrainingCompletionChart({
  data,
  height = 300,
  showCard = true,
}: TrainingCompletionChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name:
      item.trainingName.length > 20
        ? item.trainingName.substring(0, 20) + '...'
        : item.trainingName,
  }));

  return (
    <ChartContainer
      title="Eğitim Tamamlanma Oranı"
      description="Eğitim bazlı tamamlanma istatistikleri"
      height={height}
      showCard={showCard}
    >
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => {
            if (name === 'completionRate') {
              return [`${value.toFixed(1)}%`, 'Tamamlanma Oranı'];
            }
            return [value.toLocaleString('tr-TR'), name === 'completed' ? 'Tamamlanan' : 'Toplam'];
          }}
        />
        <Legend />
        <Bar dataKey="completed" fill="#00C49F" name="Tamamlanan" />
        <Bar dataKey="total" fill="#0088FE" name="Toplam" />
      </BarChart>
    </ChartContainer>
  );
}
