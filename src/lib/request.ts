import * as requestPromiseNative from 'request-promise-native'
import { config } from '~/config'
const { userAgent } = config

export const request = async (url: string, options?: any) => {
  const headers = (options && options.headers) || {}
  const response = await requestPromiseNative(url, {
    ...options,
    timeout: 10000,
    headers: {
      ...headers,
      'User-Agent': userAgent
    },
  })

  return response
}