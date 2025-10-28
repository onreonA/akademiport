import * as React from 'react';
import { Input } from '../atoms/input';
import { cn } from '@/presentation/lib/utils';
import { Search, X } from 'lucide-react';
import { Button } from '../atoms/button';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, showClearButton = true, value, ...props }, ref) => {
    const hasValue = value && value.toString().length > 0;

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          type="search"
          className={cn('pl-9', hasValue && showClearButton && 'pr-9', className)}
          value={value}
          {...props}
        />
        {hasValue && showClearButton && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
