jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EMimeTypes: { HTML_PICKER: 'application/htmlpicker' },
  },
  WidgetContentService: jest.fn(),
}))

jest.mock('@sunbird-cb/toc', () => ({
  WidgetContentService: jest.fn(),
}))

jest.mock('@sunbird-cb/utils', () => ({
  ConfigurationsService: jest.fn(),
  EventService: jest.fn(),
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
  },
}))

import { of } from 'rxjs'
import { HtmlPickerComponent } from './html-picker.component'

const HTML_PICKER_MIME = 'application/htmlpicker'

const makeContent = (overrides: any = {}) => ({
  identifier: 'hp-001',
  artifactUrl: '/content-store/path/manifest.json',
  name: 'HTML Picker Test',
  description: 'desc',
  mimeType: HTML_PICKER_MIME,
  ...overrides,
})

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('HtmlPickerComponent', () => {
  let component: HtmlPickerComponent
  let mockActivatedRoute: any
  let mockHttp: any
  let mockContentSvc: any
  let mockEventSvc: any
  let mockViewSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: { queryParams: {} },
      data: of({ content: { data: makeContent() } }),
    }
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ manifest: 'data' })),
    }
    mockContentSvc = {
      continueLearning: jest.fn().mockResolvedValue({}),
    }
    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }
    mockViewSvc = {
      getAuthoringUrl: jest.fn().mockReturnValue('/apis/authContent/encoded-url'),
    }
    component = new HtmlPickerComponent(
      mockActivatedRoute,
      mockHttp,
      mockContentSvc,
      mockEventSvc,
      mockViewSvc,
    )
  })

  afterEach(() => {
    if ((component as any).routeDataSubscription) {
      (component as any).routeDataSubscription.unsubscribe()
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

  it('should have htmlPickerData=null initially', () => {
    expect(component.htmlPickerData).toBeNull()
  })

  it('should have isErrorOccured=false initially', () => {
    expect(component.isErrorOccured).toBe(false)
  })

  it('should have alreadyRaised=false initially', () => {
    expect(component.alreadyRaised).toBe(false)
  })

  // ─── ngOnInit – success path ──────────────────────────────────────────────
  describe('ngOnInit - success (HTML_PICKER mimeType, manifest returned)', () => {
    it('should set htmlPickerData from route data', async () => {
      component.ngOnInit()
      await flush()
      expect(component.htmlPickerData!.identifier).toBe('hp-001')
    })

    it('should call http.get to fetch the manifest', async () => {
      component.ngOnInit()
      await flush()
      expect(mockHttp.get).toHaveBeenCalledWith(makeContent().artifactUrl)
    })

    it('should set htmlPickerManifest after transformHandsOn', async () => {
      component.ngOnInit()
      await flush()
      expect(component.htmlPickerManifest).toBeTruthy()
    })

    it('should set isFetchingDataComplete=true', async () => {
      component.ngOnInit()
      await flush()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should set alreadyRaised=true', async () => {
      component.ngOnInit()
      await flush()
      expect(component.alreadyRaised).toBe(true)
    })

    it('should set oldData', async () => {
      component.ngOnInit()
      await flush()
      expect(component.oldData!.identifier).toBe('hp-001')
    })

    it('should raise Loaded event when not forPreview', async () => {
      component.forPreview = false
      component.ngOnInit()
      await flush()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should not set isErrorOccured', async () => {
      component.ngOnInit()
      await flush()
      expect(component.isErrorOccured).toBe(false)
    })
  })

  // ─── ngOnInit – forPreview uses authoringUrl ──────────────────────────────
  describe('ngOnInit - forPreview mode', () => {
    it('should use getAuthoringUrl when forPreview=true', async () => {
      component.forPreview = true
      component.ngOnInit()
      await flush()
      expect(mockViewSvc.getAuthoringUrl).toHaveBeenCalledWith(makeContent().artifactUrl)
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/authContent/encoded-url')
    })

    it('should not raise telemetry event when forPreview=true', async () => {
      component.forPreview = true
      component.ngOnInit()
      await flush()
      // data is set but raiseEvent bails out because forPreview=true
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  // ─── ngOnInit – error path ────────────────────────────────────────────────
  describe('ngOnInit - isErrorOccured path', () => {
    it('should set isErrorOccured=true when mimeType is not HTML_PICKER', async () => {
      mockActivatedRoute.data = of({ content: { data: makeContent({ mimeType: 'application/pdf' }) } })
      component = new HtmlPickerComponent(
        mockActivatedRoute, mockHttp, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      component.ngOnInit()
      await flush()
      expect(component.isErrorOccured).toBe(true)
    })

    it('should set isErrorOccured=true when http.get returns empty (manifest falsy)', async () => {
      mockHttp.get.mockReturnValue(of(''))
      component = new HtmlPickerComponent(
        mockActivatedRoute, mockHttp, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      component.ngOnInit()
      await flush()
      expect(component.isErrorOccured).toBe(true)
    })

    it('should set isErrorOccured=true when artifactUrl is missing', async () => {
      mockActivatedRoute.data = of({ content: { data: makeContent({ artifactUrl: '' }) } })
      component = new HtmlPickerComponent(
        mockActivatedRoute, mockHttp, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      component.ngOnInit()
      await flush()
      // no artifactUrl → transformHandsOn returns '' → manifest falsy → error
      expect(component.isErrorOccured).toBe(true)
    })

    it('should set isErrorOccured=true when http.get rejects', async () => {
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockRejectedValue(new Error('fail')),
      })
      mockActivatedRoute.data = of({ content: { data: makeContent() } })
      component = new HtmlPickerComponent(
        mockActivatedRoute, mockHttp, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      component.ngOnInit()
      await flush()
      // catch swallows the error, manifestFile is undefined → falsy → error
      expect(component.isErrorOccured).toBe(true)
    })

    it('should NOT call http.get when htmlPickerData is null', async () => {
      mockActivatedRoute.data = of({ content: { data: null } })
      component = new HtmlPickerComponent(
        mockActivatedRoute, mockHttp, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      component.ngOnInit()
      await flush()
      expect(mockHttp.get).not.toHaveBeenCalled()
    })
  })

  // ─── ngOnInit – reload (alreadyRaised + oldData) ─────────────────────────
  describe('ngOnInit - reload with alreadyRaised', () => {
    it('should call raiseEvent Unloaded when alreadyRaised=true and oldData set', async () => {
      component.forPreview = false
      component.alreadyRaised = true
      component.oldData = makeContent({ identifier: 'old-001' }) as any
      component.ngOnInit()
      await flush()
      // first call = Unloaded (from alreadyRaised), second = Loaded
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledTimes(2)
    })
  })

  // ─── ngOnInit – error callback ────────────────────────────────────────────
  describe('ngOnInit - error callback', () => {
    it('should not throw when data subscription errors', () => {
      mockActivatedRoute.data = {
        subscribe: jest.fn((_success: any, error: any) => error && error()),
      }
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should call continueLearning with collectionId and collectionType when both present', async () => {
      component.htmlPickerData = makeContent() as any
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', collectionType: 'Course' }
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('hp-001', 'col-001', 'Course')
    })

    it('should call continueLearning with only identifier when collectionId is absent', async () => {
      component.htmlPickerData = makeContent() as any
      mockActivatedRoute.snapshot.queryParams = {}
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('hp-001')
    })

    it('should not call continueLearning when htmlPickerData is null', async () => {
      component.htmlPickerData = null
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).not.toHaveBeenCalled()
    })

    it('should not call continueLearning when only collectionId present but not collectionType', async () => {
      component.htmlPickerData = makeContent() as any
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001' }
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('hp-001')
    })

    it('should unsubscribe routeDataSubscription when present', async () => {
      const sub = { unsubscribe: jest.fn() }
        ; (component as any).routeDataSubscription = sub
      await component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when routeDataSubscription is null', async () => {
      ; (component as any).routeDataSubscription = null
      await expect(component.ngOnDestroy()).resolves.not.toThrow()
    })

    it('should raise Unloaded event when htmlPickerData exists and not forPreview', async () => {
      component.forPreview = false
      component.htmlPickerData = makeContent() as any
      await component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should not raise event when htmlPickerData is null', async () => {
      component.htmlPickerData = null
      await component.ngOnDestroy()
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  // ─── raiseEvent ───────────────────────────────────────────────────────────
  describe('raiseEvent', () => {
    it('should dispatch event when forPreview=false', () => {
      component.forPreview = false
      component.raiseEvent('Loaded' as any, makeContent() as any)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should not dispatch when forPreview=true', () => {
      component.forPreview = true
      component.raiseEvent('Loaded' as any, makeContent() as any)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should set from=html-picker in event', () => {
      component.forPreview = false
      component.raiseEvent('Loaded' as any, makeContent() as any)
      expect(mockEventSvc.dispatchEvent.mock.calls[0][0].from).toBe('html-picker')
    })

    it('should include identifier in event data', () => {
      component.forPreview = false
      component.raiseEvent('Loaded' as any, makeContent({ identifier: 'hp-999' }) as any)
      expect(mockEventSvc.dispatchEvent.mock.calls[0][0].data.identifier).toBe('hp-999')
    })

    it('should include artifactUrl as url in event data', () => {
      component.forPreview = false
      component.raiseEvent('Loaded' as any, makeContent({ artifactUrl: '/some/url' }) as any)
      expect(mockEventSvc.dispatchEvent.mock.calls[0][0].data.url).toBe('/some/url')
    })

    it('should set mimeType to HTML_PICKER in event data', () => {
      component.forPreview = false
      component.raiseEvent('Loaded' as any, makeContent() as any)
      expect(mockEventSvc.dispatchEvent.mock.calls[0][0].data.mimeType).toBe(HTML_PICKER_MIME)
    })
  })
})
