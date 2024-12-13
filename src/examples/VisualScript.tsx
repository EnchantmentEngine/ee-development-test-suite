import React, { useEffect } from 'react'

// import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity } from '@ir-engine/ecs'
import { ActiveVisualScript } from '@ir-engine/editor/src/panels/visualscript/container'
// import { VisualScriptComponent } from '@ir-engine/engine'
import { useHookstate } from '@ir-engine/hyperflux'
// import { GraphJSON } from '@ir-engine/visual-script'
import 'reactflow/dist/style.css'

export default function VisualScript() {
  const entity = useHookstate(() => {
    const entity = createEntity()
    // setComponent(entity, VisualScriptComponent, { visualScript: targetJson as unknown as GraphJSON })
    return entity
  }).value

  useEffect(() => {
    return () => {
      removeEntity(entity)
    }
  }, [])
  return (
    <>
      {/* <Template /> */}
      <div
        style={{
          pointerEvents: 'all',
          position: 'absolute',
          marginRight: '0px',
          maxWidth: '500px',
          width: '500px',
          height: '100%'
        }}
      >
        <ActiveVisualScript entity={entity} />
      </div>
    </>
  )
}
