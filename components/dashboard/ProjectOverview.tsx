'use client';
import Link from 'next/link';
import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  status: 'Planlandı' | 'Aktif' | 'Tamamlandı';
  progress: number;
  assignedCompanies: number;
  subProjectCount: number;
  lastUpdate: string;
}

interface ProjectOverviewProps {
  projects: Project[];
  title?: string;
  className?: string;
  maxItems?: number;
}

export default function ProjectOverview({
  projects,
  title = 'Proje Özeti',
  className = '',
  maxItems = 6,
}: ProjectOverviewProps) {
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter(
    project => statusFilter === 'all' || project.status === statusFilter
  );

  const displayedProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, maxItems);

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

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Bugün';
    if (diffInDays === 1) return 'Dün';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
        <div className='flex items-center space-x-2'>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>Tüm Durumlar</option>
            <option value='Planlandı'>Planlandı</option>
            <option value='Aktif'>Aktif</option>
            <option value='Tamamlandı'>Tamamlandı</option>
          </select>
          {filteredProjects.length > maxItems && (
            <button
              onClick={() => setShowAll(!showAll)}
              className='text-sm text-blue-600 hover:text-blue-700 transition-colors'
            >
              {showAll ? 'Daha Az' : 'Daha Fazla'}
            </button>
          )}
        </div>
      </div>

      {displayedProjects.length === 0 ? (
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-folder-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-500'>Proje bulunamadı</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {displayedProjects.map(project => (
            <Link
              key={project.id}
              href={`/admin/proje-yonetimi/${project.id}`}
              className='block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200'
            >
              <div className='flex items-center justify-between mb-2'>
                <h4 className='text-sm font-medium text-gray-900 truncate flex-1'>
                  {project.name}
                </h4>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} ml-2`}
                >
                  {project.status}
                </span>
              </div>

              <div className='flex items-center justify-between text-xs text-gray-500 mb-2'>
                <div className='flex items-center space-x-3'>
                  <span className='flex items-center'>
                    <i className='ri-folder-line mr-1'></i>
                    {project.subProjectCount} Alt Proje
                  </span>
                  <span className='flex items-center'>
                    <i className='ri-building-line mr-1'></i>
                    {project.assignedCompanies} Firma
                  </span>
                </div>
                <span>{formatLastUpdate(project.lastUpdate)}</span>
              </div>

              <div className='flex items-center space-x-2'>
                <div className='flex-1 bg-gray-200 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className='text-xs font-medium text-gray-700 w-12 text-right'>
                  {project.progress}%
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
