/**
 * Project Progress Chart Component
 * Shows project progress (bar chart)
 * Sprint 27: Dashboard & Analytics
 */

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';

interface ProjectProgressData {
  projectName: string;
  progress: number;
  status: string;
}

interface ProjectProgressChartProps {
  data: ProjectProgressData[];
  height?: number;
  showCard?: boolean;
}

const statusColors: Record<string, string> = {
  todo: '#8884d8',
  in_progress: '#0088FE',
  review: '#FFBB28',
  done: '#00C49F',
  cancelled: '#FF8042',
};

export function ProjectProgressChart({
  data,
  height = 300,
  showCard = true,
}: ProjectProgressChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name:
      item.projectName.length > 20 ? item.projectName.substring(0, 20) + '...' : item.projectName,
  }));

  return (
    <ChartContainer
      title="Proje İlerlemesi"
      description="Proje bazlı ilerleme durumu"
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
        <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: 'currentColor' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [`${value}%`, 'İlerleme']}
        />
        <Legend />
        <Bar dataKey="progress" fill="#0088FE" name="İlerleme (%)" />
      </BarChart>
    </ChartContainer>
  );
}
