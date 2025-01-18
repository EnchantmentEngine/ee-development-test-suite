import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { Entity, removeEntity, useOptionalComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getMutableState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import '@ir-engine/ir-bot/src/functions/BotHookSystem'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import React, { useEffect } from 'react'
import { useRouteScene } from '../sceneRoute'
import { createPhysicsEntity } from './multipleScenes'

export default function PhysicsDynamicObjects() {
  const sceneEntity = useRouteScene('ir-engine/default-project', 'public/scenes/default.gltf')!
  useNetwork({ online: false })
  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

  useImmediateEffect(() => {
    if (!viewerEntity) return
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
  }, [viewerEntity])

  const gltfComponent = useOptionalComponent(sceneEntity, GLTFComponent)

  useEffect(() => {
    if (gltfComponent?.progress?.value !== 100) return
    const entities = [] as Entity[]
    for (let i = 0; i < 100; i++) {
      entities.push(createPhysicsEntity(sceneEntity))
    }
    return () => {
      for (const entity of entities) {
        removeEntity(entity)
      }
    }
  }, [gltfComponent?.progress?.value])

  return <></>
}
