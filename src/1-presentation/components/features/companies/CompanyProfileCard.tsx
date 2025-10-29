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
    <Card>
      <CardHeader>
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
              <h2 className="text-2xl font-bold">{company.name}</h2>
              {company.legalName && (
                <p className="text-sm text-muted-foreground">{company.legalName}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={company.isActive ? 'default' : 'secondary'}>
                  {company.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
                {company.sector && <Badge variant="outline">{company.sector}</Badge>}
              </div>
            </div>
          </div>
          {canEdit && onEdit && (
            <Button onClick={onEdit} variant="outline">
              Düzenle
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="font-semibold mb-3">İletişim Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {company.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${company.email}`} className="hover:underline">
                  {company.email}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${company.phone}`} className="hover:underline">
                  {company.phone}
                </a>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
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
            <h3 className="font-semibold mb-3">Adres</h3>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
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
          <h3 className="font-semibold mb-3">Firma Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {company.taxNumber && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Vergi No: {company.taxNumber}</span>
              </div>
            )}
            {company.tradeRegistryNumber && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Ticaret Sicil: {company.tradeRegistryNumber}</span>
              </div>
            )}
            {company.foundationYear && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Kuruluş: {company.foundationYear}</span>
              </div>
            )}
            {company.employeeCount !== undefined && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>Çalışan: {company.employeeCount}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                Kullanıcı: {company.currentUsers} / {company.maxUsers}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p>Oluşturulma: {new Date(company.createdAt).toLocaleString('tr-TR')}</p>
          <p>Son Güncelleme: {new Date(company.updatedAt).toLocaleString('tr-TR')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
