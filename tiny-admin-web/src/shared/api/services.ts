import { apiClient, type ApiEnvelope } from './client'

export type LoginPayload = {
  username: string
  password: string
  captchaKey: string
  captchaCode: string
}

export type CurrentUser = {
  userId: number
  username: string
  nickName: string
  deptId?: number
  deptName?: string
  roles: string[]
  permissions: string[]
  dataScope: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  userInfo: CurrentUser
  permissions: string[]
}

export type MenuNode = {
  id: number
  parentId: number
  name: string
  path: string
  component: string
  icon?: string
  type: string
  permission?: string
  orderNum: number
  children?: MenuNode[]
}

export type UploadResult = {
  fileId: string
  url: string
  name: string
  size: number
  contentType: string
}

const unwrap = async <T>(promise: Promise<{ data: ApiEnvelope<T> }>) => {
  const response = await promise
  if (response.data.code !== '00000') {
    throw new Error(response.data.message)
  }
  return response.data
}

export const authApi = {
  captcha: () => unwrap(apiClient.get<ApiEnvelope<{ captchaKey: string; captchaImage: string; captchaText: string }>>('/api/auth/captcha')),
  login: (payload: LoginPayload) => unwrap(apiClient.post<ApiEnvelope<LoginResponse>>('/api/auth/login', payload)),
  refresh: (refreshToken: string) => unwrap(apiClient.post<ApiEnvelope<LoginResponse>>('/api/auth/refresh', { refreshToken })),
  profile: () => unwrap(apiClient.get<ApiEnvelope<CurrentUser>>('/api/auth/profile')),
  logout: () => unwrap(apiClient.post<ApiEnvelope<null>>('/api/auth/logout')),
  updatePassword: (oldPassword: string, newPassword: string) =>
    unwrap(apiClient.post<ApiEnvelope<null>>('/api/auth/update-password', { oldPassword, newPassword })),
}

export const systemApi = {
  currentMenus: () => unwrap(apiClient.get<ApiEnvelope<MenuNode[]>>('/api/system/menus/current')),
  users: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/users')),
  saveUser: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/users', payload)),
  deleteUser: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/users/${id}`)),
  roles: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/roles')),
  saveRole: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/roles', payload)),
  deleteRole: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/roles/${id}`)),
  menus: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/menus')),
  saveMenu: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/menus', payload)),
  deleteMenu: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/menus/${id}`)),
  depts: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/depts')),
  saveDept: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/depts', payload)),
  posts: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/posts')),
  savePost: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/posts', payload)),
  dictTypes: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/dicts/types')),
  dictData: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/dicts/data')),
  saveDictType: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/dicts/types', payload)),
  saveDictData: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/dicts/data', payload)),
  configs: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/configs')),
  saveConfig: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/configs', payload)),
  notices: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/system/notices')),
  saveNotice: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/system/notices', payload)),
}

export const auditApi = {
  operLogs: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/audit/oper-logs')),
  loginLogs: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/audit/login-logs')),
}

export const monitorApi = {
  server: () => unwrap(apiClient.get<ApiEnvelope<Record<string, unknown>>>('/api/monitor/server')),
  cache: () => unwrap(apiClient.get<ApiEnvelope<Record<string, unknown>>>('/api/monitor/cache')),
  onlineUsers: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/monitor/online-users')),
  forceLogout: (sessionId: string) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/monitor/online-users/${sessionId}`)),
}

export const schedulerApi = {
  jobs: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/scheduler/jobs')),
  logs: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/scheduler/job-logs')),
  saveJob: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/scheduler/jobs', payload)),
  triggerJob: (jobId: number) => unwrap(apiClient.post<ApiEnvelope<null>>(`/api/scheduler/jobs/${jobId}/trigger`)),
  updateJobStatus: (jobId: number, status: number) =>
    unwrap(apiClient.post<ApiEnvelope<null>>(`/api/scheduler/jobs/${jobId}/status/${status}`)),
  deleteJob: (jobId: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/scheduler/jobs/${jobId}`)),
}

export const demoApi = {
  projects: () => unwrap(apiClient.get<ApiEnvelope<any[]>>('/api/demo/projects')),
  saveProject: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/demo/projects', payload)),
  deleteProject: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/demo/projects/${id}`)),
}

export const uploadApi = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(apiClient.post<ApiEnvelope<UploadResult>>('/api/files/upload', formData))
  },
}
