import { ApplicationService, HttpRouterService } from '@adonisjs/core/types'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { routesTree } from './OpenSchemaRouterProvider.js'
import { loadFiles } from './loadFiles.js'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

class OpenSchemaRouterGenerator {
  private registry: OpenAPIRegistry = new OpenAPIRegistry()
  private declare router: HttpRouterService

  private operationIds: string[] = []

  async makeSchema(Route: HttpRouterService, app: ApplicationService) {
    this.router = Route

    await loadFiles(join(dirname(fileURLToPath(import.meta.url)), '../app'))

    routesTree.forEach(({ routes, options }, key) => {
      if (key) {
        const g = this.router
          .group(() => {
            this.createRoutesAndSchemaPaths(routes, key)
          })
          .prefix(key)
        if (options?.middleware) {
          g.use(options?.middleware)
        }
      } else {
        this.createRoutesAndSchemaPaths(routes, key)
      }
    })

    this.generateOpenApiSchema()
  }

  private createRoutesAndSchemaPaths(routes: any[], key: string) {
    routes.forEach(({ routeMetadata, method, controllerClass }) => {
      const endpointPath = `${key}${routeMetadata.pattern}`.replace(/:([a-zA-Z0-9_]+)/g, '{$1}')

      this.registerOpenApiPath(endpointPath, routeMetadata)
      const httpMethod: string = routeMetadata.type

      const r = this.router.route(routeMetadata.pattern, [httpMethod], [controllerClass, method])

      if (routeMetadata.options?.middleware) {
        r.use(routeMetadata.options?.middleware)
      }
    })
  }

  private generateOpenApiSchema() {
    const generator = new OpenApiGeneratorV3(this.registry.definitions)

    const document = generator.generateDocument({
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'My API',
        description: 'Billion dolars API ',
      },
      servers: [{ url: 'v1' }],
    })

    this.router.get('apidoc', () => document)
  }

  private registerOpenApiPath(endpointPath: string, routeMetadata: any) {
    const httpMethod = routeMetadata.type
    const paramsMetadata: any = routeMetadata?.paramsMetadata
    const queryMetadata: any = routeMetadata?.queryMetadata
    const bodyMetadata: any = routeMetadata?.bodyMetadata
    const operationId: any = routeMetadata?.operationId
    const responseSchema: any = routeMetadata?.response

    if (this.operationIds.includes(operationId)) {
      throw new Error(
        `${operationId} already exist. Please change method name or use operationId parameter in decorator`
      )
    }
    this.registry.registerPath({
      method: httpMethod.toLowerCase() as any,
      path: endpointPath,
      operationId,
      request: {
        ...(paramsMetadata?.schema && { params: paramsMetadata.schema }),
        ...(queryMetadata?.schema && { query: queryMetadata.schema }),
        ...(bodyMetadata?.schema && {
          body: {
            content: {
              'application/json': {
                schema: bodyMetadata?.schema,
              },
            },
          },
        }),
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

    this.operationIds.push(operationId)
  }
}

export default OpenSchemaRouterGenerator
