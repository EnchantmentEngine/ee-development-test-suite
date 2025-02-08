import { Vector3 } from 'three'

import { createEntity } from '@ir-engine/ecs'
import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

export const createPhysicsObjects = (count: number) => {
  const entities = [] as Entity[]
  for (let i = 0; i < count; i++) {
    entities.push(createPhysicsObject())
  }
  return entities
}

export const createPhysicsObject = () => {
  const entity = createEntity()
  setComponent(entity, TransformComponent, {
    position: new Vector3(2.5 - Math.random() * 5, 1 + Math.random() * 5, 2.5 - Math.random() * 5),
    scale: new Vector3().setScalar(0.1)
  })
  setComponent(entity, ColliderComponent, {
    shape: 'sphere',
    friction: 10,
    restitution: 1,
    collisionLayer: CollisionGroups.Default,
    collisionMask: DefaultCollisionMask
  })
  setComponent(entity, RigidBodyComponent, {
    type: 'dynamic',
    canSleep: false
  })
  return entity
}
