'use client';

/**
 * Company Dashboard - Settings Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Switch } from '@/presentation/components/ui/atoms/switch';
import { Label } from '@/presentation/components/ui/atoms/label';
import type { Company } from '@/domain/entities/Company';

export default function CompanySettingsPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success && data.user.companyId) {
        fetchCompany(data.user.companyId);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
        // Load settings from company.settings if available
        if (data.data.settings) {
          setEmailNotifications(data.data.settings.emailNotifications ?? true);
          setPushNotifications(data.data.settings.pushNotifications ?? false);
          setDarkMode(data.data.settings.darkMode ?? false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!company) return;

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            emailNotifications,
            pushNotifications,
            darkMode,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Ayarlar başarıyla kaydedildi');
      } else {
        alert(data.error || 'Ayarlar kaydedilemedi');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Ayarlar kaydedilemedi');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Firma bilgisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">{company.name}</p>
        </div>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Bildirimler</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Önemli güncellemeler için e-posta alın
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">Tarayıcı bildirimleri alın</p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <CardTitle>Görünüm</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Karanlık Mod</Label>
              <p className="text-sm text-muted-foreground">Karanlık tema kullan</p>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Gizlilik & Güvenlik</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gizlilik ve güvenlik ayarları için yöneticinizle iletişime geçin.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Ayarları Kaydet</Button>
      </div>
    </div>
  );
}
