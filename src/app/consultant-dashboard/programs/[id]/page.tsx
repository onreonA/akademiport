/**
 * Consultant Program Detail Page
 *
 * Detailed view of a single program for consultants (read-only)
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { EmptyState } from '@/presentation/components/ui/atoms/empty-state';
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  AlertCircle,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import type { Program } from '@/domain/entities/Program';
import { ProgramStatusLabels } from '@/domain/enums/ProgramStatus';
import {
  ConsultantProgramProvider,
  useConsultantProgram,
} from '@/shared/contexts/ConsultantProgramContext';

// =====================================================
// INNER COMPONENT
// =====================================================
function ConsultantProgramDetailContent({ programId }: { programId: string }) {
  const router = useRouter();
  const { selectedProgram } = useConsultantProgram();
  const [program, setProgram] = React.useState<Program | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [companies, setCompanies] = React.useState<
    Array<{
      id: string;
      name: string;
      legalName?: string;
      currentUsers?: number;
      maxUsers?: number;
      usersCount?: number;
      tasksCount?: number;
      completedTasksCount?: number;
      trainingsCount?: number;
      completedTrainingsCount?: number;
      lastActivityAt?: string;
    }>
  >([]);
  const [loadingCompanies, setLoadingCompanies] = React.useState(false);

  React.useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/consultant/programs/${programId}`);
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
  }, [programId]);

  const fetchCompanies = React.useCallback(async () => {
    try {
      setLoadingCompanies(true);
      const response = await fetch(`/api/consultant/programs/${programId}/companies?limit=100`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // API returns ConsultantCompanyWithStats[], extract company objects
        const companyList = data.data.map((item: any) => ({
          ...item.company,
          usersCount: item.usersCount,
          tasksCount: item.tasksCount,
          completedTasksCount: item.completedTasksCount,
          trainingsCount: item.trainingsCount,
          completedTrainingsCount: item.completedTrainingsCount,
          lastActivityAt: item.lastActivityAt,
        }));
        setCompanies(companyList);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, [programId]);

  React.useEffect(() => {
    // Fetch companies when programId is available
    if (programId) {
      fetchCompanies();
    }
  }, [programId, fetchCompanies]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {error || 'Program Bulunamadı'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Program bilgileri yüklenemedi'}
            </p>
            <Button onClick={() => router.push('/consultant-dashboard/programs')}>
              Programlara Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/consultant-dashboard/programs')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {program.name}
                </h1>
                <Badge
                  className={`${
                    program.status === 'planned'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : program.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                        : program.status === 'completed'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                          : program.status === 'paused'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  } border font-medium px-2.5 py-1`}
                >
                  {ProgramStatusLabels[program.status]}
                </Badge>
              </div>
              {program.description && (
                <p className="text-gray-600 dark:text-gray-400 text-base">{program.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Konum
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {program.city || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Süre
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {program.durationMonths || 0} Ay
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Firmalar
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {program.currentCompanies || 0} / {program.maxCompanies || 0}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Doluluk
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    %
                    {Math.round(
                      ((program.currentCompanies || 0) / (program.maxCompanies || 1)) * 100
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <Tabs defaultValue="overview" className="space-y-6">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
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
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Program Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Program Tipi
                        </p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {program.programType || 'Belirtilmemiş'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Slug</p>
                        <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white">
                          {program.slug}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Zaman Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Başlangıç
                        </p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {formatDate(program.startDate)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Bitiş
                        </p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {formatDate(program.endDate)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="companies" className="mt-0">
                {loadingCompanies ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : companies.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="Henüz firma eklenmemiş"
                    description="Bu programa henüz firma eklenmemiş."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company) => {
                      if (!company?.id) {
                        console.error('Company ID is missing:', company);
                        return null;
                      }
                      return (
                        <Card
                          key={company.id}
                          className="border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            if (company.id) {
                              router.push(`/consultant-dashboard/companies/${company.id}`);
                            }
                          }}
                        >
                          <CardHeader>
                            <CardTitle className="text-base text-gray-900 dark:text-white">
                              {company.name}
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              {company.legalName}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>
                                {company.currentUsers || 0} / {company.maxUsers} kullanıcı
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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

// =====================================================
// PAGE COMPONENT (with Provider)
// =====================================================
export default function ConsultantProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ConsultantProgramProvider>
      <ConsultantProgramDetailContent programId={id} />
    </ConsultantProgramProvider>
  );
}
