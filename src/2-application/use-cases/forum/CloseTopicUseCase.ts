import { Result } from '@/6-core/result/Result';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';

export class CloseTopicUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(topicId: string): Promise<Result<void>> {
    try {
      const result = await this.forumRepository.closeTopic(topicId);

      if (result.isFailure) {
        return Result.fail(result.error || 'Konu kapatılamadı');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Konu kapatılamadı');
    }
  }
}
