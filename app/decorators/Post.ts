import { z } from 'zod'
import { Decorator } from './Decorator.js'

export function POST(pattern: string, responseSchema: z.ZodType): any {
  return Decorator('POST', pattern, responseSchema)
}
