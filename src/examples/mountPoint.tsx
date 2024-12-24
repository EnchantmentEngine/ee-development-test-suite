import { useEffect } from 'react'

import { getMutableState, useMutableState } from '@ir-engine/hyperflux'

import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import {
  EntityTreeComponent,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import {
  InteractableComponent,
  XRUIVisibilityOverride
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { MountPointComponent } from '@ir-engine/engine/src/scene/components/MountPointComponent'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { useRouteScene } from '../sceneRoute'

export default function MountPointEntry() {
  const sceneEntity = useRouteScene('ir-engine/default-project', 'public/scenes/default.gltf')
  useNetwork({ online: false })
  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

  useEffect(() => {
    if (!sceneEntity || !viewerEntity) return

    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)

    const geometryEntity = createEntity()
    setComponent(geometryEntity, UUIDComponent, generateEntityUUID())
    setComponent(geometryEntity, TransformComponent)
    setComponent(geometryEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(geometryEntity, NameComponent, 'Geometry')
    setVisibleComponent(geometryEntity, true)
    addObjectToGroup(geometryEntity, new Mesh(new BoxGeometry(), new MeshStandardMaterial()))

    const entity = createEntity()
    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, TransformComponent, { position: new Vector3(0, 1, 0) })
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(entity, NameComponent, 'Mount-Point-Example')
    setComponent(entity, MountPointComponent)
    setComponent(entity, InteractableComponent, {
      label: 'Sit',
      callbacks: [
        {
          callbackID: MountPointComponent.mountCallbackName,
          target: getComponent(entity, UUIDComponent)
        }
      ],
      uiInteractable: true,
      uiVisibilityOverride: XRUIVisibilityOverride.on,
      activationDistance: 5
    })
    setVisibleComponent(entity, true)

    return () => {
      removeEntity(entity)
      removeEntity(geometryEntity)
    }
  }, [sceneEntity, viewerEntity])
  return null
}
