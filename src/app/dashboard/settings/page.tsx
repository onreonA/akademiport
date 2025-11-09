'use client';

/**
 * Admin Dashboard - Settings Page
 * System settings and preferences for Master Admin
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Globe,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/atoms/card';
import { Switch } from '@/presentation/components/ui/atoms/switch';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [systemMaintenance, setSystemMaintenance] = useState(false);
  const [emailServiceEnabled, setEmailServiceEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSettings();
    }
  }, [authLoading, user]);

  const fetchSettings = async () => {
    try {
      // TODO: Implement API endpoint for admin settings
      // For now, load from localStorage or use defaults
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setEmailNotifications(settings.emailNotifications ?? true);
        setPushNotifications(settings.pushNotifications ?? false);
        setDarkMode(settings.darkMode ?? false);
        setSystemMaintenance(settings.systemMaintenance ?? false);
        setEmailServiceEnabled(settings.emailServiceEnabled ?? true);
        setBackupEnabled(settings.backupEnabled ?? true);
        setAnalyticsEnabled(settings.analyticsEnabled ?? true);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settings = {
        emailNotifications,
        pushNotifications,
        darkMode,
        systemMaintenance,
        emailServiceEnabled,
        backupEnabled,
        analyticsEnabled,
      };

      // TODO: Implement API endpoint for admin settings
      // For now, save to localStorage
      localStorage.setItem('adminSettings', JSON.stringify(settings));

      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <div className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yetkisiz Erişim</h3>
            <p className="text-gray-600 dark:text-gray-400">Bu sayfaya erişim yetkiniz yok</p>
            <Button onClick={() => router.push('/dashboard')}>Dashboard'a Dön</Button>
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
              Sistem Ayarları
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              Platform ayarlarını yönetin
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
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sistem bildirimleri ve uyarılar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-gray-900 dark:text-white">
                  E-posta Bildirimleri
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Önemli sistem güncellemeleri için e-posta alın
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
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Arayüz görünüm ayarları
            </CardDescription>
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

        {/* System Settings */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-900 dark:text-white" />
              <CardTitle className="text-gray-900 dark:text-white">Sistem Ayarları</CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Platform sistem ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-maintenance" className="text-gray-900 dark:text-white">
                  Bakım Modu
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistem bakım moduna geçer (kullanıcılar erişemez)
                </p>
              </div>
              <Switch
                id="system-maintenance"
                checked={systemMaintenance}
                onCheckedChange={setSystemMaintenance}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="backup-enabled" className="text-gray-900 dark:text-white">
                  Otomatik Yedekleme
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Veritabanı otomatik yedekleme
                </p>
              </div>
              <Switch
                id="backup-enabled"
                checked={backupEnabled}
                onCheckedChange={setBackupEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics-enabled" className="text-gray-900 dark:text-white">
                  Analitik
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kullanım analitiklerini topla
                </p>
              </div>
              <Switch
                id="analytics-enabled"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Service */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-900 dark:text-white" />
              <CardTitle className="text-gray-900 dark:text-white">E-posta Servisi</CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              E-posta gönderim ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-service" className="text-gray-900 dark:text-white">
                  E-posta Servisi Aktif
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistem e-postaları göndersin
                </p>
              </div>
              <Switch
                id="email-service"
                checked={emailServiceEnabled}
                onCheckedChange={setEmailServiceEnabled}
              />
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
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Güvenlik ve gizlilik ayarları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Güvenlik ayarları sistem yöneticisi tarafından yönetilmektedir. Değişiklik için sistem
              yöneticisi ile iletişime geçin.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()} className="shadow-sm">
            İptal
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving} className="shadow-sm">
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Ayarları Kaydet
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
