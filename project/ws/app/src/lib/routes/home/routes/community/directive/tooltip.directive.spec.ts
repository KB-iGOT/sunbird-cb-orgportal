import { TooltipDirective } from './tooltip.directive'
import { TooltipComponent } from './tooltip/tooltip.component'
import { ElementRef, ViewContainerRef, NgZone, ComponentRef } from '@angular/core'

describe('TooltipDirective', () => {
  let directive: TooltipDirective
  let mockElementRef: ElementRef
  let mockViewContainerRef: ViewContainerRef
  let mockNgZone: NgZone
  let mockComponentRef: ComponentRef<TooltipComponent>
  let mockTooltipInstance: TooltipComponent

  beforeEach(() => {
    mockTooltipInstance = {
      content: '',
      position: 'top',
      setPosition: jest.fn()
    } as unknown as TooltipComponent

    mockComponentRef = {
      instance: mockTooltipInstance,
      destroy: jest.fn()
    } as unknown as ComponentRef<TooltipComponent>

    mockElementRef = {
      nativeElement: document.createElement('div')
    } as ElementRef

    mockViewContainerRef = {
      createComponent: jest.fn().mockReturnValue(mockComponentRef)
    } as unknown as ViewContainerRef

    mockNgZone = {
      run: jest.fn(callback => callback())
    } as unknown as NgZone

    directive = new TooltipDirective(
      mockElementRef,
      mockViewContainerRef,
      mockNgZone
    )

    directive.content = 'Test tooltip content'
    directive.position = 'top'

    jest.useFakeTimers()
    // Ensure requestAnimationFrame is mocked
    global.requestAnimationFrame = jest.fn(cb => { cb(0); return 0 })
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should create an instance', () => {
    expect(directive).toBeTruthy()
  })

  it('should have default input properties', () => {
    expect(directive.content).toBe('Test tooltip content')
    expect(directive.position).toBe('top')
  })

  describe('onMouseEnter', () => {
    it('should create tooltip component when tooltipRef is null', () => {
      directive['tooltipRef'] = null

      directive.onMouseEnter()
      jest.advanceTimersByTime(100)

      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(TooltipComponent)
      expect(mockTooltipInstance.content).toBe('Test tooltip content')
      expect(mockTooltipInstance.position).toBe('top')
    })

    it('should not create multiple tooltips if already exists', () => {
      directive['tooltipRef'] = mockComponentRef

      directive.onMouseEnter()
      jest.advanceTimersByTime(100)

      expect(mockViewContainerRef.createComponent).not.toHaveBeenCalled()
    })

    it('should clear hide timeout on mouse enter', () => {
      directive['hideTimeout'] = setTimeout(() => { }, 1000)
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')

      directive.onMouseEnter()

      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['hideTimeout'])
    })

    it('should call ngZone.run', () => {
      directive.onMouseEnter()
      expect(mockNgZone.run).toHaveBeenCalled()
    })
  })

  describe('onMouseLeave', () => {
    it('should destroy tooltip after delay', () => {
      directive['tooltipRef'] = mockComponentRef

      directive.onMouseLeave()

      expect(mockNgZone.run).toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(mockComponentRef.destroy).toHaveBeenCalled()
      expect(directive['tooltipRef']).toBeNull()
    })

    it('should clear show timeout on mouse leave', () => {
      directive['showTimeout'] = setTimeout(() => { }, 1000)
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')

      directive.onMouseLeave()

      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['showTimeout'])
    })

    it('should not throw when tooltipRef is null on leave', () => {
      directive['tooltipRef'] = null
      directive.onMouseLeave()
      jest.advanceTimersByTime(100)
      expect(directive['tooltipRef']).toBeNull()
    })
  })

  describe('destroyTooltip', () => {
    it('should destroy tooltip if it exists', () => {
      directive['tooltipRef'] = mockComponentRef

      directive['destroyTooltip']()

      expect(mockComponentRef.destroy).toHaveBeenCalled()
      expect(directive['tooltipRef']).toBeNull()
    })

    it('should do nothing if tooltip does not exist', () => {
      directive['tooltipRef'] = null

      directive['destroyTooltip']()

      expect(directive['tooltipRef']).toBeNull()
    })
  })

  describe('ngOnDestroy', () => {
    it('should clean up all resources', () => {
      directive['showTimeout'] = setTimeout(() => { }, 1000)
      directive['hideTimeout'] = setTimeout(() => { }, 1000)
      directive['tooltipRef'] = mockComponentRef

      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')
      const destroyTooltipSpy = jest.spyOn(directive as any, 'destroyTooltip')

      directive.ngOnDestroy()

      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['showTimeout'])
      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['hideTimeout'])
      expect(destroyTooltipSpy).toHaveBeenCalled()
    })

    it('should not throw when tooltipRef is null on destroy', () => {
      directive['tooltipRef'] = null
      expect(() => directive.ngOnDestroy()).not.toThrow()
    })
  })
})


describe('TooltipDirective', () => {
  let directive: TooltipDirective
  let mockElementRef: ElementRef
  let mockViewContainerRef: ViewContainerRef
  let mockNgZone: NgZone
  let mockComponentRef: ComponentRef<TooltipComponent>
  let mockTooltipInstance: TooltipComponent

  beforeEach(() => {
    // Create mock for TooltipComponent
    mockTooltipInstance = {
      content: '',
      position: 'top',
      setPosition: jest.fn()
    } as unknown as TooltipComponent

    // Create mock for ComponentRef
    mockComponentRef = {
      instance: mockTooltipInstance,
      destroy: jest.fn()
    } as unknown as ComponentRef<TooltipComponent>

    // Create mocks for ElementRef, ViewContainerRef, and NgZone
    mockElementRef = {
      nativeElement: document.createElement('div')
    } as ElementRef

    mockViewContainerRef = {
      createComponent: jest.fn().mockReturnValue(mockComponentRef)
    } as unknown as ViewContainerRef

    mockNgZone = {
      run: jest.fn(callback => callback())
    } as unknown as NgZone

    // Create directive instance with mocks
    directive = new TooltipDirective(
      mockElementRef,
      mockViewContainerRef,
      mockNgZone
    )

    // Set input properties
    directive.content = 'Test tooltip content'
    directive.position = 'top'

    // Mock timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should create an instance', () => {
    expect(directive).toBeTruthy()
  })

  describe('onMouseEnter', () => {


    it('should not create multiple tooltips if already exists', () => {
      // Simulate existing tooltip
      directive['tooltipRef'] = mockComponentRef

      // Trigger mouse enter
      directive.onMouseEnter()

      // Fast-forward timer
      jest.advanceTimersByTime(100)

      // Should not create a new component
      expect(mockViewContainerRef.createComponent).not.toHaveBeenCalled()
    })

    it('should clear hide timeout on mouse enter', () => {
      // Set a fake hide timeout
      directive['hideTimeout'] = setTimeout(() => { }, 1000)

      // Spy on clearTimeout
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')

      // Trigger mouse enter
      directive.onMouseEnter()

      // Verify previous timeout was cleared
      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['hideTimeout'])
    })
  })

  describe('onMouseLeave', () => {
    it('should destroy tooltip after delay', () => {
      // Simulate existing tooltip
      directive['tooltipRef'] = mockComponentRef

      // Trigger mouse leave
      directive.onMouseLeave()

      // Verify NgZone.run was called
      expect(mockNgZone.run).toHaveBeenCalled()

      // Fast-forward timer
      jest.advanceTimersByTime(100)

      // Verify tooltip was destroyed
      expect(mockComponentRef.destroy).toHaveBeenCalled()
      expect(directive['tooltipRef']).toBeNull()
    })

    it('should clear show timeout on mouse leave', () => {
      // Set a fake show timeout
      directive['showTimeout'] = setTimeout(() => { }, 1000)

      // Spy on clearTimeout
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')

      // Trigger mouse leave
      directive.onMouseLeave()

      // Verify previous timeout was cleared
      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['showTimeout'])
    })
  })

  describe('destroyTooltip', () => {
    it('should destroy tooltip if it exists', () => {
      // Simulate existing tooltip
      directive['tooltipRef'] = mockComponentRef

      // Call destroyTooltip
      directive['destroyTooltip']()

      // Verify tooltip was destroyed
      expect(mockComponentRef.destroy).toHaveBeenCalled()
      expect(directive['tooltipRef']).toBeNull()
    })

    it('should do nothing if tooltip does not exist', () => {
      // Ensure tooltip is null
      directive['tooltipRef'] = null

      // Call destroyTooltip
      directive['destroyTooltip']()

      // No error should be thrown
      expect(directive['tooltipRef']).toBeNull()
    })
  })

  describe('ngOnDestroy', () => {
    it('should clean up all resources', () => {
      // Set fake timeouts
      directive['showTimeout'] = setTimeout(() => { }, 1000)
      directive['hideTimeout'] = setTimeout(() => { }, 1000)

      // Simulate existing tooltip
      directive['tooltipRef'] = mockComponentRef

      // Spy on clearTimeout and destroyTooltip
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')
      const destroyTooltipSpy = jest.spyOn(directive as any, 'destroyTooltip')

      // Call ngOnDestroy
      directive.ngOnDestroy()

      // Verify timeouts were cleared
      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['showTimeout'])
      expect(clearTimeoutSpy).toHaveBeenCalledWith(directive['hideTimeout'])

      // Verify tooltip was destroyed
      expect(destroyTooltipSpy).toHaveBeenCalled()
    })
  })
})