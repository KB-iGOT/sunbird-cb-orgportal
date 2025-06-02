import { OnboardingService } from './onboarding.service'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn()
}

describe('OnboardingService', () => {
  let service: OnboardingService
  let httpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>
    service = new OnboardingService(httpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create service instance', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize routeFromSelfRegistration as false', () => {
      expect(service.routeFromSelfRegistration).toBe(false)
    })
  })

  describe('generateSelfRegistrationQRCode', () => {
    it('should call http.post with correct URL and request', () => {
      const mockRequest = { data: 'test' }
      const mockResponse = { qrCode: 'mock-qr-code' }

      httpClient.post.mockReturnValue(of(mockResponse))

      const result = service.generateSelfRegistrationQRCode(mockRequest)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customselfregistration',
        mockRequest
      )
      expect(result).toBeDefined()
    })

    it('should return observable from http.post', (done) => {
      const mockRequest = { data: 'test' }
      const mockResponse = { qrCode: 'mock-qr-code' }

      httpClient.post.mockReturnValue(of(mockResponse))

      service.generateSelfRegistrationQRCode(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('getListOfRegisteedLinks', () => {
    it('should call http.post with correct URL and request', () => {
      const mockRequest = { filter: 'active' }
      const mockResponse = { links: ['link1', 'link2'] }

      httpClient.post.mockReturnValue(of(mockResponse))

      const result = service.getListOfRegisteedLinks(mockRequest)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customselfregistration/listallqrs',
        mockRequest
      )
      expect(result).toBeDefined()
    })

    it('should return observable from http.post', (done) => {
      const mockRequest = { filter: 'active' }
      const mockResponse = { links: ['link1', 'link2'] }

      httpClient.post.mockReturnValue(of(mockResponse))

      service.getListOfRegisteedLinks(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('setFlagToCheckRoute', () => {
    it('should set routeFromSelfRegistration to true when flag is true', () => {
      service.setFlagToCheckRoute(true)
      expect(service.routeFromSelfRegistration).toBe(true)
    })

    it('should set routeFromSelfRegistration to false when flag is false', () => {
      service.setFlagToCheckRoute(false)
      expect(service.routeFromSelfRegistration).toBe(false)
    })

    it('should update flag from false to true', () => {
      expect(service.routeFromSelfRegistration).toBe(false)
      service.setFlagToCheckRoute(true)
      expect(service.routeFromSelfRegistration).toBe(true)
    })

    it('should update flag from true to false', () => {
      service.setFlagToCheckRoute(true)
      expect(service.routeFromSelfRegistration).toBe(true)
      service.setFlagToCheckRoute(false)
      expect(service.routeFromSelfRegistration).toBe(false)
    })
  })

  describe('API_END_POINTS constants', () => {
    it('should use correct endpoint for QR code generation', () => {
      const mockRequest = {}
      httpClient.post.mockReturnValue(of({}))

      service.generateSelfRegistrationQRCode(mockRequest)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customselfregistration',
        mockRequest
      )
    })

    it('should use correct endpoint for getting registered links', () => {
      const mockRequest = {}
      httpClient.post.mockReturnValue(of({}))

      service.getListOfRegisteedLinks(mockRequest)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/customselfregistration/listallqrs',
        mockRequest
      )
    })
  })

  describe('Error handling', () => {
    it('should handle errors in generateSelfRegistrationQRCode', (done) => {
      const mockRequest = { data: 'test' }
      const mockError = new Error('Network error')

      httpClient.post.mockReturnValue(
        new Observable((subscriber: any) => subscriber.error(mockError))
      )

      service.generateSelfRegistrationQRCode(mockRequest).subscribe({
        next: () => { },
        error: (error) => {
          expect(error).toBe(mockError)
          done()
        }
      })
    })

    it('should handle errors in getListOfRegisteedLinks', (done) => {
      const mockRequest = { filter: 'active' }
      const mockError = new Error('Server error')

      httpClient.post.mockReturnValue(
        new Observable(subscriber => subscriber.error(mockError))
      )

      service.getListOfRegisteedLinks(mockRequest).subscribe({
        next: () => { },
        error: (error) => {
          expect(error).toBe(mockError)
          done()
        }
      })
    })
  })
})