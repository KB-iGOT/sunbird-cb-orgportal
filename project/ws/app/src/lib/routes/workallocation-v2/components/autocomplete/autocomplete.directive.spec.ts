import { AutocompleteDirective, overlayClickOutside } from './autocomplete.directive'
import { ElementRef, ViewContainerRef } from '@angular/core'
import { NgControl } from '@angular/forms'
import { Overlay, OverlayRef, ConnectionPositionPair } from '@angular/cdk/overlay'
import { AutocompleteComponent } from './autocomplete/autocomplete.component'
import { TemplatePortal } from '@angular/cdk/portal'
import { of, Subject } from 'rxjs'

// Mock dependencies
const mockElementRef = {
  nativeElement: {
    offsetWidth: 200,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }
} as any as ElementRef<HTMLInputElement>

const mockNgControl = {
  control: {
    setValue: jest.fn(),
    value: 'test value'
  }
} as any as NgControl

const mockViewContainerRef = {} as ViewContainerRef

const mockOverlayRef = {
  attach: jest.fn(),
  detach: jest.fn(),
  detachments: jest.fn(() => new Subject()),
  overlayElement: {
    contains: jest.fn(() => false)
  }
} as any as OverlayRef

const mockPositionStrategy = {
  flexibleConnectedTo: jest.fn().mockReturnThis(),
  withPositions: jest.fn().mockReturnThis(),
  withFlexibleDimensions: jest.fn().mockReturnThis(),
  withPush: jest.fn().mockReturnThis()
}

const mockScrollStrategies = {
  reposition: jest.fn(() => ({}))
}

const mockOverlay = {
  create: jest.fn(() => mockOverlayRef),
  position: jest.fn(() => mockPositionStrategy),
  scrollStrategies: mockScrollStrategies
} as any as Overlay

const mockAutocompleteComponent = {
  rootTemplate: {},
  optionsClick: jest.fn(() => of('selected value'))
} as any as AutocompleteComponent

// Mock fromEvent
jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
  fromEvent: jest.fn()
}))

import { fromEvent } from 'rxjs'
const mockFromEvent = fromEvent as jest.MockedFunction<typeof fromEvent>

describe('AutocompleteDirective', () => {
  let directive: AutocompleteDirective
  let mockFocusSubject: Subject<any>
  let mockClickSubject: Subject<MouseEvent>

  beforeEach(() => {
    jest.clearAllMocks()

    mockFocusSubject = new Subject()
    mockClickSubject = new Subject()

    // Setup fromEvent mock to return different subjects based on event type
    mockFromEvent.mockImplementation((_target: any, eventName: string) => {
      if (eventName === 'focus') {
        return mockFocusSubject.asObservable()
      } else if (eventName === 'click') {
        return mockClickSubject.asObservable()
      }
      return of()
    })

    directive = new AutocompleteDirective(
      mockElementRef,
      mockNgControl,
      mockViewContainerRef,
      mockOverlay
    )

    directive.wsAppAutocomplete = mockAutocompleteComponent
  })

  afterEach(() => {
    mockFocusSubject.complete()
    mockClickSubject.complete()
  })

  describe('Constructor and Initialization', () => {
    it('should create directive instance', () => {
      expect(directive).toBeTruthy()
    })

    it('should initialize with correct dependencies', () => {
      expect(directive['host']).toBe(mockElementRef)
      expect(directive['ngControl']).toBe(mockNgControl)
      expect(directive['vcr']).toBe(mockViewContainerRef)
      expect(directive['overlay']).toBe(mockOverlay)
    })
  })

  describe('Getters', () => {
    it('should return control from ngControl', () => {
      expect(directive.control).toBe(mockNgControl.control)
    })

    it('should return native element as origin', () => {
      expect(directive.origin).toBe(mockElementRef.nativeElement)
    })
  })

  describe('ngOnInit', () => {
    it('should set up focus event listener', () => {
      directive.ngOnInit()

      expect(mockFromEvent).toHaveBeenCalledWith(mockElementRef.nativeElement, 'focus')
    })

    it('should open dropdown on focus after debounce', (done) => {
      const openDropdownSpy = jest.spyOn(directive, 'openDropdown')

      directive.ngOnInit()

      // Trigger focus event
      mockFocusSubject.next({})

      // Wait for debounce time + a bit more
      setTimeout(() => {
        expect(openDropdownSpy).toHaveBeenCalled()
        done()
      }, 1100)
    })

    it('should subscribe to optionsClick when overlay exists', (done) => {
      const openDropdownSpy = jest.spyOn(directive, 'openDropdown')
      const closeSpy = jest.spyOn(directive as any, 'close')

      directive.ngOnInit()

      // Trigger focus event
      mockFocusSubject.next({})

      setTimeout(() => {
        expect(openDropdownSpy).toHaveBeenCalled()
        expect(mockAutocompleteComponent.optionsClick).toHaveBeenCalled()

        // Simulate option selection
        mockAutocompleteComponent.optionsClick().subscribe(() => {
          // expect(mockNgControl.control.setValue).toHaveBeenCalledWith('selected value')
          expect(closeSpy).toHaveBeenCalled()
          done()
        })
      }, 1100)
    })
  })

  describe('openDropdown', () => {
    it('should close existing overlay before creating new one', () => {
      const closeSpy = jest.spyOn(directive as any, 'close')
      directive['overlayRef'] = mockOverlayRef

      directive.openDropdown()

      expect(closeSpy).toHaveBeenCalled()
    })

    it('should create overlay with correct configuration', () => {
      directive.openDropdown()

      expect(mockOverlay.create).toHaveBeenCalledWith({
        width: 200,
        maxHeight: 120, // 40 * 3
        backdropClass: '',
        scrollStrategy: {},
        positionStrategy: mockPositionStrategy
      })
    })

    it('should attach template portal to overlay', () => {
      directive.openDropdown()

      expect(mockOverlayRef.attach).toHaveBeenCalledWith(
        expect.any(TemplatePortal)
      )
    })

    it('should set up click outside subscription', () => {
      directive.openDropdown()

      expect(mockFromEvent).toHaveBeenCalledWith(document, 'click')
    })
  })

  describe('close', () => {
    it('should detach overlay if it exists', () => {
      directive['overlayRef'] = mockOverlayRef

      directive['close']()

      expect(mockOverlayRef.detach).toHaveBeenCalled()
      expect(directive['overlayRef']).toBeNull()
    })

    it('should not throw error if overlay does not exist', () => {
      directive['overlayRef'] = null

      expect(() => directive['close']()).not.toThrow()
    })
  })

  describe('getOverlayPosition', () => {
    it('should create position strategy with correct configuration', () => {
      const result = directive['getOverlayPosition']()

      expect(mockOverlay.position).toHaveBeenCalled()
      expect(mockPositionStrategy.flexibleConnectedTo).toHaveBeenCalledWith(mockElementRef.nativeElement)
      expect(mockPositionStrategy.withPositions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(ConnectionPositionPair),
          expect.any(ConnectionPositionPair)
        ])
      )
      expect(mockPositionStrategy.withFlexibleDimensions).toHaveBeenCalledWith(false)
      expect(mockPositionStrategy.withPush).toHaveBeenCalledWith(false)
      expect(result).toBe(mockPositionStrategy)
    })

    it('should create correct connection position pairs', () => {
      directive['getOverlayPosition']()

      const positionsCall = mockPositionStrategy.withPositions.mock.calls[0][0]
      expect(positionsCall).toHaveLength(2)

      // First position (bottom)
      expect(positionsCall[0].originX).toBe('start')
      expect(positionsCall[0].originY).toBe('bottom')
      expect(positionsCall[0].overlayX).toBe('start')
      expect(positionsCall[0].overlayY).toBe('top')

      // Second position (top)
      expect(positionsCall[1].originX).toBe('start')
      expect(positionsCall[1].originY).toBe('top')
      expect(positionsCall[1].overlayX).toBe('start')
      expect(positionsCall[1].overlayY).toBe('bottom')
    })
  })

  describe('ngOnDestroy', () => {
    it('should exist and not throw error', () => {
      expect(() => directive.ngOnDestroy()).not.toThrow()
    })
  })
})

describe('overlayClickOutside', () => {
  let mockOverlayRef: OverlayRef
  let mockOrigin: HTMLElement
  let mockClickSubject: Subject<MouseEvent>

  beforeEach(() => {
    jest.clearAllMocks()

    mockClickSubject = new Subject()
    mockFromEvent.mockReturnValue(mockClickSubject.asObservable())

    mockOverlayRef = {
      overlayElement: {
        contains: jest.fn(() => false)
      },
      detachments: jest.fn(() => new Subject())
    } as any as OverlayRef

    mockOrigin = document.createElement('input')
  })

  afterEach(() => {
    mockClickSubject.complete()
  })

  it('should create observable for document click events', () => {
    overlayClickOutside(mockOverlayRef, mockOrigin)

    expect(mockFromEvent).toHaveBeenCalledWith(document, 'click')
  })

  it('should filter clicks on origin element', (done) => {
    const observable = overlayClickOutside(mockOverlayRef, mockOrigin)
    let eventEmitted = false

    observable.subscribe(() => {
      eventEmitted = true
    })

    // Create click event on origin
    const clickEvent = new MouseEvent('click')
    Object.defineProperty(clickEvent, 'target', { value: mockOrigin })

    mockClickSubject.next(clickEvent)

    setTimeout(() => {
      expect(eventEmitted).toBe(false)
      done()
    }, 10)
  })

  it('should filter clicks on overlay element', (done) => {
    const overlayElement = document.createElement('div')
    mockOverlayRef.overlayElement.contains = jest.fn(() => true)

    const observable = overlayClickOutside(mockOverlayRef, mockOrigin)
    let eventEmitted = false

    observable.subscribe(() => {
      eventEmitted = true
    })

    // Create click event on overlay
    const clickEvent = new MouseEvent('click')
    Object.defineProperty(clickEvent, 'target', { value: overlayElement })

    mockClickSubject.next(clickEvent)

    setTimeout(() => {
      expect(eventEmitted).toBe(false)
      done()
    }, 10)
  })

  it('should emit for clicks outside origin and overlay', (done) => {
    const outsideElement = document.createElement('div')

    const observable = overlayClickOutside(mockOverlayRef, mockOrigin)

    observable.subscribe((event) => {
      expect(event.target).toBe(outsideElement)
      done()
    })

    // Create click event outside
    const clickEvent = new MouseEvent('click')
    Object.defineProperty(clickEvent, 'target', { value: outsideElement })

    mockClickSubject.next(clickEvent)
  })

  it('should complete when overlay detaches', () => {
    const detachSubject = new Subject()
    //  mockOverlayRef.detachments = jest.fn(() => detachSubject)

    const observable = overlayClickOutside(mockOverlayRef, mockOrigin)
    const completeSpy = jest.fn()

    observable.subscribe({
      complete: completeSpy
    })

    detachSubject.next()
    detachSubject.complete()

    expect(completeSpy).toHaveBeenCalled()
  })
})