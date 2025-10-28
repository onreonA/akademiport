/**
 * Program Detail Page
 * 
 * Detailed view of a single program with management options
 */

'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Building2, 
  DollarSign, 
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import type { Program } from '@/domain/entities/Program';
import { ProgramStatusLabels } from '@/domain/enums/ProgramStatus';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [program, setProgram] = React.useState<Program | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/programs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Program yüklenemedi');
        }

        setProgram(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  const handleDelete = async () => {
    if (!program) return;
    
    if (!confirm(`"${program.name}" programını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Program silinemedi');
      }

      router.push('/dashboard/programs');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Program silinirken bir hata oluştu');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium">{error || 'Program bulunamadı'}</p>
          <Button onClick={() => router.push('/dashboard/programs')}>
            Programlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    planned: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{program.name}</h1>
            <p className="text-muted-foreground">{program.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[program.status]}>
            {ProgramStatusLabels[program.status]}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konum</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {program.city || 'Belirtilmemiş'}
            </div>
            {program.region && (
              <p className="text-xs text-muted-foreground">{program.region}</p>
            )}
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Süre</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{program.durationMonths || 0} Ay</div>
            <p className="text-xs text-muted-foreground">
              {formatDate(program.startDate)} - {formatDate(program.endDate)}
            </p>
          </CardContent>
        </Card>

        {/* Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firmalar</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {program.currentCompanies} / {program.maxCompanies}
            </div>
            <div className="mt-2 bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{
                  width: `${(program.currentCompanies / program.maxCompanies) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bütçe</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {program.budget ? formatCurrency(program.budget) : 'Belirtilmemiş'}
            </div>
            {program.sponsor && (
              <p className="text-xs text-muted-foreground">{program.sponsor}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="companies">Firmalar</TabsTrigger>
          <TabsTrigger value="consultants">Danışmanlar</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Program Tipi</p>
                  <p className="text-base">{program.programType || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Slug</p>
                  <p className="text-base font-mono text-sm">{program.slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Oluşturulma</p>
                  <p className="text-base">{formatDate(program.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Son Güncelleme</p>
                  <p className="text-base">{formatDate(program.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Firmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Firma listesi yakında eklenecek...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultants">
          <Card>
            <CardHeader>
              <CardTitle>Danışmanlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Danışman listesi yakında eklenecek...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Ayarlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Program ayarları yakında eklenecek...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

