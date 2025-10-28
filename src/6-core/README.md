# Core Layer

Bu katman framework-level kodları içerir.

## İçerik
- `errors/`: Custom error sınıfları
- `result/`: Result pattern implementasyonu
- `events/`: Event system

## Kurallar
- Framework-level kod içerir
- Tüm katmanlar tarafından kullanılabilir
- Business logic içermez
- Pure TypeScript/JavaScript

## Kullanım

```typescript
import { Result } from '@/core/result/Result';
import { AppError, ValidationError } from '@/core/errors';
```

