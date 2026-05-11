// ── Mock problematic imports before loading the module ────────────────────
jest.mock('../../viewer-preview-popup/viewer-preview-popup.component', () => ({
  ViewerPreviewPopupComponent: class { },
}))

jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EMimeTypes: { PDF: 'application/pdf' },
    EPrimaryCategory: { PRACTICE_RESOURCE: 'Practice Resource' },
  },
}))

jest.mock('@sunbird-cb/toc', () => ({
  ViewerUtilService: jest.fn(),
  AccessControlService: jest.fn(),
  WidgetContentService: jest.fn(),
}))

jest.mock('@sunbird-cb/utils', () => ({
  EventService: jest.fn(),
  LoggerService: jest.fn(),
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'LOADED', Unloaded: 'UNLOADED' },
    WsEventType: { Telemetry: 'TELEMETRY' },
    WsEventLogLevel: { Info: 'INFO' },
    WsTimeSpentType: { Player: 'PLAYER' },
    WsTimeSpentMode: { Play: 'PLAY' },
  },
}))

jest.mock('../../viewer-util.service', () => ({
  ViewerUtilService: jest.fn(),
}))

import { of, Subject } from 'rxjs'
import { PracticeTestComponent } from './practice-test.component'
import { WsEvents } from '@sunbird-cb/utils'

describe('PracticeTestComponent', () => {
  let component: PracticeTestComponent
  let mockActivatedRoute: any
  let mockAccessControlService: any
  let mockViewerUtilService: any
  let mockEventService: any
  let mockContentSvc: any
  let mockLoggerService: any
  let mockMatDialog: any
  let mockRouter: any

  const mockTestData: any = {
    identifier: 'test-id',
    maxQuestions: 10,
    allowSkip: 'Yes',
    requiresSubmit: 'Yes',
    expectedDuration: 300,
    artifactUrl: 'test-url',
    mimeType: 'application/pdf',
  }

  const routerEvents = new Subject<any>()

  function buildComponent(): PracticeTestComponent {
    return new PracticeTestComponent(
      mockMatDialog,
      mockActivatedRoute,
      mockAccessControlService,
      mockViewerUtilService,
      mockEventService,
      mockContentSvc,
      mockLoggerService,
      mockRouter,
    )
  }

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        paramMap: { get: jest.fn().mockReturnValue('test-resource') },
        queryParamMap: { get: jest.fn().mockImplementation((key: string) => key === 'batchId' ? 'test-batch' : null) },
        queryParams: { batchId: 'test-batch' },
        params: {},
        data: {},
      },
      data: of({ content: { data: mockTestData } }),
    }

    mockAccessControlService = {
      authoringConfig: { newDesign: false },
    }

    mockViewerUtilService = {
      getContent: jest.fn().mockReturnValue(of(mockTestData)),
    }

    mockEventService = {
      dispatchEvent: jest.fn(),
    }

    mockContentSvc = {
      currentMetaData: null,
    }

    mockLoggerService = {
      error: jest.fn(),
    }

    mockMatDialog = {
      open: jest.fn(),
    }

    mockRouter = {
      events: routerEvents,
      navigate: jest.fn(),
    }

    Object.defineProperty(window, 'location', {
      value: { href: 'http://test.com' },
      writable: true,
      configurable: true,
    })

    jest.useFakeTimers()
    component = buildComponent()
    component.forPreview = false
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  // ─── Creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have isPreviewMode false by default', () => {
    expect(component.isPreviewMode).toBeFalsy()
  })

  it('should have isFetchingDataComplete false by default', () => {
    expect(component.isFetchingDataComplete).toBeFalsy()
  })

  it('should have testData null by default', () => {
    expect(component.testData).toBeNull()
  })

  it('should initialize quizJson with correct defaults', () => {
    expect(component.quizJson).toEqual({
      timeLimit: 300,
      questions: [],
      isAssessment: false,
      allowSkip: 'No',
      maxQuestions: 0,
      requiresSubmit: 'Yes',
      showTimer: 'Yes',
    })
  })

  // ─── batchId ──────────────────────────────────────────────────────────────

  it('should initialize batchId from queryParamMap', () => {
    expect(component.batchId).toBe('test-batch')
  })

  // ─── ngOnInit — normal mode ───────────────────────────────────────────────

  describe('ngOnInit — normal mode', () => {
    it('should set testData from route data', () => {
      component.ngOnInit()
      expect(component.testData).toEqual(mockTestData)
    })

    it('should call init after setting testData', () => {
      const spy = jest.spyOn(component, 'init')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set isFetchingDataComplete to true after timeout', () => {
      component.ngOnInit()
      jest.runAllTimers()
      expect(component.isFetchingDataComplete).toBe(true)
    })
  })

  // ─── ngOnInit — preview mode ──────────────────────────────────────────────

  describe('ngOnInit — preview mode', () => {
    it('should set isPreviewMode to true when preview param is set', () => {
      mockActivatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue('true')
      component = buildComponent()
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(true)
    })

    it('should call viewerSvc.getContent in preview mode', () => {
      mockActivatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue('true')
      component = buildComponent()
      component.ngOnInit()
      expect(mockViewerUtilService.getContent).toHaveBeenCalledWith('test-resource')
    })

    it('should NOT use preview mode when newDesign is true', () => {
      mockActivatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue('true')
      mockAccessControlService.authoringConfig.newDesign = true
      component = buildComponent()
      component.ngOnInit()
      expect(component.isPreviewMode).toBe(false)
    })
  })

  // ─── preAssessment mode ───────────────────────────────────────────────────

  describe('ngOnInit — preAssessment mode', () => {
    it('should subscribe via dataSubscription for preAssessment URLs', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://test.com/preAssessment/something' },
        writable: true,
        configurable: true,
      })
      component = buildComponent()
      component.ngOnInit()
      expect(component.testData).toEqual(mockTestData)
    })
  })

  // ─── init ─────────────────────────────────────────────────────────────────

  describe('init', () => {
    it('should set quizJson values from testData', () => {
      component.testData = mockTestData
      component.init()
      expect(component.quizJson.maxQuestions).toBe(10)
      expect(component.quizJson.allowSkip).toBe('Yes')
      expect(component.quizJson.requiresSubmit).toBe('Yes')
      expect(component.quizJson.timeLimit).toBe(300)
    })

    it('should set alreadyRaised to true', () => {
      component.testData = mockTestData
      component.init()
      expect(component.alreadyRaised).toBe(true)
    })

    it('should set isFetchingDataComplete to true after setTimeout', () => {
      component.testData = mockTestData
      component.init()
      jest.runAllTimers()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should not throw when testData is null', () => {
      component.testData = null
      expect(() => component.init()).not.toThrow()
      jest.runAllTimers()
    })

    it('should not call raiseEvent when testData is null', () => {
      component.testData = null
      const spy = jest.spyOn(component, 'raiseEvent')
      component.init()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── openPreviewPopup ─────────────────────────────────────────────────────

  describe('openPreviewPopup', () => {
    it('should call dialog.open', () => {
      component.openPreviewPopup()
      expect(mockMatDialog.open).toHaveBeenCalled()
    })

    it('should pass quizJson and testData to dialog', () => {
      component.testData = mockTestData
      component.openPreviewPopup()
      const arg = mockMatDialog.open.mock.calls[0][1]
      expect(arg.data.testData).toBe(mockTestData)
      expect(arg.data.quizJson).toBe(component.quizJson)
    })
  })

  // ─── isErrorOccured ───────────────────────────────────────────────────────

  describe('isErrorOccured', () => {
    it('should call log.error with the event', () => {
      component.isErrorOccured({ message: 'error' })
      expect(mockLoggerService.error).toHaveBeenCalledWith({ message: 'error' })
    })
  })

  // ─── raiseEvent ───────────────────────────────────────────────────────────

  describe('raiseEvent', () => {
    it('should call eventSvc.dispatchEvent when not forPreview', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockTestData)
      expect(mockEventService.dispatchEvent).toHaveBeenCalled()
    })

    it('should not call eventSvc.dispatchEvent when forPreview', () => {
      component.forPreview = true
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockTestData)
      expect(mockEventService.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should dispatch event with correct state', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockTestData)
      const event = mockEventService.dispatchEvent.mock.calls[0][0]
      expect(event.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded)
    })

    it('should include identifier in the event', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockTestData)
      const event = mockEventService.dispatchEvent.mock.calls[0][0]
      expect(event.data.identifier).toBe('test-id')
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call raiseEvent(Unloaded) when testData exists', () => {
      component.testData = mockTestData
      component.forPreview = false
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalledWith(
        WsEvents.EnumTelemetrySubType.Unloaded,
        expect.any(Object),
      )
    })

    it('should not call raiseEvent when testData is null', () => {
      component.testData = null
      const spy = jest.spyOn(component, 'raiseEvent')
      component.ngOnDestroy()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should unsubscribe dataSubscription', () => {
      const unsub = jest.fn()
        ; (component as any).dataSubscription = { unsubscribe: unsub }
      component.ngOnDestroy()
      expect(unsub).toHaveBeenCalled()
    })

    it('should unsubscribe viewerDataSubscription', () => {
      const unsub = jest.fn()
        ; (component as any).viewerDataSubscription = { unsubscribe: unsub }
      component.ngOnDestroy()
      expect(unsub).toHaveBeenCalled()
    })

    it('should unsubscribe telemetryIntervalSubscription', () => {
      const unsub = jest.fn()
        ; (component as any).telemetryIntervalSubscription = { unsubscribe: unsub }
      component.ngOnDestroy()
      expect(unsub).toHaveBeenCalled()
    })

    it('should not throw when subscriptions are null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})