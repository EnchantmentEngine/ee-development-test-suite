import { AvatarState } from '@ir-engine/client-core/src/user/services/AvatarService'
import config from '@ir-engine/common/src/config'
import { AvatarType } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { Engine, EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { ikTargets } from '@ir-engine/engine/src/avatar/animation/Util'
import { AvatarAnimationComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { loadAvatarModelAsset } from '@ir-engine/engine/src/avatar/functions/avatarFunctions'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { PeerID, dispatchAction, getMutableState } from '@ir-engine/hyperflux'
import { NetworkActions, NetworkState } from '@ir-engine/network'
import { NetworkId } from '@ir-engine/network/src/NetworkId'
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
    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        position: new Vector3(0, 0, column),
        rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI),
        ownerID: userId,
        entityUUID: (userId + '_avatar') as EntityUUID,
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

  dispatchAction(
    AvatarNetworkAction.spawn({
      parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
      position: new Vector3(x, 0, i * 2),
      rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI),
      ownerID: userId,
      entityUUID: (userId + '_avatar') as EntityUUID,
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
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
      name: 'head',
      entityUUID: (userId + ikTargets.head) as EntityUUID,
      blendWeight: 0,
      position
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
      name: 'leftHand',
      entityUUID: (userId + ikTargets.leftHand) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
      name: 'rightHand',
      entityUUID: (userId + ikTargets.rightHand) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
      name: 'leftFoot',
      entityUUID: (userId + ikTargets.leftFoot) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
      name: 'rightFoot',
      entityUUID: (userId + ikTargets.rightFoot) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
}

export const loadAssetTPose = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'TPose Avatar ' + i)
  setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
  setComponent(entity, TransformComponent, {
    position,
    rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI)
  })
  loadAvatarModelAsset(entity, filename)
  setComponent(entity, AvatarAnimationComponent, {
    rootYRatio: 1,
    locomotion: new Vector3()
  })
  setComponent(entity, VisibleComponent, true)
  return entity
}

export const loadAssetWithLoopAnimation = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'Anim Avatar ' + i + ' ' + filename.split('/').pop())
  setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
  setComponent(entity, TransformComponent, {
    position,
    rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI)
  })
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, LoopAnimationComponent, {
    activeClipIndex: 0,
    animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb'
  })
  setComponent(entity, ModelComponent, { src: filename, convertToVRM: true, cameraOcclusion: false })
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
      entityUUID: userID as EntityUUID,
      avatarURL,
      name: avatarURL.split('/').pop() as string
    })
  )

  return userID as UserID
}

export const createIkTargetsForAvatar = (
  parentUUID: EntityUUID,
  userID: string,
  position: Vector3,
  rotation: Quaternion
): EntityUUID[] => {
  const headUUID = (userID + ikTargets.head) as EntityUUID
  const leftHandUUID = (userID + ikTargets.leftHand) as EntityUUID
  const rightHandUUID = (userID + ikTargets.rightHand) as EntityUUID
  const leftFootUUID = (userID + ikTargets.leftFoot) as EntityUUID
  const rightFootUUID = (userID + ikTargets.rightFoot) as EntityUUID

  const targetUUIDs = [headUUID, leftHandUUID, rightHandUUID, leftFootUUID, rightFootUUID]

  const posRot = targetUUIDs.map(() => ({ position: position, rotation: rotation }))

  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: headUUID, name: 'head', blendWeight: 1, ...posRot[0] })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: leftHandUUID,
      name: 'leftHand',
      blendWeight: 1,
      ...posRot[1]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: rightHandUUID,
      name: 'rightHand',
      blendWeight: 1,
      ...posRot[2]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: leftFootUUID,
      name: 'leftFoot',
      blendWeight: 1,
      ...posRot[3]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: rightFootUUID,
      name: 'rightFoot',
      blendWeight: 1,
      ...posRot[4]
    })
  )

  return targetUUIDs
}
