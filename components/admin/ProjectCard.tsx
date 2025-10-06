'use client';
import Link from 'next/link';
import { useState } from 'react';

import ActionMenu from '@/components/ui/ActionMenu';
import Button from '@/components/ui/Button';

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'B2B' | 'B2C';
  status: 'Planlandı' | 'Aktif' | 'Tamamlandı';
  adminNote: string;
  subProjectCount: number;
  assignedCompanies: number;
  progress: number;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAssign: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  onExport?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onAssign,
  onViewDetails,
  onExport,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Tamamlandı':
        return 'bg-blue-100 text-blue-800';
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const actionItems = [
    {
      label: 'Detayları Görüntüle',
      icon: 'ri-eye-line',
      onClick: () => onViewDetails?.(project),
      variant: 'default' as const,
    },
    {
      label: 'Düzenle',
      icon: 'ri-edit-line',
      onClick: () => onEdit(project),
      variant: 'default' as const,
    },
    {
      label: 'Firma Ata',
      icon: 'ri-user-add-line',
      onClick: () => onAssign(project),
      variant: 'default' as const,
    },
    {
      label: 'Dışa Aktar',
      icon: 'ri-download-line',
      onClick: () => onExport?.(project),
      variant: 'default' as const,
      divider: true,
    },
    {
      label: 'Sil',
      icon: 'ri-delete-bin-line',
      onClick: () => onDelete(project),
      variant: 'danger' as const,
    },
  ];

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow'>
      {/* Header */}
      <div className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center space-x-3 mb-2'>
              <h3 className='text-lg font-semibold text-gray-900 truncate'>
                {project.name}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
              >
                {project.status}
              </span>
            </div>

            <p className='text-gray-600 text-sm line-clamp-2 mb-3'>
              {project.description}
            </p>

            {/* Project Stats */}
            <div className='flex items-center space-x-4 text-sm text-gray-500 mb-3'>
              <div className='flex items-center'>
                <i className='ri-folder-line mr-1'></i>
                <span>{project.subProjectCount} Alt Proje</span>
              </div>
              <div className='flex items-center'>
                <i className='ri-building-line mr-1'></i>
                <span>{project.assignedCompanies} Firma</span>
              </div>
              <div className='flex items-center'>
                <i className='ri-calendar-line mr-1'></i>
                <span>{project.type}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='mb-3'>
              <div className='flex items-center justify-between text-sm mb-1'>
                <span className='text-gray-600'>İlerleme</span>
                <span className='text-gray-900 font-medium'>
                  {project.progress}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Admin Note (Expandable) */}
            {project.adminNote && (
              <div className='mt-3'>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className='flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors'
                >
                  <i
                    className={`ri-${isExpanded ? 'arrow-up-s' : 'arrow-down-s'}-line mr-1`}
                  ></i>
                  <span>Admin Notu</span>
                </button>
                {isExpanded && (
                  <p className='text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg'>
                    {project.adminNote}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Menu */}
          <ActionMenu items={actionItems} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className='px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Link
              href={`/admin/proje-yonetimi/${project.id}`}
              className='text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors'
            >
              Detayları Görüntüle
            </Link>
            <i className='ri-arrow-right-line text-blue-600 text-sm'></i>
          </div>

          <div className='flex items-center space-x-2'>
            <Button
              size='sm'
              variant='ghost'
              icon='ri-user-add-line'
              onClick={() => onAssign(project)}
            >
              Firma Ata
            </Button>
            <Button
              size='sm'
              variant='primary'
              icon='ri-edit-line'
              onClick={() => onEdit(project)}
            >
              Düzenle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
