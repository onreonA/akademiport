'use client';
import { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Tabs({
  tabs,
  defaultTab,
  className = '',
  variant = 'default',
  size = 'md',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const getVariantClasses = () => {
    switch (variant) {
      case 'pills':
        return {
          container: 'bg-gray-100 p-1 rounded-lg',
          tab: 'flex-1 text-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          activeTab: 'bg-white text-gray-900 shadow-sm',
          inactiveTab: 'text-gray-600 hover:text-gray-900',
        };
      case 'underline':
        return {
          container: 'border-b border-gray-200',
          tab: 'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
          activeTab: 'border-blue-500 text-blue-600',
          inactiveTab:
            'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
        };
      default:
        return {
          container: 'border-b border-gray-200',
          tab: 'px-4 py-2 text-sm font-medium transition-colors',
          activeTab: 'text-blue-600 border-blue-600',
          inactiveTab: 'text-gray-600 hover:text-gray-900',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-6 py-3';
      default:
        return 'text-sm px-4 py-2';
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className={`tabs-container ${className}`}>
      {/* Tab Navigation */}
      <div className={`tabs-nav ${variantClasses.container}`}>
        <div className='flex space-x-1'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                ${variantClasses.tab}
                ${getSizeClasses()}
                ${activeTab === tab.id ? variantClasses.activeTab : variantClasses.inactiveTab}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                flex items-center space-x-2
              `}
            >
              {tab.icon && <i className={tab.icon}></i>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className='tabs-content mt-6'>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-panel ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
