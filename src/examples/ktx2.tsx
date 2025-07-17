import React, { useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { SRGBColorSpace, Texture } from 'three'

import { DndWrapper } from '@ir-engine/editor/src/components/dnd/DndWrapper'
import { SupportedFileTypes } from '@ir-engine/editor/src/constants/AssetTypes'

import { getState } from '@ir-engine/hyperflux'
import { KTX2LoaderState } from '@ir-engine/spatial/src/resources/loaders/ktx2/KTX2LoaderState'
import { Template } from './utils/template'

let mesh

const KTX2DND = () => {
  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    accept: [...SupportedFileTypes, '.ktx2'],
    async drop(item: any, monitor) {
      let file
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())
        try {
          file = await new Promise((resolve, reject) => entries[0].file(resolve, reject))
        } catch (err) {
          console.error(err)
        }
      }

      if (file.name.endsWith('.ktx2')) {
        const url = URL.createObjectURL(file)
        const ktxLoader = getState(KTX2LoaderState)
        if (!ktxLoader) throw new Error('KTX2Loader not yet initialized')
        ktxLoader.load(
          url,
          (texture) => {
            console.log('KTX2Loader loaded texture', texture)
            texture.colorSpace = SRGBColorSpace
            texture.needsUpdate = true
            mesh.material.map = texture
            mesh.material.needsUpdate = true
          },
          () => {},
          () => {}
        )
        return
      }

      const reader = new FileReader()
      reader.addEventListener('load', function (event) {
        function imgCallback(event) {
          const texture = new Texture(event.target)
          texture.colorSpace = SRGBColorSpace
          texture.needsUpdate = true
          mesh.material.map = texture
          mesh.material.needsUpdate = true
        }

        const img = new Image()
        img.onload = imgCallback
        img.src = event.target!.result! as string
      })

      reader.readAsDataURL(file)
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isUploaded: !monitor.getItem()?.files
    })
  })

  return (
    <div style={{ height: '100%', width: '100%', background: 'white' }} ref={onDropTarget}>
      Drag and drop textures here!
    </div>
  )
}

export default function KTX2() {
  useEffect(() => {
    // mesh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ side: DoubleSide }))
    // mesh.position.y += 1
    // mesh.updateMatrixWorld(true)
    // Engine.instance.scene.add(mesh)
  }, [])

  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <DndWrapper id="dnd-container">
        <Template />
        <KTX2DND />
      </DndWrapper>
    </div>
  )
}
