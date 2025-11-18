/**
 * Chart Container Component
 * Responsive wrapper for Recharts components
 * Sprint 27: Dashboard & Analytics
 */

'use client';

import React from 'react';
import { ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { cn } from '@/presentation/lib/utils';

interface ChartContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  height?: number;
  className?: string;
  showCard?: boolean;
}

export function ChartContainer({
  title,
  description,
  children,
  height = 300,
  className,
  showCard = true,
}: ChartContainerProps) {
  const content = (
    <ResponsiveContainer width="100%" height={height} className={cn('min-h-[200px]', className)}>
      {children}
    </ResponsiveContainer>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{content}</CardContent>
    </Card>
  );
}
