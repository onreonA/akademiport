/**
 * Form Components (Shadcn/ui compatible)
 * Implementation compatible with react-hook-form
 */

import * as React from 'react';
import { useFormContext, FormProvider, Controller } from 'react-hook-form';

// Create a context to pass field name to FormMessage
const FormFieldContext = React.createContext<{ name?: string }>({});

export function Form({ children, ...formProps }: any) {
  // If formProps contains form methods (from useForm), use FormProvider
  if (formProps.control || formProps.handleSubmit) {
    return (
      <FormProvider {...formProps}>
        {children}
      </FormProvider>
    );
  }
  // Otherwise, just render children
  return <>{children}</>;
}

export function FormField({ control, name, render }: any) {
  const form = useFormContext();
  const formControl = control || form?.control;
  
  if (!formControl) {
    // Fallback for when form context is not available
    return (
      <FormFieldContext.Provider value={{ name }}>
        {render({ 
          field: { name, value: '', onChange: () => {}, onBlur: () => {} },
          fieldState: { error: undefined },
          formState: { errors: {} }
        })}
      </FormFieldContext.Provider>
    );
  }

  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        control={formControl}
        name={name}
        render={(fieldProps) => {
          const error = form?.formState?.errors?.[name];
          const fieldState = error 
            ? { error } 
            : {};
          return render({ 
            field: {
              ...fieldProps.field,
              name,
            },
            fieldState,
            formState: form?.formState || {}
          });
        }}
      />
    </FormFieldContext.Provider>
  );
}

export function FormItem({ children, className }: any) {
  return <div className={className || 'space-y-2'}>{children}</div>;
}

export function FormLabel({ children, ...props }: any) {
  // Get field name from context to use as htmlFor
  const fieldContext = React.useContext(FormFieldContext);
  const htmlFor = fieldContext.name;
  return <label htmlFor={htmlFor} {...props}>{children}</label>;
}

export function FormControl({ children }: any) {
  // Get field name from context to use as id
  const fieldContext = React.useContext(FormFieldContext);
  const fieldId = fieldContext.name;
  
  // Clone children and add id if it's an input/textarea/select
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as any;
      // If child doesn't have id, use field name
      if (!childProps.id && fieldId) {
        return React.cloneElement(child, { id: fieldId, ...childProps });
      }
    }
    return child;
  });
}

export function FormDescription({ children }: any) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function FormMessage({ name, ...props }: any) {
  // Try to get error from form context and FormField context
  const form = useFormContext();
  const fieldContext = React.useContext(FormFieldContext);
  const fieldName = name || fieldContext.name || props.field?.name;
  
  if (!fieldName || !form) {
    return null;
  }
  
  const error = form.formState?.errors?.[fieldName];
  
  if (error) {
    let errorMessage: string | undefined;
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = error.message as string;
    }
    if (errorMessage) {
      return <p className="text-sm text-destructive" role="alert">{errorMessage}</p>;
    }
  }
  
  return null;
}

