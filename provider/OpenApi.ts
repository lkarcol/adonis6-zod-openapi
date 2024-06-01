import { ApplicationService } from '@adonisjs/core/types'

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import RouterGenerator from './RouterGenerator.js'

extendZodWithOpenApi(z)
export const registry = new OpenAPIRegistry()

export default class OpenApi {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('openapi', () => {
      return new RouterGenerator()
    })
  }

  async start() {
    const Route = await this.app.container.make('router')
    const schema = await this.app.container.make('openapi')
    await schema.makeSchema(Route)

    const generator = new OpenApiGeneratorV3(registry.definitions)

    const document = generator.generateDocument({
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'My API',
        description: 'Billion dolars API ',
      },
      servers: [{ url: 'v1' }],
    })

    Route.get('apidoc', () => document)
  }
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    openapi: RouterGenerator
  }
}
