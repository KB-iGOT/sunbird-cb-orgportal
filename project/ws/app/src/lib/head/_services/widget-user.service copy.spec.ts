import { of, throwError } from 'rxjs'
import { WidgetUserService } from './widget-user.service'
import { IUserGroupDetails } from './widget-user.model'
import { NsContent } from './widget-content.model'

// Mock HttpClient
const mockHttpClient = {
  get: jest.fn()
}

describe('WidgetUserService', () => {
  let service: WidgetUserService

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Create service instance with mocked HttpClient
    service = new WidgetUserService(mockHttpClient as any)
  })

  describe('handleError', () => {
    it('should return error message when error is an ErrorEvent', () => {
      const errorEvent = new ErrorEvent('test', { message: 'Test error message' })
      const mockError = { error: errorEvent } as any

      service.handleError(mockError).subscribe({
        error: (error) => {
          expect(error).toBe('Error: Test error message')
        }
      })
    })

    it('should return empty string when error is not an ErrorEvent', () => {
      const mockError = { error: 'Not an ErrorEvent' } as any

      service.handleError(mockError).subscribe({
        error: (error) => {
          expect(error).toBe('')
        }
      })
    })
  })

  describe('fetchUserGroupDetails', () => {
    it('should fetch user group details successfully', (done) => {
      const userId = 'test-user-123'
      const mockUserGroups: IUserGroupDetails[] = [
        {
          id: '1',
          name: 'Test Group 1',
          description: 'Test Description 1'
        } as unknown as IUserGroupDetails,
        {
          id: '2',
          name: 'Test Group 2',
          description: 'Test Description 2'
        } as unknown as IUserGroupDetails
      ]

      mockHttpClient.get.mockReturnValue(of(mockUserGroups))

      service.fetchUserGroupDetails(userId).subscribe({
        next: (result) => {
          expect(result).toEqual(mockUserGroups)
          expect(mockHttpClient.get).toHaveBeenCalledWith(
            `/apis/protected/v8/user/group/fetchUserGroup?userId=${userId}`
          )
          done()
        }
      })
    })

    it('should handle error when fetching user group details fails', (done) => {
      const userId = 'test-user-123'
      const errorEvent = new ErrorEvent('network', { message: 'Network error' })
      const mockError = { error: errorEvent }

      mockHttpClient.get.mockReturnValue(throwError(mockError))

      service.fetchUserGroupDetails(userId).subscribe({
        error: (error) => {
          expect(error).toBe('Error: Network error')
          expect(mockHttpClient.get).toHaveBeenCalledWith(
            `/apis/protected/v8/user/group/fetchUserGroup?userId=${userId}`
          )
          done()
        }
      })
    })

    it('should construct correct API endpoint with userId', () => {
      const userId = 'user-456'
      mockHttpClient.get.mockReturnValue(of([]))

      service.fetchUserGroupDetails(userId).subscribe()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/apis/protected/v8/user/group/fetchUserGroup?userId=${userId}`
      )
    })
  })

  describe('fetchUserBatchList', () => {
    it('should fetch user batch list successfully and extract courses', (done) => {
      const userId = 'test-user-123'
      const mockCourses: NsContent.ICourse[] = [
        {
          identifier: 'course-1',
          name: 'Course 1',
          contentType: 'Course'
        } as unknown as NsContent.ICourse,
        {
          identifier: 'course-2',
          name: 'Course 2',
          contentType: 'Course'
        } as unknown as NsContent.ICourse
      ]

      const mockResponse = {
        result: {
          courses: mockCourses
        }
      }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchUserBatchList(userId).subscribe({
        next: (result) => {
          expect(result).toEqual(mockCourses)
          expect(mockHttpClient.get).toHaveBeenCalledWith(
            `/apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,identifier,medium,pkgVersion,board,subject,trackable&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates`
          )
          done()
        }
      })
    })

    it('should handle undefined userId', (done) => {
      const userId = undefined
      const mockResponse = {
        result: {
          courses: []
        }
      }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchUserBatchList(userId).subscribe({
        next: (result) => {
          expect(result).toEqual([])
          expect(mockHttpClient.get).toHaveBeenCalledWith(
            `/apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,identifier,medium,pkgVersion,board,subject,trackable&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates`
          )
          done()
        }
      })
    })

    it('should handle error when fetching user batch list fails', (done) => {
      const userId = 'test-user-123'
      const errorEvent = new ErrorEvent('server', { message: 'Server error' })
      const mockError = { error: errorEvent }

      mockHttpClient.get.mockReturnValue(throwError(mockError))

      service.fetchUserBatchList(userId).subscribe({
        error: (error) => {
          expect(error).toBe('Error: Server error')
          done()
        }
      })
    })

    it('should map response data correctly to extract courses', (done) => {
      const userId = 'test-user-123'
      const mockCourses = [
        { identifier: 'course-1', name: 'Test Course' }
      ]
      const mockResponse = {
        result: {
          courses: mockCourses,
          otherData: 'ignored'
        }
      }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchUserBatchList(userId).subscribe({
        next: (result) => {
          expect(result).toEqual(mockCourses)
          done()
        }
      })
    })
  })

  describe('API Endpoints', () => {
    it('should construct FETCH_USER_GROUPS endpoint correctly', () => {
      const userId = 'test-123'
      mockHttpClient.get.mockReturnValue(of([]))

      service.fetchUserGroupDetails(userId).subscribe()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/group/fetchUserGroup?userId=test-123'
      )
    })

    it('should construct FETCH_USER_ENROLLMENT_LIST endpoint correctly', () => {
      const userId = 'test-456'
      mockHttpClient.get.mockReturnValue(of({ result: { courses: [] } }))

      service.fetchUserBatchList(userId).subscribe()

      const expectedUrl = `/apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,identifier,medium,pkgVersion,board,subject,trackable&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates`

      expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle non-ErrorEvent errors gracefully in fetchUserGroupDetails', (done) => {
      const userId = 'test-user'
      const mockError = { error: 'Simple string error' }

      mockHttpClient.get.mockReturnValue(throwError(mockError))

      service.fetchUserGroupDetails(userId).subscribe({
        error: (error) => {
          expect(error).toBe('')
          done()
        }
      })
    })

    it('should handle non-ErrorEvent errors gracefully in fetchUserBatchList', (done) => {
      const userId = 'test-user'
      const mockError = { error: { message: 'Object error' } }

      mockHttpClient.get.mockReturnValue(throwError(mockError))

      service.fetchUserBatchList(userId).subscribe({
        error: (error) => {
          expect(error).toBe('')
          done()
        }
      })
    })
  })

  describe('Service Construction', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(WidgetUserService)
    })

    it('should have HttpClient injected', () => {
      expect((service as any).http).toBeDefined()
    })
  })
})