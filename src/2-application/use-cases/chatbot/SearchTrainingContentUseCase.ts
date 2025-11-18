/**
 * Search Training Content Use Case
 *
 * Eğitim içeriğinde arama yapar ve ilgili eğitimleri bulur
 */

import { Result } from '@/6-core/result/Result';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { ITrainingDocumentRepository } from '@/3-domain/interfaces/repositories/ITrainingDocumentRepository';
import { ITrainingVideoRepository } from '@/3-domain/interfaces/repositories/ITrainingVideoRepository';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';
import { Training } from '@/3-domain/entities/Training';

export interface SearchTrainingContentDto {
  query: string;
  programId?: string | null;
  limit?: number;
}

export interface TrainingSearchResult {
  training: Training;
  relevanceScore: number;
  matchedFields: string[]; // 'name', 'description', etc.
  snippet?: string; // İlgili snippet
}

export class SearchTrainingContentUseCase {
  constructor(
    private trainingRepository: ITrainingRepository,
    private trainingDocumentRepository: ITrainingDocumentRepository,
    private trainingVideoRepository: ITrainingVideoRepository
  ) {}

  /**
   * Eğitim içeriğinde arama yap
   */
  async execute(dto: SearchTrainingContentDto): Promise<Result<TrainingSearchResult[]>> {
    try {
      if (!dto.query || dto.query.trim().length === 0) {
        return Result.ok([]);
      }

      const query = dto.query.toLowerCase().trim();
      const limit = dto.limit || 10;

      // Tüm eğitimleri al
      const trainingsResult = await this.trainingRepository.findAll({
        programId: dto.programId,
        status: 'active',
        limit: 1000, // Tüm aktif eğitimleri al
      });

      if (!trainingsResult || trainingsResult.data.length === 0) {
        return Result.ok([]);
      }

      const trainings = trainingsResult.data;
      const results: TrainingSearchResult[] = [];

      // Her eğitim için relevance score hesapla
      for (const training of trainings) {
        const score = this.calculateRelevanceScore(training, query);
        if (score > 0) {
          const matchedFields = this.getMatchedFields(training, query);
          const snippet = this.generateSnippet(training, query);

          results.push({
            training,
            relevanceScore: score,
            matchedFields,
            snippet,
          });
        }
      }

      // Relevance score'a göre sırala ve limit uygula
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const limitedResults = results.slice(0, limit);

      logger.info('Training content search completed', {
        query,
        programId: dto.programId,
        resultsCount: limitedResults.length,
      });

      return Result.ok(limitedResults);
    } catch (error) {
      logger.error('Error in SearchTrainingContentUseCase:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Eğitim içeriği aranamadı', 500)
      );
    }
  }

  /**
   * Relevance score hesapla (basit keyword matching)
   */
  private calculateRelevanceScore(training: Training, query: string): number {
    let score = 0;
    const queryWords = query.split(/\s+/).filter((w) => w.length > 2);

    // Name matching (yüksek ağırlık)
    const nameLower = training.name.toLowerCase();
    for (const word of queryWords) {
      if (nameLower.includes(word)) {
        score += 10;
      }
      if (nameLower.startsWith(word)) {
        score += 5; // Başlangıçta geçiyorsa ekstra puan
      }
    }

    // Description matching (orta ağırlık)
    if (training.description) {
      const descLower = training.description.toLowerCase();
      for (const word of queryWords) {
        if (descLower.includes(word)) {
          score += 5;
        }
      }
    }

    // Exact match bonus
    if (
      nameLower === query ||
      (training.description && training.description.toLowerCase().includes(query))
    ) {
      score += 20;
    }

    return score;
  }

  /**
   * Eşleşen alanları bul
   */
  private getMatchedFields(training: Training, query: string): string[] {
    const matchedFields: string[] = [];
    const queryLower = query.toLowerCase();

    if (training.name.toLowerCase().includes(queryLower)) {
      matchedFields.push('name');
    }

    if (training.description && training.description.toLowerCase().includes(queryLower)) {
      matchedFields.push('description');
    }

    return matchedFields;
  }

  /**
   * İlgili snippet oluştur
   */
  private generateSnippet(training: Training, query: string): string {
    const queryLower = query.toLowerCase();
    const nameLower = training.name.toLowerCase();

    // Name'de query varsa name'i döndür
    if (nameLower.includes(queryLower)) {
      return training.name;
    }

    // Description'da query varsa ilgili kısmı döndür
    if (training.description) {
      const descLower = training.description.toLowerCase();
      const index = descLower.indexOf(queryLower);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(training.description.length, index + query.length + 50);
        let snippet = training.description.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < training.description.length) snippet = snippet + '...';
        return snippet;
      }
    }

    // Fallback: description'un ilk 100 karakteri
    return training.description
      ? training.description.substring(0, 100) + (training.description.length > 100 ? '...' : '')
      : training.name;
  }
}
