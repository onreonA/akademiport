import * as React from 'react';
import { Label } from '../atoms/label';
import { Input } from '../atoms/input';
import { Textarea } from '../atoms/textarea';
import { cn } from '@/presentation/lib/utils';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, multiline, rows, className, id, ...props }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {multiline ? (
          <Textarea
            id={fieldId}
            rows={rows}
            className={cn(error && 'border-destructive', className)}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <Input
            ref={ref}
            id={fieldId}
            className={cn(error && 'border-destructive', className)}
            {...props}
          />
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
