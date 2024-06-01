import { z } from 'zod'

export function Params(schema: z.ZodType): any {
  return function decorate(target: any, key: string, index: number) {
    Reflect.defineMetadata(
      'params',
      {
        index,
        schema,
      },
      target,
      key
    )
  }
}

export function Body(schema: z.ZodType): any {
  return function decorate(target: any, key: string, index: number) {
    Reflect.defineMetadata(
      'body',
      {
        index,
        schema,
      },
      target,
      key
    )
  }
}

export function Query(schema: z.ZodType): any {
  return function decorate(target: any, key: string, index: number) {
    Reflect.defineMetadata(
      'query',
      {
        index,
        schema,
      },
      target,
      key
    )
  }
}
