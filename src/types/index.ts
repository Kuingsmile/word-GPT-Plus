import { FetchFn } from 'chatgpt'
export interface IStringKeyMap {
  [propName: string]: any
}

export interface opts {
  accessToken: string
  /** @defaultValue `https://bypass.duti.tech/api/conversation` **/
  apiReverseProxyUrl?: string
  /** @defaultValue `text-davinci-002-render-sha` **/
  model?: string
  /** @defaultValue `false` **/
  debug?: boolean
  /** @defaultValue `undefined` **/
  headers?: Record<string, string>
  fetch?: FetchFn
}
