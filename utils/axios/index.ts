import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../constants'
import { BASE_API_URL } from '../../constants/env-vars'
import { AxiosClientProps, PUBLIC_PAGES, PUBLIC_ROUTES } from './axios.types'
import { redirect } from 'next/navigation'

export class AxiosClient {
  _axiosClient: AxiosInstance
  _onAccessTokenExpire?: (error: AxiosError) => void

  constructor({
    baseUrl,
    axiosClient,
    onAccessTokenExpire,
  }: AxiosClientProps = {}) {
    this._axiosClient = axiosClient || axios.create({})
    this._axiosClient.defaults.baseURL = baseUrl || BASE_API_URL

    this._onAccessTokenExpire =
      onAccessTokenExpire || this.defaultOnAccessTokenExpire

    this.mountInterceptors()
  }
  private refreshTokenUrl = '/account/token/refresh/'

  private isPublicRoute(url: string): boolean {
    return PUBLIC_ROUTES.some((route) => url.includes(route))
  }
  private isPublicPage(url: string): boolean {
    return PUBLIC_PAGES.some((route) => url === route)
  }

  private async defaultOnAccessTokenExpire(error: AxiosError) {
    try {
      // if (useGlobalStore.getState().isRefreshingToken) return;
      // useGlobalStore.getState().setIsRefreshingToken(true);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      // Don't attempt refresh if there's no refresh token
      if (!refreshToken) {
        console.log('No refresh token available, redirecting to login')
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        const pathname = window.location.pathname
        if (!this.isPublicPage(pathname)) {
          redirect('/auth/login')
        }
        return Promise.reject(error)
      }

      const refreshTokenResponse = await this._axiosClient.post(
        this.refreshTokenUrl,
        {
          refresh: refreshToken,
        }
      )

      if (refreshTokenResponse.status === 200) {
        const { access, refresh } = refreshTokenResponse.data
        if (access) {
          localStorage.setItem(ACCESS_TOKEN_KEY, access)
        }
        if (refresh) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
        }
        try {
          const retryConfig = { ...error.config }
          const headers = new axios.AxiosHeaders(retryConfig.headers)
          headers.set('Authorization', `Bearer ${access}`)
          retryConfig.headers = headers
          return this._axiosClient.request(retryConfig)
        } catch (retryError) {
          console.error('Error retrying request:', retryError)
          return Promise.reject(retryError)
        }
      }
    } catch (error) {
      console.log('Error refreshing access token:', error)
      // Clear tokens on refresh failure
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      const pathname = window.location.pathname
      if (!this.isPublicPage(pathname)) {
        redirect('/auth/login')
      }
      return Promise.reject(error)
    } finally {
    }
  }

  private async mountInterceptors() {
    this._axiosClient.interceptors.request.use(async (config) => {
      const tokenExists = localStorage.getItem(ACCESS_TOKEN_KEY) != null
      const url = config.url || ''
      if (tokenExists && !this.isPublicRoute(url)) {
        config.headers.Authorization = `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}`
      }

      return config
    })

    // if response status is 401, call refresh token api and retry
    this._axiosClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (
          error.config &&
          error?.response?.status === 401 &&
          !this.isPublicRoute(error.config?.url || '') &&
          error.config.url !== this.refreshTokenUrl &&
          localStorage.getItem(REFRESH_TOKEN_KEY) // Only try refresh if refresh token exists
        ) {
          await this._onAccessTokenExpire?.(error)
        }

        return Promise.reject(error)
      }
    )

    this._axiosClient.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config
      }
    )
  }

  custom(config: AxiosRequestConfig) {
    return this._axiosClient(config)
  }

  get<R = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'get', url, ...config })
  }

  post<T, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'post', url, data, ...config })
  }

  put<T, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'put', url, data, ...config })
  }

  patch<T, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'patch', url, data, ...config })
  }

  delete<R = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'delete', url, ...config })
  }
}
