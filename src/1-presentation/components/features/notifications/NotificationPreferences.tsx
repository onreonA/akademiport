/**
 * Notification Preferences Component
 *
 * Component for managing notification preferences
 */

'use client';

import { useState, useEffect } from 'react';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/1-presentation/hooks/useNotifications';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/1-presentation/components/ui/atoms/card';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import { Switch } from '@/1-presentation/components/ui/atoms/switch';
import { Input } from '@/1-presentation/components/ui/atoms/input';
import { Separator } from '@/1-presentation/components/ui/atoms/separator';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/1-presentation/hooks/usePushNotifications';

export function NotificationPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  const { subscribe: subscribePush, isLoading: isSubscribing } = usePushNotifications();

  const [emailEnabled, setEmailEnabled] = useState(preferences?.emailEnabled ?? true);
  const [pushEnabled, setPushEnabled] = useState(preferences?.pushEnabled ?? true);
  const [inAppEnabled, setInAppEnabled] = useState(preferences?.inAppEnabled ?? true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(
    preferences?.quietHoursEnabled ?? false
  );
  const [quietHoursStart, setQuietHoursStart] = useState(preferences?.quietHoursStart || '22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState(preferences?.quietHoursEnd || '08:00');

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.emailEnabled);
      setPushEnabled(preferences.pushEnabled);
      setInAppEnabled(preferences.inAppEnabled);
      setQuietHoursEnabled(preferences.quietHoursEnabled);
      setQuietHoursStart(preferences.quietHoursStart || '22:00');
      setQuietHoursEnd(preferences.quietHoursEnd || '08:00');
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        emailEnabled,
        pushEnabled,
        inAppEnabled,
        quietHoursEnabled,
        quietHoursStart: quietHoursEnabled ? quietHoursStart : undefined,
        quietHoursEnd: quietHoursEnabled ? quietHoursEnd : undefined,
      });
      toast.success('Bildirim tercihleri güncellendi');
    } catch (error) {
      toast.error('Tercihler güncellenemedi');
    }
  };

  const handleEnablePush = async () => {
    const success = await subscribePush();
    if (success) {
      setPushEnabled(true);
      toast.success('Push bildirimleri etkinleştirildi');
    } else {
      toast.error('Push bildirimleri etkinleştirilemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Tercihleri</CardTitle>
          <CardDescription>Bildirimlerin nasıl gönderileceğini yönetin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled">E-posta Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">Bildirimleri e-posta olarak al</p>
              </div>
              <Switch id="email-enabled" checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-enabled">Push Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">Tarayıcı push bildirimleri al</p>
              </div>
              <div className="flex items-center gap-2">
                {pushEnabled && 'serviceWorker' in navigator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnablePush}
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Yeniden Etkinleştir'
                    )}
                  </Button>
                )}
                <Switch
                  id="push-enabled"
                  checked={pushEnabled}
                  onCheckedChange={(checked) => {
                    setPushEnabled(checked);
                    if (checked) {
                      handleEnablePush();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-enabled">Uygulama İçi Bildirimler</Label>
                <p className="text-sm text-muted-foreground">Bildirimleri uygulama içinde göster</p>
              </div>
              <Switch
                id="in-app-enabled"
                checked={inAppEnabled}
                onCheckedChange={setInAppEnabled}
              />
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="quiet-hours-enabled">Sessiz Saatler</Label>
                <p className="text-sm text-muted-foreground">Belirli saatlerde bildirim gönderme</p>
              </div>
              <Switch
                id="quiet-hours-enabled"
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
              />
            </div>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours-start">Başlangıç</Label>
                  <Input
                    id="quiet-hours-start"
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours-end">Bitiş</Label>
                  <Input
                    id="quiet-hours-end"
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
