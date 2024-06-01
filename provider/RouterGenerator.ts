import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HttpRouterService } from '@adonisjs/core/types'
import { loadFiles } from './loadFiles.js'

class RouterGenerator {
  private files: any[] = []
  private routes: any[] = []

  async makeSchema(Route: HttpRouterService) {
    this.files = await this.loadControllers(
      join(dirname(fileURLToPath(import.meta.url)), '../app/controllers')
    )

    const classMethods = this.extractClassMethods()

    classMethods.map(({ methods, controllerClass }) => {
      methods.slice(1).forEach((method) => {
        const methodMetadata = Reflect.getMetadata('route', controllerClass.prototype, method)
        if (methodMetadata) {
          const httpMethod: string = methodMetadata.type
          Route.route(methodMetadata.pattern, [httpMethod], [controllerClass, method])
        }
      })
    })

    return this.routes
  }

  private extractClassMethods() {
    return this.files.map((controllerClass) => {
      return {
        controllerClass,
        methods: Object.getOwnPropertyNames(controllerClass.prototype),
      }
    })
  }

  private async loadControllers(folderPath: string) {
    return await loadFiles(folderPath)
  }
}

export default RouterGenerator
