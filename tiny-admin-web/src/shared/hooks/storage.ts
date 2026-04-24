const ACCESS_TOKEN = 'tiny-admin-access-token'
const REFRESH_TOKEN = 'tiny-admin-refresh-token'
const USER_INFO = 'tiny-admin-user'

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN),
  getUser: () => {
    const raw = localStorage.getItem(USER_INFO)
    return raw ? JSON.parse(raw) : null
  },
  setSession: (accessToken: string, refreshToken: string, user: unknown) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken)
    localStorage.setItem(REFRESH_TOKEN, refreshToken)
    localStorage.setItem(USER_INFO, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(REFRESH_TOKEN)
    localStorage.removeItem(USER_INFO)
  },
}
