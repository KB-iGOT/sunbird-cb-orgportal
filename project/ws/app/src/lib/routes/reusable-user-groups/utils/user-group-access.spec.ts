import { IUserGroup } from '../interface/reusable-user-groups.interface'
// eslint-disable-next-line max-len
import { canActOnGroup, isActionDisabled, isActionVisible, isGroupOwner, isOwnerOnly, isRoleAllowed, isSameOrg } from './user-group-access'

const edit = { key: 'edit', label: 'Edit', allowedRoles: ['mdo_leader', 'mdo_admin'], ownerOnlyRoles: ['mdo_admin'] }

describe('user group access', () => {
  describe('isRoleAllowed', () => {
    it('should open an action with no allowedRoles to everyone', () => {
      expect(isRoleAllowed(undefined, new Set())).toBe(true)
      expect(isRoleAllowed([], new Set())).toBe(true)
    })

    it('should allow a role named in allowedRoles', () => {
      expect(isRoleAllowed(['mdo_leader'], new Set(['mdo_leader']))).toBe(true)
    })

    it('should match the configured role whatever its case', () => {
      expect(isRoleAllowed(['MDO_LEADER'], new Set(['mdo_leader']))).toBe(true)
    })

    it('should refuse a role that is not named', () => {
      expect(isRoleAllowed(['spv_admin'], new Set(['mdo_leader']))).toBe(false)
    })
  })

  describe('isOwnerOnly', () => {
    it('should limit an admin to the groups they created', () => {
      expect(isOwnerOnly(edit, new Set(['mdo_admin']))).toBe(true)
    })

    it('should leave a leader unlimited', () => {
      expect(isOwnerOnly(edit, new Set(['mdo_leader']))).toBe(false)
    })

    it('should leave an admin who is also a leader unlimited', () => {
      expect(isOwnerOnly(edit, new Set(['mdo_admin', 'mdo_leader']))).toBe(false)
    })

    it('should leave an action with no ownerOnlyRoles unlimited', () => {
      expect(isOwnerOnly({ key: 'use', label: 'Use' }, new Set(['mdo_admin']))).toBe(false)
      expect(isOwnerOnly(undefined, new Set(['mdo_admin']))).toBe(false)
    })

    it('should match the configured ownership role whatever its case', () => {
      expect(isOwnerOnly({ ...edit, ownerOnlyRoles: ['MDO_ADMIN'] }, new Set(['mdo_admin']))).toBe(true)
    })

    it('should limit an admin on an action every role may reach', () => {
      const openToEveryRole = { key: 'edit', label: 'Edit', ownerOnlyRoles: ['mdo_admin'] }
      expect(isOwnerOnly(openToEveryRole, new Set(['mdo_admin']))).toBe(true)
    })
  })

  describe('isGroupOwner', () => {
    it('should own a group created under the same id', () => {
      expect(isGroupOwner('user-1', 'user-1')).toBe(true)
    })

    it('should not own a group created by somebody else', () => {
      expect(isGroupOwner('user-2', 'user-1')).toBe(false)
    })

    it('should own nothing while the signed in id is unknown', () => {
      expect(isGroupOwner(undefined, undefined)).toBe(false)
      expect(isGroupOwner('', '')).toBe(false)
    })
  })

  describe('isSameOrg', () => {
    it('should match a group raised in the signed in organisation', () => {
      expect(isSameOrg('org-1', 'org-1')).toBe(true)
    })

    it('should not match a group raised elsewhere', () => {
      expect(isSameOrg('org-2', 'org-1')).toBe(false)
    })

    it('should match nothing while the signed in organisation is unknown', () => {
      expect(isSameOrg('org-1', undefined)).toBe(false)
      expect(isSameOrg('', '')).toBe(false)
    })
  })

  describe('canActOnGroup', () => {
    const del = { key: 'delete', label: 'Delete', allowedRoles: ['mdo_leader', 'mdo_admin'], ownerOnlyRoles: ['mdo_admin'] }
    const group = (owner: string, org: string) => ({ ownerId: owner, orgId: org } as IUserGroup)
    const viewer = (roles: string[]) => ({ roles: new Set(roles), userId: 'user-1', orgId: 'org-1' })

    it('should let an admin delete the group they created', () => {
      expect(canActOnGroup(del, group('user-1', 'org-1'), viewer(['mdo_admin']))).toBe(true)
    })

    it('should stop an admin deleting a group somebody else created', () => {
      expect(canActOnGroup(del, group('user-2', 'org-1'), viewer(['mdo_admin']))).toBe(false)
    })

    it('should let a leader delete any group in their own organisation', () => {
      expect(canActOnGroup(del, group('user-2', 'org-1'), viewer(['mdo_leader']))).toBe(true)
    })

    it('should stop a leader deleting a group from another organisation', () => {
      expect(canActOnGroup(del, group('user-2', 'org-2'), viewer(['mdo_leader']))).toBe(false)
    })

    it('should refuse a role the action does not name', () => {
      expect(canActOnGroup(del, group('user-1', 'org-1'), viewer(['public']))).toBe(false)
    })

    it('should leave an action that is not organisation scoped open across organisations', () => {
      const copy = { key: 'copy', label: 'Copy' }
      expect(canActOnGroup(copy, group('user-2', 'org-2'), viewer(['public']))).toBe(true)
    })

    it('should honour an explicit orgScoped flag over the default', () => {
      expect(canActOnGroup({ ...del, orgScoped: false, ownerOnlyRoles: [] }, group('user-2', 'org-2'), viewer(['mdo_leader']))).toBe(true)
      expect(canActOnGroup({ key: 'copy', label: 'Copy', orgScoped: true }, group('user-2', 'org-2'), viewer(['public']))).toBe(false)
    })
  })

  describe('isActionVisible', () => {
    const del = { key: 'delete', label: 'Delete', allowedRoles: ['mdo_leader', 'mdo_admin'], ownerOnlyRoles: ['mdo_admin'] }
    const group = (owner: string, org: string) => ({ ownerId: owner, orgId: org } as IUserGroup)
    const viewer = (roles: string[]) => ({ roles: new Set(roles), userId: 'user-1', orgId: 'org-1' })

    it('should draw the action on a group the admin did not create, so it can be shown greyed out', () => {
      expect(isActionVisible(del, group('user-2', 'org-1'), viewer(['mdo_admin']))).toBe(true)
    })

    it('should drop the action on a group from another organisation', () => {
      expect(isActionVisible(del, group('user-2', 'org-2'), viewer(['mdo_leader']))).toBe(false)
    })

    it('should drop the action for a role it does not name', () => {
      expect(isActionVisible(del, group('user-1', 'org-1'), viewer(['public']))).toBe(false)
    })
  })

  describe('isActionDisabled', () => {
    const del = { key: 'delete', label: 'Delete', allowedRoles: ['mdo_leader', 'mdo_admin'], ownerOnlyRoles: ['mdo_admin'] }
    const group = (owner: string, org: string) => ({ ownerId: owner, orgId: org } as IUserGroup)
    const viewer = (roles: string[]) => ({ roles: new Set(roles), userId: 'user-1', orgId: 'org-1' })

    it('should grey the action out for an admin on a group somebody else created', () => {
      expect(isActionDisabled(del, group('user-2', 'org-1'), viewer(['mdo_admin']))).toBe(true)
    })

    it('should leave the action live for an admin on their own group', () => {
      expect(isActionDisabled(del, group('user-1', 'org-1'), viewer(['mdo_admin']))).toBe(false)
    })

    it('should leave the action live for a leader on any group', () => {
      expect(isActionDisabled(del, group('user-2', 'org-1'), viewer(['mdo_leader']))).toBe(false)
    })
  })
})
