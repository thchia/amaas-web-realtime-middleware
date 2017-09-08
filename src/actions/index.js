import * as types from './types'

export const connect = (config) => (
  {
    type: types.WS_CONNECT,
    payload: { ...config }
  }
)

export const receiveMessage = (topic, message) => (
  {
    type: types.WS_RECEIVE_MSG,
    payload: { topic, message }
  }
)

export const connected = () => (
  {
    type: types.WS_RECEIVE_MSG
  }
)

export const closed = () => (
  {
    type: types.WS_CLOSED
  }
)

export const error = (error) => (
  {
    type: types.WS_ERROR,
    payload: { error }
  }
)

export const disconnect = () => (
  {
    type: types.WS_DISCONNECT
  }
)