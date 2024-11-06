import config from '@ir-engine/common/src/config'
import {
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getMutableComponent,
  hasComponent,
  setComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import '@ir-engine/ir-bot/src/functions/BotHookSystem'
import { AmbientLightComponent, TransformComponent } from '@ir-engine/spatial'
import { AssetPreviewCameraComponent } from '@ir-engine/spatial/src/camera/components/AssetPreviewCameraComponent'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  EntityTreeComponent,
  removeEntityNodeRecursively
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect, useRef } from 'react'

let count = 0

const useScene = (canvas: React.MutableRefObject<HTMLCanvasElement>) => {
  const canvasRef = useHookstate(canvas.current)

  const panelState = useHookstate(() => {
    const cameraEntity = createEntity()
    setComponent(cameraEntity, CameraComponent)
    setComponent(cameraEntity, TransformComponent)
    setComponent(cameraEntity, VisibleComponent)
    setComponent(cameraEntity, CameraOrbitComponent, { refocus: true })
    setComponent(cameraEntity, InputComponent)
    setComponent(cameraEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })

    return {
      cameraEntity
    }
  })

  useEffect(() => {
    const { cameraEntity } = panelState.value
    return () => {
      // cleanup entities and state associated with this 3d panel
      removeEntityNodeRecursively(cameraEntity)
    }
  }, [])

  useEffect(() => {
    if (!canvas.current || canvasRef.value === canvas.current) return
    canvasRef.set(canvas.current)

    const { cameraEntity } = panelState.value

    setComponent(cameraEntity, NameComponent, '3D Preview Camera for ' + count)
    setComponent(cameraEntity, UUIDComponent, ('3D Preview Camera for ' + count) as EntityUUID)

    count++

    if (hasComponent(cameraEntity, RendererComponent)) return

    setComponent(cameraEntity, RendererComponent, {
      canvas: canvasRef.value as HTMLCanvasElement,
      scenes: []
    })
  }, [canvas.current])

  return panelState.value
}

export default function MultipleCanvasCameras() {
  const sceneEntity = useHookstate(() => {
    const sceneEntity = createEntity()
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, (uuid + '-scene') as EntityUUID)
    setComponent(sceneEntity, TransformComponent)
    setComponent(sceneEntity, VisibleComponent)
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(sceneEntity, SceneComponent)

    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })

    return sceneEntity
  }).value

  const canvasRef1 = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const canvasRef2 = useRef() as React.MutableRefObject<HTMLCanvasElement>

  const panel1State = useScene(canvasRef1)
  const panel2State = useScene(canvasRef2)

  useEffect(() => {
    const camera1Entity = panel1State.cameraEntity
    const camera2Entity = panel2State.cameraEntity
    const modelEntity = createEntity()
    setComponent(modelEntity, UUIDComponent, generateEntityUUID())
    setComponent(modelEntity, TransformComponent)
    setComponent(modelEntity, VisibleComponent)
    setComponent(modelEntity, NameComponent, 'Model Entity 1')
    setComponent(modelEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(modelEntity, GLTFComponent, {
      src: config.client.fileServer + '/projects/ir-engine/default-project/public/scenes/sky-station.gltf'
    })
    setComponent(camera1Entity, AssetPreviewCameraComponent, { targetModelEntity: modelEntity })
    setComponent(camera2Entity, AssetPreviewCameraComponent, { targetModelEntity: modelEntity })

    getMutableComponent(camera1Entity, RendererComponent).scenes.merge([sceneEntity])
    getMutableComponent(camera2Entity, RendererComponent).scenes.merge([sceneEntity])

    return () => {
      removeEntityNodeRecursively(sceneEntity)
    }
  }, [])

  return (
    <>
      <div className="grid h-full w-full grid-cols-2">
        {/* ensure the canvases are constained to half the width of the parent and take up the full height of the parent*/}
        <div>
          <canvas ref={canvasRef1} className="pointer-events-auto" />
        </div>
        <div>
          <canvas ref={canvasRef2} className="pointer-events-auto" />
        </div>
      </div>
    </>
  )
}
