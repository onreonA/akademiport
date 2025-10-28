# Application Layer

Bu katman iş mantığından sorumludur.

## İçerik
- `use-cases`: Use case pattern implementasyonları
- `services`: Business servisler
- `dto`: Data Transfer Objects

## Kurallar
- Bu katman Domain ve Infrastructure katmanlarına bağımlıdır
- Business logic burada yer alır
- Use case'ler tek sorumluluk prensibine uyar
- Her use case bir iş akışını temsil eder

## Use Case Pattern

Her use case:
- Tek bir iş akışını gerçekleştirir
- Input olarak DTO alır
- Output olarak Result<T> döndürür
- Domain entities ile çalışır
- Repository interface'lerini kullanır

## Kullanım

\`\`\`typescript
import { CreateProgramUseCase } from '@/application/use-cases/programs';
import { ProgramDto } from '@/application/dto';

const useCase = new CreateProgramUseCase(programRepository);
const result = await useCase.execute(programDto);
\`\`\`
