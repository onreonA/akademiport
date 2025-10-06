'use client';
import React from 'react';
import {
  RiFileLine,
  RiFolderLine,
  RiTimeLine,
  RiUserLine,
} from 'react-icons/ri';
interface OverviewTabProps {
  project: any;
  tasks: any[];
  subProjects: any[];
  comments: any[];
}
const OverviewTab: React.FC<OverviewTabProps> = React.memo(
  ({ project, tasks, subProjects, comments }) => {
    if (!project) return null;
    const completedTasks = tasks.filter(
      task => task.status === 'completed'
    ).length;
    const inProgressTasks = tasks.filter(
      task => task.status === 'in_progress'
    ).length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const totalTasks = tasks.length;
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'in_progress':
          return 'bg-yellow-100 text-yellow-800';
        case 'pending':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high':
          return 'bg-red-100 text-red-800';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800';
        case 'low':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
    return (
      <div className='space-y-6'>
        {/* Proje İstatistikleri */}
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm text-gray-600'>Toplam Görev</p>
                <p className='text-xl sm:text-2xl font-bold text-gray-900'>
                  {totalTasks}
                </p>
              </div>
              <RiFolderLine className='h-6 w-6 text-blue-500' />
            </div>
          </div>
          <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm text-gray-600'>Tamamlanan</p>
                <p className='text-xl sm:text-2xl font-bold text-green-600'>
                  {completedTasks}
                </p>
              </div>
              <RiUserLine className='h-6 w-6 text-green-500' />
            </div>
          </div>
          <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm text-gray-600'>Devam Eden</p>
                <p className='text-xl sm:text-2xl font-bold text-yellow-600'>
                  {inProgressTasks}
                </p>
              </div>
              <RiTimeLine className='h-6 w-6 text-yellow-500' />
            </div>
          </div>
          <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm text-gray-600'>Bekleyen</p>
                <p className='text-xl sm:text-2xl font-bold text-gray-600'>
                  {pendingTasks}
                </p>
              </div>
              <RiFileLine className='h-6 w-6 text-gray-500' />
            </div>
          </div>
        </div>
        {/* Görev Durumu Analizi */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Görev Durumu Analizi
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Tamamlanan</span>
                <div className='flex items-center space-x-2'>
                  <div className='w-20 bg-gray-200 rounded-full h-2 sm:h-3'>
                    <div
                      className='bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-300'
                      style={{
                        width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-xs sm:text-sm font-medium text-gray-900'>
                    {totalTasks > 0
                      ? Math.round((completedTasks / totalTasks) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Devam Eden</span>
                <div className='flex items-center space-x-2'>
                  <div className='w-20 bg-gray-200 rounded-full h-2 sm:h-3'>
                    <div
                      className='bg-yellow-500 h-2 sm:h-3 rounded-full transition-all duration-300'
                      style={{
                        width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-xs sm:text-sm font-medium text-gray-900'>
                    {totalTasks > 0
                      ? Math.round((inProgressTasks / totalTasks) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Bekleyen</span>
                <div className='flex items-center space-x-2'>
                  <div className='w-20 bg-gray-200 rounded-full h-2 sm:h-3'>
                    <div
                      className='bg-gray-500 h-2 sm:h-3 rounded-full transition-all duration-300'
                      style={{
                        width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-xs sm:text-sm font-medium text-gray-900'>
                    {totalTasks > 0
                      ? Math.round((pendingTasks / totalTasks) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Öncelik Dağılımı */}
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Öncelik Dağılımı
            </h3>
            <div className='space-y-3'>
              {['high', 'medium', 'low'].map(priority => {
                const count = tasks.filter(
                  task => task.priority === priority
                ).length;
                return (
                  <div
                    key={priority}
                    className='flex items-center justify-between'
                  >
                    <span className='text-sm text-gray-600 capitalize'>
                      {priority}
                    </span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-20 bg-gray-200 rounded-full h-2 sm:h-3'>
                        <div
                          className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                            priority === 'high'
                              ? 'bg-red-500'
                              : priority === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{
                            width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className='text-xs sm:text-sm font-medium text-gray-900'>
                        {totalTasks > 0
                          ? Math.round((count / totalTasks) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* İlerleme Analizi */}
        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            İlerleme Analizi
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {project.progress_percentage}%
              </div>
              <div className='text-sm text-gray-600'>Genel İlerleme</div>
              <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${project.progress_percentage}%` }}
                ></div>
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {subProjects.length}
              </div>
              <div className='text-sm text-gray-600'>Alt Proje</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {comments.length}
              </div>
              <div className='text-sm text-gray-600'>Yorum</div>
            </div>
          </div>
        </div>
        {/* Son Aktiviteler */}
        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Son Aktiviteler
          </h3>
          <div className='space-y-3'>
            {comments.slice(0, 3).map((comment: any) => (
              <div
                key={comment.id}
                className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'
              >
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-medium'>
                    {comment.user_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-medium text-gray-900'>
                      {comment.user_name}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {comment.created_at}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
OverviewTab.displayName = 'OverviewTab';
export default OverviewTab;
