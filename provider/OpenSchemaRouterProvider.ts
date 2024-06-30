import { ApplicationService } from '@adonisjs/core/types'

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import OpenSchemaGenerator from './OpenSchemaRouterGenerator.js'
import { DecoratorOptions } from './decorators/MethodDecorator.js'

extendZodWithOpenApi(z)

export const routesTree: Map<
  string,
  {
    options: DecoratorOptions | undefined
    routes: any[]
  }
> = new Map()

export default class OpenApi {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('openSchema', () => {
      return new OpenSchemaGenerator()
    })
  }

  async start() {
    const Route = await this.app.container.make('router')

    const routerGenerator = await this.app.container.make('openSchema')
    await routerGenerator.makeSchema(Route, this.app)
  }
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    openSchema: OpenSchemaGenerator
  }
}
