'use client';
import Link from 'next/link';
import { useState } from 'react';

import Button from '@/components/ui/Button';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning';
  description?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export default function QuickActions({
  actions,
  title = 'Hızlı İşlemler',
  className = '',
}: QuickActionsProps) {
  const [expanded, setExpanded] = useState(false);

  const primaryActions = actions.slice(0, 3);
  const secondaryActions = actions.slice(3);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
        {secondaryActions.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className='text-sm text-blue-600 hover:text-blue-700 transition-colors'
          >
            {expanded ? 'Daha Az' : 'Daha Fazla'}
          </button>
        )}
      </div>

      <div className='space-y-3'>
        {/* Primary Actions */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          {primaryActions.map(action => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>

        {/* Secondary Actions */}
        {expanded && secondaryActions.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-gray-100'>
            {secondaryActions.map(action => (
              <QuickActionButton key={action.id} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionButton({ action }: { action: QuickAction }) {
  if (action.href) {
    return (
      <Link href={action.href}>
        <Button
          variant={action.variant || 'ghost'}
          size='md'
          icon={action.icon}
          className='w-full justify-start'
        >
          <div className='flex flex-col items-start'>
            <span>{action.label}</span>
            {action.description && (
              <span className='text-xs text-gray-500 mt-1'>
                {action.description}
              </span>
            )}
          </div>
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={action.variant || 'ghost'}
      size='md'
      icon={action.icon}
      onClick={action.onClick}
      className='w-full justify-start'
    >
      <div className='flex flex-col items-start'>
        <span>{action.label}</span>
        {action.description && (
          <span className='text-xs text-gray-500 mt-1'>
            {action.description}
          </span>
        )}
      </div>
    </Button>
  );
}
