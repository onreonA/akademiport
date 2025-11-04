'use client';

/**
 * Company Profile Card Component
 * Sprint 6: Company Management
 */

import React from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import type { Company } from '@/domain/entities/Company';

interface CompanyProfileCardProps {
  company: Company;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function CompanyProfileCard({ company, onEdit, canEdit = false }: CompanyProfileCardProps) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
              {company.legalName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{company.legalName}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`${
                    company.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  } border font-medium`}
                >
                  {company.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
                {company.sector && (
                  <Badge variant="outline" className="border font-medium">
                    {company.sector}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {canEdit && onEdit && (
            <Button onClick={onEdit} variant="outline" className="shadow-sm">
              Düzenle
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Contact Information */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">İletişim Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {company.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <a
                  href={`mailto:${company.email}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary hover:underline"
                >
                  {company.email}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <a
                  href={`tel:${company.phone}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary hover:underline"
                >
                  {company.phone}
                </a>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        {(company.address || company.city) && (
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Adres</h3>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
              <div className="text-gray-700 dark:text-gray-300">
                {company.address && <p>{company.address}</p>}
                <p>
                  {company.district && `${company.district}, `}
                  {company.city} {company.postalCode && `- ${company.postalCode}`}
                </p>
                <p>{company.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Company Details */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Firma Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {company.taxNumber && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Vergi No: {company.taxNumber}</span>
              </div>
            )}
            {company.tradeRegistryNumber && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Ticaret Sicil: {company.tradeRegistryNumber}</span>
              </div>
            )}
            {company.foundationYear && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Kuruluş: {company.foundationYear}</span>
              </div>
            )}
            {company.employeeCount !== undefined && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Briefcase className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Çalışan: {company.employeeCount}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Users className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span>
                Kullanıcı: {company.currentUsers} / {company.maxUsers}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
          <p>Oluşturulma: {new Date(company.createdAt).toLocaleString('tr-TR')}</p>
          <p>Son Güncelleme: {new Date(company.updatedAt).toLocaleString('tr-TR')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
