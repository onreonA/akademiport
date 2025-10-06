'use client';
import { CheckCircle, FileText, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onTaskCompleted: () => void;
}
export default function TaskCompletionModal({
  isOpen,
  onClose,
  task,
  onTaskCompleted,
}: TaskCompletionModalProps) {
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when modal opens or task changes
  useEffect(() => {
    if (isOpen && task) {
      setCompletionNotes('');
      setFiles([]);
      setError('');
      setLoading(false);
    }
  }, [isOpen, task?.id]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionNotes.trim()) {
      setError('Lütfen tamamlama notları ekleyin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Upload files if any
      const uploadedFiles = [];
      for (const file of files) {
        // In a real implementation, you would upload files to a storage service
        // For now, we'll just create a mock file object
        uploadedFiles.push({
          name: file.name,
          url: `/uploads/${file.name}`, // Mock URL
          size: file.size,
          type: file.type,
          description: `Uploaded file: ${file.name}`,
        });
      }
      const response = await fetch(`/api/firma/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completionNote: completionNotes, // Fix: completionNotes -> completionNote
          completionFiles: uploadedFiles, // Fix: files -> completionFiles
        }),
      });
      if (response.ok) {
        // Reset form
        setCompletionNotes('');
        setFiles([]);
        // Modal'ı kapat ve sayfa yenile
        onTaskCompleted();
        onClose();
        // Force page refresh to show updated status
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Görev tamamlama başarısız');
      }
    } catch (error) {
      setError('Görev tamamlama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-bold text-gray-800'>Görevi Tamamla</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Task Info */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <h3 className='font-semibold text-gray-800 mb-2'>
              Görev Bilgileri
            </h3>
            <p className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Başlık:</span> {task.title}
            </p>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Açıklama:</span> {task.description}
            </p>
          </div>
          {/* Completion Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <FileText className='w-4 h-4 inline mr-2' />
              Tamamlama Notları *
            </label>
            <textarea
              value={completionNotes}
              onChange={e => setCompletionNotes(e.target.value)}
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Görevi nasıl tamamladığınızı açıklayın...'
              required
            />
          </div>
          {/* File Upload */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Upload className='w-4 h-4 inline mr-2' />
              Dosya Ekle (Opsiyonel)
            </label>
            <input
              type='file'
              multiple
              onChange={handleFileChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            {/* File List */}
            {files.length > 0 && (
              <div className='mt-3 space-y-2'>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between bg-gray-50 rounded-lg p-2'
                  >
                    <span className='text-sm text-gray-600 truncate'>
                      {file.name}
                    </span>
                    <button
                      type='button'
                      onClick={() => removeFile(index)}
                      className='text-red-500 hover:text-red-700'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}
          {/* Actions */}
          <div className='flex space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center'
            >
              {loading ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <>
                  <CheckCircle className='w-4 h-4 mr-2' />
                  Görevi Tamamla
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
