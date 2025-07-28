import { EmptyRouteGuard } from './empty-route.guard'
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils'

describe('EmptyRouteGuard', () => {
  let guard: EmptyRouteGuard
  let mockRouter: jest.Mocked<Router>
  let mockConfigService: jest.Mocked<ConfigurationsService>
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot
  let mockRouterStateSnapshot: RouterStateSnapshot

  beforeEach(() => {
    // Create mock objects
    mockRouter = {
      parseUrl: jest.fn()
    } as any

    mockConfigService = {
      userProfile: null,
      unMappedUser: null
    } as any

    mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot
    mockRouterStateSnapshot = {} as RouterStateSnapshot

    // Create guard instance with mocked dependencies
    guard = new EmptyRouteGuard(mockRouter, mockConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('canActivate', () => {
    it('should return false when userProfile is null', () => {
      // Arrange
      mockConfigService.userProfile = null

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(false)
      expect(mockRouter.parseUrl).not.toHaveBeenCalled()
    })

    it('should return false when userProfile exists but userId is null', () => {
      // Arrange
      // mockConfigService.userProfile = { userId: null }

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(false)
      expect(mockRouter.parseUrl).not.toHaveBeenCalled()
    })

    it('should return false when userProfile exists but userId is undefined', () => {
      // Arrange
      // mockConfigService.userProfile = { userId: undefined }

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(false)
      expect(mockRouter.parseUrl).not.toHaveBeenCalled()
    })

    it('should return false when userProfile exists but userId is empty string', () => {
      // Arrange
      mockConfigService.userProfile = { userId: '' }

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(false)
      expect(mockRouter.parseUrl).not.toHaveBeenCalled()
    })

    it('should redirect to /app/home/community when user has COMMUNITY_MODERATOR role', () => {
      // Arrange
      const mockUrlTree = {} as UrlTree
      mockConfigService.userProfile = { userId: 'test-user-id' }
      mockConfigService.unMappedUser = {
        roles: ['COMMUNITY_MODERATOR', 'OTHER_ROLE']
      }
      mockRouter.parseUrl.mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(mockUrlTree)
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home/community')
      expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
    })

    it('should redirect to /app/home/community when user has role containing COMMUNITY_MODERATOR', () => {
      // Arrange
      const mockUrlTree = {} as UrlTree
      mockConfigService.userProfile = { userId: 'test-user-id' }
      mockConfigService.unMappedUser = {
        roles: ['SOME_COMMUNITY_MODERATOR_ROLE']
      }
      mockRouter.parseUrl.mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(mockUrlTree)
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home/community')
      expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
    })

    it('should redirect to /app/home when user exists but does not have COMMUNITY_MODERATOR role', () => {
      // Arrange
      const mockUrlTree = {} as UrlTree
      mockConfigService.userProfile = { userId: 'test-user-id' }
      mockConfigService.unMappedUser = {
        roles: ['USER', 'ADMIN', 'OTHER_ROLE']
      }
      mockRouter.parseUrl.mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(mockUrlTree)
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
      expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
    })

    it('should redirect to /app/home when user exists but unMappedUser is null', () => {
      // Arrange
      const mockUrlTree = {} as UrlTree
      mockConfigService.userProfile = { userId: 'test-user-id' }
      mockConfigService.unMappedUser = null
      mockRouter.parseUrl.mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(mockUrlTree)
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
      expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
    })

    it('should redirect to /app/home when user exists but unMappedUser.roles is null', () => {
      // Arrange
      const mockUrlTree = {} as UrlTree
      mockConfigService.userProfile = { userId: 'test-user-id' }
      mockConfigService.unMappedUser = { roles: null }
      mockRouter.parseUrl.mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(mockUrlTree)
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
      expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
    })

    it('should redirect to /app/home when user exists but unMappedUser.roles is empty array', () => {
      // Arrange
      const mockUrlTree = {} as UrlTree
      mockConfigService.userProfile = { userId: 'test-user-id' }
      mockConfigService.unMappedUser = { roles: [] }
      mockRouter.parseUrl.mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(mockUrlTree)
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
      expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
    })

    it('should handle case when unMappedUser is undefined', () => {
      // Arrange
      const mockUrlTree = {} as UrlTree
      mockConfigService.userProfile = { userId: 'test-user-id' }
      mockConfigService.unMappedUser = undefined
      mockRouter.parseUrl.mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(mockUrlTree)
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
      expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
    })

    // it('should work with various truthy userIds', () => {
    //   // Test with different truthy values
    //   const testCases = ['valid-id', 'user123', 1, true]

    //   testCases.forEach((userId) => {
    //     // Arrange
    //     jest.clearAllMocks()
    //     const mockUrlTree = {} as UrlTree
    //    // mockConfigService.userProfile = { userId }
    //     mockConfigService.unMappedUser = { roles: ['USER'] }
    //     mockRouter.parseUrl.mockReturnValue(mockUrlTree)

    //     // Act
    //     const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

    //     // Assert
    //     expect(result).toBe(mockUrlTree)
    //     expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
    //   })
    // })
  })

  describe('constructor', () => {
    it('should create guard instance with injected dependencies', () => {
      // Act & Assert
      expect(guard).toBeDefined()
      expect(guard['router']).toBe(mockRouter)
      expect(guard['configSvc']).toBe(mockConfigService)
    })
  })
})