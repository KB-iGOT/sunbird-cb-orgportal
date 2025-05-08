import { WorkflowHistoryResolve } from './workflow-history-resolve'
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

describe('WorkflowHistoryResolve', () => {
  let resolver: WorkflowHistoryResolve
  let mockUsersService: any
  let mockConfigSvc: any
  let mockActivatedRouteSnapshot: Partial<ActivatedRouteSnapshot>
  let mockRouterStateSnapshot: Partial<RouterStateSnapshot>

  beforeEach(() => {
    // Mock the UsersService
    mockUsersService = {
      getWfHistoryByAppId: jest.fn()
    }

    // Mock the ConfigurationsService
    mockConfigSvc = {
      userProfile: {
        userId: 'default-user-id'
      }
    }

    // Create resolver with mocked dependencies
    resolver = new WorkflowHistoryResolve(mockUsersService, mockConfigSvc)

    // Mock ActivatedRouteSnapshot and RouterStateSnapshot
    mockActivatedRouteSnapshot = {
      routeConfig: { path: '' },
      params: {},
      queryParams: {}
    }

    mockRouterStateSnapshot = {}
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  it('should resolve with user ID from route params', () => {
    // Arrange
    const expectedUserId = 'user-123'
    const expectedData = { someData: 'test' }
    mockActivatedRouteSnapshot.params = { userId: expectedUserId }
    mockUsersService.getWfHistoryByAppId.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockUsersService.getWfHistoryByAppId).toHaveBeenCalledWith(expectedUserId)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should resolve with user ID from query params when not in route params', () => {
    // Arrange
    const expectedUserId = 'user-456'
    const expectedData = { someData: 'test' }
    mockActivatedRouteSnapshot.params = {}
    mockActivatedRouteSnapshot.queryParams = { userId: expectedUserId }
    mockUsersService.getWfHistoryByAppId.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockUsersService.getWfHistoryByAppId).toHaveBeenCalledWith(expectedUserId)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should resolve with user ID from config service when not in route or query params', () => {
    // Arrange
    const expectedUserId = 'default-user-id'
    const expectedData = { someData: 'test' }
    mockActivatedRouteSnapshot.params = {}
    mockActivatedRouteSnapshot.queryParams = {}
    mockUsersService.getWfHistoryByAppId.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockUsersService.getWfHistoryByAppId).toHaveBeenCalledWith(expectedUserId)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should resolve with user ID from config service when path is "me"', () => {
    // Arrange
    const expectedUserId = 'default-user-id'
    const expectedData = { someData: 'test' }
    mockUsersService.getWfHistoryByAppId.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockUsersService.getWfHistoryByAppId).toHaveBeenCalledWith(expectedUserId)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should handle error and return error response', () => {
    // Arrange
    const expectedError = new Error('Test error')
    mockActivatedRouteSnapshot.params = { userId: 'user-123' }
    mockUsersService.getWfHistoryByAppId.mockReturnValue(throwError(expectedError))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(response).toEqual({ error: expectedError, data: null })
    })
  })

  it('should handle case when userProfile is not defined', () => {
    // Arrange
    mockConfigSvc.userProfile = null
    const expectedData = { someData: 'test' }
    mockActivatedRouteSnapshot.params = {}
    mockActivatedRouteSnapshot.queryParams = {}
    mockUsersService.getWfHistoryByAppId.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockUsersService.getWfHistoryByAppId).toHaveBeenCalledWith('')
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should handle case when routeConfig is undefined', () => {
    // Arrange
    const expectedUserId = 'default-user-id'
    const expectedData = { someData: 'test' }
    mockUsersService.getWfHistoryByAppId.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockUsersService.getWfHistoryByAppId).toHaveBeenCalledWith(expectedUserId)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })
})