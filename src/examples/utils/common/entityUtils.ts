import { Entity, EntityTreeComponent, removeEntity, setComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { useEffect } from 'react'

export const setupEntity = (parent: Entity): Entity => {
  const sourceID = GLTFComponent.getInstanceID(parent)
  const entity = NodeIDComponent.create(sourceID, NodeIDComponent.generate())
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
