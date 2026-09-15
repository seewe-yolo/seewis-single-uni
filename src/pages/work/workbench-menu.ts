import type { IUserInfoRes } from '@/api/types/login'
import workbenchMenu from './workbench-menu.json'

export interface WorkbenchMenuItem {
  key: string
  label: string
  hint: string
  icon: string
  tone: string
  route: string
  roles?: string[]
  permissions?: string[]
}

const ALL_ROLE = '*'
const ALL_PERMISSION = '*:*:*'
const SUPER_ADMIN_ROLE = 'superadmin'
const menuItems = workbenchMenu as WorkbenchMenuItem[]

function matches(required: string[] | undefined, actual: string[], wildcard: string) {
  return !required?.length
    || required.includes(wildcard)
    || actual.includes(wildcard)
    || required.some(value => actual.includes(value))
}

export function getVisibleWorkbenchMenus(userInfo: Pick<IUserInfoRes, 'roles' | 'permissions'>) {
  const roles = userInfo.roles ?? []
  const permissions = userInfo.permissions ?? []

  if (roles.includes(SUPER_ADMIN_ROLE) || permissions.includes(ALL_PERMISSION)) {
    return menuItems
  }

  return menuItems.filter(item =>
    matches(item.roles, roles, ALL_ROLE)
    && matches(item.permissions, permissions, ALL_PERMISSION),
  )
}
