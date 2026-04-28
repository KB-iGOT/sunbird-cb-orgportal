import { of } from 'rxjs'
import { throwError } from 'rxjs'
import { WsEvents } from '@sunbird-cb/utils-v2'
import { SurveyComponent } from './survey.component'

const mockSurveyData: any = {
  identifier: 'survey-001',
  name: 'Test Survey',
  description: 'A test survey',
  artifactUrl: 'https://example.com/survey.html',
  mimeType: 'application/html',
  contentType: 'Survey',
  primaryCategory: 'Observation',
  version: 1,
}

describe('SurveyComponent', () => {
  let component: SurveyComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockEventSvc: any
  let mockConfigSvc: any

  function buildComponent(routeOverrides: any = {}) {
    const base: any = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue(null) },
        paramMap: { get: jest.fn().mockReturnValue('survey-001') },
        queryParams: {},
      },
      data: of({ content: { data: { ...mockSurveyData } } }),
    }
    mockActivatedRoute = { ...base, ...routeOverrides }
    return new SurveyComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockViewerSvc,
      mockEventSvc,
      mockConfigSvc,
    )
  }

  beforeEach(() => {
    mockContentSvc = {
      fetchContent: jest.fn().mockReturnValue(of({ result: { content: { name: 'Course Name' } } })),
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({ result: { contentList: [] } })),
      setS3Cookie: jest.fn().mockReturnValue(of({})),
    }
    mockViewerSvc = {
      getContent: jest.fn().mockReturnValue(of({ ...mockSurveyData })),
      getAuthoringUrl: jest.fn().mockImplementation((url: string) => `authoring://${url}`),
      getBatchIdAndCourseId: jest.fn().mockReturnValue({ batchId: 'batch-001', courseId: 'col-001' }),
    }
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockConfigSvc = { userProfile: { userId: 'user-001' } }

    component = buildComponent()
    component.forPreview = false
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Basic creation
  // ──────────────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize widgetResolverSurveyData with default values', () => {
    expect(component.widgetResolverSurveyData.widgetType).toBe('player')
    expect(component.widgetResolverSurveyData.widgetSubType).toBe('playerSurvey')
    expect(component.widgetResolverSurveyData.widgetData.surveyUrl).toBe('')
  })

  it('should set batchId from queryParamMap', () => {
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue('batch-123') },
        paramMap: { get: jest.fn().mockReturnValue('survey-001') },
        queryParams: {},
      },
      data: of({ content: { data: { ...mockSurveyData } } }),
    }
    component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
    expect(component.batchId).toBe('batch-123')
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit — normal (non-preview) mode
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit — normal mode', () => {
    it('should set surveyData from route data', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.surveyData.identifier).toBe('survey-001')
    })

    it('should set isFetchingDataComplete to true', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should call formDiscussionForumWidget when surveyData is present', async () => {
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'survey-001' }))
    })

    it('should set discussionForumWidget.widgetData.isDisabled to true', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })

    it('should raise Loaded event on first ngOnInit', async () => {
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Loaded, expect.any(Object))
    })

    it('should set alreadyRaised and oldData after first load', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.alreadyRaised).toBe(true)
      expect(component.oldData).toBeTruthy()
    })

    it('should raise Unloaded for oldData on second call', async () => {
      component.ngOnInit()
      await Promise.resolve()
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Unloaded, expect.any(Object))
    })

    it('should set widgetData identifier, mimeType, contentType, primaryCategory, version', async () => {
      component.ngOnInit()
      await Promise.resolve()
      const wd = component.widgetResolverSurveyData.widgetData
      expect(wd.identifier).toBe('survey-001')
      expect(wd.mimeType).toBe('application/html')
      expect(wd.contentType).toBe('Survey')
      expect(wd.primaryCategory).toBe('Observation')
      expect(wd.version).toContain('1')
    })

    it('should set surveyUrl to artifactUrl when not forPreview', async () => {
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverSurveyData.widgetData.surveyUrl).toBe(mockSurveyData.artifactUrl)
    })

    it('should set surveyUrl via getAuthoringUrl when forPreview is true', async () => {
      component.forPreview = true
      component.ngOnInit()
      await Promise.resolve()
      expect(mockViewerSvc.getAuthoringUrl).toHaveBeenCalled()
    })

    it('should set collectionId from queryParams when present', async () => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue(null) },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: { collectionId: 'col-999' },
        },
        data: of({ content: { data: { ...mockSurveyData } } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverSurveyData.widgetData.collectionId).toBe('col-999')
    })

    it('should call fetchContent when collectionId is present', async () => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue(null) },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: { collectionId: 'col-999' },
        },
        data: of({ content: { data: { ...mockSurveyData } } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('col-999', 'minimal')
    })

    it('should set collectionId to empty string when queryParams missing', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverSurveyData.widgetData.collectionId).toBe('')
    })

    it('should call setS3Cookie when artifactUrl contains content-store', async () => {
      const contentStoreData = { ...mockSurveyData, artifactUrl: 'https://example.com/content-store/survey.html' }
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue(null) },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: {},
        },
        data: of({ content: { data: contentStoreData } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('survey-001')
    })

    it('should not call setS3Cookie when artifactUrl does not contain content-store', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).not.toHaveBeenCalled()
    })

    it('should call fetchContinueLearning with surveyId', async () => {
      const spy = jest.spyOn(component, 'fetchContinueLearning')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith('survey-001')
    })

    it('should call fetchContinueLearning via collectionId path', async () => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue(null) },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: { collectionId: 'col-999' },
        },
        data: of({ content: { data: { ...mockSurveyData } } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
      const spy = jest.spyOn(component, 'fetchContinueLearning')
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(spy).toHaveBeenCalled()
    })

    it('should not raise event when surveyData is null', async () => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue(null) },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: {},
        },
        data: of({ content: { data: null } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit — preview mode
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit — preview mode', () => {
    beforeEach(() => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue('true') },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: {},
        },
        data: of({ content: { data: { ...mockSurveyData } } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
    })

    it('should set isPreviewMode to true', () => {
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(true)
    })

    it('should call viewerSvc.getContent with resourceId', () => {
      component.ngOnInit()
      expect(mockViewerSvc.getContent).toHaveBeenCalledWith('survey-001')
    })

    it('should set surveyData from viewerSvc', () => {
      component.ngOnInit()
      expect(component.surveyData).toBeTruthy()
    })

    it('should set disableTelemetry to true', async () => {
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(component.widgetResolverSurveyData.widgetData.disableTelemetry).toBe(true)
    })

    it('should set isFetchingDataComplete to true', async () => {
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should call formDiscussionForumWidget in preview mode', () => {
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set discussionForumWidget.widgetData.isDisabled to true in preview mode', () => {
      component.ngOnInit()
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })

    it('should call setS3Cookie in preview mode when url has content-store', () => {
      mockViewerSvc.getContent.mockReturnValue(of({
        ...mockSurveyData,
        artifactUrl: 'https://example.com/content-store/survey.html',
      }))
      component.ngOnInit()
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('survey-001')
    })

    it('should set collectionId from queryParams in preview mode', () => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue('true') },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: { collectionId: 'col-preview' },
        },
        data: of({ content: { data: { ...mockSurveyData } } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
      component.ngOnInit()
      expect(component.widgetResolverSurveyData.widgetData.collectionId).toBe('col-preview')
    })

    it('should call fetchContent in preview mode when collectionId present', () => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue('true') },
          paramMap: { get: jest.fn().mockReturnValue('survey-001') },
          queryParams: { collectionId: 'col-preview' },
        },
        data: of({ content: { data: { ...mockSurveyData } } }),
      }
      component = new SurveyComponent(mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockConfigSvc)
      component.forPreview = false
      component.ngOnInit()
      expect(mockContentSvc.fetchContent).toHaveBeenCalled()
    })

    it('should set collectionId to empty string in preview mode when no collectionId', () => {
      component.ngOnInit()
      expect(component.widgetResolverSurveyData.widgetData.collectionId).toBe('')
    })

    it('should set surveyUrl via artifactUrl in preview non-author mode', async () => {
      component.forPreview = false
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(component.widgetResolverSurveyData.widgetData.surveyUrl).toBe(mockSurveyData.artifactUrl)
    })

    it('should set surveyUrl via getAuthoringUrl when forPreview=true in preview mode', async () => {
      component.forPreview = true
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(mockViewerSvc.getAuthoringUrl).toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // formDiscussionForumWidget
  // ──────────────────────────────────────────────────────────────────────────
  describe('formDiscussionForumWidget', () => {
    it('should set discussionForumWidget', () => {
      component.formDiscussionForumWidget(mockSurveyData)
      expect(component.discussionForumWidget).toBeTruthy()
    })

    it('should set widgetType and widgetSubType to discussionForum', () => {
      component.formDiscussionForumWidget(mockSurveyData)
      expect(component.discussionForumWidget?.widgetType).toBe('discussionForum')
      expect(component.discussionForumWidget?.widgetSubType).toBe('discussionForum')
    })

    it('should set id from content identifier', () => {
      component.formDiscussionForumWidget(mockSurveyData)
      expect(component.discussionForumWidget?.widgetData.id).toBe('survey-001')
    })

    it('should set title from content name', () => {
      component.formDiscussionForumWidget(mockSurveyData)
      expect(component.discussionForumWidget?.widgetData.title).toBe('Test Survey')
    })

    it('should set isDisabled from forPreview flag (false)', () => {
      component.forPreview = false
      component.formDiscussionForumWidget(mockSurveyData)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(false)
    })

    it('should set isDisabled from forPreview flag (true)', () => {
      component.forPreview = true
      component.formDiscussionForumWidget(mockSurveyData)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })

    it('should set initialPostCount to 2', () => {
      component.formDiscussionForumWidget(mockSurveyData)
      expect(component.discussionForumWidget?.widgetData.initialPostCount).toBe(2)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // raiseEvent
  // ──────────────────────────────────────────────────────────────────────────
  describe('raiseEvent', () => {
    it('should dispatch event when not forPreview', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockSurveyData)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should not dispatch event when forPreview is true', () => {
      component.forPreview = true
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockSurveyData)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should dispatch event with correct state', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockSurveyData)
      const dispatchedArg = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatchedArg.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded)
    })

    it('should include identifier in dispatched event', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockSurveyData)
      const dispatchedArg = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatchedArg.data.identifier).toBe('survey-001')
    })

    it('should include collectionId in rollup when present', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-999' }
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockSurveyData)
      const dispatchedArg = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatchedArg.data.object.rollup.l1).toBe('col-999')
    })

    it('should use empty string for rollup when no collectionId', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockSurveyData)
      const dispatchedArg = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatchedArg.data.object.rollup.l1).toBe('')
    })

    it('should dispatch Unloaded event', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, mockSurveyData)
      const dispatchedArg = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatchedArg.data.state).toBe(WsEvents.EnumTelemetrySubType.Unloaded)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // fetchContent
  // ──────────────────────────────────────────────────────────────────────────
  describe('fetchContent', () => {
    it('should call contentSvc.fetchContent with collectionId', async () => {
      component.widgetResolverSurveyData.widgetData.collectionId = 'col-fetch'
      await component.fetchContent()
      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('col-fetch', 'minimal')
    })

    it('should set courseName from content result', async () => {
      component.widgetResolverSurveyData.widgetData.collectionId = 'col-fetch'
      await component.fetchContent()
      expect(component.widgetResolverSurveyData.widgetData.courseName).toBe('Course Name')
    })

    it('should use empty string when collectionId is falsy', async () => {
      component.widgetResolverSurveyData.widgetData.collectionId = ''
      await component.fetchContent()
      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('', 'minimal')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // fetchContinueLearning
  // ──────────────────────────────────────────────────────────────────────────
  describe('fetchContinueLearning', () => {
    it('should resolve true when no collectionId/batchId', async () => {
      const result = await component.fetchContinueLearning('survey-001')
      expect(result).toBe(true)
    })

    it('should call getBatchIdAndCourseId when collectionId and batchId present', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', batchId: 'batch-001' }
      const result = await component.fetchContinueLearning('survey-001')
      expect(mockViewerSvc.getBatchIdAndCourseId).toHaveBeenCalledWith('col-001', 'batch-001', 'survey-001')
      expect(result).toBe(true)
    })

    it('should call fetchContentHistoryV2 when collectionId and batchId present', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', batchId: 'batch-001' }
      await component.fetchContinueLearning('survey-001')
      expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
    })

    it('should use userId from configSvc.userProfile', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', batchId: 'batch-001' }
      await component.fetchContinueLearning('survey-001')
      const req = mockContentSvc.fetchContentHistoryV2.mock.calls[0][0]
      expect(req.request.userId).toBe('user-001')
    })

    it('should handle null userProfile gracefully', async () => {
      mockConfigSvc.userProfile = null
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', batchId: 'batch-001' }
      const result = await component.fetchContinueLearning('survey-001')
      expect(result).toBe(true)
    })

    it('should resolve true when fetchContentHistoryV2 returns data with contentList', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(of({
        result: { contentList: [{ contentId: 'survey-001', status: 2 }] },
      }))
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', batchId: 'batch-001' }
      const result = await component.fetchContinueLearning('survey-001')
      expect(result).toBe(true)
    })

    it('should resolve true on fetchContentHistoryV2 error', async () => {
      mockContentSvc.fetchContentHistoryV2.mockReturnValue(throwError(() => new Error('fail')))
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', batchId: 'batch-001' }
      const result = await component.fetchContinueLearning('survey-001')
      expect(result).toBe(true)
    })

    it('should resolve true when only collectionId present but no batchId', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001' }
      const result = await component.fetchContinueLearning('survey-001')
      expect(result).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnDestroy
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should call raiseEvent(Unloaded) when surveyData is set', () => {
      component.surveyData = { ...mockSurveyData }
      component.forPreview = false
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Unloaded, expect.any(Object))
    })

    it('should not call raiseEvent when surveyData is null', () => {
      component.surveyData = null
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnDestroy()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should unsubscribe dataSubscription', () => {
      const mockUnsub = jest.fn()
        ; (component as any).dataSubscription = { unsubscribe: mockUnsub }
      component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should unsubscribe viewerDataSubscription', () => {
      const mockUnsub = jest.fn()
        ; (component as any).viewerDataSubscription = { unsubscribe: mockUnsub }
      component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should unsubscribe telemetryIntervalSubscription', () => {
      const mockUnsub = jest.fn()
        ; (component as any).telemetryIntervalSubscription = { unsubscribe: mockUnsub }
      component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should not throw when all subscriptions are null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
