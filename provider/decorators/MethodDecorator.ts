import { z } from 'zod'
import { HttpContext } from '@adonisjs/core/http'
import { validateSchema } from '../validator.js'
import { MiddlewareFn, OneOrMore, ParsedNamedMiddleware } from '@adonisjs/core/types/http'

type HttpMethods = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'

export type DecoratorOptions = {
  middleware?: (MiddlewareFn | ParsedNamedMiddleware)[]
  operationId?: string
}

export function Decorator(
  type: HttpMethods,
  pattern: string,
  responseSchema: z.ZodType,
  options?: DecoratorOptions
): any {
  return function decorate(target: any, key: string, descriptor: PropertyDescriptor) {
    const paramsMetadata = Reflect.getMetadata(`params`, target, key)
    const queryMetadata = Reflect.getMetadata(`query`, target, key)
    const bodyMetadata = Reflect.getMetadata(`body`, target, key)

    // Metadata for adonis routing generator
    Reflect.defineMetadata(
      'route',
      {
        type: type,
        pattern: pattern === '/' ? '' : pattern,
        operationId: options?.operationId ?? key,
        options,
        paramsMetadata,
        bodyMetadata,
        queryMetadata,
        response: responseSchema,
      },
      target,
      key
    )

    // Validation for Request,Response in Controller method
    const original = descriptor.value

    descriptor.value = async function (...args: any): Promise<ReturnType<typeof original>> {
      const { request } = args[0] as HttpContext

      if (paramsMetadata) {
        args[paramsMetadata.index] = await validateSchema(paramsMetadata.schema, request.params())
      }

      if (queryMetadata) {
        args[queryMetadata.index] = await validateSchema(queryMetadata.schema, request.qs())
      }

      if (bodyMetadata) {
        args[bodyMetadata.index] = await validateSchema(bodyMetadata.schema, request.body())
      }

      const result = await original.apply(this, args)
      return validateSchema(responseSchema, result)
    }

    // Bind method to instance, because DI is lost in method if e.g this.someService is called
    const wrap = descriptor.value
    descriptor.value = function (...args: any) {
      return wrap.apply(this, args)
    }
  }
}

export function POST(pattern: string, responseSchema: z.ZodType, options?: DecoratorOptions): any {
  return Decorator('POST', pattern, responseSchema, options)
}

export function GET(pattern: string, responseSchema: z.ZodType, options?: DecoratorOptions): any {
  return Decorator('GET', pattern, responseSchema, options)
}

export function PATCH(pattern: string, responseSchema: z.ZodType, options?: DecoratorOptions): any {
  return Decorator('PATCH', pattern, responseSchema, options)
}

export function PUT(pattern: string, responseSchema: z.ZodType, options?: DecoratorOptions): any {
  return Decorator('PUT', pattern, responseSchema, options)
}

export function DELETE(
  pattern: string,
  responseSchema: z.ZodType,
  options?: DecoratorOptions
): any {
  return Decorator('DELETE', pattern, responseSchema, options)
}
