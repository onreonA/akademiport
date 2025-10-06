'use client';
import { useEffect, useState } from 'react';

interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'date'
    | 'number';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
}

interface SmartFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  className?: string;
}

export default function SmartForm({
  fields,
  onSubmit,
  onCancel,
  submitLabel = 'Kaydet',
  cancelLabel = 'İptal',
  loading = false,
  autoSave = false,
  autoSaveDelay = 2000,
  className = '',
}: SmartFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
  }, [fields]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty) {
      const timer = setTimeout(() => {
        // Auto-save logic here
        // Auto-save implementation
      }, autoSaveDelay);

      return () => clearTimeout(timer);
    }
  }, [formData, isDirty, autoSave, autoSaveDelay]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} gereklidir`;
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation;

      if (min !== undefined && value && value.length < min) {
        return message || `${field.label} en az ${min} karakter olmalıdır`;
      }

      if (max !== undefined && value && value.length > max) {
        return message || `${field.label} en fazla ${max} karakter olmalıdır`;
      }

      if (pattern && value && !new RegExp(pattern).test(value)) {
        return message || `${field.label} formatı geçersizdir`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    setIsDirty(true);

    // Real-time validation
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && errors[field.name];
    const fieldId = `field-${field.name}`;

    const baseClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      hasError
        ? 'border-red-300 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseClasses}
          />
        );

      case 'select':
        return (
          <select
            id={fieldId}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            required={field.required}
            className={baseClasses}
          >
            <option value=''>Seçiniz...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type='date'
            id={fieldId}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            required={field.required}
            className={baseClasses}
          />
        );

      case 'number':
        return (
          <input
            type='number'
            id={fieldId}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseClasses}
          />
        );

      default:
        return (
          <input
            type={field.type}
            id={fieldId}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map(field => (
        <div key={field.name}>
          <label
            htmlFor={`field-${field.name}`}
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            {field.label}
            {field.required && <span className='text-red-500 ml-1'>*</span>}
          </label>
          {renderField(field)}
          {touched[field.name] && errors[field.name] && (
            <p className='mt-1 text-sm text-red-600'>{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className='flex items-center justify-end space-x-3 pt-4 border-t border-gray-200'>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
          >
            {cancelLabel}
          </button>
        )}
        <button
          type='submit'
          disabled={loading || !isDirty}
          className='px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {loading ? (
            <span className='flex items-center'>
              <i className='ri-loader-4-line animate-spin mr-2'></i>
              Kaydediliyor...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
