/**
 * E-commerce Metrics Chart Component
 * Shows e-commerce metrics over time (line chart)
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

interface EcommerceMetricsData {
  month: string;
  revenue: number;
  orders: number;
  visitors: number;
}

interface EcommerceMetricsChartProps {
  data: EcommerceMetricsData[];
  height?: number;
  showCard?: boolean;
}

export function EcommerceMetricsChart({
  data,
  height = 300,
  showCard = true,
}: EcommerceMetricsChartProps) {
  return (
    <ChartContainer
      title="E-ticaret Metrikleri"
      description="Aylık gelir, sipariş ve ziyaretçi trendi"
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
            const date = new Date(value + '-01');
            return date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
          }}
        />
        <YAxis yAxisId="left" className="text-xs" tick={{ fill: 'currentColor' }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          labelFormatter={(value) => {
            const date = new Date(value + '-01');
            return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
          }}
          formatter={(value: number, name: string) => {
            if (name === 'revenue') {
              return [
                value.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                }),
                'Gelir',
              ];
            }
            return [value.toLocaleString('tr-TR'), name === 'orders' ? 'Sipariş' : 'Ziyaretçi'];
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#0088FE"
          strokeWidth={2}
          name="Gelir"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="orders"
          stroke="#00C49F"
          strokeWidth={2}
          name="Sipariş"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="visitors"
          stroke="#FFBB28"
          strokeWidth={2}
          name="Ziyaretçi"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
