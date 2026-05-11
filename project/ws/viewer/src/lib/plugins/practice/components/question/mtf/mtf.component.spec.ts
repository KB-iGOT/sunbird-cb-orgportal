import { BehaviorSubject, Subject } from 'rxjs'
import { MatchTheFollowingQuesComponent } from './mtf.component'
import { NSPractice } from '../../../practice.model'

// Mock jsplumb at module level
jest.mock('jsplumb', () => ({
  jsPlumb: {
    getInstance: jest.fn(),
  },
}))

const makeOption = (overrides: Partial<NSPractice.IOption> = {}): NSPractice.IOption => ({
  optionId: 'opt-1',
  text: 'Question Option',
  isCorrect: true,
  match: 'Answer Match',
  hint: 'Hint text',
  ...overrides,
})

const makeQuestion = (overrides: Partial<NSPractice.IQuestion> = {}): NSPractice.IQuestion => ({
  multiSelection: false,
  section: 'Section C',
  question: 'Match the following:',
  instructions: '',
  questionId: 'q-mtf-001',
  questionLevel: 'hard',
  timeTaken: '0',
  editorState: undefined,
  options: [
    makeOption({ optionId: 'opt-1', text: 'Q1', match: 'A1', hint: 'Hint1' }),
    makeOption({ optionId: 'opt-2', text: 'Q2', match: 'A2', hint: '' }),
    makeOption({ optionId: 'opt-3', text: 'Q3', match: 'A3', hint: 'Hint3' }),
  ],
  ...overrides,
})

describe('MatchTheFollowingQuesComponent (mtf)', () => {
  let component: MatchTheFollowingQuesComponent
  let mockPracticeSvc: any
  let displayCorrectAnswerSubject: BehaviorSubject<boolean>
  let clearResponseSubject: Subject<string>
  let mockJsPlumbInstance: any

  beforeEach(() => {
    displayCorrectAnswerSubject = new BehaviorSubject<boolean>(false)
    clearResponseSubject = new Subject<string>()

    mockJsPlumbInstance = {
      getAllConnections: jest.fn().mockReturnValue([]),
      deleteEveryConnection: jest.fn(),
      repaintEverything: jest.fn(),
      bind: jest.fn(),
      makeSource: jest.fn(),
      makeTarget: jest.fn(),
      getSelector: jest.fn().mockReturnValue([]),
      batch: jest.fn((fn: Function) => fn()),
      connect: jest.fn(),
      getInstance: jest.fn(),
    }

    const { jsPlumb } = require('jsplumb')
    jsPlumb.getInstance.mockReturnValue(mockJsPlumbInstance)

    mockPracticeSvc = {
      displayCorrectAnswer: displayCorrectAnswerSubject.asObservable(),
      clearResponse: clearResponseSubject.asObservable(),
      questionAnswerHash: new BehaviorSubject<any>({}),
      shCorrectAnswer: jest.fn(),
    }

    component = new MatchTheFollowingQuesComponent(mockPracticeSvc)
    component.question = makeQuestion()
    component.primaryCategory = 'Practice Resource' as any
  })

  afterEach(() => {
    if ((component as any).shCorrectAnsSubscription) {
      (component as any).shCorrectAnsSubscription.unsubscribe()
    }
    jest.restoreAllMocks()
  })

  // ─── creation ────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have showAns=false initially', () => {
    expect(component.showAns).toBe(false)
  })

  it('should have edit=false initially', () => {
    expect(component.edit).toBe(false)
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should subscribe to displayCorrectAnswer', () => {
      component.ngOnInit()
      expect((component as any).shCorrectAnsSubscription).not.toBeNull()
    })

    it('should set showAns from displayCorrectAnswer emission (false)', () => {
      component.ngOnInit()
      expect(component.showAns).toBe(false)
    })

    it('should update showAns=true when displayCorrectAnswer emits true', () => {
      component.ngOnInit()
      displayCorrectAnswerSubject.next(true)
      expect(component.showAns).toBe(true)
    })

    it('should set localQuestion from question.question', () => {
      component.question = makeQuestion({ question: 'MTF Question text' })
      component.ngOnInit()
      expect(component.localQuestion).toBe('MTF Question text')
    })

    it('should set matchForView equal to match for each option', () => {
      component.ngOnInit()
      component.question.options.forEach(opt => {
        expect((opt as any).matchForView).toBe(opt.match)
      })
    })

    it('should populate matchHintDisplay with options that have hints', () => {
      component.ngOnInit()
      // opt-1 has hint 'Hint1', opt-3 has hint 'Hint3', opt-2 has empty hint
      expect(component.matchHintDisplay.length).toBe(2)
      expect(component.matchHintDisplay.some(o => o.optionId === 'opt-1')).toBe(true)
      expect(component.matchHintDisplay.some(o => o.optionId === 'opt-3')).toBe(true)
    })

    it('should not include options without hints in matchHintDisplay', () => {
      component.ngOnInit()
      expect(component.matchHintDisplay.some(o => o.optionId === 'opt-2')).toBe(false)
    })

    it('should subscribe to clearResponse', () => {
      component.ngOnInit()
      // Emit clearResponse with matching questionId and verify resetMtf
      component.jsPlumbInstance = mockJsPlumbInstance
      clearResponseSubject.next('q-mtf-001')
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })

    it('should not reset when clearResponse emits different questionId', () => {
      component.ngOnInit()
      component.jsPlumbInstance = mockJsPlumbInstance
      clearResponseSubject.next('q-different')
      expect(mockJsPlumbInstance.deleteEveryConnection).not.toHaveBeenCalled()
    })

    it('should unsubscribe existing subscription before creating a new one', () => {
      component.ngOnInit()
      const firstSub = (component as any).shCorrectAnsSubscription
      const unsubSpy = jest.spyOn(firstSub, 'unsubscribe')
      component.ngOnInit()
      expect(unsubSpy).toHaveBeenCalled()
    })
  })

  // ─── ngOnChanges ──────────────────────────────────────────────────────────
  describe('ngOnChanges', () => {
    it('should not throw when called with changes', () => {
      expect(() => component.ngOnChanges({ question: {} as any })).not.toThrow()
    })

    it('should handle empty changes object', () => {
      expect(() => component.ngOnChanges({})).not.toThrow()
    })
  })

  // ─── numConnections getter ────────────────────────────────────────────────
  describe('numConnections getter', () => {
    it('should return 0 when jsPlumbInstance is null', () => {
      component.jsPlumbInstance = null
      expect(component.numConnections).toBe(0)
    })

    it('should return length of all connections', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([{}, {}, {}])
      expect(component.numConnections).toBe(3)
    })

    it('should return 0 when no connections', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
      mockJsPlumbInstance.getAllConnections.mockReturnValue([])
      expect(component.numConnections).toBe(0)
    })
  })

  // ─── onResize ─────────────────────────────────────────────────────────────
  describe('onResize', () => {
    it('should call repaintEveryThing', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
      component.onResize({})
      expect(mockJsPlumbInstance.repaintEverything).toHaveBeenCalled()
    })
  })

  // ─── getSanitizeString ────────────────────────────────────────────────────
  describe('getSanitizeString', () => {
    it('should replace &lt; with <', () => {
      expect(component.getSanitizeString('&lt;')).toBe('<')
    })

    it('should replace &gt; with >', () => {
      expect(component.getSanitizeString('&gt;')).toBe('>')
    })

    it('should replace &nbsp; with space', () => {
      expect(component.getSanitizeString('hello&nbsp;world')).toBe('hello world')
    })

    it('should handle combined entities', () => {
      expect(component.getSanitizeString('&lt;p&gt;text&lt;/p&gt;')).toBe('<p>text</p>')
    })

    it('should return non-string values unchanged', () => {
      expect(component.getSanitizeString(null)).toBeNull()
      expect(component.getSanitizeString(undefined)).toBeUndefined()
      expect(component.getSanitizeString(123)).toBe(123)
    })

    it('should return plain string unchanged', () => {
      expect(component.getSanitizeString('plain')).toBe('plain')
    })
  })

  // ─── setBorderColor ───────────────────────────────────────────────────────
  describe('setBorderColor', () => {
    it('should set borderColor on source and target elements', () => {
      const mockSourceEl = { style: { borderColor: '' } }
      const mockTargetEl = { style: { borderColor: '' } }
      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'src-1') return mockSourceEl as any
        if (id === 'tgt-1') return mockTargetEl as any
        return null
      })
      component.setBorderColor({ sourceId: 'src-1', targetId: 'tgt-1' } as any, 'red')
      expect(mockSourceEl.style.borderColor).toBe('red')
      expect(mockTargetEl.style.borderColor).toBe('red')
    })

    it('should handle null elements gracefully', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.setBorderColor({ sourceId: 'x', targetId: 'y' } as any, 'red')).not.toThrow()
    })
  })

  // ─── setBorderColorById ───────────────────────────────────────────────────
  describe('setBorderColorById', () => {
    it('should set borderColor when element exists and color provided', () => {
      const mockEl = { style: { borderColor: '' } }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.setBorderColorById('elem-1', 'blue')
      expect(mockEl.style.borderColor).toBe('blue')
    })

    it('should not set borderColor when element is null', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.setBorderColorById('nonexistent', 'blue')).not.toThrow()
    })

    it('should not set borderColor when color is null/empty', () => {
      const mockEl = { style: { borderColor: 'original' } }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.setBorderColorById('elem-1', null)
      expect(mockEl.style.borderColor).toBe('original')
    })
  })

  // ─── resetMtf ─────────────────────────────────────────────────────────────
  describe('resetMtf', () => {
    it('should call deleteEveryConnection and set edit=false', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
      component.edit = true
      component.resetMtf()
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
      expect(component.edit).toBe(false)
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should call resetMtf (deleteEveryConnection)', () => {
      component.ngOnInit()
      component.jsPlumbInstance = mockJsPlumbInstance
      component.ngOnDestroy()
      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })

    it('should call shCorrectAnswer(false)', () => {
      component.ngOnInit()
      component.jsPlumbInstance = mockJsPlumbInstance
      component.ngOnDestroy()
      expect(mockPracticeSvc.shCorrectAnswer).toHaveBeenCalledWith(false)
    })

    it('should unsubscribe shCorrectAnsSubscription', () => {
      component.ngOnInit()
      const sub = (component as any).shCorrectAnsSubscription
      const unsubSpy = jest.spyOn(sub, 'unsubscribe')
      component.jsPlumbInstance = mockJsPlumbInstance
      component.ngOnDestroy()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('should handle null subscription on destroy', () => {
      component.jsPlumbInstance = mockJsPlumbInstance
        ; (component as any).shCorrectAnsSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
