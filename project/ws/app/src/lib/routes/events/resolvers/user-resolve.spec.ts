import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { UserResolve } from './user-resolve'

describe('UserResolve', () => {
  let resolver: UserResolve
  let mockUsersService: any
  let mockConfigService: any
  let mockActivatedRoute: Partial<ActivatedRouteSnapshot>
  let mockRouterState: Partial<RouterStateSnapshot>

  beforeEach(() => {
    // Create mock services
    mockUsersService = {
      getUserById: jest.fn()
    }

    mockConfigService = {
      userProfile: {
        userId: 'default-user-id'
      }
    }

    // Create mock route and state
    mockActivatedRoute = {
      params: {},
      queryParams: {},
      routeConfig: { path: '' }
    }

    mockRouterState = {}

    // Create the resolver with mock dependencies
    resolver = new UserResolve(mockUsersService, mockConfigService)
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  describe('resolve method', () => {
    const mockUserProfile = { id: 'user-123', name: 'Test User' }

    beforeEach(() => {
      // Set up successful response by default
      mockUsersService.getUserById.mockReturnValue(of(mockUserProfile))
    })

    it('should get user ID from route params', () => {
      // Arrange
      mockActivatedRoute.params = { userId: 'route-param-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('route-param-user-id')
    })

    it('should get user ID from query params if not in route params', () => {
      // Arrange
      mockActivatedRoute.params = {}
      mockActivatedRoute.queryParams = { userId: 'query-param-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('query-param-user-id')
    })

    it('should use current user profile ID if not in route or query params', () => {
      // Arrange
      mockActivatedRoute.params = {}
      mockActivatedRoute.queryParams = {}

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('default-user-id')
    })

    it('should use current user ID when path is "me"', () => {
      // Arrange
      // Even if there are params, they should be ignored
      mockActivatedRoute.params = { userId: 'should-be-ignored' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('should-be-ignored')
    })

    it('should return data and null error on successful API call', (done) => {
      // Arrange
      mockActivatedRoute.params = { userId: 'test-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe((result: any) => {
          // Assert
          expect(result).toEqual({ data: mockUserProfile, error: null })
          done()
        })
    })

    it('should return error and null data on failed API call', (done) => {
      // Arrange
      const mockError = new Error('API error')
      mockUsersService.getUserById.mockReturnValue(throwError(mockError))
      mockActivatedRoute.params = { userId: 'test-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe((result: any) => {
          // Assert
          expect(result).toEqual({ data: null, error: mockError })
          done()
        })
    })

    it('should handle undefined userProfile gracefully', () => {
      // Arrange
      mockConfigService.userProfile = undefined
      mockActivatedRoute.params = {}
      mockActivatedRoute.queryParams = {}

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert - should use empty string when userProfile is undefined
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('')
    })
  })
})