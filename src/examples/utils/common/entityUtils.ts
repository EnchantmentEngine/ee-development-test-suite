import { Entity, EntityTreeComponent, removeEntity, setComponent, UUIDComponent } from '@ir-engine/ecs'
import { NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { useEffect } from 'react'

export const setupEntity = (parent: Entity): Entity => {
  const entity = NodeIDComponent.create(parent, UUIDComponent.generate())
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
