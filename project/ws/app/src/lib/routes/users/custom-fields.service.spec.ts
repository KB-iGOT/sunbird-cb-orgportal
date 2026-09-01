import { CustomFieldsService } from './custom-fields.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

describe('CustomFieldsService', () => {
  let service: CustomFieldsService
  let httpClientMock: jest.Mocked<HttpClient>

  const API_ENDPOINTS = {
    CREATE: `/apis/proxies/v8/customFields/v1/create`,
    CREATE_LIST: `/apis/proxies/v8/customFields/v1/masterList/create`,
    UPDATE_LIST: `/apis/proxies/v8/customFields/v1/masterList/update`,
    LIST_CUSTOM_FIELDS: `/apis/proxies/v8/customFields/v1/search`,
    DELETE: `/apis/proxies/v8/customFields/v1/delete`,
    READ: `/apis/proxies/v8/customFields/v1/read`,
    UPDATE: `/apis/proxies/v8/customFields/v1/update`,
    UPDATE_STATUS: `/apis/proxies/v8/customFields/v1/status/update`,
    ENABLE_DISABLE_POPUP: `/apis/proxies/v8/customFields/v1/popup/update`,
    READ_ORG_DETAILS: `api/org/v1/read`
  }

  beforeEach(() => {
    // Create a mock HttpClient
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
    service = new CustomFieldsService(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createField', () => {
    it('should call POST request with correct URL and payload', () => {
      const mockFilter = { name: 'Test Field', type: 'text' }
      const mockResponse = { success: true, id: '123' }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.createField(mockFilter)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.CREATE, mockFilter)
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty filter object', () => {
      const emptyFilter = {}
      const mockResponse = { success: false }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.createField(emptyFilter)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.CREATE, emptyFilter)
    })
  })

  describe('createList', () => {
    it('should call POST request with correct URL and payload', () => {
      const mockFilter = { listName: 'Test List', items: ['item1', 'item2'] }
      const mockResponse = { success: true, listId: '456' }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.createList(mockFilter)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.CREATE_LIST, mockFilter)
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('getCustomFields', () => {
    it('should call POST request with correct URL and payload', () => {
      const mockPayload = { search: 'test', limit: 10, offset: 0 }
      const mockResponse = { fields: [], total: 0 }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.getCustomFields(mockPayload)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.LIST_CUSTOM_FIELDS, mockPayload)
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('deleteCustomField', () => {
    it('should call DELETE request with correct URL and field ID', () => {
      const fieldId = '123'
      const mockResponse = { success: true, message: 'Field deleted' }

      httpClientMock.delete.mockReturnValue(of(mockResponse))

      const result = service.deleteCustomField(fieldId)

      expect(httpClientMock.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.DELETE}/${fieldId}`)
      expect(httpClientMock.delete).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle special characters in field ID', () => {
      const fieldId = 'test-field_123'
      const mockResponse = { success: true }

      httpClientMock.delete.mockReturnValue(of(mockResponse))

      service.deleteCustomField(fieldId)

      expect(httpClientMock.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.DELETE}/${fieldId}`)
    })
  })

  describe('readCustomField', () => {
    it('should call GET request with correct URL and field ID', () => {
      const fieldId = '789'
      const mockResponse = { id: '789', name: 'Test Field', type: 'text' }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      const result = service.readCustomField(fieldId)

      expect(httpClientMock.get).toHaveBeenCalledWith(`${API_ENDPOINTS.READ}/${fieldId}`)
      expect(httpClientMock.get).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('updateCustomField', () => {
    it('should call PUT request with correct URL and payload', () => {
      const mockPayload = { id: '123', name: 'Updated Field', type: 'select' }
      const mockResponse = { success: true, updated: true }

      httpClientMock.put.mockReturnValue(of(mockResponse))

      const result = service.updateCustomField(mockPayload)

      expect(httpClientMock.put).toHaveBeenCalledWith(API_ENDPOINTS.UPDATE, mockPayload)
      expect(httpClientMock.put).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('updateCustomFieldStatus', () => {
    it('should call POST request with correct URL and payload', () => {
      const mockPayload = { id: '123', status: 'active' }
      const mockResponse = { success: true, statusUpdated: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.updateCustomFieldStatus(mockPayload)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.UPDATE_STATUS, mockPayload)
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle different payload types', () => {
      const mockPayload = { fieldIds: ['1', '2', '3'], status: 'inactive' }
      const mockResponse = { success: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.updateCustomFieldStatus(mockPayload)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.UPDATE_STATUS, mockPayload)
    })
  })

  describe('updateList', () => {
    it('should call POST request with correct URL and filter', () => {
      const mockFilter = { listId: '456', items: ['new1', 'new2'] }
      const mockResponse = { success: true, listUpdated: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.updateList(mockFilter)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.UPDATE_LIST, mockFilter)
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('updatePopup', () => {
    it('should call POST request with correct URL and request', () => {
      const mockRequest = { popupId: '789', enabled: true }
      const mockResponse = { success: true, popupUpdated: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.updatePopup(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.ENABLE_DISABLE_POPUP, mockRequest)
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('readOrgData', () => {
    it('should call POST request with correct URL and request', () => {
      const mockRequest = { orgId: '999', includeMetadata: true }
      const mockResponse = { orgData: { name: 'Test Org', id: '999' } }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = service.readOrgData(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.READ_ORG_DETAILS, mockRequest)
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)

      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle null request', () => {
      const mockRequest = null
      const mockResponse = { error: 'Invalid request' }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.readOrgData(mockRequest)

      expect(httpClientMock.post).toHaveBeenCalledWith(API_ENDPOINTS.READ_ORG_DETAILS, mockRequest)
    })
  })

  describe('Service instantiation', () => {
    it('should create service instance successfully', () => {
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(CustomFieldsService)
    })
  })

  describe('HTTP Client dependency', () => {
    it('should have HttpClient dependency injected', () => {
      expect(service['http']).toBeDefined()
      expect(service['http']).toBe(httpClientMock)
    })
  })

  describe('API Endpoints coverage', () => {
    it('should use all defined API endpoints', () => {
      const mockPayload = { test: 'data' }
      const mockResponse = of({ success: true })

      // Mock all HTTP methods
      httpClientMock.post.mockReturnValue(mockResponse)
      httpClientMock.get.mockReturnValue(mockResponse)
      httpClientMock.put.mockReturnValue(mockResponse)
      httpClientMock.delete.mockReturnValue(mockResponse)

      // Call all service methods to ensure all endpoints are covered
      service.createField(mockPayload)
      service.createList(mockPayload)
      service.getCustomFields(mockPayload)
      service.deleteCustomField('test-id')
      service.readCustomField('test-id')
      service.updateCustomField(mockPayload)
      service.updateCustomFieldStatus(mockPayload)
      service.updateList(mockPayload)
      service.updatePopup(mockPayload)
      service.readOrgData(mockPayload)

      // Verify that HTTP client methods were called
      expect(httpClientMock.post).toHaveBeenCalledTimes(7) // 7 POST methods
      expect(httpClientMock.get).toHaveBeenCalledTimes(1)   // 1 GET method
      expect(httpClientMock.put).toHaveBeenCalledTimes(1)   // 1 PUT method
      expect(httpClientMock.delete).toHaveBeenCalledTimes(1) // 1 DELETE method
    })
  })
})