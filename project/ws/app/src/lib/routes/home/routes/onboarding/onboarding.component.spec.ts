import { OnboardingComponent } from './onboarding.component'
import { MatDialog } from '@angular/material/dialog'
import { NavigationEnd, Router } from '@angular/router'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ReportsVideoComponent } from '../reports-video/reports-video.component'
import { Subject } from 'rxjs'
import { environment } from '../../../../../../../../../src/environments/environment'

// Mock the environment
jest.mock('../../../../../../../../../src/environments/environment', () => ({
  environment: {
    karmYogiPath: 'https://test-karmaYogi.com/'
  }
}))

describe('OnboardingComponent', () => {
  let component: OnboardingComponent
  let mockDialog: jest.Mocked<MatDialog>
  let mockRouter: jest.Mocked<Router>
  let mockActivatedRoute: any
  let mockSanitizer: jest.Mocked<DomSanitizer>
  let routerEventsSubject: Subject<any>

  const mockOnBoardingConfig = {
    featureInformation: {
      notesList: ['Note 1', 'Note 2', 'Note 3'],
      onBoardingVideo: 'test-video.mp4'
    }
  }

  const mockConfigService = {
    someProperty: 'test'
  }

  beforeEach(() => {
    routerEventsSubject = new Subject()

    // Create mocks
    mockDialog = {
      open: jest.fn()
    } as any

    mockRouter = {
      events: routerEventsSubject.asObservable(),
      url: '/app/home/onboarding/self-registration',
      navigate: jest.fn()
    } as any

    mockActivatedRoute = {
      snapshot: {
        data: {
          configService: mockConfigService,
          pageData: {
            data: mockOnBoardingConfig
          }
        }
      }
    }

    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn()
    } as any

    // Create component instance
    component = new OnboardingComponent(
      mockDialog,
      mockActivatedRoute,
      mockRouter,
      mockSanitizer
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
    routerEventsSubject.complete()
  })

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.onboardingNoteList).toEqual([])
      expect(component.currentRoute).toBe('self-registration')
      expect(component.panelOpenState).toBe(false)
      expect(component.onBoardingConfig).toBeUndefined()
    })
  })

  describe('ngOnInit', () => {
    it('should initialize component properties from activated route data', () => {
      component.ngOnInit()

      expect(component.configSvc).toBe(mockConfigService)
      expect(component.onBoardingConfig).toBe(mockOnBoardingConfig)
      expect(component.onboardingNoteList).toEqual(['Note 1', 'Note 2', 'Note 3'])
    })

    it('should handle missing notesList in config', () => {
      const configWithoutNotes = {
        featureInformation: {}
      }
      mockActivatedRoute.snapshot.data.pageData.data = configWithoutNotes

      component.ngOnInit()

      expect(component.onboardingNoteList).toEqual([])
    })

    it('should handle missing featureInformation in config', () => {
      const configWithoutFeatureInfo = {}
      mockActivatedRoute.snapshot.data.pageData.data = configWithoutFeatureInfo

      component.ngOnInit()

      expect(component.onboardingNoteList).toEqual([])
    })

    it('should subscribe to router events', () => {
      const routerEventsSpy = jest.spyOn(mockRouter.events, 'subscribe')

      component.ngOnInit()

      expect(routerEventsSpy).toHaveBeenCalled()
    })

    it('should update current route on NavigationEnd event', () => {
      //mockRouter.url = '/app/home/onboarding/profile-setup'
      const updateCurrentRouteSpy = jest.spyOn(component, 'updateCurrentRoute')

      component.ngOnInit()

      // Emit NavigationEnd event
      routerEventsSubject.next(new NavigationEnd(1, '/app/home/onboarding/profile-setup', '/app/home/onboarding/profile-setup'))

      expect(updateCurrentRouteSpy).toHaveBeenCalledTimes(2) // Once in ngOnInit, once in subscription
    })

    it('should not update current route on non-NavigationEnd events', () => {
      const updateCurrentRouteSpy = jest.spyOn(component, 'updateCurrentRoute')

      component.ngOnInit()
      updateCurrentRouteSpy.mockClear() // Clear the call from ngOnInit

      // Emit non-NavigationEnd event
      routerEventsSubject.next({ type: 'SomeOtherEvent' })

      expect(updateCurrentRouteSpy).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from route subscription', () => {
      component.ngOnInit()
      const unsubscribeSpy = jest.spyOn(component.routeSubscription, 'unsubscribe')

      component.ngOnDestroy()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('should handle case when routeSubscription is falsy', () => {
      component.routeSubscription = null as any

      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('sanitizeHtml', () => {
    it('should call sanitizer.bypassSecurityTrustHtml with provided html', () => {
      const mockSafeHtml = {} as SafeHtml
      mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(mockSafeHtml)
      const testHtml = '<p>Test HTML</p>'

      const result = component.sanitizeHtml(testHtml)

      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(testHtml)
      expect(result).toBe(mockSafeHtml)
    })

    it('should handle empty string', () => {
      const mockSafeHtml = {} as SafeHtml
      mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(mockSafeHtml)

      const result = component.sanitizeHtml('')

      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('')
      expect(result).toBe(mockSafeHtml)
    })
  })

  describe('openVideoPopup', () => {
    beforeEach(() => {
      //  component.onBoardingConfig = mockOnBoardingConfig
    })

    it('should open dialog with correct video URL and configuration', () => {
      component.openVideoPopup()

      expect(mockDialog.open).toHaveBeenCalledWith(ReportsVideoComponent, {
        data: {
          videoLink: `${environment.karmYogiPath}${mockOnBoardingConfig.featureInformation.onBoardingVideo}`
        },
        disableClose: true,
        width: "675px",
        height: "400px"
      })
    })

    it('should construct correct video URL', () => {
      const expectedUrl = `${environment.karmYogiPath}${mockOnBoardingConfig.featureInformation.onBoardingVideo}`

      component.openVideoPopup()

      expect(mockDialog.open).toHaveBeenCalledWith(
        ReportsVideoComponent,
        expect.objectContaining({
          data: {
            videoLink: expectedUrl
          }
        })
      )
    })

    it('should handle case when onBoardingConfig is undefined', () => {
      component.onBoardingConfig = undefined

      expect(() => component.openVideoPopup()).not.toThrow()

      expect(mockDialog.open).toHaveBeenCalledWith(
        ReportsVideoComponent,
        expect.objectContaining({
          data: {
            videoLink: `${environment.karmYogiPath}undefined`
          }
        })
      )
    })
  })

  describe('routeTo', () => {
    it('should navigate to specified route', () => {
      const testRoute = 'profile-setup'

      component.routeTo(testRoute)

      expect(mockRouter.navigate).toHaveBeenCalledWith([`/app/home/onboarding/${testRoute}`])
    })

    it('should handle empty route', () => {
      component.routeTo('')

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/onboarding/'])
    })

    it('should handle route with special characters', () => {
      const specialRoute = 'test-route_123'

      component.routeTo(specialRoute)

      expect(mockRouter.navigate).toHaveBeenCalledWith([`/app/home/onboarding/${specialRoute}`])
    })
  })

  describe('updateCurrentRoute', () => {
    it('should extract current route from router URL', () => {
      //  mockRouter.url = '/app/home/onboarding/profile-setup'

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('profile-setup')
    })

    it('should handle URL with single segment', () => {
      //  mockRouter.url = 'single-segment'

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('single-segment')
    })

    it('should handle URL with query parameters', () => {
      //  mockRouter.url = '/app/home/onboarding/profile-setup?param=value'

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('profile-setup?param=value')
    })

    it('should handle URL with hash fragment', () => {
      //  mockRouter.url = '/app/home/onboarding/profile-setup#section'

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('profile-setup#section')
    })

    it('should handle root URL', () => {
      // mockRouter.url = '/'

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('')
    })

    it('should handle empty URL', () => {
      // mockRouter.url = ''

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('')
    })
  })

  describe('Integration Tests', () => {
    it('should properly initialize and clean up', () => {
      component.ngOnInit()

      expect(component.configSvc).toBeDefined()
      expect(component.onBoardingConfig).toBeDefined()
      expect(component.routeSubscription).toBeDefined()

      const unsubscribeSpy = jest.spyOn(component.routeSubscription, 'unsubscribe')
      component.ngOnDestroy()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('should handle complete workflow with route changes', () => {
      component.ngOnInit()

      // Initial state
      expect(component.currentRoute).toBe('self-registration')

      // Route change
      //  mockRouter.url = '/app/home/onboarding/profile-setup'
      routerEventsSubject.next(new NavigationEnd(1, '/app/home/onboarding/profile-setup', '/app/home/onboarding/profile-setup'))

      expect(component.currentRoute).toBe('profile-setup')
    })
  })
})