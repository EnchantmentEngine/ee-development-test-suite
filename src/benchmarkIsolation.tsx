import '@ir-engine/client/src/engine'

import {
  createEntity,
  Entity,
  EntityID,
  EntityTreeComponent,
  removeEntity,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { GeometryType } from '@ir-engine/engine/src/scene/constants/GeometryTypeEnum'
import { getState, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { destroySpatialEngine, initializeSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import React, { useEffect, useRef } from 'react'
import { MathUtils, Vector3 } from 'three'

import '@ir-engine/engine'

import Debug from '@ir-engine/client-core/src/components/Debug'
import '@ir-engine/client-core/src/world/LocationModule'
import { ReferenceSpaceState } from '@ir-engine/spatial'

const spawnMesh = () => {
  const entity = createEntity()

  const position = new Vector3(MathUtils.randFloat(-10, 10), MathUtils.randFloat(0, 5), MathUtils.randFloat(-10, 10))

  const scale = new Vector3(MathUtils.randFloat(0.5, 2), MathUtils.randFloat(0.5, 2), MathUtils.randFloat(0.5, 2))

  setComponent(entity, NameComponent, `Spawned Mesh ${entity}`)
  setComponent(entity, TransformComponent, { position, scale })
  setComponent(entity, VisibleComponent)
  setComponent(entity, UUIDComponent, { entitySourceID: 'benchmark' as SourceID, entityID: `${entity}` as EntityID })
  setComponent(entity, PrimitiveGeometryComponent, { geometryType: GeometryType.BoxGeometry })
  const parentEntity = getState(ReferenceSpaceState).originEntity
  setComponent(entity, EntityTreeComponent, { parentEntity })

  return entity
}

export const HomePage = (): any => {
  const ref = useRef(document.body)
  const spawnedCount = useHookstate(0)

  useImmediateEffect(() => {
    initializeSpatialEngine()
    return () => {
      destroySpatialEngine()
    }
  }, [])

  useEngineCanvas(ref)

  useEffect(() => {
    const count = spawnedCount.value
    if (count === 0) return

    const entities: Entity[] = []
    for (let i = 0; i < count; i++) {
      entities.push(spawnMesh())
    }

    return () => {
      entities.forEach(removeEntity)
    }
  }, [spawnedCount.value])

  const handleSpawn100 = () => {
    spawnedCount.set(100)
  }

  const handleSpawn1000 = () => {
    spawnedCount.set(1000)
  }

  const handleSpawn5000 = () => {
    spawnedCount.set(5000)
  }

  const handleRemoveAll = () => {
    spawnedCount.set(0)
  }

  return (
    <div className="pointer-events-auto fixed left-5 top-5 z-[1000] flex flex-col gap-2.5 rounded-lg bg-black/80 p-5 font-sans text-white">
      <h3 className="m-0 mb-2.5">Mesh Spawning Benchmark</h3>
      <div className="mb-2.5">Current count: {spawnedCount.value}</div>
      <button
        onClick={handleSpawn100}
        className="cursor-pointer rounded border-none bg-green-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-green-600"
      >
        Spawn 100 Meshes
      </button>
      <button
        onClick={handleSpawn1000}
        className="cursor-pointer rounded border-none bg-blue-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-blue-600"
      >
        Spawn 1000 Meshes
      </button>
      <button
        onClick={handleSpawn5000}
        className="cursor-pointer rounded border-none bg-orange-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-orange-600"
      >
        Spawn 5000 Meshes
      </button>
      <button
        onClick={handleRemoveAll}
        className="cursor-pointer rounded border-none bg-red-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-red-600"
      >
        Remove All Entities
      </button>
      <Debug />
    </div>
  )
}

export default HomePage
