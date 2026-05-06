import axios from 'axios'
import { authStorage } from '../hooks/storage'

export type ApiEnvelope<T> = {
  code: string
  message: string
  data: T
  total?: number
  traceId?: string
}

export const apiClient = axios.create({
  baseURL: '/',
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear()
      window.location.replace('/login')
    }
    return Promise.reject(error)
  },
)
