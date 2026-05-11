import { of } from 'rxjs'
import { OfflineSessionComponent } from './offline-session.component'

jest.mock('src/environments/environment', () => ({
  environment: { azureHost: 'https://azure.example.com', azureBucket: 'test-bucket' },
}), { virtual: true })

jest.mock('@sunbird-cb/toc', () => ({
  NsDiscussionForum: { EDiscussionType: { LEARNING: 'learning' } },
  WidgetContentService: jest.fn(),
  AccessControlService: jest.fn(),
}))

jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EMimeTypes: { OFFLINE_SESSION: 'application/html' },
  },
}))

jest.mock('@sunbird-cb/resolver', () => ({
  NsWidgetResolver: {},
}))

jest.mock('@sunbird-cb/toc/lib/services/access-control.service', () => ({
  AccessControlService: jest.fn(),
}), { virtual: true })

const makeContent = (overrides: any = {}): any => ({
  identifier: 'os-001',
  artifactUrl: 'https://old-host.com/bucket/path/file.html',
  name: 'Offline Session Test',
  description: 'Offline session description',
  mimeType: 'application/html',
  contentType: 'Resource',
  primaryCategory: 'Offline Session',
  version: 1,
  ...overrides,
})

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('OfflineSessionComponent', () => {
  let component: OfflineSessionComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockEventSvc: any
  let mockViewerSvc: any
  let mockAccessControlSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue(null) },
        queryParams: {},
        params: { resourceId: 'os-001' },
      },
      data: of({ content: { data: makeContent() } }),
    }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue(of({})),
      fetchCourseBatch: jest.fn().mockReturnValue(of({ result: { response: null } })),
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
      setProgramChildResumeData: jest.fn(),
    }
    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }
    mockViewerSvc = {
      getBatchIdAndCourseId: jest.fn().mockReturnValue({ batchId: 'b-1', courseId: 'c-1' }),
    }
    mockAccessControlSvc = {
      authoringConfig: { newDesign: false },
    }
    mockConfigSvc = {
      userProfile: { userId: 'user-001' },
    }

    component = new OfflineSessionComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockEventSvc,
      mockViewerSvc,
      mockAccessControlSvc,
      mockConfigSvc,
    )
  })

  afterEach(() => {
    if ((component as any).dataSubscription) {
      (component as any).dataSubscription.unsubscribe()
    }
    if ((component as any).viewerDataSubscription) {
      (component as any).viewerDataSubscription.unsubscribe()
    }
    jest.restoreAllMocks()
  })

  // ─── creation ────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have isFetchingDataComplete=false initially', () => {
    expect(component.isFetchingDataComplete).toBe(false)
  })

  it('should have offlineSessionData=null initially', () => {
    expect(component.offlineSessionData).toBeNull()
  })

  it('should have alreadyRaised=false initially', () => {
    expect(component.alreadyRaised).toBe(false)
  })

  // ─── ngOnInit – normal data subscription ─────────────────────────────────
  describe('ngOnInit - normal route (no preview)', () => {
    it('should set offlineSessionData from route data', async () => {
      component.ngOnInit()
      await flush()
      expect(component.offlineSessionData!.identifier).toBe('os-001')
    })

    it('should call formDiscussionForumWidget when content is available', async () => {
      component.ngOnInit()
      await flush()
      expect(component.discussionForumWidget).not.toBeNull()
    })

    it('should call setS3Cookie when artifactUrl contains content-store', async () => {
      mockActivatedRoute.data = of({ content: { data: makeContent({ artifactUrl: '/content-store/path.html' }) } })
      component = new OfflineSessionComponent(mockActivatedRoute, mockContentSvc, mockEventSvc, mockViewerSvc, mockAccessControlSvc, mockConfigSvc)
      component.ngOnInit()
      await flush()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalled()
    })

    it('should not call setS3Cookie when artifactUrl does not contain content-store', async () => {
      component.ngOnInit()
      await flush()
      expect(mockContentSvc.setS3Cookie).not.toHaveBeenCalled()
    })

    it('should set widgetData.identifier from content', async () => {
      component.ngOnInit()
      await flush()
      expect(component.widgetResolverOfflineSessionData.widgetData.identifier).toBe('os-001')
    })

    it('should set widgetData.mimeType from content', async () => {
      component.ngOnInit()
      await flush()
      expect(component.widgetResolverOfflineSessionData.widgetData.mimeType).toBe('application/html')
    })

    it('should set isFetchingDataComplete=true after data loads', async () => {
      component.ngOnInit()
      await flush()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should set oldData and alreadyRaised after loading', async () => {
      component.forPreview = false
      component.ngOnInit()
      await flush()
      expect(component.alreadyRaised).toBe(true)
      expect(component.oldData!.identifier).toBe('os-001')
    })

    it('should dispatch Loaded telemetry event', async () => {
      component.forPreview = false
      component.ngOnInit()
      await flush()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should dispatch Unloaded event when alreadyRaised=true and oldData exists on re-navigation', async () => {
      component.forPreview = false
      component.alreadyRaised = true
      component.oldData = makeContent({ identifier: 'old-001' })
      component.ngOnInit()
      await flush()
      // Unloaded (old) + Loaded (new)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledTimes(2)
    })

    it('should set collectionId in widgetData when queryParams.collectionId exists', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-123' }
      component = new OfflineSessionComponent(mockActivatedRoute, mockContentSvc, mockEventSvc, mockViewerSvc, mockAccessControlSvc, mockConfigSvc)
      component.ngOnInit()
      await flush()
      expect(component.widgetResolverOfflineSessionData.widgetData.collectionId).toBe('col-123')
    })

    it('should set collectionId to empty string when queryParams.collectionId not present', async () => {
      component.ngOnInit()
      await flush()
      expect(component.widgetResolverOfflineSessionData.widgetData.collectionId).toBe('')
    })

    it('should call fetchCourseBatch when no batchData', async () => {
      component.ngOnInit()
      await flush()
      expect(mockContentSvc.fetchCourseBatch).toHaveBeenCalled()
    })

    it('should handle error in data subscription silently', () => {
      mockActivatedRoute.data = {
        subscribe: jest.fn((_success: any, error: any) => error && error()),
      }
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  // ─── formDiscussionForumWidget ────────────────────────────────────────────
  describe('formDiscussionForumWidget', () => {
    it('should create discussionForumWidget with correct data', () => {
      const content = makeContent()
      component.formDiscussionForumWidget(content)
      expect(component.discussionForumWidget).not.toBeNull()
      expect(component.discussionForumWidget!.widgetData.id).toBe('os-001')
      expect(component.discussionForumWidget!.widgetData.title).toBe('Offline Session Test')
    })
  })

  // ─── generateUrl ──────────────────────────────────────────────────────────
  describe('generateUrl', () => {
    it('should replace host and bucket in the URL', () => {
      const oldUrl = 'https://old-host.com/old-bucket/path/file.html'
      const result = component.generateUrl(oldUrl)
      expect(result).toContain('azure.example.com')
      expect(result).toContain('test-bucket')
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should dispatch Unloaded event if offlineSessionData exists', async () => {
      component.forPreview = false
      component.ngOnInit()
      await flush()
      mockEventSvc.dispatchEvent.mockClear()
      component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should unsubscribe dataSubscription', async () => {
      component.ngOnInit()
      await flush()
      const sub = (component as any).dataSubscription
      if (sub) {
        const unsubSpy = jest.spyOn(sub, 'unsubscribe')
        component.ngOnDestroy()
        expect(unsubSpy).toHaveBeenCalled()
      }
    })

    it('should not throw if subscriptions are null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
