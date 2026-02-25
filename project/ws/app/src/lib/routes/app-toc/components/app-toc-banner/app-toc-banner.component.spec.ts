import { AppTocBannerComponent } from './app-toc-banner.component'
import { of, Subscription } from 'rxjs'

describe('AppTocBannerComponent', () => {
  let component: AppTocBannerComponent
  let mockSanitizer: any
  let mockRouter: any
  let mockRoute: any
  let mockDialog: any
  let mockTocSvc: any
  let mockConfigSvc: any
  let mockProgressSvc: any
  let mockContentSvc: any
  let mockUtilitySvc: any
  let mockMobileAppsSvc: any
  let mockAuthAccessService: any

  beforeEach(() => {
    // Mock dependencies
    mockSanitizer = { bypassSecurityTrustStyle: jest.fn() }
    mockRouter = {
      url: '/overview',
      events: of({}),
    }
    mockRoute = {
      data: of({
        pageData: {
          data: {},
        },
      }),
      queryParamMap: of({
        get: jest.fn((key: string) => (key === 'contextId' ? '123' : 'path')),
      }),
    }
    mockDialog = {}
    mockTocSvc = {
      fetchPostAssessmentStatus: jest.fn(() => of({ result: [] })),
      showStartButton: jest.fn(() => true),
      subtitleOnBanners: true,
    }
    mockConfigSvc = {
      instanceConfig: { logos: { defaultSourceLogo: 'default-logo.png' } },
      restrictedFeatures: new Set(),
      rootOrg: 'testOrg',
    }
    mockProgressSvc = {
      getProgressFor: jest.fn(() => of(50)),
    }
    mockContentSvc = {}
    mockUtilitySvc = {
      isMobile: true,
    }
    mockMobileAppsSvc = {
      sendViewerData: jest.fn(),
    }
    mockAuthAccessService = {
      hasAccess: jest.fn(() => true),
    }

    // Instantiate the component
    component = new AppTocBannerComponent(
      mockSanitizer,
      mockRouter,
      mockRoute,
      mockDialog,
      mockTocSvc,
      mockConfigSvc,
      mockProgressSvc,
      mockContentSvc,
      mockUtilitySvc,
      mockMobileAppsSvc,
      mockAuthAccessService
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize values on ngOnInit', () => {
    jest.spyOn(mockTocSvc, 'fetchPostAssessmentStatus').mockReturnValue(of({ result: [] }))
    jest.spyOn(mockRoute.data, 'subscribe')
    component.content = { identifier: '123', primaryCategory: 'COURSE', learningMode: 'Instructor-Led' } as any

    component.ngOnInit()

    expect(mockRoute.data.subscribe).toHaveBeenCalled()
    expect(component.tocConfig).toEqual({})
  })

  it('should calculate isPostAssessment correctly', () => {
    component.tocConfig = { postAssessment: true }
    component.content = { primaryCategory: 'COURSE', learningMode: 'Instructor-Led' } as any


  })

  it('should return true for isMobile getter', () => {
    const result = component.isMobile

    expect(result).toBe(true)
  })

  it('should unsubscribe from subscriptions on ngOnDestroy', () => {
    const routerSub = new Subscription()
    const routeSub = new Subscription()

    component.routerParamSubscription = routerSub
    component.routeSubscription = routeSub

    const routerSpy = jest.spyOn(routerSub, 'unsubscribe')
    const routeSpy = jest.spyOn(routeSub, 'unsubscribe')

    component.ngOnDestroy()

    expect(routerSpy).toHaveBeenCalled()
    expect(routeSpy).toHaveBeenCalled()
  })

})
