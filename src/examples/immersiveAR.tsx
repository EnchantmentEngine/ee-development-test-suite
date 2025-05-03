import { MediaIconsBox } from '@ir-engine/client-core/src/components/MediaIconsBox'
import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { EntityTreeComponent, QueryReactor, createEntity, removeEntity, setComponent } from '@ir-engine/ecs'
import { GroundPlaneComponent } from '@ir-engine/engine/src/scene/components/GroundPlaneComponent'
import { getMutableState, getState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { XRDetectedMeshComponent } from '@ir-engine/spatial/src/xr/XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from '@ir-engine/spatial/src/xr/XRDetectedPlaneComponent'
import React from 'react'
import { EmulatorDevtools } from '../devtool/EmulatorDevtools'
import { useRouteScene } from '../sceneRoute'
import { DetectedMeshes, DetectedPlanes } from './XRMeshes'

export default function ImmersiveAR() {
  useRouteScene('ir-engine/default-project', 'public/scenes/apartment.gltf')
  useNetwork({ online: false })
  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

  useImmediateEffect(() => {
    if (!viewerEntity) return
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)

    /** Add ground plane to ensure the avatar never falls out of the world */
    const localFloorEntity = getState(ReferenceSpaceState).localFloorEntity
    const groundPlaneEntity = createEntity()
    setComponent(groundPlaneEntity, EntityTreeComponent, { parentEntity: localFloorEntity })
    setComponent(groundPlaneEntity, TransformComponent)
    setComponent(groundPlaneEntity, GroundPlaneComponent, { visible: false })

    return () => {
      removeEntity(groundPlaneEntity)
    }
  }, [viewerEntity])

  return (
    <>
      <QueryReactor Components={[XRDetectedPlaneComponent]} ChildEntityReactor={DetectedPlanes} />
      <QueryReactor Components={[XRDetectedMeshComponent]} ChildEntityReactor={DetectedMeshes} />
      <MediaIconsBox />
      <div className="flex-grid pointer-events-auto absolute right-0 z-50 flex h-full w-fit flex-col justify-start gap-1.5">
        <EmulatorDevtools mode="immersive-ar" />
      </div>
    </>
  )
}
