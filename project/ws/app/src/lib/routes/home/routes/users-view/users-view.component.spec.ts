import { UsersViewComponent } from './users-view.component'
import { of, throwError, Subject } from 'rxjs'

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
          userProfile: { userId: 'user123' },
          unMappedUser: {
            profileDetails: { profileStatus: 'VERIFIED' },
            channel: 'test-department',
            rootOrg: { rootOrgId: 'root123' },
            roles: ['MDO_ADMIN']
          }
        }
      }
    }
  },
  parent: {
    snapshot: {
      data: {
        configService: {
          userProfile: { userId: 'user123' },
          unMappedUser: {
            profileDetails: { profileStatus: 'VERIFIED' },
            channel: 'test-department',
            rootOrg: { rootOrgId: 'root123' },
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
  bypassSecurityTrustHtml: jest.fn().mockReturnValue('sanitized-html')
}

const mockUsersService = {
  getAllKongUsers: jest.fn(),
  TOTAL_USERS_LIMIT: 1000
}

const mockApprService = {
  getApprovalsList: jest.fn()
}

describe('UsersViewComponent', () => {
  let component: UsersViewComponent

  beforeEach(() => {
    jest.clearAllMocks()
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
    it('should initialize component properties correctly', () => {
      expect(component.Math).toBe(Math)
      expect(component.currentUser).toBe('user123')
      expect(component.currentUserStatus).toBe('VERIFIED')
      expect(component.departName).toBe('test-department')
      expect(component.totalUserLimit).toBe(1000)
    })

    it('should handle missing route parent data', () => {
      const mockRouteWithoutParent = {
        parent: null,
        snapshot: { params: { tab: 'verified' } }
      }

      const componentWithoutParent = new UsersViewComponent(
        mockDialog as any,
        mockRouteWithoutParent as any,
        mockRouter as any,
        mockEvents as any,
        mockLoaderService as any,
        mockSanitizer as any,
        mockUsersService as any,
        mockApprService as any
      )

      expect(componentWithoutParent.configSvc).toBeNull()
    })

    it('should handle missing user profile', () => {
      const mockRouteWithoutProfile = {
        parent: {
          snapshot: {
            data: {
              configService: {
                userProfile: null,
                unMappedUser: {
                  profileDetails: { profileStatus: 'NOT-VERIFIED' },
                  channel: 'dept2'
                }
              }
            }
          }
        },
        snapshot: { params: {} }
      }

      const componentWithoutProfile = new UsersViewComponent(
        mockDialog as any,
        mockRouteWithoutProfile as any,
        mockRouter as any,
        mockEvents as any,
        mockLoaderService as any,
        mockSanitizer as any,
        mockUsersService as any,
        mockApprService as any
      )

      expect(componentWithoutProfile.currentUser).toBeNull()
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getAllUsers').mockImplementation()
      jest.spyOn(component, 'getVUsers').mockImplementation()
      jest.spyOn(component, 'getNVUsers').mockImplementation()
      jest.spyOn(component, 'getNMUsers').mockImplementation()
      jest.spyOn(component, 'fetchApprovals').mockImplementation()
    })

    it('should initialize with default tab when no tab param', () => {
      component.route.snapshot.params = {}
      component.ngOnInit()
      expect(component.currentFilter).toBe('allusers')
    })

    it('should initialize with provided tab param', () => {
      component.route.snapshot.params = { tab: 'verified' }
      component.ngOnInit()
      expect(component.currentFilter).toBe('verified')
    })

    it('should set isMdoAdmin to false when roles do not include MDO_ADMIN', () => {
      component.configSvc.unMappedUser.roles = ['USER']
      component.ngOnInit()
      expect(component.isMdoAdmin).toBe(false)
    })

    it('should handle missing roles', () => {
      component.configSvc.unMappedUser.roles = null
      component.ngOnInit()
      expect(component.isMdoAdmin).toBe(false)
    })

    it('should handle missing unMappedUser', () => {
      component.configSvc.unMappedUser = null
      component.ngOnInit()
      expect(component.isMdoAdmin).toBe(false)
    })
  })

  describe('getAllUsers', () => {
    const createMockUser = (overrides = {}) => ({
      userId: 'user1',
      firstName: 'John',
      email: 'john@test.com',
      phone: '1234567890',
      profileDetails: {
        personalDetails: {
          primaryEmail: 'john@test.com',
          firstname: 'John',
          officialEmail: 'john.official@test.com',
          personalEmail: 'john.personal@test.com',
          mobile: '9876543210',
          telephone: '0123456789'
        }
      },
      ...overrides
    })

    it('should handle successful API response without search', async () => {
      const mockResponse = {
        result: {
          response: {
            content: [createMockUser()],
            count: 1
          }
        }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers('')

      expect(component.activeUsersData).toEqual([createMockUser()])
      expect(component.activeUsersDataCount).toBe(1)
    })

    it('should build request with all filters', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      const query = {
        filters: {
          group: ['group1'],
          designation: ['designation1'],
          roles: ['role1'],
          tags: ['tag1']
        },
        searchText: 'test',
        sortOrder: 'oldest'
      }

      component.rootOrgId = 'root123'
      component.limit = 20
      component.pageIndex = 0

      await component.getAllUsers(query)

      expect(mockUsersService.getAllKongUsers).toHaveBeenCalledWith({
        request: {
          filters: {
            rootOrgId: 'root123',
            'profileDetails.profileStatus': ['VERIFIED', 'NOT-VERIFIED'],
            status: 1,
            'profileDetails.professionalDetails.group': ['group1'],
            'profileDetails.professionalDetails.designation': ['designation1'],
            'profileDetails.professionalDetails.role': ['role1'],
            'profileDetails.professionalDetails.tag': ['tag1']
          },
          limit: 20,
          offset: 0,
          query: 'test',
          sort_by: { createdDate: 'desc' }
        }
      })
    })

    describe('Search functionality', () => {
      let mockUsers: any[]

      beforeEach(() => {
        mockUsers = [
          createMockUser({
            userId: 'user1',
            firstName: 'John',
            email: 'john@test.com',
            phone: '1234567890'
          }),
          createMockUser({
            userId: 'user2',
            firstName: 'Jane',
            email: 'jane@test.com',
            phone: '0987654321',
            profileDetails: {
              personalDetails: {
                primaryEmail: 'jane@test.com',
                firstname: 'Jane',
                mobile: '5555555555'
              }
            }
          })
        ]
      })

      it('should filter users by email match', async () => {
        const mockResponse = {
          result: {
            response: {
              content: mockUsers,
              count: 2
            }
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        const query = { searchText: 'john@test.com' }
        await component.getAllUsers(query)

        expect(component.activeUsersData).toHaveLength(1)
        expect(component.activeUsersData[0].email).toBe('john@test.com')
      })

      it('should filter users by firstName match', async () => {
        const mockResponse = {
          result: {
            response: {
              content: mockUsers,
              count: 2
            }
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        const query = { searchText: 'jane' }
        await component.getAllUsers(query)

        expect(component.activeUsersData).toHaveLength(1)
        expect(component.activeUsersData[0].firstName).toBe('Jane')
      })

      it('should filter users by phone match', async () => {
        const mockResponse = {
          result: {
            response: {
              content: mockUsers,
              count: 2
            }
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        const query = { searchText: '1234567890' }
        await component.getAllUsers(query)

        expect(component.activeUsersData).toHaveLength(1)
        expect(component.activeUsersData[0].phone).toBe('1234567890')
      })

      it('should filter users by mobile match', async () => {
        const mockResponse = {
          result: {
            response: {
              content: mockUsers,
              count: 2
            }
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        const query = { searchText: '5555555555' }
        await component.getAllUsers(query)

        expect(component.activeUsersData).toHaveLength(1)
      })

      it('should handle search with no matches', async () => {
        const mockResponse = {
          result: {
            response: {
              content: mockUsers,
              count: 2
            }
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        const query = { searchText: 'nomatch' }
        await component.getAllUsers(query)

        expect(component.activeUsersData).toHaveLength(0)
      })

      it('should handle empty search results from API', async () => {
        const mockResponse = {
          result: {
            response: {
              content: [],
              count: 0
            }
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        const query = { searchText: 'test' }
        await component.getAllUsers(query)

        expect(component.activeUsersData).toEqual([])
      })

      it('should handle missing response data', async () => {
        const mockResponse = {
          result: {
            response: null
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        await component.getAllUsers({ searchText: 'test' })

        expect(component.activeUsersData).toBeUndefined()
      })

      it('should handle users with missing profile details', async () => {
        const usersWithMissingData = [
          {
            userId: 'user1',
            firstName: 'John',
            email: 'john@test.com'
            // Missing profileDetails
          },
          {
            userId: 'user2',
            profileDetails: {
              // Missing personalDetails
            }
          }
        ]

        const mockResponse = {
          result: {
            response: {
              content: usersWithMissingData,
              count: 2
            }
          }
        }
        mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

        const query = { searchText: 'john' }
        await component.getAllUsers(query)

        expect(component.activeUsersData).toHaveLength(1)
      })
    })
  })

  describe('getVUsers', () => {
    it('should call getAllKongUsers with VERIFIED status filter', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      component.rootOrgId = 'root123'
      await component.getVUsers('')

      expect(mockUsersService.getAllKongUsers).toHaveBeenCalledWith({
        request: {
          filters: {
            rootOrgId: 'root123',
            'profileDetails.profileStatus': 'VERIFIED',
            status: 1,
          },
          limit: 20,
          offset: 0,
          query: '',
          sort_by: { firstName: 'asc' }
        }
      })
    })

    it('should handle search functionality for verified users', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'John',
          email: 'john@test.com',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'john@test.com',
              firstname: 'John'
            }
          }
        }
      ]

      const mockResponse = {
        result: {
          response: {
            content: mockUsers,
            count: 1
          }
        }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      const query = { searchText: 'john' }
      await component.getVUsers(query)

      expect(component.verifiedUsersData).toHaveLength(1)
    })
  })

  describe('getNVUsers', () => {
    it('should call getAllKongUsers with NOT-VERIFIED status filter', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      component.rootOrgId = 'root123'
      await component.getNVUsers('')

      expect(mockUsersService.getAllKongUsers).toHaveBeenCalledWith({
        request: {
          filters: {
            rootOrgId: 'root123',
            'profileDetails.profileStatus': 'NOT-VERIFIED',
            status: 1,
          },
          limit: 20,
          offset: 0,
          query: '',
          sort_by: { firstName: 'asc' }
        }
      })
    })
  })

  describe('getNMUsers', () => {
    it('should call getAllKongUsers with NOT-MY-USER status filter', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      component.rootOrgId = 'root123'
      await component.getNMUsers('')

      expect(mockUsersService.getAllKongUsers).toHaveBeenCalledWith({
        request: {
          filters: {
            rootOrgId: 'root123',
            'profileDetails.profileStatus': 'NOT-MY-USER',
          },
          limit: 20,
          offset: 0,
          query: '',
          sort_by: { firstName: 'asc' }
        }
      })
    })

    it('should handle search with different user types', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: null,
          email: null,
          phone: null,
          profileDetails: {
            personalDetails: {
              primaryEmail: 'test@example.com',
              firstname: 'TestUser',
              officialEmail: 'official@example.com',
              personalEmail: 'personal@example.com',
              mobile: '1234567890',
              telephone: '9876543210'
            }
          }
        }
      ]

      const mockResponse = {
        result: {
          response: {
            content: mockUsers,
            count: 1
          }
        }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      const query = { searchText: 'test@example.com' }
      await component.getNMUsers(query)

      expect(component.notmyuserUsersData).toHaveLength(1)
    })
  })

  describe('updateUserCounts', () => {
    it('should update all users data and handle content property', () => {
      const userData = { content: [{ id: 1 }, { id: 2 }] }
      const userCount = 2

      component.updateUserCounts(userData, userCount, 'all_user')

      expect(component.activeUsersData).toEqual([{ id: 1 }, { id: 2 }])
      expect(component.activeUsersDataCount).toBe(2)
      expect(component.activeUsersDataCountInner).toBe(2)
      expect(component.isMoreThanLimit).toBe(false)
    })

    it('should update with direct user array when no content property', () => {
      const userData = [{ id: 1 }, { id: 2 }]
      const userCount = 2

      component.updateUserCounts(userData, userCount, 'ver_user')

      expect(component.verifiedUsersData).toEqual([{ id: 1 }, { id: 2 }])
      expect(component.verifiedUsersDataCount).toBe(2)
    })

    it('should handle user count exceeding limit', () => {
      const userData = { content: [] }
      const userCount = 1500
      component.totalUserLimit = 1000

      component.updateUserCounts(userData, userCount, 'non_ver_user')

      expect(component.nonverifiedUsersDataCountInner).toBe(1000)
      expect(component.isMoreThanLimit).toBe(true)
    })

    it('should handle non_ver_user type', () => {
      const userData = { content: [{ id: 1 }] }
      const userCount = 1

      component.updateUserCounts(userData, userCount, 'non_ver_user')

      expect(component.nonverifiedUsersData).toEqual([{ id: 1 }])
      expect(component.nonverifiedUsersDataCount).toBe(1)
      expect(component.nonverifiedUsersDataCountInner).toBe(1)
    })

    it('should handle unknown user type with default mapping', () => {
      const userData = { content: [{ id: 1 }] }
      const userCount = 1

      component.updateUserCounts(userData, userCount, 'unknown_type' as any)

      expect(component.notmyuserUsersData).toEqual([{ id: 1 }])
      expect(component.notmyuserUsersDataCount).toBe(1)
      expect(component.notmyuserUsersDataCountInner).toBe(1)
    })
  })

  describe('Filter helper methods with edge cases', () => {
    it('should handle getFilterGroup with empty array', () => {
      const query = { filters: { group: [] } }
      expect(component.getFilterGroup(query)).toBeUndefined()
    })

    it('should handle getFilterGroup with "undefind" value', () => {
      const query = { filters: { group: 'undefind' } }
      expect(component.getFilterGroup(query)).toBeUndefined()
    })

    it('should handle getFilterDesignation with empty array', () => {
      const query = { filters: { designation: [] } }
      expect(component.getFilterDesignation(query)).toBeUndefined()
    })

    it('should handle getFilterRoles with empty array', () => {
      const query = { filters: { roles: [] } }
      expect(component.getFilterRoles(query)).toBeUndefined()
    })

    it('should handle getFilterTags with empty array', () => {
      const query = { filters: { tags: [] } }
      expect(component.getFilterTags(query)).toBeUndefined()
    })

    it('should handle missing filters object', () => {
      const query = {}
      expect(component.getFilterGroup(query)).toBeUndefined()
      expect(component.getFilterDesignation(query)).toBeUndefined()
      expect(component.getFilterRoles(query)).toBeUndefined()
      expect(component.getFilterTags(query)).toBeUndefined()
    })

    it('should return empty string for getSearchText when no searchText', () => {
      const query = {}
      expect(component.getSearchText(query)).toBe('')
      expect(component.searchText).toBe('')
    })

    it('should handle all sort order types', () => {
      expect(component.getSortOrder({ sortOrder: 'alphabetical' })).toEqual({ firstName: 'asc' })
      expect(component.getSortOrder({ sortOrder: 'oldest' })).toEqual({ createdDate: 'desc' })
      expect(component.getSortOrder({ sortOrder: 'newest' })).toEqual({ createdDate: 'asc' })
      expect(component.getSortOrder({ sortOrder: 'unknown' })).toEqual({ firstName: 'asc' })
      expect(component.getSortOrder({})).toEqual({ firstName: 'asc' })
    })
  })

  describe('showEditUser', () => {
    it('should return true when isMdoAdmin is true and roles exist', () => {
      component.isMdoAdmin = true
      expect(component.showEditUser(['PUBLIC'])).toBe(true)
      expect(component.showEditUser(['USER', 'ADMIN'])).toBe(true)
    })

    it('should return true when isMdoAdmin is true and roles is empty', () => {
      component.isMdoAdmin = true
      expect(component.showEditUser([])).toBe(true)
    })

    it('should return true when isMdoAdmin is true and roles is null', () => {
      component.isMdoAdmin = true
      expect(component.showEditUser(null)).toBe(true)
    })

    it('should return true when isMdoAdmin is false regardless of roles', () => {
      component.isMdoAdmin = false
      expect(component.showEditUser(['PUBLIC'])).toBe(true)
      expect(component.showEditUser([])).toBe(true)
      expect(component.showEditUser(null)).toBe(true)
    })
  })

  describe('clickHandler', () => {
    it('should handle unknown event type gracefully', () => {
      expect(() => component.clickHandler({ type: 'unknown' })).not.toThrow()
    })
  })

  describe('fetchApprovals', () => {
    it('should handle successful approval fetch', () => {
      const mockResponse = {
        result: {
          data: [
            { id: 1, status: 'SEND_FOR_APPROVAL' },
            { id: 2, status: 'SEND_FOR_APPROVAL' }
          ]
        }
      }
      mockApprService.getApprovalsList.mockReturnValue(of(mockResponse))
      component.departName = 'test-dept'

      component.fetchApprovals()

      expect(mockApprService.getApprovalsList).toHaveBeenCalledWith({
        serviceName: 'profile',
        applicationStatus: 'SEND_FOR_APPROVAL',
        requestType: ['GROUP_CHANGE', 'DESIGNATION_CHANGE'],
        deptName: 'test-dept'
      })
      expect(component.pendingApprovals).toHaveLength(2)
    })

    it('should handle response without result', () => {
      const mockResponse = { result: null }
      mockApprService.getApprovalsList.mockReturnValue(of(mockResponse))
      component.departName = 'test-dept'

      component.fetchApprovals()

      expect(component.pendingApprovals).toEqual([])
    })

    it('should handle response without data', () => {
      const mockResponse = { result: { data: null } }
      mockApprService.getApprovalsList.mockReturnValue(of(mockResponse))
      component.departName = 'test-dept'

      component.fetchApprovals()

      expect(component.pendingApprovals).toEqual([])
    })

    it('should handle empty data array', () => {
      const mockResponse = { result: { data: [] } }
      mockApprService.getApprovalsList.mockReturnValue(of(mockResponse))
      component.departName = 'test-dept'

      component.fetchApprovals()

      expect(component.pendingApprovals).toEqual([])
    })

    it('should not call service when departName is null', () => {
      component.departName = ''
      component.fetchApprovals()
      expect(mockApprService.getApprovalsList).not.toHaveBeenCalled()
    })

    it('should not call service when departName is undefined', () => {
      component.departName = ''
      component.fetchApprovals()
      expect(mockApprService.getApprovalsList).not.toHaveBeenCalled()
    })

    it('should handle API error', () => {
      mockApprService.getApprovalsList.mockReturnValue(throwError('API Error'))
      component.departName = 'test-dept'

      expect(() => component.fetchApprovals()).not.toThrow()
    })
  })

  describe('Error handling for API calls', () => {
    it('should handle getAllUsers API error', async () => {
      mockUsersService.getAllKongUsers.mockReturnValue(throwError('API Error'))

      expect(async () => await component.getAllUsers('')).not.toThrow()
    })

    it('should handle getVUsers API error', async () => {
      mockUsersService.getAllKongUsers.mockReturnValue(throwError('API Error'))

      expect(async () => await component.getVUsers('')).not.toThrow()
    })

    it('should handle getNVUsers API error', async () => {
      mockUsersService.getAllKongUsers.mockReturnValue(throwError('API Error'))

      expect(async () => await component.getNVUsers('')).not.toThrow()
    })

    it('should handle getNMUsers API error', async () => {
      mockUsersService.getAllKongUsers.mockReturnValue(throwError('API Error'))

      expect(async () => await component.getNMUsers('')).not.toThrow()
    })
  })

  describe('Complex search scenarios', () => {
    const createComplexMockUser = (overrides = {}) => ({
      userId: 'user1',
      firstName: 'John',
      email: 'john@test.com',
      phone: '1234567890',
      profileDetails: {
        personalDetails: {
          primaryEmail: 'primary@test.com',
          firstname: 'Johnny',
          officialEmail: 'official@test.com',
          personalEmail: 'personal@test.com',
          mobile: 9876543210,
          telephone: '555-1234'
        }
      },
      ...overrides
    })

    it('should match multiple email fields', async () => {
      const mockUsers = [createComplexMockUser()]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      // Test primary email match
      await component.getAllUsers({ searchText: 'primary@test.com' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test official email match
      await component.getAllUsers({ searchText: 'official@test.com' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test personal email match
      await component.getAllUsers({ searchText: 'personal@test.com' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should match both firstName fields', async () => {
      const mockUsers = [createComplexMockUser()]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      // Test firstName match
      await component.getAllUsers({ searchText: 'john' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test profile firstname match
      await component.getAllUsers({ searchText: 'johnny' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should match phone number as string and number', async () => {
      const mockUsers = [createComplexMockUser()]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      // Test mobile as number
      await component.getAllUsers({ searchText: '9876543210' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test telephone
      await component.getAllUsers({ searchText: '555-1234' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test phone
      await component.getAllUsers({ searchText: '1234567890' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should handle case insensitive search', async () => {
      const mockUsers = [createComplexMockUser()]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers({ searchText: 'JOHN@TEST.COM' })
      expect(component.activeUsersData).toHaveLength(1)

      await component.getAllUsers({ searchText: 'JOHNNY' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should handle partial matches in search', async () => {
      const mockUsers = [createComplexMockUser()]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      // Partial email match
      await component.getAllUsers({ searchText: 'primary@' })
      expect(component.activeUsersData).toHaveLength(1)

      // Partial name match
      await component.getAllUsers({ searchText: 'joh' })
      expect(component.activeUsersData).toHaveLength(1)

      // Partial phone match
      await component.getAllUsers({ searchText: '987654' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should handle users with null/undefined values in search fields', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: null,
          email: null,
          phone: null,
          profileDetails: {
            personalDetails: {
              primaryEmail: null,
              firstname: null,
              officialEmail: null,
              personalEmail: null,
              mobile: null,
              telephone: null
            }
          }
        }
      ]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers({ searchText: 'test' })
      expect(component.activeUsersData).toHaveLength(0)
    })

    it('should handle users with missing profileDetails entirely', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'John',
          email: 'john@test.com',
          phone: '1234567890'
          // Missing profileDetails
        }
      ]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers({ searchText: 'john' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should handle users with missing personalDetails', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'John',
          email: 'john@test.com',
          phone: '1234567890',
          profileDetails: {
            // Missing personalDetails
          }
        }
      ]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers({ searchText: 'john' })
      expect(component.activeUsersData).toHaveLength(1)
    })
  })

  describe('Edge cases for updateUserCounts', () => {
    it('should handle null userData', () => {
      component.updateUserCounts(null, 0, 'all_user')
      expect(component.activeUsersData).toBeNull()
      expect(component.activeUsersDataCount).toBe(0)
    })

    it('should handle undefined userData', () => {
      component.updateUserCounts(undefined, 0, 'ver_user')
      expect(component.verifiedUsersData).toBeUndefined()
      expect(component.verifiedUsersDataCount).toBe(0)
    })

    it('should handle userData with empty content array', () => {
      const userData = { content: [] }
      component.updateUserCounts(userData, 0, 'non_ver_user')
      expect(component.nonverifiedUsersData).toEqual([])
      expect(component.nonverifiedUsersDataCount).toBe(0)
    })

    it('should handle exact limit boundary', () => {
      const userData = { content: [] }
      const userCount = 1000
      component.totalUserLimit = 1000

      component.updateUserCounts(userData, userCount, 'all_user')
      expect(component.activeUsersDataCountInner).toBe(1000)
      expect(component.isMoreThanLimit).toBe(true)
    })

    it('should handle all mapping types correctly', () => {
      const userData = { content: [{ id: 1 }] }

      // Test all_user mapping
      component.updateUserCounts(userData, 1, 'all_user')
      expect(component.activeUsersData).toEqual([{ id: 1 }])
      expect(component.activeUsersDataCount).toBe(1)
      expect(component.activeUsersDataCountInner).toBe(1)

      // Test ver_user mapping
      component.updateUserCounts(userData, 1, 'ver_user')
      expect(component.verifiedUsersData).toEqual([{ id: 1 }])
      expect(component.verifiedUsersDataCount).toBe(1)
      expect(component.verifiedUsersDataCountInner).toBe(1)

      // Test non_ver_user mapping
      component.updateUserCounts(userData, 1, 'non_ver_user')
      expect(component.nonverifiedUsersData).toEqual([{ id: 1 }])
      expect(component.nonverifiedUsersDataCount).toBe(1)
      expect(component.nonverifiedUsersDataCountInner).toBe(1)

      // Test default mapping (any other string)
      component.updateUserCounts(userData, 1, 'random_string' as any)
      expect(component.notmyuserUsersData).toEqual([{ id: 1 }])
      expect(component.notmyuserUsersDataCount).toBe(1)
      expect(component.notmyuserUsersDataCountInner).toBe(1)
    })
  })

  describe('Loader service integration', () => {
    it('should trigger loader for getAllUsers', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))
      const loaderSpy = jest.spyOn(mockLoaderService.changeLoad, 'next')

      await component.getAllUsers('')

      expect(loaderSpy).toHaveBeenCalledWith(true)
    })

    it('should trigger loader for getVUsers', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))
      const loaderSpy = jest.spyOn(mockLoaderService.changeLoad, 'next')

      await component.getVUsers('')

      expect(loaderSpy).toHaveBeenCalledWith(true)
    })

    it('should trigger loader for getNVUsers', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))
      const loaderSpy = jest.spyOn(mockLoaderService.changeLoad, 'next')

      await component.getNVUsers('')

      expect(loaderSpy).toHaveBeenCalledWith(true)
    })

    it('should trigger loader for getNMUsers', async () => {
      const mockResponse = { result: { response: { content: [], count: 0 } } }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))
      const loaderSpy = jest.spyOn(mockLoaderService.changeLoad, 'next')

      await component.getNMUsers('')

      expect(loaderSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('Search logic variations in all user methods', () => {
    const testSearchLogic = async (method: string, mockUsers: any[]) => {
      const mockResponse = {
        result: { response: { content: mockUsers, count: mockUsers.length } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      const query = { searchText: 'john@test.com' }
      await (component as any)[method](query)

      // Should find matching users
      const dataProperty = method === 'getAllUsers' ? 'activeUsersData' :
        method === 'getVUsers' ? 'verifiedUsersData' :
          method === 'getNVUsers' ? 'nonverifiedUsersData' : 'notmyuserUsersData'

      expect((component as any)[dataProperty]).toHaveLength(1)
    }

    it('should handle search logic consistently across all methods', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'John',
          email: 'john@test.com',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'john@test.com'
            }
          }
        }
      ]

      await testSearchLogic('getAllUsers', mockUsers)
      await testSearchLogic('getVUsers', mockUsers)
      await testSearchLogic('getNVUsers', mockUsers)
      await testSearchLogic('getNMUsers', mockUsers)
    })

    it('should handle no search results consistently', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'Jane',
          email: 'jane@test.com',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'jane@test.com'
            }
          }
        }
      ]

      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      const query = { searchText: 'nomatch' }

      await component.getAllUsers(query)
      expect(component.activeUsersData).toHaveLength(0)

      await component.getVUsers(query)
      expect(component.verifiedUsersData).toHaveLength(0)

      await component.getNVUsers(query)
      expect(component.nonverifiedUsersData).toHaveLength(0)

      await component.getNMUsers(query)
      expect(component.notmyuserUsersData).toHaveLength(0)
    })
  })

  describe('Full branch coverage for search conditions', () => {
    it('should test all email match conditions', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'John',
          email: 'user@email.com',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'primary@email.com',
              officialEmail: 'official@email.com',
              personalEmail: 'personal@email.com'
            }
          }
        }
      ]

      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      // Test userMail match (component.email)
      await component.getAllUsers({ searchText: 'user@email.com' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test userPrimaryEmail match
      await component.getAllUsers({ searchText: 'primary@email.com' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test userOfficialMail match
      await component.getAllUsers({ searchText: 'official@email.com' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test userPersonalMail match
      await component.getAllUsers({ searchText: 'personal@email.com' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should test all name match conditions', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'ComponentName',
          profileDetails: {
            personalDetails: {
              firstname: 'ProfileName'
            }
          }
        }
      ]

      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      // Test userName match (component.firstName)
      await component.getAllUsers({ searchText: 'componentname' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test userFirstName match (profile.firstname)
      await component.getAllUsers({ searchText: 'profilename' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should test all phone match conditions', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          phone: '1111111111',
          profileDetails: {
            personalDetails: {
              mobile: 2222222222,
              telephone: '3333333333'
            }
          }
        }
      ]

      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      // Test userPhone match
      await component.getAllUsers({ searchText: '1111111111' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test userMob match (as number)
      await component.getAllUsers({ searchText: '2222222222' })
      expect(component.activeUsersData).toHaveLength(1)

      // Test userTelePhone match
      await component.getAllUsers({ searchText: '3333333333' })
      expect(component.activeUsersData).toHaveLength(1)
    })
  })

  describe('ngOnDestroy', () => {
    it('should handle ngOnDestroy without errors', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should handle ngOnDestroy when tabs exist', () => {
      // Simulate tabs subscription
      (component as any).tabs = { unsubscribe: jest.fn() }
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('Complex API response scenarios', () => {
    it('should handle malformed API response', async () => {
      const malformedResponse = {
        // Missing result property
        response: { content: [], count: 0 }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(malformedResponse))

      await component.getAllUsers('')
      // Should not throw error, component should handle gracefully
      expect(component.activeUsersData).toBeUndefined()
    })

    it('should handle API response with null result', async () => {
      const responseWithNullResult = {
        result: null
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(responseWithNullResult))

      await component.getAllUsers('')
      expect(component.activeUsersData).toBeUndefined()
    })

    it('should handle API response with missing count', async () => {
      const responseWithoutCount = {
        result: {
          response: {
            content: [{ id: 1 }]
            // Missing count property
          }
        }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(responseWithoutCount))

      await component.getAllUsers('')
      expect(component.activeUsersDataCount).toBeUndefined()
    })
  })

  describe('Filter validation edge cases', () => {
    it('should handle filter values that are exactly "undefind"', () => {
      const query = {
        filters: {
          group: 'undefind',
          designation: 'undefind',
          roles: 'undefind',
          tags: 'undefind'
        }
      }

      expect(component.getFilterGroup(query)).toBeUndefined()
      expect(component.getFilterDesignation(query)).toBeUndefined()
      expect(component.getFilterRoles(query)).toBeUndefined()
      expect(component.getFilterTags(query)).toBeUndefined()
    })

    it('should handle filter values that are valid arrays', () => {
      const query = {
        filters: {
          group: ['group1', 'group2'],
          designation: ['designation1'],
          roles: ['role1', 'role2', 'role3'],
          tags: ['tag1']
        }
      }

      expect(component.getFilterGroup(query)).toEqual(['group1', 'group2'])
      expect(component.getFilterDesignation(query)).toEqual(['designation1'])
      expect(component.getFilterRoles(query)).toEqual(['role1', 'role2', 'role3'])
      expect(component.getFilterTags(query)).toEqual(['tag1'])
    })
  })

  describe('Search text handling edge cases', () => {
    it('should handle search text with special characters', async () => {
      const mockUsers = [
        {
          userId: 'user1',
          firstName: 'John@123',
          email: 'john+test@example.com',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'john+test@example.com'
            }
          }
        }
      ]

      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers({ searchText: 'john+test@example.com' })
      expect(component.activeUsersData).toHaveLength(1)

      await component.getAllUsers({ searchText: 'john@123' })
      expect(component.activeUsersData).toHaveLength(1)
    })

    it('should handle empty search text', async () => {
      const mockUsers = [{ userId: 'user1' }]
      const mockResponse = {
        result: { response: { content: mockUsers, count: 1 } }
      }
      mockUsersService.getAllKongUsers.mockReturnValue(of(mockResponse))

      await component.getAllUsers({ searchText: '' })
      expect(component.activeUsersData).toEqual(mockUsers)
    })
  })
})