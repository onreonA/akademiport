# 🚀 Development Setup Guide

## Prerequisites

1. **Docker Desktop** - Supabase local development için gerekli
2. **Node.js 18+** - Next.js uygulaması için
3. **Supabase CLI** - Database management için

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

### 3. Start Docker Desktop

- Docker Desktop'u başlatın
- Docker daemon'ın çalıştığından emin olun

## Development Commands

### Quick Start (Recommended)

```bash
npm run setup
```

Bu komut:

- Supabase local instance'ı başlatır
- Tüm migration'ları çalıştırır
- TypeScript types'ları generate eder

### Individual Commands

#### Supabase Management

```bash
# Supabase local instance başlat
npm run supabase:start

# Supabase durumunu kontrol et
npm run supabase:status

# Supabase'i durdur
npm run supabase:stop

# Database'i sıfırla (tüm migration'ları yeniden çalıştır)
npm run supabase:reset
```

#### Migration Management

```bash
# Migration'ları çalıştır
npm run supabase:migrate

# TypeScript types'ları generate et
npm run supabase:generate-types
```

#### Development

```bash
# Sadece Next.js dev server
npm run dev

# Supabase + Next.js birlikte (recommended)
npm run dev:full
```

## Environment Variables

`.env.local` dosyası oluşturun:

```env
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Troubleshooting

### Docker Issues

```bash
# Docker daemon durumunu kontrol et
docker ps

# Docker'ı yeniden başlat
sudo systemctl restart docker  # Linux
# veya Docker Desktop'u yeniden başlat  # macOS/Windows
```

### Supabase Issues

```bash
# Supabase log'larını kontrol et
supabase logs

# Supabase'i tamamen sıfırla
supabase stop
supabase start
```

### Migration Issues

```bash
# Migration durumunu kontrol et
supabase migration list

# Belirli bir migration'ı çalıştır
supabase db push --include-all
```

## Production Deployment

Production'da Supabase Cloud kullanın:

1. Supabase Dashboard'da proje oluşturun
2. Environment variables'ları production değerleriyle güncelleyin
3. Migration'ları production'a push edin:

```bash
supabase db push --linked
```

## Best Practices

1. **Her development session'da** `npm run setup` çalıştırın
2. **Migration'ları** sadece Supabase CLI ile yönetin
3. **Type generation'ı** migration'lardan sonra çalıştırın
4. **Docker'ı** development sırasında açık tutun
