import { BehaviorSubject } from 'rxjs'
import { MultipleChoiseQuesComponent } from './mcq-mca.component'
import { NSPractice } from '../../../practice.model'

const makeQuestion = (overrides: Partial<NSPractice.IQuestion> = {}): NSPractice.IQuestion => ({
  multiSelection: true,
  section: 'Section A',
  question: 'Which of the following are correct?',
  instructions: '',
  questionId: 'q-001',
  questionLevel: 'medium',
  timeTaken: '0',
  editorState: undefined,
  options: [
    { optionId: 'opt-1', text: 'Option 1', isCorrect: true },
    { optionId: 'opt-2', text: 'Option 2', isCorrect: false },
    { optionId: 'opt-3', text: 'Option 3', isCorrect: true },
  ],
  ...overrides,
})

describe('MultipleChoiseQuesComponent (mcq-mca)', () => {
  let component: MultipleChoiseQuesComponent
  let mockPracticeSvc: any
  let displayCorrectAnswerSubject: BehaviorSubject<boolean>

  beforeEach(() => {
    displayCorrectAnswerSubject = new BehaviorSubject<boolean>(false)
    mockPracticeSvc = {
      displayCorrectAnswer: displayCorrectAnswerSubject.asObservable(),
      shCorrectAnswer: jest.fn(),
    }
    component = new MultipleChoiseQuesComponent(mockPracticeSvc)
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

    it('should set showAns from subscription - false by default', () => {
      component.ngOnInit()
      expect(component.showAns).toBe(false)
    })

    it('should update showAns when displayCorrectAnswer emits true', () => {
      component.ngOnInit()
      displayCorrectAnswerSubject.next(true)
      expect(component.showAns).toBe(true)
    })

    it('should update showAns back to false when displayCorrectAnswer emits false', () => {
      component.ngOnInit()
      displayCorrectAnswerSubject.next(true)
      displayCorrectAnswerSubject.next(false)
      expect(component.showAns).toBe(false)
    })

    it('should set localQuestion from question.question', () => {
      component.question = makeQuestion({ question: 'What is 2+2?' })
      component.ngOnInit()
      expect(component.localQuestion).toBe('What is 2+2?')
    })

    it('should unsubscribe existing subscription before creating new one', () => {
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

  // ─── ngAfterViewInit ──────────────────────────────────────────────────────
  describe('ngAfterViewInit', () => {
    it('should not throw', () => {
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  // ─── isSelected ──────────────────────────────────────────────────────────
  describe('isSelected', () => {
    it('should return true when option is in itemSelectedList', () => {
      component.itemSelectedList = ['opt-1', 'opt-3']
      const result = component.isSelected({ optionId: 'opt-1', text: 'Option 1', isCorrect: true })
      expect(result).toBe(true)
    })

    it('should return false when option is not in itemSelectedList', () => {
      component.itemSelectedList = ['opt-1']
      const result = component.isSelected({ optionId: 'opt-2', text: 'Option 2', isCorrect: false })
      expect(result).toBe(false)
    })

    it('should return false when itemSelectedList is empty', () => {
      component.itemSelectedList = []
      const result = component.isSelected({ optionId: 'opt-1', text: 'Option 1', isCorrect: true })
      expect(result).toBe(false)
    })

    it('should return true for each selected option in multi-selection', () => {
      component.itemSelectedList = ['opt-1', 'opt-3']
      expect(component.isSelected({ optionId: 'opt-1', text: '', isCorrect: true })).toBe(true)
      expect(component.isSelected({ optionId: 'opt-3', text: '', isCorrect: true })).toBe(true)
      expect(component.isSelected({ optionId: 'opt-2', text: '', isCorrect: false })).toBe(false)
    })
  })

  // ─── updateParent ─────────────────────────────────────────────────────────
  describe('updateParent', () => {
    it('should emit object with index and status when assessmentType is optionalWeightage', () => {
      component.assessmentType = 'optionalWeightage'
      const emitSpy = jest.spyOn(component.update, 'emit')
      component.updateParent('opt-1', true)
      expect(emitSpy).toHaveBeenCalledWith({ index: 'opt-1', status: true })
    })

    it('should emit event value directly when assessmentType is not optionalWeightage', () => {
      component.assessmentType = ''
      const emitSpy = jest.spyOn(component.update, 'emit')
      component.updateParent('opt-2', false)
      expect(emitSpy).toHaveBeenCalledWith('opt-2')
    })

    it('should emit with assessmentType=regular', () => {
      component.assessmentType = 'regular'
      const emitSpy = jest.spyOn(component.update, 'emit')
      component.updateParent('opt-3', true)
      expect(emitSpy).toHaveBeenCalledWith('opt-3')
    })
  })

  // ─── getSanitizeString ────────────────────────────────────────────────────
  describe('getSanitizeString', () => {
    it('should replace HTML entities in a string', () => {
      const result = component.getSanitizeString('&lt;p&gt;Hello&nbsp;World&lt;/p&gt;')
      expect(result).toBe('<p>Hello World</p>')
    })

    it('should replace &lt; with <', () => {
      expect(component.getSanitizeString('&lt;div&gt;')).toBe('<div>')
    })

    it('should replace &gt; with >', () => {
      expect(component.getSanitizeString('&gt;')).toBe('>')
    })

    it('should replace &nbsp; with space', () => {
      expect(component.getSanitizeString('hello&nbsp;world')).toBe('hello world')
    })

    it('should return non-string values as-is', () => {
      expect(component.getSanitizeString(null)).toBeNull()
      expect(component.getSanitizeString(undefined)).toBeUndefined()
      expect(component.getSanitizeString(42)).toBe(42)
    })

    it('should handle plain string without entities', () => {
      expect(component.getSanitizeString('plain text')).toBe('plain text')
    })

    it('should handle empty string', () => {
      expect(component.getSanitizeString('')).toBe('')
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should call shCorrectAnswer(false) on destroy', () => {
      component.ngOnInit()
      component.ngOnDestroy()
      expect(mockPracticeSvc.shCorrectAnswer).toHaveBeenCalledWith(false)
    })

    it('should unsubscribe shCorrectAnsSubscription on destroy', () => {
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
