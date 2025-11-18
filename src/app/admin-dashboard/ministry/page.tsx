'use client';

import { useState, useEffect } from 'react';
import { useMinistryDashboard } from '@/1-presentation/hooks/useEcommerce';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Loader2, TrendingUp, Building2, ShoppingCart, Users, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Program {
  id: string;
  name: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function MinistryDashboardPage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const { data, isLoading } = useMinistryDashboard(
    selectedProgramId === 'all' ? undefined : selectedProgramId
  );

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

  const dashboard = data?.dashboard;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Prepare chart data
  const topCompaniesData =
    dashboard?.topCompanies?.slice(0, 10).map((company: any, index: number) => ({
      name:
        company.companyName.length > 15
          ? company.companyName.substring(0, 15) + '...'
          : company.companyName,
      revenue: company.totalRevenueAllTime,
      index: index + 1,
    })) || [];

  const platformData = dashboard?.platformDistribution || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bakanlık Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            E-ticaret performans istatistikleri ve analizleri
          </p>
        </div>
        {programs.length > 0 && (
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
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Firma</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">Aktif firma sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboard?.totalRevenue || 0).toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboard?.avgRevenue || 0).toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Firma başına</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Büyüme Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboard?.growthRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Ortalama büyüme</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Sipariş</CardTitle>
            <CardDescription>Tüm firmaların toplam sipariş sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(dashboard?.totalOrders || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toplam Ziyaretçi</CardTitle>
            <CardDescription>Tüm firmaların toplam ziyaretçi sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(dashboard?.totalVisitors || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies Chart */}
        <Card>
          <CardHeader>
            <CardTitle>En Yüksek Gelirli Firmalar (Top 10)</CardTitle>
            <CardDescription>Gelir bazında sıralama</CardDescription>
          </CardHeader>
          <CardContent>
            {topCompaniesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCompaniesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      value.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        maximumFractionDigits: 0,
                      })
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0088FE" name="Gelir" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Veri bulunamadı</div>
            )}
          </CardContent>
        </Card>

        {/* Platform Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Dağılımı</CardTitle>
            <CardDescription>Gelir bazında platform dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {platformData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      value.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        maximumFractionDigits: 0,
                      })
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Veri bulunamadı</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Companies Table */}
      {dashboard?.topCompanies && dashboard.topCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>En Yüksek Gelirli Firmalar</CardTitle>
            <CardDescription>Detaylı performans bilgileri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topCompanies.slice(0, 10).map((company: any, index: number) => (
                <div
                  key={company.companyId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{company.companyName}</p>
                      <p className="text-sm text-muted-foreground">{company.programName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {company.totalRevenueAllTime.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {company.totalOrdersAllTime.toLocaleString()} sipariş
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
