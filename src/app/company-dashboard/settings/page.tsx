'use client';

/**
 * Company Dashboard - Settings Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Shield, Palette, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Switch } from '@/presentation/components/ui/atoms/switch';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import type { Company } from '@/domain/entities/Company';

export default function CompanySettingsPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <div className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Firma Bilgisi Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Firma bilgisi bulunamadı</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Ayarlar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              {company.name}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-900 dark:text-white" />
              <CardTitle className="text-gray-900 dark:text-white">Bildirimler</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-gray-900 dark:text-white">
                  E-posta Bildirimleri
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <Label htmlFor="push-notifications" className="text-gray-900 dark:text-white">
                  Push Bildirimleri
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tarayıcı bildirimleri alın
                </p>
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
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gray-900 dark:text-white" />
              <CardTitle className="text-gray-900 dark:text-white">Görünüm</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-gray-900 dark:text-white">
                  Karanlık Mod
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Karanlık tema kullan</p>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-900 dark:text-white" />
              <CardTitle className="text-gray-900 dark:text-white">Gizlilik & Güvenlik</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gizlilik ve güvenlik ayarları için yöneticinizle iletişime geçin.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="shadow-sm">
            Ayarları Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
