import * as React from 'react';

import { cn } from '@/presentation/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-gray-900 dark:file:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 selection:bg-primary selection:text-white bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-2',
        'aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500',
        className
      )}
      {...props}
    />
  );
}

export { Input };
