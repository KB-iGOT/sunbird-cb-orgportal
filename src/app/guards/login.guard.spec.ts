import { LoginGuard } from './login.guard'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router'
import { BehaviorSubject, ReplaySubject } from 'rxjs'

// Mock the dependencies
const mockRouter = {
  parseUrl: jest.fn()
} as unknown as Router

const mockConfigSvc = {
  appSetup: false,
  userUrl: '',
  baseUrl: '',
  sitePath: '',
  hostPath: '',
  userRoles: null,
  userGroups: null,
  restrictedFeatures: null,
  restrictedWidgets: null,
  instanceConfig: null,
  appsConfig: null,
  rootOrg: null,
  courseContentPath: '',
  org: null,
  activeOrg: null,
  isProduction: false,
  hasAcceptedTnc: false,
  profileDetailsStatus: false,
  userPreference: null,
  userProfile: null,
  userProfileV2: null,
  unMappedUser: null,
  orgReadData: null,
  isAuthenticated: false,
  isNewUser: false,
  isActive: false,
  pinnedApps: new BehaviorSubject(new Set<string>()),
  prefChangeNotifier: new ReplaySubject<any>(),
  tourGuideNotifier: new ReplaySubject<boolean>(),
  authChangeNotifier: new ReplaySubject<boolean>(),
  activeThemeObject: null,
  activeFontObject: null,
  isDarkMode: false,
  isIntranetAllowed: false,
  isRTL: false,
  activeLocale: null,
  activeLocaleGroup: '',
  completedActivity: null,
  completedTour: false,
  competency: null,
  profileSettings: [],
  primaryNavBar: {},
  pageNavBar: {},
  primaryNavBarConfig: null,
  updateOrgReadDataObservable: new ReplaySubject<string>(),
  updateOrgData: jest.fn()
} as unknown as ConfigurationsService

const mockActivatedRouteSnapshot = {
  queryParamMap: {
    has: jest.fn(),
    get: jest.fn()
  }
} as unknown as ActivatedRouteSnapshot

const mockRouterStateSnapshot = {} as RouterStateSnapshot

describe('LoginGuard', () => {
  let guard: LoginGuard
  let router: any
  let configSvc: any

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create fresh instances for each test
    router = { ...mockRouter }
    configSvc = { ...mockConfigSvc }

    guard = new LoginGuard(router, configSvc)
  })

  describe('canActivate', () => {
    it('should return false when user is not authenticated and login is hidden', () => {
      // Arrange
      configSvc.isAuthenticated = false
      configSvc.instanceConfig = {
        keycloak: {
          isLoginHidden: true,
          defaultidpHint: 'test-hint'
        }
      }

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(false)
    })

    it('should return true when user is not authenticated and login is not hidden', () => {
      // Arrange
      configSvc.isAuthenticated = false
      // configSvc.instanceConfig = {
      //   keycloak: {
      //     isLoginHidden: false,
      //     defaultidpHint: 'E',
      //     bearerExcludedUrls: [],
      //     clientId: '',
      //     key: '',
      //     realm: '',
      //     url: ''
      //   }
      // }

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(true)
    })

    it('should return true when user is not authenticated and instanceConfig is null', () => {
      // Arrange
      configSvc.isAuthenticated = false
      configSvc.instanceConfig = null

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(result).toBe(true)
    })

    it('should redirect to ref URL when user is authenticated and ref query param exists', () => {
      // Arrange
      configSvc.isAuthenticated = true
      const mockUrlTree = {} as UrlTree
      const mockRef = 'some/path'
      const decodedRef = 'some/path'

      mockActivatedRouteSnapshot.queryParamMap.has = jest.fn().mockReturnValue(true)
      mockActivatedRouteSnapshot.queryParamMap.get = jest.fn().mockReturnValue(mockRef)
      router.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(mockActivatedRouteSnapshot.queryParamMap.has).toHaveBeenCalledWith('ref')
      expect(mockActivatedRouteSnapshot.queryParamMap.get).toHaveBeenCalledWith('ref')
      expect(router.parseUrl).toHaveBeenCalledWith(decodedRef)
      expect(result).toBe(mockUrlTree)
    })

    it('should handle encoded ref URL when user is authenticated', () => {
      // Arrange
      configSvc.isAuthenticated = true
      const mockUrlTree = {} as UrlTree
      const encodedRef = 'some%2Fencoded%2Fpath'
      const decodedRef = 'some/encoded/path'

      mockActivatedRouteSnapshot.queryParamMap.has = jest.fn().mockReturnValue(true)
      mockActivatedRouteSnapshot.queryParamMap.get = jest.fn().mockReturnValue(encodedRef)
      router.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(router.parseUrl).toHaveBeenCalledWith(decodedRef)
      expect(result).toBe(mockUrlTree)
    })

    it('should handle empty ref URL when user is authenticated', () => {
      // Arrange
      configSvc.isAuthenticated = true
      const mockUrlTree = {} as UrlTree

      mockActivatedRouteSnapshot.queryParamMap.has = jest.fn().mockReturnValue(true)
      mockActivatedRouteSnapshot.queryParamMap.get = jest.fn().mockReturnValue('')
      router.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(router.parseUrl).toHaveBeenCalledWith('')
      expect(result).toBe(mockUrlTree)
    })

    it('should handle null ref URL when user is authenticated', () => {
      // Arrange
      configSvc.isAuthenticated = true
      const mockUrlTree = {} as UrlTree

      mockActivatedRouteSnapshot.queryParamMap.has = jest.fn().mockReturnValue(true)
      mockActivatedRouteSnapshot.queryParamMap.get = jest.fn().mockReturnValue(null)
      router.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(router.parseUrl).toHaveBeenCalledWith('')
      expect(result).toBe(mockUrlTree)
    })

    it('should redirect to app/home when user is authenticated and no ref query param', () => {
      // Arrange
      configSvc.isAuthenticated = true
      const mockUrlTree = {} as UrlTree

      mockActivatedRouteSnapshot.queryParamMap.has = jest.fn().mockReturnValue(false)
      router.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      // Act
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(mockActivatedRouteSnapshot.queryParamMap.has).toHaveBeenCalledWith('ref')
      expect(router.parseUrl).toHaveBeenCalledWith('app/home')
      expect(result).toBe(mockUrlTree)
    })

    it('should not call queryParamMap.get when ref param does not exist', () => {
      // Arrange
      configSvc.isAuthenticated = true
      const mockUrlTree = {} as UrlTree

      mockActivatedRouteSnapshot.queryParamMap.has = jest.fn().mockReturnValue(false)
      mockActivatedRouteSnapshot.queryParamMap.get = jest.fn()
      router.parseUrl = jest.fn().mockReturnValue(mockUrlTree)

      // Act
      guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      // Assert
      expect(mockActivatedRouteSnapshot.queryParamMap.get).not.toHaveBeenCalled()
    })
  })
})