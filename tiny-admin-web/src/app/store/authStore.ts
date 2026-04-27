import { create } from 'zustand'
import { authApi, systemApi, type CurrentUser, type LoginPayload, type MenuNode } from '../../shared/api/services'
import { authStorage } from '../../shared/hooks/storage'

type AuthState = {
  bootstrapped: boolean
  loading: boolean
  user: CurrentUser | null
  menus: MenuNode[]
  login: (payload: LoginPayload) => Promise<void>
  bootstrap: () => Promise<void>
  logout: () => Promise<void>
  refreshMenus: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  bootstrapped: false,
  loading: false,
  user: authStorage.getUser(),
  menus: [],
  login: async (payload) => {
    set({ loading: true })
    try {
      const envelope = await authApi.login(payload)
      authStorage.setSession(envelope.data.accessToken, envelope.data.refreshToken, envelope.data.userInfo)
      set({ user: envelope.data.userInfo })
      const menus = await systemApi.currentMenus()
      set({ menus: menus.data })
    } finally {
      set({ loading: false })
    }
  },
  bootstrap: async () => {
    if (!authStorage.getAccessToken()) {
      set({ bootstrapped: true, user: null, menus: [] })
      return
    }
    try {
      const profile = await authApi.profile()
      const menus = await systemApi.currentMenus()
      authStorage.setSession(authStorage.getAccessToken()!, authStorage.getRefreshToken() ?? '', profile.data)
      set({ user: profile.data, menus: menus.data, bootstrapped: true })
    } catch {
      authStorage.clear()
      set({ user: null, menus: [], bootstrapped: true })
    }
  },
  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      authStorage.clear()
      set({ user: null, menus: [], bootstrapped: true })
    }
  },
  refreshMenus: async () => {
    const menus = await systemApi.currentMenus()
    set({ menus: menus.data })
  },
}))
