import {
  WS_CONNECT,
  WS_DISCONNECT,
  WS_RECEIVE_MSG,
  WS_CONNECTED,
  WS_CLOSED,
  WS_ERROR
} from './actions/types'
import {
  closed,
  connect,
  connected,
  disconnect,
  error,
  receiveMessage
} from './actions'

const createMW = Device => {
  // This needs to be an array for potential extra clients
  let ws = []

  const initialiseWS = (store, config) => {
    const clientId = Date.now().toString()
    const conn = new Device(config)
    ws.push({ id: clientId, conn, subCount: 0 })

    conn.on('connect', () => {
      store.dispatch(connected())
      subscribe(store, config)
    })
    conn.on('close', () => {
      store.dispatch(closed())
    })
    conn.on('error', error => {
      store.dispatch(error(error))
    })
    conn.on('message', (topic, messageEnc) => {
      const message = messageEnc.toString()
      store.dispatch(receiveMessage(topic, message))
    })
  }

  const subscribe = (store, config) => {
    if (config.topics.length === 0) return

    // Cannot subscribe to more than 50 topics in a single connection
    const { topics } = config
    const lastIndex = ws.length - 1
    const lastConnLength = ws[lastIndex].subCount
    const availableSubsInConn = 50 - lastConnLength
    if (ws && ws.length > 0) {
      // First fill up the remaining subscriptions in the last connection
      topics.slice(0, availableSubsInConn).map(topic => {
        ws[lastIndex].conn.subscribe(topic)
      })
      ws[lastIndex].subCount =
        lastConnLength + topics.slice(0, availableSubsInConn).length
      // If there are still subscriptions left over, initialise another connection
      if (topics.slice(availableSubsInConn - 1, 50).length > 0) {
        const remainingTopics = config.topics.slice(availableSubsInConn)
        config.topics = remainingTopics
        initialiseWS(store, config)
      }
    } else {
      console.error('Cannot subscribe as there is no WS instance open')
    }
  }

  return store => next => action => {
    switch (action.type) {
      case WS_CONNECT:
        const config = action.payload
        initialiseWS(store, config)
        return next(action)
      case WS_DISCONNECT:
        if (ws && ws.length > 0) {
          ws.map(connection => {
            connection.conn.end()
          })
          ws = []
        }
        return next(action)
      default:
        return next(action)
    }
  }
}

export default createMW
export {
  WS_CONNECT,
  WS_DISCONNECT,
  WS_RECEIVE_MSG,
  WS_CONNECTED,
  WS_CLOSED,
  WS_ERROR
}
export { closed, connect, connected, disconnect, error, receiveMessage }
