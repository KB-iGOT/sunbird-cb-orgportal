import { CommonService } from './common-service.service'
import { of, throwError } from 'rxjs'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj: any, path: string) => {
    if (!obj || !path) { return undefined }
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      result = result?.[key]
    }
    return result
  }),
}))

describe('CommonService', () => {
  let service: CommonService
  let mockHttpClient: any

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
    }
    service = new CommonService(mockHttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the service', () => {
    expect(service).toBeDefined()
    expect(service).toBeInstanceOf(CommonService)
  })

  describe('getFilterEntityV2', () => {
    it('should call correct API endpoint', () => {
      mockHttpClient.get.mockReturnValue(of({}))

      service.getFilterEntityV2().subscribe()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/framework/v1/read/kcmfinal_fw'
      )
    })

    it('should return framework categories from response', (done) => {
      const mockCategories = [
        { code: 'subject', name: 'Subject' },
        { code: 'medium', name: 'Medium' },
      ]
      const mockResponse = {
        result: {
          framework: {
            categories: mockCategories,
          },
        },
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getFilterEntityV2().subscribe((result) => {
        expect(result).toEqual(mockCategories)
        done()
      })
    })

    it('should return undefined when categories are missing', (done) => {
      const mockResponse = { result: {} }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getFilterEntityV2().subscribe((result) => {
        expect(result).toBeUndefined()
        done()
      })
    })

    it('should return undefined for empty response', (done) => {
      mockHttpClient.get.mockReturnValue(of({}))

      service.getFilterEntityV2().subscribe((result) => {
        expect(result).toBeUndefined()
        done()
      })
    })

    it('should propagate errors from HTTP client', (done) => {
      const mockError = new Error('Network error')
      mockHttpClient.get.mockReturnValue(throwError(mockError))

      service.getFilterEntityV2().subscribe({
        error: (err) => {
          expect(err).toBe(mockError)
          done()
        },
      })
    })
  })
})
