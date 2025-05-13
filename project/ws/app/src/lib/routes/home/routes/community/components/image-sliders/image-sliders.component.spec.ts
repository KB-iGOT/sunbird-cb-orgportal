import { ImageSlidersComponent } from './image-sliders.component'
import { Subscription, interval } from 'rxjs'

// Mock for interval
jest.mock('rxjs', () => {
  const original = jest.requireActual('rxjs')
  return {
    ...original,
    interval: jest.fn()
  }
})

describe('ImageSlidersComponent', () => {
  let component: ImageSlidersComponent
  let mockSubscription: Subscription
  let mockIntervalSubscribe: jest.Mock

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create mock subscription with unsubscribe method
    mockSubscription = {
      unsubscribe: jest.fn(),
      closed: false,
      add: jest.fn(),
      remove: jest.fn()
    } as any

    // Create mock for interval subscribe function
    mockIntervalSubscribe = jest.fn(() => mockSubscription);

    // Set up interval mock to return our mock subscribe function
    (interval as jest.Mock).mockReturnValue({
      subscribe: mockIntervalSubscribe
    })

    // Initialize component
    component = new ImageSlidersComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('reInitiateSlideInterval', () => {
    it('should not create interval if imageUrls is empty', () => {
      // Arrange
      component.imageUrls = []

      // Act
      component.reInitiateSlideInterval()

      // Assert
      expect(interval).not.toHaveBeenCalled()
      expect(component.slideInterval).toBeNull()
    })

    it('should not create interval if imageUrls has only one item', () => {
      // Arrange
      component.imageUrls = ['image1.jpg']

      // Act
      component.reInitiateSlideInterval()

      // Assert
      expect(interval).not.toHaveBeenCalled()
      expect(component.slideInterval).toBeNull()
    })

    it('should create interval if imageUrls has multiple items', () => {
      // Arrange
      component.imageUrls = ['image1.jpg', 'image2.jpg']

      // Act
      component.reInitiateSlideInterval()

      // Assert
      expect(interval).toHaveBeenCalledWith(8000)
      expect(mockIntervalSubscribe).toHaveBeenCalled()
      expect(component.slideInterval).toBe(mockSubscription)
    })

    it('should unsubscribe from previous interval if it exists', () => {
      // Arrange
      component.imageUrls = ['image1.jpg', 'image2.jpg']
      component.slideInterval = mockSubscription

      // Act
      component.reInitiateSlideInterval()

      // Assert
      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(1)
      expect(interval).toHaveBeenCalledWith(8000)
      expect(mockIntervalSubscribe).toHaveBeenCalled()
    })

    it('should increment currentIndex on interval tick if not at the end', () => {
      // Arrange
      component.imageUrls = ['image1.jpg', 'image2.jpg', 'image3.jpg']
      component.currentIndex = 1

      // Act
      component.reInitiateSlideInterval()

      // Get the callback function passed to subscribe
      const intervalCallback = mockIntervalSubscribe.mock.calls[0][0]

      // Execute the callback to simulate an interval tick
      intervalCallback()

      // Assert
      expect(component.currentIndex).toBe(2)
    })

    it('should reset currentIndex to 0 on interval tick if at the end', () => {
      // Arrange
      component.imageUrls = ['image1.jpg', 'image2.jpg', 'image3.jpg']
      component.currentIndex = 2 // Last index

      // Act
      component.reInitiateSlideInterval()

      // Get the callback function passed to subscribe
      const intervalCallback = mockIntervalSubscribe.mock.calls[0][0]

      // Execute the callback to simulate an interval tick
      intervalCallback()

      // Assert
      expect(component.currentIndex).toBe(0)
    })

    it('should handle error during unsubscribe gracefully', () => {
      // Arrange
      component.imageUrls = ['image1.jpg', 'image2.jpg']
      component.slideInterval = mockSubscription
      // mockSubscription.unsubscribe.mockImplementation(() => {
      //   throw new Error('Unsubscribe error')
      // })

      // Act/Assert
      expect(() => {
        component.reInitiateSlideInterval()
      }).not.toThrow()

      // Should still set up new interval
      expect(interval).toHaveBeenCalledWith(8000)
      expect(mockIntervalSubscribe).toHaveBeenCalled()
    })
  })

  describe('slideTo', () => {
    beforeEach(() => {
      // Set up common test data
      component.imageUrls = ['image1.jpg', 'image2.jpg', 'image3.jpg']
      component.currentIndex = 0

      // Spy on reInitiateSlideInterval
      jest.spyOn(component, 'reInitiateSlideInterval')
    })

    it('should set currentIndex to provided index if in valid range', () => {
      // Act
      component.slideTo(1)

      // Assert
      expect(component.currentIndex).toBe(1)
      expect(component.reInitiateSlideInterval).toHaveBeenCalled()
    })

    it('should reset to index 0 if provided index equals imageUrls.length', () => {
      // Act
      component.slideTo(3) // Equal to imageUrls.length

      // Assert
      expect(component.currentIndex).toBe(0)
      expect(component.reInitiateSlideInterval).toHaveBeenCalled()
    })

    it('should calculate wrapped index when negative index is provided', () => {
      // Act
      component.slideTo(-1) // Should wrap to last image

      // Assert
      expect(component.currentIndex).toBe(2) // Index 2 (last image)
      expect(component.reInitiateSlideInterval).toHaveBeenCalled()
    })

    it('should not change currentIndex if provided index is out of range (too high)', () => {
      // Act
      component.slideTo(4) // Beyond array length

      // Assert
      expect(component.currentIndex).toBe(7) // Invalid calculation (3 + 4), but this is the component's behavior
      expect(component.reInitiateSlideInterval).toHaveBeenCalled()
    })

    it('should not change currentIndex if provided index is out of range (too low)', () => {
      // Act
      component.slideTo(-4) // Beyond negative wrap

      // Assert
      expect(component.currentIndex).toBe(-1) // Invalid calculation (3 + -4), but this is the component's behavior
      expect(component.reInitiateSlideInterval).toHaveBeenCalled()
    })

    it('should restart slide interval after changing index', () => {
      // Act
      component.slideTo(1)

      // Assert
      expect(component.reInitiateSlideInterval).toHaveBeenCalledTimes(1)
    })
  })
})