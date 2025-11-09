# Sentry Setup Guide

Sentry entegrasyonu için kurulum ve kullanım rehberi.

## Kurulum

Sentry paketi kuruldu ve yapılandırıldı. Şimdi environment variables eklemeniz gerekiyor.

## Environment Variables

`.env.local` dosyasına ekleyin:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Development'da Sentry'yi aktif etmek için (opsiyonel)
NEXT_PUBLIC_SENTRY_ENABLE_DEV=false
```

## Sentry Projesi Oluşturma

1. [Sentry.io](https://sentry.io) hesabı oluşturun
2. Yeni bir proje oluşturun (Next.js seçin)
3. DSN'i kopyalayıp `.env.local` dosyasına ekleyin

## Kullanım

### Error Boundary'de Otomatik Tracking

ErrorBoundary component'i otomatik olarak hataları Sentry'ye gönderir:

```tsx
import { ErrorBoundary } from '@/presentation/components/shared/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

### Manuel Error Tracking

```tsx
import { captureException, captureMessage } from '@/shared/utils/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, {
    tags: { component: 'UserProfile' },
    extra: { userId: user.id },
  });
}

// Message tracking
captureMessage('User action completed', 'info');
```

### User Context

```tsx
import { setSentryUser, clearSentryUser } from '@/shared/utils/sentry';

// Login sonrası
setSentryUser({
  id: user.id,
  email: user.email,
  role: user.role,
});

// Logout sonrası
clearSentryUser();
```

### Breadcrumbs

```tsx
import { addSentryBreadcrumb } from '@/shared/utils/sentry';

addSentryBreadcrumb('User clicked button', 'user-action', 'info');
```

## Configuration

Sentry config dosyaları:

- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration

## Production vs Development

- **Development**: Varsayılan olarak Sentry devre dışı (console'a loglanır)
- **Production**: Otomatik olarak aktif
- Development'da test etmek için: `NEXT_PUBLIC_SENTRY_ENABLE_DEV=true`

## Sample Rates

- **Traces**: Production'da %10, Development'da %100
- **Replay**: Production'da %10, Development'da %100
- **Profiles**: Production'da %10, Development'da %100

## Security

Sentry config'de otomatik olarak:

- Authorization headers filtrelenir
- Cookie'ler filtrelenir
- Sensitive data korunur

## Next Steps

1. Sentry projesi oluşturun
2. DSN'i `.env.local`'e ekleyin
3. Production'da test edin
4. Alert kuralları oluşturun
