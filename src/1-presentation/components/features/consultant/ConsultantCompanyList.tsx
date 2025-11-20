/**
 * Consultant Company List Component
 * Sprint 7: Consultant Management
 *
 * Program bazlı firma listesi
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Building2, MapPin, Users, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { useConsultantProgram } from '@/shared/contexts/ConsultantProgramContext';
import type { ConsultantCompanyWithStats } from '@/application/dto/consultant';

// =====================================================
// TYPES
// =====================================================

interface ConsultantCompanyListProps {
  onCompanyClick?: (companyId: string) => void;
  limit?: number;
}

// =====================================================
// COMPONENT
// =====================================================

export function ConsultantCompanyList({ onCompanyClick, limit = 10 }: ConsultantCompanyListProps) {
  const { selectedProgram } = useConsultantProgram();
  const [companies, setCompanies] = useState<ConsultantCompanyWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    if (!selectedProgram) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/consultant/programs/${selectedProgram.id}/companies?limit=${limit}`
      );
      const data = await response.json();

      if (data.success) {
        setCompanies(data.data);
      } else {
        setError(data.error || 'Firmalar yüklenemedi');
      }
    } catch (err) {
      setError('Firmalar yüklenirken bir hata oluştu');
      console.error('Failed to fetch companies:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProgram, limit]);

  useEffect(() => {
    if (selectedProgram) {
      fetchCompanies();
    } else {
      setCompanies([]);
    }
  }, [selectedProgram, fetchCompanies]);

  const handleCompanyClick = (companyId: string) => {
    if (!companyId || companyId === 'undefined') {
      console.error('Company ID is undefined or invalid:', companyId);
      return;
    }
    if (onCompanyClick) {
      onCompanyClick(companyId);
    } else {
      window.location.href = `/consultant-dashboard/companies/${companyId}`;
    }
  };

  if (!selectedProgram) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Firmalar</CardTitle>
          <CardDescription>Lütfen bir program seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mb-2" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Firmaları görüntülemek için yukarıdan bir program seçin
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Firmalar</CardTitle>
          <CardDescription>{selectedProgram.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
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
          <CardTitle>Firmalar</CardTitle>
          <CardDescription>{selectedProgram.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={fetchCompanies} className="mt-4">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Firmalar</CardTitle>
          <CardDescription>{selectedProgram.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Bu programda henüz firma bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firmalar</CardTitle>
        <CardDescription>
          {selectedProgram.name} - {companies.length} firma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.map((item) => {
            if (!item.company?.id) {
              console.error('Company ID is missing:', item);
              return null;
            }
            return (
              <div
                key={item.company.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleCompanyClick(item.company.id)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.company.name}</h3>
                      {item.company.isActive ? (
                        <Badge variant="default" className="text-xs">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Pasif
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {item.company.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.company.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{item.usersCount} kullanıcı</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
