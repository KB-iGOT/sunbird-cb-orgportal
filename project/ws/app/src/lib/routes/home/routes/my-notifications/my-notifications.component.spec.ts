import { MyNotificationsComponent } from './my-notifications.component'
import { Router } from '@angular/router'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils'
import { NotificationsService } from '../../../../../../../../../src/app/services/notifications.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { environment } from '../../../../../../../../../src/environments/environment'

// Mock the environment import
jest.mock('../../../../../../../../../src/environments/environment', () => ({
  environment: {
    production: false,
    appName: 'test-app'
  }
}))

describe('MyNotificationsComponent', () => {
  let component: MyNotificationsComponent
  let mockRouter: jest.Mocked<Router>
  let mockEventService: jest.Mocked<EventService>
  let mockConfigService: jest.Mocked<ConfigurationsService>
  let mockNotificationsService: jest.Mocked<NotificationsService>
  let mockSnackBar: jest.Mocked<MatSnackBar>

  beforeEach(() => {
    // Create mocks for all dependencies
    mockRouter = {
      navigate: jest.fn()
    } as any

    mockEventService = {
      raiseInteractTelemetry: jest.fn()
    } as any

    mockConfigService = {
      unMappedUser: {
        roles: ['user', 'admin']
      }
    } as any

    mockNotificationsService = {
      handleRedirection: jest.fn()
    } as any

    mockSnackBar = {
      open: jest.fn()
    } as any
  })

  describe('Constructor', () => {
    it('should initialize component with roles when configSvc.unMappedUser.roles exists', () => {
      // Arrange & Act
      component = new MyNotificationsComponent(
        mockRouter,
        mockEventService,
        mockConfigService,
        mockNotificationsService,
        mockSnackBar
      )

      // Assert
      expect(component.roles).toEqual(['user', 'admin'])
      expect(component.environment).toBe(environment)
    })

    it('should initialize component with empty roles when configSvc is undefined', () => {
      // Arrange
      mockConfigService = undefined as any

      // Act
      component = new MyNotificationsComponent(
        mockRouter,
        mockEventService,
        mockConfigService,
        mockNotificationsService,
        mockSnackBar
      )

      // Assert
      expect(component.roles).toEqual([])
      expect(component.environment).toBe(environment)
    })

    it('should initialize component with empty roles when unMappedUser is undefined', () => {
      // Arrange
      mockConfigService.unMappedUser = undefined as any

      // Act
      component = new MyNotificationsComponent(
        mockRouter,
        mockEventService,
        mockConfigService,
        mockNotificationsService,
        mockSnackBar
      )

      // Assert
      expect(component.roles).toEqual([])
      expect(component.environment).toBe(environment)
    })

    it('should initialize component with empty roles when unMappedUser.roles is undefined', () => {
      // Arrange
      mockConfigService.unMappedUser = { roles: undefined } as any

      // Act
      component = new MyNotificationsComponent(
        mockRouter,
        mockEventService,
        mockConfigService,
        mockNotificationsService,
        mockSnackBar
      )

      // Assert
      expect(component.roles).toEqual([])
      expect(component.environment).toBe(environment)
    })
  })

  describe('redirectTo', () => {
    beforeEach(() => {
      component = new MyNotificationsComponent(
        mockRouter,
        mockEventService,
        mockConfigService,
        mockNotificationsService,
        mockSnackBar
      )
    })

    it('should call raiseTelemetryEventForNotification and handleRedirection when notification has category', () => {
      // Arrange
      const notification = {
        category: 'test-category',
        notification_id: 'test-id'
      }
      jest.spyOn(component, 'raiseTelemetryEventForNotification')

      // Act
      component.redirectTo(notification)

      // Assert
      expect(component.raiseTelemetryEventForNotification).toHaveBeenCalledWith(notification)
      expect(mockNotificationsService.handleRedirection).toHaveBeenCalledWith(
        notification,
        component.environment,
        component.roles,
        mockSnackBar
      )
    })

    it('should navigate to notifications page when notification has no category', () => {
      // Arrange
      const notification = {
        notification_id: 'test-id'
        // no category property
      }
      jest.spyOn(component, 'raiseTelemetryEventForNotification')

      // Act
      component.redirectTo(notification)

      // Assert
      expect(component.raiseTelemetryEventForNotification).not.toHaveBeenCalled()
      expect(mockNotificationsService.handleRedirection).not.toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/notifications'],
        { queryParams: { tab: notification } }
      )
    })

    it('should navigate to notifications page when notification category is falsy', () => {
      // Arrange
      const notification = {
        category: null,
        notification_id: 'test-id'
      }
      jest.spyOn(component, 'raiseTelemetryEventForNotification')

      // Act
      component.redirectTo(notification)

      // Assert
      expect(component.raiseTelemetryEventForNotification).not.toHaveBeenCalled()
      expect(mockNotificationsService.handleRedirection).not.toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/notifications'],
        { queryParams: { tab: notification } }
      )
    })

    it('should navigate to notifications page when notification category is empty string', () => {
      // Arrange
      const notification = {
        category: '',
        notification_id: 'test-id'
      }
      jest.spyOn(component, 'raiseTelemetryEventForNotification')

      // Act
      component.redirectTo(notification)

      // Assert
      expect(component.raiseTelemetryEventForNotification).not.toHaveBeenCalled()
      expect(mockNotificationsService.handleRedirection).not.toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/notifications'],
        { queryParams: { tab: notification } }
      )
    })
  })

  describe('raiseTelemetryEventForNotification', () => {
    beforeEach(() => {
      component = new MyNotificationsComponent(
        mockRouter,
        mockEventService,
        mockConfigService,
        mockNotificationsService,
        mockSnackBar
      )
    })

    it('should call raiseInteractTelemetry with correct parameters', () => {
      // Arrange
      const notification = {
        notification_id: 'test-notification-id',
        category: 'test-category'
      }

      // Act
      component.raiseTelemetryEventForNotification(notification)

      // Assert
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'notification-engine',
          id: 'test-notification-id'
        },
        {},
        {
          module: 'Home'
        }
      )
    })

    it('should handle notification with undefined notification_id', () => {
      // Arrange
      const notification = {
        category: 'test-category'
        // notification_id is undefined
      }

      // Act
      component.raiseTelemetryEventForNotification(notification)

      // Assert
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'notification-engine',
          id: undefined
        },
        {},
        {
          module: 'Home'
        }
      )
    })
  })
})