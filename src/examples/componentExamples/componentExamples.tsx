import config from '@ir-engine/common/src/config'
import {
  Easing,
  Entity,
  EntityTreeComponent,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getComponent,
  removeEntity,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { BehaviorComponent } from '@ir-engine/engine/src/scene/components/BehaviorComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { ParticleSystemComponent } from '@ir-engine/engine/src/scene/components/ParticleSystemComponent'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { SDFComponent } from '@ir-engine/engine/src/scene/components/SDFComponent'
import { SceneDynamicLoadComponent } from '@ir-engine/engine/src/scene/components/SceneDynamicLoadComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@ir-engine/engine/src/scene/components/SplineTrackComponent'
import { Heuristic, VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { SplineHelperComponent } from '@ir-engine/engine/src/scene/components/debug/SplineHelperComponent'
import { GeometryTypeEnum } from '@ir-engine/engine/src/scene/constants/GeometryTypeEnum'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { PI, Q_IDENTITY, Q_Y_180, Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import React, { useEffect } from 'react'
import { MathUtils, MeshLambertMaterial, Quaternion, Vector3 } from 'three'
import { useAvatars } from '../../engine/TestUtils'
import { useExampleEntity } from '../utils/common/entityUtils'
import ComponentNamesUI from './ComponentNamesUI'

export const metadata = {
  title: 'Components Examples',
  description: 'Components examples'
}

const validAvatarAnimations = [0, 2, 3, 4, 5, 6, 7, 14, 22, 29]

export const subComponentExamples = [
  {
    name: 'Models',
    description: 'Add GLTF models to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const gltfComponent = useOptionalComponent(entity, GLTFComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Model-Example')
        setComponent(entity, GLTFComponent, {
          cameraOcclusion: true,
          src:
            config.client.fileServer +
            '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Flight%20Helmet/FlightHelmet.gltf'
        })
        setComponent(entity, ShadowComponent, { receive: false })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).scale.set(3, 3, 3)
      }, [])

      useEffect(() => {
        if (gltfComponent?.progress.value === 100) onLoad(entity)
      }, [gltfComponent?.progress])

      return null
    }
  },
  {
    name: 'Transitions',
    description: 'Add transitions to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const gltfComponent = useOptionalComponent(entity, GLTFComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Transition-Example')
        setComponent(entity, GLTFComponent, {
          cameraOcclusion: true,
          src:
            config.client.fileServer +
            '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Flight%20Helmet/FlightHelmet.gltf'
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).scale.set(3, 3, 3)

        let id: any

        const transitionA = () => {
          TransformComponent.setTransition(entity, 'position.y', 2, {
            duration: 1000,
            easing: Easing.exponential.inOut
          })
          TransformComponent.setTransition(entity, 'rotation', Q_Y_180, {
            duration: 500,
            easing: Easing.exponential.inOut
          })
          id = setTimeout(transitionB, 1000)
        }

        const transitionB = () => {
          TransformComponent.setTransition(entity, 'position.y', 0, {
            duration: 1000,
            easing: Easing.exponential.inOut
          })
          TransformComponent.setTransition(entity, 'rotation', Q_IDENTITY, {
            duration: 500,
            easing: Easing.exponential.inOut
          })
          id = setTimeout(transitionA, 1000)
        }

        transitionA()

        return () => clearTimeout(id)
      }, [])

      useEffect(() => {
        if (gltfComponent?.progress.value === 100) onLoad(entity)
      }, [gltfComponent?.progress])

      return null
    }
  },
  {
    name: 'Avatars',
    description: 'Add avatars to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const avatars = useAvatars()
      const gltfComponent = useOptionalComponent(entity, GLTFComponent)

      useEffect(() => {
        const avatarArr = avatars.value
        if (!avatarArr.length) return

        const avatarSrc = avatarArr[MathUtils.randInt(0, avatarArr.length)]
        setComponent(entity, NameComponent, 'Avatar-Example')
        setComponent(entity, GLTFComponent, { src: avatarSrc })
        setVisibleComponent(entity, true)
        setComponent(entity, LoopAnimationComponent, {
          animationPack: config.client.fileServer + '/projects/ir-engine/default-project/assets/animations/emotes.glb',
          activeClipIndex: validAvatarAnimations[Math.floor(Math.random() * validAvatarAnimations.length)]
        })
      }, [avatars])

      useEffect(() => {
        if (gltfComponent?.progress.value === 100) onLoad(entity)
      }, [gltfComponent?.progress])

      return null
    }
  },
  {
    name: 'Variants',
    description: 'Load multiple variants of a model',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const gltfComponent = useOptionalComponent(entity, GLTFComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Variant-Example')
        setComponent(entity, VariantComponent, {
          heuristic: Heuristic.DISTANCE,
          levels: [
            {
              src: config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/LOD/Test_LOD0.glb',
              metadata: {
                minDistance: 0,
                maxDistance: 5
              }
            },
            {
              src: config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/LOD/Test_LOD1.glb',
              metadata: {
                minDistance: 5,
                maxDistance: 10
              }
            },
            {
              src: config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/LOD/Test_LOD2.glb',
              metadata: {
                minDistance: 10,
                maxDistance: 15
              }
            }
          ]
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1, 0)
      }, [])

      useEffect(() => {
        if (gltfComponent?.progress.value === 100) onLoad(entity)
      }, [gltfComponent?.progress])

      return null
    }
  },
  {
    name: 'Particles',
    description: 'Add particle systems to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const particles = useOptionalComponent(entity, ParticleSystemComponent)
      const source = GLTFComponent.useInstanceID(parent)

      useEffect(() => {
        if (!source) return
        setComponent(entity, NameComponent, 'Particle-Example')
        setComponent(entity, ParticleSystemComponent)
        setComponent(entity, SourceComponent, source)
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 2, 0)
      }, [source])

      useEffect(() => {
        if (particles?.system.value) onLoad(entity)
      }, [particles?.system])

      return null
    }
  },
  {
    name: 'Images',
    description: 'Add images to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Image-Example')
        setComponent(entity, ImageComponent, {
          source: config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/Images/testImage.jpg'
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 2, 0)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Videos',
    description: 'Add videos to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Video-Example')
        setComponent(entity, VideoComponent)
        setComponent(entity, MediaComponent, {
          resources: [
            config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/Videos/HDVideo.mp4'
          ]
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 2, 0)
        getComponent(entity, TransformComponent).scale.set(1.777, 1, 1)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Geometry',
    description: 'Add geometry to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        const geoTypes = Object.values(GeometryTypeEnum).filter(
          (value) => typeof value === 'number'
        ) as GeometryTypeEnum[]
        const geoType = geoTypes[MathUtils.randInt(0, geoTypes.length)]
        setComponent(entity, NameComponent, 'Geometry-Example')
        setComponent(entity, PrimitiveGeometryComponent, {
          geometryType: geoType
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'SDF',
    description: 'Add signed distance fields to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'SDF-Example')
        setComponent(entity, SDFComponent)
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Splines',
    description: 'Add splines to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const childEntity = useExampleEntity(entity)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Spline-Example')
        setComponent(entity, SplineComponent)
        setComponent(entity, SplineHelperComponent, { layerMask: ObjectLayerMasks.Scene })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)

        setComponent(childEntity, NameComponent, 'Spline-Follow-Example')
        setComponent(childEntity, PrimitiveGeometryComponent, {
          geometryType: GeometryTypeEnum.SphereGeometry,
          geometryParams: { radius: 0.2, segments: 10 }
        })
        setVisibleComponent(childEntity, true)
        setComponent(childEntity, SplineTrackComponent, { splineEntityUUID: getComponent(entity, NodeIDComponent) })
        onLoad(entity)
      }, [])

      return null
    }
  },
  {
    name: 'Animations',
    description: 'Add animated models to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const gltfComponent = useOptionalComponent(entity, GLTFComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Animation-Example')
        setComponent(entity, GLTFComponent, {
          src: config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/animations/rings.glb'
        })
        setVisibleComponent(entity, true)
        setComponent(entity, LoopAnimationComponent, { activeClipIndex: 0 })
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)
      }, [])

      useEffect(() => {
        if (gltfComponent?.progress.value === 100) onLoad(entity)
      }, [gltfComponent?.progress])

      return null
    }
  },
  {
    name: 'Dynamic Load',
    description: 'An object that only loads in within a specific distance',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const gltfComponent = useOptionalComponent(entity, GLTFComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Dynamic Load Example')
        setComponent(entity, SceneDynamicLoadComponent, { distance: 5 })
        setComponent(entity, GLTFComponent, {
          src: config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/animations/rings.glb'
        })
        setVisibleComponent(entity, true)
        getComponent(entity, TransformComponent).position.set(0, 1.5, 0)
      }, [])

      useEffect(() => {
        onLoad(gltfComponent?.progress.value === 100 ? entity : UndefinedEntity)
      }, [gltfComponent?.progress])

      return null
    }
  },
  {
    name: 'Links',
    description: 'Add interactable links to your scene',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const entity = useExampleEntity(parent)
      const callback = useOptionalComponent(entity, CallbackComponent)

      useEffect(() => {
        setComponent(entity, NameComponent, 'Link-Example')
        setComponent(entity, LinkComponent)
      }, [])

      useEffect(() => {
        if (!callback?.value) return
        setComponent(entity, InputComponent, { highlight: true, grow: true })
        setComponent(entity, InteractableComponent, {
          label: 'Click me',
          clickInteract: true,
          uiActivationType: XRUIActivationType.proximity,
          activationDistance: 2,
          highlighted: true,
          callbacks: [
            {
              callbackID: LinkComponent.linkCallbackName,
              target: getComponent(entity, NodeIDComponent)
            }
          ]
        })
        setComponent(entity, PrimitiveGeometryComponent)
        setVisibleComponent(entity, true)
        onLoad(entity)
      }, [callback])

      return null
    }
  },
  {
    name: 'Behavior',
    description: 'Add arbitrary behaviors to objects',
    Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
      const { parent, onLoad } = props
      const doorEntity = useExampleEntity(parent)
      const buttonEntity = useExampleEntity(parent)
      const pedastalEntity = useExampleEntity(parent)

      useEffect(() => {
        setComponent(doorEntity, TransformComponent, { position: new Vector3(6.5, 0, 2.5) })
        setComponent(doorEntity, NameComponent, 'Door')
        setComponent(doorEntity, GLTFComponent, {
          src: config.client.fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/basic_door.glb'
        })
        setComponent(doorEntity, VisibleComponent)

        setComponent(pedastalEntity, TransformComponent, { position: new Vector3(0, 0.5, 0) })
        setComponent(pedastalEntity, PrimitiveGeometryComponent, {
          geometryType: GeometryTypeEnum.BoxGeometry,
          geometryParams: {
            width: 1,
            height: 1,
            depth: 1,
            widthSegments: 1,
            heightSegments: 1,
            depthSegments: 1
          }
        })
        setComponent(pedastalEntity, NameComponent, 'Pedestal')
        const lightpurpleHex = 0x9b59b6
        setComponent(pedastalEntity, MaterialStateComponent, {
          material: new MeshLambertMaterial({ color: lightpurpleHex })
        })
        setComponent(pedastalEntity, MaterialInstanceComponent, { uuid: [getComponent(pedastalEntity, UUIDComponent)] })
        setComponent(pedastalEntity, VisibleComponent, true)

        setComponent(buttonEntity, TransformComponent, {
          position: new Vector3(0, 1.025, 0)
        })
        setComponent(buttonEntity, PrimitiveGeometryComponent, {
          geometryType: GeometryTypeEnum.BoxGeometry,
          geometryParams: {
            width: 0.2,
            height: 0.05,
            depth: 0.2,
            widthSegments: 1,
            heightSegments: 1,
            depthSegments: 1
          }
        })
        setComponent(buttonEntity, NameComponent, 'Button')
        setComponent(buttonEntity, MaterialStateComponent, { material: new MeshLambertMaterial({ color: 'red' }) })
        setComponent(buttonEntity, MaterialInstanceComponent, { uuid: [getComponent(buttonEntity, UUIDComponent)] })
        setComponent(buttonEntity, VisibleComponent, true)

        setComponent(buttonEntity, InputComponent, { highlight: true, grow: true })
        setComponent(buttonEntity, InteractableComponent, {
          label: '',
          clickInteract: true,
          uiActivationType: XRUIActivationType.proximity,
          activationDistance: 2,
          highlighted: true,
          callbacks: [
            {
              callbackID: 'Button Click Callback',
              target: getComponent(buttonEntity, NodeIDComponent)
            },
            {
              callbackID: 'Button Click Callback 2',
              target: getComponent(buttonEntity, NodeIDComponent)
            }
          ]
        })

        const doorNodeID = '5' as NodeID // the door inside the door model
        const Q_Y_120 = new Quaternion().setFromAxisAngle(Vector3_Up, PI * (120 / 180))

        setComponent(buttonEntity, BehaviorComponent, {
          behaviors: [
            {
              conditions: [
                {
                  type: 'callback',
                  nodeID: getComponent(buttonEntity, NodeIDComponent),
                  callback: 'Button Click Callback'
                },
                // ensure door is not already open by getting the rotation
                {
                  type: 'entity',
                  nodeID: doorNodeID,
                  sourceNodeID: getComponent(doorEntity, NodeIDComponent),
                  component: TransformComponent.jsonID,
                  property: 'rotation.y',
                  value: 0,
                  condition: 'equal'
                }
              ],
              effects: [
                {
                  type: 'transition',
                  nodeID: doorNodeID,
                  sourceNodeID: getComponent(doorEntity, NodeIDComponent),
                  jsonID: TransformComponent.jsonID,
                  propertyPath: 'rotation',
                  value: Q_Y_120,
                  duration: 1000,
                  easing: Easing.exponential.inOut.path
                }
              ],
              networked: true
            },
            {
              conditions: [
                {
                  type: 'callback',
                  nodeID: getComponent(buttonEntity, NodeIDComponent),
                  callback: 'Button Click Callback 2'
                },
                // ensure door is not already closed by getting the rotation
                {
                  type: 'entity',
                  nodeID: doorNodeID,
                  sourceNodeID: getComponent(doorEntity, NodeIDComponent),
                  component: TransformComponent.jsonID,
                  property: 'rotation.y',
                  value: 0,
                  condition: 'notEqual'
                }
              ],
              effects: [
                {
                  type: 'transition',
                  nodeID: doorNodeID,
                  sourceNodeID: getComponent(doorEntity, NodeIDComponent),
                  jsonID: TransformComponent.jsonID,
                  propertyPath: 'rotation',
                  value: Q_IDENTITY,
                  duration: 1000,
                  easing: Easing.exponential.inOut.path
                }
              ],
              networked: true
            }
          ]
        })
      }, [])

      return null
    }
  }
  // {
  //   name: 'UVOL',
  //   description: 'Add volumetric models to your scene',
  //   Reactor: (props: { parent: Entity; onLoad: (entity: Entity) => void }) => {
  //     const { parent, onLoad } = props
  //     const entity = useExampleEntity(parent)
  //     const modelEntity = useExampleEntity(entity)
  //     const outfitEntity = useExampleEntity(entity)
  //     const model = useOptionalComponent(modelEntity, VolumetricComponent)
  //     const outfit = useOptionalComponent(outfitEntity, VolumetricComponent)

  //     useEffect(() => {
  //       setComponent(entity, NameComponent, 'UVOL-Example')
  //       setVisibleComponent(entity, true)

  //       setComponent(modelEntity, NameComponent, 'Model-Example')
  //       setComponent(modelEntity, VolumetricComponent, {
  //         paths: ['https://resources-volumetric.ir-engine.com/alex_walk_performer.json']
  //       })
  //       setVisibleComponent(modelEntity, true)

  //       setComponent(outfitEntity, NameComponent, 'Outfit-Example')
  //       setComponent(outfitEntity, VolumetricComponent, {
  //         paths: ['https://resources-volumetric.ir-engine.com/alex_walk_sundress_businessCasual.json']
  //       })
  //       setVisibleComponent(outfitEntity, true)

  //       onLoad(entity)
  //     }, [])

  //     return null
  //   }
  // }
] as Array<{
  name: string
  description: string
  spawnAvatar?: boolean
  Reactor: React.FC<{ parent: Entity; onLoad: (entity: Entity) => void }>
}>

export const ComponentExamples = (props: {
  sceneEntity: Entity
  Reactor: React.FC<{ parent: Entity; onLoad: (entity: Entity) => void }>
}) => {
  const { sceneEntity, Reactor } = props

  const xrui = useHookstate({ entity: UndefinedEntity })

  useEffect(() => {
    if (!xrui.entity.value) return

    const componentNamesUIEntity = createEntity()
    setComponent(componentNamesUIEntity, UUIDComponent, generateEntityUUID())
    setComponent(componentNamesUIEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(componentNamesUIEntity, NameComponent, 'componentNamesUI')
    const componentNamesUI = createXRUI(ComponentNamesUI, xrui, { interactable: false }, componentNamesUIEntity)
    componentNamesUI.container.position.set(2.4, 2, -1)

    return () => {
      removeEntity(componentNamesUIEntity)
    }
  }, [Reactor, xrui.entity.value])

  return <Reactor parent={sceneEntity} onLoad={xrui.entity.set} />
}
