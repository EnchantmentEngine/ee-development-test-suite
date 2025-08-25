import { Entity, getComponent, removeEntity, setComponent } from '@ir-engine/ecs'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { GeometryType } from '@ir-engine/engine/src/scene/constants/GeometryTypeEnum'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { Group, MathUtils, Vector3 } from 'three'
import { setupEntity } from '../../examples/utils/common/entityUtils'

const objectsToCreate = 60
const waitTimeBetween = 200
const simulateTime = 3000

const scale = new Vector3(0.5, 0.5, 0.5)

const createPhysicsEntity = (rootEntity: Entity) => {
  const entity = setupEntity(rootEntity)

  const position = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent).position.clone()
  position.setZ(position.z - 7.0)
  position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
  const obj3d = new Group()
  obj3d.entity = entity
  setComponent(entity, ObjectComponent, obj3d)
  setComponent(entity, TransformComponent, { position, scale })
  setComponent(entity, PrimitiveGeometryComponent, {
    geometryType: GeometryType.SphereGeometry,
    geometryParams: {
      radius: 1,
      widthSegments: 32,
      heightSegments: 16,
      phiStart: 0,
      phiLength: 6.283185307179586,
      thetaStart: 0,
      thetaLength: 3.141592653589793
    }
  })
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, RigidBodyComponent, { type: 'dynamic' })
  setComponent(entity, ColliderComponent, {
    shape: 'sphere',
    mass: MathUtils.randFloat(0.5, 1.5),
    friction: MathUtils.randFloat(0.1, 1.0),
    restitution: MathUtils.randFloat(0.1, 1.0)
  })

  return entity
}

export const PhysicsBenchmark = (props: { rootEntity: Entity; onComplete: () => void }): null => {
  const { rootEntity, onComplete } = props

  useEffect(() => {
    if (!rootEntity) return

    let running = true
    const entities = [] as Entity[]
    let createdObjects = 0

    const spawnObject = () => {
      if (!running) return
      createdObjects += 1
      if (createdObjects <= objectsToCreate) {
        const entity = createPhysicsEntity(rootEntity)
        entities.push(entity)
        setTimeout(spawnObject, waitTimeBetween)
      } else {
        setTimeout(() => {
          onComplete()
        }, simulateTime)
      }
    }
    spawnObject()

    return () => {
      running = false
      for (const entity of entities) {
        removeEntity(entity)
      }
    }
  }, [rootEntity])

  return null
}
