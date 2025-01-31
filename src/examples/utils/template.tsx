import React, { useEffect } from 'react'

import { ARPlacement } from '@ir-engine/client-core/src/components/ARPlacement'
import { MediaIconsBox } from '@ir-engine/client-core/src/components/MediaIconsBox'
import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { XRLoading } from '@ir-engine/client-core/src/components/XRLoading'
import { AvatarService } from '@ir-engine/client-core/src/user/services/AvatarService'

import './avatar/simulateMovement'

export function useSpawnAvatar(spawnAvatar?: boolean) {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (spawnAvatar) {
      url.searchParams.delete('spectate')
    } else {
      url.searchParams.set('spectate', '')
    }
    window.history.pushState({}, '', url.toString())
  }, [spawnAvatar])
}

export function Template(props: { projectName?: string; sceneName?: string; spawnAvatar?: boolean }) {
  useSpawnAvatar(props.spawnAvatar)
  useLoadScene({
    projectName: props.projectName ?? 'ir-engine/default-project',
    sceneName: props.sceneName ?? 'public/scenes/default.gltf'
  })
  useNetwork({ online: false })

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  return (
    <>
      <div style={{ pointerEvents: 'all' }}>
        <ARPlacement />
        <XRLoading />
        <MediaIconsBox />
      </div>
    </>
  )
}
