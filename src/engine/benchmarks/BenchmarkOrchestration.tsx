import { Entity, PresentationSystemGroup, SystemUUID, defineSystem, useQuery } from '@ir-engine/ecs'
import { ParticleSystem } from '@ir-engine/engine'
import {
  AvatarAnimationSystem,
  SkinnedMeshTransformSystem
} from '@ir-engine/engine/src/avatar/systems/AvatarAnimationSystem'
import { defineState, getState, useMutableState } from '@ir-engine/hyperflux'
import { PhysicsPreTransformSystem, PhysicsSystem } from '@ir-engine/spatial'
import React, { useEffect } from 'react'
import { BenchmarkComponent } from '../Register'
import { AvatarBenchmark, AvatarIKBenchmark } from './AvatarBenchmark'
import { ParticlesBenchmark } from './ParticlesBenchmark'
import { PhysicsBenchmark } from './PhysicsBenchmark'
import { ProfileState, SystemProfileData } from './Profiling'

type Benchmark = {
  benchmark: React.FC<{ onComplete: () => void }>
  systemUUIDs: SystemUUID[]
}

export const BenchmarkStage = {
  Particles: 'Particles',
  Physics: 'Physics',
  Avatar: 'Avatar',
  Animation: 'Animation',
  Rendering: 'Rendering',
  IK: 'IK'
} as const

export type BenchmarkStageType = (typeof BenchmarkStage)[keyof typeof BenchmarkStage]

const benchmarkOrder = [
  BenchmarkStage.Physics,
  BenchmarkStage.Particles,
  BenchmarkStage.Avatar,
  BenchmarkStage.Animation,
  BenchmarkStage.Rendering,
  BenchmarkStage.IK
]

export const benchmarks: { [key in BenchmarkStageType]: Benchmark | null } = {
  [BenchmarkStage.Avatar]: {
    benchmark: AvatarBenchmark,
    systemUUIDs: [SkinnedMeshTransformSystem, AvatarAnimationSystem]
  },
  [BenchmarkStage.Physics]: {
    benchmark: PhysicsBenchmark,
    systemUUIDs: [PhysicsSystem, PhysicsPreTransformSystem]
  },
  [BenchmarkStage.Particles]: {
    benchmark: ParticlesBenchmark,
    systemUUIDs: [ParticleSystem]
  },
  [BenchmarkStage.IK]: {
    benchmark: AvatarIKBenchmark,
    systemUUIDs: [SkinnedMeshTransformSystem]
  },
  [BenchmarkStage.Animation]: null,
  [BenchmarkStage.Rendering]: null
}

type BenchmarkData = Record<
  BenchmarkStageType,
  Record<
    SystemUUID,
    {
      before: SystemProfileData
      after: SystemProfileData
    }
  >
>

const BenchmarkState = defineState({
  name: 'BenchmarkState',
  initial: () => {
    return {
      stageIndex: 0,
      data: {} as BenchmarkData
    }
  }
})

const exportBenchmarks = () => {
  const benchmarkState = getState(BenchmarkState)
  const benchmarkJson = JSON.stringify(benchmarkState.data, null, 2)
  const benchmarkName = `benchmarkExport-${ProfileState.GetProfileIdentifier()}.json`

  const blobStr = window.URL.createObjectURL(new Blob([benchmarkJson], { type: 'text/json' }))
  const exportElement = document.createElement('a')
  exportElement.setAttribute('href', blobStr)
  exportElement.setAttribute('download', benchmarkName)
  document.body.appendChild(exportElement)
  exportElement.click()
  exportElement.remove()
}

const useBenchmark = (): [React.FC<{ rootEntity: Entity; onComplete: () => void }> | undefined, () => void] => {
  const benchmarkState = useMutableState(BenchmarkState)
  const benchmarkStage = benchmarkOrder[benchmarkState.stageIndex.value]
  const benchmark = benchmarks[benchmarkStage]

  useEffect(() => {
    const stageIndex = benchmarkState.stageIndex.value
    console.log('Benchmark stage: ' + benchmarkStage)
    if (stageIndex > benchmarkOrder.length) {
      console.log('Benchmarks Complete', benchmarkState.value)
      // All benchmarks run, export results
      exportBenchmarks()
      return
    }

    if (!benchmark) {
      benchmarkState.stageIndex.set(benchmarkState.stageIndex.value + 1)
      return
    } else {
      benchmarkState.data.merge({ [benchmarkStage]: {} })
    }

    const benchmarkData = benchmarkState.data.nested(benchmarkStage)
    const systemUUIDs = benchmark.systemUUIDs
    for (const systemUUID of systemUUIDs) {
      const systemProfileData = ProfileState.GetProfileData(systemUUID)
      benchmarkData.merge({
        [systemUUID]: { before: systemProfileData, after: systemProfileData }
      })
    }
  }, [benchmarkState.stageIndex])

  const onComplete = () => {
    const systemUUIDs = benchmark?.systemUUIDs
    if (!systemUUIDs) return
    const benchmarkData = benchmarkState.data.nested(benchmarkStage)
    for (const systemUUID of systemUUIDs) {
      benchmarkData[systemUUID].after.set(ProfileState.GetProfileData(systemUUID))
    }
    benchmarkState.stageIndex.set(benchmarkState.stageIndex.value + 1)
  }

  return [benchmark?.benchmark, onComplete]
}

const reactor = () => {
  const entity = useQuery([BenchmarkComponent])[0]
  const [Benchmark, onComplete] = useBenchmark()
  return <>{entity && Benchmark && <Benchmark rootEntity={entity} onComplete={onComplete} />}</>
}

export default defineSystem({
  uuid: 'eepro.eetest.BenchmarkOrchestrationSystem',
  reactor,
  insert: { after: PresentationSystemGroup }
})
