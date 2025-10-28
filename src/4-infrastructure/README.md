# Infrastructure Layer

Bu katman dış dünya ile iletişimden sorumludur.

## İçerik

- `database`: Database işlemleri
  - `repositories`: Repository implementasyonları
  - `migrations`: Database migration dosyaları
  - `seeds`: Seed data
- `api`: API routes
  - `routes`: API route handlers
  - `middleware`: Middleware fonksiyonları
  - `validators`: Request validators
- `external`: Dış servisler (AI, Email, Zoom, etc.)
- `config`: Konfigürasyon dosyaları

## Kurallar

- Bu katman Domain interface'lerini implement eder
- Dış servislere bağlanır
- Database işlemlerini yönetir
- Framework-specific kod içerebilir

## Repository Pattern

\`\`\`typescript
export class ProgramRepository implements IProgramRepository {
async create(program: Program): Promise<Program> {
const { data, error } = await supabase
.from('programs')
.insert(this.mapToDatabase(program))
.select()
.single();

    if (error) throw error;
    return this.mapToDomain(data);

}
}
\`\`\`

## Kullanım

\`\`\`typescript
import { ProgramRepository } from '@/infrastructure/database/repositories';
import { OpenAIService } from '@/infrastructure/external/ai/openai.service';
\`\`\`
