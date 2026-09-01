// ── Mock external/heavy modules before imports ────────────────────────────
jest.mock('jsplumb', () => ({}), { virtual: true })

jest.mock('src/environments/environment', () => ({
  environment: { assessmentBuffer: 0 },
}), { virtual: true })

jest.mock('@sunbird-cb/toc', () => ({
  ViewerUtilService: jest.fn(),
  WidgetContentService: jest.fn(),
  AppTocService: jest.fn(),
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  EventService: jest.fn(),
  NsContent: {
    EPrimaryCategory: {
      PRACTICE_RESOURCE: 'Practice Resource',
      FINAL_ASSESSMENT: 'Final Assessment',
    },
    ECourseCategory: {},
  },
  ValueService: jest.fn(),
  WsEvents: {
    EnumTelemetrySubType: {
      Loaded: 'LOADED',
      Unloaded: 'UNLOADED',
      HeartBeat: 'HEARTBEAT',
    },
    EnumTelemetrymodules: {
      LEARN: 'learn',
    },
    WsEventType: { Telemetry: 'TELEMETRY' },
    WsEventLogLevel: { Info: 'INFO' },
    WsTimeSpentType: { Player: 'PLAYER' },
    WsTimeSpentMode: { Play: 'PLAY' },
  },
}))

jest.mock('@sunbird-cb/collection', () => ({
  VIEWER_ROUTE_FROM_MIME: {},
}))

jest.mock('../../viewer-data.service', () => ({
  ViewerDataService: jest.fn(),
}))

jest.mock('./../../viewer-header-side-bar-toggle.service', () => ({
  ViewerHeaderSideBarToggleService: jest.fn(),
}))

import { of, BehaviorSubject, Subject } from 'rxjs'
import { PracticeComponent } from './practice.component'
import { UntypedFormBuilder } from '@angular/forms'

describe('PracticeComponent', () => {
  let component: PracticeComponent
  let mockEvents: any
  let mockDialog: any
  let mockQuizSvc: any
  let mockActivatedRoute: any
  let mockViewerSvc: any
  let mockRouter: any
  let mockValueSvc: any
  let mockConfigSvc: any
  let mockFormBuilder: UntypedFormBuilder
  let mockSnackbar: any
  let mockSanitized: any
  let mockViewerDataSvc: any
  let mockViewerHeaderSideBarToggleService: any
  let mockRenderer: any
  let mockWidgetContentService: any
  let mockTocSvc: any
  let mockCdr: any

  function buildComponent(): PracticeComponent {
    return new PracticeComponent(
      mockEvents,
      mockDialog,
      mockQuizSvc,
      mockActivatedRoute,
      mockViewerSvc,
      mockRouter,
      mockValueSvc,
      mockConfigSvc,
      mockFormBuilder,
      mockSnackbar,
      mockSanitized,
      mockViewerDataSvc,
      mockViewerHeaderSideBarToggleService,
      mockRenderer,
      mockWidgetContentService,
      mockTocSvc,
      mockCdr,
    )
  }

  beforeEach(() => {
    mockEvents = {
      dispatchEvent: jest.fn(),
      raiseInteractTelemetry: jest.fn(),
    }
    mockDialog = { open: jest.fn() }

    mockQuizSvc = {
      secAttempted: new BehaviorSubject<any[]>([]),
      questionAnswerHash: new BehaviorSubject<any>({}),
      paperSections: new BehaviorSubject<any>(null),
      qAnsHash: jest.fn(),
      displayCorrectAnswer: new BehaviorSubject<boolean>(false),
      canAttend: jest.fn().mockReturnValue(of({})),
      canAttendV5: jest.fn().mockReturnValue(of({})),
      getSectionV4: jest.fn().mockReturnValue(of({})),
      getSection: jest.fn().mockReturnValue(of({})),
      mtfSrc: new BehaviorSubject({}),
      setFullAttemptSection: jest.fn(),
      shCorrectAnswer: jest.fn(),
    }

    mockActivatedRoute = {
      snapshot: {
        data: { content: { data: { expectedDuration: 300 } } },
        queryParams: {},
        params: {},
      },
    }

    mockViewerSvc = {
      realTimeProgressUpdate: jest.fn(),
      getAuthoringUrl: jest.fn((url: string) => `authoring://${url}`),
    }

    mockRouter = {
      events: of(),
      navigate: jest.fn(),
      getCurrentNavigation: jest.fn().mockReturnValue(null),
    }

    mockValueSvc = { isXSmall$: of(false) }

    mockConfigSvc = { userProfile: { userId: 'user-001' } }

    mockFormBuilder = new UntypedFormBuilder()

    mockSnackbar = { open: jest.fn() }

    mockSanitized = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((v: any) => v),
    }

    mockViewerDataSvc = {
      resource: null,
      resourceId: 'res-001',
    }

    mockViewerHeaderSideBarToggleService = {
      visibilityStatus: new Subject<boolean>(),
    }

    mockRenderer = {
      listen: jest.fn().mockReturnValue(jest.fn()),
    }

    mockWidgetContentService = {
      currentMetaData: { primaryCategory: 'Course', children: [] },
    }

    mockTocSvc = {
      nextResource$: new BehaviorSubject(null),
    }

    mockCdr = { detectChanges: jest.fn() }

    component = buildComponent()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── Creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default viewState as initial', () => {
    expect(component.viewState).toBe('initial')
  })

  it('should have default isSubmitted as false', () => {
    expect(component.isSubmitted).toBe(false)
  })

  it('should have default isCompleted as false', () => {
    expect(component.isCompleted).toBe(false)
  })

  it('should have empty questionAnswerHash', () => {
    expect(component.questionAnswerHash).toEqual({})
  })

  it('should initialize markedQuestions as empty Set', () => {
    expect(component.markedQuestions.size).toBe(0)
  })

  it('should call renderer.listen in constructor', () => {
    expect(mockRenderer.listen).toHaveBeenCalledWith('window', 'click', expect.any(Function))
  })

  // ─── toggleToolTip ─────────────────────────────────────────────────────────

  describe('toggleToolTip', () => {
    it('should set showToolTip to true when it is false', () => {
      component.showToolTip = false
      component.toggleToolTip()
      expect(component.showToolTip).toBe(true)
    })

    it('should set showToolTip to false when it is true', () => {
      component.showToolTip = true
      component.toggleToolTip()
      expect(component.showToolTip).toBe(false)
    })
  })

  // ─── beforeUnloadHander ───────────────────────────────────────────────────

  describe('beforeUnloadHander', () => {
    it('should return undefined when viewState is initial', () => {
      component.viewState = 'initial'
      const event: any = {}
      const result = component.beforeUnloadHander(event)
      expect(result).toBeUndefined()
    })

    it('should return confirmation message when viewState is attempt and not submitted', () => {
      component.viewState = 'attempt'
      component.isSubmitted = false
      const event: any = {}
      const result = component.beforeUnloadHander(event)
      expect(result).toBeDefined()
      expect(event.returnValue).toBeDefined()
    })

    it('should not set returnValue when already submitted', () => {
      component.viewState = 'attempt'
      component.isSubmitted = true
      const event: any = {}
      component.beforeUnloadHander(event)
      expect(event.returnValue).toBeUndefined()
    })
  })

  // ─── getTimeLimit ──────────────────────────────────────────────────────────

  describe('getTimeLimit', () => {
    it('should return quizJson.timeLimit when not retaking', () => {
      component.quizJson.timeLimit = 600
      component.retake = false
      component.assessmentBuffer = 0
      expect(component.getTimeLimit).toBe(600)
    })

    it('should add assessmentBuffer to timeLimit', () => {
      component.quizJson.timeLimit = 300
      component.assessmentBuffer = 30
      expect(component.getTimeLimit).toBe(330)
    })

    it('should get timeLimit from route data when retake and timeLimit is 0', () => {
      component.quizJson.timeLimit = 0
      component.retake = true
      component.assessmentBuffer = 0
      // activatedRoute.snapshot.data.content.data.expectedDuration = 300
      expect(component.getTimeLimit).toBe(300)
    })
  })

  // ─── isOnlySection ────────────────────────────────────────────────────────

  describe('isOnlySection', () => {
    it('should return false when paperSections is null', () => {
      component.paperSections = null
      expect(component.isOnlySection).toBe(false)
    })

    it('should return true when only one section', () => {
      component.paperSections = [{ identifier: 's1' } as any]
      expect(component.isOnlySection).toBe(true)
    })

    it('should return false when more than one section', () => {
      component.paperSections = [{ identifier: 's1' } as any, { identifier: 's2' } as any]
      expect(component.isOnlySection).toBe(false)
    })
  })

  // ─── hasNextSet ────────────────────────────────────────────────────────────

  describe('hasNextSet', () => {
    it('should return false when totalQuestionsCount does not exceed limit', () => {
      component.totalQuestionsCount = 5
      component.noOfQuestionsPerSet = 20
      component.currentSetNumber = 0
      expect(component.hasNextSet).toBe(false)
    })

    it('should return true when more questions remain', () => {
      component.totalQuestionsCount = 25
      component.noOfQuestionsPerSet = 20
      component.currentSetNumber = 0
      expect(component.hasNextSet).toBe(true)
    })
  })

  // ─── findNested ────────────────────────────────────────────────────────────

  describe('findNested', () => {
    it('should return object when key matches value at top level', () => {
      const obj = { identifier: 'abc', name: 'Test' }
      const result = component.findNested(obj, 'identifier', 'abc')
      expect(result).toEqual(obj)
    })

    it('should find nested object', () => {
      const obj = {
        identifier: 'parent',
        children: [
          { identifier: 'child-1', data: 'some' },
        ],
      }
      const result = component.findNested(obj, 'identifier', 'child-1')
      expect(result).toBeDefined()
      expect(result.identifier).toBe('child-1')
    })

    it('should return undefined when key not found', () => {
      const obj = { identifier: 'abc', name: 'Test' }
      const result = component.findNested(obj, 'identifier', 'nonexistent')
      expect(result).toBeUndefined()
    })
  })

  // ─── getInstructionAssessmentPagination ───────────────────────────────────

  describe('getInstructionAssessmentPagination', () => {
    it('should create pages based on character count', () => {
      const html = 'a'.repeat(2700) // 3 pages of 1300 chars
      component.getInstructionAssessmentPagination(html)
      expect(Array.isArray(component.instructionAssessment)).toBe(true)
      expect((component.instructionAssessment as any[]).length).toBe(3)
    })

    it('should create single page for short content', () => {
      component.getInstructionAssessmentPagination('short content')
      expect((component.instructionAssessment as any[]).length).toBe(1)
    })

    it('should handle empty string', () => {
      component.getInstructionAssessmentPagination('')
      expect((component.instructionAssessment as any[]).length).toBe(0)
    })
  })

  // ─── handleCanAttendError ─────────────────────────────────────────────────

  describe('handleCanAttendError', () => {
    beforeEach(() => {
      jest.spyOn(component as any, 'openSnackbar').mockImplementation(jest.fn())
      jest.spyOn(component, 'init').mockImplementation(jest.fn())
      jest.spyOn(component as any, 'updateVisivility').mockImplementation(jest.fn())
    })

    it('should use error.params.errmsg if available', () => {
      component.handleCanAttendError({ params: { errmsg: 'custom error' } })
      expect((component as any).openSnackbar).toHaveBeenCalledWith('custom error')
    })

    it('should use error.error.params.errmsg if available', () => {
      component.handleCanAttendError({
        error: { params: { errmsg: 'nested error' } },
      })
      expect((component as any).openSnackbar).toHaveBeenCalledWith('nested error')
    })

    it('should use error.message if available', () => {
      component.handleCanAttendError({ message: 'generic message' })
      expect((component as any).openSnackbar).toHaveBeenCalledWith('generic message')
    })

    it('should use default message if no error info', () => {
      component.handleCanAttendError({})
      expect((component as any).openSnackbar).toHaveBeenCalledWith(
        'Unable to load assessment. Please try again later.',
      )
    })

    it('should set canAttempt exhausted when attempts exhausted error', () => {
      component.quizData = { maxAssessmentRetakeAttempts: 3 }
      component.handleCanAttendError({ message: 'attempts exhausted' })
      expect(component.canAttempt.attemptsMade).toBe(component.canAttempt.attemptsAllowed)
    })

    it('should call init and updateVisivility', () => {
      component.handleCanAttendError({})
      expect(component.init).toHaveBeenCalled()
      expect((component as any).updateVisivility).toHaveBeenCalled()
    })
  })

  // ─── canAttend ─────────────────────────────────────────────────────────────

  describe('canAttend', () => {
    beforeEach(() => {
      jest.spyOn(component, 'init').mockImplementation(jest.fn())
      jest.spyOn(component as any, 'updateVisivility').mockImplementation(jest.fn())
    })

    it('should call init and updateVisivility when forPreview is true', () => {
      component.forPreview = true
      component.forCreatorMode = false
      component.canAttend()
      expect(component.init).toHaveBeenCalled()
    })

    it('should call quizSvc.canAttend for level < 7', () => {
      component.forPreview = false
      component.selectedAssessmentCompatibilityLevel = 5
      mockQuizSvc.canAttend.mockReturnValue(of({ attemptsAllowed: 3, attemptsMade: 1 }))
      component.canAttend()
      expect(mockQuizSvc.canAttend).toHaveBeenCalledWith(component.identifier)
    })

    it('should call quizSvc.canAttendV5 for level >= 7', () => {
      component.forPreview = false
      component.selectedAssessmentCompatibilityLevel = 7
      mockQuizSvc.canAttendV5.mockReturnValue(of({ attemptsAllowed: 5, attemptsMade: 0 }))
      component.canAttend()
      expect(mockQuizSvc.canAttendV5).toHaveBeenCalledWith(component.identifier)
    })

    it('should not call any api when selectedAssessmentCompatibilityLevel is 0 and not forPreview', () => {
      component.forPreview = false
      component.selectedAssessmentCompatibilityLevel = 0
      component.canAttend()
      expect(mockQuizSvc.canAttend).not.toHaveBeenCalled()
      expect(mockQuizSvc.canAttendV5).not.toHaveBeenCalled()
    })
  })

  // ─── secQuestions ──────────────────────────────────────────────────────────

  describe('secQuestions', () => {
    it('should return empty array when quizJson has no questions', () => {
      component.quizJson.questions = []
      component.selectedSection = null
      expect(component.secQuestions).toEqual([])
    })

    it('should return empty array when selectedSection is null', () => {
      component.selectedSection = null
      expect(component.secQuestions).toEqual([])
    })
  })

  // ─── isQuestionAttempted ─────────────────────────────────────────────────

  describe('isQuestionAttempted', () => {
    it('should return true when questionId is in answerHash', () => {
      component.questionAnswerHash = { 'q1': ['o1'] }
      expect(component.isQuestionAttempted('q1')).toBe(true)
    })

    it('should return false when questionId is not in answerHash', () => {
      component.questionAnswerHash = {}
      expect(component.isQuestionAttempted('q1')).toBe(false)
    })
  })

  // ─── isQuestionMarked ─────────────────────────────────────────────────────

  describe('isQuestionMarked', () => {
    it('should return true when question is marked', () => {
      component.markedQuestions.add('q1' as unknown as never)
      expect(component.isQuestionMarked('q1')).toBe(true)
    })

    it('should return false when question is not marked', () => {
      expect(component.isQuestionMarked('q1')).toBe(false)
    })
  })

  // ─── isQuestionVisited ────────────────────────────────────────────────────

  describe('isQuestionVisited', () => {
    it('should return true when question has been visited', () => {
      component.questionVisitedData = ['q1', 'q2']
      expect(component.isQuestionVisited('q1')).toBe(true)
    })

    it('should return false when question has not been visited', () => {
      component.questionVisitedData = []
      expect(component.isQuestionVisited('q1')).toBe(false)
    })
  })

  // ─── markQuestion ─────────────────────────────────────────────────────────

  describe('markQuestion', () => {
    it('should add question to markedQuestions when not marked', () => {
      component.markQuestion('q1')
      expect(component.markedQuestions.has('q1' as unknown as never)).toBe(true)
    })

    it('should remove question from markedQuestions when already marked', () => {
      component.markedQuestions.add('q1' as unknown as never)
      component.markQuestion('q1')
      expect(component.markedQuestions.has('q1' as unknown as never)).toBe(false)
    })
  })

  // ─── backToSections ───────────────────────────────────────────────────────

  describe('backToSections', () => {
    it('should set viewState to detail', () => {
      component.viewState = 'attempt'
      component.backToSections()
      expect(component.viewState).toBe('detail')
    })
  })

  // ─── showAnswers ──────────────────────────────────────────────────────────

  describe('showAnswers', () => {
    it('should set viewState to answer', () => {
      component.viewState = 'attempt'
      component.showAnswers()
      expect(component.viewState).toBe('answer')
    })
  })

  // ─── getRhsValue ──────────────────────────────────────────────────────────

  describe('getRhsValue', () => {
    it('should return rhsChoices for MTF question type', () => {
      const q: any = { qType: 'MTF', rhsChoices: ['a', 'b'] }
      expect(component.getRhsValue(q)).toEqual(['a', 'b'])
    })

    it('should return empty array for non-MTF type', () => {
      const q: any = { qType: 'MCQ-SCA', rhsChoices: ['a'] }
      expect(component.getRhsValue(q)).toEqual([])
    })

    it('should return empty array when question is null', () => {
      expect(component.getRhsValue(null as any)).toEqual([])
    })

    it('should return empty array when qType is undefined', () => {
      expect(component.getRhsValue({} as any)).toEqual([])
    })
  })

  // ─── getClass ─────────────────────────────────────────────────────────────

  describe('getClass', () => {
    it('should return not-started when no attempt data', () => {
      component.attemptSubData = []
      const result = component.getClass({ identifier: 's1' } as any)
      expect(result).toBe('not-started')
    })

    it('should return complete when section is fullAttempted', () => {
      component.attemptSubData = [{ identifier: 's1', fullAttempted: true, isAttempted: true }] as any
      const result = component.getClass({ identifier: 's1' } as any)
      expect(result).toBe('complete')
    })

    it('should return incomplete when section isAttempted but not fullAttempted', () => {
      component.attemptSubData = [{ identifier: 's1', fullAttempted: false, isAttempted: true }] as any
      const result = component.getClass({ identifier: 's1' } as any)
      expect(result).toBe('incomplete')
    })

    it('should return not-started when section not attempted', () => {
      component.attemptSubData = [{ identifier: 's1', fullAttempted: false, isAttempted: false }] as any
      const result = component.getClass({ identifier: 's1' } as any)
      expect(result).toBe('not-started')
    })
  })

  // ─── updataDB ─────────────────────────────────────────────────────────────

  describe('updataDB', () => {
    it('should call quizSvc.secAttempted.next with data', () => {
      const spy = jest.spyOn(mockQuizSvc.secAttempted, 'next')
      const sections: any[] = [
        { identifier: 's1' },
        { identifier: 's2' },
      ]
      component.updataDB(sections as any)
      expect(spy).toHaveBeenCalled()
      const data: any = spy.mock.calls[0][0]
      expect(data.length).toBe(2)
      expect(data[0].identifier).toBe('s1')
      expect(data[0].nextSection).toBe('s2')
      expect(data[1].nextSection).toBeNull()
    })

    it('should set fullAttempted and isAttempted to false', () => {
      const spy = jest.spyOn(mockQuizSvc.secAttempted, 'next')
      component.updataDB([{ identifier: 's1' }] as any)
      const data: any = spy.mock.calls[0][0]
      expect(data[0].fullAttempted).toBe(false)
      expect(data[0].isAttempted).toBe(false)
    })

    it('should handle empty sections array', () => {
      const spy = jest.spyOn(mockQuizSvc.secAttempted, 'next')
      expect(() => component.updataDB([])).not.toThrow()
      expect(spy).toHaveBeenCalledWith([])
    })
  })

  // ─── markSectionAsComplete ────────────────────────────────────────────────

  describe('markSectionAsComplete', () => {
    it('should return true when all questions are answered', () => {
      component.selectedSection = { identifier: 's1' } as any
      component.quizJson.questions = [{
        questionId: 'q1', section: 's1', multiSelection: false,
        question: 'Q', instructions: null, options: [],
        choices: [], editorState: null,
      }] as any
      component.selectedAssessmentCompatibilityLevel = 1
      const answered: any = { q1: ['o1'] }
      expect(component.markSectionAsComplete(answered)).toBe(true)
    })

    it('should return false when some questions are not answered', () => {
      component.selectedSection = { identifier: 's1' } as any
      component.quizJson.questions = [
        { questionId: 'q1', section: 's1', multiSelection: false, question: 'Q', instructions: null, options: [], choices: [] },
        { questionId: 'q2', section: 's1', multiSelection: false, question: 'Q2', instructions: null, options: [], choices: [] },
      ] as any
      component.selectedAssessmentCompatibilityLevel = 1
      const answered: any = { q1: ['o1'] }
      expect(component.markSectionAsComplete(answered)).toBe(false)
    })
  })

  // ─── clearStorage ─────────────────────────────────────────────────────────

  describe('clearStorage', () => {
    it('should call quizSvc.paperSections.next(null)', () => {
      const spy = jest.spyOn(mockQuizSvc.paperSections, 'next')
      component.clearStorage()
      expect(spy).toHaveBeenCalledWith(null)
    })

    it('should call quizSvc.questionAnswerHash.next({})', () => {
      const spy = jest.spyOn(mockQuizSvc.questionAnswerHash, 'next')
      component.clearStorage()
      expect(spy).toHaveBeenCalledWith({})
    })

    it('should call quizSvc.qAnsHash({})', () => {
      component.clearStorage()
      expect(mockQuizSvc.qAnsHash).toHaveBeenCalledWith({})
    })

    it('should reset viewState to initial', () => {
      component.viewState = 'attempt'
      component.clearStorage()
      expect(component.viewState).toBe('initial')
    })

    it('should reset currentQuestionIndex to 0', () => {
      component.currentQuestionIndex = 5
      component.clearStorage()
      expect(component.currentQuestionIndex).toBe(0)
    })
  })

  // ─── updateVisivility ─────────────────────────────────────────────────────

  describe('updateVisivility', () => {
    it('should subscribe to displayCorrectAnswer', () => {
      component.updateVisivility()
      mockQuizSvc.displayCorrectAnswer.next(true)
      expect(component.showAnswer).toBe(true)
    })

    it('should update showAnswer to false', () => {
      component.updateVisivility()
      mockQuizSvc.displayCorrectAnswer.next(false)
      expect(component.showAnswer).toBe(false)
    })
  })

  // ─── raiseTelemetry ───────────────────────────────────────────────────────

  describe('raiseTelemetry', () => {
    it('should call raiseInteractTelemetry with optionId when provided', () => {
      component.raiseTelemetry('mark', 'opt1', 'click')
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
      const callArg = mockEvents.raiseInteractTelemetry.mock.calls[0][0]
      expect(callArg.id).toBe('opt1')
    })

    it('should call raiseInteractTelemetry with identifier when no optionId', () => {
      component.identifier = 'comp-001'
      component.raiseTelemetry('quiz', null, 'submit')
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
      const callArg = mockEvents.raiseInteractTelemetry.mock.calls[0][0]
      expect(callArg.id).toBe('comp-001')
    })
  })

  // ─── allSecAttempted getter ────────────────────────────────────────────────

  describe('allSecAttempted', () => {
    it('should return full: false when no sections', () => {
      mockQuizSvc.secAttempted.next([])
      expect(component.allSecAttempted.full).toBe(false)
    })

    it('should return full: true when all sections attempted', () => {
      mockQuizSvc.secAttempted.next([
        { identifier: 's1', fullAttempted: true, isAttempted: true, nextSection: null },
      ])
      expect(component.allSecAttempted.full).toBe(true)
    })

    it('should return sectionsCount correctly', () => {
      mockQuizSvc.secAttempted.next([
        { identifier: 's1', fullAttempted: true, isAttempted: true, nextSection: null },
        { identifier: 's2', fullAttempted: false, isAttempted: true, nextSection: null },
      ])
      expect(component.allSecAttempted.sectionsCount).toBe(2)
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe telemetrySubscription if set', () => {
      const spy = jest.fn()
      component.telemetrySubscription = { unsubscribe: spy } as any
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should unsubscribe attemptSubscription if set', () => {
      const spy = jest.fn()
      component.attemptSubscription = { unsubscribe: spy } as any
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should not throw when subscriptions are null', () => {
      component.telemetrySubscription = null
      component.attemptSubscription = null
      component.timerSubscription = null
      component.paramSubscription = null
        ; (component as any).viewerDataTocSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should call clearStorage on destroy', () => {
      const spy = jest.spyOn(component, 'clearStorage' as any)
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })
  })
})
