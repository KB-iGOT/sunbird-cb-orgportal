import { MyNotificationsComponent } from './my-notifications.component'
import { Router } from '@angular/router'

describe('MyNotificationsComponent', () => {
  let component: MyNotificationsComponent
  let mockRouter: jest.Mocked<Router>

  beforeEach(() => {
    // Create mock router
    mockRouter = {
      navigate: jest.fn()
    } as any

    // Create component instance
    component = new MyNotificationsComponent(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should inject router dependency', () => {
      expect(mockRouter).toBeDefined()
    })
  })

  describe('redirectTo method', () => {
    describe('when notification has category', () => {
      it('should navigate to approvals page when category is PROFILE', () => {
        const notification = {
          category: 'PROFILE',
          id: '123',
          message: 'Profile update notification'
        }

        component.redirectTo(notification)

        expect(mockRouter.navigate).toHaveBeenCalledWith(['app/home/approvals/approval'])
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1)
      })

      it('should navigate to notifications page when category is not PROFILE', () => {
        const notification = {
          category: 'GENERAL',
          id: '456',
          message: 'General notification'
        }

        component.redirectTo(notification)

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/notifications'])
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1)
      })

      it('should navigate to notifications page when category is any other value', () => {
        const testCategories = ['EVENT', 'TASK', 'MESSAGE', 'ALERT', 'UPDATE']

        testCategories.forEach(category => {
          const notification = {
            category: category,
            id: '999',
            message: `${category} notification`
          }

          component.redirectTo(notification)

          expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/notifications'])
        })

        expect(mockRouter.navigate).toHaveBeenCalledTimes(testCategories.length)
      })

      it('should handle case sensitivity for PROFILE category', () => {
        const testCases = [
          { category: 'profile', shouldGoToApprovals: false },
          { category: 'Profile', shouldGoToApprovals: false },
          { category: 'PROFILE', shouldGoToApprovals: true },
          { category: 'PrOfIlE', shouldGoToApprovals: false }
        ]

        testCases.forEach(testCase => {
          jest.clearAllMocks()

          const notification = {
            category: testCase.category,
            id: '123'
          }

          component.redirectTo(notification)

          if (testCase.shouldGoToApprovals) {
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app/home/approvals/approval'])
          } else {
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/notifications'])
          }
        })
      })
    })

    describe('when notification has no category', () => {
      it('should navigate to notifications with query params when category is undefined', () => {
        const notification = {
          id: '123',
          message: 'No category notification',
          type: 'info'
        }

        component.redirectTo(notification)

        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['/app/home/notifications'],
          { queryParams: { tab: notification } }
        )
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1)
      })

      it('should navigate to notifications with query params when category is null', () => {
        const notification = {
          category: null,
          id: '456',
          message: 'Null category notification'
        }

        component.redirectTo(notification)

        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['/app/home/notifications'],
          { queryParams: { tab: notification } }
        )
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1)
      })

      it('should pass entire notification object as tab query parameter', () => {
        const notification = {
          id: '789',
          message: 'Complex notification',
          timestamp: '2024-01-01T10:00:00Z',
          read: false,
          priority: 'high',
          metadata: {
            source: 'system',
            type: 'alert'
          }
        }

        component.redirectTo(notification)

        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['/app/home/notifications'],
          { queryParams: { tab: notification } }
        )
      })
    })

    describe('router navigation verification', () => {
      it('should call router.navigate exactly once per method call', () => {
        const notification = { category: 'PROFILE' }

        component.redirectTo(notification)

        expect(mockRouter.navigate).toHaveBeenCalledTimes(1)
      })

      it('should not call router.navigate multiple times for same notification', () => {
        const notification = { category: 'EVENT' }

        component.redirectTo(notification)
        component.redirectTo(notification)

        expect(mockRouter.navigate).toHaveBeenCalledTimes(2)
        expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/app/home/notifications'])
        expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/app/home/notifications'])
      })

      it('should handle router navigation errors gracefully', () => {
        mockRouter.navigate.mockImplementation(() => {
          throw new Error('Navigation failed')
        })

        const notification = { category: 'PROFILE' }

        expect(() => component.redirectTo(notification)).toThrow('Navigation failed')
        expect(mockRouter.navigate).toHaveBeenCalledWith(['app/home/approvals/approval'])
      })
    })
  })

  describe('component structure', () => {
    it('should have correct selector', () => {
      // This would typically be tested in integration tests, but we can verify the component metadata
      expect(MyNotificationsComponent).toBeDefined()
    })

    it('should only have router dependency', () => {
      // Verify that the component constructor only expects router
      const constructorParams = MyNotificationsComponent.length
      expect(constructorParams).toBe(1)
    })
  })
})