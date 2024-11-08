import React, { useEffect } from 'react'
import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three'

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { XRLightProbeState } from '@ir-engine/spatial/src/xr/XRLightProbeSystem'

import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Template } from './utils/template'

export const LightProbe = () => {
  const xrLightProbeState = useHookstate(getMutableState(XRLightProbeState))

  useEffect(() => {
    if (!xrLightProbeState.value) return

    const entity = createEntity()

    const ballGeometry = new SphereGeometry(0.5, 32, 32)
    const ballMaterial = new MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0,
      metalness: 1
    })
    const ballMesh = new Mesh(ballGeometry, ballMaterial)

    addObjectToGroup(entity, ballMesh)
    getComponent(entity, TransformComponent).position.set(0, 2, 0)
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'Light Estimation Helper')
    return () => {
      removeEntity(entity)
    }
  }, [xrLightProbeState])

  return null
}

export default function XRLightEstimation() {
  return (
    <>
      <Template />
      <LightProbe />
    </>
  )
}
