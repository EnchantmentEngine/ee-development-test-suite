import React, { useEffect } from 'react'

import { ComponentType, getComponent, setComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { State, getMutableState, useImmediateEffect } from '@ir-engine/hyperflux'

import { Entity, EntityUUID, UUIDComponent, createEntity, removeEntity } from '@ir-engine/ecs'

import config from '@ir-engine/common/src/config'
import { AnimationComponent } from '@ir-engine/engine/src/avatar/components/AnimationComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { AmbientLightComponent, DirectionalLightComponent, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { AnimationClip, Color, Euler, Quaternion } from 'three'
import { RouteData, useRouteScene } from '../sceneRoute'
import { useExampleEntity } from './utils/common/entityUtils'

export const metadata = {
  title: 'GLTF',
  description: ''
}

const fileServer = config.client.fileServer
const CDN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0'
const gltf_test_url = 'https://raw.githubusercontent.com/cx20/gltf-test/refs/heads/master/tutorialModels'

export const gltfRoutes = [
  {
    name: 'Basic',
    description: 'Basic Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF/Duck.gltf'} light />
  },
  {
    name: 'Binary',
    description: 'Binary Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Binary/Duck.glb'} light />
  },
  {
    name: 'Draco',
    description: 'Draco Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Draco/Duck.gltf'} light />
  },
  {
    name: 'Embedded',
    description: 'Embedded Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Embedded/Duck.gltf'} light />
  },
  {
    name: 'Quantized',
    description: 'Quantized Duck',
    entry: () => <GLTFViewer src={CDN_URL + '/Duck/glTF-Quantized/Duck.gltf'} light />
  },
  {
    name: 'Sponza',
    description: 'Sponza',
    entry: () => <GLTFViewer src={CDN_URL + '/Sponza/glTF/Sponza.gltf'} light />
  },
  {
    name: 'Skinning',
    description: 'Animated Fox',
    entry: () => <GLTFViewer src={CDN_URL + '/Fox/glTF/Fox.gltf'} light animationClip={'Run'} scale={0.01} />
  },
  {
    name: 'Morph Targets',
    description: 'Morph Primitives Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf'} light animationClip={'Square'} />
    )
  },
  {
    name: 'Multiple Primitives Morph Targets',
    description: 'Morph Targets For Multiple Primitives ',
    entry: () => (
      <GLTFViewer
        src={
          fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/MultiplePrimitivesMorphTargets.glb'
        }
        light
        animationClip={'Sphere'}
      />
    )
  },
  {
    name: 'KHR_materials_unlit',
    description: 'Khronos Unlit Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/UnlitTest/glTF/UnlitTest.gltf'} offset={4} />
  },
  {
    name: 'KHR_materials_emissive_strength',
    description: 'Khronos Emissive Strength Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/EmissiveStrengthTest/glTF/EmissiveStrengthTest.gltf'} light offset={10} />
  },
  {
    name: 'KHR_materials_clearcoat',
    description: 'Khronos Clearcoat Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/ClearCoatTest/glTF/ClearCoatTest.gltf'} light offset={6} />
  },
  {
    name: 'KHR_materials_iridescence',
    description: 'Khronos Iridescence Material Extension',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/IridescenceMetallicSpheres/glTF/IridescenceMetallicSpheres.gltf'}
        light
        offset={12}
      />
    )
  },
  {
    name: 'KHR_materials_sheen',
    description: 'Khronos Sheen Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/SheenChair/glTF/SheenChair.gltf'} light />
  },
  {
    name: 'KHR_materials_transmission',
    description: 'Khronos Transmission Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/TransmissionTest/glTF/TransmissionTest.gltf'} light offset={{ y: 0.5 }} />
  },
  {
    name: 'KHR_materials_volume',
    description: 'Khronos Volume Material Extension',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/AttenuationTest/glTF/AttenuationTest.gltf'} light offset={{ x: 12, y: 8 }} />
    )
  },
  // {
  //   name: 'KHR_materials_ior',
  //   description: 'Khronos Index of Refraction Material Extension',
  //   entry: () => <GLTFViewer src={CDN_URL + '/IORTest/glTF/IORTest.gltf'} light />
  // },
  {
    name: 'KHR_materials_specular',
    description: 'Khronos Specular Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/SpecularTest/glTF/SpecularTest.gltf'} light offset={{ x: 1, y: 0.5 }} />
  },
  // {
  //   name: 'EXT_materials_bump',
  //   description: 'Khronos Bump Material Extension',
  //   entry: () => <GLTFViewer src={CDN_URL + '/BumpTest/glTF/BumpTest.gltf'} light />
  // },
  {
    name: 'KHR_materials_anisotropy',
    description: 'Khronos Anisotropy Material Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/CarbonFibre/glTF/CarbonFibre.gltf'} light />
  },
  {
    name: 'KHR_lights_punctual',
    description: 'Khronos Punctual Lights Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/LightsPunctualLamp/glTF/LightsPunctualLamp.gltf'} />
  },
  {
    name: 'KHR_texture_basisu',
    description: 'Khronos Basis Universal Texture Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/FlightHelmet/glTF-KTX-BasisU/FlightHelmet.gltf'} light />
  },
  {
    name: 'EXT_meshopt_compression',
    description: 'Mesh Optimization Extension',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/DragonAttenuation/glTF-Meshopt/DragonAttenuation.gltf'} light offset={4} />
    )
  },
  {
    name: 'EXT_mesh_gpu_instancing',
    description: 'GPU Instancing Extension',
    // entry: () => <GLTFViewer src={'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF-instancing/DamagedHelmetGpuInstancing.gltf'} light />
    entry: () => <GLTFViewer src={CDN_URL + '/SimpleInstancing/glTF/SimpleInstancing.gltf'} light />
  },
  {
    name: 'KHR_materials_pbrSpecularGlossiness',
    description: 'DEPRECATED Khronos PBR Specular Glossiness Extension',
    entry: () => <GLTFViewer src={CDN_URL + '/SpecGlossVsMetalRough/glTF/SpecGlossVsMetalRough.gltf'} light />
  },
  {
    name: 'MOZ_lightmap',
    description: 'Mozilla Lightmap Extension',
    entry: () => (
      <GLTFViewer
        src={fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/lightmaptest.glb'}
        light
      />
    )
  },
  {
    name: 'EE_material',
    description: 'Ethereal Engine Material Extension',
    /** @todo currently relies on eepro advanced materials project - replace asset with one that has base custom material */
    entry: () => (
      <GLTFViewer
        src={fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/double-mat-test.glb'}
        light
      />
    )
  },
  {
    name: 'Simple Material',
    description: 'Simple Material',
    entry: () => <GLTFViewer src={gltf_test_url + '/SimpleMaterial/glTF/SimpleMaterial.gltf'} light />
  },
  {
    name: 'Simple Texture',
    description: 'Simple Texture',
    entry: () => <GLTFViewer src={gltf_test_url + '/SimpleTexture/glTF/SimpleTexture.gltf'} light />
  },
  // Doesn't work with either loader
  {
    name: 'Boom Box',
    description: 'Boom Box',
    entry: () => <GLTFViewer src={CDN_URL + '/BoomBox/glTF/BoomBox.gltf'} light />
  },
  {
    name: 'Damaged Helmet',
    description: 'Damaged Helmet',
    entry: () => <GLTFViewer src={CDN_URL + '/DamagedHelmet/glTF/DamagedHelmet.gltf'} light offset={{ y: 2 }} />
  },
  {
    name: 'Alpha Blend Mode Test',
    description: 'Alpha Blend Mode Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/AlphaBlendModeTest/glTF/AlphaBlendModeTest.gltf'} light offset={{ x: 5, y: 0.2 }} />
    )
  },
  {
    name: 'Metallic Roughness Test',
    description: 'Metallic Roughness Material Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/MetalRoughSpheres/glTF/MetalRoughSpheres.gltf'} light offset={{ x: 6, y: 6 }} />
    )
  },
  {
    name: 'Metallic Roughness Test (Textureless)',
    description: 'Metallic Roughness Material Test (Textureless)',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/MetalRoughSpheresNoTextures/glTF/MetalRoughSpheresNoTextures.gltf'}
        light
        offset={{ x: 6, y: 6 }}
      />
    )
  },
  {
    name: 'Morph Target Stress Test',
    description: 'Morph Target Stress Test (RESOURCE INTENSIVE)',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/MorphStressTest/glTF/MorphStressTest.gltf'} light offset={{ x: 3, y: 0.5 }} />
    )
  },
  {
    name: 'Negative Scale Test',
    description: 'Negative Scale Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/NegativeScaleTest/glTF/NegativeScaleTest.gltf'} light offset={{ x: 6, y: 6 }} />
    )
  },
  {
    name: 'Multiple UVs Test',
    description: 'Multiple UVs Test',
    entry: () => <GLTFViewer src={CDN_URL + '/MultiUVTest/glTF/MultiUVTest.gltf'} light offset={{ y: 1 }} />
  },
  {
    name: 'Normal Tangent Test',
    description: 'Normal Tangent Test',
    entry: () => <GLTFViewer src={CDN_URL + '/NormalTangentTest/glTF/NormalTangentTest.gltf'} light offset={{ y: 2 }} />
  },
  {
    name: 'Normal Tangent Mirrored Test',
    description: 'Normal Tangent Mirrored Test',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/NormalTangentMirrorTest/glTF/NormalTangentMirrorTest.gltf'}
        light
        offset={{ y: 2 }}
      />
    )
  },
  {
    name: 'Orientation Test',
    description: 'Orientation Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/OrientationTest/glTF/OrientationTest.gltf'} light offset={{ x: 8, y: 8 }} />
    )
  },
  {
    name: 'Recursive Skeletons Test',
    description: 'Recursive Skeletons Test (RESOURCE INTENSIVE)',
    entry: () => <GLTFViewer src={CDN_URL + '/RecursiveSkeletons/glTF/RecursiveSkeletons.gltf'} light />
  },
  {
    name: 'Texture Coordinate Test',
    description: 'Texture Coordinate Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/TextureCoordinateTest/glTF/TextureCoordinateTest.gltf'} light offset={{ y: 1.5 }} />
    )
  },
  {
    name: 'Texture Linear Interpolation Test',
    description: 'Texture Linear Interpolation Test',
    entry: () => (
      <GLTFViewer
        src={CDN_URL + '/TextureLinearInterpolationTest/glTF/TextureLinearInterpolationTest.gltf'}
        light
        offset={{ x: 4, y: 2 }}
      />
    )
  },
  {
    name: 'Texture Settings Test',
    description: 'Texture Settings Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/TextureSettingsTest/glTF/TextureSettingsTest.gltf'} light offset={{ x: 6, y: 6 }} />
    )
  },
  {
    name: 'Vertex Color Test',
    description: 'Vertex Color Test',
    entry: () => <GLTFViewer src={CDN_URL + '/VertexColorTest/glTF/VertexColorTest.gltf'} light offset={{ y: 1.5 }} />
  },
  {
    name: 'Interpolation Test',
    description: 'Interpolation Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/InterpolationTest/glTF/InterpolationTest.gltf'} light offset={{ x: 6, y: 3 }} />
    )
  },
  {
    name: 'Sparse Accessor Test',
    description: 'Sparse Accessor Test',
    entry: () => (
      <GLTFViewer src={CDN_URL + '/SimpleSparseAccessor/glTF/SimpleSparseAccessor.gltf'} light offset={{ x: 5 }} />
    )
  }
] as RouteData[]

const GLTF = (props: {
  root: Entity
  src: string
  scale?: number
  offset?: number | { x?: number; y?: number; z?: number }
  animationClip?: string
}) => {
  const { root, src, scale, offset, animationClip } = props
  const gltfEntity = useExampleEntity(root)
  const modelEntity = useExampleEntity(root)
  const gltfAnimation = useOptionalComponent(gltfEntity, AnimationComponent)
  const modelAnimation = useOptionalComponent(modelEntity, AnimationComponent)

  useImmediateEffect(() => {
    const offsetVec =
      typeof offset === 'number'
        ? { x: offset, y: 0, z: 0 }
        : { x: offset?.x ?? 2, y: offset?.y ?? 0, z: offset?.z ?? 0 }

    // use GLTF Loader
    setComponent(gltfEntity, NameComponent, 'GLTF-Loader')
    setComponent(gltfEntity, GLTFComponent, {
      cameraOcclusion: true,
      src: src
    })
    setComponent(gltfEntity, ShadowComponent, { receive: false })
    setVisibleComponent(gltfEntity, true)
    const gltfTransform = getComponent(gltfEntity, TransformComponent)
    gltfTransform.position.set(-offsetVec.x, offsetVec.y, offsetVec.z)
    if (scale) gltfTransform.scale.set(scale, scale, scale)

    // use Three JS Loader
    setComponent(modelEntity, NameComponent, 'Three-Loader')
    setComponent(modelEntity, ModelComponent, {
      cameraOcclusion: true,
      src: src
    })
    setComponent(modelEntity, ShadowComponent, { receive: false })
    setVisibleComponent(modelEntity, true)
    const modelTransform = getComponent(modelEntity, TransformComponent)
    modelTransform.position.set(offsetVec.x, offsetVec.y, offsetVec.z)
    if (scale) modelTransform.scale.set(scale, scale, scale)
  }, [src])

  const playAnimation = (component: State<ComponentType<typeof AnimationComponent>> | undefined) => {
    const animationComponent = component?.value
    if (!animationComponent?.animations || !animationClip) return

    const clips = animationComponent.animations as AnimationClip[]
    const clip = AnimationClip.findByName(clips, animationClip)
    if (!clip) return console.warn('Clip not found:', animationClip)

    const action = animationComponent.mixer.clipAction(clip)
    action.play()
  }

  useEffect(() => {
    playAnimation(gltfAnimation)
  }, [gltfAnimation, animationClip])

  useEffect(() => {
    playAnimation(modelAnimation)
  }, [modelAnimation, animationClip])

  return null
}

export default function GLTFViewer(props: {
  src: string
  scale?: number
  offset?: number | { x?: number; y?: number; z?: number }
  light?: boolean
  animationClip?: string
}) {
  const sceneEntity = useRouteScene()

  useEffect(() => {
    const bgColor = document.body.style.backgroundColor
    document.body.style.backgroundColor = 'gray'
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)

    return () => {
      document.body.style.backgroundColor = bgColor
    }
  }, [])

  useEffect(() => {
    if (!props.light || !sceneEntity) return

    const entity = createEntity()
    setComponent(entity, UUIDComponent, 'directional light' as EntityUUID)
    setComponent(entity, NameComponent, 'Directional Light')
    setComponent(entity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, DirectionalLightComponent, { color: new Color('white'), intensity: 0.5 })
    setComponent(entity, AmbientLightComponent, { color: new Color('white'), intensity: 0.5 })

    return () => {
      removeEntity(entity)
    }
  }, [props.light, sceneEntity])

  return sceneEntity ? (
    <GLTF
      root={sceneEntity}
      src={props.src}
      scale={props.scale}
      offset={props.offset}
      animationClip={props.animationClip}
    />
  ) : null
}
