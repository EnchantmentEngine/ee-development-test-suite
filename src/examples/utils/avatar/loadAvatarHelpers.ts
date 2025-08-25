import { AvatarState } from '@ir-engine/client-core/src/user/services/AvatarService'
import config from '@ir-engine/common/src/config'
import { AvatarType } from '@ir-engine/common/src/schema.type.module'
import { EntityID, EntityUUID, EntityUUIDPair, NetworkId, SourceID, UUIDComponent, createEntity } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ikTargets } from '@ir-engine/engine/src/avatar/animation/Util'
import { AvatarAnimationComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import {
  NetworkActions,
  NetworkState,
  PeerID,
  UserID,
  dispatchAction,
  getMutableState,
  getState
} from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { MathUtils, Quaternion, Vector3 } from 'three'

export const getAvatarLists = () => {
  const avatarState = getMutableState(AvatarState)
  const avatarList = avatarState.avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
  return avatarList
}

export const mockNetworkAvatars = (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const userId = ('user' + i) as UserID & PeerID
    const index = (1000 + i) as NetworkId
    const column = i * 2

    dispatchAction(
      NetworkActions.peerJoined({
        $network: NetworkState.worldNetwork.id,
        peerID: userId,
        peerIndex: index,
        userID: userId
      })
    )
    const parentUUID = UUIDComponent.join(getComponent(getState(ReferenceSpaceState).originEntity, UUIDComponent))
    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID,
        position: new Vector3(0, 0, column),
        rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI),
        ownerID: userId,
        entitySourceID: getComponent(getState(ReferenceSpaceState).originEntity, UUIDComponent).entitySourceID,
        entityID: 'avatar' as EntityID,
        avatarURL: avatar.modelResource!.url,
        name: userId + '_avatar'
      })
    )
  }
}

export const loadNetworkAvatar = (avatar: AvatarType | string, i: number, u = 'user', x = 0) => {
  const userId = (u + i) as UserID & PeerID
  const index = (1000 + i) as NetworkId

  dispatchAction(
    NetworkActions.peerJoined({
      $network: NetworkState.worldNetwork.id,
      peerID: userId,
      peerIndex: index,
      userID: userId
    })
  )
  const parentUUID = UUIDComponent.join(getComponent(getState(ReferenceSpaceState).originEntity, UUIDComponent))

  dispatchAction(
    AvatarNetworkAction.spawn({
      parentUUID,
      position: new Vector3(x, 0, i * 2),
      rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI),
      ownerID: userId,
      entitySourceID: getComponent(getState(ReferenceSpaceState).originEntity, UUIDComponent).entitySourceID,
      entityID: 'avatar' as EntityID,
      avatarURL: typeof avatar === 'string' ? avatar : avatar.modelResource!.url,
      name: userId + '_avatar'
    })
  )
  return userId
}

export const mockLoopAnimAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithLoopAnimation(avatar.modelResource?.url || '', new Vector3(4, 0, column), i)
  }
}

export const CreateSkinnedMeshGrid = (avatarList: AvatarType[], size: number) => {
  const square = Math.ceil(Math.sqrt(size))
  for (let i = 0; i < size; i++) {
    const x = i % square
    const y = Math.floor(i / square)
    const avatarIndex = i % avatarList.length
    loadAssetWithLoopAnimation(avatarList[avatarIndex].modelResource?.url ?? '', new Vector3(x * 2, 0, y * 2), i)
  }
}

export const mockTPoseAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetTPose(avatar.modelResource?.url || '', new Vector3(8, 0, column), i)
  }
}

export const mockIKAvatars = async (avatarList: AvatarType[], avatarAmount = null as null | number) => {
  for (let i = 0; i < (avatarAmount ?? avatarList.length); i++) {
    const avatar = avatarList[avatarAmount ? i % avatarList.length : i]
    const column = i * 2
    loadAssetWithIK(avatar, new Vector3(12, 0, column), i)
  }
}

export const loadAssetWithIK = (avatar: AvatarType, position: Vector3, i: number) => {
  const userId = loadNetworkAvatar(avatar, i, 'user_ik', position.x)
  const parentUUID = UUIDComponent.join(getComponent(getState(ReferenceSpaceState).originEntity, UUIDComponent))
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      name: 'head',
      entitySourceID: userId,
      entityID: ikTargets.head as EntityID,
      blendWeight: 0,
      position
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      name: 'leftHand',
      entitySourceID: userId,
      entityID: ikTargets.leftHand as EntityID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      name: 'rightHand',
      entitySourceID: userId,
      entityID: ikTargets.rightHand as EntityID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      name: 'leftFoot',
      entitySourceID: userId,
      entityID: ikTargets.leftFoot as EntityID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      name: 'rightFoot',
      entitySourceID: userId,
      entityID: ikTargets.rightFoot as EntityID,
      blendWeight: 0
    }),
    ownerID: userId
  })
}

export const loadAssetTPose = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  const parentUUID = UUIDComponent.getAsSourceID(getState(ReferenceSpaceState).originEntity)
  setComponent(entity, NameComponent, 'TPose Avatar ' + i)
  setComponent(entity, UUIDComponent, {
    entitySourceID: parentUUID,
    entityID: ('TPose Avatar ' + i) as EntityID
  })
  setComponent(entity, TransformComponent, {
    position,
    rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI)
  })
  setComponent(entity, AvatarAnimationComponent, {
    locomotion: new Vector3()
  })
  setComponent(entity, VisibleComponent, true)
  return entity
}

export const loadAssetWithLoopAnimation = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  const parentUUID = UUIDComponent.getAsSourceID(getState(ReferenceSpaceState).originEntity)
  setComponent(entity, NameComponent, 'Anim Avatar ' + i + ' ' + filename.split('/').pop())
  setComponent(entity, UUIDComponent, {
    entitySourceID: parentUUID,
    entityID: ('TPose Avatar ' + i) as EntityID
  })
  setComponent(entity, TransformComponent, {
    position,
    rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI)
  })
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, LoopAnimationComponent, {
    activeClipIndex: 0,
    animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb'
  })
  setComponent(entity, GLTFComponent, { src: filename, cameraOcclusion: false })
  return entity
}

export const randomVec3 = (): Vector3 => {
  return new Vector3(MathUtils.randFloat(-2.0, 2.0), MathUtils.randFloat(2.0, 4.0), MathUtils.randFloat(-2, 2.0))
}

export const randomQuaternion = (): Quaternion => {
  return new Quaternion().random()
}

export const spawnAvatar = (
  rootUUID: EntityUUID,
  userID: string,
  avatarURL: string,
  pose: {
    position: Vector3
    rotation: Quaternion
  }
) => {
  dispatchAction(
    AvatarNetworkAction.spawn({
      parentUUID: rootUUID,
      position: pose.position,
      rotation: pose.rotation,
      entitySourceID: userID as any as SourceID,
      entityID: 'avatar' as EntityID,
      avatarURL,
      name: avatarURL.split('/').pop() as string
    })
  )

  return userID as UserID
}

export const createIkTargetsForAvatar = (
  parentUUIDPair: EntityUUIDPair,
  position: Vector3,
  rotation: Quaternion
): EntityUUID[] => {
  const headUUID = ikTargets.head as EntityID
  const leftHandUUID = ikTargets.leftHand as EntityID
  const rightHandUUID = ikTargets.rightHand as EntityID
  const leftFootUUID = ikTargets.leftFoot as EntityID
  const rightFootUUID = ikTargets.rightFoot as EntityID

  const targetUUIDs = [headUUID, leftHandUUID, rightHandUUID, leftFootUUID, rightFootUUID].map((id) => {
    return UUIDComponent.join({ entitySourceID: parentUUIDPair.entitySourceID, entityID: id })
  })

  const posRot = targetUUIDs.map(() => ({ position: position, rotation: rotation }))
  const parentUUID = UUIDComponent.join(parentUUIDPair)

  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entitySourceID: parentUUIDPair.entitySourceID,
      entityID: headUUID,
      name: 'head',
      blendWeight: 1,
      ...posRot[0]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entitySourceID: parentUUIDPair.entitySourceID,
      entityID: leftHandUUID,
      name: 'leftHand',
      blendWeight: 1,
      ...posRot[1]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entitySourceID: parentUUIDPair.entitySourceID,
      entityID: rightHandUUID,
      name: 'rightHand',
      blendWeight: 1,
      ...posRot[2]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entitySourceID: parentUUIDPair.entitySourceID,
      entityID: leftFootUUID,
      name: 'leftFoot',
      blendWeight: 1,
      ...posRot[3]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entitySourceID: parentUUIDPair.entitySourceID,
      entityID: rightFootUUID,
      name: 'rightFoot',
      blendWeight: 1,
      ...posRot[4]
    })
  )

  return targetUUIDs
}
