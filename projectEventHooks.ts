import { ProjectEventHooks } from '@ir-engine/projects/ProjectConfigInterface'
import { Application } from '@ir-engine/server-core/declarations'
import { patchStaticResourceAsAvatar, supportedAvatars } from '@ir-engine/server-core/src/user/avatar/avatar-helper'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import manifestJson from './manifest.json'

const projectRelativeFolder = path.resolve(appRootPath.path, 'packages/projects')
const avatarsFolder = path.join(appRootPath.path, 'packages/projects/projects', manifestJson.name, 'public/avatars')

const config = {
  onInstall: async (app: Application) => {
    await app.service('route-activate').create({ project: manifestJson.name, route: '/examples', activate: true })
    await app.service('route-activate').create({ project: manifestJson.name, route: '/benchmarks', activate: true })
    await app.service('route-activate').create({ project: manifestJson.name, route: '/benchmarksAll', activate: true })
    await app
      .service('route-activate')
      .create({ project: manifestJson.name, route: '/benchmarkIsolation', activate: true })

    await Promise.all(
      fs
        .readdirSync(avatarsFolder)
        .filter((file) => supportedAvatars.includes(file.split('.').pop()!))
        .map((file) =>
          patchStaticResourceAsAvatar(
            app,
            manifestJson.name,
            path.resolve(avatarsFolder, file).replace(projectRelativeFolder + '/', '')
          )
        )
    )
  }
} as ProjectEventHooks

export default config
