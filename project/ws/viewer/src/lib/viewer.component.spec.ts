// Mock modules with ESM/jspdf transitive dependencies
jest.mock('@sunbird-cb/toc', () => ({
  WidgetContentService: jest.fn(),
}))
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  UtilityService: jest.fn(),
  ValueService: jest.fn(),
}))
jest.mock('@sunbird-cb/resolver', () => ({
  NsWidgetResolver: {},
}))
jest.mock('@ngx-translate/core', () => ({
  TranslateService: jest.fn(),
}))
jest.mock('@ws/app/src/lib/routes/app-toc/services/app-toc.service', () => ({
  AppTocService: jest.fn(),
}), { virtual: true })
jest.mock('./viewer-data.service', () => ({
  ViewerDataService: jest.fn(),
}))
jest.mock('./viewer-header-side-bar-toggle.service', () => ({
  ViewerHeaderSideBarToggleService: jest.fn(),
}))
jest.mock('./pdf-scorm-data-service', () => ({
  PdfScormDataService: jest.fn(),
}))
jest.mock('./services/pending-function.service', () => ({
  PendingFunctionService: jest.fn(),
}))
jest.mock('../../../../../src/app/component/root/root.service', () => ({
  RootService: jest.fn(),
}))

import { Subject, of } from 'rxjs'
import { ViewerComponent, ErrorType } from './viewer.component'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockActivatedRoute = {
  snapshot: {
    queryParamMap: { get: jest.fn((k: string) => (k === 'collectionId' ? 'col1' : null)) },
    queryParams: {},
    data: {},
  },
  data: { subscribe: jest.fn() },
}

const mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn().mockResolvedValue(true) }

const isLtMedium$ = new Subject<boolean>()
const mockValueSvc = { isLtMedium$: isLtMedium$.asObservable() }

const changedSubject = new Subject<any>()
const mockDataSvc = {
  changedSubject: changedSubject.asObservable(),
  status: 'none' as any,
  error: null as any,
}

const showNavbarDisplay$ = { next: jest.fn() }
const mockRootSvc = { showNavbarDisplay$: showNavbarDisplay$ }

const mockUtilitySvc = { isMobile: false }

const mockChangeDetector = { detectChanges: jest.fn() }

const mockWidgetServ = {
  fetchContent: jest.fn().mockReturnValue(of({ result: { content: { leafNodesCount: 5, children: [] } } })),
  fetchAuthoringContent: jest.fn().mockReturnValue(of({ mimeType: 'video', result: { content: { leafNodesCount: 3, cstoken: 'tok' } } })),
  fetchConfig: jest.fn().mockReturnValue(of({})),
  updateTocConfig: jest.fn(),
}

const mockConfigSvc = { sitePath: '/assets', userProfile: { userId: 'u1' } }

const visibilityStatus = new Subject<any>()
const mockViewerHeaderSideBarToggleService = { visibilityStatus }

const handleBackFromPdfScormFullScreen = new Subject<any>()
const mockPdfScormDataService = { handleBackFromPdfScormFullScreen }

const mockTranslate = { setDefaultLang: jest.fn(), use: jest.fn() }

const mapCompletionPercentageProgram = jest.fn()
const mapSessionCompletionPercentage = jest.fn()
const fetchCourseHeirarchy = jest.fn().mockResolvedValue(undefined)
const contentLoader = { next: jest.fn() }
const checkModuleWiseData = jest.fn()
const createHirarchyProgressHashmap = jest.fn()
const getTocStructure = jest.fn().mockReturnValue({ assessment: 0, finalTest: 0, course: -1, handsOn: 0, interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0 })
const mockTocSvc = {
  mapCompletionPercentageProgram,
  mapSessionCompletionPercentage,
  fetchCourseHeirarchy,
  contentLoader,
  checkModuleWiseData,
  createHirarchyProgressHashmap,
  getTocStructure,
  createPreAssessmentHirarchyProgressHashmap: jest.fn(),
  hashmap: {},
  readPreEnrollmentResourcesState: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
  updatePageScroll: new Subject<boolean>(),
}

const mockPendingFunctionService = {
  getContentData: jest.fn().mockReturnValue(of({ identifier: 'res1' })),
}

function buildComponent() {
  return new ViewerComponent(
    mockActivatedRoute as any,
    mockRouter as any,
    mockValueSvc as any,
    mockDataSvc as any,
    mockRootSvc as any,
    mockUtilitySvc as any,
    mockChangeDetector as any,
    mockWidgetServ as any,
    mockConfigSvc as any,
    mockViewerHeaderSideBarToggleService as any,
    mockPdfScormDataService as any,
    mockTranslate as any,
    mockTocSvc as any,
    mockPendingFunctionService as any,
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ViewerComponent', () => {
  let component: ViewerComponent

  beforeEach(() => {
    jest.clearAllMocks()
    component = buildComponent()
  })

  // ─── Creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call showNavbarDisplay$.next(false) in constructor', () => {
    expect(showNavbarDisplay$.next).toHaveBeenCalledWith(false)
  })

  it('should set isAssessmentScreen true when url includes practice', () => {
    const original = window.location.href
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/practice/something' }, writable: true })
    const c = buildComponent()
    expect(c.isAssessmentScreen).toBe(true)
    Object.defineProperty(window, 'location', { value: { href: original }, writable: true })
  })

  it('should set isAssessmentScreen false when url does not include practice', () => {
    expect(component.isAssessmentScreen).toBe(false)
  })

  it('should read preAssessment queryParam and set isPreAssessment', () => {
    mockActivatedRoute.snapshot.queryParams = { preAssessment: true }
    const c = buildComponent()
    expect(c.isPreAssessment).toBe(true)
    mockActivatedRoute.snapshot.queryParams = {}
  })

  it('should set isPreAssessment false when no preAssessment queryParam', () => {
    mockActivatedRoute.snapshot.queryParams = {}
    const c = buildComponent()
    expect(c.isPreAssessment).toBe(false)
  })

  // ─── ErrorType Enum ──────────────────────────────────────────────────────────

  it('ErrorType enum should have correct values', () => {
    expect(ErrorType.accessForbidden).toBe('accessForbidden')
    expect(ErrorType.notFound).toBe('notFound')
    expect(ErrorType.internalServer).toBe('internalServer')
    expect(ErrorType.serviceUnavailable).toBe('serviceUnavailable')
    expect(ErrorType.somethingWrong).toBe('somethingWrong')
    expect(ErrorType.mimeTypeMismatch).toBe('mimeTypeMismatch')
    expect(ErrorType.previewUnAuthorised).toBe('previewUnAuthorised')
  })

  // ─── toggleSideBar ───────────────────────────────────────────────────────────

  describe('toggleSideBar', () => {
    it('should toggle sideNavBarOpened from false to true', () => {
      component.sideNavBarOpened = false
      component.toggleSideBar()
      expect(component.sideNavBarOpened).toBe(true)
    })

    it('should toggle sideNavBarOpened from true to false', () => {
      component.sideNavBarOpened = true
      component.toggleSideBar()
      expect(component.sideNavBarOpened).toBe(false)
    })
  })

  // ─── minimizeBar ─────────────────────────────────────────────────────────────

  describe('minimizeBar', () => {
    it('should close sideNavBar when isMobile is true', () => {
      mockUtilitySvc.isMobile = true
      component.sideNavBarOpened = true
      component.minimizeBar()
      expect(component.sideNavBarOpened).toBe(false)
      mockUtilitySvc.isMobile = false
    })

    it('should not close sideNavBar when isMobile is false', () => {
      mockUtilitySvc.isMobile = false
      component.sideNavBarOpened = true
      component.minimizeBar()
      expect(component.sideNavBarOpened).toBe(true)
    })
  })

  // ─── isPreview getter ────────────────────────────────────────────────────────

  describe('isPreview', () => {
    it('should return false for regular url', () => {
      expect(component.isPreview).toBe(false)
    })
  })

  // ─── updatePathSet ────────────────────────────────────────────────────────────

  describe('updatePathSet', () => {
    it('should update pathSet when event has pathSet', () => {
      component.updatePathSet({ pathSet: ['a', 'b'] })
      expect(component.pathSet).toEqual(['a', 'b'])
    })

    it('should not update pathSet when event is null', () => {
      component.pathSet = 'original'
      component.updatePathSet(null)
      expect(component.pathSet).toBe('original')
    })

    it('should not update pathSet when event has no pathSet', () => {
      component.pathSet = 'original'
      component.updatePathSet({})
      expect(component.pathSet).toBe('original')
    })
  })

  // ─── updateCount ──────────────────────────────────────────────────────────────

  describe('updateCount', () => {
    it('should set completedCount from event', () => {
      component.updateCount(5)
      expect(component.completedCount).toBe(5)
    })
  })

  // ─── navigateToBack ───────────────────────────────────────────────────────────

  describe('navigateToBack', () => {
    it('should call visibilityStatus.next(true) and window.history.back', () => {
      const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => { })
      const nextSpy = jest.spyOn(visibilityStatus, 'next')
      component.navigateToBack()
      expect(nextSpy).toHaveBeenCalledWith(true)
      expect(backSpy).toHaveBeenCalled()
    })
  })

  // ─── getTocConfig ─────────────────────────────────────────────────────────────

  describe('getTocConfig', () => {
    it('should fetch config and update tocConfig', () => {
      const config = { tocTree: true }
      mockWidgetServ.fetchConfig.mockReturnValue(of(config))
      component.getTocConfig()
      expect(component.tocConfig).toEqual(config)
      expect(mockWidgetServ.updateTocConfig).toHaveBeenCalledWith(config)
    })
  })

  // ─── resetAndFetchTocStructure ────────────────────────────────────────────────

  describe('resetAndFetchTocStructure', () => {
    it('should initialize tocStructure with zeros', () => {
      component.hierarchyData = null
      component.resetAndFetchTocStructure()
      expect(component.tocStructure.assessment).toBe(0)
      expect(component.tocStructure.video).toBe(0)
    })

    it('should call getTocStructure when hierarchyData exists', () => {
      component.hierarchyData = { primaryCategory: 'Course', children: [] }
      component.resetAndFetchTocStructure()
      expect(mockTocSvc.getTocStructure).toHaveBeenCalled()
    })

    it('should set hasTocStructure true when any tocType > 0', () => {
      mockTocSvc.getTocStructure.mockReturnValueOnce({ assessment: 1, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0 })
      component.hierarchyData = { primaryCategory: 'Course', children: [] }
      component.resetAndFetchTocStructure()
      expect(component.hasTocStructure).toBe(true)
    })
  })

  // ─── ngOnDestroy ─────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call showNavbarDisplay$.next(true)', () => {
      showNavbarDisplay$.next.mockClear()
      component.ngOnDestroy()
      expect(showNavbarDisplay$.next).toHaveBeenCalledWith(true)
    })

    it('should unsubscribe screenSizeSubscription if present', () => {
      const unsub = jest.fn()
        ; (component as any).screenSizeSubscription = { unsubscribe: unsub }
      component.ngOnDestroy()
      expect(unsub).toHaveBeenCalled()
    })

    it('should unsubscribe resourceChangeSubscription if present', () => {
      const unsub = jest.fn()
        ; (component as any).resourceChangeSubscription = { unsubscribe: unsub }
      component.ngOnDestroy()
      expect(unsub).toHaveBeenCalled()
    })

    it('should unsubscribe pageScrollSubscription if present', () => {
      const unsub = jest.fn()
        ; (component as any).pageScrollSubscription = { unsubscribe: unsub }
      component.ngOnDestroy()
      expect(unsub).toHaveBeenCalled()
    })
  })

  // ─── ngOnInit subscriptions ───────────────────────────────────────────────────

  describe('ngOnInit subscriptions', () => {
    it('should set mode and sideNavBarOpened on screen size change (small)', async () => {
      mockWidgetServ.fetchConfig.mockReturnValue(of({}))
      await component.ngOnInit()
      isLtMedium$.next(true)
      expect(component.mode).toBe('over')
      expect(component.sideNavBarOpened).toBe(false)
    })

    it('should set mode and sideNavBarOpened on screen size change (large)', async () => {
      await component.ngOnInit()
      isLtMedium$.next(false)
      expect(component.mode).toBe('side')
      expect(component.sideNavBarOpened).toBe(true)
    })

    it('should set errorWidgetData for 403 error', async () => {
      await component.ngOnInit()
      mockDataSvc.error = { status: 403 }
      changedSubject.next(null)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.accessForbidden)
    })

    it('should set errorWidgetData for 404 error', async () => {
      await component.ngOnInit()
      mockDataSvc.error = { status: 404 }
      changedSubject.next(null)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.notFound)
    })

    it('should set errorWidgetData for 500 error', async () => {
      await component.ngOnInit()
      mockDataSvc.error = { status: 500 }
      changedSubject.next(null)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.internalServer)
    })

    it('should set errorWidgetData for 503 error', async () => {
      await component.ngOnInit()
      mockDataSvc.error = { status: 503 }
      changedSubject.next(null)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.serviceUnavailable)
    })

    it('should set errorWidgetData for unknown status', async () => {
      await component.ngOnInit()
      mockDataSvc.error = { status: 999 }
      changedSubject.next(null)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.somethingWrong)
    })

    it('should handle handleBackFromPdfScormFullScreen subscription', async () => {
      await component.ngOnInit()
      handleBackFromPdfScormFullScreen.next(true)
      expect(component.handleBackFromPdfScormFullScreenFlag).toBe(true)
    })
  })

  // ─── moveToBack ───────────────────────────────────────────────────────────────

  describe('moveToBack', () => {
    it('should navigate when collectionId queryParam exists', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1' }
      mockRouter.navigateByUrl.mockResolvedValue(true)
      component.moveToBack()
      await new Promise(r => setTimeout(r, 10))
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should not navigate when no collectionId', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      component.moveToBack()
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })
  })

  // ─── manipulateHierarchyData ──────────────────────────────────────────────────

  describe('manipulateHierarchyData', () => {
    it('should call mapCompletionPercentageProgram when not forPreview', async () => {
      component.forPreview = false
      component.hierarchyData = { identifier: 'c1', children: [] }
      component.enrollmentList = { courses: [] }
      await component.manipulateHierarchyData()
      expect(mapCompletionPercentageProgram).toHaveBeenCalledWith(component.hierarchyData, [])
    })

    it('should call fetchCourseHeirarchy when forPreview', async () => {
      component.forPreview = true
      component.hierarchyData = { identifier: 'c1', children: [] }
      await component.manipulateHierarchyData()
      expect(fetchCourseHeirarchy).toHaveBeenCalledWith(component.hierarchyData)
    })
  })

  // ─── getContentData ───────────────────────────────────────────────────────────

  describe('getContentData', () => {
    it('should fetch autoring content when collectionId is in queryParams', () => {
      const data$ = { subscribe: jest.fn(cb => cb({ content: { data: { mimeType: 'video' } } })) }
      const e = {
        activatedRoute: {
          data: data$,
          snapshot: { queryParams: { collectionId: 'col1', preAssessment: false } },
        },
      }
      mockWidgetServ.fetchAuthoringContent.mockReturnValue(of({ mimeType: 'video' }))
      component.getContentData(e as any)
      expect(mockWidgetServ.fetchAuthoringContent).toHaveBeenCalledWith('col1')
    })
  })

  // ─── fetchContentRead ─────────────────────────────────────────────────────────

  describe('fetchContentRead', () => {
    it('should resolve when data is returned', async () => {
      mockPendingFunctionService.getContentData.mockReturnValue(of({ identifier: 'r1' }))
      const result = await component.fetchContentRead()
      expect(result).toEqual({ identifier: 'r1' })
    })

    it('should reject when data is null', async () => {
      mockPendingFunctionService.getContentData.mockReturnValue(of(null))
      await expect(component.fetchContentRead()).rejects.toEqual({})
    })
  })
})
