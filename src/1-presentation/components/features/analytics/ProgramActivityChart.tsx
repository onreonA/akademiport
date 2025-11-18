/**
 * Program Activity Chart Component
 * Shows activity by program (bar chart)
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

interface ProgramActivityData {
  programName: string;
  companies: number;
  projects: number;
  users: number;
}

interface ProgramActivityChartProps {
  data: ProgramActivityData[];
  height?: number;
  showCard?: boolean;
}

export function ProgramActivityChart({
  data,
  height = 300,
  showCard = true,
}: ProgramActivityChartProps) {
  return (
    <ChartContainer
      title="Program Aktivitesi"
      description="Program bazlı firma, proje ve kullanıcı sayıları"
      height={height}
      showCard={showCard}
    >
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis
          dataKey="programName"
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
          formatter={(value: number) => [value.toLocaleString('tr-TR'), '']}
        />
        <Legend />
        <Bar dataKey="companies" fill="#0088FE" name="Firmalar" />
        <Bar dataKey="projects" fill="#00C49F" name="Projeler" />
        <Bar dataKey="users" fill="#FFBB28" name="Kullanıcılar" />
      </BarChart>
    </ChartContainer>
  );
}
