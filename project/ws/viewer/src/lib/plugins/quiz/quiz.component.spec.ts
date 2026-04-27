import { QuizComponent } from './quiz.component'
import { of } from 'rxjs'

describe('QuizComponent', () => {
  let component: QuizComponent
  let mockEvents: any
  let mockDialog: any
  let mockDialogRef: any

  const makeQuestion = (id = 'q1', multiSelection = false): any => ({
    questionId: id,
    question: `Question ${id}`,
    multiSelection,
    options: [
      { optionId: 'o1', text: 'Option 1', isCorrect: true },
      { optionId: 'o2', text: 'Option 2', isCorrect: false },
    ],
  })

  beforeEach(() => {
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    mockDialogRef = { afterClosed: jest.fn().mockReturnValue(of(null)) }
    mockDialog = { open: jest.fn().mockReturnValue(mockDialogRef) }

    component = new QuizComponent(mockEvents, mockDialog)
    component.quizJson = {
      timeLimit: 0,
      questions: [makeQuestion()],
      isAssessment: false,
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  // ─── create ───────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have correct initial state', () => {
    expect(component.currentQuestionIndex).toBe(0)
    expect(component.viewState).toBe('initial')
    expect(component.isSubmitted).toBe(false)
    expect(component.isCompleted).toBe(false)
    expect(component.fetchingResultsStatus).toBe('none')
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should not throw', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  // ─── ngOnChanges ──────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should multiply timeLimit by 1000 when change is "quiz" and timeLimit is truthy', () => {
      component.quizJson.timeLimit = 30
      component.ngOnChanges({ quiz: {} as any })
      expect(component.quizJson.timeLimit).toBe(30000)
    })

    it('should NOT multiply timeLimit when change key is not "quiz"', () => {
      component.quizJson.timeLimit = 30
      component.ngOnChanges({ quizJson: {} as any })
      expect(component.quizJson.timeLimit).toBe(30)
    })

    it('should NOT multiply when timeLimit is 0 (falsy)', () => {
      component.quizJson.timeLimit = 0
      component.ngOnChanges({ quiz: {} as any })
      expect(component.quizJson.timeLimit).toBe(0)
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe timerSubscription if present', () => {
      const sub = { unsubscribe: jest.fn() }
      component.timerSubscription = sub as any
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should unsubscribe telemetrySubscription if present', () => {
      const sub = { unsubscribe: jest.fn() }
      component.telemetrySubscription = sub as any
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when both subscriptions are null', () => {
      component.timerSubscription = null
      component.telemetrySubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // ─── scroll ───────────────────────────────────────────────────────────────

  describe('scroll', () => {
    it('should close sideNav when sidenavOpenDefault is false and sideNav exists', () => {
      const mockSideNav = { close: jest.fn() }
      component.sideNav = mockSideNav as any
      component.sidenavOpenDefault = false
      component.scroll(0)
      expect(mockSideNav.close).toHaveBeenCalled()
    })

    it('should not close sideNav when sidenavOpenDefault is true', () => {
      const mockSideNav = { close: jest.fn() }
      component.sideNav = mockSideNav as any
      component.sidenavOpenDefault = true
      component.scroll(0)
      expect(mockSideNav.close).not.toHaveBeenCalled()
    })

    it('should not throw when sideNav is null', () => {
      component.sideNav = null
      component.sidenavOpenDefault = false
      expect(() => component.scroll(0)).not.toThrow()
    })

    it('should call scrollIntoView when question element exists', () => {
      const el = document.createElement('div')
      const scrollMock = jest.fn()
      el.scrollIntoView = scrollMock
      jest.spyOn(document, 'getElementById').mockReturnValue(el)
      component.scroll(1)
      expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    })

    it('should not throw when question element does not exist', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.scroll(99)).not.toThrow()
    })
  })

  // ─── overViewed ───────────────────────────────────────────────────────────

  describe('overViewed', () => {
    it('should call startQuiz() when event is "start"', () => {
      jest.useFakeTimers()
      const spy = jest.spyOn(component, 'startQuiz')
      component.overViewed('start')
      expect(spy).toHaveBeenCalled()
    })

    it('should not throw for event "skip"', () => {
      expect(() => component.overViewed('skip')).not.toThrow()
    })
  })

  // ─── startQuiz ────────────────────────────────────────────────────────────

  describe('startQuiz', () => {
    it('should set viewState to "attempt" and reset quiz state', () => {
      jest.useFakeTimers()
      component.quizJson.timeLimit = -1
      component.startQuiz()
      expect(component.viewState).toBe('attempt')
      expect(component.currentQuestionIndex).toBe(0)
      expect(component.questionAnswerHash).toEqual({})
      expect(component.markedQuestions.size).toBe(0)
    })

    it('should set sidenavOpenDefault true then false after 500ms', () => {
      jest.useFakeTimers()
      component.quizJson.timeLimit = -1
      component.startQuiz()
      expect(component.sidenavOpenDefault).toBe(true)
      jest.advanceTimersByTime(500)
      expect(component.sidenavOpenDefault).toBe(false)
    })

    it('should create timerSubscription when timeLimit >= 0', () => {
      jest.useFakeTimers()
      component.quizJson.timeLimit = 5000
      component.startQuiz()
      expect(component.timerSubscription).not.toBeNull()
      component.ngOnDestroy()
    })

    it('should NOT create timerSubscription when timeLimit is -1', () => {
      component.quizJson.timeLimit = -1
      component.startQuiz()
      expect(component.timerSubscription).toBeNull()
    })

    it('should set isIdeal and stop timer when timeLeft drops below 0', () => {
      jest.useFakeTimers()
      component.quizJson.timeLimit = 0   // timeLeft = 0, first tick → -0.1 < 0
      component.startQuiz()
      jest.advanceTimersByTime(200)
      expect(component.isIdeal).toBe(true)
      expect(component.timeLeft).toBe(0)
    })
  })

  // ─── fillSelectedItems ────────────────────────────────────────────────────

  describe('fillSelectedItems', () => {
    it('should add answer to questionAnswerHash for single selection', () => {
      component.fillSelectedItems(makeQuestion(), 'o1')
      expect(component.questionAnswerHash['q1']).toEqual(['o1'])
    })

    it('should replace previous answer for single selection', () => {
      component.questionAnswerHash['q1'] = ['o1']
      component.fillSelectedItems(makeQuestion(), 'o2')
      expect(component.questionAnswerHash['q1']).toEqual(['o2'])
    })

    it('should set viewState to "attempt"', () => {
      component.viewState = 'answer'
      component.fillSelectedItems(makeQuestion(), 'o1')
      expect(component.viewState).toBe('attempt')
    })

    it('should call reset on each questionsReference when viewState is "answer"', () => {
      const mockQRef = { reset: jest.fn() }
      component.questionsReference = { forEach: (cb: any) => cb(mockQRef) } as any
      component.viewState = 'answer'
      component.fillSelectedItems(makeQuestion(), 'o1')
      expect(mockQRef.reset).toHaveBeenCalled()
    })

    it('should push new option for multi-selection when not already selected', () => {
      const mq = makeQuestion('q2', true)
      component.questionAnswerHash['q2'] = ['o1']
      component.fillSelectedItems(mq, 'o2')
      expect(component.questionAnswerHash['q2']).toEqual(['o1', 'o2'])
    })

    it('should remove option for multi-selection when already selected', () => {
      const mq = makeQuestion('q2', true)
      component.questionAnswerHash['q2'] = ['o1', 'o2']
      component.fillSelectedItems(mq, 'o1')
      expect(component.questionAnswerHash['q2']).toEqual(['o2'])
    })

    it('should delete question from hash when all multi-select options deselected', () => {
      const mq = makeQuestion('q2', true)
      component.questionAnswerHash['q2'] = ['o1']
      component.fillSelectedItems(mq, 'o1')
      expect(component.questionAnswerHash['q2']).toBeUndefined()
    })
  })

  // ─── proceedToSubmit ──────────────────────────────────────────────────────

  describe('proceedToSubmit', () => {
    it('should not open dialog when timeLeft is 0', () => {
      component.timeLeft = 0
      component.proceedToSubmit()
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should set submissionState to "unanswered" when not all questions answered', () => {
      component.timeLeft = 1000
      component.questionAnswerHash = {}
      component.proceedToSubmit()
      expect(component.submissionState).toBe('unanswered')
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should set submissionState to "marked" when all answered but some marked', () => {
      component.timeLeft = 1000
      component.questionAnswerHash = { q1: ['o1'] }
      component.markedQuestions = new Set(['q1']) as any
      component.proceedToSubmit()
      expect(component.submissionState).toBe('marked')
    })

    it('should set submissionState to "answered" when all answered and none marked', () => {
      component.timeLeft = 1000
      component.questionAnswerHash = { q1: ['o1'] }
      component.markedQuestions = new Set([]) as any
      component.proceedToSubmit()
      expect(component.submissionState).toBe('answered')
    })

    it('should not throw when dialog closes with truthy result', () => {
      component.timeLeft = 1000
      component.questionAnswerHash = { q1: ['o1'] }
      mockDialogRef.afterClosed.mockReturnValue(of(true))
      expect(() => component.proceedToSubmit()).not.toThrow()
    })
  })

  // ─── submitQuiz ───────────────────────────────────────────────────────────

  describe('submitQuiz', () => {
    beforeEach(() => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
    })

    it('should set isSubmitted to true and fetchingResultsStatus to "done"', () => {
      component.submitQuiz()
      expect(component.isSubmitted).toBe(true)
      expect(component.fetchingResultsStatus).toBe('done')
    })

    it('should set viewState to "answer" when isAssessment is false', () => {
      component.quizJson.isAssessment = false
      component.submitQuiz()
      expect(component.viewState).toBe('answer')
    })

    it('should set viewState to "review" when isAssessment is true', () => {
      component.quizJson.isAssessment = true
      component.submitQuiz()
      expect(component.viewState).toBe('review')
    })

    it('should scrollIntoView on quiz-end element when it exists', () => {
      const el = document.createElement('div')
      const scrollMock = jest.fn()
      el.scrollIntoView = scrollMock
        ; (document.getElementById as jest.Mock).mockReturnValue(el)
      component.submitQuiz()
      expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    })

    it('should call ngOnDestroy to clean up subscriptions', () => {
      const destroySpy = jest.spyOn(component, 'ngOnDestroy')
      component.submitQuiz()
      expect(destroySpy).toHaveBeenCalled()
    })
  })

  // ─── showAnswers ──────────────────────────────────────────────────────────

  describe('showAnswers', () => {
    it('should set viewState to "answer"', () => {
      component.showAnswers()
      expect(component.viewState).toBe('answer')
    })

    it('should delegate to showMtfAnswers and showFitbAnswers', () => {
      const mtf = jest.spyOn(component, 'showMtfAnswers')
      const fitb = jest.spyOn(component, 'showFitbAnswers')
      component.showAnswers()
      expect(mtf).toHaveBeenCalled()
      expect(fitb).toHaveBeenCalled()
    })
  })

  // ─── showMtfAnswers ───────────────────────────────────────────────────────

  describe('showMtfAnswers', () => {
    it('should call matchShowAnswer on each question reference', () => {
      const mockQRef = { matchShowAnswer: jest.fn() }
      component.questionsReference = { forEach: (cb: any) => cb(mockQRef) } as any
      component.showMtfAnswers()
      expect(mockQRef.matchShowAnswer).toHaveBeenCalled()
    })

    it('should not throw when questionsReference is null', () => {
      component.questionsReference = null
      expect(() => component.showMtfAnswers()).not.toThrow()
    })
  })

  // ─── showFitbAnswers ──────────────────────────────────────────────────────

  describe('showFitbAnswers', () => {
    it('should call functionChangeBlankBorder on each question reference', () => {
      const mockQRef = { functionChangeBlankBorder: jest.fn() }
      component.questionsReference = { forEach: (cb: any) => cb(mockQRef) } as any
      component.showFitbAnswers()
      expect(mockQRef.functionChangeBlankBorder).toHaveBeenCalled()
    })

    it('should not throw when questionsReference is null', () => {
      component.questionsReference = null
      expect(() => component.showFitbAnswers()).not.toThrow()
    })
  })

  // ─── calculateResults ─────────────────────────────────────────────────────

  describe('calculateResults', () => {
    it('should not throw (implementation is commented out)', () => {
      expect(() => component.calculateResults()).not.toThrow()
    })
  })

  // ─── setBorderColor ───────────────────────────────────────────────────────

  describe('setBorderColor', () => {
    it('should set borderColor on both source and target elements', () => {
      const srcEl = document.createElement('div')
      const tgtEl = document.createElement('div')
      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'src1') { return srcEl }
        if (id === 'tgt1') { return tgtEl }
        return null
      })
      component.setBorderColor({ sourceId: 'src1', targetId: 'tgt1' } as any, '#ff0000')
      expect(srcEl.style.borderColor).toBe('#ff0000')
      expect(tgtEl.style.borderColor).toBe('#ff0000')
    })

    it('should not throw when elements do not exist', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() =>
        component.setBorderColor({ sourceId: 'x', targetId: 'y' } as any, 'red')
      ).not.toThrow()
    })
  })

  // ─── isQuestionAttempted ──────────────────────────────────────────────────

  describe('isQuestionAttempted', () => {
    it('should return true when question id is in hash', () => {
      component.questionAnswerHash = { q1: ['o1'] }
      expect(component.isQuestionAttempted('q1')).toBe(true)
    })

    it('should return false when question id is not in hash', () => {
      component.questionAnswerHash = {}
      expect(component.isQuestionAttempted('q1')).toBe(false)
    })
  })

  // ─── isQuestionMarked ─────────────────────────────────────────────────────

  describe('isQuestionMarked', () => {
    it('should return true when question is in markedQuestions', () => {
      component.markedQuestions = new Set(['q1']) as any
      expect(component.isQuestionMarked('q1')).toBe(true)
    })

    it('should return false when question is not in markedQuestions', () => {
      component.markedQuestions = new Set([]) as any
      expect(component.isQuestionMarked('q99')).toBe(false)
    })
  })

  // ─── markQuestion ─────────────────────────────────────────────────────────

  describe('markQuestion', () => {
    it('should add question to markedQuestions when not already marked', () => {
      component.markedQuestions = new Set([]) as any
      component.markQuestion('q1')
      expect(component.markedQuestions.has('q1' as unknown as never)).toBe(true)
    })

    it('should remove question from markedQuestions when already marked', () => {
      component.markedQuestions = new Set(['q1']) as any
      component.markQuestion('q1')
      expect(component.markedQuestions.has('q1' as unknown as never)).toBe(false)
    })
  })

  // ─── raiseTelemetry ───────────────────────────────────────────────────────

  describe('raiseTelemetry', () => {
    it('should call raiseInteractTelemetry when optionId is truthy', () => {
      component.raiseTelemetry('mark', 'o1', 'click')
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith('mark', 'click', {})
    })

    it('should call raiseInteractTelemetry when optionId is null', () => {
      component.raiseTelemetry('quiz', null, 'submit')
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith('quiz', 'submit', {})
    })
  })
})

