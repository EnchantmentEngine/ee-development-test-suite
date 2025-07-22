import config from '@ir-engine/common/src/config'
import { Engine, Entity, getComponent, removeEntity, setComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RenderInfoState } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React, { useEffect } from 'react'
import { MathUtils } from 'three'
import { setupEntity } from './utils/common/entityUtils'

type AssetMetaData = {
  name: string
  endpoint: string
  type: 'image' | 'gltf'
}
const assets: AssetMetaData[] = [
  {
    name: 'Test Image',
    endpoint: '/projects/enchantmentengine/ee-development-test-suite/assets/Images/testImage.jpg',
    type: 'image'
  },
  {
    name: 'Flight Helmet',
    endpoint: '/projects/enchantmentengine/ee-development-test-suite/assets/GLTF/Flight%20Helmet/FlightHelmet.gltf',
    type: 'gltf'
  }
]

const useRendererInfo = () => {
  const renderInfoState = useMutableState(RenderInfoState)
  const renderer = renderInfoState.value

  useEffect(() => {
    renderInfoState.visible.set(true)
    return () => {
      renderInfoState.visible.set(false)
    }
  }, [])

  if (!renderer) return {}
  return {
    calls: renderer.info.calls,
    triangles: renderer.info.triangles,
    geometries: renderer.info.geometries,
    textures: renderer.info.textures,
    programs: renderer.info.programs
  }
}

function getRandomPosition() {
  const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
  position.setZ(position.z - MathUtils.randFloat(4, 14))
  position.setX(position.x + MathUtils.randFloat(-3.0, 3.0))
  position.setY(0)
  return position
}

function createImage(parentEntity: Entity, endpoint: string) {
  const entity = setupEntity(parentEntity)
  const position = getRandomPosition()
  setComponent(entity, ImageComponent, {
    source: config.client.fileServer + endpoint
  })
  setComponent(entity, NameComponent, 'Test Image')
  setVisibleComponent(entity, true)
  getComponent(entity, TransformComponent).position.set(position.x, position.y, position.z)

  return () => {
    removeEntity(entity)
  }
}

function createGLTF(parentEntity: Entity, endpoint: string) {
  const entity = setupEntity(parentEntity)
  const position = getRandomPosition()
  setComponent(entity, NameComponent, 'Test GLTF')
  setComponent(entity, GLTFComponent, {
    cameraOcclusion: true,
    src: config.client.fileServer + endpoint
  })
  setComponent(entity, ShadowComponent, { receive: false })
  setVisibleComponent(entity, true)
  getComponent(entity, TransformComponent).position.set(position.x, position.y, position.z)

  return () => {
    removeEntity(entity)
  }
}

function createAsset(entity: Entity, asset: AssetMetaData): () => void {
  switch (asset.type) {
    case 'image':
      return createImage(entity, asset.endpoint)
    case 'gltf':
      return createGLTF(entity, asset.endpoint)

    default:
      break
  }
  return () => {}
}

const resources = {} as Record<string, (() => void)[]>

function RenderInfoUI() {
  const renderInfo = useRendererInfo()

  return (
    <div className="">
      <h1 className="text-white">Render Info</h1>
      <div className="ml-2">
        {Object.entries(renderInfo).map(([key, value]) => {
          return <div key={key} className="ml-2 text-white">{`${key}: ${value}`}</div>
        })}
      </div>
    </div>
  )
}

export default function ResourceTrackingRoute(props: { sceneEntity: Entity }) {
  useEffect(() => {
    getMutableState(ResourceState).debug.set(true)
    return () => {
      getMutableState(ResourceState).debug.set(false)
    }
  }, [])

  const { sceneEntity } = props
  const buttonContainerClass = 'h-16 px-1.5	py-1 w-2/4'
  const buttonClass = 'h-full w-full basis-2/5 cursor-pointer'
  const resourceState = useMutableState(ResourceState)
  const sortedEntries = Object.entries(resourceState.resources.value).reduce(
    (acc, [key, val]) => {
      if (!acc[val.type]) acc[val.type] = {}
      acc[val.type][key] = val
      return acc
    },
    {} as Record<string, Record<string, any>>
  )

  return (
    <div
      className="absolute right-0 top-0 flex max-h-[95vh] w-1/2 flex-col overflow-y-auto"
      style={{ pointerEvents: 'all', zIndex: 100 }}
    >
      <RenderInfoUI />
      <div>
        <h1 className="text-white">Resources</h1>
        <div className="ml-2">
          {Object.entries(sortedEntries).map(([category, resources]) => {
            return (
              <div key={category} className="text-white">
                <h3>{category}</h3>
                {Object.entries(resources).map(([key, val]) => {
                  return (
                    <div key={key} className="text-white">
                      {`${val.name}: ${getComponent(val.entity, NameComponent)} (${val.entity})`}
                      {/* {`${key}: ${val.references
                        .map((e) =>
                          hasComponent(e, NameComponent) ? `${getComponent(e, NameComponent)} (${e})` : e
                        )
                        .join(', ')}`} */}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <h1 className="text-white">Assets</h1>
        <div className="ml-2">
          {assets.map((asset) => {
            return (
              <div className="flex h-auto w-full" key={asset.endpoint}>
                <div className={buttonContainerClass}>
                  <Button
                    className={buttonClass}
                    onClick={() => {
                      if (!resources[asset.name]) resources[asset.name] = []
                      resources[asset.name].push(createAsset(sceneEntity, asset))
                    }}
                  >{`Create ${asset.name}`}</Button>
                </div>
                <div className={buttonContainerClass}>
                  <Button
                    className={buttonClass}
                    onClick={() => {
                      if (!resources[asset.name]) resources[asset.name] = []
                      resources[asset.name].pop()?.()
                    }}
                  >{`Remove ${asset.name}`}</Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
