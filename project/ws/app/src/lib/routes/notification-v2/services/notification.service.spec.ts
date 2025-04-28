import { NotificationService } from './notification.service'
import { Router } from '@angular/router'
import { ENotificationEvent, INotification } from '../models/notifications.model'

describe('NotificationService', () => {
  let service: NotificationService
  let mockRouter: jest.Mocked<Router>

  beforeEach(() => {
    // Create mock for Router
    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>

    // Create service instance with mock
    service = new NotificationService(mockRouter)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('mapRoute', () => {
    it('should navigate to pending actions for ShareGoal event', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.ShareGoal,
        targetData: {}
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/goals/me/pending-actions'])
    })

    it('should navigate to playlist notification for SharePlaylist event', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.SharePlaylist,
        targetData: {}
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/playlist/notification'])
    })

    it('should navigate to content overview for ShareContent event with identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.ShareContent,
        targetData: { identifier: 'content-123' }
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/content-123/overview'])
    })

    it('should navigate to content overview for PublishContent event with identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.PublishContent,
        targetData: { identifier: 'content-123' }
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/content-123/overview'])
    })

    it('should not navigate for ShareContent event without identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.ShareContent,
        targetData: {}
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should navigate to editor for AddContributor event with identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.AddContributor,
        targetData: { identifier: 'content-123' }
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/author/editor/content-123'])
    })

    it('should navigate to editor for SendContent event with identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.SendContent,
        targetData: { identifier: 'content-123' }
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/author/editor/content-123'])
    })

    it('should navigate to editor for RejectContent event with identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.RejectContent,
        targetData: { identifier: 'content-123' }
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/author/editor/content-123'])
    })

    it('should navigate to editor for DelegateContent event with identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.DelegateContent,
        targetData: { identifier: 'content-123' }
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/author/editor/content-123'])
    })

    it('should navigate to editor for ApproveContent event with identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.ApproveContent,
        targetData: { identifier: 'content-123' }
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/author/editor/content-123'])
    })

    it('should not navigate for AddContributor event without identifier', () => {
      // Arrange
      const notification: INotification = {
        eventId: ENotificationEvent.AddContributor,
        targetData: {}
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should not navigate for unknown event types', () => {
      // Arrange
      const notification: INotification = {
        eventId: 'unknown-event' as ENotificationEvent,
        targetData: {}
      } as INotification

      // Act
      service.mapRoute(notification)

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })
})