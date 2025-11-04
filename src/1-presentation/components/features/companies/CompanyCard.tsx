/**
 * Company Card Component
 *
 * Modern, elegant card design inspired by akademiport.com
 * Consistent layout with fixed button positions
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Users, Calendar, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import type { Company } from '@/domain/entities/Company';

interface CompanyCardProps {
  company: Company;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  const progressPercentage = Math.round((company.currentUsers / company.maxUsers) * 100);

  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="group flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/30 dark:hover:border-primary/30">
      {/* Header with Badges */}
      <CardHeader className="pb-3 space-y-3">
        {/* Badges Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {company.sector && (
              <Badge variant="secondary" className="text-xs font-medium">
                {company.sector}
              </Badge>
            )}
            {company.city && (
              <Badge variant="outline" className="text-xs font-medium">
                {company.city}
              </Badge>
            )}
          </div>
          <Badge
            className={`${
              company.isActive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            } border font-medium px-2.5 py-1 shrink-0 text-xs`}
          >
            {company.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
            <Link
              href={`/dashboard/companies/${company.id}`}
              className="hover:text-primary transition-colors"
            >
              {company.name}
            </Link>
          </CardTitle>
        </div>
      </CardHeader>

      {/* Content - Flex container for consistent button placement */}
      <CardContent className="flex-1 flex flex-col pt-0 pb-4 space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Kullanıcı İlerlemesi
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {company.currentUsers} / {company.maxUsers} Kullanıcı
          </div>
        </div>

        {/* Metrics Cards - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Users Metric */}
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {company.currentUsers}/{company.maxUsers}
            </div>
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Kullanıcı
            </div>
          </div>

          {/* Foundation Year or Logo */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            {company.foundationYear ? (
              <>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {company.foundationYear}
                </div>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Kuruluş Yılı
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">-</div>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Kuruluş Yılı
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          {/* Location */}
          {company.city && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate">{company.city}</span>
            </div>
          )}

          {/* Foundation Year */}
          {company.foundationYear && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                Kuruluş: {company.foundationYear}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer - Always at bottom with assignment date and buttons */}
      <CardFooter className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        {/* Creation Date */}
        <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400">
          <span>Oluşturulma</span>
          <span className="font-medium">{formatShortDate(company.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            asChild
            className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
          >
            <Link href={`/dashboard/companies/${company.id}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Detaylar
            </Link>
          </Button>
          {onEdit && (
            <Button
              size="sm"
              onClick={() => onEdit(company.id)}
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-none transition-colors"
            >
              Düzenle
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              onClick={() => onDelete(company.id)}
              className="flex-1 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 shadow-none transition-colors"
            >
              Sil
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
