/**
 * Result Pattern Implementation
 *
 * Bu pattern, fonksiyonların başarı veya hata durumlarını
 * açıkça belirtmesini sağlar. Try-catch yerine kullanılabilir.
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number> {
 *   if (b === 0) {
 *     return Result.fail('Cannot divide by zero');
 *   }
 *   return Result.ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.isSuccess) {
 *   console.log(result.value); // 5
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: Error | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error: Error | null, value: T | null) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;

    // Invariant: Success durumunda value olmalı, Failure durumunda error olmalı
    if (isSuccess && error) {
      throw new Error('Success result cannot have an error');
    }
    if (!isSuccess && !error) {
      throw new Error('Failure result must have an error');
    }

    Object.freeze(this);
  }

  /**
   * Result'ın value'sunu döndürür.
   * Sadece isSuccess === true ise kullanılabilir.
   *
   * @throws Error if result is not successful
   */
  public get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result. Check isSuccess first.');
    }
    return this._value as T;
  }

  /**
   * Başarılı bir Result oluşturur
   */
  public static ok<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  /**
   * Başarısız bir Result oluşturur
   */
  public static fail<U>(error: string | Error): Result<U> {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return new Result<U>(false, errorObj, null);
  }

  /**
   * Birden fazla Result'ı birleştirir.
   * Herhangi biri başarısızsa, ilk hatayı döndürür.
   */
  public static combine<U>(results: Result<U>[]): Result<U[]> {
    const failed = results.find((r) => r.isFailure);
    if (failed) {
      return Result.fail(failed.error!);
    }
    return Result.ok(results.map((r) => r.value));
  }
}

