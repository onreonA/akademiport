/**
 * Task Completion Chart Component
 * Shows task completion rate over time (area chart)
 * Sprint 27: Dashboard & Analytics
 */

'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';

interface TaskCompletionData {
  date: string;
  completed: number;
  pending: number;
  total: number;
  completionRate: number;
}

interface TaskCompletionChartProps {
  data: TaskCompletionData[];
  height?: number;
  showCard?: boolean;
}

export function TaskCompletionChart({
  data,
  height = 300,
  showCard = true,
}: TaskCompletionChartProps) {
  return (
    <ChartContainer
      title="Görev Tamamlanma Oranı"
      description="Zaman içinde görev tamamlanma trendi"
      height={height}
      showCard={showCard}
    >
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#FF8042" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          labelFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          }}
          formatter={(value: number, name: string) => {
            if (name === 'completionRate') {
              return [`${value.toFixed(1)}%`, 'Tamamlanma Oranı'];
            }
            return [
              value.toLocaleString('tr-TR'),
              name === 'completed' ? 'Tamamlanan' : 'Bekleyen',
            ];
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="completed"
          stackId="1"
          stroke="#00C49F"
          fill="url(#colorCompleted)"
          name="Tamamlanan"
        />
        <Area
          type="monotone"
          dataKey="pending"
          stackId="1"
          stroke="#FF8042"
          fill="url(#colorPending)"
          name="Bekleyen"
        />
      </AreaChart>
    </ChartContainer>
  );
}
