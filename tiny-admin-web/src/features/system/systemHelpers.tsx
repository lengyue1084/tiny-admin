import type { DeptRecord, MenuNode, MenuRecord, PostOption, RoleOption } from '../../shared/api/services'

type TreeOption = {
  key: number
  value: number
  title: string
  disabled?: boolean
  children?: TreeOption[]
}

type TreeSelectOptions = {
  excludeIds?: Set<number>
  disabledIds?: Set<number>
  rootTitle?: string
}

export const dataScopeOptions = [
  { label: '全部数据', value: 'ALL' },
  { label: '本部门及以下', value: 'DEPT_AND_CHILD' },
  { label: '本部门', value: 'DEPT' },
  { label: '仅本人', value: 'SELF' },
]

export const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
]

export const menuTypeOptions = [
  { label: '目录', value: 'CATALOG' },
  { label: '菜单', value: 'MENU' },
  { label: '按钮', value: 'BUTTON' },
]

export const yesNoOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
]

export const noticeTypeOptions = [
  { label: '通知', value: 'INFO' },
  { label: '提醒', value: 'WARN' },
  { label: '成功', value: 'SUCCESS' },
]

export const projectStatusOptions = [
  { label: '规划中', value: '规划中' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
]

export function buildTreeTable<T extends { id: number; parentId: number }>(rows: T[]) {
  const map = new Map<number, T & { children?: Array<T & { children?: any[] }> }>()
  const roots: Array<T & { children?: Array<T & { children?: any[] }> }> = []

  rows.forEach((row) => map.set(row.id, { ...row, children: [] }))
  map.forEach((row) => {
    if (!row.parentId || !map.has(row.parentId)) {
      roots.push(row)
      return
    }
    map.get(row.parentId)?.children?.push(row)
  })

  const sortTree = (items: Array<any>) => {
    items.sort((a, b) => {
      const aOrder = 'orderNum' in a && typeof a.orderNum === 'number' ? a.orderNum : 0
      const bOrder = 'orderNum' in b && typeof b.orderNum === 'number' ? b.orderNum : 0
      return aOrder - bOrder || a.id - b.id
    })
    items.forEach((item) => item.children?.length && sortTree(item.children))
    items.forEach((item) => {
      if (!item.children?.length) {
        delete item.children
      }
    })
  }

  sortTree(roots)
  return roots
}

export function collectSelfAndDescendantIds<T extends { id: number; parentId: number }>(rows: T[], rootId?: number) {
  if (rootId === undefined) {
    return new Set<number>()
  }
  const childrenByParent = new Map<number, number[]>()
  rows.forEach((row) => {
    const children = childrenByParent.get(row.parentId) ?? []
    children.push(row.id)
    childrenByParent.set(row.parentId, children)
  })

  const result = new Set<number>()
  const stack = [rootId]
  while (stack.length) {
    const currentId = stack.pop()!
    if (result.has(currentId)) {
      continue
    }
    result.add(currentId)
    ;(childrenByParent.get(currentId) ?? []).forEach((childId) => stack.push(childId))
  }
  return result
}

export function deptTreeSelectData(rows: DeptRecord[], options: TreeSelectOptions = {}): TreeOption[] {
  const tree = buildTreeTable(rows)
  const nodes = tree
    .map((item) => toDeptNode(item, options))
    .filter((item): item is TreeOption => item !== null)

  if (options.rootTitle) {
    return [{ key: 0, value: 0, title: options.rootTitle }, ...nodes]
  }
  return nodes
}

function toDeptNode(item: DeptRecord & { children?: DeptRecord[] }, options: TreeSelectOptions): TreeOption | null {
  if (options.excludeIds?.has(item.id)) {
    return null
  }
  const children =
    item.children
      ?.map((child) => toDeptNode(child as DeptRecord & { children?: DeptRecord[] }, options))
      .filter((child): child is TreeOption => child !== null) ?? []

  return {
    key: item.id,
    value: item.id,
    title: item.name,
    disabled: options.disabledIds?.has(item.id),
    children: children.length ? children : undefined,
  }
}

export function menuTreeSelectData(rows: MenuRecord[], options: TreeSelectOptions = {}): TreeOption[] {
  const tree = buildTreeTable(rows)
  const nodes = tree
    .map((item) => toMenuNode(item, options))
    .filter((item): item is TreeOption => item !== null)

  if (options.rootTitle) {
    return [{ key: 0, value: 0, title: options.rootTitle }, ...nodes]
  }
  return nodes
}

function toMenuNode(item: MenuRecord & { children?: MenuRecord[] }, options: TreeSelectOptions): TreeOption | null {
  if (options.excludeIds?.has(item.id)) {
    return null
  }
  const children =
    item.children
      ?.map((child) => toMenuNode(child as MenuRecord & { children?: MenuRecord[] }, options))
      .filter((child): child is TreeOption => child !== null) ?? []

  return {
    key: item.id,
    value: item.id,
    title: `${item.name}${item.type === 'BUTTON' ? ' · 按钮' : ''}`,
    disabled: options.disabledIds?.has(item.id),
    children: children.length ? children : undefined,
  }
}

export function roleSelectOptions(options: RoleOption[]) {
  return options.map((item) => ({ label: item.label, value: item.value }))
}

export function postSelectOptions(options: PostOption[]) {
  return options.map((item) => ({ label: item.label, value: item.value }))
}

export function menuCheckTreeData(tree: MenuNode[]): any[] {
  return tree.map((item) => ({
    key: item.id,
    title: item.name,
    children: item.children ? menuCheckTreeData(item.children) : undefined,
  }))
}

export function dataScopeLabel(value?: string) {
  return dataScopeOptions.find((item) => item.value === value)?.label ?? value ?? '-'
}

export function statusLabel(value?: number) {
  return value === 1 ? '启用' : '停用'
}

export function menuTypeLabel(value?: string) {
  return menuTypeOptions.find((item) => item.value === value)?.label ?? value ?? '-'
}
