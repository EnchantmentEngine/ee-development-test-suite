import { useHookstate, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { endXRSession, requestXRSession } from '@ir-engine/spatial/src/xr/XRSessionFunctions'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React, { useState, useRef, useEffect } from 'react'

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

  // Panel state
  const [panelPosition, setPanelPosition] = useState({ x: window.innerWidth - 720, y: 20 })
  const [panelSize, setPanelSize] = useState({ width: 700, height: 1000 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

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

  const handleClosePanel = () => {
    setIsVisible(false)
  }

  const handleMinimizePanel = () => {
    setIsMinimized(!isMinimized)
    if (isMinimized) {
      setPanelSize(prev => ({ ...prev, height: 600 }))
    } else {
      setPanelSize(prev => ({ ...prev, height: 50 }))
    }
  }

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the header or panel background
    const target = e.target as HTMLElement
    const isHeader = target.closest('.floating-panel-header')
    const isPanel = target === panelRef.current
    const isResizeHandle = target.closest('.resize-handle')
    
    if (isHeader || isPanel) {
      e.preventDefault()
      setIsDragging(true)
      const rect = panelRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Boundary constraints
      const maxX = window.innerWidth - panelSize.width
      const maxY = window.innerHeight - panelSize.height
      
      setPanelPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    } else if (isResizing) {
      e.preventDefault()
      const newSize = { ...panelSize }
      if (resizeDirection.includes('e')) newSize.width = e.clientX - panelPosition.x
      if (resizeDirection.includes('s')) newSize.height = e.clientY - panelPosition.y
      
      // Minimum size constraints
      newSize.width = Math.max(300, newSize.width)
      newSize.height = Math.max(400, newSize.height)
      
      // Maximum size constraints (keep within viewport)
      newSize.width = Math.min(newSize.width, window.innerWidth - panelPosition.x)
      newSize.height = Math.min(newSize.height, window.innerHeight - panelPosition.y)
      
      setPanelSize(newSize)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection('')
  }

  // Resize handlers
  const handleResizeMouseDown = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, panelPosition, panelSize, resizeDirection])

  if (!isVisible) {
    return (
      <>
        <style type="text/css">{devtoolCSS.toString()}</style>
        <button 
          className="show-panel-btn"
          onClick={() => setIsVisible(true)}
        >
          Show XR Devtool
        </button>
      </>
    )
  }

  return (
    <>
      <style type="text/css">{devtoolCSS.toString()}</style>
      
      {/* Floating Devtool Panel */}
      <div
        ref={panelRef}
        className={`floating-devtool-panel ${isMinimized ? 'minimized' : ''}`}
        style={{
          left: panelPosition.x,
          top: panelPosition.y,
          width: panelSize.width,
          height: panelSize.height,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Panel Header */}
        <div 
          className="floating-panel-header"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="text-white text-sm font-medium">XR Devtool Panel</div>
          <div className="flex gap-2">
            <button 
              className="panel-control-btn bg-gray-600 hover:bg-gray-500 text-white" 
              onClick={handleMinimizePanel}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? '□' : '−'}
            </button>
            <Button 
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white" 
              onClick={toggleXR} 
              disabled={xrState.requestingSession.value}
            >
              {(xrActive ? 'Exit ' : 'Enter ') + (props.mode === 'immersive-ar' ? 'AR' : 'VR')}
            </Button>
            {props.mode === 'immersive-ar' && (
              <Button 
                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white" 
                onClick={togglePlacement} 
                disabled={!xrActive}
              >
                Place Scene
              </Button>
            )}
            <button 
              className="panel-control-btn bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleClosePanel}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="floating-panel-content" style={{ opacity: isMinimized ? 0 : 1 }}>
          <div className="floating-panel-scroll">
            {deviceState.value ? (
              <Devtool device={deviceState.value} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                  <div>Initializing XR Devtool...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        {!isMinimized && (
          <div
            ref={resizeHandleRef}
            className="resize-handle"
            onMouseDown={handleResizeMouseDown('se')}
          />
        )}
      </div>
    </>
  )
}
