import { RolesService } from '../services/roles.service'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { of, throwError } from 'rxjs'
import { RolesResolver } from './roles-resolve.service'

// Mock dependencies
jest.mock('../services/roles.service')

describe('RolesResolver', () => {
  let resolver: RolesResolver
  let rolesService: jest.Mocked<RolesService>
  let route: ActivatedRouteSnapshot
  let state: RouterStateSnapshot

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Initialize mocks
    rolesService = {
      getAllRoles: jest.fn()
    } as unknown as jest.Mocked<RolesService>

    // Initialize resolver with mocked dependencies
    resolver = new RolesResolver(rolesService)

    // Initialize route and state mocks
    route = {} as ActivatedRouteSnapshot
    state = {} as RouterStateSnapshot
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  describe('resolve', () => {


    it('should return error when getAllRoles fails', (done) => {
      // Prepare test error
      const mockError = new Error('Service failure')
      const expectedResult = {
        data: null,
        error: mockError
      }

      // Setup mock to throw error
      rolesService.getAllRoles.mockReturnValue(throwError(mockError))

      // Call the method under test
      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result).toEqual(expectedResult)
        expect(rolesService.getAllRoles).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('should handle invalid JSON in value', (done) => {
      // Prepare test data with invalid JSON
      const mockResponse = {
        result: {
          response: {
            value: '{invalid json'
          }
        }
      }

      // Setup mock return value
      rolesService.getAllRoles.mockReturnValue(of(mockResponse))

      // Call the method under test
      resolver.resolve(route, state).subscribe((result: { error: any; data: any }) => {
        // Expect error from JSON.parse
        expect(result.error).toBeTruthy()
        expect(result.data).toBeNull()
        expect(rolesService.getAllRoles).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })
})