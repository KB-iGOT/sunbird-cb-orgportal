import { EventsService } from './events.service'
import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'

// Mock environment
jest.mock('../../../../../../../../src/environments/environment', () => ({
  environment: {
    contentHost: 'https://test-content-host.com',
    contentBucket: 'test-bucket'
  }
}))

describe('EventsService', () => {
  let service: EventsService
  let httpClientMock: jest.Mocked<HttpClient>

  beforeEach(() => {
    // Create mock HttpClient
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      request: jest.fn()
    } as any

    // Create service instance with mocked HttpClient
    service = new EventsService(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('crreateAsset', () => {
    it('should create asset with correct endpoint and request', () => {
      const mockRequest = { name: 'test-asset' }
      const mockResponse = { id: '123', status: 'created' }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.crreateAsset(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/action/content/v3/create',
        mockRequest
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('uploadFile', () => {
    it('should upload file with correct endpoint and parameters', () => {
      const mockVal = 'test-id'
      const mockFormData = new FormData()
      const mockResponse = { success: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.uploadFile(mockVal, mockFormData)

      // Note: The method has duplicate HTTP calls, but only returns the second one
      expect(httpClientMock.post).toHaveBeenCalledTimes(2)
      expect(httpClientMock.post).toHaveBeenNthCalledWith(
        1,
        `apis/proxies/v8/upload/action/content/v3/upload/${mockVal}`,
        mockFormData,
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      )
      expect(httpClientMock.post).toHaveBeenNthCalledWith(
        2,
        `apis/proxies/v8/upload/action/content/v3/upload/${mockVal}`,
        mockFormData
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('createEvent', () => {
    it('should create event with correct endpoint and request', () => {
      const mockRequest = { title: 'Test Event', description: 'Test Description' }
      const mockResponse = { id: 'event-123', status: 'created' }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.createEvent(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/event/v4/create',
        mockRequest
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('updateEvent', () => {
    it('should update event with correct endpoint and request', () => {
      const mockRequest = { id: 'event-123', title: 'Updated Event' }
      const mockResponse = { success: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.updateEvent(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/authApi/action/content/v2/hierarchy/update?rootOrg=igot&org=dopt',
        mockRequest
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('publishEvent', () => {
    it('should publish event with correct endpoint and parameters', () => {
      const mockEventId = 'event-123'
      const mockRequest = { status: 'published' }
      const mockResponse = { success: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.publishEvent(mockEventId, mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        `/apis/proxies/v8/event/v4/publish/${mockEventId}`,
        mockRequest
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('searchEvent', () => {
    it('should search events with correct endpoint and request', () => {
      const mockRequest = { query: 'test search' }
      const mockResponse = { results: [] }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.searchEvent(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/read',
        mockRequest
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('getEventsList', () => {
    it('should get events list with correct endpoint and request', () => {
      const mockRequest = { filters: {} }
      const mockResponse = { events: [] }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.getEventsList(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        mockRequest
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('getParticipants', () => {
    it('should get participants with correct endpoint', () => {
      const mockResponse = { participants: [] }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      const result = service.getParticipants()

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/portal/mdo/mydepartment?allUsers=true'
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('uploadCoverImage', () => {
    it('should upload cover image with correct endpoint and parameters', () => {
      const mockRequest = { image: 'base64string' }
      const mockEventId = 'event-123'
      const mockResponse = { success: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.uploadCoverImage(mockRequest, mockEventId)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        `/apis/authContent/upload/igot/dopt/Public/${mockEventId}/artifacts`,
        mockRequest
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('getEvents', () => {
    it('should get events with correct endpoint', () => {
      const mockResponse = { events: [] }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      const result = service.getEvents()

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/read'
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('searchUser', () => {
    it('should search user with correct endpoint and value', () => {
      const mockValue = 'john.doe'
      const mockResponse = { users: [] }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      const result = service.searchUser(mockValue)

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/proxies/v8/user/v1/autocomplete/${mockValue}`
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('getEventDetails', () => {
    it('should get event details with correct endpoint and event ID', () => {
      const mockEventId = 'event-123'
      const mockResponse = { event: { id: 'event-123', title: 'Test Event' } }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      const result = service.getEventDetails(mockEventId)

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/proxies/v8/event/v4/read/${mockEventId}`
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('getPublicUrl', () => {
    it('should return correct public URL when content path exists', () => {
      const mockUrl = 'https://example.com/content/folder/file.jpg'
      const expectedUrl = 'https://test-content-host.com/test-bucket/content/folder/file.jpg'

      const result = service.getPublicUrl(mockUrl)

      expect(result).toBe(expectedUrl)
    })

    it('should return base URL when content path does not exist', () => {
      const mockUrl = 'https://example.com/other/path/file.jpg'
      const expectedUrl = 'https://test-content-host.com/test-bucket/content'

      const result = service.getPublicUrl(mockUrl)

      expect(result).toBe(expectedUrl)
    })

    it('should handle URL without content segment', () => {
      const mockUrl = 'https://example.com/file.jpg'
      const expectedUrl = 'https://test-content-host.com/test-bucket/content'

      const result = service.getPublicUrl(mockUrl)

      expect(result).toBe(expectedUrl)
    })

    it('should handle empty URL', () => {
      const mockUrl = ''
      const expectedUrl = 'https://test-content-host.com/test-bucket/content'

      const result = service.getPublicUrl(mockUrl)

      expect(result).toBe(expectedUrl)
    })
  })

  describe('Error handling', () => {
    it('should handle HTTP errors in createEvent', () => {
      const mockRequest = { title: 'Test Event' }
      const mockError = new Error('HTTP Error')

      httpClientMock.post.mockReturnValue(throwError(mockError))

      const result = service.createEvent(mockRequest)

      result.subscribe(
        () => fail('Should have failed'),
        error => {
          expect(error).toBe(mockError)
        }
      )
    })

    it('should handle HTTP errors in getParticipants', () => {
      const mockError = new Error('HTTP Error')

      httpClientMock.get.mockReturnValue(throwError(mockError))

      const result = service.getParticipants()

      result.subscribe(
        () => fail('Should have failed'),
        error => {
          expect(error).toBe(mockError)
        }
      )
    })
  })
})

// Helper function to create error observable
// throwError(error) {
//   return new Promise((resolve, reject) => {
//     reject(error)
//   })
// }