/**
 * Upload CMS Media Use Case
 * Sprint 23: CMS
 */

import { Result } from '@/6-core/result/Result';
import { ICMSMediaRepository } from '@/3-domain/interfaces/repositories/ICMSMediaRepository';
import { CMSMedia, CreateCMSMediaDto, CMSMediaEntity } from '@/3-domain/entities/CMSMedia';

export interface UploadMediaRequest {
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  storagePath: string;
  altText?: string;
  caption?: string;
}

export class UploadMediaUseCase {
  constructor(private cmsMediaRepository: ICMSMediaRepository) {}

  async execute(request: UploadMediaRequest, uploadedBy: string): Promise<Result<CMSMedia>> {
    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (request.fileSize > maxFileSize) {
      return Result.fail('Dosya boyutu maksimum 10MB olabilir');
    }

    // Validate MIME type (only images and videos allowed)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];
    if (!allowedMimeTypes.includes(request.mimeType)) {
      return Result.fail('Sadece görsel ve video dosyaları yüklenebilir');
    }

    // Create media DTO
    const dto: CreateCMSMediaDto = {
      filename: request.filename,
      originalFilename: request.originalFilename,
      mimeType: request.mimeType,
      fileSize: request.fileSize,
      fileUrl: request.fileUrl,
      storagePath: request.storagePath,
      altText: request.altText,
      caption: request.caption,
    };

    // Create media
    const result = await this.cmsMediaRepository.create(dto, uploadedBy);

    if (result.isFailure) {
      return Result.fail(result.error?.message || result.error || 'Medya yüklenemedi');
    }

    return Result.ok(result.value);
  }
}
