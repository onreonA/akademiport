'use client';
import { useState, useRef, useEffect } from 'react';

interface ActionItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  divider?: boolean;
}

interface ActionMenuProps {
  items: ActionItem[];
  trigger?: React.ReactNode;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function ActionMenu({
  items,
  trigger,
  className = '',
  position = 'bottom-right',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'top-full left-0 mt-1';
      case 'top-right':
        return 'bottom-full right-0 mb-1';
      case 'top-left':
        return 'bottom-full left-0 mb-1';
      default:
        return 'top-full right-0 mt-1';
    }
  };

  const getVariantClasses = (variant: ActionItem['variant']) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50 hover:text-red-700';
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700';
      case 'success':
        return 'text-green-600 hover:bg-green-50 hover:text-green-700';
      default:
        return 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
        aria-label='Açılır menü'
      >
        {trigger || <i className='ri-more-2-line text-gray-600'></i>}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${getPositionClasses()}`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.divider && index > 0 && (
                <div className='border-t border-gray-100 my-1'></div>
              )}
              <button
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${getVariantClasses(item.variant)} ${
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <i className={`${item.icon} mr-3 text-sm`}></i>
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
