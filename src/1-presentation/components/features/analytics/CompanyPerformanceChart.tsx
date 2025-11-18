/**
 * Company Performance Chart Component
 * Shows company performance metrics (bar chart)
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

interface CompanyPerformanceData {
  companyName: string;
  projects: number;
  completedProjects: number;
  completionRate: number;
}

interface CompanyPerformanceChartProps {
  data: CompanyPerformanceData[];
  height?: number;
  showCard?: boolean;
}

export function CompanyPerformanceChart({
  data,
  height = 300,
  showCard = true,
}: CompanyPerformanceChartProps) {
  return (
    <ChartContainer
      title="Firma Performansı"
      description="Firma bazlı proje sayıları ve tamamlanma oranları"
      height={height}
      showCard={showCard}
    >
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis
          dataKey="companyName"
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
            return [
              value.toLocaleString('tr-TR'),
              name === 'projects' ? 'Toplam Proje' : 'Tamamlanan',
            ];
          }}
        />
        <Legend />
        <Bar dataKey="projects" fill="#0088FE" name="Toplam Proje" />
        <Bar dataKey="completedProjects" fill="#00C49F" name="Tamamlanan" />
      </BarChart>
    </ChartContainer>
  );
}
