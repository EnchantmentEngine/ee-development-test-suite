import { MediaIconsBox } from '@ir-engine/client-core/src/components/MediaIconsBox'
import { XRLoading } from '@ir-engine/client-core/src/components/XRLoading'
import { Engine, EntityTreeComponent, setComponent } from '@ir-engine/ecs'
import { loadEmptyScene } from '@ir-engine/engine/tests/util/loadEmptyScene'
import { getMutableState } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'
import { Color } from 'three'

export default function WebXR() {
  useEffect(() => {
    getMutableState(RendererState).gridVisibility.set(true)
    const sceneEntity = loadEmptyScene()!
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
    setComponent(sceneEntity, BackgroundComponent, new Color('black'))
    setComponent(Engine.instance.viewerEntity, CameraOrbitComponent)
  }, [])

  return (
    <>
      <div style={{ pointerEvents: 'all' }}>
        <XRLoading />
        <MediaIconsBox />
      </div>
    </>
  )
}
