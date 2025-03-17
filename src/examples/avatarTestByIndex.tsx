import { useEffect } from 'react'

import { NO_PROXY } from '@ir-engine/hyperflux'

import { useWorldNetwork } from '@ir-engine/client-core/src/common/services/LocationInstanceConnectionService'
import { AvatarType } from '@ir-engine/common/src/schema.type.module'
import { useRandomAvatarData } from '../engine/TestUtils'
import { useRouteScene } from '../sceneRoute'
import {
  mockIKAvatars,
  mockLoopAnimAvatars,
  mockNetworkAvatars,
  mockTPoseAvatars
} from './utils/avatar/loadAvatarHelpers'

export default function AvatarBenchmarking() {
  const network = useWorldNetwork()
  const sceneEntity = useRouteScene()
  const avatarData = useRandomAvatarData()

  useEffect(() => {
    if (!sceneEntity || !network?.ready?.value || !avatarData.value) return

    const avatar = avatarData.get(NO_PROXY) as AvatarType

    mockNetworkAvatars([avatar])
    mockIKAvatars([avatar])
    mockLoopAnimAvatars([avatar])
    mockTPoseAvatars([avatar])

    return () => {
      // @todo clean up entities
    }
  }, [network?.ready, avatarData, sceneEntity])

  return null
}
