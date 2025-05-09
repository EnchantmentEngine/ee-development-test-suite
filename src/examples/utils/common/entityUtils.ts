import {
  Entity,
  EntityTreeComponent,
  getAncestorWithComponents,
  removeEntity,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { useEffect } from 'react'

export const setupEntity = (parent: Entity): Entity => {
  const sourceEntity = getAncestorWithComponents(parent, [GLTFComponent])
  const entity = UUIDComponent.create(sourceEntity)
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

export const useExampleEntity = (parent: Entity): Entity => {
  const exampleEntity = useHookstate(() => setupEntity(parent))

  useEffect(() => {
    return () => {
      removeEntity(exampleEntity.value)
    }
  }, [])

  return exampleEntity.value
}
