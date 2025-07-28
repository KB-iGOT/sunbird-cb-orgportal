import { CustomFieldsService } from './custom-fields.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

describe('CustomFieldsService', () => {
  let service: CustomFieldsService
  let httpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Create service instance with mocked HttpClient
    httpClient = mockHttpClient as any
    service = new CustomFieldsService(httpClient)
  })

  describe('Constructor', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(CustomFieldsService)
    })
  })

  describe('createField', () => {
    it('should call http.post with correct endpoint and filter', () => {
      const mockFilter = { name: 'test field', type: 'text' }
      const mockResponse = { id: '123', success: true }

      httpClient.post.mockReturnValue(of(mockResponse))

      const result = service.createField(mockFilter)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/create',
        mockFilter
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty filter object', () => {
      const mockFilter = {}
      const mockResponse = { error: 'Invalid data' }

      httpClient.post.mockReturnValue(of(mockResponse))

      service.createField(mockFilter)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/create',
        mockFilter
      )
    })
  })

  describe('createList', () => {
    it('should call http.post with correct endpoint and filter', () => {
      const mockFilter = { listName: 'test list', items: ['item1', 'item2'] }
      const mockResponse = { id: '456', success: true }

      httpClient.post.mockReturnValue(of(mockResponse))

      const result = service.createList(mockFilter)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/masterList/create',
        mockFilter
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('getCustomFields', () => {
    it('should call http.post with correct endpoint and payload', () => {
      const mockPayload = { filters: { status: 'active' }, pagination: { page: 1 } }
      const mockResponse = { data: [{ id: '1', name: 'field1' }], total: 1 }

      httpClient.post.mockReturnValue(of(mockResponse))

      const result = service.getCustomFields(mockPayload)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/search',
        mockPayload
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('deleteCustomField', () => {
    it('should call http.delete with correct endpoint and id', () => {
      const mockId = '123'
      const mockResponse = { success: true, message: 'Field deleted' }

      httpClient.delete.mockReturnValue(of(mockResponse))

      const result = service.deleteCustomField(mockId)

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/delete/123'
      )
      expect(httpClient.delete).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle special characters in id', () => {
      const mockId = 'test-id-with-special-chars_123'
      const mockResponse = { success: true }

      httpClient.delete.mockReturnValue(of(mockResponse))

      service.deleteCustomField(mockId)

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/delete/test-id-with-special-chars_123'
      )
    })
  })

  describe('readCustomField', () => {
    it('should call http.get with correct endpoint and id', () => {
      const mockId = '456'
      const mockResponse = { id: '456', name: 'test field', type: 'text' }

      httpClient.get.mockReturnValue(of(mockResponse))

      const result = service.readCustomField(mockId)

      expect(httpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/read/456'
      )
      expect(httpClient.get).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty string id', () => {
      const mockId = ''
      const mockResponse = { error: 'Invalid ID' }

      httpClient.get.mockReturnValue(of(mockResponse))

      service.readCustomField(mockId)

      expect(httpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/read/'
      )
    })
  })

  describe('updateCustomField', () => {
    it('should call http.put with correct endpoint, id and payload', () => {
      const mockId = '789'
      const mockPayload = { name: 'updated field', type: 'number' }
      const mockResponse = { id: '789', success: true }

      httpClient.put.mockReturnValue(of(mockResponse))

      const result = service.updateCustomField(mockId, mockPayload)

      expect(httpClient.put).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/update/789',
        mockPayload
      )
      expect(httpClient.put).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle null payload', () => {
      const mockId = '789'
      const mockPayload: any = null
      const mockResponse = { error: 'Invalid payload' }

      httpClient.put.mockReturnValue(of(mockResponse))

      service.updateCustomField(mockId, mockPayload)

      expect(httpClient.put).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/update/789',
        null
      )
    })
  })

  describe('updateCustomFieldStatus', () => {
    it('should call http.post with correct endpoint and payload', () => {
      const mockPayload = { id: '123', status: 'inactive' }
      const mockResponse = { success: true, message: 'Status updated' }

      httpClient.post.mockReturnValue(of(mockResponse))

      const result = service.updateCustomFieldStatus(mockPayload)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/status/update',
        mockPayload
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle array payload', () => {
      const mockPayload = [{ id: '123', status: 'active' }, { id: '456', status: 'inactive' }]
      const mockResponse = { success: true, updated: 2 }

      httpClient.post.mockReturnValue(of(mockResponse))

      service.updateCustomFieldStatus(mockPayload)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/status/update',
        mockPayload
      )
    })
  })

  describe('updateList', () => {
    it('should call http.post with correct endpoint and filter', () => {
      const mockFilter = { id: '999', listName: 'updated list', items: ['newItem1'] }
      const mockResponse = { id: '999', success: true }

      httpClient.post.mockReturnValue(of(mockResponse))

      const result = service.updateList(mockFilter)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/masterList/update',
        mockFilter
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle undefined filter', () => {
      const mockFilter = {}
      const mockResponse = { error: 'Missing filter' }

      httpClient.post.mockReturnValue(of(mockResponse))

      service.updateList(mockFilter)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customFields/v1/masterList/update',
        undefined
      )
    })
  })

  describe('API Endpoints Coverage', () => {
    it('should use correct API endpoints for all methods', () => {
      // This test ensures all API_ENDPOINTS are covered
      const mockData = {}
      const mockId = 'test-id'

      // Mock all HTTP methods
      httpClient.post.mockReturnValue(of({}))
      httpClient.get.mockReturnValue(of({}))
      httpClient.put.mockReturnValue(of({}))
      httpClient.delete.mockReturnValue(of({}))

      // Call all methods to ensure endpoints are used
      service.createField(mockData)
      service.createList(mockData)
      service.getCustomFields(mockData)
      service.deleteCustomField(mockId)
      service.readCustomField(mockId)
      service.updateCustomField(mockId, mockData)
      service.updateCustomFieldStatus(mockData)
      service.updateList(mockData)

      // Verify all endpoints were called
      expect(httpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/create', mockData)
      expect(httpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/masterList/create', mockData)
      expect(httpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/search', mockData)
      expect(httpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/status/update', mockData)
      expect(httpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/masterList/update', mockData)
      expect(httpClient.get).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/read/test-id')
      expect(httpClient.put).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/update/test-id', mockData)
      expect(httpClient.delete).toHaveBeenCalledWith('/apis/proxies/v8/customFields/v1/delete/test-id')
    })
  })
})