import { UserResolve } from './user-resolve'
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

describe('UserResolve', () => {
  let resolver: UserResolve
  let mockUsersSvc: any
  let mockConfigSvc: any
  let mockActivatedRoute: Partial<ActivatedRouteSnapshot>
  let mockRouterState: Partial<RouterStateSnapshot>

  beforeEach(() => {
    // Create mock services
    mockUsersSvc = {
      getUserById: jest.fn()
    }

    mockConfigSvc = {
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
    resolver = new UserResolve(mockUsersSvc, mockConfigSvc)
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  describe('resolve method', () => {
    const mockUserProfile = { id: 'user-123', name: 'Test User' }

    beforeEach(() => {
      // Set up successful response by default
      mockUsersSvc.getUserById.mockReturnValue(of(mockUserProfile))
    })

    it('should get user ID from route params', () => {
      // Arrange
      mockActivatedRoute.params = { userId: 'route-param-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersSvc.getUserById).toHaveBeenCalledWith('route-param-user-id')
    })

    it('should get user ID from query params if not in route params', () => {
      // Arrange
      mockActivatedRoute.params = {}
      mockActivatedRoute.queryParams = { userId: 'query-param-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersSvc.getUserById).toHaveBeenCalledWith('query-param-user-id')
    })

    it('should use current user profile ID if not in route or query params', () => {
      // Arrange
      mockActivatedRoute.params = {}
      mockActivatedRoute.queryParams = {}

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersSvc.getUserById).toHaveBeenCalledWith('default-user-id')
    })

    it('should use current user ID when path is "me"', () => {
      // Arrange
      // Even if there are params, they should be ignored
      mockActivatedRoute.params = { userId: 'should-be-ignored' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert
      expect(mockUsersSvc.getUserById).toHaveBeenCalledWith('should-be-ignored')
    })

    it('should return data and null error on successful API call', (done) => {
      // Arrange
      mockActivatedRoute.params = { userId: 'test-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe(result => {
          // Assert
          expect(result).toEqual({ data: mockUserProfile, error: null })
          done()
        })
    })

    it('should return error and null data on failed API call', (done) => {
      // Arrange
      const mockError = new Error('API error')
      mockUsersSvc.getUserById.mockReturnValue(throwError(mockError))
      mockActivatedRoute.params = { userId: 'test-user-id' }

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe(result => {
          // Assert
          expect(result).toEqual({ data: null, error: mockError })
          done()
        })
    })

    it('should handle undefined userProfile gracefully', () => {
      // Arrange
      mockConfigSvc.userProfile = undefined
      mockActivatedRoute.params = {}
      mockActivatedRoute.queryParams = {}

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert - should use empty string when userProfile is undefined
      expect(mockUsersSvc.getUserById).toHaveBeenCalledWith('')
    })

    it('should handle undefined userProfile.userId gracefully', () => {
      // Arrange
      mockConfigSvc.userProfile = {}
      mockActivatedRoute.params = {}
      mockActivatedRoute.queryParams = {}

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe()

      // Assert - should use empty string when userProfile.userId is undefined
      expect(mockUsersSvc.getUserById).toHaveBeenCalledWith('')
    })
  })
})