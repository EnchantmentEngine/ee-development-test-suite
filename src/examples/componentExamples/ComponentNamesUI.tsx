// @ts-ignore
import styles from './ComponentNamesUI.css?inline'

import { Entity, EntityTreeComponent, getAllComponents, getOptionalComponent } from '@ir-engine/ecs'
import { useXRUIState } from '@ir-engine/spatial/src/xrui/useXRUIState'
import { useHookstate } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'

const ComponentNamesUI: React.FC = () => {
  const xruiState = useXRUIState<{ entity: Entity }>()
  const names = useHookstate<string[]>([])
  const examplesEntity = xruiState.entity.value

  useEffect(() => {
    if (!examplesEntity) return

    const tree = getOptionalComponent(examplesEntity, EntityTreeComponent)
    if (!tree) return

    const children = tree.children
    const entities = [examplesEntity, ...children]

    const componentNamesSet = new Set<string>()
    for (const entity of entities) {
      const components = getAllComponents(entity)
      components
        .map((comp) => comp.name)
        .forEach((name) => {
          componentNamesSet.add(name)
        })
    }

    const componentNames = [...componentNamesSet].filter(
      (name) => !['RenderOrder', 'ObjectLayer', 'Scene', 'Network', 'Resource'].some((val) => name.includes(val))
    )
    names.set(componentNames)
  }, [examplesEntity])

  return (
    <>
      <style type="text/css">{styles.toString()}</style>
      <div className="ComponentsContainer">
        <div className="ComponentsHeaderContainer">
          <h1 className="ComponentsHeader">Components</h1>
        </div>
        <div className="ComponentNamesContainer">
          {names.value.map((name) => {
            return (
              <div className="ComponentNameContainer" key={name}>
                <p className="ComponentName">{name}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
export default ComponentNamesUI
