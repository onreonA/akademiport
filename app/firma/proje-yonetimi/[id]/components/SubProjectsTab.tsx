'use client';
import React from 'react';
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiFolderLine,
} from 'react-icons/ri';
interface SubProjectsTabProps {
  subProjects: any[];
  tasks: any[];
  expandedSubProjects: Set<string>;
  onToggleSubProject: (id: string) => void;
  onUpdateTaskStatus: (taskId: string, status: string) => void;
}
const SubProjectsTab: React.FC<SubProjectsTabProps> = React.memo(
  ({
    subProjects,
    tasks,
    expandedSubProjects,
    onToggleSubProject,
    onUpdateTaskStatus,
  }) => {
    const getTasksForSubProject = (subProjectId: string) => {
      return tasks.filter(task => task.sub_project_id === subProjectId);
    };
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
    const getStatusButtonColor = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-green-500 hover:bg-green-600';
        case 'in_progress':
          return 'bg-yellow-500 hover:bg-yellow-600';
        case 'pending':
          return 'bg-gray-500 hover:bg-gray-600';
        default:
          return 'bg-gray-500 hover:bg-gray-600';
      }
    };
    return (
      <div className='space-y-4'>
        {subProjects.map(subProject => {
          const subProjectTasks = getTasksForSubProject(subProject.id);
          const isExpanded = expandedSubProjects.has(subProject.id);
          return (
            <div
              key={subProject.id}
              className='bg-white rounded-lg border border-gray-200 shadow-sm'
            >
              {/* Sub Project Header */}
              <div
                className='p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200'
                onClick={() => onToggleSubProject(subProject.id)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    {isExpanded ? (
                      <RiArrowDownSLine className='h-5 w-5 text-gray-500' />
                    ) : (
                      <RiArrowRightSLine className='h-5 w-5 text-gray-500' />
                    )}
                    <RiFolderLine className='h-5 w-5 text-blue-500' />
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        {subProject.name}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {subProject.description}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-500'>
                      {subProjectTasks.length} görev
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subProject.status)}`}
                    >
                      {subProject.status}
                    </span>
                  </div>
                </div>
              </div>
              {/* Tasks List */}
              {isExpanded && (
                <div className='border-t border-gray-200'>
                  <div className='p-4 space-y-3'>
                    {subProjectTasks.length === 0 ? (
                      <p className='text-gray-500 text-center py-4'>
                        Bu alt projede henüz görev bulunmuyor.
                      </p>
                    ) : (
                      subProjectTasks.map(task => (
                        <div
                          key={`subproject-${subProject.id}-task-${task.id}`}
                          className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                        >
                          <div className='flex-1'>
                            <h4 className='text-sm font-medium text-gray-900'>
                              {task.title}
                            </h4>
                            <p className='text-xs text-gray-600 mt-1'>
                              {task.description}
                            </p>
                            <div className='flex items-center space-x-2 mt-2'>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
                              >
                                {task.status}
                              </span>
                              <span className='text-xs text-gray-500'>
                                Öncelik: {task.priority}
                              </span>
                            </div>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-xs text-gray-500'>
                              {task.progress_percentage}%
                            </span>
                            <div className='flex space-x-1'>
                              <button
                                onClick={() =>
                                  onUpdateTaskStatus(task.id, 'pending')
                                }
                                className={`px-2 py-1 text-xs text-white rounded ${getStatusButtonColor('pending')} ${
                                  task.status === 'pending'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                disabled={task.status === 'pending'}
                              >
                                Beklemede
                              </button>
                              <button
                                onClick={() =>
                                  onUpdateTaskStatus(task.id, 'in_progress')
                                }
                                className={`px-2 py-1 text-xs text-white rounded ${getStatusButtonColor('in_progress')} ${
                                  task.status === 'in_progress'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                disabled={task.status === 'in_progress'}
                              >
                                Devam Ediyor
                              </button>
                              <button
                                onClick={() =>
                                  onUpdateTaskStatus(task.id, 'completed')
                                }
                                className={`px-2 py-1 text-xs text-white rounded ${getStatusButtonColor('completed')} ${
                                  task.status === 'completed'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                disabled={task.status === 'completed'}
                              >
                                Tamamlandı
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
SubProjectsTab.displayName = 'SubProjectsTab';
export default SubProjectsTab;
