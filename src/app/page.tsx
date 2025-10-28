import Link from 'next/link';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            Sprint 2 - Authentication ✅
          </Badge>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Akademi Port
          </h1>
          <p className="text-xl text-muted-foreground">Multi-Program E-İhracat Dönüşüm Platformu</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Giriş Yap</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Multi-Program</CardTitle>
              <CardDescription>Birden fazla program ve grup yönetimi</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">Yeni</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-secondary">Güvenli Auth</CardTitle>
              <CardDescription>Supabase + RLS ile güvenli authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">Aktif</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-accent">Clean Architecture</CardTitle>
              <CardDescription>6 katmanlı modüler mimari</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">Hazır</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <CardHeader>
            <CardTitle>🎉 Sprint 2 İlerleme</CardTitle>
            <CardDescription>Tamamlanan görevler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Supabase Client kurulumu</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Database Schema (Programs, Users, Companies)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Migration dosyaları</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Authentication sistemi</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Middleware ve route protection</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
