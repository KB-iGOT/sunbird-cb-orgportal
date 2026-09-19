import { IUserGroupAction } from '../interface/reusable-user-groups.interface'

const toLowerCase = (roles?: string[]): string[] => (roles ?? []).map(role => (role ?? '').toLowerCase())

export function isRoleAllowed(allowedRoles: string[] | undefined, userRoles: Set<string>): boolean {
  const allowed = toLowerCase(allowedRoles)
  return !allowed.length || allowed.some(role => userRoles.has(role))
}

export function isOwnerOnly(action: IUserGroupAction | undefined, userRoles: Set<string>): boolean {
  const ownerOnly = toLowerCase(action?.ownerOnlyRoles)
  if (!ownerOnly.some(role => userRoles.has(role))) {
    return false
  }
  return !toLowerCase(action?.allowedRoles).some(role => userRoles.has(role) && !ownerOnly.includes(role))
}

export function isGroupOwner(owner: string | undefined, userId: string | undefined): boolean {
  return !!userId && owner === userId
}
