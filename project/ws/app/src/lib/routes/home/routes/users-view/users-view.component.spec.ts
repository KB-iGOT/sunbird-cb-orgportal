import { UsersViewComponent } from './users-view.component'
import { of, Subject } from 'rxjs'

// Mock dependencies
const mockDialog = {
  open: jest.fn()
}

const mockRoute = {
  snapshot: {
    params: { tab: 'allusers' },
    parent: {
      data: {
        configService: {
          userProfile: { userId: 'test-user-id' },
          unMappedUser: {
            profileDetails: { profileStatus: 'VERIFIED' },
            channel: 'test-channel',
            roles: ['MDO_ADMIN'],
            rootOrg: { rootOrgId: 'test-root-org' }
          }
        }
      }
    }
  },
  parent: {
    snapshot: {
      data: {
        configService: {
          userProfile: { userId: 'test-user-id' },
          unMappedUser: {
            profileDetails: { profileStatus: 'VERIFIED' },
            channel: 'test-channel',
            roles: ['MDO_ADMIN']
          }
        }
      }
    }
  }
}

const mockRouter = {
  navigate: jest.fn()
}

const mockEvents = {
  handleTabTelemetry: jest.fn(),
  raiseInteractTelemetry: jest.fn()
}

const mockLoaderService = {
  changeLoad: new Subject()
}

const mockSanitizer = {
  bypassSecurityTrustHtml: jest.fn((html) => html)
}

const mockUsersService = {
  TOTAL_USERS_LIMIT: 1000,
  getAllKongUsers: jest.fn()
}

const mockApprService = {
  getApprovalsList: jest.fn()
}

describe('UsersViewComponent', () => {
  let component: UsersViewComponent

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Create component instance
    component = new UsersViewComponent(
      mockDialog as any,
      mockRoute as any,
      mockRouter as any,
      mockEvents as any,
      mockLoaderService as any,
      mockSanitizer as any,
      mockUsersService as any,
      mockApprService as any
    )
  })

  describe('Constructor', () => {
    it('should initialize component with correct default values', () => {
      expect(component.Math).toBe(Math)
      expect(component.currentFilter).toBe('allusers')
      expect(component.isLoading).toBe(false)
      expect(component.currentOffset).toBe(0)
      expect(component.limit).toBe(20)
      expect(component.pageIndex).toBe(0)
      expect(component.searchQuery).toBe('')
      expect(component.currentUser).toBe('test-user-id')
      expect(component.currentUserStatus).toBe('VERIFIED')
      expect(component.departName).toBe('test-channel')
      expect(component.totalUserLimit).toBe(1000)
    })

    it('should set isMdoAdmin to true when user has MDO_ADMIN role', () => {
      expect(component.isMdoAdmin).toBe(true)
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      // Mock the service methods
      mockUsersService.getAllKongUsers.mockReturnValue(of({
        result: {
          response: {
            content: [],
            count: 0
          }
        }
      }))
      mockApprService.getApprovalsList.mockReturnValue(of({
        result: { data: [] }
      }))
    })

    it('should initialize component on ngOnInit', () => {
      const spyGetNMUsers = jest.spyOn(component, 'getNMUsers')
      const spyGetAllUsers = jest.spyOn(component, 'getAllUsers')
      const spyGetVUsers = jest.spyOn(component, 'getVUsers')
      const spyGetNVUsers = jest.spyOn(component, 'getNVUsers')
      const spyFetchApprovals = jest.spyOn(component, 'fetchApprovals')

      component.ngOnInit()

      expect(component.currentFilter).toBe('allusers')
      expect(component.rootOrgId).toBe('test-root-org')
      expect(component.searchQuery).toBe('')
      expect(component.reportsNoteList).toHaveLength(4)
      expect(spyGetNMUsers).toHaveBeenCalledWith('')
      expect(spyGetAllUsers).toHaveBeenCalledWith('')
      expect(spyGetVUsers).toHaveBeenCalledWith('')
      expect(spyGetNVUsers).toHaveBeenCalledWith('')
      expect(spyFetchApprovals).toHaveBeenCalled()
    })
  })

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const htmlContent = '<p>Test content</p>'
      const result = component.sanitizeHtml(htmlContent)

      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(htmlContent)
      expect(result).toBe(htmlContent)
    })
  })

  describe('openVideoPopup', () => {
    it('should open video popup with correct configuration', () => {
      component.openVideoPopup()

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        {
          data: {
            videoLink: 'https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1',
          },
          disableClose: true,
          width: '50%',
          height: '60%',
          panelClass: 'overflow-visable',
        }
      )
    })
  })

  describe('filter', () => {
    it('should update filter parameters and call filterData', () => {
      const spyFilterData = jest.spyOn(component, 'filterData')
      const filterType = 'verified'

      component.filter(filterType)

      expect(component.currentFilter).toBe(filterType)
      expect(component.pageIndex).toBe(0)
      expect(component.currentOffset).toBe(0)
      expect(component.limit).toBe(20)
      expect(component.searchQuery).toBe('')
      expect(spyFilterData).toHaveBeenCalledWith('')
    })
  })

  describe('tabTelemetry', () => {
    it('should handle tab telemetry', () => {
      const label = 'test-label'
      const index = 1

      component.tabTelemetry(label, index)

      expect(mockEvents.handleTabTelemetry).toHaveBeenCalledWith(
        expect.any(String),
        { label, index }
      )
    })
  })

  describe('filterData', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getAllUsers').mockImplementation(() => Promise.resolve())
      jest.spyOn(component, 'getVUsers').mockImplementation(() => Promise.resolve())
      jest.spyOn(component, 'getNVUsers').mockImplementation(() => Promise.resolve())
      jest.spyOn(component, 'getNMUsers').mockImplementation(() => Promise.resolve())
      jest.spyOn(component, 'fetchApprovals').mockImplementation(() => { })
    })

    it('should call getAllUsers when currentFilter is allusers', () => {
      component.currentFilter = 'allusers'
      const query = 'test-query'

      component.filterData(query)

      expect(component.getAllUsers).toHaveBeenCalledWith(query)
    })

    it('should call getVUsers when currentFilter is verified', () => {
      component.currentFilter = 'verified'
      const query = 'test-query'

      component.filterData(query)

      expect(component.getVUsers).toHaveBeenCalledWith(query)
    })

    it('should call getNVUsers and fetchApprovals when currentFilter is nonverified', () => {
      component.currentFilter = 'nonverified'
      const query = 'test-query'

      component.filterData(query)

      expect(component.fetchApprovals).toHaveBeenCalled()
      expect(component.getNVUsers).toHaveBeenCalledWith(query)
    })

    it('should call getNMUsers when currentFilter is notmyuser', () => {
      component.currentFilter = 'notmyuser'
      const query = 'test-query'

      component.filterData(query)

      expect(component.getNMUsers).toHaveBeenCalledWith(query)
    })
  })

  describe('showEditUser', () => {
    beforeEach(() => {
      component.isMdoAdmin = true
    })

    it('should return true when user is MDO admin and has roles', () => {
      const roles = ['PUBLIC', 'USER']
      const result = component.showEditUser(roles)
      expect(result).toBe(true)
    })

    it('should return true when user is MDO admin and has no roles', () => {
      const roles: any = []
      const result = component.showEditUser(roles)
      expect(result).toBe(true)
    })

    it('should return true when user is not MDO admin', () => {
      component.isMdoAdmin = false
      const roles = ['PUBLIC']
      const result = component.showEditUser(roles)
      expect(result).toBe(true)
    })
  })

  describe('updateUserCounts', () => {
    it('should update user counts for all_user tab', () => {
      const mockUsers = { content: [{ id: 1 }, { id: 2 }] }
      const userCount = 100

      component.updateUserCounts(mockUsers, userCount, 'all_user')

      expect(component.activeUsersData).toEqual(mockUsers.content)
      expect(component.activeUsersDataCount).toBe(userCount)
      expect(component.activeUsersDataCountInner).toBe(userCount)
      expect(component.isMoreThanLimit).toBe(false)
    })

    it('should update user counts for ver_user tab', () => {
      const mockUsers = { content: [{ id: 1 }] }
      const userCount = 50

      component.updateUserCounts(mockUsers, userCount, 'ver_user')

      expect(component.verifiedUsersData).toEqual(mockUsers.content)
      expect(component.verifiedUsersDataCount).toBe(userCount)
      expect(component.verifiedUsersDataCountInner).toBe(userCount)
    })

    it('should set isMoreThanLimit to true when count exceeds limit', () => {
      const mockUsers = { content: [] }
      const userCount = 1500
      component.totalUserLimit = 1000

      component.updateUserCounts(mockUsers, userCount, 'all_user')

      expect(component.isMoreThanLimit).toBe(true)
      expect(component.activeUsersDataCountInner).toBe(1000)
    })

    it('should handle users without content property', () => {
      const mockUsers = [{ id: 1 }, { id: 2 }]
      const userCount = 2

      component.updateUserCounts(mockUsers, userCount, 'all_user')

      expect(component.activeUsersData).toEqual(mockUsers)
      expect(component.activeUsersDataCount).toBe(userCount)
    })
  })

  describe('getAllUsers', () => {
    it('should call usersService.getAllKongUsers with correct parameters', async () => {
      const mockResponse = {
        result: {
          response: {
            content: [{ id: 1, firstName: 'John' }],
            count: 1
          }
        }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))
      component.rootOrgId = 'test-root-org'

      await component.getAllUsers('')

      expect(mockUsersService.getAllKongUsers).toHaveBeenCalledWith({
        request: {
          filters: {
            rootOrgId: 'test-root-org',
            'profileDetails.profileStatus': ['VERIFIED', 'NOT-VERIFIED'],
            status: 1,
          },
          limit: 20,
          offset: 0,
          query: '',
          sort_by: { firstName: 'asc' },
        }
      })
    })

    it('should handle search query filtering', async () => {
      const mockResponse = {
        result: {
          response: {
            content: [
              {
                id: 1,
                firstName: 'john',
                email: 'john@test.com',
                profileDetails: {
                  personalDetails: {
                    primaryEmail: 'john@test.com'
                  }
                }
              }
            ],
            count: 1
          }
        }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      const query = { searchText: 'john' }
      await component.getAllUsers(query)

      expect(component.activeUsersData).toBeDefined()
      expect(component.activeUsersDataCount).toBe(1)
    })
  })

  describe('Filter helper methods', () => {
    it('should return correct filter group', () => {
      const query = { filters: { group: ['admin', 'user'] } }
      const result = component.getFilterGroup(query)
      expect(result).toEqual(['admin', 'user'])
    })

    it('should return undefined for empty filter group', () => {
      const query = { filters: { group: [] } }
      const result = component.getFilterGroup(query)
      expect(result).toBeUndefined()
    })

    it('should return correct search text', () => {
      const query = { searchText: 'test search' }
      const result = component.getSearchText(query)
      expect(result).toBe('test search')
      expect(component.searchText).toBe('test search')
    })

    it('should return empty string for missing search text', () => {
      const query = {}
      const result = component.getSearchText(query)
      expect(result).toBe('')
    })

    it('should return correct sort order for alphabetical', () => {
      const query = { sortOrder: 'alphabetical' }
      const result = component.getSortOrder(query)
      expect(result).toEqual({ firstName: 'asc' })
    })

    it('should return correct sort order for newest', () => {
      const query = { sortOrder: 'newest' }
      const result = component.getSortOrder(query)
      expect(result).toEqual({ createdDate: 'asc' })
    })

    it('should return correct sort order for oldest', () => {
      const query = { sortOrder: 'oldest' }
      const result = component.getSortOrder(query)
      expect(result).toEqual({ createdDate: 'desc' })
    })

    it('should return default sort order', () => {
      const query = {}
      const result = component.getSortOrder(query)
      expect(result).toEqual({ firstName: 'asc' })
    })
  })

  describe('Click handlers', () => {
    it('should handle createUser click event', () => {
      const spyOnCreateClick = jest.spyOn(component, 'onCreateClick')
      const event = { type: 'createUser' }

      component.clickHandler(event)

      expect(spyOnCreateClick).toHaveBeenCalled()
    })

    it('should handle upload click event', () => {
      const spyOnUploadClick = jest.spyOn(component, 'onUploadClick')
      const event = { type: 'upload' }

      component.clickHandler(event)

      expect(spyOnUploadClick).toHaveBeenCalled()
    })

    it('should navigate to create user page on create click', () => {
      component.onCreateClick()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/create-user'])
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
    })

    it('should call filter with upload on upload click', () => {
      const spyFilter = jest.spyOn(component, 'filter')

      component.onUploadClick()

      expect(spyFilter).toHaveBeenCalledWith('upload')
    })

    it('should navigate to user details on role click', () => {
      const user = { userId: 'test-user-123' }

      component.onRoleClick(user)

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/test-user-123/details'])
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
    })
  })

  describe('Search and pagination', () => {
    it('should handle enter key search', () => {
      const spyFilterData = jest.spyOn(component, 'filterData')
      const searchValue = 'test search'

      component.onEnterkySearch(searchValue)

      expect(component.searchQuery).toBe(searchValue)
      expect(spyFilterData).toHaveBeenCalledWith(searchValue)
    })

    it('should handle pagination change', () => {
      const spyFilterData = jest.spyOn(component, 'filterData')
      const event = { pageIndex: 2, pageSize: 50 }

      component.onPaginateChange(event as any)

      expect(component.pageIndex).toBe(2)
      expect(component.limit).toBe(50)
      expect(spyFilterData).toHaveBeenCalledWith(component.searchQuery)
    })
  })

  describe('fetchApprovals', () => {
    it('should fetch approvals when department name exists', () => {
      const mockResponse = {
        result: {
          data: [{ id: 1, status: 'pending' }]
        }
      }
      mockApprService.getApprovalsList.mockReturnValue(of(mockResponse))
      component.departName = 'test-department'

      component.fetchApprovals()

      expect(mockApprService.getApprovalsList).toHaveBeenCalledWith({
        serviceName: 'profile',
        applicationStatus: 'SEND_FOR_APPROVAL',
        requestType: ['GROUP_CHANGE', 'DESIGNATION_CHANGE'],
        deptName: 'test-department',
      })
      expect(component.pendingApprovals).toEqual(mockResponse.result.data)
    })

    it('should not fetch approvals when department name is missing', () => {
      component.departName = ''

      component.fetchApprovals()

      expect(mockApprService.getApprovalsList).not.toHaveBeenCalled()
    })

    it('should handle empty approval response', () => {
      const mockResponse = { result: {} }
      mockApprService.getApprovalsList.mockReturnValue(of(mockResponse))
      component.departName = 'test-department'

      component.fetchApprovals()

      expect(mockApprService.getApprovalsList).toHaveBeenCalled()
      expect(component.pendingApprovals).toEqual([])
    })
  })

  describe('ngOnDestroy', () => {
    it('should complete ngOnDestroy without errors', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle undefined query in filter methods', () => {
      expect(component.getFilterGroup(undefined)).toBeUndefined()
      expect(component.getFilterDesignation(undefined)).toBeUndefined()
      expect(component.getFilterRoles(undefined)).toBeUndefined()
      expect(component.getFilterTags(undefined)).toBeUndefined()
      expect(component.getSearchText(undefined)).toBe('')
    })

    it('should handle null user data in updateUserCounts', () => {
      component.updateUserCounts(null, 0, 'all_user')

      expect(component.activeUsersData).toEqual(null)
      expect(component.activeUsersDataCount).toBe(0)
    })

    it('should handle empty search results in getAllUsers', async () => {
      const mockResponse = {
        result: {
          response: {
            content: [],
            count: 0
          }
        }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers({ searchText: 'nonexistent' })

      expect(component.activeUsersData).toBeDefined()
      expect(component.activeUsersDataCount).toBe(0)
    })
  })
})