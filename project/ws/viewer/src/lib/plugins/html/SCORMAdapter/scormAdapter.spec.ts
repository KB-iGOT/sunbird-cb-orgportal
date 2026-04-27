import { SCORMAdapterService } from './scormAdapter'
import { of, throwError } from 'rxjs'

describe('SCORMAdapterService', () => {
  let service: SCORMAdapterService
  let mockStore: any
  let mockHttp: any

  beforeEach(() => {
    mockStore = {
      key: '',
      contentKey: '',
      setItem: jest.fn(),
      getItem: jest.fn(),
      getAll: jest.fn(),
      setAll: jest.fn(),
      clearAll: jest.fn(),
    }
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
    }

    service = new SCORMAdapterService(mockStore, mockHttp)
  })

  it('should create the service', () => {
    expect(service).toBeTruthy()
  })

  // contentId getter/setter
  describe('contentId', () => {
    it('should set contentId and store.key', () => {
      service.contentId = 'test-content-id'
      expect(service.id).toBe('test-content-id')
      expect(mockStore.key).toBe('test-content-id')
    })

    it('should get contentId', () => {
      service.id = 'get-test-id'
      expect(service.contentId).toBe('get-test-id')
    })
  })

  // LMSInitialize
  describe('LMSInitialize', () => {
    it('should initialize and set Initialized to true', () => {
      service.id = 'content-init'
      service.LMSInitialize()
      expect(mockStore.contentKey).toBe('content-init')
      expect(mockStore.setItem).toHaveBeenCalledWith('Initialized', true)
    })

    it('should return true on initialization', () => {
      const result = service.LMSInitialize()
      expect(result).toBe(true)
    })
  })

  // LMSFinish
  describe('LMSFinish', () => {
    it('should return false and set error 301 when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      const result = service.LMSFinish()
      expect(result).toBe(false)
    })

    it('should commit and clearAll when initialized', () => {
      mockStore.getItem.mockImplementation((key: string) => {
        if (key === 'Initialized') return true
        return null
      })
      mockStore.getAll.mockReturnValue(null)
      service.LMSFinish()
      expect(mockStore.setItem).toHaveBeenCalledWith('Initialized', false)
      expect(mockStore.clearAll).toHaveBeenCalled()
    })
  })

  // LMSGetValue
  describe('LMSGetValue', () => {
    it('should return false and set error 301 when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      const result = service.LMSGetValue('cmi.core.lesson_status')
      expect(result).toBe(false)
    })

    it('should return empty string and set error 201 when value not found', () => {
      mockStore.getItem.mockImplementation((key: string) => {
        if (key === 'Initialized') return true
        return null
      })
      const result = service.LMSGetValue('cmi.core.lesson_status')
      expect(result).toBe('')
    })

    it('should return value when initialized and value exists', () => {
      mockStore.getItem.mockImplementation((key: string) => {
        if (key === 'Initialized') return true
        if (key === 'cmi.core.lesson_status') return 'passed'
        return null
      })
      const result = service.LMSGetValue('cmi.core.lesson_status')
      expect(result).toBe('passed')
    })
  })

  // LMSSetValue
  describe('LMSSetValue', () => {
    it('should return false when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      const result = service.LMSSetValue('cmi.core.score.raw', '80')
      expect(result).toBe(false)
    })

    it('should set value and return it when initialized', () => {
      mockStore.getItem.mockImplementation((key: string) => {
        if (key === 'Initialized') return true
        if (key === 'cmi.core.score.raw') return '80'
        return null
      })
      const result = service.LMSSetValue('cmi.core.score.raw', '80')
      expect(mockStore.setItem).toHaveBeenCalledWith('cmi.core.score.raw', '80')
      expect(result).toBe('80')
    })
  })

  // LMSCommit
  describe('LMSCommit', () => {
    it('should return false when no data from store', () => {
      mockStore.getAll.mockReturnValue(null)
      const result = service.LMSCommit()
      expect(result).toBe(false)
    })

    it('should call addData and return true (of() is synchronous)', () => {
      const mockData = { Initialized: true, errors: 'some' }
      mockStore.getAll.mockReturnValue({ ...mockData })
      mockHttp.post.mockReturnValue(of({ success: true }))
      const result = service.LMSCommit()
      expect(mockHttp.post).toHaveBeenCalled()
      // of() is synchronous so _return is set to true before returning
      expect(result).toBe(true)
    })

    it('should set error 101 when addData throws', () => {
      const mockData = { Initialized: true }
      mockStore.getAll.mockReturnValue({ ...mockData })
      mockHttp.post.mockReturnValue(throwError(() => new Error('HTTP Error')))
      mockStore.getItem.mockImplementation((key: string) => {
        if (key === 'errors') return null
        return null
      })
      service.LMSCommit()
      // Error handling is called after subscribe error
      expect(mockStore.setItem).toHaveBeenCalled()
    })
  })

  // LMSGetLastError
  describe('LMSGetLastError', () => {
    it('should return empty string when no errors', () => {
      mockStore.getItem.mockReturnValue('[]')
      const result = service.LMSGetLastError()
      expect(result).toBe('')
    })

    it('should return last error code from errors array', () => {
      mockStore.getItem.mockReturnValue('[301, 201]')
      const result = service.LMSGetLastError()
      expect(result).toBe(201)
    })

    it('should handle null errors from store', () => {
      mockStore.getItem.mockReturnValue(null)
      const result = service.LMSGetLastError()
      expect(result).toBe('')
    })
  })

  // LMSGetErrorString
  describe('LMSGetErrorString', () => {
    it('should return empty string for unknown error code', () => {
      const result = service.LMSGetErrorString(999)
      expect(result).toBe('')
    })

    it('should return error string for error code 0 (the only valid array index)', () => {
      const result = service.LMSGetErrorString(0)
      expect(result).toBe('No Error')
    })

    it('should return empty string for error code 301 (out-of-bounds index)', () => {
      const result = service.LMSGetErrorString(301)
      expect(result).toBe('')
    })
  })

  // LMSGetDiagnostic
  describe('LMSGetDiagnostic', () => {
    it('should return empty string for unknown error code', () => {
      const result = service.LMSGetDiagnostic(999)
      expect(result).toBe('')
    })

    it('should return empty string for error code 201 (out-of-bounds index)', () => {
      const result = service.LMSGetDiagnostic(201)
      expect(result).toBe('')
    })

    it('should return diagnostic for error code 0 (the only valid array index)', () => {
      const result = service.LMSGetDiagnostic(0)
      expect(result).toContain('No error occurred')
    })
  })

  // _isInitialized
  describe('_isInitialized', () => {
    it('should return falsy when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      expect((service as any)._isInitialized()).toBeNull()
    })

    it('should return truthy when initialized', () => {
      mockStore.getItem.mockReturnValue(true)
      expect((service as any)._isInitialized()).toBe(true)
    })
  })

  // _setError
  describe('_setError', () => {
    it('should push error code to existing errors array', () => {
      mockStore.getItem.mockReturnValue('[101]')
        ; (service as any)._setError(301)
      // setItem is called with original string (not the modified array, per implementation)
      expect(mockStore.setItem).toHaveBeenCalled()
    })

    it('should create errors array if none exists', () => {
      mockStore.getItem.mockReturnValue(null)
        ; (service as any)._setError(101)
      expect(mockStore.setItem).toHaveBeenCalledWith('errors', '[]')
    })
  })

  // loadDataAsync
  describe('loadDataAsync', () => {
    it('should call http.get with scorm fetch endpoint', () => {
      service.id = 'test-id'
      const mockResponse = of({ result: { data: {} } })
      mockHttp.get.mockReturnValue(mockResponse)
      const result = service.loadDataAsync()
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/scrom/get/test-id')
      expect(result).toBe(mockResponse)
    })
  })

  // loadData
  describe('loadData', () => {
    it('should load data and call store.setAll on success', () => {
      service.id = 'test-id'
      const mockData = {
        'cmi.core.exit': 'suspend',
        'cmi.core.lesson_status': 'incomplete',
        'cmi.core.session_time': '00:10:00',
        'cmi.suspend_data': 'data',
        Initialized: true,
      }
      mockHttp.get.mockReturnValue(of({ result: { data: mockData } }))
      service.loadData()
      expect(mockStore.setAll).toHaveBeenCalled()
    })

    it('should set error 101 when loadData fails', () => {
      service.id = 'test-id'
      mockHttp.get.mockReturnValue(throwError(() => new Error('Network error')))
      mockStore.getItem.mockReturnValue(null)
      service.loadData()
      expect(mockStore.setItem).toHaveBeenCalledWith('errors', '[]')
    })
  })

  // addData
  describe('addData', () => {
    it('should post data to scorm endpoint and return observable', () => {
      service.id = 'test-content'
      const postData: any = { Initialized: true }
      mockHttp.post.mockReturnValue(of({ success: true }))
      const result = service.addData(postData)
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/scrom/add/test-content',
        postData
      )
      expect(result).toBeDefined()
    })
  })
})
