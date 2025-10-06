'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CompanyReportCardProps {
  report: {
    id: string;
    subProject: {
      id: string;
      name: string;
      description: string;
      projectName: string;
      projectId: string;
    };
    consultant: {
      id: string;
      name: string;
    };
    ratings: {
      overall: number;
      quality: number;
      timeliness: number;
      communication: number;
      average: number;
    };
    statistics: {
      taskCompletionRate: number;
      totalTasks: number;
      completedTasks: number;
      delayedTasks: number;
    };
    dates: {
      completionDate: string;
      createdAt: string;
    };
  };
}

export default function CompanyReportCard({ report }: CompanyReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getGradeLetter = (score: number): string => {
    if (!score || score < 1) return 'F';
    if (score >= 4.5) return 'A+';
    if (score >= 4.0) return 'A';
    if (score >= 3.5) return 'B+';
    if (score >= 3.0) return 'B';
    if (score >= 2.5) return 'C+';
    if (score >= 2.0) return 'C';
    if (score >= 1.5) return 'D+';
    return 'D';
  };

  const getGradeColor = (score: number): string => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 4.0) return 'text-green-600 bg-green-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-100';
    if (score >= 3.0) return 'text-blue-600 bg-blue-100';
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100';
    if (score >= 2.0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center'>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className='ml-2 text-sm text-gray-600'>({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
      {/* Header */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center space-x-3 mb-2'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {report.subProject.name}
              </h3>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(report.ratings.average)}`}
              >
                {getGradeLetter(report.ratings.average)}
              </span>
            </div>
            <p className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Ana Proje:</span>{' '}
              {report.subProject.projectName}
            </p>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Danışman:</span>{' '}
              {report.consultant.name}
            </p>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-blue-600'>
              {report.ratings.average.toFixed(1)}
            </div>
            <div className='text-xs text-gray-500'>Ortalama Puan</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='p-6'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
          <div className='text-center'>
            <div className='text-xl font-semibold text-gray-900'>
              {report.statistics.completedTasks}/{report.statistics.totalTasks}
            </div>
            <div className='text-xs text-gray-500'>Görev</div>
          </div>
          <div className='text-center'>
            <div className='text-xl font-semibold text-green-600'>
              {report.statistics.taskCompletionRate}%
            </div>
            <div className='text-xs text-gray-500'>Tamamlama</div>
          </div>
          <div className='text-center'>
            <div className='text-xl font-semibold text-yellow-600'>
              {report.statistics.delayedTasks}
            </div>
            <div className='text-xs text-gray-500'>Geciken</div>
          </div>
          <div className='text-center'>
            <div className='text-xl font-semibold text-blue-600'>
              {getGradeLetter(report.ratings.overall)}
            </div>
            <div className='text-xs text-gray-500'>Genel Not</div>
          </div>
        </div>

        {/* Rating Summary */}
        <div className='space-y-2 mb-4'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Genel Performans</span>
            {renderStars(report.ratings.overall)}
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Kalite</span>
            {renderStars(report.ratings.quality)}
          </div>
          {isExpanded && (
            <>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>Zamanında Teslim</span>
                {renderStars(report.ratings.timeliness)}
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>İletişim</span>
                {renderStars(report.ratings.communication)}
              </div>
            </>
          )}
        </div>

        {/* Date Info */}
        <div className='text-sm text-gray-600 mb-4'>
          <div className='flex justify-between'>
            <span>Tamamlanma Tarihi:</span>
            <span>{formatDate(report.dates.completionDate)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Rapor Tarihi:</span>
            <span>{formatDate(report.dates.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='text-sm text-blue-600 hover:text-blue-800 font-medium'
          >
            {isExpanded ? 'Daha Az Göster' : 'Daha Fazla Göster'}
          </button>

          <Link
            href={`/firma/raporlarim/${report.id}`}
            className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            Detayları Gör
            <svg
              className='ml-2 w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
