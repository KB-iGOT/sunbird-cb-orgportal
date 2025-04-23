import { UsersListResolve } from './users-list-resolve.service'
import { of } from 'rxjs'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path) => {
    // Simple implementation of lodash.get for our test purposes
    if (!obj) return undefined
    if (path === 'rootOrg.id' && obj.rootOrg) {
      return obj.rootOrg.id
    }
    return undefined
  })
}))

describe('UsersListResolve', () => {
  let resolver: UsersListResolve
  let mockUsersService: any
  let mockConfigService: any


    // Import the mocked lodash
    =
    beforeEach(() => {
      // Reset lodash mock before each test
      jest.clearAllMocks()

      // Create mock for UsersService
      mockUsersService = {
        getAllUsers: jest.fn().mockReturnValue(of({}))
      }

      // Create mock for ConfigurationsService with unMappedUser property
      mockConfigService = {
        unMappedUser: {
          rootOrg: {
            id: 'test-root-org-id'
          }
        }
      }


      // Create resolver instance with mocks
      resolver = new UsersListResolve(mockUsersService, mockConfigService)
    })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })


})