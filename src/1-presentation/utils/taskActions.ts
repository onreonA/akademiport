import { toast } from 'sonner';

interface PostTaskCommentOptions {
  isQuestion?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Göreve yorum ekler. Boş yorumları sessizce yoksayar.
 * Başarı/ hata durumlarında tutarlı toast mesajları üretir.
 */
export async function postTaskComment(
  taskId: string,
  comment: string,
  options: PostTaskCommentOptions = {}
): Promise<boolean> {
  const trimmed = comment.trim();
  if (!trimmed) {
    return true;
  }

  const { isQuestion = false, successMessage, errorMessage } = options;

  try {
    const response = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: trimmed, isQuestion }),
    });

    if (!response.ok) {
      const fallbackError = errorMessage || 'Yorum kaydedilemedi, lütfen tekrar deneyin.';
      console.error('Failed to post task comment:', await response.text());
      toast.error(fallbackError);
      return false;
    }

    if (successMessage) {
      toast.success(successMessage);
    }

    return true;
  } catch (error) {
    console.error('Error posting task comment:', error);
    toast.error(errorMessage || 'Yorum kaydedilemedi, lütfen tekrar deneyin.');
    return false;
  }
}
