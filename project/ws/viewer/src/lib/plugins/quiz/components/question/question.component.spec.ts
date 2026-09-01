import { QuestionComponent } from './question.component'

jest.mock('jsplumb', () => {
  const mockInstance = {
    bind: jest.fn(),
    getAllConnections: jest.fn().mockReturnValue([]),
    batch: jest.fn((cb: any) => cb()),
    makeSource: jest.fn(),
    makeTarget: jest.fn(),
    repaintEverything: jest.fn(),
    deleteEveryConnection: jest.fn(),
    connect: jest.fn(),
    getSelector: jest.fn().mockReturnValue([{ innerText: 'Match A' }]),
  }
  return {
    jsPlumb: {
      getInstance: jest.fn().mockReturnValue(mockInstance),
    },
  }
})

function makeQuestion(overrides: any = {}): any {
  return {
    multiSelection: false,
    question: '<p>Test question</p>',
    instructions: '',
    section: '',
    questionType: undefined,
    questionId: 'q1',
    options: [
      { optionId: 'op1', text: 'Option A', isCorrect: true },
      { optionId: 'op2', text: 'Option B', isCorrect: false },
    ],
    ...overrides,
  }
}

describe('QuestionComponent', () => {
  let component: QuestionComponent
  let mockDomSanitizer: any
  let mockElementRef: any
  let mockQueryResult: any
  let mockJsPlumbInstance: any

  beforeEach(() => {
    // Retrieve the shared jsPlumb mock instance
    const jsPlumbMod = require('jsplumb')
    mockJsPlumbInstance = jsPlumbMod.jsPlumb.getInstance()

    jest.clearAllMocks()
    // Restore default behaviors after clearAllMocks
    mockJsPlumbInstance.batch.mockImplementation((cb: any) => cb())
    mockJsPlumbInstance.getAllConnections.mockReturnValue([])
    mockJsPlumbInstance.getSelector.mockReturnValue([{ innerText: 'Match A' }])
    jsPlumbMod.jsPlumb.getInstance.mockReturnValue(mockJsPlumbInstance)

    mockDomSanitizer = { bypassSecurityTrustHtml: jest.fn().mockReturnValue('safe-html') }
    mockQueryResult = { setAttribute: jest.fn(), addEventListener: jest.fn(), value: '' }
    mockElementRef = { nativeElement: { querySelector: jest.fn().mockReturnValue(mockQueryResult) } }

    component = new QuestionComponent(mockDomSanitizer, mockElementRef)
    component.question = makeQuestion()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ngOnInit – basic question
  describe('ngOnInit – basic question', () => {
    it('should run without errors for a plain question', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should replace img src when question contains img tag', () => {
      component.artifactUrl = 'https://cdn.example.com/content/index.html'
      component.question = makeQuestion({
        question: '<img src="/content/img/picture.png">',
      })
      component.ngOnInit()
      expect(component.question.question).toContain('src="https://cdn.example.com')
    })
  })

  // ngOnInit – fitb
  describe('ngOnInit – fitb', () => {
    it('should replace <input> markers and call bypassSecurityTrustHtml', () => {
      component.question = makeQuestion({
        questionType: 'fitb',
        question: '<p>Fill <input type="text"> here</p>',
        questionId: 'q2',
        options: [{ optionId: 'o1', text: 'answer', isCorrect: true }],
      })
      component.ngOnInit()
      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
      expect(component.correctOption.length).toBe(1)
      expect(component.unTouchedBlank.length).toBe(1)
    })

    it('should push false to correctOption for each input', () => {
      component.question = makeQuestion({
        questionType: 'fitb',
        question: '<p><input> and <input></p>',
        questionId: 'q2',
        options: [
          { optionId: 'o1', text: 'a', isCorrect: true },
          { optionId: 'o2', text: 'b', isCorrect: true },
        ],
      })
      component.ngOnInit()
      expect(component.correctOption).toEqual([false, false])
      expect(component.unTouchedBlank).toEqual([true, true])
    })
  })

  // ngOnInit – mtf
  describe('ngOnInit – mtf', () => {
    it('should populate matchHintDisplay for options with hint', () => {
      component.question = makeQuestion({
        questionType: 'mtf',
        options: [
          { optionId: 'o1', text: 'Q1', match: 'A', hint: 'hint1' },
          { optionId: 'o2', text: 'Q2', match: 'B' },
        ],
      })
      component.ngOnInit()
      expect(component.matchHintDisplay.length).toBe(1)
      expect(component.matchHintDisplay[0].hint).toBe('hint1')
    })

    it('should shuffle match options on mtf init', () => {
      component.question = makeQuestion({
        questionType: 'mtf',
        options: [
          { optionId: 'o1', text: 'Q1', match: 'A' },
          { optionId: 'o2', text: 'Q2', match: 'B' },
        ],
      })
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  // ngAfterViewInit – mtf
  describe('ngAfterViewInit – mtf', () => {
    it('should create a jsPlumb instance and bind events', () => {
      const { jsPlumb } = require('jsplumb')
      component.question = makeQuestion({ questionType: 'mtf' })
      component.ngAfterViewInit()
      expect(jsPlumb.getInstance).toHaveBeenCalled()
      expect(mockJsPlumbInstance.bind).toHaveBeenCalledWith('connection', expect.any(Function))
      expect(mockJsPlumbInstance.bind).toHaveBeenCalledWith('connectionDetached', expect.any(Function))
      expect(mockJsPlumbInstance.bind).toHaveBeenCalledWith('connectionMoved', expect.any(Function))
    })

    it('should emit itemSelected on connection event', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      const emitSpy = jest.spyOn(component.itemSelected, 'emit')
      component.ngAfterViewInit()
      const connectionCb = mockJsPlumbInstance.bind.mock.calls.find((c: any) => c[0] === 'connection')[1]
      connectionCb({}, {})
      expect(emitSpy).toHaveBeenCalled()
    })

    it('should handle connectionDetached without throwing', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      component.ngAfterViewInit()
      const detachCb = mockJsPlumbInstance.bind.mock.calls.find((c: any) => c[0] === 'connectionDetached')[1]
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => detachCb({ sourceId: 's1', targetId: 't1' }, {})).not.toThrow()
    })

    it('should handle connectionMoved without throwing', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      component.ngAfterViewInit()
      const movedCb = mockJsPlumbInstance.bind.mock.calls.find((c: any) => c[0] === 'connectionMoved')[1]
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => movedCb({ originalSourceId: 'a', newSourceId: 'b', originalTargetId: 'c' }, {})).not.toThrow()
    })

    it('should call makeSource and makeTarget in batch', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      component.ngAfterViewInit()
      expect(mockJsPlumbInstance.makeSource).toHaveBeenCalled()
      expect(mockJsPlumbInstance.makeTarget).toHaveBeenCalled()
    })
  })

  // ngAfterViewInit – fitb
  describe('ngAfterViewInit – fitb', () => {
    it('should attach change listeners for each input in fitb', () => {
      component.question = makeQuestion({
        questionType: 'fitb',
        question: '<p><input id="q10"> and <input id="q11"></p>',
        questionId: 'q1',
        options: [
          { optionId: 'o1', text: 'a', isCorrect: true },
          { optionId: 'o2', text: 'b', isCorrect: true },
        ],
      })
      component.ngAfterViewInit()
      expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalled()
      expect(mockQueryResult.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  // ngAfterViewInit – no type
  describe('ngAfterViewInit – no type', () => {
    it('should not call jsPlumb or addEventListener for plain question', () => {
      component.question = makeQuestion({ questionType: undefined })
      component.ngAfterViewInit()
      expect(mockJsPlumbInstance.bind).not.toHaveBeenCalled()
    })
  })

  // numConnections
  describe('numConnections', () => {
    it('should return 0 when jsPlumbInstance is not set', () => {
      expect(component.numConnections).toBe(0)
    })

    it('should return length of connections from jsPlumbInstance', () => {
      component.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([{}, {}]) }
      expect(component.numConnections).toBe(2)
    })
  })

  // isSelected
  describe('isSelected', () => {
    it('should return true when option is in itemSelectedList', () => {
      component.itemSelectedList = ['op1', 'op2']
      expect(component.isSelected(component.question.options[0])).toBe(true)
    })

    it('should return false when option is not in itemSelectedList', () => {
      component.itemSelectedList = ['op2']
      expect(component.isSelected(component.question.options[0])).toBe(false)
    })

    it('should return false when itemSelectedList is empty', () => {
      component.itemSelectedList = []
      expect(component.isSelected(component.question.options[0])).toBe(false)
    })
  })

  // isQuestionMarked
  describe('isQuestionMarked', () => {
    it('should return false when question is not marked', () => {
      expect(component.isQuestionMarked()).toBe(false)
    })

    it('should return true when question is marked', () => {
      component.markedQuestions.add('q1')
      expect(component.isQuestionMarked()).toBe(true)
    })
  })

  // markQuestion
  describe('markQuestion', () => {
    it('should mark question when not marked', () => {
      component.markQuestion()
      expect(component.markedQuestions.has('q1')).toBe(true)
    })

    it('should unmark question when already marked', () => {
      component.markedQuestions.add('q1')
      component.markQuestion()
      expect(component.markedQuestions.has('q1')).toBe(false)
    })
  })

  // onChange
  describe('onChange', () => {
    it('should call onEntryInBlank with the id', () => {
      const spy = jest.spyOn(component, 'onEntryInBlank').mockImplementation(() => { })
      component.onChange('q10', {})
      expect(spy).toHaveBeenCalledWith('q10')
    })
  })

  // onEntryInBlank
  describe('onEntryInBlank', () => {
    it('should emit joined blank values', () => {
      component.question = makeQuestion({
        questionType: 'fitb',
        question: '<input id="q10">',
        questionId: 'q1',
        options: [{ optionId: 'o1', text: 'answer', isCorrect: true }],
      })
      const mockInput = { value: 'answer' } as HTMLInputElement
      mockElementRef.nativeElement.querySelector.mockReturnValue(mockInput)
      jest.spyOn(document, 'getElementById').mockReturnValue(mockInput)
      component.correctOption = [false]
      component.unTouchedBlank = [true]
      const emitSpy = jest.spyOn(component.itemSelected, 'emit')
      component.onEntryInBlank('q10')
      expect(emitSpy).toHaveBeenCalledWith('answer')
    })
  })

  // setBorderColorById
  describe('setBorderColorById', () => {
    it('should set borderColor when element and color are provided', () => {
      const el = { style: { borderColor: '' } } as any
      jest.spyOn(document, 'getElementById').mockReturnValue(el)
      component.setBorderColorById('some-id', '#ff0000')
      expect(el.style.borderColor).toBe('#ff0000')
    })

    it('should not throw when element is null', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.setBorderColorById('none', '#ff0000')).not.toThrow()
    })

    it('should not set borderColor when color is null', () => {
      const el = { style: { borderColor: '' } } as any
      jest.spyOn(document, 'getElementById').mockReturnValue(el)
      component.setBorderColorById('some-id', null)
      expect(el.style.borderColor).toBe('')
    })
  })

  // setBorderColor
  describe('setBorderColor', () => {
    it('should set borderColor on source and target elements', () => {
      const srcEl = { style: { borderColor: '' } } as any
      const tgtEl = { style: { borderColor: '' } } as any
      jest.spyOn(document, 'getElementById')
        .mockReturnValueOnce(srcEl)
        .mockReturnValueOnce(tgtEl)
      component.setBorderColor({ sourceId: 'src', targetId: 'tgt' } as any, '#00ff00')
      expect(srcEl.style.borderColor).toBe('#00ff00')
      expect(tgtEl.style.borderColor).toBe('#00ff00')
    })

    it('should handle null source and target elements', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.setBorderColor({ sourceId: 's', targetId: 't' } as any, '')).not.toThrow()
    })
  })

  // onResize
  describe('onResize', () => {
    it('should call repaintEverything when mtf', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      component.jsPlumbInstance = { repaintEverything: jest.fn() }
      component.onResize({})
      expect(component.jsPlumbInstance.repaintEverything).toHaveBeenCalled()
    })

    it('should not throw when question type is not mtf', () => {
      component.question = makeQuestion({ questionType: 'fitb' })
      expect(() => component.onResize({})).not.toThrow()
    })
  })

  // repaintEveryThing
  describe('repaintEveryThing', () => {
    it('should call repaintEverything when mtf', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      component.jsPlumbInstance = { repaintEverything: jest.fn() }
      component.repaintEveryThing()
      expect(component.jsPlumbInstance.repaintEverything).toHaveBeenCalled()
    })

    it('should not throw when question type is not mtf', () => {
      component.question = makeQuestion({ questionType: undefined })
      expect(() => component.repaintEveryThing()).not.toThrow()
    })
  })

  // ifFillInTheBlankCorrect
  describe('ifFillInTheBlankCorrect', () => {
    beforeEach(() => {
      component.question = makeQuestion({
        questionType: 'fitb',
        questionId: 'q1',
        options: [{ optionId: 'o1', text: 'Answer', isCorrect: true }],
      })
      component.correctOption = [false]
      component.unTouchedBlank = [true]
    })

    it('should set correctOption true when answer matches', () => {
      const input = { value: 'answer' } as HTMLInputElement
      jest.spyOn(document, 'getElementById').mockReturnValue(input)
        ; (component as any).ifFillInTheBlankCorrect('q10')
      expect(component.correctOption[0]).toBe(true)
    })

    it('should set correctOption false when answer does not match', () => {
      const input = { value: 'wrong' } as HTMLInputElement
      jest.spyOn(document, 'getElementById').mockReturnValue(input)
        ; (component as any).ifFillInTheBlankCorrect('q10')
      expect(component.correctOption[0]).toBe(false)
    })

    it('should set unTouchedBlank true when value is empty', () => {
      const input = { value: '' } as HTMLInputElement
      jest.spyOn(document, 'getElementById').mockReturnValue(input)
        ; (component as any).ifFillInTheBlankCorrect('q10')
      expect(component.unTouchedBlank[0]).toBe(true)
    })

    it('should set unTouchedBlank false when value is not empty', () => {
      const input = { value: 'something' } as HTMLInputElement
      jest.spyOn(document, 'getElementById').mockReturnValue(input)
        ; (component as any).ifFillInTheBlankCorrect('q10')
      expect(component.unTouchedBlank[0]).toBe(false)
    })
  })

  // shuffle
  describe('shuffle', () => {
    it('should return an array of the same length', () => {
      const arr = ['a', 'b', 'c', 'd']
      const result = (component as any).shuffle([...arr])
      expect(result.length).toBe(4)
    })

    it('should contain all original elements', () => {
      const arr = ['x', 'y', 'z']
      const result = (component as any).shuffle([...arr])
      expect(result.sort()).toEqual([...arr].sort())
    })

    it('should handle empty array', () => {
      expect((component as any).shuffle([])).toEqual([])
    })
  })

  // reset
  describe('reset', () => {
    it('should call resetBlankBorder when fitb', () => {
      component.question = makeQuestion({
        questionType: 'fitb',
        question: '<p><input></p>',
        questionId: 'q1',
      })
      const spy = jest.spyOn(component as any, 'resetBlankBorder').mockImplementation(() => { })
      component.reset()
      expect(spy).toHaveBeenCalled()
    })

    it('should call resetColor and resetMtf when mtf', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      component.jsPlumbInstance = {
        getAllConnections: jest.fn().mockReturnValue([]),
        deleteEveryConnection: jest.fn(),
      }
      component.reset()
      expect(component.jsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })
  })

  // resetMtf
  describe('resetMtf', () => {
    it('should call deleteEveryConnection when mtf', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      component.jsPlumbInstance = { deleteEveryConnection: jest.fn() }
      component.resetMtf()
      expect(component.jsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    })

    it('should not throw when question type is not mtf', () => {
      component.question = makeQuestion({ questionType: 'fitb' })
      expect(() => component.resetMtf()).not.toThrow()
    })
  })

  // resetColor
  describe('resetColor', () => {
    it('should call setPaintStyle on each connection', () => {
      const mockConn = { setPaintStyle: jest.fn() }
      component.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([mockConn]) }
      component.resetColor()
      expect(mockConn.setPaintStyle).toHaveBeenCalledWith({ stroke: 'rgba(0,0,0,0.5)' })
    })

    it('should handle empty connections array', () => {
      component.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([]) }
      expect(() => component.resetColor()).not.toThrow()
    })
  })

  // changeColor
  describe('changeColor', () => {
    it('should alert when not all options connected', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { })
      component.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([]) }
      component.changeColor()
      expect(alertSpy).toHaveBeenCalled()
    })

    it('should set green color when connection matches correct answer', () => {
      component.question = makeQuestion({
        questionType: 'mtf',
        options: [{ optionId: 'o1', text: 'Q1', match: 'Match A' }],
      })
      const mockTarget = { innerHTML: 'Match A' }
      const mockConn = { sourceId: 'c1q11', target: mockTarget, setPaintStyle: jest.fn() }
      component.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([mockConn]) }
      jest.spyOn(document, 'getElementById').mockReturnValue({ style: { borderColor: '' } } as any)
      component.changeColor()
      expect(mockConn.setPaintStyle).toHaveBeenCalledWith({ stroke: '#357a38' })
    })

    it('should set red color when connection does not match', () => {
      component.question = makeQuestion({
        questionType: 'mtf',
        options: [{ optionId: 'o1', text: 'Q1', match: 'Match A' }],
      })
      const mockTarget = { innerHTML: 'Wrong Answer' }
      const mockConn = { sourceId: 'c1q11', target: mockTarget, setPaintStyle: jest.fn() }
      component.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([mockConn]) }
      jest.spyOn(document, 'getElementById').mockReturnValue({ style: { borderColor: '' } } as any)
      component.changeColor()
      expect(mockConn.setPaintStyle).toHaveBeenCalledWith({ stroke: '#f44336' })
    })
  })

  // matchShowAnswer
  describe('matchShowAnswer', () => {
    it('should connect correct source-target pairs for mtf', () => {
      component.question = makeQuestion({
        questionType: 'mtf',
        questionId: 'q1',
        options: [{ optionId: 'o1', text: 'Q1', match: 'Match A' }],
      })
      const mockEl = [{ innerText: 'Match A' }]
      component.jsPlumbInstance = {
        deleteEveryConnection: jest.fn(),
        getSelector: jest.fn().mockReturnValue(mockEl),
        connect: jest.fn(),
        getAllConnections: jest.fn().mockReturnValue([]),
      }
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      component.matchShowAnswer()
      expect(component.jsPlumbInstance.connect).toHaveBeenCalled()
    })

    it('should not do anything when question type is not mtf', () => {
      component.question = makeQuestion({ questionType: 'fitb' })
      expect(() => component.matchShowAnswer()).not.toThrow()
    })
  })

  // functionChangeBlankBorder
  describe('functionChangeBlankBorder', () => {
    beforeEach(() => {
      component.question = makeQuestion({
        questionType: 'fitb',
        question: '<p><input></p>',
        questionId: 'q1',
      })
    })

    it('should set green border when correct and touched', () => {
      component.correctOption = [true]
      component.unTouchedBlank = [false]
        ; (component as any).functionChangeBlankBorder()
      expect(mockQueryResult.setAttribute).toHaveBeenCalledWith(
        'style', expect.stringContaining('#357a38')
      )
    })

    it('should set red border when incorrect and touched', () => {
      component.correctOption = [false]
      component.unTouchedBlank = [false]
        ; (component as any).functionChangeBlankBorder()
      expect(mockQueryResult.setAttribute).toHaveBeenCalledWith(
        'style', expect.stringContaining('#f44336')
      )
    })

    it('should set default border when untouched', () => {
      component.correctOption = [false]
      component.unTouchedBlank = [true]
        ; (component as any).functionChangeBlankBorder()
      expect(mockQueryResult.setAttribute).toHaveBeenCalledWith(
        'style', expect.stringContaining('border-style: none none solid none')
      )
    })

    it('should not throw when question type is not fitb', () => {
      component.question = makeQuestion({ questionType: 'mtf' })
      expect(() => (component as any).functionChangeBlankBorder()).not.toThrow()
    })
  })

  // resetBlankBorder
  describe('resetBlankBorder', () => {
    it('should reset border style on each blank', () => {
      component.question = makeQuestion({
        questionType: 'fitb',
        question: '<p><input></p>',
        questionId: 'q1',
      })
        ; (component as any).resetBlankBorder()
      expect(mockQueryResult.setAttribute).toHaveBeenCalledWith(
        'style',
        'border-style: none none solid none; border-width: 1px; padding: 8px 12px;'
      )
    })

    it('should handle question with no inputs gracefully', () => {
      component.question = makeQuestion({ question: '<p>No inputs here</p>' })
      expect(() => (component as any).resetBlankBorder()).not.toThrow()
    })
  })
})
