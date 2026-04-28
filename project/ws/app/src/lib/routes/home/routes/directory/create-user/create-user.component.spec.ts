import { CreateUserComponent } from './create-user.component'
import { of, throwError } from 'rxjs'

describe('CreateUserComponent', () => {
  let component: CreateUserComponent
  let mockOrgSvc: any
  let mockActiveRouter: any

  beforeEach(() => {
    mockOrgSvc = {
      setConfigService: jest.fn(),
      getOrgUserListV1: jest.fn().mockReturnValue(
        of({ result: { response: { content: [] } } })
      ),
    }

    mockActiveRouter = {
      snapshot: {
        queryParams: { roleId: 'org-001' },
        data: { configService: { config: true } },
      },
    }

    component = new CreateUserComponent(mockOrgSvc, mockActiveRouter)
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['fullName', 'email', 'roles', 'actions'])
  })

  it('should default editUser to false', () => {
    expect(component.editUser).toBe(false)
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set orgData from queryParams', () => {
      component.ngOnInit()
      expect(component.orgData).toEqual({ roleId: 'org-001' })
    })

    it('should call setConfigService with snapshot configService', () => {
      component.ngOnInit()
      expect(mockOrgSvc.setConfigService).toHaveBeenCalledWith({ config: true })
    })

    it('should call getUserList with empty string', () => {
      const spy = jest.spyOn(component, 'getUserList')
      component.ngOnInit()
      expect(spy).toHaveBeenCalledWith('')
    })

    it('should set orgData to undefined when queryParams is absent', () => {
      mockActiveRouter.snapshot.queryParams = null
      component = new CreateUserComponent(mockOrgSvc, mockActiveRouter)
      component.ngOnInit()
      // queryParam is null/falsy so the if block is skipped, orgData stays {}
      expect(component.orgData).toEqual({})
    })
  })

  // ─── ngAfterViewInit ─────────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('should assign paginator and sort to dataSource', () => {
      const mockPaginator = {} as any
      const mockSort = {} as any
      component.paginator = mockPaginator
      component.sort = mockSort
      component.ngAfterViewInit()
      expect(component.dataSource.paginator).toBe(mockPaginator)
      expect(component.dataSource.sort).toBe(mockSort)
    })
  })

  // ─── onSearchEnter ───────────────────────────────────────────────────────────

  describe('onSearchEnter', () => {
    it('should call getUserList with provided query', () => {
      const spy = jest.spyOn(component, 'getUserList')
      component.onSearchEnter('john')
      expect(spy).toHaveBeenCalledWith('john')
    })
  })

  // ─── getUserList ─────────────────────────────────────────────────────────────

  describe('getUserList', () => {
    it('should resolve true and populate dataSource on success with content', async () => {
      const users = [
        { firstName: 'Alice', organisations: [{ roles: ['ADMIN'] }] },
      ]
      mockOrgSvc.getOrgUserListV1.mockReturnValue(
        of({ result: { response: { content: users } } })
      )
      component.orgData = { roleId: 'org-001' }
      const result = await component.getUserList('')
      expect(result).toBe(true)
      expect(component.dataSource.data.length).toBe(1)
    })

    it('should build the POST payload with the given query', async () => {
      component.orgData = { roleId: 'org-007' }
      await component.getUserList('test-query')
      expect(mockOrgSvc.getOrgUserListV1).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({ query: 'test-query' }),
        })
      )
    })

    it('should use empty string for query when null-like value passed', async () => {
      component.orgData = { roleId: 'org-007' }
      await component.getUserList('')
      const callArg = mockOrgSvc.getOrgUserListV1.mock.calls[0][0]
      expect(callArg.request.query).toBe('')
    })

    it('should resolve true and not crash when content is absent in response', async () => {
      mockOrgSvc.getOrgUserListV1.mockReturnValue(
        of({ result: { response: {} } })
      )
      const result = await component.getUserList('')
      expect(result).toBe(true)
    })

    it('should resolve false on HTTP error', async () => {
      mockOrgSvc.getOrgUserListV1.mockReturnValue(throwError(() => new Error('HTTP error')))
      const result = await component.getUserList('')
      expect(result).toBe(false)
    })
  })

  // ─── getRoles ────────────────────────────────────────────────────────────────

  describe('getRoles', () => {
    it('should attach roles from first organisation to each user', () => {
      const data = [
        { organisations: [{ roles: ['ADMIN', 'MDO_LEADER'] }] },
        { organisations: [{ roles: ['MDO_ADMIN'] }] },
      ]
      const result = component.getRoles(data)
      expect((result[0] as any).roles).toEqual(['ADMIN', 'MDO_LEADER'])
      expect((result[1] as any).roles).toEqual(['MDO_ADMIN'])
    })

    it('should not set roles when organisations is empty', () => {
      const data = [{ organisations: [] }]
      const result = component.getRoles(data)
      expect((result[0] as any).roles).toBeUndefined()
    })

    it('should return data unchanged when data is empty array', () => {
      expect(component.getRoles([])).toEqual([])
    })

    it('should return data unchanged when data is null/falsy', () => {
      expect(component.getRoles(null)).toBeNull()
    })
  })

  // ─── getFullName ─────────────────────────────────────────────────────────────

  describe('getFullName', () => {
    it('should return firstName and lastName trimmed', () => {
      expect(component.getFullName({ firstName: 'John', lastName: 'Doe' })).toBe('John Doe')
    })

    it('should return only firstName when lastName is absent', () => {
      expect(component.getFullName({ firstName: 'Alice' })).toBe('Alice')
    })

    it('should return only lastName when firstName is absent', () => {
      expect(component.getFullName({ lastName: 'Smith' })).toBe('Smith')
    })

    it('should return empty string when both names are absent', () => {
      expect(component.getFullName({})).toBe('')
    })
  })

  // ─── applyFilter ─────────────────────────────────────────────────────────────

  describe('applyFilter', () => {
    it('should set dataSource.filter to trimmed lowercase value', () => {
      component.applyFilter('  Hello  ')
      expect(component.dataSource.filter).toBe('hello')
    })

    it('should call paginator.firstPage when paginator is set', () => {
      const firstPageMock = jest.fn()
      component.dataSource.paginator = { firstPage: firstPageMock } as any
      component.applyFilter('test')
      expect(firstPageMock).toHaveBeenCalled()
    })

    it('should not throw when paginator is not set', () => {
      component.dataSource.paginator = null as any
      expect(() => component.applyFilter('test')).not.toThrow()
    })
  })

  // ─── createNewUser ───────────────────────────────────────────────────────────

  describe('createNewUser', () => {
    it('should emit true via createUser EventEmitter', () => {
      const emitSpy = jest.spyOn(component.createUser, 'emit')
      component.createNewUser()
      expect(emitSpy).toHaveBeenCalledWith(true)
    })
  })

  // ─── showEditUser ────────────────────────────────────────────────────────────

  describe('showEditUser', () => {
    it('should set selectedUserData and editUser to true', () => {
      const user = { firstName: 'Jane', email: 'jane@test.com' }
      component.showEditUser(user)
      expect(component.selectedUserData).toBe(user)
      expect(component.editUser).toBe(true)
    })
  })

  // ─── deleteUser ──────────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('should not throw when called', () => {
      expect(() => component.deleteUser({ firstName: 'Test' })).not.toThrow()
    })
  })

  // ─── onTabChange ─────────────────────────────────────────────────────────────

  describe('onTabChange', () => {
    it('should set selectedTab to the provided item', () => {
      component.onTabChange({ index: 2, label: 'Users' })
      expect(component.selectedTab).toEqual({ index: 2, label: 'Users' })
    })
  })

  // ─── closeCreate ─────────────────────────────────────────────────────────────

  describe('closeCreate', () => {
    it('should call getUserList with empty string', () => {
      const spy = jest.spyOn(component, 'getUserList')
      component.closeCreate()
      expect(spy).toHaveBeenCalledWith('')
    })
  })

  // ─── emailTransform ──────────────────────────────────────────────────────────

  describe('emailTransform', () => {
    it('should replace dots and @ in primary email', () => {
      const user = {
        profileDetails: {
          personalDetails: { primaryEmail: 'john.doe@example.com' },
        },
      }
      const result = component.emailTransform(user)
      expect(result).toBe('john[dot]doe[at]example[dot]com')
    })

    it('should return undefined when value is undefined', () => {
      expect(component.emailTransform(undefined)).toBeUndefined()
    })

    it('should return undefined when profileDetails is missing', () => {
      expect(component.emailTransform({})).toBeUndefined()
    })
  })

  // ─── getRoleList ─────────────────────────────────────────────────────────────

  describe('getRoleList', () => {
    it('should return HTML list items joined', () => {
      const result = component.getRoleList(['ADMIN', 'MDO_LEADER'])
      expect(result).toBe('<li>ADMIN</li><li>MDO_LEADER</li>')
    })

    it('should return empty array when roles is empty', () => {
      expect(component.getRoleList([])).toEqual([])
    })

    it('should return empty array when roles is null', () => {
      expect(component.getRoleList(null)).toEqual([])
    })
  })

  // ─── updateUserStatus ────────────────────────────────────────────────────────

  describe('updateUserStatus', () => {
    it('should reset editUser and selectedUserData on "cancel"', () => {
      component.editUser = true
      component.selectedUserData = { id: 'u1' }
      component.updateUserStatus('cancel')
      expect(component.editUser).toBe(false)
      expect(component.selectedUserData).toBe('')
    })

    it('should reset editUser and selectedUserData on "CANCEL" (case-insensitive)', () => {
      component.editUser = true
      component.selectedUserData = { id: 'u2' }
      component.updateUserStatus('CANCEL')
      expect(component.editUser).toBe(false)
    })

    it('should reset editUser and selectedUserData on "updated"', () => {
      component.editUser = true
      component.selectedUserData = { id: 'u3' }
      component.updateUserStatus('updated')
      expect(component.editUser).toBe(false)
      expect(component.selectedUserData).toBe('')
    })

    it('should call getUserList when status is cancel', () => {
      const spy = jest.spyOn(component, 'getUserList')
      component.updateUserStatus('cancel')
      expect(spy).toHaveBeenCalledWith('')
    })

    it('should not reset editUser for unknown status', () => {
      component.editUser = true
      component.updateUserStatus('unknown')
      expect(component.editUser).toBe(true)
    })

    it('should not throw when event is null', () => {
      expect(() => component.updateUserStatus(null)).not.toThrow()
    })
  })
})
