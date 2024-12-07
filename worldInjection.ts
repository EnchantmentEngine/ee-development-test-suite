import { isClient } from '@ir-engine/common/src/utils/getEnvironment'

export default async function () {
  if (isClient) {
    /** @todo import this in the routes themselves */
    // await import('./src/engine/Register')
  }
}
