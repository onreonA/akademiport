'use client';
import React from 'react';
import { RiPlayLine, RiTimeLine } from 'react-icons/ri';
interface TimelineTabProps {
  milestones: any[];
}
const TimelineTab: React.FC<TimelineTabProps> = React.memo(({ milestones }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };
  const getStatusBadgeColor = (status: string) => {
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
  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <RiPlayLine className='h-4 w-4 text-white' />;
      default:
        return <RiTimeLine className='h-4 w-4 text-white' />;
    }
  };
  const completedMilestones = milestones.filter(
    m => m.status === 'completed'
  ).length;
  const inProgressMilestones = milestones.filter(
    m => m.status === 'in_progress'
  ).length;
  const pendingMilestones = milestones.filter(
    m => m.status === 'pending'
  ).length;
  return (
    <div className='space-y-6'>
      {/* Timeline Summary */}
      <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Zaman Çizelgesi Özeti
        </h3>
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {completedMilestones}
            </div>
            <div className='text-sm text-gray-600'>Tamamlanan</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-600'>
              {inProgressMilestones}
            </div>
            <div className='text-sm text-gray-600'>Devam Eden</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-600'>
              {pendingMilestones}
            </div>
            <div className='text-sm text-gray-600'>Bekleyen</div>
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-900 mb-6'>
          Proje Zaman Çizelgesi
        </h3>
        <div className='relative'>
          {/* Timeline Line */}
          <div className='absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200'></div>
          <div className='space-y-8'>
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className='relative flex items-start space-x-4'
              >
                {/* Milestone Circle */}
                <div
                  className={`relative z-10 w-12 h-12 ${getStatusColor(milestone.status)} rounded-full flex items-center justify-center shadow-lg`}
                >
                  {getMilestoneIcon(milestone.type)}
                </div>
                {/* Milestone Content */}
                <div className='flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='text-lg font-semibold text-gray-900'>
                      {milestone.title}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(milestone.status)}`}
                    >
                      {milestone.status === 'completed'
                        ? 'Tamamlandı'
                        : milestone.status === 'in_progress'
                          ? 'Devam Ediyor'
                          : 'Bekliyor'}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mb-3'>
                    {milestone.description}
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>
                      {milestone.date}
                    </span>
                    {milestone.status === 'in_progress' && (
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm text-gray-600'>İlerleme:</span>
                        <div className='w-20 bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-yellow-500 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                        <span className='text-sm font-medium text-gray-900'>
                          {milestone.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
TimelineTab.displayName = 'TimelineTab';
export default TimelineTab;
