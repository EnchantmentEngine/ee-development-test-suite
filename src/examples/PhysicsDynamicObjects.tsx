import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { Entity, removeEntity, useOptionalComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getMutableState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import React, { useEffect } from 'react'
import { createPhysicsEntity } from './multipleScenes'

export default function PhysicsDynamicObjects(props: { sceneEntity: Entity }) {
  useNetwork({ online: false })
  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

  useImmediateEffect(() => {
    if (!viewerEntity) return
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
  }, [viewerEntity])

  const gltfComponent = useOptionalComponent(props.sceneEntity, GLTFComponent)

  useEffect(() => {
    if (gltfComponent?.progress !== 100) return
    const entities = [] as Entity[]
    for (let i = 0; i < 1000; i++) {
      entities.push(createPhysicsEntity(props.sceneEntity))
    }
    return () => {
      for (const entity of entities) {
        removeEntity(entity)
      }
    }
  }, [gltfComponent?.progress])

  return <></>
}
