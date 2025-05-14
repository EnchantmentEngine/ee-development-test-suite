/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { endXRSession, requestXRSession } from '@ir-engine/spatial/src/xr/XRSessionFunctions'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'

import EmulatedDevice from './js/emulatedDevice'
import { EmulatorSettings, emulatorStates } from './js/emulatorStates'
import { syncDevicePose } from './js/messenger'
import Devtool from './jsx/app'
import devtoolCSS from './styles/index.css?inline'

import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { WebXREventDispatcher } from '@ir-engine/spatial/tests/webxr/emulator/WebXREventDispatcher'
import { POLYFILL_ACTIONS } from '@ir-engine/spatial/tests/webxr/emulator/actions'

export async function overrideXR(args: { mode: 'immersive-vr' | 'immersive-ar' }) {
  // inject the webxr polyfill from the webxr emulator source - this is a script added by the bot
  // globalThis.WebXRPolyfillInjection()

  const { CustomWebXRPolyfill } = await import('@ir-engine/spatial/tests/webxr/emulator/CustomWebXRPolyfill')
  new CustomWebXRPolyfill()
  // override session supported request, it hangs indefinitely for some reason
  ;(navigator as any).xr.isSessionSupported = () => {
    return true
  }

  const deviceDefinition = {
    id: 'Oculus Quest',
    name: 'Oculus Quest',
    modes: ['inline', 'immersive-vr', 'immersive-ar'],
    headset: {
      hasPosition: true,
      hasRotation: true
    },
    controllers: [
      {
        id: 'Oculus Touch (Right)',
        buttonNum: 7,
        primaryButtonIndex: 0,
        primarySqueezeButtonIndex: 1,
        hasPosition: true,
        hasRotation: true,
        hasSqueezeButton: true,
        isComplex: true
      },
      {
        id: 'Oculus Touch (Left)',
        buttonNum: 7,
        primaryButtonIndex: 0,
        primarySqueezeButtonIndex: 1,
        hasPosition: true,
        hasRotation: true,
        hasSqueezeButton: true,
        isComplex: true
      }
    ],
    environmentBlendMode: args.mode === 'immersive-vr' ? 'opaque' : 'additive'
  }

  // send our device info to the polyfill API so it knows our capabilities
  WebXREventDispatcher.instance.dispatchEvent({
    type: POLYFILL_ACTIONS.DEVICE_INIT,
    detail: { stereoEffect: false, deviceDefinition }
  })
}

const setup = async (mode: 'immersive-vr' | 'immersive-ar') => {
  await overrideXR({ mode })
  await EmulatorSettings.instance.load()
  const device = new EmulatedDevice()
  device.on('pose', syncDevicePose)
  ;(emulatorStates as any).emulatedDevice = device

  return device
}

export const EmulatorDevtools = (props: { mode: 'immersive-vr' | 'immersive-ar' }) => {
  const xrState = useMutableState(XRState)
  const xrActive = xrState.sessionActive.value && !xrState.requestingSession.value

  const deviceState = useHookstate(null as null | EmulatedDevice)
  useImmediateEffect(() => {
    setup(props.mode).then((device) => {
      deviceState.set(device)
    })
  }, [])

  const toggleXR = async () => {
    if (xrActive) {
      endXRSession()
    } else {
      requestXRSession({ mode: props.mode })
    }
  }

  const togglePlacement = () => {
    if (xrState.scenePlacementMode.value !== 'placing') {
      xrState.scenePlacementMode.set('placing')
      xrState.sceneScaleAutoMode.set(false)
      xrState.sceneScaleTarget.set(0.1)
    } else {
      xrState.scenePlacementMode.set('placed')
    }
  }

  return (
    <>
      <style type="text/css">{devtoolCSS.toString()}</style>
      <div
        id="devtools"
        className="flex-no-wrap m-0 flex h-full h-full select-none flex-col overflow-hidden overflow-hidden bg-gray-900 text-xs text-gray-900"
      >
        <div className="flex-no-wrap z-50 flex h-10 select-none flex-row bg-gray-800 text-xs text-gray-900">
          <Button className="my-1 ml-auto mr-6 px-10" onClick={toggleXR} disabled={xrState.requestingSession.value}>
            {(xrActive ? 'Exit ' : 'Enter ') + (props.mode === 'immersive-ar' ? 'AR' : 'VR')}
          </Button>
          {props.mode === 'immersive-ar' && (
            <Button className="my-1 ml-auto mr-6 px-10" onClick={togglePlacement} disabled={!xrActive}>
              Place Scene
            </Button>
          )}
        </div>
        {deviceState.value && <Devtool device={deviceState.value} />}
      </div>
    </>
  )
}
