'use client';
import { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: string;
  badge?: string | number;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export default function Accordion({
  items,
  allowMultiple = false,
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);

      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }

      return newSet;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map(item => (
        <div
          key={item.id}
          className='bg-white border border-gray-200 rounded-lg overflow-hidden'
        >
          {/* Accordion Header */}
          <button
            onClick={() => toggleItem(item.id)}
            className='w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                {item.icon && (
                  <i className={`${item.icon} text-gray-600 text-lg`}></i>
                )}
                <h3 className='text-lg font-semibold text-gray-900'>
                  {item.title}
                </h3>
                {item.badge && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                    {item.badge}
                  </span>
                )}
              </div>
              <i
                className={`ri-arrow-${openItems.has(item.id) ? 'up' : 'down'}-s-line text-gray-500 text-xl transition-transform duration-200`}
              ></i>
            </div>
          </button>

          {/* Accordion Content */}
          {openItems.has(item.id) && (
            <div className='px-6 pb-6 border-t border-gray-100'>
              <div className='pt-4'>{item.content}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
