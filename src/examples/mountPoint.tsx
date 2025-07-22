import { useEffect } from 'react'

import { getMutableState, useMutableState } from '@ir-engine/hyperflux'

import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import {
  EntityID,
  EntityTreeComponent,
  UUIDComponent,
  createEntity,
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
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { CylinderGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { useRouteScene } from '../sceneRoute'

export default function MountPointEntry() {
  const sceneEntity = useRouteScene('EnchantmentEngine/default-project', 'public/scenes/default.gltf')
  useNetwork({ online: false })
  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

  useEffect(() => {
    if (!sceneEntity || !viewerEntity) return

    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)

    const geometryEntity = createEntity()
    const sceneSourceID = getComponent(sceneEntity, UUIDComponent).entitySourceID
    setComponent(geometryEntity, UUIDComponent, {
      entitySourceID: sceneSourceID,
      entityID: 'geometry' as EntityID
    })
    setComponent(geometryEntity, TransformComponent, {
      position: new Vector3(2, 0.25, 2),
      scale: new Vector3(0.25, 0.5, 0.25)
    })
    setComponent(geometryEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(geometryEntity, NameComponent, 'Geometry')
    setVisibleComponent(geometryEntity, true)
    setComponent(geometryEntity, MeshComponent, new Mesh(new CylinderGeometry(), new MeshStandardMaterial()))

    const entity = UUIDComponent.create(sceneEntity)
    setComponent(entity, TransformComponent, { position: new Vector3(2, 0.4, 2) })
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(entity, NameComponent, 'Mount-Point-Example')
    setComponent(entity, MountPointComponent)
    setComponent(entity, InteractableComponent, {
      label: 'Sit',
      callbacks: [
        {
          callbackID: MountPointComponent.mountCallbackName,
          target: getComponent(entity, UUIDComponent).entityID
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
