'use client';

import { useEffect, useState } from 'react';

interface DateDisplayCardProps {
  title: string;
  apiEndpoint: string;
  className?: string;
}

interface DateInfo {
  id: string;
  start_date: string | null;
  end_date: string | null;
  is_flexible: boolean;
  created_at: string;
}

export default function DateDisplayCard({
  title,
  apiEndpoint,
  className = '',
}: DateDisplayCardProps) {
  const [dates, setDates] = useState<DateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Tarih bilgileri alınamadı');
        }

        const data = await response.json();
        setDates(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, [apiEndpoint]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div
        className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 ${className}`}
      >
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='space-y-2'>
            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
            <div className='h-3 bg-gray-200 rounded w-1/3'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 ${className}`}
      >
        <div className='text-center'>
          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <i className='ri-error-warning-line text-red-600 text-xl'></i>
          </div>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      </div>
    );
  }

  if (dates.length === 0) {
    return (
      <div
        className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 ${className}`}
      >
        <div className='text-center'>
          <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <i className='ri-calendar-line text-gray-400 text-xl'></i>
          </div>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>{title}</h3>
          <p className='text-gray-500 text-sm'>Henüz tarih bilgisi atanmamış</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
        <div className='flex items-center space-x-2'>
          <i className='ri-calendar-line text-blue-600'></i>
          <span className='text-sm text-gray-500'>{dates.length} tarih</span>
        </div>
      </div>

      <div className='space-y-3'>
        {dates.map((date, index) => (
          <div
            key={date.id}
            className='bg-white/50 rounded-lg p-4 border border-gray-100'
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                Tarih {index + 1}
              </span>
              {date.is_flexible && (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  <i className='ri-time-line mr-1'></i>
                  Esnek
                </span>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-500'>Başlangıç:</span>
                <p className='font-medium text-gray-900'>
                  {formatDate(date.start_date)}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>Bitiş:</span>
                <p className='font-medium text-gray-900'>
                  {formatDate(date.end_date)}
                </p>
              </div>
            </div>
            <div className='mt-2 text-xs text-gray-400'>
              Atanma: {new Date(date.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
