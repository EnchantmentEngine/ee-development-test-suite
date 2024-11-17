import React, { useEffect } from 'react'
import { useDrop } from 'react-dnd'

import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { DndWrapper } from '@ir-engine/editor/src/components/dnd/DndWrapper'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'

import { Engine, Entity, EntityUUID, UUIDComponent, createEntity, removeEntity } from '@ir-engine/ecs'

import config from '@ir-engine/common/src/config'
import { SupportedFileTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { GLTFAssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { DirectionalLightComponent, TransformComponent } from '@ir-engine/spatial'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Color, Euler, Quaternion, Vector3 } from 'three'
export const metadata = {
  title: 'GLTF',
  description: ''
}

const loadOldModel = false
const defaultSource = config.client.fileServer + '/projects/default-project/assets/apartment.glb'
// const defaultSource = config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Duck/basic/Duck.gltf'
// const defaultSource = config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Duck/binary/Duck.glb'
// const defaultSource = config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Duck/draco/Duck.gltf'
// const defaultSource = config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Duck/embedded/Duck.gltf'
// const defaultSource = config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Duck/quantized/Duck.gltf'
// const defaultSource = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/UnlitTest/glTF-Binary/UnlitTest.glb'

const GLTF = () => {
  const filenames = useHookstate<string[]>([])

  const source = useHookstate(defaultSource)

  useEffect(() => {
    /** just for testing parity with old gltf loader */
    let modelEntity: Entity | undefined
    if (loadOldModel) {
      modelEntity = createEntity()
      setComponent(modelEntity, UUIDComponent, 'gltf viewer' as EntityUUID)
      setComponent(modelEntity, NameComponent, '3D Preview Entity')
      setComponent(modelEntity, TransformComponent, { position: new Vector3(3, 0, 0) })
      setComponent(modelEntity, SourceComponent, 'gltf viewer-' + source.value)
      setComponent(modelEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
      setComponent(modelEntity, VisibleComponent, true)
      setComponent(modelEntity, ModelComponent, { src: source.value })
      setComponent(modelEntity, SceneComponent)
    }

    const entity = createEntity()
    setComponent(entity, UUIDComponent, 'directional light' as EntityUUID)
    setComponent(entity, NameComponent, 'Directional Light')
    setComponent(entity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, DirectionalLightComponent, { color: new Color('white'), intensity: 1 })

    const ret = GLTFAssetState.loadScene(source.value, source.value)
    return () => {
      if (modelEntity) removeEntity(modelEntity)
      removeEntity(entity)
      ret()
    }
  }, [source])

  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    // GLTF and GLB files seem to only come through as Native Files for this
    accept: [...SupportedFileTypes],
    async drop(item: any, monitor) {
      if (item.files) {
        const dndItem = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())
        try {
          const files = (await Promise.all(
            entries.map((entry) => new Promise((resolve, reject) => entry.file(resolve, reject)))
          )) as File[]
          filenames.set(files.map((file) => file.name))

          const gltfFile = files[0]
          source.set(URL.createObjectURL(gltfFile))

          console.log(gltfFile)
        } catch (err) {
          console.error(err)
        }
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isUploaded: !monitor.getItem()?.files
    })
  })

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: 'white',
        fontSize: '20px',
        position: 'relative',
        color: 'black'
      }}
      ref={onDropTarget}
    >
      Drag and drop GLTF files here!
      {filenames.value.map((filename, i) => (
        <div key={filename + i}> - {filename}</div>
      ))}
    </div>
  )
}

export default function GLTFViewer() {
  useEffect(() => {
    const bgColor = document.body.style.backgroundColor
    document.body.style.backgroundColor = 'gray'
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
    const entity = Engine.instance.viewerEntity
    setComponent(entity, CameraOrbitComponent)
    setComponent(entity, InputComponent)
    getComponent(entity, CameraComponent).position.set(0, 3, 4)

    return () => {
      document.body.style.backgroundColor = bgColor
    }
  }, [])

  return (
    <div
      id="dnd-container"
      style={{
        height: '25%',
        width: '25%',
        pointerEvents: 'all',
        position: 'absolute',
        zIndex: 1000,
        right: 0,
        top: 0
      }}
    >
      <DndWrapper id="dnd-container">
        <GLTF />
      </DndWrapper>
    </div>
  )
}
