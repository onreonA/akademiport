'use client';
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  title: string;
  message: string;
  itemName: string;
  loading?: boolean;
}
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading = false,
}: DeleteConfirmModalProps) => {
  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      onClose();
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full mx-4'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
              <i className='ri-error-warning-line text-red-600 text-xl'></i>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
              <p className='text-sm text-gray-600'>Bu işlem geri alınamaz</p>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className='p-6'>
          <p className='text-gray-700 mb-4'>{message}</p>
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <i className='ri-information-line text-red-600 mt-0.5'></i>
              <div>
                <p className='text-sm font-medium text-red-800 mb-1'>
                  Silinecek öğe:{' '}
                  <span className='font-semibold'>{itemName}</span>
                </p>
                <p className='text-sm text-red-700'>
                  Bu işlem kalıcıdır ve geri alınamaz. Devam etmek
                  istediğinizden emin misiniz?
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200'>
          <button
            onClick={onClose}
            disabled={loading}
            className='px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50'
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className='bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
          >
            {loading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Siliniyor...
              </>
            ) : (
              <>
                <i className='ri-delete-bin-line'></i>
                Sil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default DeleteConfirmModal;
