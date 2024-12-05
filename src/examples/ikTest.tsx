import React, { useEffect } from 'react'

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { useWorldNetwork } from '@ir-engine/client-core/src/common/services/LocationInstanceConnectionService'
import { useFind } from '@ir-engine/common'
import { avatarPath } from '@ir-engine/common/src/schema.type.module'
import { AnimationState } from '@ir-engine/engine/src/avatar/AnimationManager'
import { mockIKAvatars } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'

export default function avatarIkTesting() {
  const network = useWorldNetwork()
  const avatarList = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })
  const created = useHookstate(false)

  useEffect(() => {
    getMutableState(AnimationState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (network?.ready?.value && avatarList.data.length > 0 && !created.value) {
      created.set(true)
      const data = [...avatarList.data]
      mockIKAvatars(data, 5)
    }
  }, [network?.ready, avatarList.data.length])

  return <Template />
}
