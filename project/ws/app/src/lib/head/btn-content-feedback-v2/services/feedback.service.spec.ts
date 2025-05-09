import { FeedbackService } from './feedback.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import {
  IFeedbackSearchQuery,
  IFeedback,
  IFeedbackThread,
  IFeedbackSearchResult,
  IFeedbackSummary,
  IFeedbackConfig,
  INotificationRequest,
  EFeedbackType,
  EFeedbackRole
} from '../models/feedback.model'
import { NsContent } from '@sunbird-cb/utils'

describe('FeedbackService', () => {
  let service: FeedbackService
  let httpClientMock: jest.Mocked<HttpClient>

  // API constants
  const FEEDBACK_API_BASE = '/apis/protected/v8/user/feedbackV2'
  const EVENT_NOTIFICATION = '/apis/protected/v8/user/share/content'

  // Mock data for tests
  const mockFeedbackSearchQuery: IFeedbackSearchQuery = {
    query: 'test',
    filters: {},
    viewedBy: '',
    all: false,
    from: 0,
    size: 0
  }

  const mockFeedbackSearchResult: IFeedbackSearchResult = {
    result: [
      {
        category: 'platform',
        createdOn: new Date(),
        assignedTo: {
          email: '',
          name: '',
          uuid: ''
        },
        contentDesc: '',
        contentId: '',
        contentTitle: '',
        contentType: NsContent.EContentTypes.PROGRAM,
        dimension: '',
        feedbackBy: {
          email: '',
          name: '',
          userId: ''
        },
        feedbackCategory: '',
        feedbackId: '',
        feedbackSentimentCategory: 'positive',
        feedbackSentimentValue: 0,
        feedbackText: '',
        feedbackType: EFeedbackType.Content,
        lastActivityOn: new Date(),
        lastUpdatedOn: new Date(),
        replied: false,
        rootFeedbackId: '',
        rootOrg: '',
        seenReply: false
      }
    ],
    hits: 0
  }

  const mockFeedbackThread: IFeedbackThread[] = [
    {
      category: 'platform',
      createdOn: new Date(),
      assignedTo: {
        email: '',
        name: '',
        uuid: ''
      },
      contentDesc: '',
      contentId: '',
      contentTitle: '',
      contentType: NsContent.EContentTypes.PROGRAM,
      dimension: '',
      feedbackBy: {
        email: '',
        name: '',
        userId: ''
      },
      feedbackCategory: '',
      feedbackId: '',
      feedbackSentimentCategory: 'positive',
      feedbackSentimentValue: 0,
      feedbackText: '',
      feedbackType: EFeedbackType.Content,
      lastActivityOn: new Date(),
      lastUpdatedOn: new Date(),
      replied: false,
      rootFeedbackId: '',
      rootOrg: '',
      seenReply: false
    }
  ]

  const mockFeedback: IFeedback = {
    text: 'Test feedback submission',
    category: 'platform',
    contentId: 'content-1',
    role: EFeedbackRole.User,
    type: EFeedbackType.Content
  }

  const mockNotificationRequest: INotificationRequest = {
    'event-id': 'platform_feedback',
    'tag-value-pair': {
      '#feedback': 'This is feedback content'
    },
    recipients: {
      learner: ['user1', 'user2']
    }
  }

  const mockFeedbackSummary: IFeedbackSummary = {
    forActionCount: 0,
    roles: [],
    totalCount: 0
  }

  const mockFeedbackConfig: IFeedbackConfig = {
    feedbackCategories: [],
    feedbackSentimentMode: false
  }

  beforeEach(() => {
    // Create mock for HttpClient
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    // Create service instance with the mock
    service = new FeedbackService(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('searchFeedback', () => {
    it('should call the correct API endpoint with the provided query', () => {
      // Setup mock response
      httpClientMock.post.mockReturnValue(of(mockFeedbackSearchResult))

      // Call the service method
      let result: IFeedbackSearchResult | undefined
      service.searchFeedback(mockFeedbackSearchQuery).subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.post).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/search`,
        mockFeedbackSearchQuery
      )

      // Verify result
      expect(result).toEqual(mockFeedbackSearchResult)
    })
  })

  describe('getFeedbackThread', () => {
    it('should call the correct API endpoint with the provided feedback ID', () => {
      // Setup mock response
      httpClientMock.get.mockReturnValue(of(mockFeedbackThread))

      // Call the service method
      let result: IFeedbackThread[] | undefined
      service.getFeedbackThread('feedback-1').subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/feedback-1`
      )

      // Verify result
      expect(result).toEqual(mockFeedbackThread)
    })
  })

  describe('submitPlatformFeedback', () => {
    it('should call the correct API endpoint with the provided feedback', () => {
      // Setup mock response
      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      // Call the service method
      let result: any
      service.submitPlatformFeedback(mockFeedback).subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.post).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/platform`,
        mockFeedback
      )

      // Verify result
      expect(result).toEqual(mockResponse)
    })
  })

  describe('contentShareNew', () => {
    it('should call the correct API endpoint with the provided notification request', () => {
      // Setup mock response
      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      // Call the service method
      let result: any
      service.contentShareNew(mockNotificationRequest).subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.post).toHaveBeenCalledWith(
        EVENT_NOTIFICATION,
        mockNotificationRequest
      )

      // Verify result
      expect(result).toEqual(mockResponse)
    })
  })

  describe('submitContentFeedback', () => {
    it('should call the correct API endpoint with the provided content feedback', () => {
      // Setup mock response
      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      // Call the service method
      let result: any
      service.submitContentFeedback(mockFeedback).subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.post).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/content/${mockFeedback.contentId}`,
        mockFeedback
      )

      // Verify result
      expect(result).toEqual(mockResponse)
    })
  })

  describe('submitContentRequest', () => {
    it('should call the correct API endpoint with the provided content request', () => {
      // Setup mock response
      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      // Call the service method
      let result: any
      service.submitContentRequest(mockFeedback).subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.post).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/content-request`,
        mockFeedback
      )

      // Verify result
      expect(result).toEqual(mockResponse)
    })
  })

  describe('submitServiceRequest', () => {
    it('should call the correct API endpoint with the provided service request', () => {
      // Setup mock response
      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      // Call the service method
      let result: any
      service.submitServiceRequest(mockFeedback).subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.post).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/service-request`,
        mockFeedback
      )

      // Verify result
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getFeedbackSummary', () => {
    it('should call the correct API endpoint to get feedback summary', () => {
      // Setup mock response
      httpClientMock.get.mockReturnValue(of(mockFeedbackSummary))

      // Call the service method
      let result: IFeedbackSummary | undefined
      service.getFeedbackSummary().subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/feedback-summary`
      )

      // Verify result
      expect(result).toEqual(mockFeedbackSummary)
    })
  })

  describe('updateFeedbackStatus', () => {
    it('should call the correct API endpoint with the feedback ID only', () => {
      // Setup mock response
      const mockResponse: IFeedbackThread = mockFeedbackThread[0]
      httpClientMock.patch.mockReturnValue(of(mockResponse))

      // Call the service method
      let result: IFeedbackThread | undefined
      service.updateFeedbackStatus('feedback-1').subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.patch).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/feedback-1`,
        {}
      )

      // Verify result
      expect(result).toEqual(mockResponse)
    })

    it('should include category as a query parameter when provided', () => {
      // Setup mock response
      const mockResponse: IFeedbackThread = mockFeedbackThread[0]
      httpClientMock.patch.mockReturnValue(of(mockResponse))

      // Call the service method with category
      let result: IFeedbackThread | undefined
      service.updateFeedbackStatus('feedback-1', 'platform').subscribe(res => {
        result = res
      })

      // Verify HTTP call with category query parameter
      expect(httpClientMock.patch).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/feedback-1?category=platform`,
        {}
      )

      // Verify result
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getFeedbackConfig', () => {
    it('should call the correct API endpoint to get feedback configuration', () => {
      // Setup mock response
      httpClientMock.get.mockReturnValue(of(mockFeedbackConfig))

      // Call the service method
      let result: IFeedbackConfig | undefined
      service.getFeedbackConfig().subscribe(res => {
        result = res
      })

      // Verify HTTP call
      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${FEEDBACK_API_BASE}/config`
      )

      // Verify result
      expect(result).toEqual(mockFeedbackConfig)
    })
  })
})