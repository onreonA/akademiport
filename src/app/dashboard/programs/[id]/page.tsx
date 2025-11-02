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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/atoms/card';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { EmptyState } from '@/presentation/components/ui/atoms/empty-state';
import { StatCard } from '@/presentation/components/ui/atoms/stat-card';
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import type { Program } from '@/domain/entities/Program';
import { ProgramStatusLabels } from '@/domain/enums/ProgramStatus';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [program, setProgram] = React.useState<Program | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [consultants, setConsultants] = React.useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = React.useState(false);
  const [loadingConsultants, setLoadingConsultants] = React.useState(false);

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

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await fetch(`/api/companies?programId=${id}`);
      const data = await response.json();

      if (data.success) {
        setCompanies(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      setLoadingConsultants(true);
      // Fetch consultants assigned to this program
      const response = await fetch(`/api/programs/${id}/consultants`);
      const data = await response.json();

      if (data.success) {
        setConsultants(data.data || []);
      } else {
        console.error('Failed to fetch consultants:', data.error);
        setConsultants([]); // Set empty array on error
      }
    } catch (err) {
      console.error('Failed to fetch consultants:', err);
      setConsultants([]); // Set empty array on error
    } finally {
      setLoadingConsultants(false);
    }
  };

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
          <Button onClick={() => router.push('/dashboard/programs')}>Programlara Dön</Button>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-primary/10 transition-colors mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {program.name}
                </h1>
                <Badge className={statusColors[program.status]}>
                  {ProgramStatusLabels[program.status]}
                </Badge>
              </div>
              {program.description && (
                <p className="text-muted-foreground text-lg">{program.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/programs/${id}/edit`)}
              className="hover-lift"
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="hover-lift">
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Konum"
            value={program.city || 'Belirtilmemiş'}
            description={program.region}
            icon={MapPin}
            color="blue"
          />
          <StatCard
            title="Süre"
            value={`${program.durationMonths || 0} Ay`}
            description={`${formatDate(program.startDate)} - ${formatDate(program.endDate)}`}
            icon={Calendar}
            color="green"
          />
          <StatCard
            title="Firmalar"
            value={`${program.currentCompanies} / ${program.maxCompanies}`}
            description={`%${Math.round((program.currentCompanies / program.maxCompanies) * 100)} doluluk`}
            icon={Building2}
            color="purple"
            trend={{
              value: program.currentCompanies,
              direction: program.currentCompanies > 0 ? 'up' : 'neutral',
              period: 'toplam',
            }}
          />
          <StatCard
            title="Bütçe"
            value={program.budget ? formatCurrency(program.budget) : 'Belirtilmemiş'}
            description={program.sponsor}
            icon={DollarSign}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <Tabs defaultValue="overview" className="space-y-6">
            <CardHeader className="border-b border-border/50">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Genel Bakış
                </TabsTrigger>
                <TabsTrigger
                  value="companies"
                  className="data-[state=active]:bg-primary/10"
                  onClick={() => companies.length === 0 && fetchCompanies()}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Firmalar
                </TabsTrigger>
                <TabsTrigger
                  value="consultants"
                  className="data-[state=active]:bg-primary/10"
                  onClick={() => consultants.length === 0 && fetchConsultants()}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Danışmanlar
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Program Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Program Tipi</p>
                        <p className="text-base font-medium">
                          {program.programType || 'Belirtilmemiş'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Slug</p>
                        <p className="text-base font-mono text-sm bg-muted px-2 py-1 rounded">
                          {program.slug}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Zaman Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Oluşturulma</p>
                        <p className="text-base font-medium">{formatDate(program.createdAt)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Son Güncelleme</p>
                        <p className="text-base font-medium">{formatDate(program.updatedAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">İstatistikler</CardTitle>
                    <CardDescription>Program performans göstergeleri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Doluluk Oranı
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              %{Math.round((program.currentCompanies / program.maxCompanies) * 100)}
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-blue-500" />
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Aktif Firmalar
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {program.currentCompanies}
                            </p>
                          </div>
                          <Building2 className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Kapasite</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {program.maxCompanies}
                            </p>
                          </div>
                          <Users className="w-8 h-8 text-purple-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="companies" className="mt-0">
                {loadingCompanies ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : companies.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="Henüz firma eklenmemiş"
                    description="Bu programa henüz firma eklenmemiş. Firma eklemek için firmalar sayfasına gidin."
                    action={{
                      label: 'Firma Ekle',
                      onClick: () => router.push('/dashboard/companies/new'),
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company) => (
                      <Card
                        key={company.id}
                        className="hover-lift cursor-pointer border-border/50"
                        onClick={() => router.push(`/dashboard/companies/${company.id}`)}
                      >
                        <CardHeader>
                          <CardTitle className="text-base">{company.name}</CardTitle>
                          <CardDescription>{company.legalName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {company.currentUsers || 0} / {company.maxUsers} kullanıcı
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="consultants" className="mt-0 space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      // TODO: Open modal to add consultant
                      alert('Danışman ekleme özelliği yakında eklenecek');
                    }}
                    className="hover-lift"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Danışman Ekle
                  </Button>
                </div>

                {loadingConsultants ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : consultants.length === 0 ? (
                  <EmptyState
                    icon={UserCheck}
                    title="Henüz danışman atanmamış"
                    description="Bu programa henüz danışman atanmamış. Yukarıdaki butona tıklayarak danışman ekleyebilirsiniz."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {consultants.map((consultant) => (
                      <Card key={consultant.id} className="border-border/50 hover-lift">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">
                                {consultant.firstName} {consultant.lastName}
                              </CardTitle>
                              <CardDescription>{consultant.email}</CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    `${consultant.firstName} ${consultant.lastName} danışmanını programdan çıkarmak istediğinizden emin misiniz?`
                                  )
                                ) {
                                  try {
                                    const response = await fetch(
                                      `/api/programs/${id}/consultants/${consultant.id}`,
                                      { method: 'DELETE' }
                                    );
                                    const data = await response.json();
                                    if (data.success) {
                                      fetchConsultants();
                                    } else {
                                      alert(data.error || 'Danışman çıkarılamadı');
                                    }
                                  } catch (err) {
                                    alert('Bir hata oluştu');
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserCheck className="w-4 h-4" />
                            <span>Danışman</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
