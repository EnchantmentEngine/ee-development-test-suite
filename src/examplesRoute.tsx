import React from 'react'

import '@ir-engine/client/src/engine'

import { gltfRoutes } from './examples/GLTFs'
import InstanceConnection from './examples/InstanceConnection'
import InstancedLODs from './examples/InstancedLODs'
import MultipleCanvasCameras from './examples/MultipleCanvasCameras'
import MultipleCanvasScenes from './examples/MultipleCanvasScenes'
import P2PConnection from './examples/P2PConnection'
import PhysicsDynamicObjects from './examples/PhysicsDynamicObjects'
import AvatarMocapEntry from './examples/avatarMocap'
import AvatarSimpleEntry from './examples/avatarSimple'
import AvatarTestEntry from './examples/avatarTest'
import ComponentExamplesRoute, { subComponentExamples } from './examples/componentExamples/componentExamples'
import GLTFViewer from './examples/gltfViewer'
import ImmersiveAR from './examples/immersiveAR'
import ImmersiveVR from './examples/immersiveVR'
import MultipleScenesEntry from './examples/multipleScenes'
import ResourceTrackingRoute from './examples/resourceTracking'
import Routes, { RouteCategories } from './sceneRoute'

export const examples: RouteCategories = [
  {
    category: 'WebXR',
    routes: [
      {
        name: 'Immersive AR',
        description: 'Immersive AR example',
        entry: ImmersiveAR,
        spawnAvatar: true
      },
      {
        name: 'Immersive VR',
        description: 'Immersive VR example',
        entry: ImmersiveVR,
        spawnAvatar: true
      }
    ]
  },
  {
    category: 'Components',
    routes: subComponentExamples.map((sub) => ({
      name: sub.name,
      description: sub.description,
      entry: () => <ComponentExamplesRoute Reactor={sub.Reactor} />
    }))
  },
  {
    category: 'Avatar',
    routes: [
      {
        name: 'Simple',
        description: 'Avatar simple example',
        entry: AvatarSimpleEntry
      },
      {
        name: 'Mocap',
        description: 'Avatar mocap example',
        entry: AvatarMocapEntry
      },
      {
        name: 'Test',
        description: 'Load many avatars',
        entry: AvatarTestEntry
      }
    ]
  },
  {
    category: 'Scene',
    routes: [
      {
        name: 'GLTF Viewer',
        description: 'Drag and drop GLTF files',
        entry: GLTFViewer
      },
      {
        name: 'Multiple',
        description: 'multiple scenes example',
        entry: MultipleScenesEntry
      },
      {
        name: 'Resource Tracking',
        description: 'Track resources loaded in a scene example',
        entry: ResourceTrackingRoute
      },
      {
        name: 'Instanced LODs',
        description: 'Instanced LODs example',
        entry: InstancedLODs
      }
    ]
  },
  {
    category: 'GLTF',
    routes: gltfRoutes
  },
  {
    category: 'Physics',
    routes: [
      {
        name: 'Dynamic objects',
        description: 'Dynamic objects example',
        entry: PhysicsDynamicObjects,
        spawnAvatar: true
      }
    ]
  },
  {
    category: 'Render',
    routes: [
      {
        name: 'Multiple Canvases with different scenes',
        description: 'Loads different scenes in different canvases',
        entry: MultipleCanvasScenes
      },
      {
        name: 'Multiple Canvases with different cameras',
        description: 'View the same scene from different cameras',
        entry: MultipleCanvasCameras
      }
    ]
  },
  {
    category: 'Networking',
    routes: [
      {
        name: 'P2P with API',
        description: 'Connect clients with P2P WebRTC via signaling service',
        entry: P2PConnection
      },
      // {
      //   name: 'P2P without API',
      //   description: 'Connect clients with P2P WebRTC without signaling service',
      //   entry: P2PConnection
      // },
      {
        name: 'Instance Server',
        description: 'Connect clients to an instance server',
        entry: InstanceConnection
      }
    ]
  }
]

const ExampleRoutes = () => {
  return (
    <>
      <Routes routeCategories={examples} header="Examples" />
    </>
  )
}

export default ExampleRoutes
