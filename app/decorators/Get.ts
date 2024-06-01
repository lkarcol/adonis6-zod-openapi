import { z } from 'zod'
import { Decorator } from './Decorator.js'

export function GET(pattern: string, responseSchema: z.ZodType): any {
  return Decorator('GET', pattern, responseSchema)
}
