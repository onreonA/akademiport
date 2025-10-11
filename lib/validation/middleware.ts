import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * API endpoint'leri için veri doğrulama middleware'i
 *
 * Bu modül, API endpoint'lerinde kullanılan veri doğrulama middleware'lerini içerir.
 * Zod kütüphanesi kullanılarak tip güvenliği ve veri doğrulama sağlanır.
 */

/**
 * Request body'sini doğrulayan middleware
 * @param schema - Zod şeması
 * @returns Middleware fonksiyonu
 */
export function validateBody<T>(schema: z.ZodType<T>) {
  return async (request: NextRequest, next: () => Promise<NextResponse>) => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: result.error.format(),
          },
          { status: 400 }
        );
      }

      // Doğrulanmış veriyi request'e ekle
      (request as any).validatedBody = result.data;

      return next();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Request query parametrelerini doğrulayan middleware
 * @param schema - Zod şeması
 * @returns Middleware fonksiyonu
 */
export function validateQuery<T>(schema: z.ZodType<T>) {
  return async (request: NextRequest, next: () => Promise<NextResponse>) => {
    try {
      const url = new URL(request.url);
      const query: Record<string, any> = {};

      // URL'den query parametrelerini al
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });

      const result = schema.safeParse(query);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: result.error.format(),
          },
          { status: 400 }
        );
      }

      // Doğrulanmış veriyi request'e ekle
      (request as any).validatedQuery = result.data;

      return next();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Request params'ı doğrulayan middleware
 * @param schema - Zod şeması
 * @returns Middleware fonksiyonu
 */
export function validateParams<T>(schema: z.ZodType<T>) {
  return async (
    request: NextRequest,
    params: any,
    next: () => Promise<NextResponse>
  ) => {
    try {
      const result = schema.safeParse(params);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: result.error.format(),
          },
          { status: 400 }
        );
      }

      // Doğrulanmış veriyi request'e ekle
      (request as any).validatedParams = result.data;

      return next();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid path parameters',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * API endpoint'i için veri doğrulama fonksiyonu
 * @param schema - Zod şeması
 * @param data - Doğrulanacak veri
 * @returns Doğrulama sonucu (başarılı/başarısız)
 */
export function validateRequest<T>(schema: z.ZodType<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.error.format(),
      errorMessage: formatZodErrors(result.error),
    };
  }
}

/**
 * Zod hatalarını formatla
 * @param error - Zod hatası
 * @returns Formatlanmış hata mesajı
 */
function formatZodErrors(error: z.ZodError): string {
  return error.errors
    .map(err => {
      const path = err.path.join('.');
      return `${path ? path + ': ' : ''}${err.message}`;
    })
    .join(', ');
}
