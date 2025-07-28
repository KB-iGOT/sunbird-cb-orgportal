import { OrgUserService } from './org-user.service'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { of } from 'rxjs'
import * as _ from 'lodash'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn()
}))

describe('OrgUserService', () => {
  let service: OrgUserService
  let httpClientSpy: jest.Mocked<HttpClient>
  let configSvcSpy: jest.Mocked<ConfigurationsService>
  let mockLodashGet: jest.MockedFunction<typeof _.get>

  beforeEach(() => {
    // Create spy objects
    httpClientSpy = {
      get: jest.fn(),
      post: jest.fn()
    } as any

    configSvcSpy = {
      userProfile: {
        rootOrgId: 'test-root-org-id'
      }
    } as any

    mockLodashGet = _.get as jest.MockedFunction<typeof _.get>

    // Create service instance
    service = new OrgUserService(httpClientSpy, configSvcSpy)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserSearchList', () => {
    it('should call HTTP GET with correct URL and return mapped response', (done) => {
      // Arrange
      const userText = 'john'
      const mockResponse = { result: { response: ['user1', 'user2'] } }
      const expectedMappedResponse = ['user1', 'user2']

      httpClientSpy.get.mockReturnValue(of(mockResponse))
      mockLodashGet.mockReturnValue(expectedMappedResponse)

      // Act
      service.getUserSearchList(userText).subscribe(result => {
        // Assert
        expect(httpClientSpy.get).toHaveBeenCalledWith(`/apis/proxies/v8/user/v1/autocomplete/${userText}`)
        expect(mockLodashGet).toHaveBeenCalledWith(mockResponse, 'result.response')
        expect(result).toEqual(expectedMappedResponse)
        done()
      })
    })

    it('should handle empty user text', (done) => {
      // Arrange
      const userText = ''
      const mockResponse = { result: { response: [] } }
      const expectedMappedResponse: any[] = []

      httpClientSpy.get.mockReturnValue(of(mockResponse))
      mockLodashGet.mockReturnValue(expectedMappedResponse)

      // Act
      service.getUserSearchList(userText).subscribe(result => {
        // Assert
        expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/autocomplete/')
        expect(result).toEqual(expectedMappedResponse)
        done()
      })
    })
  })

  describe('getOrgUsersList', () => {
    it('should return HTTP POST response when rootOrgId exists and responseCode is OK', (done) => {
      // Arrange
      const mockResponse = {
        responseCode: 'OK',
        result: {
          response: ['user1', 'user2']
        }
      }
      const expectedPostData = {
        request: {
          filters: {
            'organisations.organisationId': 'test-root-org-id'
          }
        }
      }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.getOrgUsersList().subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', expectedPostData)
        expect(result).toEqual(['user1', 'user2'])
        done()
      })
    })

    it('should return undefined when responseCode is not OK', (done) => {
      // Arrange
      const mockResponse = {
        responseCode: 'ERROR',
        result: {
          response: ['user1', 'user2']
        }
      }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.getOrgUsersList().subscribe(result => {
        // Assert
        expect(result).toBeUndefined()
        done()
      })
    })

    it('should return empty array when rootOrgId is not available (userProfile is null)', (done) => {
      // Arrange
      configSvcSpy.userProfile = null as any

      // Act
      service.getOrgUsersList().subscribe(result => {
        // Assert
        expect(httpClientSpy.post).not.toHaveBeenCalled()
        expect(result).toEqual([])
        done()
      })
    })

    it('should return empty array when rootOrgId is not available (userProfile exists but no rootOrgId)', (done) => {
      // Arrange
      configSvcSpy.userProfile = {} as any

      // Act
      service.getOrgUsersList().subscribe(result => {
        // Assert
        expect(httpClientSpy.post).not.toHaveBeenCalled()
        expect(result).toEqual([])
        done()
      })
    })

    it('should return empty array when userProfile is undefined', (done) => {
      // Arrange
      configSvcSpy.userProfile = undefined as any

      // Act
      service.getOrgUsersList().subscribe(result => {
        // Assert
        expect(httpClientSpy.post).not.toHaveBeenCalled()
        expect(result).toEqual([])
        done()
      })
    })
  })

  describe('addToBatch', () => {
    it('should call HTTP POST with correct URL and data', (done) => {
      // Arrange
      const testData = { userId: 'user123', batchId: 'batch456' }
      const mockResponse = { success: true }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.addToBatch(testData).subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/authApi/batch/addUser', testData)
        expect(result).toEqual(mockResponse)
        done()
      })
    })

    it('should handle null data', (done) => {
      // Arrange
      const testData = null
      const mockResponse = { error: 'Invalid data' }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.addToBatch(testData).subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/authApi/batch/addUser', testData)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('inviteUserToBatch', () => {
    it('should call HTTP POST with correct URL and data', (done) => {
      // Arrange
      const testData = { userId: 'user123', programId: 'program456' }
      const mockResponse = { invitationSent: true }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.inviteUserToBatch(testData).subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/proxies/v8/program/v1/admin/enrol', testData)
        expect(result).toEqual(mockResponse)
        done()
      })
    })

    it('should handle empty object data', (done) => {
      // Arrange
      const testData = {}
      const mockResponse = { success: false }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.inviteUserToBatch(testData).subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/proxies/v8/program/v1/admin/enrol', testData)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('getUser', () => {
    it('should call HTTP GET with correct URL and return mapped response', (done) => {
      // Arrange
      const userId = 'user123'
      const mockResponse = { result: { response: { id: 'user123', name: 'John Doe' } } }
      const expectedMappedResponse = { id: 'user123', name: 'John Doe' }

      httpClientSpy.get.mockReturnValue(of(mockResponse))
      mockLodashGet.mockReturnValue(expectedMappedResponse)

      // Act
      service.getUser(userId).subscribe(result => {
        // Assert
        expect(httpClientSpy.get).toHaveBeenCalledWith(`/apis/proxies/v8/api/user/v2/read/${userId}`)
        expect(mockLodashGet).toHaveBeenCalledWith(mockResponse, 'result.response')
        expect(result).toEqual(expectedMappedResponse)
        done()
      })
    })

    it('should handle special characters in userId', (done) => {
      // Arrange
      const userId = 'user@123.test'
      const mockResponse = { result: { response: { id: 'user@123.test' } } }
      const expectedMappedResponse = { id: 'user@123.test' }

      httpClientSpy.get.mockReturnValue(of(mockResponse))
      mockLodashGet.mockReturnValue(expectedMappedResponse)

      // Act
      service.getUser(userId).subscribe(result => {
        // Assert
        expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/user@123.test')
        expect(result).toEqual(expectedMappedResponse)
        done()
      })
    })

    it('should handle empty userId', (done) => {
      // Arrange
      const userId = ''
      const mockResponse = { result: { response: null } }
      const expectedMappedResponse = null

      httpClientSpy.get.mockReturnValue(of(mockResponse))
      mockLodashGet.mockReturnValue(expectedMappedResponse)

      // Act
      service.getUser(userId).subscribe(result => {
        // Assert
        expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/')
        expect(result).toEqual(expectedMappedResponse)
        done()
      })
    })
  })

  describe('removeUserFromBatch', () => {
    it('should call HTTP POST with correct URL and data', (done) => {
      // Arrange
      const testData = {
        request: {
          courseId: 'course123',
          batchId: 'batch456',
          userId: 'user789'
        }
      }
      const mockResponse = { removed: true }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.removeUserFromBatch(testData).subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/authApi/batch/removeUser', testData)
        expect(result).toEqual(mockResponse)
        done()
      })
    })

    it('should handle data with null values in request', (done) => {
      // Arrange
      const testData = {
        request: {
          courseId: null,
          batchId: null,
          userId: null
        }
      }
      const mockResponse = { error: 'Invalid request' }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.removeUserFromBatch(testData).subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/authApi/batch/removeUser', testData)
        expect(result).toEqual(mockResponse)
        done()
      })
    })

    it('should handle data with undefined values in request', (done) => {
      // Arrange
      const testData = {
        request: {
          courseId: undefined,
          batchId: undefined,
          userId: undefined
        }
      }
      const mockResponse = { error: 'Invalid request data' }

      httpClientSpy.post.mockReturnValue(of(mockResponse))

      // Act
      service.removeUserFromBatch(testData).subscribe(result => {
        // Assert
        expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/authApi/batch/removeUser', testData)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('API_END_POINTS', () => {
    it('should generate correct READ_OTHER_USER URL', () => {
      // This tests the API endpoint function
      const userId = 'testUser123'
      const expectedUrl = '/apis/proxies/v8/api/user/v2/read/testUser123'

      // We can test this indirectly by calling getUser and checking the URL
      const mockResponse = { result: { response: {} } }
      httpClientSpy.get.mockReturnValue(of(mockResponse))
      mockLodashGet.mockReturnValue({})

      service.getUser(userId).subscribe()

      expect(httpClientSpy.get).toHaveBeenCalledWith(expectedUrl)
    })

    it('should generate correct AUTO_USERSEARCH URL', () => {
      // This tests the API endpoint function
      const userText = 'searchText'
      const expectedUrl = '/apis/proxies/v8/user/v1/autocomplete/searchText'

      // We can test this indirectly by calling getUserSearchList and checking the URL
      const mockResponse = { result: { response: [] } }
      httpClientSpy.get.mockReturnValue(of(mockResponse))
      mockLodashGet.mockReturnValue([])

      service.getUserSearchList(userText).subscribe()

      expect(httpClientSpy.get).toHaveBeenCalledWith(expectedUrl)
    })
  })
})