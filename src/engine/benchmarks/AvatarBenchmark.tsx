import config from '@ir-engine/common/src/config'
import { UserID } from '@ir-engine/common/src/schema.type.module'
import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import {
  AvatarAnimationComponent,
  AvatarRigComponent
} from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { AvatarColliderComponent } from '@ir-engine/engine/src/avatar/components/AvatarControllerComponent'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  EntityTreeComponent,
  removeEntityNodeRecursively
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { Group, MathUtils, Quaternion, Vector3 } from 'three'
import {
  createIkTargetsForAvatar,
  randomQuaternion,
  randomVec3,
  spawnAvatar
} from '../../examples/utils/avatar/loadAvatarHelpers'
import { useExampleEntity } from '../../examples/utils/common/entityUtils'
import { useAvatars } from '../TestUtils'
import { sleep } from './BenchmarkUtils'

const avatarsToCreate = 10
const benchmarkWaitTime = 3500
const validAnimations = [0, 2, 3, 4, 5, 6, 7, 14, 22, 29]

type AvatarSetupProps = {
  src: string
  position: Vector3
  animIndex: number
  rootEntity: Entity
}

export const AvatarBenchmark = (props: { rootEntity: Entity; onComplete: () => void }) => {
  const { rootEntity, onComplete } = props
  const completedCount = useHookstate(0)
  const avatars = useAvatars()
  const childProps = useHookstate<undefined | AvatarSetupProps[]>(undefined)

  useEffect(() => {
    const avatarArr = avatars.value
    if (!avatarArr.length || !rootEntity) return

    const props = [] as AvatarSetupProps[]
    for (let i = avatarsToCreate; i > 0; i--) {
      const position = getComponent(Engine.instance.viewerEntity, TransformComponent).position.clone()
      position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
      position.setY(0)
      position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
      const avatarSrc = avatarArr[i % avatarArr.length]
      props.push({
        src: avatarSrc,
        position: position,
        animIndex: validAnimations[Math.floor(Math.random() * validAnimations.length)],
        rootEntity: rootEntity
      })
    }
    childProps.set(props)
  }, [avatars])

  useEffect(() => {
    if (completedCount.value == avatarsToCreate) sleep(benchmarkWaitTime).then(onComplete)
  }, [completedCount.value == avatarsToCreate])

  return (
    <>
      {childProps.value &&
        childProps.value.map((props, index) => (
          <AvatarSetupReactor
            key={index}
            {...props}
            onComplete={() => {
              completedCount.set(completedCount.value + 1)
            }}
          />
        ))}
    </>
  )
}

const AvatarSetupReactor = (props: {
  src: string
  position: Vector3
  animIndex: number
  rootEntity: Entity
  onComplete: () => void
}) => {
  const { src, position, animIndex, rootEntity, onComplete } = props
  const entity = useExampleEntity(rootEntity)
  const model = useOptionalComponent(entity, ModelComponent)

  useEffect(() => {
    setComponent(entity, ModelComponent, { src: src, convertToVRM: true })
    setVisibleComponent(entity, true)
    setComponent(entity, LoopAnimationComponent, {
      animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb',
      activeClipIndex: animIndex
    })
    setComponent(entity, TransformComponent, { position })
  }, [])

  useEffect(() => {
    if (model?.scene.value) onComplete()
  }, [model?.scene])

  return null
}

export const AvatarIKBenchmark = (props: { rootEntity: Entity; onComplete: () => void }) => {
  const { rootEntity, onComplete } = props
  const childProps = useHookstate<undefined | AvatarSetupProps[]>(undefined)
  const completedCount = useHookstate(0)
  const avatars = useAvatars()

  useEffect(() => {
    const avatarArr = avatars.value
    if (!avatarArr.length || !rootEntity) return

    const props = [] as AvatarSetupProps[]
    for (let i = 0; i < avatarsToCreate; i++) {
      const position = getComponent(Engine.instance.viewerEntity, TransformComponent).position.clone()
      position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
      position.setY(0)
      position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
      const avatarSrc = avatarArr[i % avatarArr.length]
      props.push({
        src: avatarSrc,
        position: position,
        animIndex: 0,
        rootEntity: rootEntity
      })
    }
    childProps.set(props)
  }, [rootEntity, avatars])

  useEffect(() => {
    if (completedCount.value == avatarsToCreate) sleep(benchmarkWaitTime).then(onComplete)
  }, [completedCount.value == avatarsToCreate])

  return (
    <>
      {childProps.value &&
        childProps.value.map((props, index) => (
          <AvatarIKSetupReactor
            key={index}
            {...props}
            onComplete={() => {
              completedCount.set(completedCount.value + 1)
            }}
          />
        ))}
    </>
  )
}

const AvatarIKSetupReactor = (props: {
  src: string
  position: Vector3
  rootEntity: Entity
  onComplete: () => void
}) => {
  const { src, position, rootEntity, onComplete } = props
  const rootUUID = useComponent(rootEntity, UUIDComponent)
  const entity = useHookstate(createEntity).value
  const model = useOptionalComponent(entity, ModelComponent)

  useEffect(() => {
    const obj3d = new Group()
    obj3d.entity = entity
    const uuid = MathUtils.generateUUID()
    setComponent(entity, UUIDComponent, uuid as EntityUUID)
    setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(entity, Object3DComponent, obj3d)
    setComponent(entity, TransformComponent, { position })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, RigidBodyComponent, { type: 'kinematic' })
    setComponent(entity, NetworkObjectComponent, { ownerId: uuid as UserID })
    setComponent(entity, ModelComponent, { src: src, convertToVRM: true })
    setComponent(entity, AvatarColliderComponent)
    setComponent(entity, AvatarComponent)
    setComponent(entity, AvatarAnimationComponent, {
      locomotion: new Vector3()
    })
    setComponent(entity, AvatarRigComponent)

    spawnAvatar(rootUUID.value, uuid, src, { position, rotation: new Quaternion() })
    const targetUUIDs = createIkTargetsForAvatar(rootUUID.value, uuid, randomVec3(), randomQuaternion())

    return () => {
      for (const targetUUID of targetUUIDs) {
        const targetEntity = UUIDComponent.getEntityByUUID(targetUUID)
        removeEntityNodeRecursively(targetEntity)
      }
      removeEntityNodeRecursively(entity)
    }
  }, [])

  useEffect(() => {
    if (model?.scene.value) onComplete()
  }, [model?.scene])

  return null
}
