'use client';
import React, { useRef, useState } from 'react';
interface ExportImportProps {
  type: 'companies' | 'projects' | 'documents' | 'events' | 'notifications';
  className?: string;
  onExportComplete?: (result: any) => void;
  onImportComplete?: (result: any) => void;
}
interface ExportFilters {
  sector?: string;
  city?: string;
  status?: string;
  upload_type?: string;
  event_type?: string;
  category?: string;
  type?: string;
  read_status?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}
export default function ExportImport({
  type,
  className = '',
  onExportComplete,
  onImportComplete,
}: ExportImportProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [importMode, setImportMode] = useState<'create' | 'update' | 'upsert'>(
    'create'
  );
  const [exportFilters, setExportFilters] = useState<ExportFilters>({});
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Get type labels
  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      companies: 'Firmalar',
      projects: 'Projeler',
      documents: 'Belgeler',
      events: 'Etkinlikler',
      notifications: 'Bildirimler',
    };
    return labels[type] || type;
  };
  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          format: exportFormat,
          filters: exportFilters,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Download file
          const link = document.createElement('a');
          link.href = `data:${result.data.mimeType};base64,${result.data.data}`;
          link.download = result.data.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          onExportComplete?.(result.data);
          setShowExportModal(false);
        } else {
          setError(result.error || 'Export işlemi başarısız');
        }
      } else {
        setError('Export işlemi başarısız');
      }
    } catch (error: any) {
      setError('Export işlemi sırasında hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };
  // Handle import
  const handleImport = async (file: File) => {
    setIsImporting(true);
    setError(null);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('mode', importMode);
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setImportResult(result.data);
          onImportComplete?.(result.data);
        } else {
          setError(result.error || 'Import işlemi başarısız');
        }
      } else {
        setError('Import işlemi başarısız');
      }
    } catch (error: any) {
      setError('Import işlemi sırasında hata oluştu');
    } finally {
      setIsImporting(false);
    }
  };
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };
  return (
    <div className={`export-import ${className}`}>
      {/* Export/Import Buttons */}
      <div className='flex space-x-2'>
        <button
          onClick={() => setShowExportModal(true)}
          className='flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm'
        >
          <i className='ri-download-line mr-2'></i>
          Dışa Aktar
        </button>
        {['companies', 'projects', 'events'].includes(type) && (
          <button
            onClick={() => setShowImportModal(true)}
            className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
          >
            <i className='ri-upload-line mr-2'></i>
            İçe Aktar
          </button>
        )}
      </div>
      {/* Export Modal */}
      {showExportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {getTypeLabel(type)} Dışa Aktar
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <i className='ri-close-line text-xl'></i>
              </button>
            </div>
            <div className='space-y-4'>
              {/* Format Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Format
                </label>
                <div className='flex space-x-4'>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      value='excel'
                      checked={exportFormat === 'excel'}
                      onChange={e => setExportFormat(e.target.value as 'excel')}
                      className='mr-2'
                    />
                    <span className='text-sm'>Excel (.xlsx)</span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      value='csv'
                      checked={exportFormat === 'csv'}
                      onChange={e => setExportFormat(e.target.value as 'csv')}
                      className='mr-2'
                    />
                    <span className='text-sm'>CSV</span>
                  </label>
                </div>
              </div>
              {/* Date Range Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tarih Aralığı (Opsiyonel)
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='date'
                    value={exportFilters.dateRange?.start || ''}
                    onChange={e =>
                      setExportFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                    className='px-3 py-2 border border-gray-300 rounded-lg text-sm'
                  />
                  <input
                    type='date'
                    value={exportFilters.dateRange?.end || ''}
                    onChange={e =>
                      setExportFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value },
                      }))
                    }
                    className='px-3 py-2 border border-gray-300 rounded-lg text-sm'
                  />
                </div>
              </div>
              {/* Error Message */}
              {error && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
                  <p className='text-sm text-red-800'>{error}</p>
                </div>
              )}
              {/* Actions */}
              <div className='flex space-x-3 pt-4'>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className='flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isExporting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Dışa Aktarılıyor...
                    </>
                  ) : (
                    'Dışa Aktar'
                  )}
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors'
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Import Modal */}
      {showImportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {getTypeLabel(type)} İçe Aktar
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <i className='ri-close-line text-xl'></i>
              </button>
            </div>
            <div className='space-y-4'>
              {/* Import Mode */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  İçe Aktarma Modu
                </label>
                <select
                  value={importMode}
                  onChange={e => setImportMode(e.target.value as any)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                >
                  <option value='create'>Sadece Yeni Kayıtlar Oluştur</option>
                  <option value='update'>Mevcut Kayıtları Güncelle</option>
                  <option value='upsert'>Oluştur veya Güncelle</option>
                </select>
              </div>
              {/* File Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dosya Seç
                </label>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.xlsx,.xls,.csv'
                  onChange={handleFileSelect}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Excel (.xlsx, .xls) veya CSV dosyası yükleyin
                </p>
              </div>
              {/* Import Result */}
              {importResult && (
                <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
                  <h4 className='font-medium text-green-800 mb-2'>
                    Import Sonucu
                  </h4>
                  <div className='text-sm text-green-700 space-y-1'>
                    <p>Toplam: {importResult.total}</p>
                    <p>Başarılı: {importResult.success}</p>
                    <p>Hatalı: {importResult.errors}</p>
                  </div>
                  {importResult.errorDetails.length > 0 && (
                    <details className='mt-2'>
                      <summary className='text-sm text-green-800 cursor-pointer'>
                        Hata Detayları
                      </summary>
                      <div className='mt-2 text-xs text-green-700 max-h-32 overflow-y-auto'>
                        {importResult.errorDetails.map(
                          (error: any, index: number) => (
                            <div key={index} className='mb-1'>
                              Satır {error.row}: {error.error}
                            </div>
                          )
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}
              {/* Error Message */}
              {error && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
                  <p className='text-sm text-red-800'>{error}</p>
                </div>
              )}
              {/* Actions */}
              <div className='flex space-x-3 pt-4'>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isImporting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      İçe Aktarılıyor...
                    </>
                  ) : (
                    'Dosya Seç'
                  )}
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors'
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
