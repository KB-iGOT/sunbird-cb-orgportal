import { ProfileV3Service } from './profile_v3.service'
import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn()
}

describe('ProfileV3Service', () => {
  let service: ProfileV3Service
  let httpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create service instance with mocked HttpClient
    httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>
    service = new ProfileV3Service(httpClient)
  })

  describe('getAllCompetencies', () => {
    it('should call http.post with correct endpoint and request data', () => {
      // Arrange
      const mockRequest = { search: 'javascript', type: 'competency' }
      const mockResponse = { data: ['competency1', 'competency2'] }
      httpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.getAllCompetencies(mockRequest)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/frac/searchNodes',
        mockRequest
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      // Verify observable returns expected data
      result.subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty request object', () => {
      // Arrange
      const mockRequest = {}
      const mockResponse = { data: [] }
      httpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.getAllCompetencies(mockRequest)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/frac/searchNodes',
        mockRequest
      )
    })
  })

  describe('updateCCProfileDetails', () => {
    it('should call http.post with correct endpoint and CC profile data', () => {
      // Arrange
      const mockData = {
        request: {
          userId: 'user123',
          profileDetails: {
            competencies: [
              { id: 'comp1', name: 'JavaScript' },
              { id: 'comp2', name: 'Angular' }
            ]
          }
        }
      }
      const mockResponse = { success: true }
      httpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.updateCCProfileDetails(mockData)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/extPatch',
        mockData
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      // Verify observable returns expected data
      result.subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty competencies array', () => {
      // Arrange
      const mockData = {
        request: {
          userId: 'user123',
          profileDetails: {
            competencies: []
          }
        }
      }
      httpClient.post.mockReturnValue(of({ success: true }))

      // Act
      service.updateCCProfileDetails(mockData)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/extPatch',
        mockData
      )
    })
  })

  describe('updateDCProfileDetails', () => {
    it('should call http.post with correct endpoint and DC profile data', () => {
      // Arrange
      const mockData = {
        request: {
          userId: 'user456',
          profileDetails: {
            desiredCompetencies: [
              { id: 'comp3', name: 'React' },
              { id: 'comp4', name: 'Node.js' }
            ]
          }
        }
      }
      const mockResponse = { success: true }
      httpClient.post.mockReturnValue(of(mockResponse))

      // Act
      const result = service.updateDCProfileDetails(mockData)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/extPatch',
        mockData
      )
      expect(httpClient.post).toHaveBeenCalledTimes(1)

      // Verify observable returns expected data
      result.subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle empty desired competencies array', () => {
      // Arrange
      const mockData = {
        request: {
          userId: 'user456',
          profileDetails: {
            desiredCompetencies: []
          }
        }
      }
      httpClient.post.mockReturnValue(of({ success: true }))

      // Act
      service.updateDCProfileDetails(mockData)

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/extPatch',
        mockData
      )
    })
  })

  describe('getUserdetailsFromRegistry', () => {
    it('should call http.get with correct endpoint and return mapped response', () => {
      // Arrange
      const wid = 'user789'
      const mockApiResponse = {
        result: {
          response: {
            id: 'user789',
            name: 'John Doe',
            email: 'john.doe@example.com'
          }
        }
      }
      const expectedMappedResponse = {
        id: 'user789',
        name: 'John Doe',
        email: 'john.doe@example.com'
      }
      httpClient.get.mockReturnValue(of(mockApiResponse))

      // Act
      const result = service.getUserdetailsFromRegistry(wid)

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/api/user/v2/read/user789'
      )
      expect(httpClient.get).toHaveBeenCalledTimes(1)

      // Verify observable returns mapped data
      result.subscribe((response: any) => {
        expect(response).toEqual(expectedMappedResponse)
      })
    })

    it('should handle special characters in wid parameter', () => {
      // Arrange
      const wid = 'user@123'
      const mockApiResponse = {
        result: {
          response: { id: 'user@123' }
        }
      }
      httpClient.get.mockReturnValue(of(mockApiResponse))

      // Act
      service.getUserdetailsFromRegistry(wid)

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/api/user/v2/read/user@123'
      )
    })

    it('should handle nested response structure correctly', () => {
      // Arrange
      const wid = 'user456'
      const mockApiResponse = {
        result: {
          response: {
            personalDetails: {
              name: 'Jane Smith'
            },
            professionalDetails: {
              designation: 'Developer'
            }
          }
        }
      }
      httpClient.get.mockReturnValue(of(mockApiResponse))

      // Act
      const result = service.getUserdetailsFromRegistry(wid)

      // Assert
      result.subscribe((response: any) => {
        expect(response).toEqual(mockApiResponse.result.response)
        expect(response.personalDetails.name).toBe('Jane Smith')
        expect(response.professionalDetails.designation).toBe('Developer')
      })
    })
  })

  describe('Error handling', () => {
    it('should handle http errors in getAllCompetencies', (done) => {
      const mockRequest = { search: 'test' }
      const mockError = new Error('HTTP Error')
      httpClient.post.mockReturnValue(throwError(mockError))

      service.getAllCompetencies(mockRequest).subscribe({
        next: () => fail('expected error'),
        error: err => { expect(err).toBe(mockError); done() },
      })
    })

    it('should handle http errors in updateCCProfileDetails', (done) => {
      const mockData = { request: { userId: 'user123', profileDetails: { competencies: [] } } }
      const mockError = new Error('HTTP Error')
      httpClient.post.mockReturnValue(throwError(mockError))

      service.updateCCProfileDetails(mockData).subscribe({
        next: () => fail('expected error'),
        error: err => { expect(err).toBe(mockError); done() },
      })
    })

    it('should handle http errors in getUserdetailsFromRegistry', (done) => {
      const wid = 'user123'
      const mockError = new Error('HTTP Error')
      httpClient.get.mockReturnValue(throwError(mockError))

      service.getUserdetailsFromRegistry(wid).subscribe({
        next: () => fail('expected error'),
        error: err => { expect(err).toBe(mockError); done() },
      })
    })
  })

  describe('Service initialization', () => {
    it('should create service instance successfully', () => {
      expect(service).toBeDefined()
      expect(service instanceof ProfileV3Service).toBeTruthy()
    })

    it('should have http client injected', () => {
      expect((service as any).http).toBeDefined()
    })
  })
})