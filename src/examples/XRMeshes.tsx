import React, { useEffect } from 'react'
import { BufferGeometry, Mesh, MeshBasicMaterial, MeshNormalMaterial, Vector3 } from 'three'

import { setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { TransformComponent } from '@ir-engine/spatial'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { XRDetectedMeshComponent } from '@ir-engine/spatial/src/xr/XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from '@ir-engine/spatial/src/xr/XRDetectedPlaneComponent'
import { Template } from './utils/template'

const wireframeMaterial = new MeshBasicMaterial({ wireframe: true })
const normalMaterial = new MeshNormalMaterial({ opacity: 0.5, transparent: true })

export const DetectedPlanes = () => {
  const entity = useEntityContext()
  const xrPlane = useComponent(entity, XRDetectedPlaneComponent)

  useEffect(() => {
    if (!xrPlane.geometry.value) return
    const planeName =
      'XR Plane ' + entity + '(' + (xrPlane.plane.value.semanticLabel ?? xrPlane.plane.orientation.value) + ')'
    const geometry = xrPlane.geometry.value as BufferGeometry
    const box = geometry.boundingBox!
    const height = box.max.x - box.min.x
    const width = box.max.z - box.min.z

    /** Create a child entity such that we can have a distinct scale for the collider */

    const meshEntity = createEntity()

    setComponent(meshEntity, NameComponent, planeName + ' Mesh')
    setComponent(meshEntity, EntityTreeComponent, {
      parentEntity: entity
    })
    setComponent(meshEntity, TransformComponent)
    setComponent(meshEntity, VisibleComponent)
    const transparentMesh = new Mesh(xrPlane.geometry.value as BufferGeometry, normalMaterial)
    setComponent(meshEntity, MeshComponent, transparentMesh)

    const colliderEntity = createEntity()
    setComponent(colliderEntity, NameComponent, planeName + ' Collider')
    setComponent(colliderEntity, EntityTreeComponent, {
      parentEntity: entity
    })
    setComponent(colliderEntity, TransformComponent, {
      scale: new Vector3(height, 0.01, width)
    })
    setComponent(colliderEntity, RigidBodyComponent, {
      type: BodyTypes.Fixed
    })
    setComponent(colliderEntity, ColliderComponent, {
      shape: Shapes.Box,
      collisionLayer: CollisionGroups.Ground,
      collisionMask: DefaultCollisionMask
    })
    return () => {
      removeEntity(meshEntity)
      removeEntity(colliderEntity)
    }
  }, [xrPlane.geometry])

  return null
}

export const DetectedMeshes = () => {
  const entity = useEntityContext()

  const xrmesh = useComponent(entity, XRDetectedMeshComponent)

  useEffect(() => {
    if (!xrmesh.geometry.value) return

    const meshName = 'XR Mesh ' + (xrmesh.mesh.value.semanticLabel ?? entity)

    const meshEntity = createEntity()
    setComponent(meshEntity, NameComponent, meshName + ' Mesh')
    setComponent(meshEntity, EntityTreeComponent, {
      parentEntity: entity
    })
    setComponent(meshEntity, TransformComponent)
    setComponent(meshEntity, VisibleComponent)
    const mesh = new Mesh(xrmesh.geometry.value as BufferGeometry, wireframeMaterial)
    setComponent(meshEntity, MeshComponent, mesh)

    const colliderEntity = createEntity()
    setComponent(colliderEntity, NameComponent, meshName + ' Collider')
    setComponent(colliderEntity, EntityTreeComponent, {
      parentEntity: entity
    })
    setComponent(colliderEntity, TransformComponent)
    setComponent(colliderEntity, RigidBodyComponent, {
      type: BodyTypes.Fixed
    })
    setComponent(colliderEntity, ColliderComponent, {
      shape: Shapes.Mesh,
      collisionLayer: CollisionGroups.Ground,
      collisionMask: DefaultCollisionMask
    })
    return () => {
      removeEntity(meshEntity)
      removeEntity(colliderEntity)
    }
  }, [xrmesh.geometry])

  return null
}

export default function XRMeshes() {
  return (
    <>
      <Template />
      <QueryReactor Components={[XRDetectedPlaneComponent]} ChildEntityReactor={DetectedPlanes} />
      <QueryReactor Components={[XRDetectedMeshComponent]} ChildEntityReactor={DetectedMeshes} />
    </>
  )
}
