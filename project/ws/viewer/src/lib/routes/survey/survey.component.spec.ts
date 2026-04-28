// Mock the ViewerUtilService module to prevent transitive ESM import issues (jspdf)
jest.mock('../../viewer-util.service', () => ({
  ViewerUtilService: jest.fn(),
}))

import { Subject, of } from 'rxjs'
import { SurveyComponent } from './survey.component'
import { WsEvents } from '@sunbird-cb/utils-v2'

const buildMockActivatedRoute = (overrides: any = {}) => {
  const defaults = {
    preview: null,
    resourceId: 'res1',
    batchId: 'batch1',
    collectionId: null as string | null,
    data: new Subject<any>(),
  }
  const cfg = { ...defaults, ...overrides }

  return {
    snapshot: {
      queryParamMap: {
        get: (key: string) => (key === 'preview' ? cfg.preview : key === 'batchId' ? cfg.batchId : null),
      },
      paramMap: {
        get: (_key: string) => cfg.resourceId,
      },
      queryParams: {
        collectionId: cfg.collectionId,
        batchId: cfg.batchId,
      },
    },
    data: cfg.data,
  }
}

const buildSurveyContent = (overrides: any = {}): any => ({
  identifier: 'survey1',
  name: 'Test Survey',
  description: 'A survey',
  artifactUrl: 'https://example.com/survey.html',
  mimeType: 'application/pdf',
  contentType: 'Resource',
  primaryCategory: 'Survey',
  version: 1,
  ...overrides,
})

describe('SurveyComponent', () => {
  let component: SurveyComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockEventSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockActivatedRoute = buildMockActivatedRoute()

    mockContentSvc = {
      fetchContent: jest.fn(),
      fetchContentHistoryV2: jest.fn(),
      setS3Cookie: jest.fn(),
    }

    mockViewerSvc = {
      getContent: jest.fn(),
      getAuthoringUrl: jest.fn((url: string) => `authoring://${url}`),
      getBatchIdAndCourseId: jest.fn().mockReturnValue({ batchId: 'batch1', courseId: 'course1' }),
    }

    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }

    mockConfigSvc = {
      userProfile: { userId: 'user1' },
    }

    component = new SurveyComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockViewerSvc,
      mockEventSvc,
      mockConfigSvc,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── Initialization ────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should have isFetchingDataComplete false by default', () => {
      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('should have alreadyRaised false by default', () => {
      expect(component.alreadyRaised).toBe(false)
    })

    it('should have surveyData null by default', () => {
      expect(component.surveyData).toBeNull()
    })

    it('should have discussionForumWidget null by default', () => {
      expect(component.discussionForumWidget).toBeNull()
    })

    it('should read batchId from queryParamMap in constructor', () => {
      expect(component.batchId).toBe('batch1')
    })
  })

  // ─── formDiscussionForumWidget ────────────────────────────────────────────

  describe('formDiscussionForumWidget', () => {
    it('should set discussionForumWidget with content data', () => {
      const content = buildSurveyContent()
      component.formDiscussionForumWidget(content)

      expect(component.discussionForumWidget).not.toBeNull()
      expect(component.discussionForumWidget!.widgetData.id).toBe('survey1')
      expect(component.discussionForumWidget!.widgetData.title).toBe('Test Survey')
      expect(component.discussionForumWidget!.widgetData.description).toBe('A survey')
      expect(component.discussionForumWidget!.widgetSubType).toBe('discussionForum')
      expect(component.discussionForumWidget!.widgetType).toBe('discussionForum')
    })

    it('should set initialPostCount to 2', () => {
      component.formDiscussionForumWidget(buildSurveyContent())
      expect(component.discussionForumWidget!.widgetData.initialPostCount).toBe(2)
    })
  })

  // ─── raiseEvent ───────────────────────────────────────────────────────────

  describe('raiseEvent', () => {
    it('should dispatch event when not in preview mode', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildSurveyContent())
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledTimes(1)
    })

    it('should not dispatch event when forPreview is true', () => {
      component.forPreview = true
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildSurveyContent())
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should dispatch event with correct event structure', () => {
      component.forPreview = false
      const content = buildSurveyContent()
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, content)

      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded)
      expect(dispatched.data.content).toBe(content)
      expect(dispatched.data.identifier).toBe('survey1')
    })

    it('should handle null collectionId in rollup', () => {
      component.forPreview = false
      mockActivatedRoute.snapshot.queryParams.collectionId = undefined
      const content = buildSurveyContent()
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, content)

      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.object.rollup.l1).toBe('')
    })
  })

  // ─── fetchContent ─────────────────────────────────────────────────────────

  describe('fetchContent', () => {
    it('should fetch content and set courseName', async () => {
      component.widgetResolverSurveyData.widgetData.collectionId = 'col1'
      mockContentSvc.fetchContent.mockReturnValue(
        of({ result: { content: { name: 'My Course' } } })
      )

      await component.fetchContent()

      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('col1', 'minimal')
      expect(component.widgetResolverSurveyData.widgetData.courseName).toBe('My Course')
    })

    it('should use empty string collectionId when not set', async () => {
      component.widgetResolverSurveyData.widgetData.collectionId = ''
      mockContentSvc.fetchContent.mockReturnValue(
        of({ result: { content: { name: 'Course' } } })
      )

      await component.fetchContent()

      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('', 'minimal')
    })
  })

  // ─── fetchContinueLearning ────────────────────────────────────────────────

  describe('fetchContinueLearning', () => {
    it('should resolve with true immediately when no collectionId or batchId', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: null, batchId: null }
      const result = await component.fetchContinueLearning('survey1')
      expect(result).toBe(true)
      expect(mockContentSvc.fetchContentHistoryV2).not.toHaveBeenCalled()
    })

    it('should call fetchContentHistoryV2 when collectionId, batchId, and surveyId all present', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1', batchId: 'batch1' }
      mockViewerSvc.getBatchIdAndCourseId.mockReturnValue({ batchId: 'batch1', courseId: 'course1' })
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(
        of({ result: { contentList: [] } })
      )

      await component.fetchContinueLearning('survey1')

      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })

    it('should resolve when contentList has entries', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1', batchId: 'batch1' }
      mockViewerSvc.getBatchIdAndCourseId.mockReturnValue({ batchId: 'batch1', courseId: 'course1' })
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(
        of({ result: { contentList: [{ contentId: 'survey1', status: 2 }] } })
      )

      const result = await component.fetchContinueLearning('survey1')

      expect(result).toBe(true)
    })

    it('should resolve on fetchContentHistoryV2 error', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1', batchId: 'batch1' }
      mockViewerSvc.getBatchIdAndCourseId.mockReturnValue({ batchId: 'batch1', courseId: 'course1' })
      mockContentSvc.fetchContentHistoryV2.mockReturnValue({
        subscribe: (_next: any, error: any) => error(new Error('fail')),
      })

      const result = await component.fetchContinueLearning('survey1')

      expect(result).toBe(true)
    })

    it('should use empty userId when userProfile is null', async () => {
      mockConfigSvc.userProfile = null
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1', batchId: 'batch1' }
      mockViewerSvc.getBatchIdAndCourseId.mockReturnValue({ batchId: 'batch1', courseId: 'course1' })
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(
        of({ result: { contentList: [] } })
      )

      await component.fetchContinueLearning('survey1')

      const req = mockContentSvc.fetchContentHistoryV2.mock.calls[0][0]
      expect(req.request.userId).toBeUndefined()
    })
  })

  // ─── ngOnInit — normal (data route) mode ──────────────────────────────────

  describe('ngOnInit — normal mode', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParamMap.get = (_key: string) => null
      mockContentSvc.setS3Cookie.mockReturnValue(of(null))
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(
        of({ result: { contentList: [] } })
      )
    })

    it('should subscribe to activatedRoute.data', () => {
      component.ngOnInit()
      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('should set surveyData and isFetchingDataComplete on data emission', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.surveyData).toBe(content)
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should call formDiscussionForumWidget with survey data', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(spy).toHaveBeenCalledWith(content)
    })

    it('should disable discussionForum widget after form', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(true)
    })

    it('should raise Loaded event and set alreadyRaised on first emission', async () => {
      component.forPreview = false
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.alreadyRaised).toBe(true)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should raise Unloaded for oldData on second emission', async () => {
      component.forPreview = false
      const content1 = buildSurveyContent({ identifier: 'id1', artifactUrl: 'https://x.com/a.html' })
      const content2 = buildSurveyContent({ identifier: 'id2', artifactUrl: 'https://x.com/b.html' })
      component.ngOnInit()

      mockActivatedRoute.data.next({ content: { data: content1 } })
      await new Promise(r => setTimeout(r, 10))
      mockActivatedRoute.data.next({ content: { data: content2 } })
      await new Promise(r => setTimeout(r, 10))

      // At least 2 dispatches: Loaded for id1, then Unloaded for id1, Loaded for id2
      expect(mockEventSvc.dispatchEvent.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('should call setS3Cookie when artifactUrl contains content-store', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/content-store/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('survey1')
    })

    it('should set collectionId in widgetData when queryParam collectionId present', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1', batchId: 'batch1' }
      mockContentSvc.fetchContent.mockReturnValue(
        of({ result: { content: { name: 'Course' } } })
      )
      mockViewerSvc.getBatchIdAndCourseId.mockReturnValue({ batchId: 'batch1', courseId: 'course1' })
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.widgetResolverSurveyData.widgetData.collectionId).toBe('col1')
    })

    it('should set empty collectionId when queryParam collectionId absent', async () => {
      mockActivatedRoute.snapshot.queryParams = {}
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.widgetResolverSurveyData.widgetData.collectionId).toBe('')
    })

    it('should set widgetData fields from surveyData', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.widgetResolverSurveyData.widgetData.identifier).toBe('survey1')
      expect(component.widgetResolverSurveyData.widgetData.mimeType).toBe('application/pdf')
    })

    it('should set surveyUrl from artifactUrl when not forPreview', async () => {
      component.forPreview = false
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.widgetResolverSurveyData.widgetData.surveyUrl).toBe('https://example.com/file.pdf')
    })

    it('should set surveyUrl from getAuthoringUrl when forPreview', async () => {
      component.forPreview = true
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.widgetResolverSurveyData.widgetData.surveyUrl).toBe('authoring://https://example.com/file.pdf')
    })

    it('should handle null surveyData gracefully', async () => {
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: null } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.isFetchingDataComplete).toBe(true)
      expect(component.widgetResolverSurveyData.widgetData.surveyUrl).toBe('')
    })
  })

  // ─── ngOnInit — preview mode ───────────────────────────────────────────────

  describe('ngOnInit — preview mode', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParamMap.get = (key: string) => {
        if (key === 'preview') return 'true'
        if (key === 'batchId') return 'batch1'
        return null
      }
      mockContentSvc.setS3Cookie.mockReturnValue(of(null))
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(
        of({ result: { contentList: [] } })
      )
    })

    it('should set isPreviewMode true', () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      mockViewerSvc.getContent.mockReturnValue(of(content))
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(true)
    })

    it('should call viewerSvc.getContent with resourceId', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      mockViewerSvc.getContent.mockReturnValue(of(content))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 10))

      expect(mockViewerSvc.getContent).toHaveBeenCalledWith('res1')
    })

    it('should set surveyData and isFetchingDataComplete after getContent resolves', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      mockViewerSvc.getContent.mockReturnValue(of(content))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 10))

      expect(component.surveyData).toBe(content)
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should set disableTelemetry to true in preview mode', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      mockViewerSvc.getContent.mockReturnValue(of(content))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 10))

      expect(component.widgetResolverSurveyData.widgetData.disableTelemetry).toBe(true)
    })

    it('should set isDisabled true on discussionForumWidget in preview mode', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      mockViewerSvc.getContent.mockReturnValue(of(content))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 10))

      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(true)
    })

    it('should call setS3Cookie when artifactUrl contains content-store in preview mode', async () => {
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/content-store/file.pdf' })
      mockViewerSvc.getContent.mockReturnValue(of(content))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 10))

      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('survey1')
    })

    it('should set collectionId and call fetchContent when collectionId in queryParams', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1', batchId: 'batch1' }
      mockContentSvc.fetchContent.mockReturnValue(
        of({ result: { content: { name: 'Course' } } })
      )
      mockViewerSvc.getBatchIdAndCourseId.mockReturnValue({ batchId: 'batch1', courseId: 'course1' })
      const content = buildSurveyContent({ artifactUrl: 'https://example.com/file.pdf' })
      mockViewerSvc.getContent.mockReturnValue(of(content))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 10))

      expect(component.widgetResolverSurveyData.widgetData.collectionId).toBe('col1')
    })

    it('should handle null content from getContent', async () => {
      mockViewerSvc.getContent.mockReturnValue(of(null))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 10))

      expect(component.isFetchingDataComplete).toBe(true)
      expect(component.widgetResolverSurveyData.widgetData.surveyUrl).toBe('')
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe dataSubscription if set', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['dataSubscription'] = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should unsubscribe viewerDataSubscription if set', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['viewerDataSubscription'] = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should unsubscribe telemetryIntervalSubscription if set', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['telemetryIntervalSubscription'] = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should raise Unloaded event when surveyData exists', () => {
      component.forPreview = false
      component.surveyData = buildSurveyContent()
      component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should not throw when all subscriptions are null', () => {
      component['dataSubscription'] = null
      component['viewerDataSubscription'] = null
      component['telemetryIntervalSubscription'] = null
      component.surveyData = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
