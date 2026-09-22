import { IUserGroup, IUserGroupAction } from '../interface/reusable-user-groups.interface'

export interface IUserGroupViewer {
  roles: Set<string>
  userId: string
  orgId: string
}

const ORG_SCOPED_ACTIONS = ['edit', 'delete']

const lower = (roles?: string[]): string[] => (roles ?? []).map(role => (role ?? '').toLowerCase())

const hasAny = (roles: string[] | undefined, userRoles: Set<string>): boolean =>
  lower(roles).some(role => userRoles.has(role))

export function isRoleAllowed(allowedRoles: string[] | undefined, userRoles: Set<string>): boolean {
  return !allowedRoles?.length || hasAny(allowedRoles, userRoles)
}

/** True when every role the user reaches the action through is limited to the groups they created. */
export function isOwnerOnly(action: IUserGroupAction | undefined, userRoles: Set<string>): boolean {
  const ownerOnly = lower(action?.ownerOnlyRoles)
  const unrestricted = lower(action?.allowedRoles).filter(role => !ownerOnly.includes(role))
  return hasAny(ownerOnly, userRoles) && !hasAny(unrestricted, userRoles)
}

export function isGroupOwner(ownerId: string | undefined, userId: string | undefined): boolean {
  return !!userId && ownerId === userId
}

export function isSameOrg(groupOrgId: string | undefined, userOrgId: string | undefined): boolean {
  return !!userOrgId && groupOrgId === userOrgId
}

/** Edit and delete stay inside the user's own organisation; anything else is open unless the config says so. */
function isOrgScoped(action: IUserGroupAction | undefined): boolean {
  return action?.orgScoped ?? ORG_SCOPED_ACTIONS.includes(action?.key ?? '')
}

export function isActionVisible(
  action: IUserGroupAction | undefined,
  group: IUserGroup | undefined,
  viewer: IUserGroupViewer,
): boolean {
  if (!isRoleAllowed(action?.allowedRoles, viewer.roles)) {
    return false
  }
  return !isOrgScoped(action)
    || isGroupOwner(group?.ownerId, viewer.userId)
    || isSameOrg(group?.orgId, viewer.orgId)
}

export function isActionDisabled(
  action: IUserGroupAction | undefined,
  group: IUserGroup | undefined,
  viewer: IUserGroupViewer,
): boolean {
  return isOwnerOnly(action, viewer.roles) && !isGroupOwner(group?.ownerId, viewer.userId)
}

export function canActOnGroup(
  action: IUserGroupAction | undefined,
  group: IUserGroup | undefined,
  viewer: IUserGroupViewer,
): boolean {
  return isActionVisible(action, group, viewer) && !isActionDisabled(action, group, viewer)
}
