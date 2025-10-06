// =====================================================
// PROJECT CARD COMPONENT
// =====================================================
// Proje kartı component'i
'use client';
import { forwardRef } from 'react';

import Badge from '../base/Badge';
import Button from '../base/Button';
import Card, { CardBody, CardFooter, CardHeader } from '../base/Card';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatDate';
export interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
    type: string;
    consultantName?: string;
    subProjectCount?: number;
    assignedCompanies?: number;
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
  onView?: (project: any) => void;
  className?: string;
}
const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ project, onEdit, onDelete, onView, className }, ref) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'active':
        case 'aktif':
          return 'success';
        case 'completed':
        case 'tamamlandı':
          return 'primary';
        case 'paused':
        case 'duraklatıldı':
          return 'warning';
        case 'planning':
        case 'planlandı':
          return 'secondary';
        default:
          return 'secondary';
      }
    };
    const getTypeColor = (type: string) => {
      switch (type.toLowerCase()) {
        case 'b2b':
          return 'blue';
        case 'b2c':
          return 'green';
        case 'internal':
          return 'purple';
        default:
          return 'gray';
      }
    };
    return (
      <Card
        ref={ref}
        hover
        clickable={!!onView}
        onClick={() => onView?.(project)}
        className={cn('h-full', className)}
      >
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-semibold text-gray-900 truncate'>
                {project.name}
              </h3>
              <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                {project.description}
              </p>
            </div>
            <div className='flex flex-col items-end space-y-2 ml-4'>
              <Badge variant={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge variant='outline' color={getTypeColor(project.type)}>
                {project.type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            {/* Progress */}
            <div>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span>İlerleme</span>
                <span>{project.progress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            {/* Project Info */}
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-500'>Başlangıç:</span>
                <p className='font-medium'>
                  {formatDate(project.startDate, { format: 'short' })}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>Bitiş:</span>
                <p className='font-medium'>
                  {formatDate(project.endDate, { format: 'short' })}
                </p>
              </div>
            </div>
            {/* Stats */}
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-600'>
                  {project.subProjectCount || 0}
                </p>
                <p className='text-gray-500'>Alt Proje</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>
                  {project.assignedCompanies || 0}
                </p>
                <p className='text-gray-500'>Firma</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-600'>
                  {project.consultantName ? '1' : '0'}
                </p>
                <p className='text-gray-500'>Danışman</p>
              </div>
            </div>
            {/* Consultant */}
            {project.consultantName && (
              <div className='text-sm'>
                <span className='text-gray-500'>Danışman:</span>
                <p className='font-medium'>{project.consultantName}</p>
              </div>
            )}
          </div>
        </CardBody>
        {(onEdit || onDelete || onView) && (
          <CardFooter>
            <div className='flex justify-end space-x-2 w-full'>
              {onView && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={e => {
                    e.stopPropagation();
                    onView(project);
                  }}
                >
                  Görüntüle
                </Button>
              )}
              {onEdit && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                >
                  Düzenle
                </Button>
              )}
              {onDelete && (
                <Button
                  variant='danger'
                  size='sm'
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(project);
                  }}
                >
                  Sil
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }
);
ProjectCard.displayName = 'ProjectCard';
export default ProjectCard;
