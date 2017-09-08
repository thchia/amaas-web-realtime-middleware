declare module '@amaas/amaas-web-realtime-middleware' {
  export default createMW = (device: any) => any

  export const WS_CONNECT = '@@amaas-web-rt-mw/WS_CONNECT'
  export const WS_DISCONNECT = '@@amaas-web-rt-mw/WS_DISCONNECT'
  export const WS_RECEIVE_MSG = '@@amaas-web-rt-mw/RECEIVE_MSG'
  export const WS_CONNECTED = '@@amaas-web-rt-mw/CONNECTED'
  export const WS_CLOSED = '@@amaas-web-rt-mw/CLOSED'
  export const WS_ERROR = '@@amaas-web-rt-mw/ERROR'

  export const connect = (config: IConfigOptions) => ({ type: string, payload: IConfigOptions })
  export const receiveMesage = (topic: string, message: string) => ({ type: string, payload: { topic: string, message: string } })
  export const connected = () => ({ type: string })
  export const closed = () => ({ type: string })
  export const error = (error: string) => ({ type: string, payload: { error: string } })
  export const disconnect = () => ({ type: string })

  export interface IConfigOptions {
    host: string
    clientId: string
    certPath: string
    keyPath: string
    caPath: string
    clientCert: string
    privateKey: string
    caCert: string
    autoResubscribe: string | boolean
    offlineQueueing: string| boolean
    offlineQueueMaxSize: string | number
    offlineQueueDropBehavior: 'oldest' | 'newest'
    drainTimeMs: number
    baseReconnectTimeMs: number
    maximumReconnectTimeMs: number
    minimumConnectionTimeMs: number
    protocol: 'wss' | 'mqtts'
    websocketOptions: any
    filename: string
    profile: string
    accessKeyId: string
    secretKey: string
    sessionToken: string
  }
}