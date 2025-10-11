'use client';

import React from 'react';

import { cn, typography } from '@/lib/design-tokens';
import Radio, { type RadioOption } from './Radio';

export interface RadioGroupProps {
  // Label
  label?: string;
  description?: string;

  // Options
  options: RadioOption[];

  // Value & Change
  value?: string;
  onChange?: (value: string) => void;

  // Name (required for radio groups)
  name: string;

  // Validation
  error?: string;
  required?: boolean;

  // Size
  size?: 'sm' | 'md' | 'lg';

  // Layout
  layout?: 'vertical' | 'horizontal';

  // Additional
  containerClassName?: string;
}

/**
 * RadioGroup Component with Design Tokens
 *
 * @example
 * // Basic
 * <RadioGroup
 *   name="plan"
 *   label="Planınızı Seçin"
 *   options={[
 *     { value: 'free', label: 'Ücretsiz' },
 *     { value: 'pro', label: 'Pro', description: '$29/ay' },
 *   ]}
 *   value={plan}
 *   onChange={setPlan}
 * />
 *
 * @example
 * // Horizontal layout
 * <RadioGroup
 *   name="status"
 *   label="Durum"
 *   options={[
 *     { value: 'active', label: 'Aktif' },
 *     { value: 'inactive', label: 'İnaktif' },
 *   ]}
 *   layout="horizontal"
 * />
 *
 * @example
 * // With error
 * <RadioGroup
 *   name="gender"
 *   label="Cinsiyet"
 *   options={genders}
 *   error={errors.gender}
 *   required
 * />
 */
export default function RadioGroup({
  label,
  description,
  options,
  value,
  onChange,
  name,
  error,
  required,
  size = 'md',
  layout = 'vertical',
  containerClassName,
}: RadioGroupProps) {
  const handleChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  return (
    <div className={cn('w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label className={cn('block font-medium text-gray-700 mb-2')}>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className={cn(typography('bodySmall'), 'text-gray-500 mb-3')}>
          {description}
        </p>
      )}

      {/* Radio Options */}
      <div
        className={cn(
          layout === 'vertical' && 'space-y-3',
          layout === 'horizontal' && 'flex flex-wrap gap-4'
        )}
      >
        {options.map(option => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            size={size}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className={cn(typography('bodySmall'), 'text-red-600 mt-2')}>
          {error}
        </p>
      )}
    </div>
  );
}
