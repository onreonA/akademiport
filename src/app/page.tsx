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
            Sprint 1 - Gün 2 ✅
          </Badge>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Akademi Port
          </h1>
          <p className="text-xl text-muted-foreground">Multi-Program E-İhracat Dönüşüm Platformu</p>
        </div>

        {/* Button Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Canlı ve renkli button örnekleri</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
          </CardContent>
        </Card>

        {/* Color Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Canlı ve enerji dolu renkler</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold">
                Primary
              </div>
              <p className="text-sm text-center text-muted-foreground">Canlı Mavi</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-semibold">
                Secondary
              </div>
              <p className="text-sm text-center text-muted-foreground">Canlı Mor</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-semibold">
                Accent
              </div>
              <p className="text-sm text-center text-muted-foreground">Canlı Turuncu</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-destructive rounded-lg flex items-center justify-center text-destructive-foreground font-semibold">
                Destructive
              </div>
              <p className="text-sm text-center text-muted-foreground">Canlı Kırmızı</p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <CardHeader>
            <CardTitle>🎉 Sprint 1 İlerleme</CardTitle>
            <CardDescription>Tamamlanan görevler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Next.js 16 + TypeScript kurulumu</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Tailwind CSS 4 + Shadcn/ui entegrasyonu</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Canlı renk paleti tanımlandı</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>Inter font yüklendi</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✅</Badge>
              <span>İlk componentler eklendi</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Sonraki Adım: 6 Katmanlı Klasör Yapısı Oluşturma
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Devam Et</Button>
            <Button size="lg" variant="outline">
              Dokümantasyon
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
