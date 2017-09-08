import * as actions from './'
import * as types from './types'

describe('pubsub action creators', () => {

  it('creates action for received message', () => {
    const expectedResult = {
      type: types.WS_RECEIVE_MSG,
      payload: {
        topic: 'testTopic',
        message: 'testMessage'
      }
    }
    expect(actions.receiveMessage('testTopic', 'testMessage')).toEqual(expectedResult)
  })

  it('should create action to establish WS connection', () => {
    const expectedResult = {
      type: types.WS_CONNECT,
      payload: {
        accessKeyId: 'testAccessKey',
        secretKey: 'testSecretKey',
        sessionToken: 'testSessionToken',
        topics: ['topic1', 'topic2']
      }
    }
    expect(actions.connect({
      accessKeyId: 'testAccessKey',
      secretKey: 'testSecretKey',
      sessionToken: 'testSessionToken',
      topics: ['topic1', 'topic2']
    })).toEqual(expectedResult)
  })

  it('should create an action to disconnect WS', () => {
    const expectedResult = {
      type: types.WS_DISCONNECT
    }
    expect(actions.disconnect()).toEqual(expectedResult)
  })
})