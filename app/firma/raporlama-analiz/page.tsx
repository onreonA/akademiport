'use client';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
interface Report {
  id: string;
  title: string;
  type:
    | 'swot'
    | 'sektör'
    | 'ürün'
    | 'rakip'
    | 'dijital_performans'
    | 'eğitim'
    | 'dönemsel_değerlendirme'
    | 'finansal'
    | 'pazar_analizi';
  fileName: string;
  fileSize: string;
  author: string;
  publishDate: string;
  description: string;
  pdfUrl: string;
  isRead: boolean;
  downloadCount: number;
  companyId: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}
interface FilterOptions {
  search: string;
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
  fileSize: string;
}
const ReportCard = ({
  report,
  onView,
  onDownload,
}: {
  report: Report;
  onView: (report: Report) => void;
  onDownload: (report: Report) => void;
}) => {
  const getTypeText = (type: Report['type']) => {
    switch (type) {
      case 'swot':
        return 'SWOT Analizi';
      case 'ürün':
        return 'Ürün Analizi';
      case 'sektör':
        return 'Sektör Analizi';
      case 'pazar_analizi':
        return 'Pazar Analizi';
      case 'finansal':
        return 'Finansal Analiz';
      case 'rakip':
        return 'Rakip Analizi';
      case 'dijital_performans':
        return 'Dijital Performans';
      case 'eğitim':
        return 'Eğitim';
      case 'dönemsel_değerlendirme':
        return 'Dönemsel Değerlendirme';
      default:
        return 'Genel Rapor';
    }
  };
  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'swot':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ürün':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sektör':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pazar_analizi':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'finansal':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rakip':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dijital_performans':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'eğitim':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'dönemsel_değerlendirme':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  const getPriorityIcon = (priority: Report['priority']) => {
    switch (priority) {
      case 'high':
        return 'ri-arrow-up-line';
      case 'medium':
        return 'ri-subtract-line';
      case 'low':
        return 'ri-arrow-down-line';
      default:
        return 'ri-subtract-line';
    }
  };
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 ${!report.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <h4 className='text-lg font-bold text-gray-900 flex-1'>
              {report.title}
            </h4>
            {!report.isRead && (
              <div
                className='w-3 h-3 bg-blue-500 rounded-full animate-pulse'
                title='Okunmadı'
              ></div>
            )}
            <i
              className={`${getPriorityIcon(report.priority)} ${getPriorityColor(report.priority)} text-sm`}
              title={`${report.priority === 'high' ? 'Yüksek' : report.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik`}
            ></i>
          </div>
          <div className='flex items-center gap-2 mb-3'>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(report.type)}`}
            >
              {getTypeText(report.type)}
            </span>
          </div>
          <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
            {report.description}
          </p>
          <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-1'>
                <i className='ri-user-line'></i>
                {report.author}
              </span>
              <span className='flex items-center gap-1'>
                <i className='ri-calendar-line'></i>
                {new Date(report.publishDate).toLocaleDateString('tr-TR')}
              </span>
              <span className='flex items-center gap-1'>
                <i className='ri-download-line'></i>
                {report.downloadCount} indirme
              </span>
            </div>
            <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
              {report.fileSize}
            </span>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
        <div className='flex items-center gap-2'>
          {report.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md'
            >
              {tag}
            </span>
          ))}
          {report.tags.length > 3 && (
            <span className='text-xs text-gray-500'>
              +{report.tags.length - 3} daha
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => onView(report)}
            className='px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors'
          >
            Görüntüle
          </button>
          <button
            onClick={() => onDownload(report)}
            className='px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors'
          >
            İndir
          </button>
        </div>
      </div>
    </div>
  );
};
const FilterBar = ({
  filters,
  onFilterChange,
}: {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}) => {
  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFilterChange({ ...filters, ...updates });
  };
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 mb-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
        {/* Arama */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Rapor Arama
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
              <i className='ri-search-line text-gray-400 text-sm'></i>
            </div>
            <input
              type='text'
              value={filters.search}
              onChange={e => updateFilters({ search: e.target.value })}
              placeholder='Rapor adı ile ara...'
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            />
          </div>
        </div>
        {/* Rapor Türü */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Rapor Türü
          </label>
          <select
            value={filters.type}
            onChange={e => updateFilters({ type: e.target.value })}
            className='w-full pr-8 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
          >
            <option value='all'>Tüm Rapor Türleri</option>
            <option value='swot'>SWOT Analizi</option>
            <option value='ürün'>Ürün Analizi</option>
            <option value='sektör'>Sektör Analizi</option>
            <option value='pazar_analizi'>Pazar Analizi</option>
            <option value='finansal'>Finansal Analiz</option>
            <option value='rakip'>Rakip Analizi</option>
            <option value='dijital_performans'>Dijital Performans</option>
            <option value='eğitim'>Eğitim</option>
            <option value='dönemsel_değerlendirme'>
              Dönemsel Değerlendirme
            </option>
          </select>
        </div>
        {/* Dosya Boyutu */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Dosya Boyutu
          </label>
          <select
            value={filters.fileSize}
            onChange={e => updateFilters({ fileSize: e.target.value })}
            className='w-full pr-8 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
          >
            <option value='all'>Tüm Boyutlar</option>
            <option value='small'>Küçük (0-5 MB)</option>
            <option value='medium'>Orta (5-15 MB)</option>
            <option value='large'>Büyük (15+ MB)</option>
          </select>
        </div>
        {/* Temizle Butonu */}
        <div className='flex items-end'>
          <button
            onClick={() => {
              const clearedFilters: FilterOptions = {
                search: '',
                type: 'all',
                dateRange: { start: '', end: '' },
                fileSize: 'all',
              };
              onFilterChange(clearedFilters);
            }}
            className='w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2'
          >
            <i className='ri-refresh-line'></i>
            Filtreleri Temizle
          </button>
        </div>
      </div>
      {/* Tarih Aralığı */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Başlangıç Tarihi
          </label>
          <input
            type='date'
            value={filters.dateRange.start}
            onChange={e =>
              updateFilters({
                dateRange: { ...filters.dateRange, start: e.target.value },
              })
            }
            className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Bitiş Tarihi
          </label>
          <input
            type='date'
            value={filters.dateRange.end}
            onChange={e =>
              updateFilters({
                dateRange: { ...filters.dateRange, end: e.target.value },
              })
            }
            className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
          />
        </div>
      </div>
    </div>
  );
};
export default function ReportsAnalysisPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    dateRange: { start: '', end: '' },
    fileSize: 'all',
  });
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const userEmail = user?.email || '';
        if (!userEmail) {
          setError('Kullanıcı bilgisi bulunamadı');
          return;
        }
        const response = await fetch('/api/company/reports', {
          headers: {
            'X-User-Email': userEmail,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setReports(data.data || []);
            setFilteredReports(data.data || []);
          } else {
            setError(data.error || 'Raporlar yüklenemedi');
          }
        } else {
          setError('API yanıtı başarısız');
        }
      } catch (error) {
        setError('Raporlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchReports();
    }
  }, [user]);
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    let filtered = [...reports];
    // Arama filtresi
    if (newFilters.search) {
      const searchTerm = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        report =>
          report.title.toLowerCase().includes(searchTerm) ||
          report.description.toLowerCase().includes(searchTerm) ||
          report.author.toLowerCase().includes(searchTerm) ||
          report.fileName.toLowerCase().includes(searchTerm)
      );
    }
    // Tür filtresi
    if (newFilters.type !== 'all') {
      filtered = filtered.filter(report => report.type === newFilters.type);
    }
    // Tarih aralığı filtresi
    if (newFilters.dateRange.start) {
      filtered = filtered.filter(
        report =>
          new Date(report.publishDate) >= new Date(newFilters.dateRange.start)
      );
    }
    if (newFilters.dateRange.end) {
      filtered = filtered.filter(
        report =>
          new Date(report.publishDate) <= new Date(newFilters.dateRange.end)
      );
    }
    // Dosya boyutu filtresi
    if (newFilters.fileSize !== 'all') {
      filtered = filtered.filter(report => {
        const size = parseInt(report.fileSize.replace(/\D/g, ''));
        switch (newFilters.fileSize) {
          case 'small':
            return size <= 5;
          case 'medium':
            return size > 5 && size <= 15;
          case 'large':
            return size > 15;
          default:
            return true;
        }
      });
    }
    setFilteredReports(filtered);
  };
  const handleView = (report: Report) => {
    window.open(report.pdfUrl, '_blank');
    setSuccessMessage('Rapor açılıyor...');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const handleDownload = (report: Report) => {
    const link = document.createElement('a');
    link.href = report.pdfUrl;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage('Rapor indiriliyor...');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Raporlama & Analiz'
        description='Firma raporlarınızı görüntüleyin ve analiz edin'
      >
        <div className='p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-4 text-gray-600'>Raporlar yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  // İstatistikler
  const stats = {
    total: reports.length,
    unread: reports.filter(r => !r.isRead).length,
    mostViewed:
      reports.reduce(
        (max, r) => (r.downloadCount > max.downloadCount ? r : max),
        reports[0]
      )?.type || 'swot',
    thisWeek: reports.filter(r => {
      const reportDate = new Date(r.publishDate);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return reportDate >= oneWeekAgo;
    }).length,
  };
  const getMostViewedTypeText = () => {
    switch (stats.mostViewed) {
      case 'swot':
        return 'SWOT Analizi';
      case 'ürün':
        return 'Ürün Analizi';
      case 'sektör':
        return 'Sektör Analizi';
      case 'pazar_analizi':
        return 'Pazar Analizi';
      case 'finansal':
        return 'Finansal Analiz';
      case 'rakip':
        return 'Rakip Analizi';
      case 'dijital_performans':
        return 'Dijital Performans';
      case 'eğitim':
        return 'Eğitim';
      case 'dönemsel_değerlendirme':
        return 'Dönemsel Değerlendirme';
      default:
        return 'Bilinmiyor';
    }
  };
  return (
    <FirmaLayout
      title='Raporlama & Analiz'
      description='Firma raporlarınızı görüntüleyin ve analiz edin'
    >
      <main className='p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  Raporlama ve Analiz 📊
                </h1>
                <p className='text-gray-600'>
                  Firma performansınızı analiz edin, raporları inceleyin
                </p>
              </div>
            </div>
          </div>
          {/* Success Message */}
          {successMessage && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse'>
              <div className='flex items-center gap-2'>
                <i className='ri-check-line text-green-600'></i>
                <p className='text-green-800'>{successMessage}</p>
              </div>
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <i className='ri-error-warning-line text-red-600'></i>
                <p className='text-red-800'>{error}</p>
              </div>
            </div>
          )}
          {/* İstatistikler */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-file-chart-line text-blue-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.total}
                  </p>
                  <p className='text-sm text-gray-600'>Toplam Rapor</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-notification-line text-orange-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.unread}
                  </p>
                  <p className='text-sm text-gray-600'>Okunmamış</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-eye-line text-green-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.thisWeek}
                  </p>
                  <p className='text-sm text-gray-600'>Bu Hafta</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-trending-up-line text-purple-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-lg font-bold text-gray-900'>
                    {getMostViewedTypeText()}
                  </p>
                  <p className='text-sm text-gray-600'>En Popüler</p>
                </div>
              </div>
            </div>
          </div>
          {/* Filtreler */}
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          {/* Rapor Listesi */}
          <div className='space-y-6'>
            {filteredReports.length > 0 ? (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {filteredReports.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={handleView}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-16'>
                <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <i className='ri-file-chart-line text-gray-400 text-3xl'></i>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-3'>
                  Rapor bulunamadı
                </h3>
                <p className='text-gray-600 max-w-md mx-auto'>
                  Filtreleme kriterlerinize uygun rapor bulunmamaktadır.
                  Filtreleri temizleyerek tekrar deneyebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </FirmaLayout>
  );
}
