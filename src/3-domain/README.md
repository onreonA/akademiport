# Domain Layer

Bu katman core business domain'inden sorumludur.

## İçerik

- `entities`: Domain entities
- `interfaces`: Contracts ve interfaces
- `value-objects`: Value objects
- `enums`: Domain enums

## Kurallar

- Bu katman HİÇBİR ŞEYE bağımlı değildir
- Pure business logic içerir
- Framework'lerden bağımsızdır
- Database'den bağımsızdır
- UI'dan bağımsızdır

## Domain Entities

Domain entities business kurallarını içerir:

\`\`\`typescript
export class Program {
constructor(
public id: string,
public name: string,
public status: ProgramStatus
) {}

activate(): void {
if (this.status !== ProgramStatus.PLANNED) {
throw new Error('Only planned programs can be activated');
}
this.status = ProgramStatus.ACTIVE;
}
}
\`\`\`

## Kullanım

\`\`\`typescript
import { Program } from '@/domain/entities/program.entity';
import { IProgramRepository } from '@/domain/interfaces/repositories';
\`\`\`
