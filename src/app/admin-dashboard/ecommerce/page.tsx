'use client';

import { useState, useEffect } from 'react';
import { EcommercePerformanceTable } from '@/1-presentation/components/features/ecommerce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { useEcommercePerformance } from '@/1-presentation/hooks/useEcommerce';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
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

interface Program {
  id: string;
  name: string;
}

export default function AdminEcommercePage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [minRevenue, setMinRevenue] = useState<string>('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: performanceData } = useEcommercePerformance({
    programId: selectedProgramId === 'all' ? undefined : selectedProgramId,
    minRevenue: minRevenue ? parseFloat(minRevenue) : undefined,
    limit: 50,
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs?limit=100');
      const data = await response.json();
      if (data.success && data.data) {
        setPrograms(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for top companies
  const chartData =
    performanceData?.performance?.slice(0, 10).map((item: any) => ({
      name:
        item.companyName.length > 15 ? item.companyName.substring(0, 15) + '...' : item.companyName,
      revenue: item.totalRevenueAllTime,
      orders: item.totalOrdersAllTime,
      visitors: item.totalVisitorsAllTime,
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">E-ticaret Performans Tablosu</h1>
        <p className="text-muted-foreground mt-2">
          Firmaların e-ticaret performanslarını görüntüleyin ve karşılaştırın
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {!loading && programs.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="program">Program:</Label>
            <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Tüm programlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm programlar</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Label htmlFor="minRevenue">Min. Gelir:</Label>
          <Input
            id="minRevenue"
            type="number"
            placeholder="0"
            value={minRevenue}
            onChange={(e) => setMinRevenue(e.target.value)}
            className="w-[150px]"
          />
        </div>
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Firma Performansı</CardTitle>
            <CardDescription>
              En yüksek gelire sahip firmaların performans karşılaştırması
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
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
                    return [
                      value.toLocaleString('tr-TR'),
                      name === 'orders' ? 'Sipariş' : 'Ziyaretçi',
                    ];
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#0088FE" name="Gelir" />
                <Bar dataKey="orders" fill="#00C49F" name="Sipariş" />
                <Bar dataKey="visitors" fill="#FFBB28" name="Ziyaretçi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Performance Table */}
      <EcommercePerformanceTable
        programId={selectedProgramId === 'all' ? undefined : selectedProgramId}
        minRevenue={minRevenue ? parseFloat(minRevenue) : undefined}
      />
    </div>
  );
}
