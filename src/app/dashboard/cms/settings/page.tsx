/**
 * Admin CMS Settings Page
 * Sprint 23: CMS
 */

'use client';

import { useCMSSettings, useUpdateCMSSettings } from '@/1-presentation/hooks/useCMS';
import { SettingsForm } from '@/1-presentation/components/features/cms/SettingsForm';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCMSSettingsPage() {
  const { data: settings, isLoading } = useCMSSettings();
  const updateSettings = useUpdateCMSSettings();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await updateSettings.mutateAsync(data);
      toast.success('Ayarlar güncellendi');
    } catch (error: any) {
      toast.error(error.message || 'Ayarlar güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings || settings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ayarlar yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Site Ayarları</h1>
        <p className="text-sm text-muted-foreground">Site genel ayarlarını yönetin</p>
      </div>

      <SettingsForm
        settings={settings}
        onSubmit={handleSubmit}
        isSubmitting={updateSettings.isPending}
      />
    </div>
  );
}
