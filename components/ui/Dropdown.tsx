'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronRight, type LucideIcon } from 'lucide-react';

import { cn, radius, shadow } from '@/lib/design-tokens';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  submenu?: DropdownItem[];
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect?: (id: string) => void;
  position?: 'left' | 'right' | 'center';
  className?: string;
}

/**
 * Dropdown Component - Menu with actions
 *
 * @example
 * <Dropdown
 *   trigger={<button>Menü</button>}
 *   items={[
 *     { id: 'edit', label: 'Düzenle', icon: Edit },
 *     { id: 'delete', label: 'Sil', icon: Trash, danger: true }
 *   ]}
 *   onSelect={handleSelect}
 * />
 */
export default function Dropdown({
  trigger,
  items,
  onSelect,
  position = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onSelect?.(id);
    setIsOpen(false);
  };

  // Position configurations
  const positionConfig = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-flex', className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className='cursor-pointer'>
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            // Base
            'absolute z-50',
            'mt-2',
            'min-w-[12rem]',
            'bg-white',
            'border border-gray-200',
            radius('lg'),
            shadow('lg'),

            // Animation
            'animate-fade-in',

            // Position
            'top-full',
            positionConfig[position]
          )}
        >
          <div className='py-1'>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {/* Divider */}
                {item.divider && (
                  <div className='my-1 border-t border-gray-200' />
                )}

                {/* Menu Item */}
                {!item.divider && (
                  <button
                    type='button'
                    onClick={() => !item.disabled && handleSelect(item.id)}
                    disabled={item.disabled}
                    className={cn(
                      // Base
                      'w-full',
                      'flex items-center gap-3',
                      'px-4 py-2',
                      'text-sm text-left',
                      'transition-colors',

                      // States
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : item.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50',

                      // Submenu indicator
                      item.submenu && 'justify-between'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      {/* Icon */}
                      {item.icon && (
                        <item.icon className='w-4 h-4 flex-shrink-0' />
                      )}

                      {/* Label */}
                      <span>{item.label}</span>
                    </div>

                    {/* Submenu indicator */}
                    {item.submenu && (
                      <ChevronRight className='w-4 h-4 flex-shrink-0 text-gray-400' />
                    )}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DropdownCheckbox - Dropdown with checkboxes
 */
export interface DropdownCheckboxProps {
  trigger: React.ReactNode;
  items: Array<{
    id: string;
    label: string;
    checked: boolean;
  }>;
  onChange?: (id: string, checked: boolean) => void;
  position?: 'left' | 'right' | 'center';
  className?: string;
}

export function DropdownCheckbox({
  trigger,
  items,
  onChange,
  position = 'left',
  className,
}: DropdownCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const positionConfig = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-flex', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className='cursor-pointer'>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2',
            'min-w-[12rem]',
            'bg-white border border-gray-200',
            radius('lg'),
            shadow('lg'),
            'animate-fade-in',
            'top-full',
            positionConfig[position]
          )}
        >
          <div className='py-1'>
            {items.map(item => (
              <label
                key={item.id}
                className={cn(
                  'flex items-center gap-3',
                  'px-4 py-2',
                  'text-sm',
                  'cursor-pointer',
                  'hover:bg-gray-50',
                  'transition-colors'
                )}
              >
                <input
                  type='checkbox'
                  checked={item.checked}
                  onChange={e => onChange?.(item.id, e.target.checked)}
                  className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-gray-700'>{item.label}</span>
                {item.checked && (
                  <Check className='w-4 h-4 ml-auto text-blue-600' />
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
