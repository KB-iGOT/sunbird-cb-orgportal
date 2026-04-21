import { SimpleChange, SimpleChanges } from '@angular/core'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { BehaviorSubject } from 'rxjs'
import { QuestionComponent } from './question.component'
import { PracticeService } from '../../practice.service'
import { NSPractice } from '../../practice.model'

describe('QuestionComponent', () => {
  let component: QuestionComponent
  let practiceServiceMock: jest.Mocked<PracticeService>
  let snackBarMock: jest.Mocked<MatSnackBar>

  beforeEach(() => {
    // Mock PracticeService
    practiceServiceMock = {
      questionAnswerHash: new BehaviorSubject<any>({}),
      shCorrectAnswer: jest.fn(),
    } as any

    // Mock MatSnackBar
    snackBarMock = {
      open: jest.fn(),
    } as any

    // Create component instance
    component = new QuestionComponent(
      practiceServiceMock,
      snackBarMock
    )

    // Set default window inner width
    global.innerWidth = 1920
  })

  describe('ngOnInit', () => {
    it('should set isMobile to true when window width is <= 1200', () => {
      global.innerWidth = 1000
      component.ngOnInit()
      expect(component.isMobile).toBe(true)
    })

    it('should set isMobile to false when window width is > 1200', () => {
      global.innerWidth = 1920
      component.ngOnInit()
      expect(component.isMobile).toBe(false)
    })
  })

  describe('init', () => {
    it('should replace image URLs with artifactUrl when present', () => {
      component.artifactUrl = 'https://example.com/artifacts/test.jpg'
      component.question = {
        ...component.question,
        question: '<img src="/images/question.jpg">',
      }

      component.init()

      expect(component.question.question).toContain('https://example.com/artifacts/images/question.jpg')
    })

    it('should subscribe to questionAnswerHash', () => {
      const mockAnswerHash = {
        'question123': ['answer1', 'answer2']
      }
      component.question.questionId = 'question123'

      practiceServiceMock.questionAnswerHash.next(mockAnswerHash)
      component.init()

      expect(component.itemSelectedList1).toEqual(['answer1', 'answer2'])
    })
  })

  describe('ngOnChanges', () => {
    it('should call init when questionNumber changes', () => {
      const initSpy = jest.spyOn(component, 'init')
      const changes: SimpleChanges = {
        questionNumber: new SimpleChange(1, 2, false)
      }

      component.ngOnChanges(changes)

      expect(initSpy).toHaveBeenCalled()
    })

    it('should call init when itemSelectedList changes', () => {
      const initSpy = jest.spyOn(component, 'init')
      const changes: SimpleChanges = {
        itemSelectedList: new SimpleChange([], ['option1'], false)
      }

      component.ngOnChanges(changes)

      expect(initSpy).toHaveBeenCalled()
    })
  })

  describe('isSelected', () => {
    it('should return true when option is in itemSelectedList', () => {
      component.itemSelectedList = ['option1', 'option2']
      const option: NSPractice.IOption = {
        optionId: 'option1',
        text: 'Option 1',
        isCorrect: false
      }

      expect(component.isSelected(option)).toBe(true)
    })

    it('should return false when option is not in itemSelectedList', () => {
      component.itemSelectedList = ['option1', 'option2']
      const option: NSPractice.IOption = {
        optionId: 'option3',
        text: 'Option 3',
        isCorrect: false
      }

      expect(component.isSelected(option)).toBe(false)
    })
  })

  describe('markQuestion', () => {
    it('should add question to markedQuestions if not already marked', () => {
      component.question.questionId = 'question123'
      component.markedQuestions = new Set()
      component.selectedAssessmentCompatibilityLevel = 6

      component.markQuestion()

      expect(component.markedQuestions.has('question123')).toBe(true)
    })

    it('should remove question from markedQuestions if already marked', () => {
      component.question.questionId = 'question123'
      component.markedQuestions = new Set(['question123'])

      component.markQuestion()

      expect(component.markedQuestions.has('question123')).toBe(false)
    })

    it('should emit getNextQuestion when compatibility level >= 7', () => {
      component.question.questionId = 'question123'
      component.selectedAssessmentCompatibilityLevel = 7
      const emitSpy = jest.spyOn(component.getNextQuestion, 'emit')

      component.markQuestion()

      expect(emitSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('checkAns', () => {


    it('should show answer when conditions are met', () => {
      component.itemSelectedList = ['answer1']
      component.totalQCount = 5
      component.currentQuestion = {
        editorState: {
          options: ['option1', 'option2']
        }
      }

      component.checkAns(1)

      expect(component.showAnswer).toBe(true)
      expect(practiceServiceMock.shCorrectAnswer).toHaveBeenCalledWith(true)
    })
  })

  describe('openSnackbar', () => {
    it('should configure snackbar for mobile view', () => {
      global.innerWidth = 1000
      component['openSnackbar']('Test message')

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Test message',
        '',
        expect.objectContaining({
          verticalPosition: 'top',
          horizontalPosition: 'center'
        })
      )
    })

    it('should configure snackbar for desktop view', () => {
      global.innerWidth = 1920
      component['openSnackbar']('Test message')

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Test message',
        '',
        expect.objectContaining({
          panelClass: ['show-answer-alert-class']
        })
      )
    })
  })

  describe('update', () => {
    it('should emit itemSelected event', () => {
      const emitSpy = jest.spyOn(component.itemSelected, 'emit')
      const event = { value: 'test' }

      component.update(event)

      expect(emitSpy).toHaveBeenCalledWith(event)
    })
  })

  describe('clearResponse', () => {
    it('should emit clearQuestion event', () => {
      const emitSpy = jest.spyOn(component.clearQuestion, 'emit')

      component.clearResponse()

      expect(emitSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('setBorderColorById', () => {
    it('should set border color of element when element exists', () => {
      const mockElement = document.createElement('div')
      mockElement.id = 'testElement'
      document.body.appendChild(mockElement)

      component.setBorderColorById('testElement', 'red')

      expect(mockElement.style.borderColor).toBe('red')
      document.body.removeChild(mockElement)
    })

    it('should not throw error when element does not exist', () => {
      expect(() => {
        component.setBorderColorById('nonexistentElement', 'red')
      }).not.toThrow()
    })
  })
})