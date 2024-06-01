import { z } from 'zod'

function DecorateMethod(type: 'params' | 'body' | 'query', schema: z.ZodType) {
  return function decorate(target: any, key: string, index: number) {
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
  return DecorateMethod('params', schema)
}

export function Body(schema: z.ZodType): any {
  return DecorateMethod('body', schema)
}

export function Query(schema: z.ZodType): any {
  return DecorateMethod('query', schema)
}
