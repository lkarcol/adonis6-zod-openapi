import { z } from 'zod'
import { registry } from '../../provider/OpenApi.js'
import { HttpContext } from '@adonisjs/core/http'
import { validateSchema } from '../../provider/validator.js'

type HttpMethods = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'

export function Decorator(type: HttpMethods, pattern: string, responseSchema: z.ZodType): any {
  return function decorate(target: any, key: string, descriptor: PropertyDescriptor) {
    const paramsMetadata = Reflect.getMetadata(`params`, target, key)
    const queryMetadata = Reflect.getMetadata(`query`, target, key)
    const bodyMetadata = Reflect.getMetadata(`body`, target, key)

    // Register path for OPEN API generation
    registry.registerPath({
      method: type.toLowerCase() as any,
      path: pattern.replace(/:([a-zA-Z0-9_]+)/g, '{$1}'),
      request: {
        ...(paramsMetadata?.schema && { params: paramsMetadata.schema }),
        ...(queryMetadata?.schema && { query: queryMetadata.schema }),
        ...(bodyMetadata?.schema && { query: bodyMetadata.schema }),
      },
      responses: {
        200: {
          description: '',
          content: {
            'application/json': {
              schema: responseSchema,
            },
          },
        },
        204: {
          description: 'No content - successful operation',
        },
      },
    })

    // Metadata for adonis routing generator in RouterGenerator
    Reflect.defineMetadata(
      'route',
      {
        type: type,
        pattern,
        response: responseSchema,
      },
      target,
      key
    )

    // Validation for Request,Response in Controller method
    const original = descriptor.value

    descriptor.value = async (...args: any): Promise<ReturnType<typeof original>> => {
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

      const result = await original(...args)
      return validateSchema(responseSchema, result)
    }
  }
}

export function POST(pattern: string, responseSchema: z.ZodType): any {
  return Decorator('POST', pattern, responseSchema)
}

export function GET(pattern: string, responseSchema: z.ZodType): any {
  return Decorator('GET', pattern, responseSchema)
}

export function PATCH(pattern: string, responseSchema: z.ZodType): any {
  return Decorator('PATCH', pattern, responseSchema)
}

export function PUT(pattern: string, responseSchema: z.ZodType): any {
  return Decorator('PATCH', pattern, responseSchema)
}

export function DELETE(pattern: string, responseSchema: z.ZodType): any {
  return Decorator('DELETE', pattern, responseSchema)
}
