import React, { useEffect } from 'react'

import { LocationIcons } from '@ir-engine/client-core/src/components/LocationIcons'
import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { LocationService, LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'
import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'

export default function P2PConnection() {
  const online = useHookstate(true)
  useNetwork({ online: online.value })

  AuthService.useAPIListeners()

  useEffect(() => {
    LocationState.setLocationName('default')
    LocationService.getLocationByName('default')
  }, [])

  const networks = useHookstate(getMutableState(NetworkState).networks)

  return (
    <>
      <div style={{ pointerEvents: 'all', position: 'absolute' }}>
        {networks.keys.map((networkID: InstanceID) => (
          <div key={networkID}>
            <br />
            {networkID}
          </div>
        ))}
      </div>
      <LocationIcons />
    </>
  )
}
