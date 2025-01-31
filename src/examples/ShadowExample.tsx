import { Entity, UUIDComponent, getComponent, setComponent } from '@ir-engine/ecs'
import { RenderSettingsComponent } from '@ir-engine/engine/src/scene/components/RenderSettingsComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import {
  DirectionalLightComponent,
  PointLightComponent,
  SpotLightComponent,
  TransformComponent
} from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect } from 'react'
import { BoxGeometry, Color, Euler, Mesh, MeshLambertMaterial, Quaternion, Vector3 } from 'three'
import { useExampleEntity } from './utils/common/entityUtils'

export default function ShadowExampleEntry(props: { sceneEntity: Entity }) {
  const settingsEntity = useExampleEntity(props.sceneEntity)
  const platformEntity = useExampleEntity(props.sceneEntity)
  const boxEntity = useExampleEntity(props.sceneEntity)
  const directionalLightEntity = useExampleEntity(props.sceneEntity)
  const spotLightEntity = useExampleEntity(props.sceneEntity)
  const pointLightEntity = useExampleEntity(props.sceneEntity)

  useEffect(() => {
    setComponent(settingsEntity, RenderSettingsComponent, {
      primaryLight: getComponent(directionalLightEntity, UUIDComponent)
    }) // required for CSM
    setComponent(platformEntity, TransformComponent, {
      position: new Vector3(0, -0.5, 0),
      scale: new Vector3(10, 0.1, 10)
    })
    setComponent(platformEntity, VisibleComponent)
    setComponent(platformEntity, NameComponent, 'Platform')
    setComponent(platformEntity, MeshComponent, new Mesh(new BoxGeometry(), new MeshLambertMaterial()))
    setComponent(platformEntity, ShadowComponent, { cast: false })

    setComponent(boxEntity, TransformComponent, { position: new Vector3(0, 0.5, 0) })
    setComponent(boxEntity, VisibleComponent)
    setComponent(boxEntity, NameComponent, 'Box')
    setComponent(boxEntity, MeshComponent, new Mesh(new BoxGeometry(), new MeshLambertMaterial()))
    setComponent(boxEntity, ShadowComponent, { receive: false })

    setComponent(directionalLightEntity, TransformComponent, {
      position: new Vector3(1, 2, -3),
      rotation: new Quaternion().setFromEuler(
        new Euler().setFromVector3(new Vector3(Math.PI * 0.5, -Math.PI * 0.25).normalize())
      )
    })
    setComponent(directionalLightEntity, NameComponent, 'Directional Light')
    setComponent(directionalLightEntity, VisibleComponent)
    setComponent(directionalLightEntity, DirectionalLightComponent, {
      intensity: 0.5,
      castShadow: true,
      color: new Color('cyan')
    })
    setComponent(directionalLightEntity, ShadowComponent, { receive: false })

    setComponent(spotLightEntity, TransformComponent, {
      position: new Vector3(1, 2, 2),
      rotation: new Quaternion().setFromEuler(
        new Euler().setFromVector3(new Vector3(Math.PI * 0.75, -Math.PI * 0.1, 0))
      )
    })
    setComponent(spotLightEntity, NameComponent, 'Spot Light')
    setComponent(spotLightEntity, VisibleComponent)
    setComponent(spotLightEntity, SpotLightComponent, {
      castShadow: true,
      decay: 1,
      range: 10,
      intensity: 10,
      color: new Color('green')
    })

    setComponent(pointLightEntity, TransformComponent, { position: new Vector3(0, 2, -2) })
    setComponent(pointLightEntity, NameComponent, 'Point Light')
    setComponent(pointLightEntity, VisibleComponent)
    setComponent(pointLightEntity, PointLightComponent, {
      castShadow: true,
      decay: 2,
      range: 5,
      intensity: 10,
      color: new Color('red')
    })
  }, [])

  return <></>
}
