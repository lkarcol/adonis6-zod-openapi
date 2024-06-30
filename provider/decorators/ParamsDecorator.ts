import { z } from 'zod'

function DecorateMethodParam(type: 'params' | 'body' | 'query', schema: z.ZodType) {
  return function decorateMethodParameter(target: any, key: string, index: number) {
    Reflect.defineMetadata(
      type,
      {
        index,
        schema,
      },
      target,
      key
    )
  }
}

export function Params(schema: z.ZodType): any {
  return DecorateMethodParam('params', schema)
}

export function Body(schema: z.ZodType): any {
  return DecorateMethodParam('body', schema)
}

export function Query(schema: z.ZodType): any {
  return DecorateMethodParam('query', schema)
}
