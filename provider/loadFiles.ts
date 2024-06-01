import * as fs from 'node:fs'
import * as path from 'node:path'

export async function loadFiles(folderPath: string) {
  const resolvers: Function[] = []

  const files = await fs.promises.readdir(folderPath)

  for (const file of files) {
    const filePath = path.join(folderPath, file)

    const isDirectory = (await fs.promises.stat(filePath)).isDirectory()

    if (isDirectory) {
      resolvers.push(...(await loadFiles(filePath)))
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      const resolverModule = await import(filePath)

      if (resolverModule.default) {
        resolvers.push(resolverModule.default)
      }
    }
  }

  return resolvers
}
