import { routesTree } from '../OpenSchemaRouterProvider.js'
import { DecoratorOptions } from './MethodDecorator.js'

export function Resource(pattern: string, options?: DecoratorOptions): any {
  return function decorate(target: any, key: string, descriptor: PropertyDescriptor) {
    // Metadata for adonis routing generator in RouterGenerator

    Reflect.defineMetadata(
      'group',
      {
        options,
        pattern,
      },
      target,
      key
    )

    const routes = Object.getOwnPropertyNames(target.prototype)
      .filter((prop) => typeof target.prototype[prop] === 'function')
      .map((method) => {
        const routeMetadata = Reflect.getMetadata('route', target.prototype, method)

        return { method, routeMetadata, controllerClass: target }
      })
      .filter(({ routeMetadata }) => routeMetadata)

    if (routesTree.has(pattern)) {
      const d = routesTree.get(pattern)!
      d.options = options
      d.routes.push(...routes)
    } else {
      routesTree.set(pattern, {
        options,
        routes: routes,
      })
    }
  }
}
