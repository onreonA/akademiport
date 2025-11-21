/**
 * Company Distribution Chart Component
 * Shows company distribution by status (pie chart)
 * Sprint 27: Dashboard & Analytics
 */

'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartContainer } from './ChartContainer';

interface CompanyDistributionData {
  name: string;
  value: number;
}

interface CompanyDistributionChartProps {
  data: CompanyDistributionData[];
  height?: number;
  showCard?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function CompanyDistributionChart({
  data,
  height = 300,
  showCard = true,
}: CompanyDistributionChartProps) {
  // Convert to format expected by Recharts
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.value,
  }));

  return (
    <ChartContainer
      title="Firma Dağılımı"
      description="Firma durumlarına göre dağılım"
      height={height}
      showCard={showCard}
    >
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [value.toLocaleString('tr-TR'), 'Firma']}
        />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
}
