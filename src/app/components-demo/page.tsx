'use client';

import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Input } from '@/presentation/components/ui/atoms/input';
import { FormField } from '@/presentation/components/ui/molecules/form-field';
import { SearchInput } from '@/presentation/components/ui/molecules/search-input';
import { ThemeToggle } from '@/presentation/components/ui/molecules/theme-toggle';
import { Separator } from '@/presentation/components/ui/atoms/separator';
import { useState } from 'react';

export default function ComponentsDemo() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">UI Components Demo</h1>
            <p className="text-muted-foreground mt-2">Sprint 3 - Tüm componentlerin çalışır hali</p>
          </div>
          <ThemeToggle />
        </div>

        <Separator />

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Farklı button varyantları</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Farklı badge tipleri</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
            <CardDescription>Form input componentleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <FormField label="Email" type="email" placeholder="email@example.com" required />
            <FormField
              label="Password"
              type="password"
              placeholder="••••••••"
              helperText="En az 8 karakter olmalı"
            />
            <FormField label="Description" placeholder="Açıklama yazın..." multiline rows={4} />
          </CardContent>
        </Card>

        {/* Search Input */}
        <Card>
          <CardHeader>
            <CardTitle>Search Input</CardTitle>
            <CardDescription>Arama input componenti</CardDescription>
          </CardHeader>
          <CardContent className="max-w-md">
            <SearchInput
              placeholder="Ara..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
            />
          </CardContent>
        </Card>

        {/* Grid of Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Card Grid</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card 1</CardTitle>
                <CardDescription>İlk kart örneği</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Bu bir kart içeriğidir.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Card 2</CardTitle>
                <CardDescription>İkinci kart örneği</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Dark mode&apos;da da çalışır.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Card 3</CardTitle>
                <CardDescription>Üçüncü kart örneği</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Responsive tasarım.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Separator />
        <div className="text-center text-sm text-muted-foreground">
          <p>Sprint 3 - UI Foundation ✅ Tamamlandı</p>
          <p className="mt-2">34 Component • 3 Layout Template • Dark Mode Support</p>
        </div>
      </div>
    </div>
  );
}
