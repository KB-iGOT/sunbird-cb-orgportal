import { GeneralGuard } from './general.guard'
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router'
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils'

// Mock dependencies
const mockRouter = {
  parseUrl: jest.fn(),
  navigateByUrl: jest.fn()
} as jest.Mocked<Partial<Router>>

const mockConfigSvc: any = {
  userRoles: new Set<string>(),
  userProfile: {},
  instanceConfig: {},
  hasAcceptedTnc: true,
  userUrl: '',
  restrictedFeatures: new Set<string>(),
  profileDetailsStatus: true,
  unMappedUser: {}
} as jest.Mocked<Partial<ConfigurationsService>>

const mockAuthSvc = {
  logout: jest.fn()
} as jest.Mocked<Partial<AuthKeycloakService>>

describe('GeneralGuard', () => {
  let guard: GeneralGuard
  let mockActivatedRoute: ActivatedRouteSnapshot
  let mockRouterState: RouterStateSnapshot

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock services to default state
    mockConfigSvc.userRoles = new Set<string>()
    mockConfigSvc.userProfile = { userId: '' }
    mockConfigSvc.instanceConfig = {}
    mockConfigSvc.hasAcceptedTnc = true
    mockConfigSvc.userUrl = ''
    mockConfigSvc.restrictedFeatures = new Set<string>()
    mockConfigSvc.profileDetailsStatus = true
    mockConfigSvc.unMappedUser = {}

    guard = new GeneralGuard(
      mockRouter as Router,
      mockConfigSvc as ConfigurationsService,
      mockAuthSvc as AuthKeycloakService
    )

    mockActivatedRoute = {
      data: {}
    } as ActivatedRouteSnapshot

    mockRouterState = {
      url: '/test-url'
    } as RouterStateSnapshot
  })

  describe('canActivate', () => {
    it('should call shouldAllow with correct parameters when no required features or roles', async () => {
      const spy = jest.spyOn(guard as any, 'shouldAllow').mockResolvedValue(true)

      await guard.canActivate(mockActivatedRoute, mockRouterState)

      expect(spy).toHaveBeenCalledWith(mockRouterState, [], [])
    })

    it('should call shouldAllow with required features and roles from route data', async () => {
      mockActivatedRoute.data = {
        requiredFeatures: ['feature1', 'feature2'],
        requiredRoles: ['role1', 'role2']
      }

      const spy = jest.spyOn(guard as any, 'shouldAllow').mockResolvedValue(true)

      await guard.canActivate(mockActivatedRoute, mockRouterState)

      expect(spy).toHaveBeenCalledWith(
        mockRouterState,
        ['feature1', 'feature2'],
        ['role1', 'role2']
      )
    })
  })

  describe('hasRole', () => {
    it('should return false when user has no roles', () => {
      mockConfigSvc.userRoles = new Set()

      const result = guard.hasRole(['admin', 'user'])

      expect(result).toBe(false)
    })

    it('should return true when user has at least one required role', () => {
      mockConfigSvc.userRoles = new Set(['admin', 'editor'])

      const result = guard.hasRole(['admin', 'user'])

      expect(result).toBe(true)
    })

    it('should return true when user has required role in different case', () => {
      mockConfigSvc.userRoles = new Set(['admin'])

      const result = guard.hasRole(['ADMIN'])

      expect(result).toBe(true)
    })

    it('should return false when user does not have any required roles', () => {
      mockConfigSvc.userRoles = new Set(['viewer'])

      const result = guard.hasRole(['admin', 'user'])

      expect(result).toBe(false)
    })

    it('should handle null/undefined roles gracefully', () => {
      mockConfigSvc.userRoles = new Set(['admin'])

      const result = guard.hasRole([null as any, undefined as any, 'admin'])

      expect(result).toBe(true)
    })

    it('should handle null userRoles set', () => {
      mockConfigSvc.userRoles = null as any

      const result = guard.hasRole(['admin'])

      expect(result).toBe(false)
    })
  })

  describe('shouldAllow - Invalid User Check', () => {
    it('should redirect to invalid-user when userProfile is null and disablePidCheck is false', async () => {
      mockConfigSvc.userProfile = null
      mockConfigSvc.instanceConfig = { disablePidCheck: false }
      const mockUrlTree = {} as UrlTree
      mockRouter.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/invalid-user')
      expect(result).toBe(mockUrlTree)
    })

    it('should allow access when userProfile is null but disablePidCheck is true', async () => {
      mockConfigSvc.userProfile = null
      mockConfigSvc.instanceConfig = { disablePidCheck: true }

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })

    it('should allow access when userProfile is not null', async () => {
      mockConfigSvc.userProfile = { id: 'user123' }
      mockConfigSvc.instanceConfig = { disablePidCheck: false }

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })
  })

  describe('shouldAllow - TnC Check', () => {
    it('should set userUrl when TnC not accepted and URL does not include excluded paths', async () => {
      mockConfigSvc.hasAcceptedTnc = false
      mockRouterState.url = '/app/some-page'

      await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(mockConfigSvc.userUrl).toBe('/app/some-page')
    })

    it('should not set userUrl when TnC not accepted but URL includes /app/setup/', async () => {
      mockConfigSvc.hasAcceptedTnc = false
      mockRouterState.url = '/app/setup/home'

      await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(mockConfigSvc.userUrl).toBe('')
    })

    it('should not set userUrl when TnC not accepted but URL includes /app/tnc', async () => {
      mockConfigSvc.hasAcceptedTnc = false
      mockRouterState.url = '/app/tnc'

      await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(mockConfigSvc.userUrl).toBe('')
    })

    it('should not set userUrl when TnC not accepted but URL is root', async () => {
      mockConfigSvc.hasAcceptedTnc = false
      mockRouterState.url = '/'

      await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(mockConfigSvc.userUrl).toBe('')
    })
  })

  describe('shouldAllow - Deleted User Check', () => {
    it('should logout and redirect when user is deleted', async () => {
      mockConfigSvc.unMappedUser = { isDeleted: true }

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error-access-forbidden')
      expect(mockAuthSvc.logout).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should allow access when user is not deleted', async () => {
      mockConfigSvc.unMappedUser = { isDeleted: false }

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })

    it('should allow access when isDeleted property is not present', async () => {
      mockConfigSvc.unMappedUser = {}

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })
  })

  describe('shouldAllow - Required Roles Check', () => {
    it('should redirect to home when user lacks required roles', async () => {
      mockConfigSvc.userRoles = new Set(['viewer'])
      const mockUrlTree = {} as UrlTree
      mockRouter.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      const result = await (guard as any).shouldAllow(
        mockRouterState,
        [],
        ['admin', 'editor']
      )

      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
      expect(result).toBe(mockUrlTree)
    })

    it('should allow access when user has at least one required role', async () => {
      mockConfigSvc.userRoles = new Set(['admin', 'viewer'])

      const result = await (guard as any).shouldAllow(
        mockRouterState,
        [],
        ['admin', 'editor']
      )

      expect(result).toBe(true)
    })

    it('should allow access when no required roles specified', async () => {
      mockConfigSvc.userRoles = new Set(['viewer'])

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })

    it('should allow access when required roles array is empty', async () => {
      mockConfigSvc.userRoles = new Set(['viewer'])

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })
  })

  describe('shouldAllow - Required Features Check', () => {
    it('should redirect to home when required feature is restricted', async () => {
      mockConfigSvc.restrictedFeatures = new Set(['feature1', 'feature2'])
      const mockUrlTree = {} as UrlTree
      mockRouter.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      const result = await (guard as any).shouldAllow(
        mockRouterState,
        ['feature1'],
        []
      )

      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/home')
      expect(result).toBe(mockUrlTree)
    })

    it('should allow access when required features are not restricted', async () => {
      mockConfigSvc.restrictedFeatures = new Set(['feature3'])

      const result = await (guard as any).shouldAllow(
        mockRouterState,
        ['feature1', 'feature2'],
        []
      )

      expect(result).toBe(true)
    })

    it('should allow access when no required features specified', async () => {
      mockConfigSvc.restrictedFeatures = new Set(['feature1'])

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })

    it('should allow access when required features array is empty', async () => {
      mockConfigSvc.restrictedFeatures = new Set(['feature1'])

      const result = await (guard as any).shouldAllow(mockRouterState, [], [])

      expect(result).toBe(true)
    })
  })

  describe('shouldAllow - Complex Scenarios', () => {
    it('should handle multiple checks and return true when all pass', async () => {
      mockConfigSvc.userProfile = { id: 'user123' }
      mockConfigSvc.hasAcceptedTnc = true
      mockConfigSvc.unMappedUser = { isDeleted: false }
      mockConfigSvc.profileDetailsStatus = true
      mockConfigSvc.userRoles = new Set(['admin'])
      mockConfigSvc.restrictedFeatures = new Set(['restricted-feature'])

      const result = await (guard as any).shouldAllow(
        mockRouterState,
        ['allowed-feature'],
        ['admin']
      )

      expect(result).toBe(true)
    })

    it('should stop at first failing check (invalid user)', async () => {
      mockConfigSvc.userProfile = null
      mockConfigSvc.instanceConfig = { disablePidCheck: false }
      mockConfigSvc.userRoles = new Set(['admin'])
      const mockUrlTree = {} as UrlTree
      mockRouter.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      const result = await (guard as any).shouldAllow(
        mockRouterState,
        ['feature1'],
        ['admin']
      )

      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/invalid-user')
      expect(result).toBe(mockUrlTree)
      // Should not check roles/features after invalid user check
    })

    it('should handle null/undefined restrictedFeatures and userRoles gracefully', async () => {
      mockConfigSvc.restrictedFeatures = null as any
      mockConfigSvc.userRoles = null as any

      const result = await (guard as any).shouldAllow(
        mockRouterState,
        ['feature1'],
        ['role1']
      )

      expect(result).toBe(true) // Should default to allowing access
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing route data gracefully', async () => {
      mockActivatedRoute.data = null as any

      const result = await guard.canActivate(mockActivatedRoute, mockRouterState)

      expect(result).toBe(true)
    })

    it('should handle missing router state URL', async () => {
      mockRouterState.url = null as any

      const result = await guard.canActivate(mockActivatedRoute, mockRouterState)

      expect(result).toBe(true)
    })

    it('should handle empty role array in hasRole', () => {
      mockConfigSvc.userRoles = new Set(['admin'])

      const result = guard.hasRole([])

      expect(result).toBe(false)
    })
  })
})