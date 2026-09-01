import { UploadFileService } from './uploadfile.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

// Mock HttpClient
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
}

describe('UploadFileService', () => {
  let service: UploadFileService
  let httpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Create service instance with mocked HttpClient
    httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>
    service = new UploadFileService(httpClient)
  })

  describe('getProfile', () => {
    it('should make GET request to correct endpoint', () => {
      // Arrange
      const mockResponse = { id: 1, name: 'Test User' }
      httpClient.get.mockReturnValue(of(mockResponse))

      // Act
      const result = service.getProfile()

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith('apis/proxies/v8/api/user/v2/read')
      expect(httpClient.get).toHaveBeenCalledTimes(1)

      // Verify the observable returns expected data
      result.subscribe((data: any) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should return Observable from http.get', () => {
      // Arrange
      const mockObservable = of({ test: 'data' })
      httpClient.get.mockReturnValue(mockObservable)

      // Act
      const result = service.getProfile()

      // Assert
      expect(result).toBe(mockObservable)
    })
  })

  describe('crreateAsset', () => {
    it('should make POST request to correct endpoint with request body', () => {
      // Arrange
      const mockRequest = { name: 'Test Asset', type: 'document' }
      const mockResponse = { id: 123, status: 'created' }
      httpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.crreateAsset(mockRequest)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/action/content/v3/create',
        mockRequest
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      // Verify the observable returns expected data
      result.subscribe((data: any) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should handle null request body', () => {
      // Arrange
      httpClient.post.mockReturnValue(of({}))

      // Act
      service.crreateAsset(null)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/action/content/v3/create',
        null
      )
    })
  })

  describe('uploadFile', () => {
    it('should make two POST requests and return the second one', () => {
      // Arrange
      const val = 'test-file-id'
      const formData = new FormData()
      formData.append('file', 'test file content')

      const mockResponse1 = { status: 'first call' }
      const mockResponse2 = { status: 'second call' }

      // Mock both POST calls
      httpClient.post
        .mockReturnValueOnce(of(mockResponse1))  // First call
        .mockReturnValueOnce(of(mockResponse2)) // Second call

      // Act
      const result = service.uploadFile(val, formData)

      // Assert
      expect(httpClient.post).toHaveBeenCalledTimes(2)

      // First call with headers
      expect(httpClient.post).toHaveBeenNthCalledWith(
        1,
        `apis/proxies/v8/upload/action/content/v3/upload/${val}`,
        formData,
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      )

      // Second call without headers
      expect(httpClient.post).toHaveBeenNthCalledWith(
        2,
        `apis/proxies/v8/upload/action/content/v3/upload/${val}`,
        formData
      )

      // Verify only the second observable is returned
      result.subscribe((data: any) => {
        expect(data).toEqual(mockResponse2)
      })
    })

    it('should handle different val parameter values', () => {
      // Arrange
      const val = '12345'
      const formData = { test: 'data' }
      httpClient.post.mockReturnValue(of({}))

      // Act
      service.uploadFile(val, formData)

      // Assert
      expect(httpClient.post).toHaveBeenNthCalledWith(
        1,
        'apis/proxies/v8/upload/action/content/v3/upload/12345',
        formData,
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      )

      expect(httpClient.post).toHaveBeenNthCalledWith(
        2,
        'apis/proxies/v8/upload/action/content/v3/upload/12345',
        formData
      )
    })
  })

  describe('updateWorkOrder', () => {
    it('should make POST request to correct endpoint with request body', () => {
      // Arrange
      const mockRequest = { workOrderId: 456, status: 'updated' }
      const mockResponse = { success: true }
      httpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.updateWorkOrder(mockRequest)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        'apis/protected/v8/workallocation/update/workorder',
        mockRequest
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      // Verify the observable returns expected data
      result.subscribe((data: any) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should handle empty request object', () => {
      // Arrange
      httpClient.post.mockReturnValue(of({}))

      // Act
      service.updateWorkOrder({})

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        'apis/protected/v8/workallocation/update/workorder',
        {}
      )
    })
  })

  describe('getDraftPDF', () => {
    it('should make GET request with blob response type', () => {
      // Arrange
      const val = 'pdf-123'
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' })
      httpClient.get.mockReturnValue(of(mockBlob))

      // Act
      const result = service.getDraftPDF(val)

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith(
        `apis/protected/v8/workallocation/getWOPdf/${val}`,
        { responseType: 'blob' as 'json' }
      )
      expect(httpClient.get).toHaveBeenCalledTimes(1)

      // Verify the observable returns expected data
      result.subscribe((data: any) => {
        expect(data).toBe(mockBlob)
      })
    })

    it('should handle different val parameter values', () => {
      // Arrange
      const val = 'document-789'
      httpClient.get.mockReturnValue(of(new Blob()))

      // Act
      service.getDraftPDF(val)

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith(
        'apis/protected/v8/workallocation/getWOPdf/document-789',
        { responseType: 'blob' as 'json' }
      )
    })
  })

  describe('Service initialization', () => {
    it('should be created with HttpClient dependency', () => {
      // Assert
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(UploadFileService)
    })
  })

  describe('API_END_POINTS constant coverage', () => {
    it('should use all defined API endpoints', () => {
      // This test ensures all API_END_POINTS are covered by testing each method

      // Test each endpoint is used
      httpClient.get.mockReturnValue(of({}))
      httpClient.post.mockReturnValue(of({}))

      service.getProfile()
      service.crreateAsset({})
      service.uploadFile('test', {})
      service.updateWorkOrder({})
      service.getDraftPDF('test')

      // Verify all endpoints were called
      expect(httpClient.get).toHaveBeenCalledWith('apis/proxies/v8/api/user/v2/read')
      expect(httpClient.post).toHaveBeenCalledWith('apis/proxies/v8/action/content/v3/create', {})
      expect(httpClient.post).toHaveBeenCalledWith('apis/proxies/v8/upload/action/content/v3/upload/test', {})
      expect(httpClient.post).toHaveBeenCalledWith('apis/protected/v8/workallocation/update/workorder', {})
      expect(httpClient.get).toHaveBeenCalledWith(
        'apis/protected/v8/workallocation/getWOPdf/test',
        { responseType: 'blob' as 'json' }
      )
    })
  })
})