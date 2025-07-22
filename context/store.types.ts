import { UserData } from '@/services/apis/auth'

export interface GlobalState {
  isLoggedIn: boolean
  setIsLoggedIn: (isLoggedIn: boolean) => void
  isRefreshingToken: boolean
  setIsRefreshingToken: (isRefreshingToken: boolean) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  user: UserData | null
  setUser: (user: UserData | null) => void
  reset: () => void
}
