/**
 * User Profile Card Component
 *
 * Displays detailed user profile information
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { User } from '@/domain/entities/User';
import { UserRoleLabels } from '@/domain/enums/UserRole';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Edit,
  Globe,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react';

export interface UserProfileCardProps {
  user: User;
  onEdit?: () => void;
  canEdit?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onEdit,
  canEdit = false,
}) => {
  // Get initials for avatar fallback
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Social media icons
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'github':
        return <Github className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">{initials}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="flex-1">
            <CardTitle className="text-2xl">{user.fullName}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{UserRoleLabels[user.role]}</Badge>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
          </div>
        </div>

        {canEdit && onEdit && (
          <Button onClick={onEdit} size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-1" />
            Düzenle
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">İletişim</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.companyId && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Firmaya Bağlı</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Hakkında</h3>
            <p className="text-sm">{user.bio}</p>
          </div>
        )}

        {/* Expertise Areas */}
        {user.expertiseAreas && user.expertiseAreas.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              Uzmanlık Alanları
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.expertiseAreas.map((area, index) => (
                <Badge key={index} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Sosyal Medya</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(user.socialLinks).map(([platform, url]) => (
                <Button key={platform} variant="outline" size="sm" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {getSocialIcon(platform)}
                    <span className="ml-2 capitalize">{platform}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          {user.lastLoginAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Son Giriş: {new Date(user.lastLoginAt).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
