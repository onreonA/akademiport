'use client';

import { useEcommercePerformance } from '@/1-presentation/hooks/useEcommerce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/atoms/table';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EcommercePerformanceFilterDto } from '@/2-application/dtos/ecommerce';

interface EcommercePerformanceTableProps {
  programId?: string;
  companyId?: string;
  minRevenue?: number;
}

export function EcommercePerformanceTable({
  programId,
  companyId,
  minRevenue,
}: EcommercePerformanceTableProps) {
  const { data, isLoading } = useEcommercePerformance({
    programId,
    companyId,
    minRevenue,
    limit: 50,
  });

  const performance = data?.performance || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (performance.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Performans verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sıra</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>Program</TableHead>
            <TableHead className="text-right">Toplam Gelir</TableHead>
            <TableHead className="text-right">Son Ay Gelir</TableHead>
            <TableHead className="text-right">Son 3 Ay Gelir</TableHead>
            <TableHead className="text-right">Toplam Sipariş</TableHead>
            <TableHead className="text-right">Toplam Ziyaretçi</TableHead>
            <TableHead className="text-right">Büyüme</TableHead>
            <TableHead>Son Güncelleme</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {performance.map((item: any, index: number) => (
            <TableRow key={item.companyId}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{item.companyName}</TableCell>
              <TableCell>{item.programName}</TableCell>
              <TableCell className="text-right font-semibold">
                {item.totalRevenueAllTime.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </TableCell>
              <TableCell className="text-right">
                {item.revenueLastMonth.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </TableCell>
              <TableCell className="text-right">
                {item.revenueLast3Months.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </TableCell>
              <TableCell className="text-right">
                {item.totalOrdersAllTime.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {item.totalVisitorsAllTime.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {item.revenueGrowthPercentage > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : item.revenueGrowthPercentage < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                  <span
                    className={
                      item.revenueGrowthPercentage > 0
                        ? 'text-green-600'
                        : item.revenueGrowthPercentage < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }
                  >
                    {item.revenueGrowthPercentage.toFixed(1)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {item.lastUpdatedAt
                  ? new Date(item.lastUpdatedAt).toLocaleDateString('tr-TR')
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
