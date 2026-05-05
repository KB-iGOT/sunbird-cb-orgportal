import { ClassDiagramComponent } from './class-diagram.component'
import { DomSanitizer } from '@angular/platform-browser'
import { ClassDiagramService } from './class-diagram.service'
import { ElementRef, Renderer2 } from '@angular/core'
import { of, throwError } from 'rxjs'

jest.mock('jsplumb', () => ({
  jsPlumb: {
    getInstance: () => ({
      registerConnectionType: jest.fn(),
      draggable: jest.fn(),
      batch: jest.fn(),
      bind: jest.fn(),
      select: jest.fn(() => ({
        each: jest.fn(),
        delete: jest.fn(),
      })),
      deleteEveryConnection: jest.fn(),
      makeSource: jest.fn(),
      makeTarget: jest.fn(),
      deleteConnection: jest.fn(),
    }),
  },
}))

describe('ClassDiagramComponent', () => {
  let component: ClassDiagramComponent
  let mockDomSanitizer: jest.Mocked<DomSanitizer>
  let mockRenderer: jest.Mocked<Renderer2>
  let mockClassDiagramService: jest.Mocked<ClassDiagramService>
  let mockElementRef: ElementRef

  const mockClassDiagram = {
    problemStatement: '<p>Create a class diagram</p>',
    timeLimit: 30,
    options: {
      classes: [
        { name: 'Class1', type: 'class' },
        { name: 'Class2', type: 'class' },
      ],
    },
  }

  beforeEach(() => {
    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn(html => html),
    } as any

    mockRenderer = {
      listen: jest.fn(),
      createElement: jest.fn(),
      appendChild: jest.fn(),
    } as any

    mockClassDiagramService = {
      submitClassDiagram: jest.fn(),
    } as any

    mockElementRef = {
      nativeElement: document.createElement('div'),
    }

    component = new ClassDiagramComponent(
      mockDomSanitizer,
      mockRenderer,
      mockClassDiagramService
    )

    component.classDiagramContainer = mockElementRef
    component.classDiagram = mockClassDiagram
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should set up event listeners', () => {
      expect(mockRenderer.listen).toHaveBeenCalledTimes(3)
      expect(mockRenderer.listen).toHaveBeenCalledWith(
        mockElementRef.nativeElement,
        'dragover',
        expect.any(Function)
      )
      expect(mockRenderer.listen).toHaveBeenCalledWith(
        mockElementRef.nativeElement,
        'drop',
        expect.any(Function)
      )
      expect(mockRenderer.listen).toHaveBeenCalledWith(
        mockElementRef.nativeElement,
        'click',
        expect.any(Function)
      )
    })
  })

  describe('initializeClassDiagram', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnChanges()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should initialize class diagram data', () => {
      expect(component.clsDiagramData).toBeDefined()
      expect(component.clsDiagramData?.timeLimit).toBe(30000)
      expect(component.classOptions.length).toBe(2)
    })



    it('should submit when timer expires', () => {
      const submitSpy = jest.spyOn(component, 'submit')
      jest.advanceTimersByTime(31000)
      expect(submitSpy).toHaveBeenCalled()
    })
  })



  describe('submission handling', () => {
    beforeEach(() => {
      // Mock DOM elements and jsPlumb instance
      document.getElementsByClassName = jest.fn().mockReturnValue([{
        getElementsByClassName: jest.fn().mockReturnValue([{
          getAttribute: jest.fn().mockReturnValue('1'),
          classList: { length: 1 },
        }]),
      }])
    })

    it('should handle successful submission', () => {

      mockClassDiagramService.submitClassDiagram.mockReturnValue(of())

      component.submit()

      expect(component.isSubmitted).toBeTruthy()
      expect(component.result).toBeNull
      expect(component.error).toBeFalsy()
    })

    it('should handle submission error', () => {
      mockClassDiagramService.submitClassDiagram.mockReturnValue(throwError('Error'))

      component.submit()

      expect(component.error).toBeTruthy()
      expect(component.isDisabled).toBeFalsy()
    })
  })

  describe('reset', () => {
    beforeEach(() => {
      component.reset()
    })

    it('should reset component state', () => {
      expect(component.selectedAccess).toBe('public')
      expect(component.selectedRelation).toBe('is-a')
      expect(component.userOptions.classes).toEqual([])
      expect(component.userOptions.relations).toEqual([])
      expect(component.result).toBeNull()
      expect(component.isSubmitted).toBeFalsy()
      expect(component.isDisabled).toBeFalsy()
      expect(component.error).toBeFalsy()
    })
  })

  describe('drag and drop handling', () => {
    it('should handle drag event', () => {
      const mockEvent = {
        dataTransfer: {
          setData: jest.fn(),
        },
        target: {
          textContent: 'TestClass',
        },
      }

      component.drag(mockEvent)

      expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith('text', 'TestClass')
    })

    it('should handle drop event for class name', () => {
      const mockEvent = {
        dataTransfer: {
          getData: jest.fn().mockReturnValue('testclass'),
        },
        target: {
          id: 'cls1',
        },
        preventDefault: jest.fn(),
      }

      document.getElementById = jest.fn().mockReturnValue({
        innerHTML: '',
      })

      component.drop(mockEvent)

      expect(document.getElementById).toHaveBeenCalledWith('cls1')
    })
  })

})