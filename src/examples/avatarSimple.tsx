import { GLTF } from '@gltf-transform/core'
import { dispatchAction, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Cache, Color, Euler, Quaternion } from 'three'

import { useFind } from '@ir-engine/common'
import { AvatarID, avatarPath } from '@ir-engine/common/src/schema.type.module'
import {
  Engine,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  getMutableComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GLTFAssetState, GLTFSourceState } from '@ir-engine/engine/src/gltf/GLTFState'
import { AmbientLightComponent, DirectionalLightComponent, TransformComponent } from '@ir-engine/spatial'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

// create scene with a rigidbody loaded offset from the origin
const createSceneGLTF = (id: string): GLTF.IGLTF => ({
  asset: {
    version: '2.0',
    generator: 'iR Engine'
  },
  scenes: [{ nodes: [0] }],
  scene: 0,
  nodes: [
    {
      name: 'Ground Plane',
      extensions: {
        EE_uuid: 'ground-plane',
        EE_visible: true,
        EE_ground_plane: {}
      }
    }
  ],
  extensionsUsed: ['EE_uuid', 'EE_visible', 'EE_ground_plane']
})

export default function AvatarSimpleEntry() {
  const entity = useHookstate(UndefinedEntity)
  const gltfComponent = useOptionalComponent(entity.value, GLTFComponent)
  const avatars = useFind(avatarPath)

  useEffect(() => {
    const lightEntity = createEntity()
    setComponent(lightEntity, UUIDComponent, 'directional light' as EntityUUID)
    setComponent(lightEntity, NameComponent, 'Directional Light')
    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
    setComponent(lightEntity, VisibleComponent, true)
    setComponent(lightEntity, DirectionalLightComponent, { color: new Color('white'), intensity: 0.5 })
    setComponent(lightEntity, AmbientLightComponent, { color: new Color('white'), intensity: 0.5 })

    const sceneID = `scene`
    const gltf = createSceneGLTF(sceneID)

    const sceneURL = `/${sceneID}.gltf`

    Cache.add(sceneURL, gltf)

    const gltfEntity = GLTFSourceState.load(sceneURL, sceneURL as EntityUUID)
    getMutableComponent(Engine.instance.viewerEntity, RendererComponent).scenes.merge([gltfEntity])
    setComponent(gltfEntity, SceneComponent)
    getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)

    entity.set(gltfEntity)

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    }
  }, [])

  useEffect(() => {
    if (!avatars.data.length || gltfComponent?.progress?.value !== 100) return

    const parentUUID = getComponent(entity.value, UUIDComponent)
    const entityUUID = Engine.instance.userID
    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID,
        avatarURL: avatars.data.find((avatar) => avatar.modelResource?.key.endsWith('.vrm'))!.id as AvatarID,
        entityUUID: (entityUUID + '_avatar') as EntityUUID,
        name: 'avatar'
      })
    )
  }, [gltfComponent?.progress?.value, avatars.data.length])

  return null
}
