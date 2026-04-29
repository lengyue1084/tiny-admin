import { apiClient, type ApiEnvelope } from './client'

export type ListQuery = Record<string, string | number | boolean | undefined>

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

export type MenuRecord = {
  id: number
  parentId: number
  name: string
  path?: string
  component?: string
  icon?: string
  type: 'CATALOG' | 'MENU' | 'BUTTON'
  permissionCode?: string
  orderNum: number
  visible?: number
  status?: number
}

export type DeptRecord = {
  id: number
  parentId: number
  name: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: number
}

export type PostRecord = {
  id: number
  name: string
  code: string
  orderNum: number
  status: number
  remark?: string
}

export type RoleOption = {
  value: number
  label: string
  code: string
}

export type PostOption = {
  value: number
  label: string
  code: string
}

export type UserRecord = {
  id: number
  username: string
  nickName: string
  email?: string
  phone?: string
  deptId?: number
  deptName?: string
  postId?: number
  postName?: string
  status: number
  dataScope: string
  roleIds: number[]
}

export type RoleRecord = {
  id: number
  name: string
  code: string
  dataScope: string
  status: number
  remark?: string
  menuIds: number[]
}

export type DictTypeRecord = {
  id: number
  name: string
  typeCode: string
  status: number
  remark?: string
}

export type DictDataRecord = {
  id: number
  typeId: number
  label: string
  value: string
  tagType?: string
  orderNum: number
  status: number
}

export type ConfigRecord = {
  id: number
  name: string
  configKey: string
  configValue: string
  builtin: number
  remark?: string
}

export type NoticeRecord = {
  id: number
  title: string
  type: string
  content: string
  status: number
}

export type SystemMeta = {
  roleOptions: RoleOption[]
  postOptions: PostOption[]
  deptOptions: DeptRecord[]
  deptTree: Array<DeptRecord & { children?: SystemMeta['deptTree'] }>
  menuOptions: MenuRecord[]
  menuTree: MenuNode[]
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

const getList = <T>(url: string, params?: ListQuery) =>
  unwrap(apiClient.get<ApiEnvelope<T>>(url, { params }))

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
  meta: () => unwrap(apiClient.get<ApiEnvelope<SystemMeta>>('/api/system/meta')),
  currentMenus: () => unwrap(apiClient.get<ApiEnvelope<MenuNode[]>>('/api/system/menus/current')),
  users: (params?: ListQuery) => getList<UserRecord[]>('/api/system/users', params),
  saveUser: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<UserRecord>>('/api/system/users', payload)),
  deleteUser: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/users/${id}`)),
  roles: (params?: ListQuery) => getList<RoleRecord[]>('/api/system/roles', params),
  saveRole: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<RoleRecord>>('/api/system/roles', payload)),
  deleteRole: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/roles/${id}`)),
  menus: (params?: ListQuery) => getList<MenuRecord[]>('/api/system/menus', params),
  saveMenu: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<MenuRecord>>('/api/system/menus', payload)),
  deleteMenu: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/menus/${id}`)),
  depts: (params?: ListQuery) => getList<DeptRecord[]>('/api/system/depts', params),
  saveDept: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<DeptRecord>>('/api/system/depts', payload)),
  deleteDept: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/depts/${id}`)),
  posts: (params?: ListQuery) => getList<PostRecord[]>('/api/system/posts', params),
  savePost: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<PostRecord>>('/api/system/posts', payload)),
  deletePost: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/posts/${id}`)),
  dictTypes: (params?: ListQuery) => getList<DictTypeRecord[]>('/api/system/dicts/types', params),
  dictData: (params?: ListQuery) => getList<DictDataRecord[]>('/api/system/dicts/data', params),
  saveDictType: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<DictTypeRecord>>('/api/system/dicts/types', payload)),
  deleteDictType: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/dicts/types/${id}`)),
  saveDictData: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<DictDataRecord>>('/api/system/dicts/data', payload)),
  deleteDictData: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/dicts/data/${id}`)),
  configs: (params?: ListQuery) => getList<ConfigRecord[]>('/api/system/configs', params),
  saveConfig: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<ConfigRecord>>('/api/system/configs', payload)),
  deleteConfig: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/configs/${id}`)),
  notices: (params?: ListQuery) => getList<NoticeRecord[]>('/api/system/notices', params),
  saveNotice: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<NoticeRecord>>('/api/system/notices', payload)),
  deleteNotice: (id: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/system/notices/${id}`)),
}

export const auditApi = {
  operLogs: (params?: ListQuery) => getList<any[]>('/api/audit/oper-logs', params),
  loginLogs: (params?: ListQuery) => getList<any[]>('/api/audit/login-logs', params),
}

export const monitorApi = {
  server: () => unwrap(apiClient.get<ApiEnvelope<Record<string, unknown>>>('/api/monitor/server')),
  cache: () => unwrap(apiClient.get<ApiEnvelope<Record<string, unknown>>>('/api/monitor/cache')),
  onlineUsers: (params?: ListQuery) => getList<any[]>('/api/monitor/online-users', params),
  forceLogout: (sessionId: string) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/monitor/online-users/${sessionId}`)),
}

export const schedulerApi = {
  jobs: (params?: ListQuery) => getList<any[]>('/api/scheduler/jobs', params),
  logs: (params?: ListQuery) => getList<any[]>('/api/scheduler/job-logs', params),
  saveJob: (payload: Record<string, unknown>) => unwrap(apiClient.post<ApiEnvelope<any>>('/api/scheduler/jobs', payload)),
  triggerJob: (jobId: number) => unwrap(apiClient.post<ApiEnvelope<null>>(`/api/scheduler/jobs/${jobId}/trigger`)),
  updateJobStatus: (jobId: number, status: number) =>
    unwrap(apiClient.post<ApiEnvelope<null>>(`/api/scheduler/jobs/${jobId}/status/${status}`)),
  deleteJob: (jobId: number) => unwrap(apiClient.delete<ApiEnvelope<null>>(`/api/scheduler/jobs/${jobId}`)),
}

export const demoApi = {
  projects: (params?: ListQuery) => getList<any[]>('/api/demo/projects', params),
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
