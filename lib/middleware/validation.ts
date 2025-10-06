// =====================================================
// VALIDATION MIDDLEWARE
// =====================================================
// Request validation için middleware
import { NextRequest } from 'next/server';

import { AppError } from './error-handler';
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'email'
    | 'uuid'
    | 'date'
    | 'array'
    | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}
export interface ValidationSchema {
  body?: ValidationRule[];
  query?: ValidationRule[];
  params?: ValidationRule[];
}
/**
 * Validation middleware
 */
export function validateRequest(schema: ValidationSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      try {
        // Body validation
        if (schema.body && request.method !== 'GET') {
          const body = await request.json();
          const bodyErrors = validateFields(body, schema.body, 'body');
          if (bodyErrors.length > 0) {
            throw new AppError(
              'Request body validation failed',
              400,
              'VALIDATION_ERROR',
              bodyErrors
            );
          }
        }
        // Query validation
        if (schema.query) {
          const searchParams = new URL(request.url).searchParams;
          const query: any = {};
          searchParams.forEach((value, key) => {
            query[key] = value;
          });
          const queryErrors = validateFields(query, schema.query, 'query');
          if (queryErrors.length > 0) {
            throw new AppError(
              'Query parameters validation failed',
              400,
              'VALIDATION_ERROR',
              queryErrors
            );
          }
        }
        // Params validation
        if (schema.params && args.length > 0) {
          const params = args[0];
          const paramsErrors = validateFields(params, schema.params, 'params');
          if (paramsErrors.length > 0) {
            throw new AppError(
              'URL parameters validation failed',
              400,
              'VALIDATION_ERROR',
              paramsErrors
            );
          }
        }
        return await originalMethod.call(this, request, ...args);
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }
    };
    return descriptor;
  };
}
/**
 * Alanları validate et
 */
function validateFields(
  data: any,
  rules: ValidationRule[],
  source: string
): any[] {
  const errors: any[] = [];
  for (const rule of rules) {
    const value = data[rule.field];
    const fieldErrors = validateField(value, rule, source);
    errors.push(...fieldErrors);
  }
  return errors;
}
/**
 * Tek alanı validate et
 */
function validateField(
  value: any,
  rule: ValidationRule,
  source: string
): any[] {
  const errors: any[] = [];
  const {
    field,
    required,
    type,
    minLength,
    maxLength,
    min,
    max,
    pattern,
    enum: enumValues,
    custom,
  } = rule;
  // Required kontrolü
  if (required && (value === undefined || value === null || value === '')) {
    errors.push({
      field,
      source,
      message: `${field} is required`,
      code: 'REQUIRED_FIELD',
    });
    return errors; // Required field yoksa diğer kontrollere gerek yok
  }
  // Value yoksa ve required değilse, validation'ı geç
  if (value === undefined || value === null || value === '') {
    return errors;
  }
  // Type kontrolü
  if (type) {
    const typeError = validateType(value, type, field, source);
    if (typeError) {
      errors.push(typeError);
      return errors; // Type yanlışsa diğer kontrollere gerek yok
    }
  }
  // String kontrolleri
  if (type === 'string' || typeof value === 'string') {
    if (minLength !== undefined && value.length < minLength) {
      errors.push({
        field,
        source,
        message: `${field} must be at least ${minLength} characters long`,
        code: 'MIN_LENGTH',
      });
    }
    if (maxLength !== undefined && value.length > maxLength) {
      errors.push({
        field,
        source,
        message: `${field} must be at most ${maxLength} characters long`,
        code: 'MAX_LENGTH',
      });
    }
    if (pattern && !pattern.test(value)) {
      errors.push({
        field,
        source,
        message: `${field} format is invalid`,
        code: 'INVALID_FORMAT',
      });
    }
  }
  // Number kontrolleri
  if (type === 'number' || typeof value === 'number') {
    if (min !== undefined && value < min) {
      errors.push({
        field,
        source,
        message: `${field} must be at least ${min}`,
        code: 'MIN_VALUE',
      });
    }
    if (max !== undefined && value > max) {
      errors.push({
        field,
        source,
        message: `${field} must be at most ${max}`,
        code: 'MAX_VALUE',
      });
    }
  }
  // Enum kontrolü
  if (enumValues && !enumValues.includes(value)) {
    errors.push({
      field,
      source,
      message: `${field} must be one of: ${enumValues.join(', ')}`,
      code: 'INVALID_ENUM',
    });
  }
  // Custom validation
  if (custom) {
    const customResult = custom(value);
    if (customResult !== true) {
      errors.push({
        field,
        source,
        message:
          typeof customResult === 'string'
            ? customResult
            : `${field} is invalid`,
        code: 'CUSTOM_VALIDATION',
      });
    }
  }
  return errors;
}
/**
 * Type validation
 */
function validateType(
  value: any,
  expectedType: string,
  field: string,
  source: string
): any | null {
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return {
          field,
          source,
          message: `${field} must be a string`,
          code: 'INVALID_TYPE',
        };
      }
      break;
    case 'number':
      if (typeof value !== 'number' && isNaN(Number(value))) {
        return {
          field,
          source,
          message: `${field} must be a number`,
          code: 'INVALID_TYPE',
        };
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return {
          field,
          source,
          message: `${field} must be a boolean`,
          code: 'INVALID_TYPE',
        };
      }
      break;
    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return {
          field,
          source,
          message: `${field} must be a valid email address`,
          code: 'INVALID_EMAIL',
        };
      }
      break;
    case 'uuid':
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(value)) {
        return {
          field,
          source,
          message: `${field} must be a valid UUID`,
          code: 'INVALID_UUID',
        };
      }
      break;
    case 'date':
      if (isNaN(Date.parse(value))) {
        return {
          field,
          source,
          message: `${field} must be a valid date`,
          code: 'INVALID_DATE',
        };
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        return {
          field,
          source,
          message: `${field} must be an array`,
          code: 'INVALID_TYPE',
        };
      }
      break;
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return {
          field,
          source,
          message: `${field} must be an object`,
          code: 'INVALID_TYPE',
        };
      }
      break;
  }
  return null;
}
// Yaygın validation schema'ları
export const CommonSchemas = {
  // UUID parameter
  uuidParam: {
    params: [{ field: 'id', required: true, type: 'uuid' as const }],
  },
  // Pagination query
  pagination: {
    query: [
      { field: 'page', type: 'number' as const, min: 1 },
      { field: 'limit', type: 'number' as const, min: 1, max: 100 },
    ],
  },
  // Email validation
  email: {
    body: [{ field: 'email', required: true, type: 'email' as const }],
  },
  // Password validation
  password: {
    body: [
      {
        field: 'password',
        required: true,
        type: 'string' as const,
        minLength: 6,
        maxLength: 128,
      },
    ],
  },
};
