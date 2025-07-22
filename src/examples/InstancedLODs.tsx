import { Entity, setComponent, useOptionalComponent } from '@ir-engine/ecs'
import { DndWrapper } from '@ir-engine/editor/src/components/dnd/DndWrapper'
import { commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import { InstancingComponent } from '@ir-engine/engine/src/scene/components/InstancingComponent'
import {
  Devices,
  Heuristic,
  VariantComponent,
  VariantLevel
} from '@ir-engine/engine/src/scene/components/VariantComponent'
import { State, getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3_Left, Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import ModelInput from '@ir-engine/ui/src/components/editor/input/Model'
import NumericInput from '@ir-engine/ui/src/components/editor/input/Numeric'
import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import PaginatedList from '@ir-engine/ui/src/components/editor/layout/PaginatedList'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { InstancedBufferAttribute, Matrix4, Quaternion } from 'three'
import { useExampleEntity } from './utils/common/entityUtils'

const areaSize = 100
const count = 4000

const SceneReactor = (props: { sceneEntity: Entity }) => {
  const entity = useExampleEntity(props.sceneEntity)

  useEffect(() => {
    setComponent(entity, TransformComponent)
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'Grass via Instance LODs')

    // create random instance matrix
    const matrices = [] as number[]
    const mat4 = new Matrix4()

    for (let i = 0; i < count; i++) {
      const rot = new Quaternion()
        .setFromAxisAngle(Vector3_Up, Math.random() * 2 * Math.PI)
        .multiply(new Quaternion().setFromAxisAngle(Vector3_Left, Math.PI * 0.5)) //rotate x by 90 degrees because the grass is facing the wrong way
      mat4.makeRotationFromQuaternion(rot)
      mat4.elements[12] = (Math.random() - 0.5) * areaSize
      mat4.elements[13] = 0
      mat4.elements[14] = (Math.random() - 0.5) * areaSize
      matrices.push(...mat4.elements)
    }

    const instanceMatrix = new InstancedBufferAttribute(new Float32Array(matrices), 16)

    setComponent(entity, InstancingComponent, { instanceMatrix })
    setComponent(entity, VariantComponent, {
      heuristic: Heuristic.DISTANCE,
      levels: [
        {
          src:
            getState(DomainConfigState).cloudDomain +
            '/projects/enchantmentengine/ee-development-test-suite/assets/LOD/Test_LOD0.glb',
          metadata: {
            minDistance: 0,
            maxDistance: 20
          }
        },
        {
          src:
            getState(DomainConfigState).cloudDomain +
            '/projects/enchantmentengine/ee-development-test-suite/assets/LOD/Test_LOD1.glb',
          metadata: {
            minDistance: 20,
            maxDistance: 50
          }
        },
        {
          src:
            getState(DomainConfigState).cloudDomain +
            '/projects/enchantmentengine/ee-development-test-suite/assets/LOD/Test_LOD2.glb',
          metadata: {
            minDistance: 50,
            maxDistance: 100
          }
        }
      ]
    })
  }, [])

  const variantComponent = useOptionalComponent(entity, VariantComponent)
  const { t } = useTranslation()

  if (!variantComponent) return null

  return (
    <>
      <div
        className="flex-grid pointer-events-auto absolute right-0 flex w-fit flex-col justify-start gap-1.5"
        id="dnd-container"
      >
        <DndWrapper id="dnd-container">
          <div className="bg-theme-primary m-4 mt-1 flex flex max-w-[500px] flex-col overflow-hidden rounded-lg p-4">
            <PaginatedList
              options={{ countPerPage: 6 }}
              list={variantComponent.levels}
              element={(level: State<VariantLevel>, index) => {
                return (
                  <div className="bg-theme-secondary m-2 flex flex-col gap-1 py-1">
                    <InputGroup name="src" label={t('editor:properties.variant.src')}>
                      <ModelInput
                        value={level.src.value}
                        onRelease={commitProperty(VariantComponent, `levels.${index}.src` as any)}
                      />
                    </InputGroup>
                    {variantComponent.heuristic.value === Heuristic.DEVICE && (
                      <>
                        <InputGroup name="device" label={t('editor:properties.variant.device')}>
                          <SelectInput
                            value={level.metadata['device'].value}
                            onChange={commitProperty(VariantComponent, `levels.${index}.metadata.device` as any)}
                            options={[
                              { value: Devices.MOBILE, label: t('editor:properties.variant.device-mobile') },
                              { value: Devices.DESKTOP, label: t('editor:properties.variant.device-desktop') },
                              { value: Devices.XR, label: t('editor:properties.variant.device-xr') }
                            ]}
                          />
                        </InputGroup>
                      </>
                    )}
                    {variantComponent.heuristic.value === Heuristic.DISTANCE && (
                      <>
                        <InputGroup name="minDistance" label={t('editor:properties.variant.minDistance')}>
                          <NumericInput
                            value={level.metadata['minDistance'].value}
                            onChange={commitProperty(VariantComponent, `levels.${index}.metadata.minDistance` as any)}
                          />
                        </InputGroup>
                        <InputGroup name="maxDistance" label={t('editor:properties.variant.maxDistance')}>
                          <NumericInput
                            value={level.metadata['maxDistance'].value}
                            onChange={commitProperty(VariantComponent, `levels.${index}.metadata.maxDistance` as any)}
                          />
                        </InputGroup>
                      </>
                    )}
                  </div>
                )
              }}
            />
          </div>
        </DndWrapper>
      </div>
    </>
  )
}

export default function InstancedLODs(props: { sceneEntity: Entity }) {
  if (!props.sceneEntity) return null

  return <SceneReactor sceneEntity={props.sceneEntity} />
}
