import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class UnlockTopicUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(topicId: string): Promise<Result<void>> {
    try {
      const result = await this.forumRepository.unlockTopic(topicId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Kilit açılamadı');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kilit açılamadı');
    }
  }
}
