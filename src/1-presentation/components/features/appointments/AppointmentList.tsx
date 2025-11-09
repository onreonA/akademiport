'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { useAppointments } from '@/shared/hooks/api/useAppointments';
import { formatEventDate, formatTimeRange } from '@/shared/utils/calendar.utils';
import type { AppointmentResponseDto } from '@/application/dto/appointment';
import { Pagination } from '@/presentation/components/ui/molecules/pagination';
import { AppointmentStatusLabels } from '@/domain/enums/AppointmentStatus';

interface AppointmentListProps {
  consultantId?: string;
  companyId?: string;
  programId?: string;
  onAppointmentClick?: (appointment: AppointmentResponseDto) => void;
  showFilters?: boolean;
}

export function AppointmentList({
  consultantId,
  companyId,
  programId,
  onAppointmentClick,
  showFilters = true,
}: AppointmentListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  const filters = useMemo(
    () => ({
      consultantId: consultantId || null,
      companyId: companyId || null,
      programId: programId || null,
      status: activeTab !== 'all' ? activeTab : statusFilter !== 'all' ? statusFilter : undefined,
      search: search || undefined,
      page,
      limit: 20,
    }),
    [consultantId, companyId, programId, activeTab, statusFilter, search, page]
  );

  const { data, isLoading, error } = useAppointments(filters);

  const appointments = data?.appointments || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      completed: 'secondary',
      cancelled: 'destructive',
    };

    return {
      label: AppointmentStatusLabels[status as keyof typeof AppointmentStatusLabels] || status,
      variant: colorMap[status] || 'outline',
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Randevu ara..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="pending">Beklemede</TabsTrigger>
          <TabsTrigger value="approved">Onaylandı</TabsTrigger>
          <TabsTrigger value="completed">Tamamlandı</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Randevu bulunamadı</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'pending'
                      ? 'Beklemede randevu bulunmamaktadır'
                      : activeTab === 'approved'
                        ? 'Onaylanmış randevu bulunmamaktadır'
                        : 'Randevu bulunmamaktadır'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {appointments.map((appointment) => {
                const statusBadge = getStatusBadge(appointment.status);
                return (
                  <Card
                    key={appointment.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold">{appointment.title}</h3>
                            <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                          </div>

                          {appointment.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {appointment.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>{formatEventDate(new Date(appointment.startTime))}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTimeRange(
                                  new Date(appointment.startTime),
                                  new Date(appointment.endTime)
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4" />
                              <span>Firma ID: {appointment.companyId.slice(0, 8)}...</span>
                            </div>
                          </div>

                          {appointment.zoomJoinUrl && (
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Zoom meeting hazır</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
