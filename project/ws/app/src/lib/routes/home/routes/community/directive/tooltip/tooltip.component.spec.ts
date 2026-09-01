import { TooltipComponent } from './tooltip.component'

describe('TooltipComponent', () => {
  let component: TooltipComponent
  let elementRefMock: any
  let changeDetectorRefMock: any

  // Mock for window properties
  const originalWindow = { ...window }

  beforeEach(() => {
    // Mock ElementRef with a simple nativeElement that has style
    elementRefMock = {
      nativeElement: {
        style: {
          top: '',
          left: ''
        },
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 100,
          height: 50,
          top: 0,
          left: 0,
          right: 100,
          bottom: 50
        })
      }
    }

    // Mock ChangeDetectorRef
    changeDetectorRefMock = {
      detectChanges: jest.fn()
    }

    // Initialize component with mocks
    component = new TooltipComponent(elementRefMock, changeDetectorRefMock)

    // Default window size for tests
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
  })

  afterEach(() => {
    // Restore original window properties
    Object.defineProperty(window, 'innerWidth', { value: originalWindow.innerWidth })
    Object.defineProperty(window, 'innerHeight', { value: originalWindow.innerHeight })
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default values', () => {
    expect(component.content).toBe('')
    expect(component.position).toBe('top')
    expect(component.opacity).toBe(0)
  })

  describe('setPosition', () => {
    // Host element mock
    let hostElMock: any

    beforeEach(() => {
      // Create mock host element
      hostElMock = {
        nativeElement: {
          getBoundingClientRect: jest.fn().mockReturnValue({
            width: 200,
            height: 100,
            top: 200,
            left: 300,
            right: 500,
            bottom: 300
          })
        }
      }
    })

    it('should position tooltip on top', () => {
      // Set position to 'top' (default)
      component.position = 'top'

      // Call setPosition
      component.setPosition(hostElMock)

      // Tooltip should be positioned above the host element
      expect(elementRefMock.nativeElement.style.top).toBe('140px') // 200 (host top) - 50 (tooltip height) - 10 (spacing)
      expect(elementRefMock.nativeElement.style.left).toBe('350px') // 300 (host left) + (200 (host width) - 100 (tooltip width)) / 2
      expect(component.opacity).toBe(1)
      expect(changeDetectorRefMock.detectChanges).toHaveBeenCalled()
    })

    it('should position tooltip on bottom', () => {
      // Set position to 'bottom'
      component.position = 'bottom'

      // Call setPosition
      component.setPosition(hostElMock)

      // Tooltip should be positioned below the host element
      expect(elementRefMock.nativeElement.style.top).toBe('310px') // 300 (host bottom) + 10 (spacing)
      expect(elementRefMock.nativeElement.style.left).toBe('350px') // 300 (host left) + (200 (host width) - 100 (tooltip width)) / 2
      expect(component.opacity).toBe(1)
    })

    it('should position tooltip on left', () => {
      // Set position to 'left'
      component.position = 'left'

      // Call setPosition
      component.setPosition(hostElMock)

      // Tooltip should be positioned to the left of the host element
      expect(elementRefMock.nativeElement.style.top).toBe('225px') // 200 (host top) + (100 (host height) - 50 (tooltip height)) / 2
      expect(elementRefMock.nativeElement.style.left).toBe('190px') // 300 (host left) - 100 (tooltip width) - 10 (spacing)
      expect(component.opacity).toBe(1)
    })

    it('should position tooltip on right', () => {
      // Set position to 'right'
      component.position = 'right'

      // Call setPosition
      component.setPosition(hostElMock)

      // Tooltip should be positioned to the right of the host element
      expect(elementRefMock.nativeElement.style.top).toBe('225px') // 200 (host top) + (100 (host height) - 50 (tooltip height)) / 2
      expect(elementRefMock.nativeElement.style.left).toBe('510px') // 500 (host right) + 10 (spacing)
      expect(component.opacity).toBe(1)
    })

    it('should adjust position to stay within viewport (left edge)', () => {
      // Position that would go beyond left edge
      hostElMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 50,
        height: 50,
        top: 100,
        left: 10, // Close to left edge
        right: 60,
        bottom: 150
      })

      // Tooltip that would go beyond left edge
      elementRefMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 200,
        height: 50,
        top: 0,
        left: 0,
        right: 200,
        bottom: 50
      })

      component.position = 'left'
      component.setPosition(hostElMock)

      // Should be adjusted to stay within viewport
      expect(elementRefMock.nativeElement.style.left).toBe('0px') // Adjusted to left edge
    })

    it('should adjust position to stay within viewport (right edge)', () => {
      // Position that would go beyond right edge
      hostElMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 50,
        height: 50,
        top: 100,
        left: 900, // Close to right edge with 1024px window width
        right: 950,
        bottom: 150
      })

      // Tooltip that would go beyond right edge
      elementRefMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 200,
        height: 50,
        top: 0,
        left: 0,
        right: 200,
        bottom: 50
      })

      component.position = 'right'
      component.setPosition(hostElMock)

      // Should be adjusted to stay within viewport
      expect(elementRefMock.nativeElement.style.left).toBe('824px') // 1024 (window width) - 200 (tooltip width)
    })

    it('should adjust position to stay within viewport (top edge)', () => {
      // Position that would go beyond top edge
      hostElMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 50,
        height: 50,
        top: 20, // Close to top edge
        left: 100,
        right: 150,
        bottom: 70
      })

      // Tooltip that would go beyond top edge
      elementRefMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 100,
        height: 80,
        top: 0,
        left: 0,
        right: 100,
        bottom: 80
      })

      component.position = 'top'
      component.setPosition(hostElMock)

      // Should be adjusted to stay within viewport
      expect(elementRefMock.nativeElement.style.top).toBe('0px') // Adjusted to top edge
    })

    it('should adjust position to stay within viewport (bottom edge)', () => {
      // Position that would go beyond bottom edge
      hostElMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 50,
        height: 50,
        top: 700, // Close to bottom edge with 768px window height
        left: 100,
        right: 150,
        bottom: 750
      })

      // Tooltip that would go beyond bottom edge
      elementRefMock.nativeElement.getBoundingClientRect.mockReturnValue({
        width: 100,
        height: 80,
        top: 0,
        left: 0,
        right: 100,
        bottom: 80
      })

      component.position = 'bottom'
      component.setPosition(hostElMock)

      // Should be adjusted to stay within viewport
      expect(elementRefMock.nativeElement.style.top).toBe('688px') // 768 (window height) - 80 (tooltip height)
    })
  })
})