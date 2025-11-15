export interface RecordReadDto {
  newsId: string;
  userId: string;
  companyId: string;
  readDuration?: number;
  scrollPercentage?: number;
  completed?: boolean;
}
