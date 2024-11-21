import { UUIDComponent, createEntity, removeEntity, setComponent } from '@ir-engine/ecs'
import { State, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import ComponentDropdown from '@ir-engine/ui/src/components/editor/ComponentDropdown'
import EulerInput from '@ir-engine/ui/src/components/editor/input/Euler'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import Vector3Input from '@ir-engine/ui/src/components/editor/input/Vector3'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Quaternion, Vector3 } from 'three'

export const Transform = (props: {
  title?: string
  transformState: State<{ position: Vector3; rotation: Quaternion; scale: Vector3 }>
}) => {
  const { transformState } = props
  const { t } = useTranslation()

  const entity = useHookstate(() => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
    return entity
  }).value

  useImmediateEffect(() => {
    return () => {
      removeEntity(entity)
    }
  }, [])

  const { position, rotation, scale } = transformState.value

  const onChangePosition = (value: Vector3) => transformState.position.set(new Vector3().copy(value))
  const onChangeRotation = (value: Quaternion) => transformState.rotation.set(new Quaternion().copy(value))
  const onChangeScale = (value: Vector3) => transformState.scale.set(new Vector3().copy(value))

  return (
    <ComponentDropdown
      entity={entity}
      minimizedDefault={false}
      name={props.title ?? t('editor:properties.transform.title')}
    >
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-position')}>
        <Vector3Input smallStep={0.01} mediumStep={0.1} largeStep={1} value={position} onChange={onChangePosition} />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
        <EulerInput quaternion={rotation} onChange={onChangeRotation} unit="°" />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={scale}
          onChange={onChangeScale}
        />
      </InputGroup>
    </ComponentDropdown>
  )
}
