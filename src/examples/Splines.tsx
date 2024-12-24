import React, { useEffect } from 'react'

import { Engine, EntityTreeComponent, EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@ir-engine/engine/src/scene/components/SplineTrackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { BoxGeometry, Mesh, MeshBasicMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'
import { Template } from './utils/template'

const createSpline = (index = 0) => {
  const entity = createEntity()

  setComponent(entity, TransformComponent)
  setComponent(entity, UUIDComponent, `Spline: ${index}` as EntityUUID)
  setComponent(entity, NameComponent, `Spline: ${index}`)
  setComponent(entity, VisibleComponent)

  setComponent(entity, SplineComponent, {
    elements: [
      {
        position: new Vector3(0, index * 5, 0),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0)
      },
      {
        position: new Vector3(10, index * 5, 0),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
      },
      {
        position: new Vector3(10, index * 5, 10),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI)
      },
      {
        position: new Vector3(0, index * 5, 10),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI * 1.5)
      }
    ]
  })
}

export default function Splines() {
  useEffect(() => {
    const trackEntity = createEntity()
    setComponent(trackEntity, NameComponent, `Track`)
    setComponent(trackEntity, VisibleComponent)
    setComponent(trackEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
    const mesh = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({ color: 0xff00ff }))
    const pointerMesh = new Mesh(new BoxGeometry(1, 1, 2), new MeshBasicMaterial({ color: 0x0000ff }))
    pointerMesh.translateZ(1)
    mesh.add(pointerMesh)
    addObjectToGroup(trackEntity, mesh)

    for (const i of [0, 1, 2, 3]) {
      createSpline(i)
    }

    setComponent(trackEntity, SplineTrackComponent, {
      splineEntityUUID: `Spline: 0` as EntityUUID,
      velocity: 5
    })

    setInterval(() => {
      const spline = Math.floor(Math.random() * 4)
      setComponent(trackEntity, SplineTrackComponent, {
        splineEntityUUID: `Spline: ${spline}` as EntityUUID
      })
    }, 5000)
  }, [])

  return (
    <>
      <Template />
    </>
  )
}
