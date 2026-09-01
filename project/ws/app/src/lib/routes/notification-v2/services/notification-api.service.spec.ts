import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { NotificationApiService } from './notification-api.service'
import { ENotificationEvent, ENotificationType, INotificationData } from '../models/notifications.model'

describe('NotificationApiService', () => {
  let service: NotificationApiService
  let httpClientMock: jest.Mocked<HttpClient>

  beforeEach(() => {
    // Create a mock for HttpClient
    httpClientMock = {
      get: jest.fn(),
      patch: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    // Create service instance with the mock
    service = new NotificationApiService(httpClientMock)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getNotifications', () => {
    // Mock response data
    const mockNotificationData: INotificationData = {
      data: [
        {
          message: 'Test notification 1',
          seen: false,
          classifiedAs: ENotificationType.Action,
          eventId: ENotificationEvent.ShareContent,
          notificationId: '',
          receivedOn: new Date(),
          targetData: undefined,
          userId: '',
          seenOn: new Date()
        },
        {
          message: 'Test notification 2',
          seen: true,
          classifiedAs: ENotificationType.Action,
          eventId: ENotificationEvent.ShareContent,
          notificationId: '',
          targetData: new Date(),
          userId: '',
          receivedOn: new Date(),
          seenOn: new Date()
        }
      ],
      page: ''
    }

    beforeEach(() => {
      // Reset mock before each test
      jest.clearAllMocks()

      // Setup default mock response
      httpClientMock.get.mockReturnValue(of(mockNotificationData))
    })

    it('should call the correct API endpoint with no parameters', () => {
      service.getNotifications()

      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/notifications', { params: {} })
    })

    it('should call the API with classification parameter when provided', () => {
      service.getNotifications('Action')

      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/notifications', {
        params: { classification: 'Action' }
      })
    })

    it('should call the API with size parameter when provided', () => {
      service.getNotifications(undefined, 10)

      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/notifications', {
        params: { size: '10' }
      })
    })

    it('should call the API with page parameter when provided', () => {
      service.getNotifications(undefined, undefined, 'next-page-token')

      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/notifications', {
        params: { page: 'next-page-token' }
      })
    })

    it('should call the API with all parameters when provided', () => {
      service.getNotifications('Information', 20, 'page-token')

      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/notifications', {
        params: {
          classification: 'Information',
          size: '20',
          page: 'page-token'
        }
      })
    })

    it('should return the notification data from the API', () => {
      let result: INotificationData | undefined

      service.getNotifications().subscribe(data => {
        result = data
      })

      expect(result).toEqual(mockNotificationData)
    })
  })

  describe('getCount', () => {
    beforeEach(() => {
      // Reset mock before each test
      jest.clearAllMocks()

      // Setup default mock response
      httpClientMock.get.mockReturnValue(of(5))
    })

    it('should call the correct API endpoint', () => {
      service.getCount()

      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/iconBadge/unseenNotificationCount')
    })

    it('should return the count from the API', () => {
      let result: number | undefined

      service.getCount().subscribe(count => {
        result = count
      })

      expect(result).toBe(5)
    })
  })

  describe('updateNotificationSeenStatus', () => {
    beforeEach(() => {
      // Reset mock before each test
      jest.clearAllMocks()

      // Setup default mock response
      httpClientMock.patch.mockReturnValue(of({}))
    })

    it('should call the API with notification ID and classification when provided', () => {
      const notificationId = 'notification1'
      const classification = ENotificationType.Action

      service.updateNotificationSeenStatus(notificationId, classification)

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        `/apis/protected/v8/user/notifications/${notificationId}/${classification}`,
        { seen: true }
      )
    })

    it('should call the API with seen=false when status parameter is false', () => {
      const notificationId = 'notification1'
      const classification = ENotificationType.Information

      service.updateNotificationSeenStatus(notificationId, classification, false)

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        `/apis/protected/v8/user/notifications/${notificationId}/${classification}`,
        { seen: false }
      )
    })

    it('should call the base API endpoint when no ID and classification are provided', () => {
      service.updateNotificationSeenStatus()

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        '/apis/protected/v8/user/notifications',
        {}
      )
    })

    it('should call the base API endpoint when only ID is provided without classification', () => {
      service.updateNotificationSeenStatus('notification1')

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        '/apis/protected/v8/user/notifications',
        {}
      )
    })

    it('should call the base API endpoint when only classification is provided without ID', () => {
      service.updateNotificationSeenStatus(undefined, ENotificationType.Action)

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        '/apis/protected/v8/user/notifications',
        {}
      )
    })

    it('should return the response from the API', () => {
      let result: any
      const mockResponse = { success: true }
      httpClientMock.patch.mockReturnValue(of(mockResponse))

      const observable = service.updateNotificationSeenStatus('notification1', ENotificationType.Action)
      observable.subscribe(response => {
        result = response
      })

      expect(result).toEqual(mockResponse)
    })
  })
})