'use client';

/**
 * Company Card Component
 * Sprint 6: Company Management
 */

import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import type { Company } from '@/domain/entities/Company';

interface CompanyCardProps {
  company: Company;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{company.name}</h3>
              {company.sector && (
                <p className="text-sm text-muted-foreground">{company.sector}</p>
              )}
            </div>
          </div>
          <Badge variant={company.isActive ? 'default' : 'secondary'}>
            {company.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {company.city && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{company.city}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {company.currentUsers} / {company.maxUsers} Kullanıcı
          </span>
        </div>

        {company.foundationYear && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Kuruluş: {company.foundationYear}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/dashboard/companies/${company.id}`}>Detay</Link>
        </Button>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(company.id)}>
            Düzenle
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(company.id)}>
            Sil
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

