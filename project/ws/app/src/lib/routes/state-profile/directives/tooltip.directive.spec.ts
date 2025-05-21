// comp-tooltip.directive.spec.ts
import { CompTooltipDirective } from './tooltip.directive' // Update import path as needed
import {
  Renderer2,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef
} from '@angular/core'

describe('CompTooltipDirective', () => {
  let directive: CompTooltipDirective

  // Mock dependencies
  let mockRenderer: jest.Mocked<Renderer2>
  let mockElementRef: jest.Mocked<ElementRef>
  let mockViewContainerRef: jest.Mocked<ViewContainerRef>
  let mockTemplateRef: jest.Mocked<TemplateRef<any>>
  let mockEmbeddedViewRef: jest.Mocked<EmbeddedViewRef<any>>

  beforeEach(() => {
    // Create mocks for all dependencies
    mockRenderer = {
      appendChild: jest.fn(),
      setStyle: jest.fn(),
      // Add other required methods from Renderer2 that might be used
      createElement: jest.fn(),
      createText: jest.fn(),
      listen: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn(),
      setProperty: jest.fn(),
      setValue: jest.fn(),
      removeStyle: jest.fn(),
      removeChild: jest.fn(),
      insertBefore: jest.fn(),
      selectRootElement: jest.fn(),
      parentNode: jest.fn(),
      nextSibling: jest.fn(),
      destroyNode: jest.fn(),
      createComment: jest.fn(),
      data: {},
    } as unknown as jest.Mocked<Renderer2>

    mockElementRef = {
      nativeElement: {
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100,
          bottom: 150,
          left: 50,
          right: 150,
          width: 100,
          height: 50
        })
      }
    } as unknown as jest.Mocked<ElementRef>

    mockTemplateRef = {
      elementRef: {
        nativeElement: {
          getBoundingClientRect: jest.fn().mockReturnValue({
            width: 80,
            height: 30
          })
        }
      },
      createEmbeddedView: jest.fn()
    } as unknown as jest.Mocked<TemplateRef<any>>

    mockEmbeddedViewRef = {
      rootNodes: [document.createElement('div'), document.createElement('span')],
      detectChanges: jest.fn(),
      destroy: jest.fn()
    } as unknown as jest.Mocked<EmbeddedViewRef<any>>

    mockViewContainerRef = {
      createEmbeddedView: jest.fn().mockReturnValue(mockEmbeddedViewRef),
      clear: jest.fn()
    } as unknown as jest.Mocked<ViewContainerRef>

    // Instantiate the directive with mocked dependencies
    directive = new CompTooltipDirective(
      mockRenderer,
      mockElementRef,
      mockViewContainerRef
    )

    // Set the required input properties
    directive.parametroPlantilla = mockTemplateRef
    directive.placement = 'top';

    // Set the content child
    (directive as any).tooltipTemplateRef = mockTemplateRef
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create an instance', () => {
    expect(directive).toBeTruthy()
  })

  it('should default to "top" placement', () => {
    // Create a new directive without setting placement
    const newDirective = new CompTooltipDirective(
      mockRenderer,
      mockElementRef,
      mockViewContainerRef
    )

    expect(newDirective.placement).toBe('top')
  })

  describe('onMouseEnter', () => {
    it('should create embedded view and append nodes on mouse enter', () => {
      // Act
      directive.onMouseEnter()

      // Assert
      expect(mockViewContainerRef.createEmbeddedView).toHaveBeenCalledWith(mockTemplateRef)
      expect(mockRenderer.appendChild).toHaveBeenCalledTimes(2) // Once for each root node
      expect(mockRenderer.appendChild).toHaveBeenCalledWith(
        mockElementRef.nativeElement,
        mockEmbeddedViewRef.rootNodes[0]
      )
      expect(mockRenderer.appendChild).toHaveBeenCalledWith(
        mockElementRef.nativeElement,
        mockEmbeddedViewRef.rootNodes[1]
      )
    })
  })

  describe('onMouseLeave', () => {
    it('should clear view container on mouse leave', () => {
      // Act
      directive.onMouseLeave()

      // Assert
      expect(mockViewContainerRef.clear).toHaveBeenCalled()
    })
  })

  describe('setPosition', () => {
    beforeEach(() => {
      // Mock window.pageYOffset and document.documentElement.scrollTop
      Object.defineProperty(window, 'pageYOffset', { value: 10, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, configurable: true })
      Object.defineProperty(document.body, 'scrollTop', { value: 0, configurable: true })
    })

    it('should set position for "top" placement', () => {
      // Arrange
      directive.placement = 'top'

      // Act
      directive.setPosition()

      // Assert
      expect(mockRenderer.setStyle).toHaveBeenCalledTimes(2)
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'top',
        '70px' // 100 (top) - 30 (height) - 10 (offset) + 10 (scrollPos) = 70
      )
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'left',
        '60px' // 50 (left) + (100 (width) - 80 (tooltip width)) / 2 = 60
      )
    })

    it('should set position for "bottom" placement', () => {
      // Arrange
      directive.placement = 'bottom'

      // Act
      directive.setPosition()

      // Assert
      expect(mockRenderer.setStyle).toHaveBeenCalledTimes(2)
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'top',
        '170px' // 150 (bottom) + 10 (offset) + 10 (scrollPos) = 170
      )
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'left',
        '60px' // 50 (left) + (100 (width) - 80 (tooltip width)) / 2 = 60
      )
    })

    it('should set position for "left" placement', () => {
      // Arrange
      directive.placement = 'left'

      // Act
      directive.setPosition()

      // Assert
      expect(mockRenderer.setStyle).toHaveBeenCalledTimes(2)
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'top',
        '120px' // 100 (top) + (50 (height) - 30 (tooltip height)) / 2 + 10 (scrollPos) = 120
      )
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'left',
        '-40px' // 50 (left) - 80 (tooltip width) - 10 (offset) = -40
      )
    })

    it('should set position for "right" placement', () => {
      // Arrange
      directive.placement = 'right'

      // Act
      directive.setPosition()

      // Assert
      expect(mockRenderer.setStyle).toHaveBeenCalledTimes(2)
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'top',
        '120px' // 100 (top) + (50 (height) - 30 (tooltip height)) / 2 + 10 (scrollPos) = 120
      )
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'left',
        '160px' // 150 (right) + 10 (offset) = 160
      )
    })

    it('should handle scroll position correctly', () => {
      // Arrange
      Object.defineProperty(window, 'pageYOffset', { value: 50, configurable: true })
      directive.placement = 'top'

      // Act
      directive.setPosition()

      // Assert
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockTemplateRef,
        'top',
        '110px' // 100 (top) - 30 (height) - 10 (offset) + 50 (scrollPos) = 110
      )
    })
  })

  // Additional tests for edge cases

  it('should handle null viewContainerRef during mouseleave', () => {
    // Arrange
    (directive as any).viewContainerRef = null

    // Act & Assert - should not throw error
    expect(() => {
      directive.onMouseLeave()
    }).not.toThrow()
  })

  it('should handle missing tooltipTemplateRef', () => {
    // Arrange
    (directive as any).tooltipTemplateRef = null

    // Act & Assert - should not throw error when calling methods that use tooltipTemplateRef
    expect(() => {
      directive.onMouseEnter()
    }).not.toThrow()
  })
})