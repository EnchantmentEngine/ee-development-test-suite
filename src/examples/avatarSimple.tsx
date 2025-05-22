import { GLTF } from '@gltf-transform/core'
import {
  dispatchAction,
  getMutableState,
  getState,
  none,
  PeerID,
  useHookstate,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Color, Euler, Quaternion, Vector3 } from 'three'

import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useFind } from '@ir-engine/common'
import { avatarPath } from '@ir-engine/common/src/schema.type.module'
import {
  createEntity,
  EntityID,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetState, SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { NetworkActions } from '@ir-engine/hyperflux'
import {
  AmbientLightComponent,
  DirectionalLightComponent,
  ReferenceSpaceState,
  TransformComponent
} from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

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
  const engine = useMutableState(ReferenceSpaceState)
  const renderer = useOptionalComponent(engine.viewerEntity.value, RendererComponent)

  useEffect(() => {
    if (!renderer?.value) return

    const originEntity = getState(ReferenceSpaceState).originEntity
    const originUUID = getComponent(originEntity, UUIDComponent)

    const lightEntity = createEntity()
    setComponent(lightEntity, UUIDComponent, {
      entitySourceID: originUUID.entitySourceID,
      entityID: 'directional light' as EntityID
    })
    setComponent(lightEntity, NameComponent, 'Directional Light')
    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: getState(ReferenceSpaceState).originEntity })
    setComponent(lightEntity, VisibleComponent, true)
    setComponent(lightEntity, DirectionalLightComponent, { color: new Color('white'), intensity: 0.5 })
    setComponent(lightEntity, AmbientLightComponent, { color: new Color('white'), intensity: 0.5 })

    const sceneID = `scene`
    const gltf = createSceneGLTF(sceneID)

    const sceneURL = `/${sceneID}.gltf`

    const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' })
    const blobURL = URL.createObjectURL(blob)

    const gltfEntity = AssetState.load(blobURL, 'scene' as EntityID)
    renderer.scenes.merge([gltfEntity])
    setComponent(gltfEntity, SceneComponent)
    getMutableState(SceneState)[sceneURL].set(gltfEntity)

    entity.set(gltfEntity)

    return () => {
      const idx = renderer.scenes.value.indexOf(gltfEntity)
      renderer.scenes[idx].set(none)
      removeEntity(gltfEntity)
      removeEntity(lightEntity)
    }
  }, [!!renderer?.scenes.value])

  useEffect(() => {
    if (!avatars.data.length || gltfComponent?.progress?.value !== 100) return

    const spread = 25

    const spawnedEntitiyUUIDs = [] as EntityUUID[]
    const peerIndexesCreated = [] as number[]

    for (let i = 0; i < 100; i++) {
      const randomAvatar = avatars.data[Math.floor(Math.random() * avatars.data.length)]
      dispatchAction(
        NetworkActions.peerJoined({
          peerID: ('test peer ' + i) as PeerID,
          peerIndex: i,
          userID: ('test user ' + i) as UserID
        })
      )
      peerIndexesCreated.push(i)
      const parentUUID = UUIDComponent.join(getComponent(entity.value, UUIDComponent))
      dispatchAction(
        AvatarNetworkAction.spawn({
          position: new Vector3((Math.random() - 0.5) * spread, 0, (Math.random() - 0.5) * spread),
          parentUUID: parentUUID,
          avatarURL: randomAvatar.modelResource!.url,
          entitySourceID: getComponent(entity.value, UUIDComponent).entitySourceID,
          entityID: 'avatar' as EntityID,
          name: 'test user ' + i,
          $peer: ('test peer ' + i) as PeerID
        })
      )
      spawnedEntitiyUUIDs.push(('test user ' + i + '_avatar') as EntityUUID)
    }
    return () => {
      for (const uuid of spawnedEntitiyUUIDs) {
        dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID: uuid }))
      }
      for (const peer of peerIndexesCreated) {
        dispatchAction(
          NetworkActions.peerLeft({ peerID: ('test peer ' + peer) as PeerID, userID: ('test user ' + peer) as UserID })
        )
      }
    }
  }, [gltfComponent?.progress?.value, avatars.data.length])

  useNetwork({ online: false })

  return null
}
