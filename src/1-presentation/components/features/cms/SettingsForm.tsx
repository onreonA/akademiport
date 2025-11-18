/**
 * CMS Settings Form Component
 * Sprint 23: CMS
 */

'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/components/ui/atoms/form';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { CMSSettings, CMSSettingsCategory } from '@/3-domain/entities/CMSSettings';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const settingsFormSchema = z.object({
  // General
  site_name: z.string().min(1, 'Site adı gereklidir'),
  site_description: z.string().optional(),
  site_logo_url: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),

  // Contact
  contact_email: z
    .string()
    .email('Geçerli bir e-posta adresi giriniz')
    .optional()
    .or(z.literal('')),
  contact_phone: z.string().optional(),
  contact_address: z.string().optional(),

  // Social
  social_facebook: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  social_twitter: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  social_linkedin: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  social_instagram: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  social_youtube: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),

  // Analytics
  google_analytics_id: z.string().optional(),
  google_tag_manager_id: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  settings: CMSSettings[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
}

export function SettingsForm({ settings, onSubmit, isSubmitting = false }: SettingsFormProps) {
  // Convert settings array to object
  const settingsObject = settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, any>
  );

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema) as any,
    defaultValues: {
      site_name: settingsObject.site_name || '',
      site_description: settingsObject.site_description || '',
      site_logo_url: settingsObject.site_logo_url || '',
      contact_email: settingsObject.contact_email || '',
      contact_phone: settingsObject.contact_phone || '',
      contact_address: settingsObject.contact_address || '',
      social_facebook: settingsObject.social_facebook || '',
      social_twitter: settingsObject.social_twitter || '',
      social_linkedin: settingsObject.social_linkedin || '',
      social_instagram: settingsObject.social_instagram || '',
      social_youtube: settingsObject.social_youtube || '',
      google_analytics_id: settingsObject.google_analytics_id || '',
      google_tag_manager_id: settingsObject.google_tag_manager_id || '',
    },
  });

  const handleSubmit = async (values: SettingsFormValues) => {
    // Convert form values to settings object
    const settingsData: Record<string, any> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        settingsData[key] = value;
      }
    });

    await onSubmit(settingsData);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="contact">İletişim</TabsTrigger>
            <TabsTrigger value="social">Sosyal Medya</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Site Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Akademi Port" {...field} />
                  </FormControl>
                  <FormDescription>Site başlığı</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="site_description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Site Açıklaması</FormLabel>
                  <FormControl>
                    <Textarea placeholder="E-İhracat Dönüşüm Platformu" rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Site kısa açıklaması</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="site_logo_url"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>Site logo görsel URL'i</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="info@example.com" {...field} />
                  </FormControl>
                  <FormDescription>İletişim e-posta adresi</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="+90 555 123 45 67" {...field} />
                  </FormControl>
                  <FormDescription>İletişim telefonu</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_address"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adres bilgisi..." rows={3} {...field} />
                  </FormControl>
                  <FormDescription>İletişim adresi</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <FormField
              control={form.control}
              name="social_facebook"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Facebook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://facebook.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_twitter"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Twitter URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_linkedin"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/company/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_instagram"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Instagram URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://instagram.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_youtube"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <FormField
              control={form.control}
              name="google_analytics_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Google Analytics ID</FormLabel>
                  <FormControl>
                    <Input placeholder="G-XXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormDescription>Google Analytics 4 Measurement ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="google_tag_manager_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Google Tag Manager ID</FormLabel>
                  <FormControl>
                    <Input placeholder="GTM-XXXXXXX" {...field} />
                  </FormControl>
                  <FormDescription>Google Tag Manager Container ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
