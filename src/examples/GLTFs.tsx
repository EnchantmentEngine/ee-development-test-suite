import React, { useEffect } from 'react'

import { ComponentType, getComponent, setComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { State, getMutableState, useImmediateEffect } from '@ir-engine/hyperflux'

import { Entity, EntityUUID, UUIDComponent, createEntity, removeEntity } from '@ir-engine/ecs'

import config from '@ir-engine/common/src/config'
import { EntityTreeComponent } from '@ir-engine/ecs'
import { AnimationComponent } from '@ir-engine/engine/src/avatar/components/AnimationComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { AmbientLightComponent, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { AnimationClip, Color, Euler, Quaternion } from 'three'
import { RouteData } from '../sceneRoute'
import { useExampleEntity } from './utils/common/entityUtils'

export const metadata = {
  title: 'GLTF',
  description: ''
}

const fileServer = config.client.fileServer
const CDN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/refs/heads/main/Models'
const gltf_test_url = 'https://raw.githubusercontent.com/cx20/gltf-test/refs/heads/master/tutorialModels'

// @todo fetch list in realtime from https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/model-index.json

export const gltfRoutes = [
  {
    name: 'Basic',
    description: 'Basic Duck',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/Duck/glTF/Duck.gltf'}
        screenshotURL={CDN_URL + '/Duck/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'Binary',
    description: 'Binary Duck',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/Duck/glTF-Binary/Duck.glb'}
        screenshotURL={CDN_URL + '/Duck/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'Draco',
    description: 'Draco Duck',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/Duck/glTF-Draco/Duck.gltf'}
        screenshotURL={CDN_URL + '/Duck/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'Embedded',
    description: 'Embedded Duck',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/Duck/glTF-Embedded/Duck.gltf'}
        screenshotURL={CDN_URL + '/Duck/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'Quantized',
    description: 'Quantized Duck',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/Duck/glTF-Quantized/Duck.gltf'}
        screenshotURL={CDN_URL + '/Duck/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'Sponza',
    description: 'Sponza',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/Sponza/glTF/Sponza.gltf'}
        screenshotURL={CDN_URL + '/Sponza/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'Skinning',
    description: 'Animated Fox',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/Fox/glTF/Fox.gltf'}
        screenshotURL={CDN_URL + '/Fox/screenshot/screenshot.jpg'}
        light
        animationClip={'Run'}
        scale={0.01}
      />
    )
  },
  {
    name: 'Morph Targets',
    description: 'Morph Primitives Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf'}
        screenshotURL={CDN_URL + '/AnimatedMorphCube/screenshot/screenshot.jpg'}
        light
        animationClip={'Square'}
      />
    )
  },
  {
    name: 'Multiple Primitives Morph Targets',
    description: 'Morph Targets For Multiple Primitives ',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
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
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/UnlitTest/glTF/UnlitTest.gltf'}
        screenshotURL={CDN_URL + '/UnlitTest/screenshot/screenshot_large.jpg'}
        offset={4}
      />
    )
  },
  {
    name: 'KHR_materials_emissive_strength',
    description: 'Khronos Emissive Strength Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/EmissiveStrengthTest/glTF/EmissiveStrengthTest.gltf'}
        screenshotURL={CDN_URL + '/EmissiveStrengthTest/screenshot/screenshot.jpg'}
        light
        offset={10}
      />
    )
  },
  {
    name: 'KHR_materials_clearcoat',
    description: 'Khronos Clearcoat Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/ClearCoatTest/glTF/ClearCoatTest.gltf'}
        screenshotURL={CDN_URL + '/ClearCoatTest/screenshot/screenshot.jpg'}
        light
        offset={6}
      />
    )
  },
  {
    name: 'KHR_materials_iridescence',
    description: 'Khronos Iridescence Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/IridescenceMetallicSpheres/glTF/IridescenceMetallicSpheres.gltf'}
        screenshotURL={CDN_URL + '/IridescenceMetallicSpheres/screenshot/screenshot.jpg'}
        light
        offset={12}
      />
    )
  },
  {
    name: 'KHR_materials_sheen',
    description: 'Khronos Sheen Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/SheenChair/glTF/SheenChair.gltf'}
        screenshotURL={CDN_URL + '/SheenChair/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'KHR_materials_transmission',
    description: 'Khronos Transmission Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/TransmissionTest/glTF/TransmissionTest.gltf'}
        screenshotURL={CDN_URL + '/TransmissionTest/screenshot/screenshot.jpg'}
        light
        offset={{ y: 0.5 }}
      />
    )
  },
  {
    name: 'KHR_materials_volume',
    description: 'Khronos Volume Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/AttenuationTest/glTF/AttenuationTest.gltf'}
        screenshotURL={CDN_URL + '/AttenuationTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 12, y: 8 }}
      />
    )
  },
  // {
  //   name: 'KHR_materials_ior',
  //   description: 'Khronos Index of Refraction Material Extension',
  //   entry: ({sceneEntity}) => <GLTFViewer sceneEntity={sceneEntity!} src={CDN_URL + '/IORTest/glTF/IORTest.gltf'} light />
  // },
  {
    name: 'KHR_materials_specular',
    description: 'Khronos Specular Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/SpecularTest/glTF/SpecularTest.gltf'}
        screenshotURL={CDN_URL + '/SpecularTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 1, y: 0.5 }}
      />
    )
  },
  // {
  //   name: 'EXT_materials_bump',
  //   description: 'Khronos Bump Material Extension',
  //   entry: ({sceneEntity}) => <GLTFViewer sceneEntity={sceneEntity!} src={CDN_URL + '/BumpTest/glTF/BumpTest.gltf'} light />
  // },
  {
    name: 'KHR_materials_anisotropy',
    description: 'Khronos Anisotropy Material Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/CarbonFibre/glTF/CarbonFibre.gltf'}
        screenshotURL={CDN_URL + '/CarbonFibre/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'KHR_lights_punctual',
    description: 'Khronos Punctual Lights Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/LightsPunctualLamp/glTF/LightsPunctualLamp.gltf'}
        screenshotURL={CDN_URL + '/LightsPunctualLamp/screenshot/screenshot.jpg'}
      />
    )
  },
  {
    name: 'KHR_texture_basisu',
    description: 'Khronos Basis Universal Texture Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp.gltf'}
        screenshotURL={CDN_URL + '/StainedGlassLamp/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'EXT_meshopt_compression',
    description: 'Mesh Optimization Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/DragonAttenuation/glTF-Meshopt/DragonAttenuation.gltf'}
        screenshotURL={CDN_URL + '/DragonAttenuation/screenshot/screenshot.jpg'}
        light
        offset={4}
      />
    )
  },
  {
    name: 'EXT_mesh_gpu_instancing',
    description: 'GPU Instancing Extension',
    // entry: ({sceneEntity}) => <GLTFViewer sceneEntity={sceneEntity!} src={'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF-instancing/DamagedHelmetGpuInstancing.gltf'} light />
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/SimpleInstancing/glTF/SimpleInstancing.gltf'}
        screenshotURL={CDN_URL + '/SimpleInstancing/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'KHR_materials_pbrSpecularGlossiness',
    description: 'DEPRECATED Khronos PBR Specular Glossiness Extension',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/SpecGlossVsMetalRough/glTF/SpecGlossVsMetalRough.gltf'}
        screenshotURL={CDN_URL + '/SpecGlossVsMetalRough/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'MOZ_lightmap',
    description: 'Mozilla Lightmap Extension',
    sceneKey: 'projects/ir-engine/ir-development-test-suite/public/scenes/Unlit.gltf',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/lightmaptest.glb'}
        // light
      />
    )
  },
  {
    name: 'EE_material',
    description: 'Ethereal Engine Material Extension',
    /** @todo currently relies on eepro advanced materials project - replace asset with one that has base custom material */
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={fileServer + '/projects/ir-engine/ir-development-test-suite/assets/GLTF/double-mat-test.glb'}
        light
      />
    )
  },
  {
    name: 'Simple Material',
    description: 'Simple Material',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={gltf_test_url + '/SimpleMaterial/glTF/SimpleMaterial.gltf'}
        screenshotURL={CDN_URL + '/SimpleMaterial/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  {
    name: 'Simple Texture',
    description: 'Simple Texture',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={gltf_test_url + '/SimpleTexture/glTF/SimpleTexture.gltf'}
        screenshotURL={CDN_URL + '/SimpleTexture/screenshot/screenshot.jpg'}
        light
      />
    )
  },
  // Doesn't work with either loader
  {
    name: 'Boom Box',
    description: 'Boom Box',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/BoomBox/glTF/BoomBox.gltf'}
        screenshotURL={CDN_URL + '/BoomBox/screenshot/screenshot.jpg'}
        scale={100}
        light
      />
    )
  },
  {
    name: 'Damaged Helmet',
    description: 'Damaged Helmet',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/DamagedHelmet/glTF/DamagedHelmet.gltf'}
        screenshotURL={CDN_URL + '/DamagedHelmet/screenshot/screenshot.jpg'}
        light
        offset={{ y: 2 }}
      />
    )
  },
  {
    name: 'Alpha Blend Mode Test',
    description: 'Alpha Blend Mode Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/AlphaBlendModeTest/glTF/AlphaBlendModeTest.gltf'}
        screenshotURL={CDN_URL + '/AlphaBlendModeTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 5, y: 0.2 }}
      />
    )
  },
  {
    name: 'Metallic Roughness Test',
    description: 'Metallic Roughness Material Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/MetalRoughSpheres/glTF/MetalRoughSpheres.gltf'}
        screenshotURL={CDN_URL + '/MetalRoughSpheres/screenshot/screenshot.jpg'}
        light
        offset={{ x: 6, y: 6 }}
      />
    )
  },
  {
    name: 'Metallic Roughness Test (Textureless)',
    description: 'Metallic Roughness Material Test (Textureless)',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/MetalRoughSpheresNoTextures/glTF/MetalRoughSpheresNoTextures.gltf'}
        screenshotURL={CDN_URL + '/MetalRoughSpheresNoTextures/screenshot/screenshot.jpg'}
        light
        offset={{ x: 6, y: 6 }}
      />
    )
  },
  {
    name: 'Morph Target Stress Test',
    description: 'Morph Target Stress Test (RESOURCE INTENSIVE)',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/MorphStressTest/glTF/MorphStressTest.gltf'}
        screenshotURL={CDN_URL + '/MorphStressTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 3, y: 0.5 }}
      />
    )
  },
  {
    name: 'Negative Scale Test',
    description: 'Negative Scale Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/NegativeScaleTest/glTF/NegativeScaleTest.gltf'}
        screenshotURL={CDN_URL + '/NegativeScaleTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 6, y: 6 }}
      />
    )
  },
  {
    name: 'Multiple UVs Test',
    description: 'Multiple UVs Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/MultiUVTest/glTF/MultiUVTest.gltf'}
        screenshotURL={CDN_URL + '/MultiUVTest/screenshot/screenshot.jpg'}
        light
        offset={{ y: 1 }}
      />
    )
  },
  {
    name: 'Normal Tangent Test',
    description: 'Normal Tangent Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/NormalTangentTest/glTF/NormalTangentTest.gltf'}
        screenshotURL={CDN_URL + '/NormalTangentTest/screenshot/screenshot.jpg'}
        light
        offset={{ y: 2 }}
      />
    )
  },
  {
    name: 'Normal Tangent Mirrored Test',
    description: 'Normal Tangent Mirrored Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/NormalTangentMirrorTest/glTF/NormalTangentMirrorTest.gltf'}
        screenshotURL={CDN_URL + '/NormalTangentMirrorTest/screenshot/screenshot.jpg'}
        light
        offset={{ y: 2 }}
      />
    )
  },
  {
    name: 'Orientation Test',
    description: 'Orientation Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/OrientationTest/glTF/OrientationTest.gltf'}
        screenshotURL={CDN_URL + '/OrientationTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 8, y: 8 }}
      />
    )
  },
  {
    name: 'Recursive Skeletons Test',
    description: 'Recursive Skeletons Test (RESOURCE INTENSIVE)',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/RecursiveSkeletons/glTF/RecursiveSkeletons.gltf'}
        screenshotURL={CDN_URL + '/RecursiveSkeletons/screenshot/screenshot.jpg'}
        scale={0.01}
        light
      />
    )
  },
  {
    name: 'Texture Coordinate Test',
    description: 'Texture Coordinate Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/TextureCoordinateTest/glTF/TextureCoordinateTest.gltf'}
        screenshotURL={CDN_URL + '/TextureCoordinateTest/screenshot/screenshot.jpg'}
        light
        offset={{ y: 1.5 }}
      />
    )
  },
  {
    name: 'Texture Linear Interpolation Test',
    description: 'Texture Linear Interpolation Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/TextureLinearInterpolationTest/glTF/TextureLinearInterpolationTest.gltf'}
        screenshotURL={CDN_URL + '/TextureLinearInterpolationTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 4, y: 2 }}
      />
    )
  },
  {
    name: 'Texture Settings Test',
    description: 'Texture Settings Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/TextureSettingsTest/glTF/TextureSettingsTest.gltf'}
        screenshotURL={CDN_URL + '/TextureSettingsTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 6, y: 6 }}
      />
    )
  },
  {
    name: 'Vertex Color Test',
    description: 'Vertex Color Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/VertexColorTest/glTF/VertexColorTest.gltf'}
        screenshotURL={CDN_URL + '/VertexColorTest/screenshot/screenshot.jpg'}
        light
        offset={{ y: 1.5 }}
      />
    )
  },
  {
    name: 'Interpolation Test',
    description: 'Interpolation Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/InterpolationTest/glTF/InterpolationTest.gltf'}
        screenshotURL={CDN_URL + '/InterpolationTest/screenshot/screenshot.jpg'}
        light
        offset={{ x: 6, y: 3 }}
      />
    )
  },
  {
    name: 'Sparse Accessor Test',
    description: 'Sparse Accessor Test',
    entry: ({ sceneEntity }) => (
      <GLTFViewer
        sceneEntity={sceneEntity!}
        src={CDN_URL + '/SimpleSparseAccessor/glTF/SimpleSparseAccessor.gltf'}
        screenshotURL={CDN_URL + '/SimpleSparseAccessor/screenshot/screenshot.jpg'}
        light
        offset={{ x: 5 }}
      />
    )
  }
] as RouteData[]

const GLTF = (props: {
  root: Entity
  src: string
  screenshotURL?: string
  scale?: number
  offset?: number | { x?: number; y?: number; z?: number }
  animationClip?: string
}) => {
  const { root, src, screenshotURL, scale, offset, animationClip } = props
  const gltfEntity = useExampleEntity(root)
  // const modelEntity = useExampleEntity(root)
  const gltfAnimation = useOptionalComponent(gltfEntity, AnimationComponent)
  // const modelAnimation = useOptionalComponent(modelEntity, AnimationComponent)

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

    setVisibleComponent(gltfEntity, true)
    const gltfTransform = getComponent(gltfEntity, TransformComponent)
    gltfTransform.position.set(-offsetVec.x, offsetVec.y, offsetVec.z)
    if (scale) gltfTransform.scale.set(scale, scale, scale)

    // use Three JS Loader
    // setComponent(modelEntity, NameComponent, 'Three-Loader')
    // setComponent(modelEntity, ModelComponent, {
    //   cameraOcclusion: true,
    //   src: src
    // })

    // setVisibleComponent(modelEntity, true)
    // const modelTransform = getComponent(modelEntity, TransformComponent)
    // modelTransform.position.set(offsetVec.x, offsetVec.y, offsetVec.z)
    // if (scale) modelTransform.scale.set(scale, scale, scale)
  }, [src])

  useImmediateEffect(() => {
    if (!screenshotURL) return

    const imageEntity = createEntity()

    setComponent(imageEntity, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(imageEntity, NameComponent, 'Screenshot')
    setComponent(imageEntity, TransformComponent)
    setComponent(imageEntity, EntityTreeComponent, { parentEntity: root })
    setComponent(imageEntity, ImageComponent, { source: screenshotURL })
    setVisibleComponent(imageEntity, true)

    const offsetVec =
      typeof offset === 'number'
        ? { x: offset, y: 0, z: 0 }
        : { x: offset?.x ?? 2, y: offset?.y ?? 0, z: offset?.z ?? 0 }

    const modelTransform = getComponent(imageEntity, TransformComponent)
    modelTransform.position.set(offsetVec.x, offsetVec.y, offsetVec.z)
    if (offsetVec.x > 0) modelTransform.scale.set(offsetVec.x, offsetVec.x, offsetVec.x)

    return () => {
      removeEntity(imageEntity)
    }
  }, [screenshotURL])

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

  // useEffect(() => {
  //   playAnimation(modelAnimation)
  // }, [modelAnimation, animationClip])

  return null
}

export default function GLTFViewer(props: {
  sceneEntity: Entity
  src: string
  screenshotURL?: string
  scale?: number
  offset?: number | { x?: number; y?: number; z?: number }
  light?: boolean
  animationClip?: string
}) {
  const { sceneEntity } = props

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
    setComponent(entity, UUIDComponent, 'ambient light' as EntityUUID)
    setComponent(entity, NameComponent, 'Ambient Light')
    setComponent(entity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(2, 5, 3)) })
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, AmbientLightComponent, { color: new Color('white'), intensity: 0.5 })

    return () => {
      removeEntity(entity)
    }
  }, [props.light, sceneEntity])

  return sceneEntity ? (
    <GLTF
      root={sceneEntity}
      src={props.src}
      screenshotURL={props.screenshotURL}
      scale={props.scale}
      offset={props.offset}
      animationClip={props.animationClip}
    />
  ) : null
}
