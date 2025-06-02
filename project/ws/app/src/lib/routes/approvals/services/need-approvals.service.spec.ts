import { of } from 'rxjs'
import { NeedApprovalsService } from './need-approvals.service'

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
}

describe('NeedApprovalsService', () => {
  let service: NeedApprovalsService

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Create service instance with mocked HttpClient
    service = new NeedApprovalsService(mockHttpClient as any)
  })

  describe('fetchNeedApprovals', () => {
    it('should call http.post with correct endpoint and request data', () => {
      // Arrange
      const mockRequest = { userId: 'test123', status: 'pending' }
      const mockResponse = { data: 'test response' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.fetchNeedApprovals(mockRequest)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/workflowhandler/applicationsSearch',
        mockRequest
      )
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1)

      // Verify observable returns expected data
      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should return observable from http.post', () => {
      // Arrange
      const mockRequest = { test: 'data' }
      const mockObservable = of({ result: 'success' })
      mockHttpClient.post.mockReturnValue(mockObservable)

      // Act
      const result = service.fetchNeedApprovals(mockRequest)

      // Assert
      expect(result).toBe(mockObservable)
    })
  })

  describe('fetchProfileDeatils', () => {
    it('should call http.get with correct endpoint and userid', () => {
      // Arrange
      const userId = 'user123'
      const mockResponse = { profile: 'user profile data' }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      const result = service.fetchProfileDeatils(userId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/proxies/v8/api/user/v2/read/user123'
      )
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)

      // Verify observable returns expected data
      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty userid', () => {
      // Arrange
      const userId = ''
      const mockResponse = { error: 'user not found' }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      const result = service.fetchProfileDeatils(userId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/proxies/v8/api/user/v2/read/'
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should return observable from http.get', () => {
      // Arrange
      const userId = 'test456'
      const mockObservable = of({ user: 'data' })
      mockHttpClient.get.mockReturnValue(mockObservable)

      // Act
      const result = service.fetchProfileDeatils(userId)

      // Assert
      expect(result).toBe(mockObservable)
    })
  })

  describe('handleWorkflow', () => {
    it('should call http.post with correct endpoint and request data', () => {
      // Arrange
      const mockRequest = {
        workflowId: 'wf123',
        action: 'approve',
        comments: 'looks good'
      }
      const mockResponse = { status: 'success', transitionId: 'trans456' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.handleWorkflow(mockRequest)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/protected/v8/workflowhandler/transition',
        mockRequest
      )
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1)

      // Verify observable returns expected data
      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle null request', () => {
      // Arrange
      const mockRequest = null
      const mockResponse = { error: 'invalid request' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.handleWorkflow(mockRequest)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/protected/v8/workflowhandler/transition',
        null
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should return observable from http.post', () => {
      // Arrange
      const mockRequest = { test: 'workflow data' }
      const mockObservable = of({ workflow: 'handled' })
      mockHttpClient.post.mockReturnValue(mockObservable)

      // Act
      const result = service.handleWorkflow(mockRequest)

      // Assert
      expect(result).toBe(mockObservable)
    })
  })

  describe('getWfHistoryByAppId', () => {
    it('should call http.get with correct endpoint and appid', () => {
      // Arrange
      const appId = 'app789'
      const mockResponse = {
        history: [
          { id: 1, action: 'created', date: '2024-01-01' },
          { id: 2, action: 'approved', date: '2024-01-02' }
        ]
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      const result = service.getWfHistoryByAppId(appId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/protected/v8/workflowhandler/historyByApplicationId/app789'
      )
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)

      // Verify observable returns expected data
      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle special characters in appid', () => {
      // Arrange
      const appId = 'app-123/test'
      const mockResponse = { history: [] }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      const result = service.getWfHistoryByAppId(appId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/protected/v8/workflowhandler/historyByApplicationId/app-123/test'
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty appid', () => {
      // Arrange
      const appId = ''
      const mockResponse = { error: 'application not found' }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      const result = service.getWfHistoryByAppId(appId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/protected/v8/workflowhandler/historyByApplicationId/'
      )

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should return observable from http.get', () => {
      // Arrange
      const appId = 'testApp'
      const mockObservable = of({ history: 'data' })
      mockHttpClient.get.mockReturnValue(mockObservable)

      // Act
      const result = service.getWfHistoryByAppId(appId)

      // Assert
      expect(result).toBe(mockObservable)
    })
  })

  describe('Service Construction', () => {
    it('should be created with HttpClient dependency', () => {
      // Act & Assert
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(NeedApprovalsService)
    })
  })

  describe('Error Handling', () => {
    it('should handle http errors in fetchNeedApprovals', () => {
      // Arrange
      const mockRequest = { test: 'data' }
      const errorResponse = new Error('HTTP Error')
      mockHttpClient.post.mockReturnValue(of().pipe(() => {
        throw errorResponse
      }))

      // Act
      const result = service.fetchNeedApprovals(mockRequest)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/workflowhandler/applicationsSearch',
        mockRequest
      )

      // The service doesn't handle errors, so they should propagate
      expect(() => {
        result.subscribe()
      }).toThrow('HTTP Error')
    })

    it('should handle http errors in fetchProfileDeatils', () => {
      // Arrange
      const userId = 'user123'
      const errorResponse = new Error('Profile not found')
      mockHttpClient.get.mockReturnValue(of().pipe(() => {
        throw errorResponse
      }))

      // Act
      const result = service.fetchProfileDeatils(userId)

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/proxies/v8/api/user/v2/read/user123'
      )

      expect(() => {
        result.subscribe()
      }).toThrow('Profile not found')
    })
  })
})