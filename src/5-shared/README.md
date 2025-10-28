# Shared Layer

Bu katman tüm katmanlar tarafından kullanılan ortak kodları içerir.

## İçerik
- `utils`: Utility fonksiyonları
- `constants`: Sabitler
- `hooks`: Custom React hooks
- `types`: Paylaşılan TypeScript tipleri

## Kurallar
- Tüm katmanlar tarafından kullanılabilir
- Business logic içermez
- Pure fonksiyonlar içerir
- Framework-agnostic (mümkün olduğunca)

## Utilities

\`\`\`typescript
// Date utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR').format(date);
}

// String utilities
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}
\`\`\`

## Kullanım

\`\`\`typescript
import { formatDate } from '@/shared/utils/date.utils';
import { API_ROUTES } from '@/shared/constants/routes.constants';
import { useDebounce } from '@/shared/hooks/useDebounce';
\`\`\`
