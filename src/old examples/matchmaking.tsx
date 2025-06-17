// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'
import { API } from '@ir-engine/common'
import { matchUserPath } from '@ir-engine/common/src/schema.type.module'
import { MatchmakingTicketAssignment, OpenMatchTicket } from '@ir-engine/matchmaking/src/interfaces'
import { matchTicketAssignmentPath } from '@ir-engine/matchmaking/src/match-ticket-assignment.schema'
import { matchTicketPath } from '@ir-engine/matchmaking/src/match-ticket.schema'

const gameModes = ['ctf', 'tournament']

async function findCurrentTicketData() {
  const { data } = await API.instance.service(matchUserPath).find()
  if (data.length) {
    const matchUser = data[0]
    const ticket = await API.instance.service(matchTicketPath).get(matchUser.ticketId)
    if (!ticket) {
      // ticket is outdated - delete match-user row
      await API.instance.service(matchUserPath).remove(matchUser.id)
    } else {
      const gamemode = ticket.search_fields.tags[0]
      return { id: ticket.id, gamemode }
    }
  }
}

interface TicketData {
  id: string
  gamemode: string
}

const Page = () => {
  const history = useHistory()
  const [isUpdating, setIsUpdating] = useState(true)
  const [ticketData, setTicketData] = useState<TicketData | undefined>()
  const [connection, setConnection] = useState<string | undefined>()
  const [instanceId, setInstanceId] = useState<string | undefined>()
  const [locationName, setLocationName] = useState<string | undefined>()

  console.log('RENDER', ticketData, connection)

  useEffect(() => {
    AuthService.doLoginAuto().then(async () => {
      const _ticketData = await findCurrentTicketData()
      setTicketData(_ticketData)
      setIsUpdating(false)
    })
  }, [])

  const ticketId = ticketData?.id
  useEffect(() => {
    if (!ticketId) {
      return
    }

    getAssignment(ticketId)
      .then((assignment) => {
        setConnection(assignment.connection)
        setInstanceId(assignment.instanceId)
        setLocationName(assignment.locationName)
        // setStatus('Found!')
      })
      .catch((e) => {
        console.error(e)
      })
  }, [ticketId])

  useEffect(() => {
    if (connection && instanceId && locationName) {
      setTimeout(() => {
        const matchUrl = '/location/' + locationName + '?instanceId=' + instanceId
        console.log('Match location', matchUrl)
        if (confirm('Game found, relocate to match location?\n' + matchUrl)) {
          history.push(matchUrl)
        }
      }, 500)
    }
  }, [connection, instanceId, locationName])

  async function newTicket(gamemode: string) {
    // setStatus('...')
    setIsUpdating(true)
    let serverTicket: OpenMatchTicket
    try {
      serverTicket = await API.instance.service(matchTicketPath).create({ gamemode })
    } catch (e) {
      const matchUser = (await API.instance.service(matchUserPath).find()).data[0]
      serverTicket = await API.instance.service(matchTicketPath).get(matchUser.ticketId)
      if (!serverTicket) {
        // cleanup
        await API.instance.service(matchUserPath).remove(matchUser.id)
        // create new
        serverTicket = await API.instance.service(matchTicketPath).create({ gamemode })
      }
    }

    setIsUpdating(false)

    if (!serverTicket.id || (ticketData && ticketData.id === serverTicket.id)) {
      return
    }

    if (serverTicket.id && serverTicket.search_fields?.tags) {
      setTicketData({
        id: serverTicket.id,
        gamemode: serverTicket.search_fields?.tags[0]
      })
    }
  }

  async function deleteTicket(ticketId: string) {
    if (!ticketId) {
      return
    }
    await API.instance.service(matchTicketPath).remove(ticketId)
    setTicketData(undefined)
    // setStatus('')
  }

  function getAssignment(ticketId: string): Promise<MatchmakingTicketAssignment> {
    return (API.instance.service(matchTicketAssignmentPath).get(ticketId) as Promise<MatchmakingTicketAssignment>).then(
      (assignment) => {
        console.log('assignment', ticketId, assignment)
        return assignment
      }
    )
  }

  return (
    <div style={{ pointerEvents: 'auto', backgroundColor: 'black', margin: '10px' }}>
      {isUpdating ? (
        <>Loading...</>
      ) : (
        <MatchMakingControl
          modes={gameModes}
          ticket={ticketData}
          connection={connection}
          onJoinQueue={newTicket}
          onExitQueue={deleteTicket}
        />
      )}
    </div>
  )
}

interface MatchMakingControlPropsInterface {
  ticket?: TicketData
  modes: string[]
  connection?: string
  onJoinQueue: (string) => void
  onExitQueue: (string) => void
}

const MatchMakingControl = (props: MatchMakingControlPropsInterface) => {
  // ticketId, gamemode
  const { ticket, connection, onJoinQueue, onExitQueue } = props

  let content
  if (connection) {
    content = (
      <>
        <div style={{ fontSize: 16, textAlign: 'center' }}>{`GAME FOUND, connection: ${connection}.`}</div>
        {ticket?.id ? <button onClick={() => onExitQueue(ticket.id)}>Exit queue</button> : null}
      </>
    )
  } else if (typeof ticket !== 'undefined') {
    content = (
      <>
        <div style={{ fontSize: 16, textAlign: 'center' }}>{`Searching players for ${ticket.gamemode}.`}</div>
        <button onClick={() => onExitQueue(ticket.id)}>Exit queue</button>
      </>
    )
  } else {
    const buttons = props.modes.map((mode) => {
      return (
        <button key={mode} onClick={() => onJoinQueue(mode)}>
          Join: {mode}
        </button>
      )
    })

    content = <>{buttons}</>
  }

  return content
}

export default Page
