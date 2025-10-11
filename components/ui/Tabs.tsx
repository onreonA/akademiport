'use client';

import React, { useState } from 'react';
import { type LucideIcon } from 'lucide-react';

import { cn, radius } from '@/lib/design-tokens';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps {
  // Required
  tabs: TabItem[];

  // Controlled
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  // Default (uncontrolled)
  defaultTab?: string;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Variant
  variant?: 'line' | 'pills' | 'enclosed' | 'segmented';

  // Layout
  fullWidth?: boolean;

  // Additional
  className?: string;
}

/**
 * Tabs Component - Tab navigation
 *
 * @example
 * // Uncontrolled
 * <Tabs
 *   tabs={[
 *     { id: 'profile', label: 'Profil', content: <ProfileTab /> },
 *     { id: 'settings', label: 'Ayarlar', content: <SettingsTab /> }
 *   ]}
 * />
 *
 * @example
 * // Controlled
 * <Tabs
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="pills"
 * />
 */
export default function Tabs({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  defaultTab,
  size = 'md',
  variant = 'line',
  fullWidth = false,
  className,
}: TabsProps) {
  // Internal state for uncontrolled mode
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || ''
  );

  // Use controlled or uncontrolled state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      tab: 'px-3 py-2 text-xs',
      icon: 'w-3 h-3',
      badge: 'text-[10px] px-1.5 py-0.5',
      gap: 'gap-1.5',
    },
    md: {
      tab: 'px-4 py-2.5 text-sm',
      icon: 'w-4 h-4',
      badge: 'text-xs px-2 py-0.5',
      gap: 'gap-2',
    },
    lg: {
      tab: 'px-6 py-3 text-base',
      icon: 'w-5 h-5',
      badge: 'text-sm px-2.5 py-1',
      gap: 'gap-2.5',
    },
  };

  // Variant configurations
  const variantConfig = {
    line: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 border-transparent hover:border-gray-300',
      active: 'border-blue-600 text-blue-600',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    pills: {
      container: 'gap-2',
      tab: cn(radius('lg'), 'hover:bg-gray-100'),
      active: 'bg-blue-600 text-white hover:bg-blue-700',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    enclosed: {
      container: 'border-b border-gray-200 gap-1',
      tab: cn(radius('lg'), 'border border-transparent hover:border-gray-300', 'rounded-b-none'),
      active: 'bg-white border-gray-200 border-b-white text-blue-600 -mb-px',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    segmented: {
      container: cn('bg-gray-100', radius('lg'), 'p-1'),
      tab: cn(radius('md'), 'hover:bg-white/50'),
      active: 'bg-white shadow-sm text-gray-900',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Get active tab content
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role='tablist'
        className={cn(
          'flex',
          currentVariant.container,
          fullWidth && 'w-full'
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              role='tab'
              type='button'
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              className={cn(
                // Base
                'inline-flex items-center justify-center',
                'font-medium',
                'transition-all duration-200',
                'whitespace-nowrap',

                // Size
                currentSize.tab,
                currentSize.gap,

                // Variant
                currentVariant.tab,
                isActive ? currentVariant.active : currentVariant.inactive,

                // Full width
                fullWidth && 'flex-1',

                // Disabled
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Icon */}
              {TabIcon && <TabIcon className={currentSize.icon} />}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center',
                    'rounded-full',
                    'font-semibold',
                    currentSize.badge,
                    isActive
                      ? variant === 'pills'
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 text-blue-600'
                      : 'bg-gray-200 text-gray-700'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {activeTabData?.content && (
        <div
          role='tabpanel'
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className='mt-4'
        >
          {activeTabData.content}
        </div>
      )}
    </div>
  );
}
