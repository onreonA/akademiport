/**
 * Field Selection Utilities
 *
 * Allows clients to specify which fields to return in API responses
 * Reduces response size and improves performance
 */

export interface FieldSelectionOptions {
  /**
   * Comma-separated list of fields to include
   * Example: "id,name,email"
   */
  fields?: string;

  /**
   * Comma-separated list of fields to exclude
   * Example: "password,secret"
   */
  exclude?: string;

  /**
   * Default fields to include if none specified
   */
  defaultFields?: string[];

  /**
   * Fields that are always included (cannot be excluded)
   */
  requiredFields?: string[];

  /**
   * Fields that are never included (cannot be requested)
   */
  forbiddenFields?: string[];
}

/**
 * Parse field selection from query parameter
 */
export function parseFieldSelection(
  fieldsParam?: string | null,
  options: FieldSelectionOptions = {}
): string[] {
  const { defaultFields = [], requiredFields = [], forbiddenFields = [] } = options;

  // If no fields specified, use defaults
  if (!fieldsParam) {
    return [...requiredFields, ...defaultFields].filter(
      (field) => !forbiddenFields.includes(field)
    );
  }

  // Parse comma-separated fields
  const requestedFields = fieldsParam
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  // Combine requested fields with required fields
  const allFields = [...new Set([...requiredFields, ...requestedFields])];

  // Remove forbidden fields
  return allFields.filter((field) => !forbiddenFields.includes(field));
}

/**
 * Filter object to include only selected fields
 */
export function selectFields<T extends Record<string, any>>(obj: T, fields: string[]): Partial<T> {
  if (fields.length === 0) {
    return obj;
  }

  const result: Partial<T> = {};

  for (const field of fields) {
    // Support nested fields with dot notation (e.g., "user.name")
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (obj[parent] && typeof obj[parent] === 'object') {
        if (!result[parent]) {
          result[parent] = {} as T[Extract<keyof T, string>];
        }
        (result[parent] as any)[child] = (obj[parent] as any)[child];
      }
    } else if (field in obj) {
      result[field as keyof T] = obj[field];
    }
  }

  return result;
}

/**
 * Filter array of objects to include only selected fields
 */
export function selectFieldsFromArray<T extends Record<string, any>>(
  items: T[],
  fields: string[]
): Partial<T>[] {
  return items.map((item) => selectFields(item, fields));
}

/**
 * Apply field selection to response data
 */
export function applyFieldSelection<T extends Record<string, any>>(
  data: T | T[],
  fieldsParam?: string | null,
  options: FieldSelectionOptions = {}
): Partial<T> | Partial<T>[] {
  const fields = parseFieldSelection(fieldsParam, options);

  if (Array.isArray(data)) {
    return selectFieldsFromArray(data, fields);
  }

  return selectFields(data, fields);
}

/**
 * Create field selection helper for API routes
 */
export function createFieldSelector(options: FieldSelectionOptions = {}) {
  return {
    parse: (fieldsParam?: string | null) => parseFieldSelection(fieldsParam, options),
    select: <T extends Record<string, any>>(data: T | T[], fieldsParam?: string | null) =>
      applyFieldSelection(data, fieldsParam, options),
  };
}
