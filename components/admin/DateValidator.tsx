'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DateValidatorProps {
  currentDates: { start: string; end: string };
  parentDates: { start: string; end: string };
  level: 'sub-project' | 'task';
  onValidationChange: (isValid: boolean, message: string) => void;
}

export default function DateValidator({
  currentDates,
  parentDates,
  level,
  onValidationChange,
}: DateValidatorProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    message: string;
    suggestedDates?: { start: string; end: string };
  }>({ isValid: true, message: '' });

  useEffect(() => {
    validateDates();
  }, [currentDates, parentDates]);

  const validateDates = () => {
    if (
      !currentDates.start ||
      !currentDates.end ||
      !parentDates.start ||
      !parentDates.end
    ) {
      setValidation({ isValid: true, message: '' });
      onValidationChange(true, '');
      return;
    }

    const currentStart = new Date(currentDates.start);
    const currentEnd = new Date(currentDates.end);
    const parentStart = new Date(parentDates.start);
    const parentEnd = new Date(parentDates.end);

    // Tarih kontrolü
    if (currentStart < parentStart || currentEnd > parentEnd) {
      const message = `${level === 'sub-project' ? 'Alt proje' : 'Görev'} tarihleri ${
        level === 'sub-project' ? 'ana proje' : 'alt proje'
      } tarihleri dışında olamaz.`;

      setValidation({
        isValid: false,
        message,
        suggestedDates: {
          start: parentDates.start,
          end: parentDates.end,
        },
      });
      onValidationChange(false, message);
    } else {
      setValidation({ isValid: true, message: 'Tarihler geçerli' });
      onValidationChange(true, 'Tarihler geçerli');
    }
  };

  const applySuggestedDates = () => {
    if (validation.suggestedDates) {
      // Bu fonksiyon parent component'ten gelecek
      // onApplySuggested?.(validation.suggestedDates);
    }
  };

  if (!currentDates.start || !currentDates.end) {
    return null;
  }

  return (
    <div className='mt-4'>
      {validation.isValid ? (
        <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <span className='text-sm text-green-700'>{validation.message}</span>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <AlertTriangle className='h-4 w-4 text-red-600' />
            <span className='text-sm text-red-700'>{validation.message}</span>
          </div>

          {validation.suggestedDates && (
            <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Info className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium text-blue-700'>
                  Önerilen Tarihler:
                </span>
              </div>
              <div className='text-sm text-blue-600'>
                {validation.suggestedDates.start} -{' '}
                {validation.suggestedDates.end}
              </div>
              <button
                onClick={applySuggestedDates}
                className='mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium'
              >
                Önerilen tarihleri uygula
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
