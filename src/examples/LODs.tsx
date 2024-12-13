import React, { useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three'

import { uploadToFeathersService } from '@ir-engine/client-core/src/util/upload'
import { AdminAssetUploadArgumentsType } from '@ir-engine/common/src/interfaces/UploadAssetInterface'
import { createEntity } from '@ir-engine/ecs'
import {
  getComponent,
  removeComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { DndWrapper } from '@ir-engine/editor/src/components/dnd/DndWrapper'
import { SupportedFileTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { Heuristic, VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import config from '@ir-engine/common/src/config'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { GroupComponent, addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { Template } from './utils/template'

// create rings for each LOD
const visualizeVariants = () => {
  const entity = createEntity()
  setComponent(entity, TransformComponent)
  setComponent(entity, VisibleComponent)
  setComponent(entity, NameComponent, 'LOD Visualizer')
  return entity
}

const setVariant = (entity: Entity, result: Array<{ url: string; metadata: Record<string, any> }>) => {
  setComponent(entity, ModelComponent, {
    src: result[0].url
  })
  setComponent(entity, VariantComponent, {
    levels: result.map((variant, i) => ({
      distance: (i + 1) * 5,
      loaded: false,
      src: variant.url,
      model: null,
      metadata: variant.metadata ?? {
        minDistance: 0 + i * 5,
        maxDistance: 0 + (i + 1) * 5
      }
    })),
    heuristic: Heuristic.DISTANCE
  })
}

const LODsDND = () => {
  const filenames = useHookstate<string[]>([])

  const entity = useHookstate(createEntity).value
  const visualizerEntity = useHookstate(visualizeVariants).value
  const variantComponent = useOptionalComponent(entity, VariantComponent)

  useEffect(() => {
    setComponent(entity, TransformComponent, { position: new Vector3(0, 0, -2) })
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'LOD Test')

    const fileServerURL = config.client.fileServer!

    setVariant(entity, [
      {
        url: `${fileServerURL}/projects/ir-engine/ir-development-test-suite/assets/LOD/Test_LOD0.glb`,
        metadata: {
          minDistance: 0,
          maxDistance: 5
        }
      },
      {
        url: `${fileServerURL}/projects/ir-engine/ir-development-test-suite/assets/LOD/Test_LOD1.glb`,
        metadata: {
          minDistance: 5,
          maxDistance: 10
        }
      },
      {
        url: `${fileServerURL}/projects/ir-engine/ir-development-test-suite/assets/LOD/Test_LOD2.glb`,
        metadata: {
          minDistance: 10,
          maxDistance: 15
        }
      }
    ])

    filenames.set(['Test_LOD0.glb', 'Test_LOD1.glb', 'Test_LOD2.glb'])
  }, [])

  useEffect(() => {
    if (!variantComponent) return
    getComponent(visualizerEntity, TransformComponent).position.copy(getComponent(entity, TransformComponent).position)
    variantComponent.value.levels.map((level, i) => {
      if (i === 0) return
      addObjectToGroup(
        visualizerEntity,
        new Mesh(
          new SphereGeometry(level.metadata['minDistance'], 32, 32).rotateX(Math.PI / 2),
          new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 })
        )
      )
    })
    return () => {
      removeComponent(visualizerEntity, GroupComponent)
    }
  }, [variantComponent])

  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    accept: [...SupportedFileTypes, '.glb'],
    async drop(item: any, monitor) {
      if (item.files) {
        const dndItem = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())
        try {
          const files = (await Promise.all(
            entries.map((entry) => new Promise((resolve, reject) => entry.file(resolve, reject)))
          )) as File[]
          filenames.set(files.map((file) => file.name))

          const result = await uploadToFeathersService('upload-asset', files, {
            type: 'admin-file-upload',
            args: {
              project: 'ir-engine/ir-development-test-suite'
            } as AdminAssetUploadArgumentsType,
            variants: true
          }).promise

          setVariant(entity, result)

          console.log(result)
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
    <div style={{ height: '100%', width: '100%', background: 'white', fontSize: '20px' }} ref={onDropTarget}>
      Drag and drop LOD files here!
      {filenames.value.map((filename, i) => (
        <div key={filename + i}> - {filename}</div>
      ))}
    </div>
  )
}

export default function LODs() {
  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <DndWrapper id="dnd-container">
        <Template />
        <LODsDND />
      </DndWrapper>
    </div>
  )
}
