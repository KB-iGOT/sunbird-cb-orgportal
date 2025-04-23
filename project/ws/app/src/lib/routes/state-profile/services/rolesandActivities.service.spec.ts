import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { RolesAndActivityService } from './rolesandActivities.service'

describe('RolesAndActivityService', () => {
  let service: RolesAndActivityService
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    // Create a mock for the HttpClient
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    // Initialize the service with the mock
    service = new RolesAndActivityService(mockHttpClient)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('loadRoles', () => {
    it('should call the correct API endpoint with the keyword', () => {
      // Arrange
      const keyword = 'admin'
      const mockResponse = { roles: ['admin', 'editor'] }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      service.loadRoles(keyword).subscribe((response: any) => {
        // Assert
        expect(response).toEqual(mockResponse)
      })

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith('apis/protected/v8/roleactivity/admin')
    })
  })

  describe('createRoles', () => {
    it('should call the correct API endpoint with the role data', () => {

      const mockResponse = { response: 'success' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      // Assert      })

      // Assert
    })
  })
})