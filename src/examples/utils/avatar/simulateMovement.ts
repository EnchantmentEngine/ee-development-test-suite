import { NetworkObjectComponent, SourceID } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { ikTargets } from '@ir-engine/engine/src/avatar/animation/Util'
import { AvatarRigComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { AvatarIKTargetComponent } from '@ir-engine/engine/src/avatar/components/AvatarIKComponents'
import {
  leftControllerOffset,
  rightControllerOffset
} from '@ir-engine/engine/src/avatar/functions/applyInputSourcePoseToIKTargets'
import { getState } from '@ir-engine/hyperflux'
import { Q_Y_180 } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { lerp } from '@ir-engine/spatial/src/common/functions/MathLerpFunctions'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

const entitiesQuery = defineQuery([NetworkObjectComponent, RigidBodyComponent, AvatarComponent, AvatarRigComponent])

let enabled = true
window.addEventListener('keydown', (ev) => {
  if (ev.code !== 'KeyO') return
  enabled = !enabled
})

const execute = () => {
  const entities = entitiesQuery()
  //q.setFromAxisAngle(V_010, (Math.PI / 180) * getState(ECSState).deltaSeconds * 60)
  for (const entity of entities) {
    const ownerID = getComponent(entity, NetworkObjectComponent).ownerId as any as SourceID
    const headTargetEntity = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.head)
    const ikTargetLeftHand = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.leftHand)
    const ikTargetRightHand = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.rightHand)
    const ikTargetLeftFoot = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.leftFoot)
    const ikTargetRightFoot = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.rightFoot)

    const strength = lerp(
      AvatarIKTargetComponent.blendWeight[headTargetEntity],
      enabled ? 1 : 0,
      getState(ECSState).deltaSeconds
    )
    if (headTargetEntity) AvatarIKTargetComponent.blendWeight[headTargetEntity] = strength
    if (ikTargetLeftHand) AvatarIKTargetComponent.blendWeight[ikTargetLeftHand] = strength
    if (ikTargetRightHand) AvatarIKTargetComponent.blendWeight[ikTargetRightHand] = strength
    if (ikTargetLeftFoot) AvatarIKTargetComponent.blendWeight[ikTargetLeftFoot] = strength
    if (ikTargetRightFoot) AvatarIKTargetComponent.blendWeight[ikTargetRightFoot] = strength

    if (!enabled) continue

    const rigidbody = getComponent(entity, RigidBodyComponent)
    //rigidbody.body.setTranslation(rigidbody.position, true)
    const transform = getComponent(entity, TransformComponent)
    const elapsedSeconds = getState(ECSState).elapsedSeconds
    const movementFactor = (Math.sin(elapsedSeconds * 2) + 1) * 0.5
    if (headTargetEntity) {
      const head = getComponent(headTargetEntity, TransformComponent)
      head.position.copy(rigidbody.position)
      const headTargetY = (Math.sin(elapsedSeconds * 2) + 1) * 0.5
      head.position.y += headTargetY + 1
      head.rotation.copy(transform.rotation)
    }
    const avatar = getComponent(entity, AvatarComponent)

    if (ikTargetLeftHand) {
      const leftHandTransform = getComponent(ikTargetLeftHand, TransformComponent)
      leftHandTransform.position
        .set(0.4, 1.2, 0.1 + movementFactor * 0.3)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      leftHandTransform.rotation.multiplyQuaternions(transform.rotation, Q_Y_180).multiply(leftControllerOffset)
    }
    if (ikTargetRightHand) {
      const rightHandTransform = getComponent(ikTargetRightHand, TransformComponent)
      rightHandTransform.position
        .set(-0.4, 1.2, 0.1 + movementFactor * 0.3)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      rightHandTransform.rotation.multiplyQuaternions(transform.rotation, Q_Y_180).multiply(rightControllerOffset)
    }
    if (ikTargetLeftFoot) {
      const leftFootTransform = getComponent(ikTargetLeftFoot, TransformComponent)
      leftFootTransform.position
        .set(avatar.footGap, avatar.footHeight, 0)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      leftFootTransform.rotation.copy(transform.rotation)
    }
    if (ikTargetRightFoot) {
      const rightFootTransform = getComponent(ikTargetRightFoot, TransformComponent)
      rightFootTransform.position
        .set(-avatar.footGap, avatar.footHeight, 0)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      rightFootTransform.rotation.copy(transform.rotation)
    }
  }
}

export const SimulateAvatarMovementSystem = defineSystem({
  uuid: 'ee.development-test-suite.SimulateAvatarMovementSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
