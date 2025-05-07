import React, { useEffect } from 'react'

import { useHookstate } from '@ir-engine/hyperflux'

import { useQuery } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import PostProcessingSettingsEditor from '@ir-engine/ui/src/components/editor/properties/postProcessing'
import { useSearchParams } from 'react-router-dom'
import { Template } from './utils/template'

export default function PostProcessing() {
  const entity = useHookstate<Entity | null>(null)
  const [params] = useSearchParams()
  const sceneName = params.get('sceneName')!
  const projectName = params.get('projectName')!
  const postProEnt = useQuery([PostProcessingComponent])

  useEffect(() => {
    if (!postProEnt.length) return
    entity.set(postProEnt[0])
    // EditorControlFunctions.modifyProperty = (entities, component, properties) => {
    //   setComponent(entity.value!, PostProcessingComponent, properties)
    // }
    // getMutableState(SelectionState).selectedEntities.set([getComponent(entity.value!, UUIDComponent)])
  }, [postProEnt])

  return (
    <>
      <Template sceneName={sceneName} projectName={projectName} />
      <div
        style={{
          pointerEvents: 'all',
          position: 'absolute',
          top: '10%',
          left: '70%',
          background: 'white',
          overflowY: 'auto',
          height: '80%'
        }}
      >
        {entity.value && <PostProcessingSettingsEditor entity={entity.value} component={PostProcessingComponent} />}
      </div>
    </>
  )
}
