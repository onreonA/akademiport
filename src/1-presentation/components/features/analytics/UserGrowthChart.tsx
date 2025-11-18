/**
 * User Growth Chart Component
 * Shows user growth over time (monthly)
 * Sprint 27: Dashboard & Analytics
 */

'use client';

import React from 'react';
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
import { ChartContainer } from './ChartContainer';

interface UserGrowthData {
  month: string;
  users: number;
  growth: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
  height?: number;
  showCard?: boolean;
}

export function UserGrowthChart({ data, height = 300, showCard = true }: UserGrowthChartProps) {
  return (
    <ChartContainer
      title="Kullanıcı Büyümesi"
      description="Aylık kullanıcı büyüme trendi"
      height={height}
      showCard={showCard}
    >
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis
          dataKey="month"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
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
            return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
          }}
          formatter={(value: number) => [value.toLocaleString('tr-TR'), 'Kullanıcı']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="users"
          stroke="#0088FE"
          strokeWidth={2}
          name="Toplam Kullanıcı"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="growth"
          stroke="#00C49F"
          strokeWidth={2}
          name="Büyüme (%)"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
