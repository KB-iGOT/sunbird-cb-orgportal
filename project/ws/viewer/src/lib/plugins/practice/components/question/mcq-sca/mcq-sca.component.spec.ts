import { BehaviorSubject } from 'rxjs'
import { SingleChoiseQuesComponent } from './mcq-sca.component'
import { NSPractice } from '../../../practice.model'

const makeQuestion = (overrides: Partial<NSPractice.IQuestion> = {}): NSPractice.IQuestion => ({
  multiSelection: false,
  section: 'Section B',
  question: 'Which one is correct?',
  instructions: '',
  questionId: 'q-sca-001',
  questionLevel: 'easy',
  timeTaken: '0',
  editorState: undefined,
  options: [
    { optionId: 'opt-a', text: 'Answer A', isCorrect: true },
    { optionId: 'opt-b', text: 'Answer B', isCorrect: false },
    { optionId: 'opt-c', text: 'Answer C', isCorrect: false },
  ],
  ...overrides,
})

describe('SingleChoiseQuesComponent (mcq-sca)', () => {
  let component: SingleChoiseQuesComponent
  let mockPracticeSvc: any
  let displayCorrectAnswerSubject: BehaviorSubject<boolean>

  beforeEach(() => {
    displayCorrectAnswerSubject = new BehaviorSubject<boolean>(false)
    mockPracticeSvc = {
      displayCorrectAnswer: displayCorrectAnswerSubject.asObservable(),
      shCorrectAnswer: jest.fn(),
    }
    component = new SingleChoiseQuesComponent(mockPracticeSvc)
    component.question = makeQuestion()
    component.itemSelectedList = []
    component.assessmentType = ''
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

  // ─── ngOnInit ─────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should subscribe to displayCorrectAnswer', () => {
      component.ngOnInit()
      expect((component as any).shCorrectAnsSubscription).not.toBeNull()
    })

    it('should set showAns=false initially from subscription', () => {
      component.ngOnInit()
      expect(component.showAns).toBe(false)
    })

    it('should update showAns=true when displayCorrectAnswer emits true', () => {
      component.ngOnInit()
      displayCorrectAnswerSubject.next(true)
      expect(component.showAns).toBe(true)
    })

    it('should update showAns=false when displayCorrectAnswer emits false after true', () => {
      component.ngOnInit()
      displayCorrectAnswerSubject.next(true)
      displayCorrectAnswerSubject.next(false)
      expect(component.showAns).toBe(false)
    })

    it('should set localQuestion from question.question', () => {
      component.question = makeQuestion({ question: 'What is the capital of France?' })
      component.ngOnInit()
      expect(component.localQuestion).toBe('What is the capital of France?')
    })

    it('should unsubscribe existing subscription before creating a new one', () => {
      component.ngOnInit()
      const firstSub = (component as any).shCorrectAnsSubscription
      const unsubSpy = jest.spyOn(firstSub, 'unsubscribe')
      component.ngOnInit()
      expect(unsubSpy).toHaveBeenCalled()
    })
  })

  // ─── isSelected ──────────────────────────────────────────────────────────
  describe('isSelected', () => {
    it('should return true when optionId is in itemSelectedList', () => {
      component.itemSelectedList = ['opt-a']
      const result = component.isSelected({ optionId: 'opt-a', text: 'Answer A', isCorrect: true })
      expect(result).toBe(true)
    })

    it('should return false when optionId is not in itemSelectedList', () => {
      component.itemSelectedList = ['opt-a']
      const result = component.isSelected({ optionId: 'opt-b', text: 'Answer B', isCorrect: false })
      expect(result).toBe(false)
    })

    it('should return false when itemSelectedList is empty', () => {
      component.itemSelectedList = []
      const result = component.isSelected({ optionId: 'opt-a', text: 'Answer A', isCorrect: true })
      expect(result).toBe(false)
    })

    it('should return false for option not selected in single-choice scenario', () => {
      component.itemSelectedList = ['opt-b']
      expect(component.isSelected({ optionId: 'opt-a', text: '', isCorrect: true })).toBe(false)
      expect(component.isSelected({ optionId: 'opt-b', text: '', isCorrect: false })).toBe(true)
    })
  })

  // ─── updateParent ─────────────────────────────────────────────────────────
  describe('updateParent', () => {
    it('should emit { index, status } when assessmentType is optionalWeightage', () => {
      component.assessmentType = 'optionalWeightage'
      const emitSpy = jest.spyOn(component.update, 'emit')
      component.updateParent('opt-a', true)
      expect(emitSpy).toHaveBeenCalledWith({ index: 'opt-a', status: true })
    })

    it('should emit raw event value when assessmentType is not optionalWeightage', () => {
      component.assessmentType = ''
      const emitSpy = jest.spyOn(component.update, 'emit')
      component.updateParent('opt-b', false)
      expect(emitSpy).toHaveBeenCalledWith('opt-b')
    })

    it('should emit raw value for any other assessmentType', () => {
      component.assessmentType = 'standard'
      const emitSpy = jest.spyOn(component.update, 'emit')
      component.updateParent('opt-c', true)
      expect(emitSpy).toHaveBeenCalledWith('opt-c')
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

    it('should handle combined HTML entities', () => {
      const result = component.getSanitizeString('&lt;b&gt;bold&lt;/b&gt;')
      expect(result).toBe('<b>bold</b>')
    })

    it('should return non-string values unchanged', () => {
      expect(component.getSanitizeString(null)).toBeNull()
      expect(component.getSanitizeString(undefined)).toBeUndefined()
      expect(component.getSanitizeString(0)).toBe(0)
    })

    it('should return plain string unchanged', () => {
      expect(component.getSanitizeString('plain text')).toBe('plain text')
    })

    it('should return empty string unchanged', () => {
      expect(component.getSanitizeString('')).toBe('')
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should call shCorrectAnswer(false)', () => {
      component.ngOnInit()
      component.ngOnDestroy()
      expect(mockPracticeSvc.shCorrectAnswer).toHaveBeenCalledWith(false)
    })

    it('should unsubscribe shCorrectAnsSubscription', () => {
      component.ngOnInit()
      const sub = (component as any).shCorrectAnsSubscription
      const unsubSpy = jest.spyOn(sub, 'unsubscribe')
      component.ngOnDestroy()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('should handle destroy when subscription is null', () => {
      (component as any).shCorrectAnsSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
