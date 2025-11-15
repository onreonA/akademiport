import { NewsCategory } from '@/3-domain/enums/NewsEnums';

export interface CreateNewsDto {
  programId: string;
  authorId: string;
  title: string;
  summary?: string;
  content: string;
  category: NewsCategory;
  imageUrl?: string;
  imageAlt?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isFeatured?: boolean;
  isPinned?: boolean;
  tags?: string[]; // Tag IDs
}


