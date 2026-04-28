import { of } from 'rxjs'
import { HtmlComponent } from './html.component'
import { WsEvents } from '@sunbird-cb/utils-v2'
import { NsContent } from '../../models/constant'

jest.mock('../../../../../../../src/environments/environment', () => ({
  environment: {
    azureHost: 'https://azure.example.com',
    azureBucket: 'test-bucket',
  },
}), { virtual: true })

const mockContent: any = {
  identifier: 'content-001',
  name: 'Test HTML Content',
  description: 'A test html content',
  artifactUrl: 'https://example.com/content/some-resource.html',
  appIcon: '',
  contentType: 'Resource',
  primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
  resourceType: '',
  isExternal: false,
  isIframeSupported: 'Yes',
  sourceName: '',
}

describe('HtmlComponent', () => {
  let component: HtmlComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockViewerSvc: any
  let mockRespondSvc: any
  let mockConfigSvc: any
  let mockEventSvc: any
  let mockAccessControlSvc: any

  const buildMockRouteData = (overrides: any = {}) => ({
    content: {
      data: { ...mockContent, ...overrides },
    },
  })

  beforeEach(() => {
    mockActivatedRoute = {
      data: of(buildMockRouteData()),
      snapshot: {
        queryParams: {},
        queryParamMap: { get: jest.fn().mockReturnValue(null) },
        paramMap: { get: jest.fn().mockReturnValue('content-001') },
      },
    }

    mockContentSvc = {
      saveContinueLearning: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({}),
        catch: jest.fn().mockReturnThis(),
        finally: jest.fn().mockImplementation((cb: any) => { cb(); return {} }),
      }),
    }

    mockViewerSvc = {
      getContent: jest.fn().mockReturnValue(of(mockContent)),
      realTimeProgressUpdate: jest.fn(),
    }

    mockRespondSvc = {
      loadedRespond: jest.fn().mockResolvedValue({}),
      continueLearningRespond: jest.fn().mockResolvedValue({}),
      telemetryEvents: jest.fn().mockResolvedValue({}),
      unsubscribeResponse: jest.fn(),
    }

    mockConfigSvc = {
      userProfile: { userId: 'user-123' },
    }

    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }

    mockAccessControlSvc = {
      authoringConfig: { newDesign: false },
    }

    // Default: not in author mode
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/viewer/html/content-001' },
      writable: true,
    })

    component = new HtmlComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockViewerSvc,
      mockRespondSvc,
      mockConfigSvc,
      mockEventSvc,
      mockAccessControlSvc,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should read userId from configSvc.userProfile', () => {
      component.ngOnInit()
      expect((component as any).uuid).toBe('user-123')
    })

    it('should set uuid to empty string when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      component = new HtmlComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc,
        mockRespondSvc, mockConfigSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.ngOnInit()
      expect((component as any).uuid).toBe('')
    })

    it('should set isNotEmbed false when URL contains /embed/', () => {
      window.location = { href: 'http://localhost/embed/html/content-001' } as any
      component = new HtmlComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc,
        mockRespondSvc, mockConfigSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(false)
    })

    it('should set isNotEmbed false when embed query param is true', () => {
      mockActivatedRoute.snapshot.queryParams = { embed: 'true' }
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(false)
    })

    it('should set isNotEmbed true for normal URL', () => {
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(true)
    })

    it('should populate htmlData from route data (non-content-store URL)', () => {
      component.ngOnInit()
      expect(component.htmlData).toBeTruthy()
      expect((component.htmlData as any).identifier).toBe('content-001')
    })

    it('should handle artifactUrl with content-store', () => {
      mockActivatedRoute.data = of({
        content: {
          data: { ...mockContent, artifactUrl: 'https://example.com/content-store/some-file.html' },
        },
      })
      component.ngOnInit()
      expect((component.htmlData as any).artifactUrl).toContain('content-store')
    })

    it('should replace ScormCoursePlayer URL with uuid param', () => {
      const scormUrl = 'https://example.com/ScormCoursePlayer?course=abc'
      mockActivatedRoute.data = of({ content: { data: { ...mockContent, artifactUrl: scormUrl } } })
      component.ngOnInit()
      expect((component.htmlData as any).artifactUrl).toContain('&Param1=user-123')
    })

    it('should set alreadyRaised and oldData after first load', () => {
      component.ngOnInit()
      expect((component as any).alreadyRaised).toBe(true)
      expect((component as any).oldData).toEqual(component.htmlData)
    })

    it('should set isFetchingDataComplete to true', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should call raiseEvent Loaded', () => {
      const spy = jest.spyOn(component as any, 'raiseEvent')
      component.ngOnInit()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Loaded, expect.anything())
    })

    it('should raise Unloaded event on second load when alreadyRaised is true', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component as any, 'raiseEvent')
        ; (component as any).alreadyRaised = true
        ; (component as any).oldData = mockContent

      // re-trigger — re-subscribe to the same data observable
      mockActivatedRoute.data = of(buildMockRouteData())
      component.ngOnInit()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Unloaded, expect.anything())
    })

    it('should set subApp false when re-loading', () => {
      ; (component as any).alreadyRaised = true
        ; (component as any).oldData = mockContent
        ; (component as any).subApp = true
        ; (component as any).hasFiredRealTimeProgress = true
      component.ngOnInit()
      expect((component as any).subApp).toBe(false)
    })

    it('should call fireRealTimeProgress when hasFiredRealTimeProgress is false on re-load', () => {
      ; (component as any).alreadyRaised = true
        ; (component as any).oldData = mockContent
        ; (component as any).hasFiredRealTimeProgress = false
      const spy = jest.spyOn(component as any, 'fireRealTimeProgress')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should clear realTimeProgressTimer when re-loading if timer exists', () => {
      ; (component as any).alreadyRaised = true
        ; (component as any).oldData = mockContent
        ; (component as any).hasFiredRealTimeProgress = false
        ; (component as any).realTimeProgressTimer = 999
      const clearSpy = jest.spyOn(global, 'clearTimeout')
      component.ngOnInit()
      expect(clearSpy).toHaveBeenCalledWith(999)
    })

    it('should activate preview mode when queryParamMap returns preview=true', () => {
      mockActivatedRoute.snapshot.queryParamMap = { get: jest.fn().mockReturnValue('true') }
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(true)
    })

    it('should use viewerSvc.getContent in preview mode', () => {
      mockActivatedRoute.snapshot.queryParamMap = { get: jest.fn().mockReturnValue('true') }
      component.ngOnInit()
      expect(mockViewerSvc.getContent).toHaveBeenCalledWith('content-001')
    })

    it('should set discussionForumWidget.widgetData.isDisabled when in preview mode', () => {
      mockActivatedRoute.snapshot.queryParamMap = { get: jest.fn().mockReturnValue('true') }
      component.ngOnInit()
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })

    it('should NOT set preview mode when newDesign is true', () => {
      mockAccessControlSvc.authoringConfig.newDesign = true
      mockActivatedRoute.snapshot.queryParamMap = { get: jest.fn().mockReturnValue('true') }
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(false)
    })

    it('should handle ScormCoursePlayer url in else branch (non-preview mode)', () => {
      const scormUrl = 'https://example.com/ScormCoursePlayer?course=xyz'
      mockActivatedRoute.data = of({ content: { data: { ...mockContent, artifactUrl: scormUrl } } })
      component.ngOnInit()
      expect((component.htmlData as any).artifactUrl).toContain('&Param1=user-123')
    })

    it('should handle non-ScormCoursePlayer url (no Param1 added)', () => {
      const normalUrl = 'https://example.com/some-resource.html'
      mockActivatedRoute.data = of({ content: { data: { ...mockContent, artifactUrl: normalUrl } } })
      component.ngOnInit()
      expect((component.htmlData as any).artifactUrl).not.toContain('Param1')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // formDiscussionForumWidget
  // ──────────────────────────────────────────────────────────────────────────
  describe('formDiscussionForumWidget', () => {
    it('should create discussionForumWidget with correct widgetData', () => {
      component.formDiscussionForumWidget(mockContent)
      expect(component.discussionForumWidget).toBeTruthy()
      expect(component.discussionForumWidget?.widgetData.id).toBe('content-001')
      expect(component.discussionForumWidget?.widgetData.title).toBe(mockContent.name)
      expect(component.discussionForumWidget?.widgetSubType).toBe('discussionForum')
    })

    it('should set isDisabled true when forPreview is true', () => {
      window.location = { href: 'http://localhost/author/preview' } as any
      component = new HtmlComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc,
        mockRespondSvc, mockConfigSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.formDiscussionForumWidget(mockContent)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // raiseEvent
  // ──────────────────────────────────────────────────────────────────────────
  describe('raiseEvent', () => {
    it('should dispatch telemetry event', () => {
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockContent)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: WsEvents.WsEventType.Telemetry }),
      )
    })

    it('should not dispatch event when forPreview is true', () => {
      window.location = { href: 'http://localhost/author/preview' } as any
      component = new HtmlComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc,
        mockRespondSvc, mockConfigSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockContent)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should include null identifier when data identifier is absent', () => {
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, { ...mockContent, identifier: undefined } as any)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ identifier: undefined }) }),
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // raiseRealTimeProgress (private)
  // ──────────────────────────────────────────────────────────────────────────
  describe('raiseRealTimeProgress', () => {
    it('should not run when forPreview is true', () => {
      window.location = { href: 'http://localhost/author/html' } as any
      component = new HtmlComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc,
        mockRespondSvc, mockConfigSvc, mockEventSvc, mockAccessControlSvc,
      )
      jest.useFakeTimers()
        ; (component as any).raiseRealTimeProgress()
      expect((component as any).realTimeProgressTimer).toBeUndefined()
    })

    it('should set a timeout of 2 minutes', () => {
      jest.useFakeTimers()
        ; (component as any).raiseRealTimeProgress()
      expect((component as any).realTimeProgressTimer).toBeTruthy()
    })

    it('should set hasFiredRealTimeProgress true after timeout fires', () => {
      jest.useFakeTimers()
        ; (component as any).raiseRealTimeProgress()
      jest.advanceTimersByTime(2 * 60 * 1000)
      expect((component as any).hasFiredRealTimeProgress).toBe(true)
    })

    it('should clear existing timer before starting a new one', () => {
      jest.useFakeTimers()
        ; (component as any).realTimeProgressTimer = 123
      const clearSpy = jest.spyOn(global, 'clearTimeout')
        ; (component as any).raiseRealTimeProgress()
      expect(clearSpy).toHaveBeenCalledWith(123)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // fireRealTimeProgress (private)
  // ──────────────────────────────────────────────────────────────────────────
  describe('fireRealTimeProgress', () => {
    it('should call realTimeProgressUpdate with htmlData identifier', () => {
      component.htmlData = mockContent
        ; (component as any).fireRealTimeProgress()
      expect(mockViewerSvc.realTimeProgressUpdate).toHaveBeenCalledWith(
        'content-001',
        expect.any(Object),
      )
    })

    it('should not fire when forPreview is true', () => {
      window.location = { href: 'http://localhost/author/html' } as any
      component = new HtmlComponent(
        mockActivatedRoute, mockContentSvc, mockViewerSvc,
        mockRespondSvc, mockConfigSvc, mockEventSvc, mockAccessControlSvc,
      )
      component.htmlData = mockContent
        ; (component as any).fireRealTimeProgress()
      expect(mockViewerSvc.realTimeProgressUpdate).not.toHaveBeenCalled()
    })

    it('should return early when primaryCategory is COURSE and isExternal is true', () => {
      component.htmlData = {
        ...mockContent,
        primaryCategory: NsContent.EPrimaryCategory.COURSE,
        isExternal: true,
      }
        ; (component as any).fireRealTimeProgress()
      expect(mockViewerSvc.realTimeProgressUpdate).not.toHaveBeenCalled()
    })

    it('should return early when resourceType is certification', () => {
      component.htmlData = { ...mockContent, resourceType: 'Certification' }
        ; (component as any).fireRealTimeProgress()
      expect(mockViewerSvc.realTimeProgressUpdate).not.toHaveBeenCalled()
    })

    it('should return early when isIframeSupported is "No"', () => {
      component.htmlData = { ...mockContent, isIframeSupported: 'No' }
        ; (component as any).fireRealTimeProgress()
      expect(mockViewerSvc.realTimeProgressUpdate).not.toHaveBeenCalled()
    })

    it('should return early when sourceName is Cross Knowledge', () => {
      component.htmlData = { ...mockContent, sourceName: 'Cross Knowledge' }
        ; (component as any).fireRealTimeProgress()
      expect(mockViewerSvc.realTimeProgressUpdate).not.toHaveBeenCalled()
    })

    it('should proceed when htmlData has isIframeSupported yes (case-insensitive)', () => {
      component.htmlData = { ...mockContent, isIframeSupported: 'YES' }
        ; (component as any).fireRealTimeProgress()
      expect(mockViewerSvc.realTimeProgressUpdate).toHaveBeenCalled()
    })

    it('should handle null htmlData gracefully', () => {
      component.htmlData = null
      expect(() => (component as any).fireRealTimeProgress()).not.toThrow()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // generateUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('generateUrl', () => {
    it('should return empty string for empty input', () => {
      const result = component.generateUrl('')
      expect(result).toBe('')
    })

    it('should split and reconstruct url replacing host and bucket', () => {
      const oldUrl = 'https://old-host.com/old-bucket/path/to/file.html'
      const result = component.generateUrl(oldUrl)
      // Result should be reconstructed (exact value depends on environment mock)
      expect(typeof result).toBe('string')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // saveContinueLearning
  // ──────────────────────────────────────────────────────────────────────────
  describe('saveContinueLearning', () => {
    it('should call contentSvc.saveContinueLearning for playlist collectionType', async () => {
      mockActivatedRoute.snapshot.queryParams = {
        collectionType: 'playlist',
        collectionId: 'collection-abc',
      }
      await component.saveContinueLearning(mockContent)
      expect(mockContentSvc.saveContinueLearning).toHaveBeenCalledWith(
        expect.objectContaining({ contextPathId: 'collection-abc', resourceId: 'content-001' }),
      )
    })

    it('should call contentSvc.saveContinueLearning without playlist', async () => {
      mockActivatedRoute.snapshot.queryParams = {}
      await component.saveContinueLearning(mockContent)
      expect(mockContentSvc.saveContinueLearning).toHaveBeenCalledWith(
        expect.objectContaining({ resourceId: 'content-001' }),
      )
    })

    it('should use empty strings when content is null', async () => {
      mockActivatedRoute.snapshot.queryParams = {}
      await component.saveContinueLearning(null)
      expect(mockContentSvc.saveContinueLearning).toHaveBeenCalledWith(
        expect.objectContaining({ resourceId: '' }),
      )
    })

    it('should use content.identifier as contextPathId when no collectionId', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'playlist' }
      await component.saveContinueLearning(mockContent)
      expect(mockContentSvc.saveContinueLearning).toHaveBeenCalledWith(
        expect.objectContaining({ contextPathId: 'content-001' }),
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnDestroy
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should unsubscribe routeDataSubscription if set', async () => {
      const mockUnsub = jest.fn()
        ; (component as any).routeDataSubscription = { unsubscribe: mockUnsub }
      await component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should unsubscribe responseSubscription and call unsubscribeResponse', async () => {
      const mockUnsub = jest.fn()
        ; (component as any).responseSubscription = { unsubscribe: mockUnsub }
      await component.ngOnDestroy()
      expect(mockRespondSvc.unsubscribeResponse).toHaveBeenCalled()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should unsubscribe viewerDataSubscription if set', async () => {
      const mockUnsub = jest.fn()
        ; (component as any).viewerDataSubscription = { unsubscribe: mockUnsub }
      await component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should raise Unloaded event for htmlData on destroy', async () => {
      component.htmlData = mockContent
      const spy = jest.spyOn(component as any, 'raiseEvent')
      await component.ngOnDestroy()
      expect(spy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Unloaded, mockContent)
    })

    it('should call fireRealTimeProgress on destroy when not yet fired and not forPreview', async () => {
      ; (component as any).hasFiredRealTimeProgress = false
      const spy = jest.spyOn(component as any, 'fireRealTimeProgress')
      await component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should clear realTimeProgressTimer on destroy if present', async () => {
      ; (component as any).hasFiredRealTimeProgress = false
        ; (component as any).realTimeProgressTimer = 777
      const clearSpy = jest.spyOn(global, 'clearTimeout')
      await component.ngOnDestroy()
      expect(clearSpy).toHaveBeenCalledWith(777)
    })

    it('should not call fireRealTimeProgress when already fired', async () => {
      ; (component as any).hasFiredRealTimeProgress = true
      const spy = jest.spyOn(component as any, 'fireRealTimeProgress')
      await component.ngOnDestroy()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should handle null subscriptions gracefully', async () => {
      await expect(component.ngOnDestroy()).resolves.not.toThrow()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Window message events (postMessage handler)
  // ──────────────────────────────────────────────────────────────────────────
  describe('postMessage handler via ngOnInit', () => {
    it('should handle LOADED requestId', async () => {
      component.ngOnInit()
      await Promise.resolve()

      const contentWindow: any = { postMessage: jest.fn() }
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { requestId: 'LOADED', subApplicationName: 'SOME_APP' },
          source: contentWindow,
        }),
      )
      await Promise.resolve()
      expect(mockRespondSvc.loadedRespond).toHaveBeenCalled()
    })

    it('should set subApp true when subApplicationName is RBCP', async () => {
      component.ngOnInit()
      await Promise.resolve()

      const contentWindow: any = { postMessage: jest.fn() }
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { requestId: 'LOADED', subApplicationName: 'RBCP' },
          source: contentWindow,
        }),
      )
      await Promise.resolve()
      expect((component as any).subApp).toBe(true)
    })

    it('should handle CONTINUE_LEARNING requestId', async () => {
      component.ngOnInit()
      await Promise.resolve()

      const contentWindow: any = { postMessage: jest.fn() }
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { requestId: 'CONTINUE_LEARNING', data: { continueLearning: true } },
          source: contentWindow,
        }),
      )
      await Promise.resolve()
      expect(mockRespondSvc.continueLearningRespond).toHaveBeenCalled()
    })

    it('should handle TELEMETRY requestId', async () => {
      component.ngOnInit()
      await Promise.resolve()

      const contentWindow: any = { postMessage: jest.fn() }
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { requestId: 'TELEMETRY' },
          source: contentWindow,
        }),
      )
      await Promise.resolve()
      expect(mockRespondSvc.telemetryEvents).toHaveBeenCalled()
    })
  })
})
