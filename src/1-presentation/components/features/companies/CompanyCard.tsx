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
    <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <div className="relative">
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-14 h-14 rounded-xl object-cover shadow-sm"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                    company.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                    company.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                {company.name}
              </h3>
              {company.sector && (
                <p className="text-sm text-muted-foreground font-medium">{company.sector}</p>
              )}
            </div>
          </div>
          <Badge
            variant={company.isActive ? 'default' : 'secondary'}
            className={`font-medium px-3 py-1 ${
              company.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
            }`}
          >
            {company.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {company.city && (
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">{company.city}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-950">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium">
                {company.currentUsers} / {company.maxUsers} Kullanıcı
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((company.currentUsers / company.maxUsers) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 ease-out"
              style={{
                width: `${(company.currentUsers / company.maxUsers) * 100}%`,
              }}
            />
          </div>
        </div>

        {company.foundationYear && (
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-950">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-medium">Kuruluş: {company.foundationYear}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hover:bg-primary hover:text-primary-foreground transition-colors flex-1"
        >
          <Link href={`/dashboard/companies/${company.id}`}>Detay</Link>
        </Button>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(company.id)}
            className="hover:bg-secondary transition-colors"
          >
            Düzenle
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(company.id)}
            className="hover:bg-destructive/90 transition-colors"
          >
            Sil
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
