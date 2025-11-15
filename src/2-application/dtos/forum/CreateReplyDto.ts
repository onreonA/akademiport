export interface CreateReplyDto {
  topicId: string;
  content: string;
  parentId?: string | null; // For nested replies
}

