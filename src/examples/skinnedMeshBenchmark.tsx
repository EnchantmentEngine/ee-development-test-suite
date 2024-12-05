import React, { useEffect } from 'react'

import { getMutableState } from '@ir-engine/hyperflux'

import { useWorldNetwork } from '@ir-engine/client-core/src/common/services/LocationInstanceConnectionService'
import { useFind } from '@ir-engine/common'
import { avatarPath } from '@ir-engine/common/src/schema.type.module'
import { AnimationState } from '@ir-engine/engine/src/avatar/AnimationManager'
import { CreateSkinnedMeshGrid } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'

export default function AvatarBenchmarking() {
  const network = useWorldNetwork()
  const avatarList = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  useEffect(() => {
    getMutableState(AnimationState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (network?.ready.value && avatarList.data.length > 0) {
      CreateSkinnedMeshGrid([...avatarList.data], 64)
    }
  }, [network?.ready, avatarList.data.length])

  return <Template />
}
