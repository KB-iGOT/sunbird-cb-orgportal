import { of, throwError } from 'rxjs'
import { WsEvents } from '@sunbird-cb/utils'
import { PdfComponent } from './pdf.component'

jest.mock('../../../../../../../src/environments/environment', () => ({
  environment: {
    azureHost: 'https://newhost.example.com',
    azureBucket: 'new-bucket',
    mdoPath: 'https://cdn.example.com',
    contentBucket: 'content-bucket',
  },
}), { virtual: true })

const mockPdfData: any = {
  identifier: 'pdf-001',
  name: 'Test PDF',
  description: 'A test PDF resource',
  artifactUrl: 'https://oldhost.example.com/old-bucket/content/path/doc.pdf',
  mimeType: 'application/pdf',
  primaryCategory: 'Learning Resource',
  contentType: 'Resource',
}

describe('PdfComponent', () => {
  let component: PdfComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockEventSvc: any
  let mockAccessControlSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue(null) },
        paramMap: { get: jest.fn().mockReturnValue('pdf-001') },
        queryParams: {},
      },
      data: of({ content: { data: { ...mockPdfData } } }),
    }
    mockContentSvc = {
      fetchContentHistory: jest.fn().mockReturnValue(of(null)),
    }
    mockViewerSvc = {
      getContent: jest.fn().mockReturnValue(of({ ...mockPdfData })),
    }
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockAccessControlSvc = { authoringConfig: { newDesign: false } }

    component = new PdfComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockViewerSvc,
      mockEventSvc,
      mockAccessControlSvc,
    )
    component.forPreview = false
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Creation / defaults
  // ──────────────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize widgetResolverPdfData with defaults', () => {
    expect(component.widgetResolverPdfData.widgetType).toBe('player')
    expect(component.widgetResolverPdfData.widgetSubType).toBe('playerPDF')
    expect(component.widgetResolverPdfData.widgetData.pdfUrl).toBe('')
  })

  it('should initialize isFetchingDataComplete as false', () => {
    expect(component.isFetchingDataComplete).toBe(false)
  })

  it('should initialize pdfData as null', () => {
    expect(component.pdfData).toBeNull()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit — normal (non-preview) mode
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit — normal mode', () => {
    it('should set pdfData from route data', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.pdfData).toBeTruthy()
      expect(component.pdfData.identifier).toBe('pdf-001')
    })

    it('should set isFetchingDataComplete to true', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should set isPreviewMode to false', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isPreviewMode).toBe(false)
    })

    it('should call formDiscussionForumWidget when pdfData is present', async () => {
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'pdf-001' }))
    })

    it('should not call formDiscussionForumWidget when pdfData is null', async () => {
      mockActivatedRoute.data = of({ content: { data: null } })
      component = new PdfComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.forPreview = false
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should set pdfUrl via getUrl', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(typeof component.widgetResolverPdfData.widgetData.pdfUrl).toBe('string')
      expect(component.widgetResolverPdfData.widgetData.pdfUrl.length).toBeGreaterThan(0)
    })

    it('should set identifier from pdfData', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverPdfData.widgetData.identifier).toBe('pdf-001')
    })

    it('should set alreadyRaised to true after first load', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.alreadyRaised).toBe(true)
    })

    it('should set oldData to pdfData after first load', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.oldData).toBeTruthy()
      expect(component.oldData?.identifier).toBe('pdf-001')
    })

    it('should raise Loaded event on first init', async () => {
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Loaded, expect.any(Object))
    })

    it('should raise Unloaded for oldData on second call', async () => {
      component.ngOnInit()
      await Promise.resolve()
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Unloaded, expect.any(Object))
    })

    it('should set pdfUrl to empty string when pdfData is null', async () => {
      mockActivatedRoute.data = of({ content: { data: null } })
      component = new PdfComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverPdfData.widgetData.pdfUrl).toBe('')
    })

    it('should set identifier to null when pdfData is null', async () => {
      mockActivatedRoute.data = of({ content: { data: null } })
      component = new PdfComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverPdfData.widgetData.identifier).toBeFalsy()
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
          paramMap: { get: jest.fn().mockReturnValue('pdf-001') },
          queryParams: {},
        },
        data: of({ content: { data: { ...mockPdfData } } }),
      }
      component = new PdfComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.forPreview = false
    })

    it('should set isPreviewMode to true', () => {
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(true)
    })

    it('should call viewerSvc.getContent with resourceId', () => {
      component.ngOnInit()
      expect(mockViewerSvc.getContent).toHaveBeenCalledWith('pdf-001')
    })

    it('should set pdfData from viewerSvc', () => {
      component.ngOnInit()
      expect(component.pdfData).toBeTruthy()
      expect(component.pdfData.identifier).toBe('pdf-001')
    })

    it('should set disableTelemetry to true', () => {
      component.ngOnInit()
      expect(component.widgetResolverPdfData.widgetData.disableTelemetry).toBe(true)
    })

    it('should set isFetchingDataComplete to true', () => {
      component.ngOnInit()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should call formDiscussionForumWidget in preview mode', () => {
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set discussionForumWidget.widgetData.isDisabled to true', () => {
      component.ngOnInit()
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })

    it('should set pdfUrl via generateUrl + getUrl in preview mode', () => {
      component.ngOnInit()
      expect(typeof component.widgetResolverPdfData.widgetData.pdfUrl).toBe('string')
    })

    it('should not call viewerSvc when newDesign is true', () => {
      mockAccessControlSvc.authoringConfig.newDesign = true
      component.ngOnInit()
      expect(mockViewerSvc.getContent).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // generateUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('generateUrl', () => {
    it('should return empty string for empty input', () => {
      expect(component.generateUrl('')).toBe('')
    })

    it('should replace host and bucket in URL', () => {
      const result = component.generateUrl('https://oldhost.example.com/old-bucket/path/doc.pdf')
      expect(result).toContain('newhost.example.com')
      expect(result).toContain('new-bucket')
    })

    it('should preserve the path after the bucket', () => {
      const result = component.generateUrl('https://oldhost.example.com/old-bucket/path/doc.pdf')
      expect(result).toContain('path/doc.pdf')
    })

    it('should handle single-segment URL gracefully', () => {
      expect(typeof component.generateUrl('https://host.com')).toBe('string')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('getUrl', () => {
    it('should return original url for empty string', () => {
      expect(component.getUrl('')).toBe('')
    })

    it('should build URL with /content prefix for non-collection urls', () => {
      const result = component.getUrl('https://example.com/content/path/doc.pdf')
      expect(result).toContain('https://cdn.example.com/content-bucket/content')
      expect(result).toContain('/path/doc.pdf')
    })

    it('should build URL without /content prefix for collection urls', () => {
      const result = component.getUrl('https://example.com/collection/content/path/doc.pdf')
      expect(result).toContain('https://cdn.example.com/content-bucket')
      // should NOT add extra /content since it hits the collection branch
    })

    it('should handle url with no content segment', () => {
      const result = component.getUrl('https://example.com/path/doc.pdf')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // formDiscussionForumWidget
  // ──────────────────────────────────────────────────────────────────────────
  describe('formDiscussionForumWidget', () => {
    it('should set discussionForumWidget', () => {
      component.formDiscussionForumWidget(mockPdfData)
      expect(component.discussionForumWidget).toBeTruthy()
    })

    it('should set widgetType and widgetSubType to discussionForum', () => {
      component.formDiscussionForumWidget(mockPdfData)
      expect(component.discussionForumWidget?.widgetType).toBe('discussionForum')
      expect(component.discussionForumWidget?.widgetSubType).toBe('discussionForum')
    })

    it('should set id from content identifier', () => {
      component.formDiscussionForumWidget(mockPdfData)
      expect(component.discussionForumWidget?.widgetData.id).toBe('pdf-001')
    })

    it('should set title from content name', () => {
      component.formDiscussionForumWidget(mockPdfData)
      expect(component.discussionForumWidget?.widgetData.title).toBe('Test PDF')
    })

    it('should set initialPostCount to 2', () => {
      component.formDiscussionForumWidget(mockPdfData)
      expect(component.discussionForumWidget?.widgetData.initialPostCount).toBe(2)
    })

    it('should set isDisabled false when forPreview is false', () => {
      component.forPreview = false
      component.formDiscussionForumWidget(mockPdfData)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(false)
    })

    it('should set isDisabled true when forPreview is true', () => {
      component.forPreview = true
      component.formDiscussionForumWidget(mockPdfData)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // raiseEvent
  // ──────────────────────────────────────────────────────────────────────────
  describe('raiseEvent', () => {
    it('should dispatch event when not forPreview', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockPdfData)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should not dispatch event when forPreview is true', () => {
      component.forPreview = true
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockPdfData)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should dispatch event with correct state', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockPdfData)
      const event = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(event.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded)
    })

    it('should include identifier in dispatched event', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockPdfData)
      const event = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(event.data.identifier).toBe('pdf-001')
    })

    it('should dispatch Unloaded event', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, mockPdfData)
      const event = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(event.data.state).toBe(WsEvents.EnumTelemetrySubType.Unloaded)
    })

    it('should set from field to pdf', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockPdfData)
      const event = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(event.from).toBe('pdf')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // fetchContinueLearning
  // ──────────────────────────────────────────────────────────────────────────
  describe('fetchContinueLearning', () => {
    beforeEach(() => {
      component.widgetResolverPdfData.widgetData.resumePage = 1
    })

    it('should resolve true on null data', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
      const result = await component.fetchContinueLearning('col-001', 'pdf-001')
      expect(result).toBe(true)
    })

    it('should set resumePage when identifier matches and progress exists', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'pdf-001',
        continueData: { progress: '5' },
      }))
      await component.fetchContinueLearning('col-001', 'pdf-001')
      expect(component.widgetResolverPdfData.widgetData.resumePage).toBe(5)
    })

    it('should not set resumePage when identifier does not match', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'other-pdf',
        continueData: { progress: '5' },
      }))
      await component.fetchContinueLearning('col-001', 'pdf-001')
      expect(component.widgetResolverPdfData.widgetData.resumePage).toBe(1)
    })

    it('should not set resumePage when continueData is absent', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'pdf-001',
        continueData: null,
      }))
      await component.fetchContinueLearning('col-001', 'pdf-001')
      expect(component.widgetResolverPdfData.widgetData.resumePage).toBe(1)
    })

    it('should not set resumePage when progress is absent', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'pdf-001',
        continueData: {},
      }))
      await component.fetchContinueLearning('col-001', 'pdf-001')
      expect(component.widgetResolverPdfData.widgetData.resumePage).toBe(1)
    })

    it('should resolve true on error', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(throwError(() => new Error('fail')))
      const result = await component.fetchContinueLearning('col-001', 'pdf-001')
      expect(result).toBe(true)
    })

    it('should call fetchContentHistory with collectionId', async () => {
      await component.fetchContinueLearning('col-007', 'pdf-001')
      expect(mockContentSvc.fetchContentHistory).toHaveBeenCalledWith('col-007')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnDestroy
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should call raiseEvent(Unloaded) when pdfData is set', () => {
      component.pdfData = { ...mockPdfData }
      component.forPreview = false
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Unloaded, expect.any(Object))
    })

    it('should not call raiseEvent when pdfData is null', () => {
      component.pdfData = null
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
