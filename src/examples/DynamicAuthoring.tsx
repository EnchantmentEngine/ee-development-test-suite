import {
  Entity,
  Layers,
  QueryReactor,
  UUIDComponent,
  getAuthoringCounterpart,
  loadEntitiesIntoAuthoring,
  unloadEntitiesFromAuthoring,
  useQuery
} from '@ir-engine/ecs'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getState } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React, { useCallback } from 'react'

export default function DynamicAuthoring() {
  // invoke authoring state
  getState(AuthoringState)

  return (
    <>
      <div className="pointer-events-auto left-0 z-50 overflow-y-auto">
        <QueryReactor Components={[GLTFComponent]} ChildEntityReactor={SourceLoaded} />
      </div>
    </>
  )
}

const SourceLoaded = (props: { entity: Entity }) => {
  const loaded = GLTFComponent.useSceneLoaded(props.entity)
  if (!loaded) return null
  return <SelectEditReactor entity={props.entity} />
}

/**
 * Contains a button and name of the entity to select and edit it.
 */
const SelectEditReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const isInAuthoring = !!getAuthoringCounterpart(entity)

  useQuery([UUIDComponent], Layers.Authoring) // trigger rerender

  // Handle loading entity into authoring
  const handleLoadIntoAuthoring = useCallback(() => {
    try {
      const source = GLTFComponent.getSourceID(entity)
      const entities = UUIDComponent.getEntitiesBySource(source, Layers.Simulation)
      loadEntitiesIntoAuthoring([entity, ...entities])
      console.log('Loaded entities into authoring:', [entity, ...entities])
    } catch (error) {
      console.error('Failed to load entity into authoring:', error)
    }
  }, [])

  // Handle unloading entity from authoring
  const handleUnloadFromAuthoring = useCallback(() => {
    try {
      const authoringEntity = getAuthoringCounterpart(entity)
      const source = GLTFComponent.getSourceID(authoringEntity)
      const entities = UUIDComponent.getEntitiesBySource(source, Layers.Authoring)
      unloadEntitiesFromAuthoring([authoringEntity, ...entities])
      console.log('Unloaded entities from authoring:', [authoringEntity, ...entities])
    } catch (error) {
      console.error('Failed to unload entity from authoring:', error)
    }
  }, [])

  return (
    <div className="flex flex-col gap-2 rounded border border-ui-outline p-2">
      <div className="text-sm font-medium">Entity ID: {entity}</div>
      <div className="flex gap-2">
        {isInAuthoring ? (
          <Button onClick={handleUnloadFromAuthoring} variant="red" size="sm">
            Unload from Authoring
          </Button>
        ) : (
          <Button onClick={handleLoadIntoAuthoring} variant="primary" size="sm">
            Load into Authoring
          </Button>
        )}
      </div>
    </div>
  )
}
