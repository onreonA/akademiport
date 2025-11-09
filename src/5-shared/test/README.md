# Test Utilities and Setup

Bu klasör test utilities ve setup dosyalarını içerir.

## Dosyalar

- `setup.ts` - Vitest test setup dosyası (mocks, global configs)
- `utils.tsx` - Test helper fonksiyonları (custom render, providers)

## Kullanım

### Component Testleri

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { Button } from '@/presentation/components/ui/atoms/button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
```

### Test Utilities

`@/shared/test/utils` import edildiğinde şunları sağlar:

- `render` - Custom render fonksiyonu (QueryClient ve ThemeProvider ile)
- `screen` - Testing Library screen utilities
- Diğer Testing Library exports

## Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm run test

# Testleri watch mode'da çalıştır
npm run test:ui

# Coverage ile çalıştır
npm run test:coverage
```

## Mock'lar

Setup dosyasında şu mock'lar tanımlı:

- Next.js router (`useRouter`, `usePathname`, `useSearchParams`)
- Next.js Image component
- `window.matchMedia` (theme provider için)
- Environment variables
