import { z, ZodIssue, ZodType, ZodRawShape } from 'zod'

export async function validateRequest<T extends ZodRawShape>(schema: z.ZodType<T>, request: any) {
  try {
    return (await schema.parseAsync(request)) as z.infer<typeof schema>
  } catch (e) {
    throw new ValidationError(e.errors.map(formatZodError))
  }
}

export async function validateResponse<T>(schema: ZodType<T>, request: object) {
  try {
    return (await schema.parseAsync(request)) as z.infer<typeof schema>
  } catch (e) {
    throw new ValidationError(e.errors.map(formatZodError))
  }
}
export function formatZodError(e: ZodIssue) {
  return {
    field: e.path.join('.'),
    message: e.code,
    rule: e.message.toLowerCase(),
  }
}

export class ValidationError extends Error {
  /**
   * Http status code for the validation error
   */
  status: number = 422

  /**
   * Internal code for handling the validation error
   * exception
   */
  code: string = 'E_VALIDATION_ERROR'

  constructor(
    public messages: any,
    options?: ErrorOptions
  ) {
    super('Validation failure', options)
    const ErrorConstructor = this.constructor as typeof ValidationError
    Error.captureStackTrace(this, ErrorConstructor)
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`
  }
}
