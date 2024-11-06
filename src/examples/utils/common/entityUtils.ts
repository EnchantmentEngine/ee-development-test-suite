import { Entity, UUIDComponent, createEntity, generateEntityUUID, removeEntity, setComponent } from '@ir-engine/ecs'
import { useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'

export const setupEntity = (parent: Entity): Entity => {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, generateEntityUUID())
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  // const sceneID = getComponent(parent, SourceComponent)
  // setComponent(entity, SourceComponent, sceneID)

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
