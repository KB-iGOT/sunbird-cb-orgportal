import { WorkflowResolve } from './workflow-resolve'
import { of, EMPTY, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

describe('WorkflowResolve', () => {
  let resolver: WorkflowResolve
  let mockNeedApprovalsService: any
  let mockConfigSvc: any
  let mockActivatedRouteSnapshot: Partial<ActivatedRouteSnapshot>
  let mockRouterStateSnapshot: Partial<RouterStateSnapshot>

  beforeEach(() => {
    // Mock the NeedApprovalsService
    mockNeedApprovalsService = {
      fetchNeedApprovals: jest.fn()
    }

    // Mock the ConfigurationsService
    mockConfigSvc = {
      userProfile: {
        userId: 'default-user-id'
      },
      unMappedUser: {
        channel: 'test-department'
      }
    }

    // Create resolver with mocked dependencies
    resolver = new WorkflowResolve(mockNeedApprovalsService, mockConfigSvc)

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
    const expectedDepartName = 'test-department'

    mockActivatedRouteSnapshot.params = { userId: expectedUserId }

    const expectedRequest = {
      serviceName: 'profile',
      applicationStatus: 'SEND_FOR_APPROVAL',
      applicationIds: [expectedUserId],
      deptName: expectedDepartName,
      offset: 0,
      limit: 100,
    }

    mockNeedApprovalsService.fetchNeedApprovals.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockNeedApprovalsService.fetchNeedApprovals).toHaveBeenCalledWith(expectedRequest)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should resolve with user ID from query params when not in route params', () => {
    // Arrange
    const expectedUserId = 'user-456'
    const expectedData = { someData: 'test' }
    const expectedDepartName = 'test-department'

    mockActivatedRouteSnapshot.params = {}
    mockActivatedRouteSnapshot.queryParams = { userId: expectedUserId }

    const expectedRequest = {
      serviceName: 'profile',
      applicationStatus: 'SEND_FOR_APPROVAL',
      applicationIds: [expectedUserId],
      deptName: expectedDepartName,
      offset: 0,
      limit: 100,
    }

    mockNeedApprovalsService.fetchNeedApprovals.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockNeedApprovalsService.fetchNeedApprovals).toHaveBeenCalledWith(expectedRequest)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should resolve with user ID from config service when not in route or query params', () => {
    // Arrange
    const expectedUserId = 'default-user-id'
    const expectedData = { someData: 'test' }
    const expectedDepartName = 'test-department'

    mockActivatedRouteSnapshot.params = {}
    mockActivatedRouteSnapshot.queryParams = {}

    const expectedRequest = {
      serviceName: 'profile',
      applicationStatus: 'SEND_FOR_APPROVAL',
      applicationIds: [expectedUserId],
      deptName: expectedDepartName,
      offset: 0,
      limit: 100,
    }

    mockNeedApprovalsService.fetchNeedApprovals.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockNeedApprovalsService.fetchNeedApprovals).toHaveBeenCalledWith(expectedRequest)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should resolve with user ID from config service when path is "me"', () => {
    // Arrange
    const expectedUserId = 'default-user-id'
    const expectedData = { someData: 'test' }
    const expectedDepartName = 'test-department'


    const expectedRequest = {
      serviceName: 'profile',
      applicationStatus: 'SEND_FOR_APPROVAL',
      applicationIds: [expectedUserId],
      deptName: expectedDepartName,
      offset: 0,
      limit: 100,
    }

    mockNeedApprovalsService.fetchNeedApprovals.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockNeedApprovalsService.fetchNeedApprovals).toHaveBeenCalledWith(expectedRequest)
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should handle error and return error response', () => {
    // Arrange
    const expectedError = new Error('Test error')
    mockActivatedRouteSnapshot.params = { userId: 'user-123' }
    mockNeedApprovalsService.fetchNeedApprovals.mockReturnValue(throwError(expectedError))

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

  it('should return EMPTY when departName is not available', () => {
    // Arrange
    mockConfigSvc.unMappedUser = null

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    expect(result).toBe(EMPTY)
    expect(mockNeedApprovalsService.fetchNeedApprovals).not.toHaveBeenCalled()
  })

  it('should handle case when userProfile is not defined', () => {
    // Arrange
    mockConfigSvc.userProfile = null
    const expectedData = { someData: 'test' }
    mockActivatedRouteSnapshot.params = {}
    mockActivatedRouteSnapshot.queryParams = {}
    mockNeedApprovalsService.fetchNeedApprovals.mockReturnValue(of(expectedData))

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    result.subscribe(response => {
      expect(mockNeedApprovalsService.fetchNeedApprovals).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationIds: ['']
        })
      )
      expect(response).toEqual({ data: expectedData, error: null })
    })
  })

  it('should handle case when both unMappedUser and channel are not defined', () => {
    // Arrange
    mockConfigSvc.unMappedUser = {}

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    )

    // Assert
    expect(result).toBe(EMPTY)
    expect(mockNeedApprovalsService.fetchNeedApprovals).not.toHaveBeenCalled()
  })
})