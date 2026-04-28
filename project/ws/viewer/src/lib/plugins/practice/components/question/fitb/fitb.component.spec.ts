import { FillInTheBlankComponent } from './fitb.component'
import { DomSanitizer } from '@angular/platform-browser'
import { ElementRef, SimpleChanges } from '@angular/core'
import { PracticeService } from '../../../practice.service'
import { Subject } from 'rxjs'
import { NsContent } from '@sunbird-cb/utils-v2'

describe('FillInTheBlankComponent', () => {
  let component: FillInTheBlankComponent
  let mockDomSanitizer: any
  let mockElementRef: any
  let mockPracticeService: any
  let clearResponseSubject: Subject<any>
  let displayCorrectAnswerSubject: Subject<any>

  const buildMockInput = (value = '') => ({
    value,
    setAttribute: jest.fn(),
    addEventListener: jest.fn(),
  })

  beforeEach(() => {
    clearResponseSubject = new Subject()
    displayCorrectAnswerSubject = new Subject()

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html: any) => html),
    }

    mockElementRef = {
      nativeElement: {
        querySelector: jest.fn(() => buildMockInput()),
      },
    }

    mockPracticeService = {
      clearResponse: clearResponseSubject,
      displayCorrectAnswer: displayCorrectAnswerSubject,
      questionAnswerHash: { value: {} },
      shCorrectAnswer: jest.fn(),
    }

    component = new FillInTheBlankComponent(
      mockDomSanitizer as DomSanitizer,
      mockElementRef as ElementRef,
      mockPracticeService as PracticeService
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── Initialization ────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should create component with default values', () => {
      expect(component).toBeTruthy()
      expect(component.showAns).toBeFalsy()
      expect(component.correctOption).toEqual([])
    })

    it('should initialize with default question object', () => {
      expect(component.question.questionId).toBe('')
      expect(component.question.multiSelection).toBeFalsy()
    })
  })

  // ─── ngOnChanges ──────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should run without error when changes are provided', () => {
      expect(() => component.ngOnChanges({} as SimpleChanges)).not.toThrow()
    })
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should subscribe to clearResponse and clear matInput blanks for matching questionId', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Fill <input matInput id="q10">'
      const mockInput = buildMockInput('old')
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockInput)

      component.ngOnInit()
      clearResponseSubject.next('q1')

      expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalled()
      expect(mockInput.value).toBe('')
    })

    it('should not clear blanks when clearResponse fires with a different questionId', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Fill <input matInput id="q10">'
      const mockInput = buildMockInput('old')
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockInput)

      component.ngOnInit()
      clearResponseSubject.next('differentId')

      expect(mockInput.value).toBe('old')
    })

    it('should clear select blanks when choices have more than 1 option', () => {
      component.question = {
        questionId: 'q2',
        questionType: 'ftb',
        question: 'Choose _______________',
        choices: { options: [{ value: { body: 'a' } }, { value: { body: 'b' } }] },
        options: [],
      } as any
      const mockSelect = buildMockInput('chosen')
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockSelect)

      component.ngOnInit()
      // Override localQuestion after ngOnInit so the subscription handler sees 'select'
      component.localQuestion = 'Choose <select id="q20"><select id="q21">'
      clearResponseSubject.next('q2')

      expect(mockSelect.value).toBe('')
    })

    it('should subscribe to displayCorrectAnswer and set showAns when primaryCategory is PRACTICE_RESOURCE', () => {
      component.question = {
        questionId: 'q3',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Fill _______________'
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE

      component.ngOnInit()
      displayCorrectAnswerSubject.next(true)

      expect(component.showAns).toBe(true)
    })

    it('should not subscribe to displayCorrectAnswer when primaryCategory is not PRACTICE_RESOURCE', () => {
      component.question = {
        questionId: 'q4',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Fill _______________'
      component.primaryCategory = NsContent.EPrimaryCategory.COURSE

      component.ngOnInit()
      displayCorrectAnswerSubject.next(true)

      expect(component.showAns).toBe(false)
    })

    it('should unsubscribe existing shCorrectAnsSubscription before re-subscribing', () => {
      component.question = {
        questionId: 'q5',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Fill _______________'
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE

      const mockUnsub = { unsubscribe: jest.fn() }
      component.shCorrectAnsSubscription = mockUnsub as any

      component.ngOnInit()

      expect(mockUnsub.unsubscribe).toHaveBeenCalled()
    })
  })

  // ─── onEntryInBlank ───────────────────────────────────────────────────────

  describe('onEntryInBlank', () => {
    beforeEach(() => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Test _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Test <input matInput'
    })

    it('should emit joined input values for matInput blanks', () => {
      mockElementRef.nativeElement.querySelector.mockReturnValue(buildMockInput('hello'))
      jest.spyOn(component.update, 'emit')

      component.onEntryInBlank('q1')

      expect(component.update.emit).toHaveBeenCalledWith('hello')
    })

    it('should emit joined values for dropdown (choices > 1) blanks with value', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Test _______________',
        choices: { options: [{ value: { body: 'a' } }, { value: { body: 'b' } }] },
        options: [],
      } as any
      component.localQuestion = '<select id="q10"><select id="q11">'
      mockElementRef.nativeElement.querySelector.mockReturnValue(buildMockInput('a'))
      jest.spyOn(component.update, 'emit')

      component.onEntryInBlank('q1')

      expect(component.update.emit).toHaveBeenCalled()
    })

    it('should skip blank when dropdown value is empty', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Test _______________',
        choices: { options: [{ value: { body: 'a' } }, { value: { body: 'b' } }] },
        options: [],
      } as any
      component.localQuestion = '<select id="q10">'
      mockElementRef.nativeElement.querySelector.mockReturnValue(buildMockInput(''))
      jest.spyOn(component.update, 'emit')

      component.onEntryInBlank('q1')

      expect(component.update.emit).toHaveBeenCalledWith('')
    })

    it('should call ifFillInTheBlankCorrect when primaryCategory is PRACTICE_RESOURCE', () => {
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Test _______________',
        choices: { options: [] },
        options: [],
        editorState: {
          options: [{ value: { body: 'hello' } }],
        },
      } as any
      component.localQuestion = 'Test <input matInput'
      mockElementRef.nativeElement.querySelector.mockReturnValue(buildMockInput('hello'))
      jest.spyOn(document, 'getElementById').mockReturnValue({ value: 'hello' } as any)

      const spy = jest.spyOn(component as any, 'ifFillInTheBlankCorrect')
      component.onEntryInBlank('q10')

      expect(spy).toHaveBeenCalledWith('q10')
    })
  })

  // ─── ifFillInTheBlankCorrect ──────────────────────────────────────────────

  describe('ifFillInTheBlankCorrect', () => {
    beforeEach(() => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Test',
        choices: { options: [] },
        options: [],
        editorState: {
          options: [
            { value: { body: 'correct' } },
            { value: { body: 'second' } },
          ],
        },
      } as any
      component.correctOption = [false]
      component.unTouchedBlank = [true]
    })

    it('should set correctOption true when answer matches', () => {
      const mockEl = { value: 'correct' }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)

      component.ifFillInTheBlankCorrect('q10')

      expect(component.correctOption[0]).toBe(true)
      expect(component.unTouchedBlank[0]).toBe(false)
    })

    it('should set correctOption false when answer does not match', () => {
      const mockEl = { value: 'wrong' }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)

      component.ifFillInTheBlankCorrect('q10')

      expect(component.correctOption[0]).toBe(false)
      expect(component.unTouchedBlank[0]).toBe(false)
    })

    it('should set unTouchedBlank true when value is empty', () => {
      const mockEl = { value: '' }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)

      component.ifFillInTheBlankCorrect('q10')

      expect(component.unTouchedBlank[0]).toBe(true)
    })

    it('should do nothing when editorState is missing', () => {
      component.question = { ...component.question, editorState: undefined } as any

      expect(() => component.ifFillInTheBlankCorrect('q10')).not.toThrow()
    })
  })

  // ─── onChange ─────────────────────────────────────────────────────────────

  describe('onChange', () => {
    it('should delegate to onEntryInBlank', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Test',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Test <input matInput'
      mockElementRef.nativeElement.querySelector.mockReturnValue(buildMockInput('val'))
      jest.spyOn(component.update, 'emit')

      component.onChange('q10', { target: {} })

      expect(component.update.emit).toHaveBeenCalledWith('val')
    })
  })

  // ─── ngAfterViewInit ──────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('should attach change listeners to matInput blanks for ftb without choices', () => {
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'Fill <input matInput id="q10">'

      component.ngAfterViewInit()

      expect(mockEl.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should attach change listeners to select blanks for ftb with choices > 1', () => {
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Choose _______________',
        choices: { options: [{ value: { body: 'a' } }, { value: { body: 'b' } }] },
        options: [],
      } as any
      component.localQuestion = '<select id="q10"><select id="q11">'

      component.ngAfterViewInit()

      expect(mockEl.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should not attach listeners when questionType is not ftb', () => {
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)
      component.question = {
        questionId: 'q1',
        questionType: 'mcq',
        question: 'MCQ question',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'MCQ question'

      component.ngAfterViewInit()

      expect(mockEl.addEventListener).not.toHaveBeenCalled()
    })

    it('should skip listener when querySelector returns null for select blank', () => {
      mockElementRef.nativeElement.querySelector.mockReturnValue(null)
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Choose _______________',
        choices: { options: [{ value: { body: 'a' } }, { value: { body: 'b' } }] },
        options: [],
      } as any
      component.localQuestion = '<select id="q10">'

      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  // ─── init ─────────────────────────────────────────────────────────────────

  describe('init', () => {
    it('should initialize FTB question with input fields replacing underscores', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [{ optionId: '1', text: '', isCorrect: false }],
      } as any
      component.localQuestion = 'Fill _______________'

      component.init()

      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
      expect(component.localQuestion).toContain('matInput')
    })

    it('should populate input with existing answer value when questionAnswerHash has value', () => {
      mockPracticeService.questionAnswerHash = { value: { q1: 'hello' } }
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [{ optionId: '1', text: '', isCorrect: false }],
        editorState: { options: [{ value: { body: 'hello' } }] },
      } as any
      component.localQuestion = 'Fill _______________'
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      mockElementRef.nativeElement.querySelector.mockReturnValue({ value: 'hello' })

      jest.useFakeTimers()
      component.init()
      jest.runAllTimers()
      jest.useRealTimers()

      expect(component.localQuestion).toContain('value="hello"')
    })

    it('should handle dropdown type questions with choices > 1', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: {
          options: [
            { value: { body: 'option1' } },
            { value: { body: 'option2' } },
          ],
        },
        options: [{ optionId: '1', text: '', isCorrect: false }],
      } as any
      component.localQuestion = 'Fill _______________'

      component.init()

      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
      expect(component.localQuestion).toContain('select')
    })

    it('should handle richTextEditor path (iterationNumber === 0) with input style attribute', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill <input style="border-style:none none solid none" />',
        choices: { options: [] },
        options: [{ optionId: '1', text: '', isCorrect: false }],
      } as any
      component.localQuestion = 'Fill <input style="border-style:none none solid none" />'

      component.init()

      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
    })

    it('should handle richTextEditor path with choices > 1 inside iteration loop', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: {
          options: [
            { value: { body: 'opt1' } },
            { value: { body: 'opt2' } },
          ],
        },
        options: [{ optionId: '1', text: '', isCorrect: false }],
      } as any
      // iterationNumber > 0 and localQuestion has input style (not underscores)
      component.localQuestion = 'Fill <input style="border-style:none none solid none" />'

      component.init()

      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
    })

    it('should build selected option when questionAnswerHash value matches choice (line 254-255)', () => {
      mockPracticeService.questionAnswerHash = { value: { q1: 'opt1' } }
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: {
          options: [
            { value: { body: 'opt1' } },
            { value: { body: 'opt2' } },
          ],
        },
        options: [{ optionId: '1', text: '', isCorrect: false }],
      } as any
      component.localQuestion = 'Fill _______________'

      component.init()

      expect(component.localQuestion).toContain('selected')
    })

    it('should handle options.length === 0 with existing answer value (lines 286-292)', () => {
      mockPracticeService.questionAnswerHash = { value: { q1: 'hello' } }
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
        editorState: { options: [{ value: { body: 'hello' } }] },
      } as any
      component.localQuestion = 'Fill _______________'
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      mockElementRef.nativeElement.querySelector.mockReturnValue({ value: 'hello' })

      jest.useFakeTimers()
      component.init()
      jest.runAllTimers()
      jest.useRealTimers()

      expect(component.localQuestion).toContain('value="hello"')
    })

    it('should handle non-ftb question type (else branch)', () => {
      component.question = {
        questionId: 'q1',
        questionType: 'mcq',
        question: 'MCQ question',
        choices: { options: [] },
        options: [],
      } as any
      component.localQuestion = 'MCQ question <input matInput>'

      component.init()

      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
    })

    it('should push correctOption and unTouchedBlank for PRACTICE_RESOURCE with editorState', () => {
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________ and _______________',
        choices: { options: [] },
        options: [{ optionId: '1', text: '', isCorrect: false }],
        editorState: {
          options: [
            { value: { body: 'ans1' } },
            { value: { body: 'ans2' } },
          ],
        },
      } as any
      component.localQuestion = 'Fill _______________ and _______________'

      component.init()

      expect(component.correctOption.length).toBe(2)
      expect(component.unTouchedBlank.length).toBe(2)
    })
  })

  // ─── functionChangeBlankBorder ────────────────────────────────────────────

  describe('functionChangeBlankBorder', () => {
    beforeEach(() => {
      component.question = {
        questionId: 'q1',
        questionType: 'ftb',
        question: 'Fill _______________',
        choices: { options: [] },
        options: [],
      } as any
      component.showAns = true
      component.localQuestion = 'Fill _______________'
      component.correctOption = [true]
      component.unTouchedBlank = [false]
    })

    it('should set green border for correct and touched blank', () => {
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)

      component.functionChangeBlankBorder()

      expect(mockEl.setAttribute).toHaveBeenCalledWith(
        'style',
        expect.stringContaining('#357a38')
      )
    })

    it('should set red border for incorrect and touched blank', () => {
      component.correctOption = [false]
      component.unTouchedBlank = [false]
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)

      component.functionChangeBlankBorder()

      expect(mockEl.setAttribute).toHaveBeenCalledWith(
        'style',
        expect.stringContaining('#f44336')
      )
    })

    it('should set default border for untouched blank', () => {
      component.correctOption = [false]
      component.unTouchedBlank = [true]
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)

      component.functionChangeBlankBorder()

      expect(mockEl.setAttribute).toHaveBeenCalledWith(
        'style',
        expect.stringContaining('border-style: solid !important')
      )
    })

    it('should not apply borders when showAns is false', () => {
      component.showAns = false
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)

      component.functionChangeBlankBorder()

      expect(mockEl.setAttribute).not.toHaveBeenCalled()
    })

    it('should detect blank count from input style attribute pattern', () => {
      component.localQuestion = 'Fill <input style="border-style:none none solid none" />'
      component.correctOption = [true]
      component.unTouchedBlank = [false]
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)

      component.functionChangeBlankBorder()

      expect(mockEl.setAttribute).toHaveBeenCalled()
    })

    it('should detect blank count from select" pattern', () => {
      component.localQuestion = 'Fill <select" id="q10">'
      component.correctOption = [true]
      component.unTouchedBlank = [false]
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)

      component.functionChangeBlankBorder()

      expect(mockEl.setAttribute).toHaveBeenCalled()
    })

    it('should do nothing when questionType is not ftb', () => {
      component.question = {
        ...component.question,
        questionType: 'mcq',
      } as any
      const mockEl = buildMockInput()
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockEl)

      component.functionChangeBlankBorder()

      expect(mockEl.setAttribute).not.toHaveBeenCalled()
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call shCorrectAnswer(false) and unsubscribe on destroy', () => {
      const mockSubscription = { unsubscribe: jest.fn() }
      component.shCorrectAnsSubscription = mockSubscription as any

      component.ngOnDestroy()

      expect(mockPracticeService.shCorrectAnswer).toHaveBeenCalledWith(false)
      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when shCorrectAnsSubscription is null', () => {
      component.shCorrectAnsSubscription = null

      expect(() => component.ngOnDestroy()).not.toThrow()
      expect(mockPracticeService.shCorrectAnswer).toHaveBeenCalledWith(false)
    })
  })

  // ─── correctAns getter ────────────────────────────────────────────────────

  describe('correctAns getter', () => {
    it('should return joined correct answers', () => {
      component.question = {
        editorState: {
          options: [
            { value: { body: 'ans1' } },
            { value: { body: 'ans2' } },
          ],
        },
      } as any

      expect(component.correctAns).toBe('ans1,ans2')
    })

    it('should return empty string when editorState is undefined', () => {
      component.question = { editorState: undefined } as any
      expect(component.correctAns).toBe('')
    })

    it('should return empty string when editorState.options is missing', () => {
      component.question = { editorState: {} } as any
      expect(component.correctAns).toBe('')
    })
  })

  // ─── getSanitizeString ────────────────────────────────────────────────────

  describe('getSanitizeString', () => {
    it('should replace &gt; and &nbsp; entities in string input', () => {
      const result = component.getSanitizeString('&lt;test&gt; hello&nbsp;world')
      expect(result).toBe('&lt;test> hello world')
    })

    it('should return non-string input as is', () => {
      const input = { test: 'value' }
      expect(component.getSanitizeString(input)).toBe(input)
    })

    it('should return null as is', () => {
      expect(component.getSanitizeString(null)).toBeNull()
    })

    it('should return undefined as is', () => {
      expect(component.getSanitizeString(undefined)).toBeUndefined()
    })
  })
})
