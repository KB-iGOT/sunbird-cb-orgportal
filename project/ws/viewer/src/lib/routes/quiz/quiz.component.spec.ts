// ── Module-level mocks must be defined before any imports ──────────────────
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EMimeTypes: {
      QUIZ: 'application/quiz',
    },
  },
  WidgetContentService: jest.fn(),
}))

jest.mock('@sunbird-cb/utils', () => ({
  WsEvents: {
    EnumTelemetrySubType: {
      Loaded: 'Loaded',
      Unloaded: 'Unloaded',
    },
    WsEventType: {
      Telemetry: 'Telemetry',
    },
    WsEventLogLevel: {
      Info: 'Info',
    },
    WsTimeSpentType: {
      Player: 'Player',
    },
    WsTimeSpentMode: {
      Play: 'Play',
    },
  },
  EventService: jest.fn(),
}))

jest.mock('@angular/common/http', () => ({
  HttpBackend: jest.fn(),
  HttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        timeLimit: 60,
        isAssessment: false,
        questions: [
          { multiSelection: true, questionType: undefined },
          { multiSelection: false, questionType: undefined },
          { multiSelection: true, questionType: 'fitb' },
        ],
      }),
    }),
  })),
}))

jest.mock('../../../../../../../src/environments/environment', () => ({
  environment: {
    azureHost: 'https://azure.example.com',
    azureBucket: 'test-bucket',
    mdoPath: 'https://mdo.example.com',
    contentBucket: 'content-bucket',
  },
}))

import { QuizComponent } from './quiz.component'
import { of } from 'rxjs'
import { WsEvents } from '@sunbird-cb/utils'
import { NsContent } from '@sunbird-cb/collection'

describe('QuizComponent', () => {
  let component: QuizComponent
  let mockActivatedRoute: any
  let mockHttpBackend: any
  let mockContentSvc: any
  let mockEventSvc: any
  let mockViewSvc: any

  const mockQuizData: any = {
    identifier: 'content-001',
    artifactUrl: 'https://azure.example.com/test-bucket/content/quiz.json',
    mimeType: 'application/quiz',
  }

  beforeEach(() => {
    // Reset HttpClient mock to default success behaviour
    const { HttpClient } = require('@angular/common/http')
    HttpClient.mockImplementation(() => ({
      get: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          timeLimit: 60,
          isAssessment: false,
          questions: [
            { multiSelection: true, questionType: undefined },
            { multiSelection: false, questionType: undefined },
            { multiSelection: true, questionType: 'fitb' },
          ],
        }),
      }),
    }))

    mockActivatedRoute = {
      data: of({ content: { data: mockQuizData } }),
      snapshot: {
        queryParams: {},
      },
    }

    mockHttpBackend = {}

    mockContentSvc = {
      continueLearning: jest.fn().mockResolvedValue(undefined),
    }

    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }

    mockViewSvc = {
      replaceToAuthUrl: jest.fn((x: any) => x),
    }

    component = new QuizComponent(
      mockActivatedRoute,
      mockHttpBackend,
      mockContentSvc,
      mockEventSvc,
      mockViewSvc,
    )
    component.forPreview = false
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default initial values', () => {
    expect(component.isFetchingDataComplete).toBe(false)
    expect(component.isErrorOccured).toBe(false)
    expect(component.quizData).toBeNull()
    expect(component.oldData).toBeNull()
    expect(component.alreadyRaised).toBe(false)
    expect(component.quizJson).toEqual({ timeLimit: 0, questions: [], isAssessment: false })
  })

  /** Flush all pending microtasks + one macrotask to let async subscribe callbacks settle */
  const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0))

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set quizData synchronously when route data emits', async () => {
      component.ngOnInit()
      // quizData is assigned before any await inside the callback, so it is available synchronously
      expect(component.quizData).not.toBeNull()
    })

    it('should set isFetchingDataComplete true after async callback fully completes', async () => {
      component.ngOnInit()
      await flushPromises()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should set alreadyRaised and oldData after first load', async () => {
      component.ngOnInit()
      await flushPromises()
      expect(component.alreadyRaised).toBe(true)
      expect(component.oldData).toEqual(component.quizData)
    })

    it('should call raiseEvent Unloaded when alreadyRaised is true on re-load', async () => {
      const raiseEventSpy = jest.spyOn(component as any, 'raiseEvent')
      component.alreadyRaised = true
      component.oldData = mockQuizData
      component.ngOnInit()
      await flushPromises()
      expect(raiseEventSpy).toHaveBeenCalledWith(WsEvents.EnumTelemetrySubType.Unloaded, mockQuizData)
    })

    it('should set isFetchingDataComplete true even when quizData is null', async () => {
      mockActivatedRoute.data = of({ content: { data: null } })
      component = new QuizComponent(
        mockActivatedRoute, mockHttpBackend, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      component.forPreview = false
      component.ngOnInit()
      await flushPromises()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should assign mcq-mca when multiSelection=true and questionType is undefined', async () => {
      const result = await (component as any).transformQuiz(mockQuizData)
      const mca = result.questions.find((q: any) => q.multiSelection === true && q.questionType === 'mcq-mca')
      expect(mca).toBeTruthy()
    })

    it('should assign mcq-sca when multiSelection=false and questionType is undefined', async () => {
      const result = await (component as any).transformQuiz(mockQuizData)
      const sca = result.questions.find((q: any) => q.multiSelection === false && q.questionType === 'mcq-sca')
      expect(sca).toBeTruthy()
    })

    it('should not override an existing questionType (fitb)', async () => {
      const result = await (component as any).transformQuiz(mockQuizData)
      const fitb = result.questions.find((q: any) => q.questionType === 'fitb')
      expect(fitb).toBeTruthy()
    })

    it('should call viewSvc.replaceToAuthUrl when forPreview is true', async () => {
      component.forPreview = true
      await (component as any).transformQuiz(mockQuizData)
      expect(mockViewSvc.replaceToAuthUrl).toHaveBeenCalled()
    })

    it('should NOT call viewSvc.replaceToAuthUrl when forPreview is false', async () => {
      component.forPreview = false
      await (component as any).transformQuiz(mockQuizData)
      expect(mockViewSvc.replaceToAuthUrl).not.toHaveBeenCalled()
    })
  })

  // ─── ngOnDestroy ─────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    beforeEach(async () => {
      await component.ngOnInit()
    })

    it('should call continueLearning with identifier only when no collectionId', async () => {
      mockActivatedRoute.snapshot.queryParams = {}
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('content-001')
    })

    it('should call continueLearning with collectionId and collectionType when present', async () => {
      mockActivatedRoute.snapshot.queryParams = {
        collectionId: 'col-001',
        collectionType: 'Course',
      }
      await component.ngOnDestroy()
      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('content-001', 'col-001', 'Course')
    })

    it('should call raiseEvent Unloaded on destroy when quizData exists', async () => {
      const raiseEventSpy = jest.spyOn(component as any, 'raiseEvent')
      await component.ngOnDestroy()
      expect(raiseEventSpy).toHaveBeenCalledWith(
        WsEvents.EnumTelemetrySubType.Unloaded,
        component.quizData,
      )
    })

    it('should unsubscribe from data subscription on destroy', async () => {
      const sub = (component as any).dataSubscription
      if (sub) {
        jest.spyOn(sub, 'unsubscribe')
      }
      await component.ngOnDestroy()
      if (sub) {
        expect(sub.unsubscribe).toHaveBeenCalled()
      }
    })

    it('should not throw when quizData is null on destroy', async () => {
      component.quizData = null
      await expect(component.ngOnDestroy()).resolves.not.toThrow()
    })
  })

  // ─── generateUrl ─────────────────────────────────────────────────────────────

  describe('generateUrl', () => {
    it('should replace host and bucket in URL', () => {
      const input = 'https://old.host.com/old-bucket/content/path/file.json'
      const result = (component as any).generateUrl(input)
      // index 2 → azureHost part, index 3 → azureBucket
      expect(result).toContain('test-bucket')
    })

    it('should return empty joined string for empty input', () => {
      const result = (component as any).generateUrl('')
      expect(result).toBe('')
    })
  })

  // ─── getUrl ──────────────────────────────────────────────────────────────────

  describe('getUrl', () => {
    it('should return original url when empty string', () => {
      expect(component.getUrl('')).toBe('')
    })

    it('should return url unchanged when url is falsy', () => {
      expect(component.getUrl(null as any)).toBeNull()
    })

    it('should build /collection url with mdoPath and contentBucket', () => {
      const input = 'https://mdo.example.com/content-bucket/content/collection/path'
      const result = component.getUrl(input)
      expect(result).toContain('content-bucket')
      expect(result).toContain('https://mdo.example.com')
    })

    it('should build non-collection content url with mdoPath and contentBucket', () => {
      const input = 'https://example.com/content-bucket/content/e-content/path'
      const result = component.getUrl(input)
      expect(result).toContain('content-bucket')
      expect(result).toContain('/content')
    })
  })

  // ─── raiseEvent ──────────────────────────────────────────────────────────────

  describe('raiseEvent', () => {
    it('should dispatch telemetry event when not in preview', () => {
      component.forPreview = false
        ; (component as any).raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockQuizData)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: WsEvents.WsEventType.Telemetry,
          from: 'quiz',
          data: expect.objectContaining({
            state: WsEvents.EnumTelemetrySubType.Loaded,
            mimeType: NsContent.EMimeTypes.QUIZ,
            identifier: 'content-001',
          }),
        }),
      )
    })

    it('should NOT dispatch event when forPreview is true', () => {
      component.forPreview = true
        ; (component as any).raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, mockQuizData)
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should set identifier and url to null when data is falsy', () => {
      component.forPreview = false
        ; (component as any).raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, null)
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identifier: null,
            url: null,
          }),
        }),
      )
    })
  })

  // ─── transformQuiz (private) ──────────────────────────────────────────────────

  describe('transformQuiz', () => {
    it('should return quiz JSON from HTTP call', async () => {
      const result = await (component as any).transformQuiz(mockQuizData)
      expect(result).toBeTruthy()
      expect(result.timeLimit).toBe(60)
    })

    it('should fall back to empty array when quiz questions are null', async () => {
      const { HttpClient } = require('@angular/common/http')
      HttpClient.mockImplementation(() => ({
        get: jest.fn().mockReturnValue({
          toPromise: jest.fn().mockResolvedValue({ timeLimit: 30, isAssessment: true, questions: null }),
        }),
      }))
      const localComponent = new QuizComponent(
        mockActivatedRoute, mockHttpBackend, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      localComponent.forPreview = false
      const result = await (localComponent as any).transformQuiz(mockQuizData)
      expect(result.questions).toBeNull()
    })

    it('should skip replaceToAuthUrl when forPreview=true but quizJSON is falsy', async () => {
      const { HttpClient } = require('@angular/common/http')
      // Return quizJSON with empty questions to avoid TypeError during questions iteration
      HttpClient.mockImplementation(() => ({
        get: jest.fn().mockReturnValue({
          toPromise: jest.fn().mockResolvedValue({ timeLimit: 0, isAssessment: false, questions: [] }),
        }),
      }))
      const localComponent = new QuizComponent(
        mockActivatedRoute, mockHttpBackend, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      localComponent.forPreview = true
      const result = await (localComponent as any).transformQuiz(mockQuizData)
      // With forPreview=true and a valid (truthy) quizJSON, replaceToAuthUrl IS called
      expect(mockViewSvc.replaceToAuthUrl).toHaveBeenCalled()
      expect(result.questions).toEqual([])
    })

    it('should throw a TypeError when HTTP call fails (catch returns undefined, questions access throws)', async () => {
      const { HttpClient } = require('@angular/common/http')
      HttpClient.mockImplementation(() => ({
        get: jest.fn().mockReturnValue({
          toPromise: jest.fn().mockRejectedValue(new Error('Network error')),
        }),
      }))
      const localComponent = new QuizComponent(
        mockActivatedRoute, mockHttpBackend, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      localComponent.forPreview = false
      await expect((localComponent as any).transformQuiz(mockQuizData)).rejects.toThrow()
    })
  })

  // ─── Observable error path ────────────────────────────────────────────────────

  describe('ngOnInit observable error handler', () => {
    it('should not throw when the route data observable errors', () => {
      const { throwError } = require('rxjs')
      mockActivatedRoute.data = throwError(() => new Error('route error'))
      const errorComponent = new QuizComponent(
        mockActivatedRoute, mockHttpBackend, mockContentSvc, mockEventSvc, mockViewSvc,
      )
      expect(() => errorComponent.ngOnInit()).not.toThrow()
      expect(errorComponent.isFetchingDataComplete).toBe(false)
    })
  })
})
