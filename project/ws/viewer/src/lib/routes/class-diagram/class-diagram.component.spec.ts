jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EMimeTypes: { CLASS_DIAGRAM: 'application/json' },
  },
  WidgetContentService: jest.fn(),
}))
jest.mock('@sunbird-cb/toc', () => ({
  WidgetContentService: jest.fn(),
}))
jest.mock('@sunbird-cb/utils', () => ({
  ValueService: jest.fn(),
  EventService: jest.fn(),
  WsEvents: {
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
    EnumTelemetrySubType: { Unloaded: 'Unloaded', Loaded: 'Loaded' },
  },
}))

import { of } from 'rxjs'
import { ClassDiagramComponent } from './class-diagram.component'

describe('ClassDiagramComponent', () => {
  let component: ClassDiagramComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockHttp: any
  let mockValueSvc: any
  let mockEventSvc: any
  let mockViewSvc: any

  const mockClassData = {
    identifier: 'class-001',
    name: 'Test Class Diagram',
    artifactUrl: 'https://example.com/class.json',
    mimeType: 'application/json',
  }

  beforeEach(() => {
    mockActivatedRoute = {
      data: of({ content: { data: mockClassData } }),
      snapshot: {
        queryParams: {},
      },
    }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockResolvedValue(undefined),
      continueLearning: jest.fn().mockResolvedValue(undefined),
    }
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ manifest: [] })),
    }
    mockValueSvc = {
      isLtMedium$: of(false),
    }
    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }
    mockViewSvc = {
      getAuthoringUrl: jest.fn().mockImplementation((url: string) => `authoring/${url}`),
    }

    component = new ClassDiagramComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockHttp,
      mockValueSvc,
      mockEventSvc,
      mockViewSvc,
    )

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/viewer/class/class-001' },
      writable: true,
    })
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with defaults', () => {
    expect(component.isFetchingDataComplete).toBe(false)
    expect(component.isErrorOccured).toBe(false)
    expect(component.classDiagramData).toBeNull()
    expect(component.alreadyRaised).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should subscribe to screen size changes', () => {
      const spy = jest.spyOn(mockValueSvc.isLtMedium$, 'subscribe')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set isLtMedium from subscription', () => {
      mockValueSvc.isLtMedium$ = of(true)
      component = new ClassDiagramComponent(mockActivatedRoute, mockContentSvc, mockHttp, mockValueSvc, mockEventSvc, mockViewSvc)
      component.ngOnInit()
      expect(component.isLtMedium).toBe(true)
    })

    it('should load class diagram data from route', async () => {
      mockHttp.get.mockReturnValue(of({ manifest: [] }))
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(component.classDiagramData).toEqual(mockClassData)
    })

    it('should set isErrorOccured when classDiagramManifest is null', async () => {
      mockHttp.get.mockReturnValue(of(null))
      const classDataNoManifest = { ...mockClassData, mimeType: 'application/json' }
      mockActivatedRoute.data = of({ content: { data: classDataNoManifest } })
      component = new ClassDiagramComponent(mockActivatedRoute, mockContentSvc, mockHttp, mockValueSvc, mockEventSvc, mockViewSvc)
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(component.isErrorOccured).toBe(true)
    })

    it('should handle route error gracefully', () => {
      mockActivatedRoute.data = { subscribe: (_cb: any, err: any) => err('error') }
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions', async () => {
      component.ngOnInit()
      const routeUnsub = jest.fn()
      const sizeUnsub = jest.fn()
        ; (component as any).routeDataSubscription = { unsubscribe: routeUnsub }
        ; (component as any).isSmallSubscription = { unsubscribe: sizeUnsub }
      component.classDiagramData = mockClassData as any
      await component.ngOnDestroy()
      expect(routeUnsub).toHaveBeenCalled()
      expect(sizeUnsub).toHaveBeenCalled()
    })

    it('should call continueLearning when collectionId and collectionType are present', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001', collectionType: 'Course' }
      component.classDiagramData = mockClassData as any
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('class-001', 'col-001', 'Course')
    })

    it('should call continueLearning without collectionId when not present', async () => {
      component.classDiagramData = mockClassData as any
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('class-001')
    })
  })

  describe('raiseEvent', () => {
    it('should dispatch a telemetry event', () => {
      component.raiseEvent('Loaded' as any, mockClassData as any)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'Telemetry',
        data: expect.objectContaining({
          identifier: 'class-001',
        }),
      }))
    })

    it('should handle null data gracefully', () => {
      component.raiseEvent('Unloaded' as any, null as any)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ identifier: null }),
      }))
    })
  })
})
