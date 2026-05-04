import { NotificationsService } from './notifications.service'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'
import * as _ from 'lodash'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn()
}))

describe('NotificationsService', () => {
  let service: NotificationsService
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockRouter: jest.Mocked<Router>
  let mockConfigService: jest.Mocked<ConfigurationsService>
  let mockSnackBar: any
  let mockEnvironment: any

  beforeEach(() => {
    // Create mocks
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    } as any

    mockRouter = {
      navigate: jest.fn()
    } as any

    mockConfigService = {
      unMappedUser: {
        profileDetails: {
          employmentDetails: {
            departmentName: 'Test Department'
          }
        }
      }
    } as any

    mockSnackBar = {
      open: jest.fn()
    }

    mockEnvironment = {
      portalsForNotifications: {
        learner: 'http://learner.test',
        cbp: 'http://cbp.test'
      }
    }

    // Create service instance
    service = new NotificationsService(mockHttpClient, mockConfigService, mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })
  })

  describe('Constructor', () => {
    it('should create service and set orgName from config', () => {
      expect(service).toBeDefined()
      expect(service.orgName).toBe('Test Department')
    })

    it('should handle missing config data gracefully', () => {
      const mockConfigWithoutData = {} as any
      const serviceWithoutConfig = new NotificationsService(mockHttpClient, mockConfigWithoutData, mockRouter)
      expect(serviceWithoutConfig.orgName).toBe('')
    })

    it('should handle partial config data', () => {
      const mockConfigPartial = {
        unMappedUser: {
          profileDetails: {}
        }
      } as any
      const servicePartial = new NotificationsService(mockHttpClient, mockConfigPartial, mockRouter)
      expect(servicePartial.orgName).toBe('')
    })
  })

  describe('getNotificationsData', () => {
    it('should call http get with correct endpoint', () => {
      const mockResponse = { count: 5 }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getNotificationsData().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith('apis/proxies/v8/v1/notifications/unread/count')
    })
  })

  describe('getContentData', () => {
    it('should get content data and map result', () => {
      const contentId = 'test-content-id'
      const mockResponse = {
        result: {
          content: { id: contentId, title: 'Test Content' }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getContentData(contentId).subscribe(result => {
        expect(result).toEqual(mockResponse.result.content)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/proxies/v8/action/content/v3/read/test-content-id')
    })

    it('should retry once on failure', () => {
      const contentId = 'test-content-id'
      mockHttpClient.get.mockReturnValue(throwError('Network error'))

      service.getContentData(contentId).subscribe(
        () => { },
        error => {
          expect(error).toBe('Network error')
        }
      )

      expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/proxies/v8/action/content/v3/read/test-content-id')
    })
  })

  describe('searchWorkflowSearch', () => {
    it('should post request with correct endpoint', () => {
      const mockRequest = { test: 'data' }
      const mockResponse = { result: 'success' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.searchWorkflowSearch(mockRequest).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith('apis/protected/v8/workflowhandler/profileApprovalSearch', mockRequest)
    })
  })

  describe('getMyRequests', () => {
    it('should get connection requests and map result', () => {
      const mockResponse = {
        result: {
          data: [{ id: 1, userId: 'user1' }]
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getMyRequests().subscribe(result => {
        expect(result).toEqual(mockResponse.result.data)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith('apis/protected/v8/connections/v2/connections/requests/received?pageNo=0&pageSize=100')
    })
  })

  describe('resetNotificationsCount', () => {
    it('should call reset endpoint', () => {
      const mockResponse = { success: true }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.resetNotificationsCount().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith('apis/proxies/v8/v1/notifications/reset/unread/count', {})
    })
  })

  describe('handleNetworkRedirection', () => {
    beforeEach(() => {
      // Mock window.open
      Object.defineProperty(window, 'open', {
        value: jest.fn(),
        writable: true
      })
    })

    it('should show snackbar for REJECTED_CONNECTION_REQUEST', () => {
      const notification = { sub_category: 'REJECTED_CONNECTION_REQUEST' }

      service.handleNetworkRedirection(notification, mockSnackBar, mockEnvironment)

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.')
    })

    it('should handle SEND_CONNECTION_REQUEST with valid connection', () => {
      const notification = {
        sub_category: 'SEND_CONNECTION_REQUEST',
        message: { data: { id: 'user1' } }
      }
      const mockRequests = [{ userId: 'user1', status: 'pending' }]
      mockHttpClient.get.mockReturnValue(of({ result: { data: mockRequests } }))

      service.handleNetworkRedirection(notification, mockSnackBar, mockEnvironment)

      expect(window.open).toHaveBeenCalledWith('http://learner.test/app/network-v2/connections', '_blank')
    })

    it('should show snackbar for SEND_CONNECTION_REQUEST without valid connection', () => {
      const notification = {
        sub_category: 'SEND_CONNECTION_REQUEST',
        message: { data: { id: 'user2' } }
      }
      const mockRequests = [{ userId: 'user1', status: 'pending' }]
      mockHttpClient.get.mockReturnValue(of({ result: { data: mockRequests } }))

      service.handleNetworkRedirection(notification, mockSnackBar, mockEnvironment)

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.')
    })

    it('should show snackbar for SEND_CONNECTION_REQUEST with empty response', () => {
      const notification = {
        sub_category: 'SEND_CONNECTION_REQUEST',
        message: { data: { id: 'user1' } }
      }
      mockHttpClient.get.mockReturnValue(of({ result: { data: [] } }))

      service.handleNetworkRedirection(notification, mockSnackBar, mockEnvironment)

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.')
    })

    it('should open network URL for other sub_categories', () => {
      const notification = { sub_category: 'OTHER_REQUEST' }

      service.handleNetworkRedirection(notification, mockSnackBar, mockEnvironment)

      expect(window.open).toHaveBeenCalledWith('http://learner.test/app/network-v2/connections', '_blank')
    })
  })

  describe('handleReviewStatus', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'open', {
        value: jest.fn(),
        writable: true
      })
    })

    it('should handle InReview status with CONTENT_REVIEWER role', () => {
      const res = { reviewStatus: 'InReview' }
      const notification = { message: { data: { id: 'content-id' } } }
      const roles = ['CONTENT_REVIEWER']

      service.handleReviewStatus(res, notification, true, roles, mockEnvironment, mockSnackBar)

      expect(window.open).toHaveBeenCalledWith(
        'http://cbp.test/author/editor/content-id/collectionV2?isStandaloneResource=true&preview=true&editMode=true&status=Review&reviewStatus=InReview',
        '_blank'
      )
    })

    it('should show unauthorized message for InReview without CONTENT_REVIEWER role', () => {
      const res = { reviewStatus: 'InReview' }
      const notification = { message: { data: { id: 'content-id' } } }
      const roles = ['OTHER_ROLE']

      service.handleReviewStatus(res, notification, false, roles, mockEnvironment, mockSnackBar)

      expect(mockSnackBar.open).toHaveBeenCalledWith('You are not authorized to view this content.')
    })

    it('should handle Reviewed status with CONTENT_PUBLISHER role', () => {
      const res = { reviewStatus: 'Reviewed' }
      const notification = { message: { data: { id: 'content-id' } } }
      const roles = ['CONTENT_PUBLISHER']

      service.handleReviewStatus(res, notification, false, roles, mockEnvironment, mockSnackBar)

      expect(window.open).toHaveBeenCalledWith(
        'http://cbp.test/author/editor/content-id/collectionV2?isStandaloneResource=false',
        '_blank'
      )
    })

    it('should show unauthorized message for Reviewed without CONTENT_PUBLISHER role', () => {
      const res = { reviewStatus: 'Reviewed' }
      const notification = { message: { data: { id: 'content-id' } } }
      const roles = ['OTHER_ROLE']

      service.handleReviewStatus(res, notification, false, roles, mockEnvironment, mockSnackBar)

      expect(mockSnackBar.open).toHaveBeenCalledWith('You are not authorized to view this content.')
    })
  })

  describe('handleRedirection', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'open', {
        value: jest.fn(),
        writable: true
      })
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: jest.fn(),
          getItem: jest.fn(),
          clear: jest.fn()
        },
        writable: true
      });
      (_.get as jest.Mock).mockImplementation((obj, path, defaultValue) => {
        if (path === 'result.data') return obj?.result?.data || defaultValue
        return defaultValue
      })
    })

    it('should handle PROFILE category with PROFILE_VERIFICATION sub_category and pending user', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'PROFILE_VERIFICATION',
        message: { data: { id: 'user-id' } }
      }
      const mockResponse = {
        result: {
          data: [
            { wfInfo: [{ userId: 'user-id' }] }
          ]
        }
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.handleRedirection(notification, mockEnvironment, ['ADMIN'], mockSnackBar)

      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/home/approvals/approval'])
    })

    it('should handle PROFILE category with PROFILE_VERIFICATION and no pending user', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'PROFILE_VERIFICATION',
        message: { data: { id: 'user-id' } }
      }
      const mockResponse = {
        result: {
          data: [
            { wfInfo: [{ userId: 'other-user-id' }] }
          ]
        }
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.handleRedirection(notification, mockEnvironment, ['ADMIN'], mockSnackBar)

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.')
    })

    it('should handle PROFILE category with USER_TRANSFER and no pending user', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'USER_TRANSFER',
        message: { data: { id: 'user-id' } }
      }
      const mockResponse = {
        result: {
          data: []
        }
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.handleRedirection(notification, mockEnvironment, ['ADMIN'], mockSnackBar)

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.')
    })

    it('should handle PROFILE category workflow search error', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'PROFILE_VERIFICATION',
        message: { data: { id: 'user-id' } }
      }
      mockHttpClient.post.mockReturnValue(throwError('API Error'))
      jest.spyOn(console, 'error').mockImplementation(() => { })

      service.handleRedirection(notification, mockEnvironment, ['ADMIN'], mockSnackBar)

      expect(console.error).toHaveBeenCalledWith('Error while fetching workflow search data', 'API Error')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error while fetching approval data')
    })

    it('should handle LEARN category', () => {
      const notification = {
        category: 'LEARN',
        message: { data: { id: 'content-id' } }
      }

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(window.open).toHaveBeenCalledWith('http://learner.test/app/toc/content-id', '_blank')
    })

    it('should handle NETWORK category', () => {
      const notification = {
        category: 'NETWORK',
        sub_category: 'REJECTED_CONNECTION_REQUEST'
      }
      jest.spyOn(service, 'handleNetworkRedirection')

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(service.handleNetworkRedirection).toHaveBeenCalledWith(notification, mockSnackBar, mockEnvironment)
    })

    it('should handle EVENT category', () => {
      const notification = {
        category: 'EVENT',
        message: { data: { id: 'event-id' } }
      }

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(window.open).toHaveBeenCalledWith('http://learner.test/app/event-hub/home/event-id', '_blank')
    })

    it('should handle DISCUSSION category', () => {
      const notification = {
        category: 'DISCUSSION',
        message: {
          data: {
            communityId: 'community-id',
            discussionId: 'discussion-id'
          }
        }
      }

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(window.open).toHaveBeenCalledWith('http://learner.test/app/discussion-forum-v2/community/community-id/discussion-id', '_blank')
    })

    it('should handle CONTENT category with Live status', () => {
      const notification = {
        category: 'CONTENT',
        message: { data: { id: 'content-id' } }
      }
      const mockContentResponse = {
        result: {
          content: {
            status: 'Live',
            primaryCategory: 'Course',
            resourceCategory: 'Course'
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockContentResponse))

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(window.localStorage.setItem).toHaveBeenCalledWith('isStandaloneResource', 'false')
      expect(window.open).toHaveBeenCalledWith('http://cbp.test/author/content-detail/content-id/overview-v2?isStandaloneResource=false', '_blank')
    })

    it('should handle CONTENT category with standalone resource', () => {
      const notification = {
        category: 'CONTENT',
        message: { data: { id: 'content-id' } }
      }
      const mockContentResponse = {
        result: {
          content: {
            status: 'Live',
            primaryCategory: 'Learning Resource',
            resourceCategory: 'Video'
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockContentResponse))

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(window.localStorage.setItem).toHaveBeenCalledWith('isStandaloneResource', 'true')
    })

    it('should handle CONTENT category with Draft status and CONTENT_CREATOR role', () => {
      const notification = {
        category: 'CONTENT',
        message: { data: { id: 'content-id' } }
      }
      const mockContentResponse = {
        result: {
          content: {
            status: 'Draft',
            primaryCategory: 'Course'
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockContentResponse))

      service.handleRedirection(notification, mockEnvironment, ['CONTENT_CREATOR'], mockSnackBar)

      expect(window.open).toHaveBeenCalledWith('http://cbp.test/author/editor/content-id/collectionV2?isStandaloneResource=false', '_blank')
    })

    it('should handle CONTENT category with Draft status without CONTENT_CREATOR role', () => {
      const notification = {
        category: 'CONTENT',
        message: { data: { id: 'content-id' } }
      }
      const mockContentResponse = {
        result: {
          content: {
            status: 'Draft',
            primaryCategory: 'Course'
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockContentResponse))

      service.handleRedirection(notification, mockEnvironment, ['OTHER_ROLE'], mockSnackBar)

      expect(mockSnackBar.open).toHaveBeenCalledWith('You are not authorized to view this content.')
    })

    it('should handle CONTENT category with Review status', () => {
      const notification = {
        category: 'CONTENT',
        message: { data: { id: 'content-id' } }
      }
      const mockContentResponse = {
        result: {
          content: {
            status: 'Review',
            reviewStatus: 'InReview',
            primaryCategory: 'Course'
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockContentResponse))
      jest.spyOn(service, 'handleReviewStatus')

      service.handleRedirection(notification, mockEnvironment, ['CONTENT_REVIEWER'], mockSnackBar)

      expect(service.handleReviewStatus).toHaveBeenCalledWith(
        mockContentResponse.result.content,
        notification,
        false,
        ['CONTENT_REVIEWER'],
        mockEnvironment,
        mockSnackBar
      )
    })

    it('should handle CONTENT category with Retired status', () => {
      const notification = {
        category: 'CONTENT',
        message: { data: { id: 'content-id' } }
      }
      const mockContentResponse = {
        result: {
          content: {
            status: 'Retired',
            primaryCategory: 'Course'
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockContentResponse))

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(mockSnackBar.open).toHaveBeenCalledWith('This content is retired.')
    })

    it('should handle category with includes method', () => {
      const notification = {
        category: 'CONTENT_CREATION',
        message: { data: { id: 'content-id' } }
      }
      const mockContentResponse = {
        result: {
          content: {
            status: 'Live',
            primaryCategory: 'Course'
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockContentResponse))

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/proxies/v8/action/content/v3/read/content-id')
    })

    it('should navigate to notifications for unknown categories', () => {
      const notification = {
        category: 'UNKNOWN',
        message: { data: { id: 'some-id' } }
      }

      service.handleRedirection(notification, mockEnvironment, [], mockSnackBar)

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/notifications'])
    })
  })
})