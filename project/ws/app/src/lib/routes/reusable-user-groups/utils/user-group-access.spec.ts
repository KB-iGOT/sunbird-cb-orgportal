import { isGroupOwner, isOwnerOnly, isRoleAllowed } from './user-group-access'

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
})
