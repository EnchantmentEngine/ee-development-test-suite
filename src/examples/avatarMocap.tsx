import { useWorldNetwork } from '@ir-engine/client-core/src/common/services/LocationInstanceConnectionService'
import { Entity, UUIDComponent, generateEntityUUID } from '@ir-engine/ecs'
import { setComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { AvatarRigComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { MotionCaptureResults, mocapDataChannelType } from '@ir-engine/engine/src/mocap/MotionCaptureSystem'
import { NO_PROXY, State, UserID, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { DataChannelRegistryState, NetworkState } from '@ir-engine/network'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { removeEntityNodeRecursively } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { encode } from 'msgpackr'
import React, { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'
import { useAvatarData } from '../engine/TestUtils'
import { useRouteScene } from '../sceneRoute'
import { spawnAvatar } from './utils/avatar/loadAvatarHelpers'
import { setupEntity } from './utils/common/entityUtils'

export const metadata = {
  title: 'Avatar Mocap',
  description: ''
}

const getMocapTestData = async () => {
  return Object.fromEntries(
    (
      await Promise.all(
        //@ts-ignore
        Object.entries(import.meta.glob<any>('./utils/testPoses/*.json')).map(async ([k, v]: [string, any]) => [
          k.split('/').pop()?.replace('.json', ''),
          await v()
        ])
      )
    ).map(([k, v]) => [k, v.default])
  )
}

type AvailablePoses =
  | 'mocapTPose'
  | 'mocapArmTurn90'
  | 'mocapLeanForward'
  | 'mocapSideBend'
  | 'mocapTurn45'
  | 'mocapTurn90'

const poses = [
  'mocapTPose',
  'mocapArmTurn90',
  'mocapLeanForward',
  'mocapSideBend',
  'mocapTurn45',
  'mocapTurn90'
] as AvailablePoses[]

const MocapAvatar = (props: {
  userID: UserID
  activePose: AvailablePoses
  mocapData: Record<AvailablePoses, MotionCaptureResults>
}) => {
  const { userID, activePose, mocapData } = props
  const entity = useHookstate(UUIDComponent.entitiesByUUIDState[userID]).value
  const rig = useOptionalComponent(entity, AvatarRigComponent)
  const visible = !!useOptionalComponent(entity, VisibleComponent)?.value
  const avatarDebug = useHookstate(getMutableState(RendererState).avatarDebug)

  const setVisible = () => {
    setVisibleComponent(entity, !visible)
  }

  const setHelper = () => {
    avatarDebug.set(!avatarDebug.value)
  }

  useEffect(() => {
    if (!rig?.value) return
    const data = mocapData[activePose]

    const timer = setInterval(() => {
      const dataChannelFunctions = getState(DataChannelRegistryState)[mocapDataChannelType]
      if (dataChannelFunctions) {
        const message = encode({
          timestamp: Date.now(),
          results: data
        })
        for (const func of dataChannelFunctions)
          func(NetworkState.worldNetwork, mocapDataChannelType, userID as any, message)
      }
    }, 500)

    return () => clearInterval(timer)
  }, [rig, activePose])

  return (
    <>
      <button
        style={{
          background: visible ? 'darkgreen' : 'lightgrey',
          color: visible ? 'lightgreen' : 'grey',
          padding: '0.5em',
          margin: '0.5em',
          borderRadius: '0.5em',
          border: 'none',
          pointerEvents: 'all'
        }}
        onClick={setVisible}
      >
        Show Avatar
      </button>
      <button
        style={{
          background: avatarDebug.value ? 'darkgreen' : 'lightgrey',
          color: avatarDebug.value ? 'lightgreen' : 'grey',
          padding: '0.5em',
          margin: '0.5em',
          borderRadius: '0.5em',
          border: 'none',
          pointerEvents: 'all'
        }}
        onClick={setHelper}
      >
        Show Helper
      </button>
    </>
  )
}

const ActivePoseUI = (props: { activePose: State<AvailablePoses> }) => {
  const { activePose } = props
  return (
    <div style={{ position: 'absolute', right: 0, top: 0, zIndex: 1000 }}>
      {poses.map((pose: any) => (
        <div key={pose}>
          <button
            style={{
              background: activePose.value === pose ? 'darkgreen' : 'lightgrey',
              color: activePose.value === pose ? 'lightgreen' : 'grey',
              padding: '0.5em',
              margin: '0.5em',
              borderRadius: '0.5em',
              border: 'none',
              pointerEvents: 'all'
            }}
            onClick={() => activePose.set(pose)}
          >
            {pose}
          </button>
          <br />
        </div>
      ))}
    </div>
  )
}

function AvatarMocap(props: { sceneEntity: Entity }) {
  setVisibleComponent(props.sceneEntity, true)
  const rootUUID = useComponent(props.sceneEntity, UUIDComponent)
  const network = useWorldNetwork()
  const avatars = useAvatarData()
  const selectedAvatar = useHookstate<undefined | string>(undefined)
  const userID = useHookstate('' as UserID)
  const mocapData = useHookstate<Record<AvailablePoses, MotionCaptureResults> | undefined>(undefined)
  const activePose = useHookstate<AvailablePoses | undefined>(undefined)

  useEffect(() => {
    getMocapTestData().then((data) => {
      mocapData.set(data)
      activePose.set(poses[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedAvatar.value || !network?.ready.value) return

    const uuid = generateEntityUUID()
    const entity = setupEntity(props.sceneEntity)
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, VisibleComponent, true)

    const id = spawnAvatar(rootUUID.value, uuid, selectedAvatar.value, {
      position: new Vector3(),
      rotation: new Quaternion()
    })
    userID.set(id)

    return () => {
      removeEntityNodeRecursively(entity)
    }
  }, [network?.ready, selectedAvatar])

  useEffect(() => {
    if (avatars.value && avatars.value.length && !selectedAvatar.value)
      selectedAvatar.set(avatars.get(NO_PROXY)[0].modelResource?.url!)
  }, [avatars])

  return (
    <>
      {avatars.value && avatars.value.length && (
        <select
          style={{
            background: 'lightgrey',
            color: 'grey',
            padding: '0.5em',
            margin: '0.5em',
            borderRadius: '0.5em',
            border: 'none',
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: 'all'
          }}
          onChange={(e) => selectedAvatar.set(avatars.get(NO_PROXY)[e.target.value].id)}
        >
          {avatars.value.map((avatar, i) => (
            <option key={avatar.id} value={i}>
              {avatar.modelResource?.url}
            </option>
          ))}
        </select>
      )}

      {activePose.value && <ActivePoseUI activePose={activePose as State<AvailablePoses>} />}
      {userID.value && mocapData.value && activePose.value && (
        <MocapAvatar
          userID={userID.value}
          activePose={activePose.value}
          mocapData={mocapData.get(NO_PROXY) as Record<AvailablePoses, MotionCaptureResults>}
        />
      )}
    </>
  )
}

export default function AvatarMocapEntry() {
  const sceneEntity = useRouteScene()
  return sceneEntity ? <AvatarMocap sceneEntity={sceneEntity} /> : null
}
