import { WidgetContentShareService } from './widget-content-share.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { NsContent } from './widget-content.model'
import { NsShare } from './widget-share.model'
import { ICommon } from '@sunbird-cb/collection/lib/_models/common.model'

// Mock data
const mockCommonConfig: ICommon = {
  // Add properties as needed for ICommon
  // version: '1.0',
  // lang: 'en',
  // ... other ICommon properties
  shareMessage: 'test share message'
}

export const mockContent: NsContent.IContent = {
  addedOn: '2024-01-01T00:00:00Z',
  appIcon: 'http://example.com/icon.png',
  artifactUrl: 'http://example.com/artifact',
  averageRating: 4.5,
  certificationUrl: 'http://example.com/cert',
  children: [],
  complexityLevel: 'Beginner',
  contentId: 'content-123',
  contentType: NsContent.EContentTypes.RESOURCE,
  contentUrlAtSource: 'http://source.com',
  creatorContacts: [
    { id: '1', name: 'Creator One', email: 'creator1@example.com' },
  ],
  creatorDetails: [
    { id: '1', name: 'Creator One', email: 'creator1@example.com' },
  ],
  creatorLogo: 'http://example.com/logo.png',
  creatorPosterImage: 'http://example.com/poster.png',
  creatorThumbnail: 'http://example.com/thumb.png',
  curatedTags: ['tag1', 'tag2'],
  description: 'Mock content description',
  displayContentType: NsContent.EDisplayContentTypes.RESOURCE,
  duration: 120,
  hasAccess: true,
  identifier: 'mock-content-id',
  isExternal: false,
  isIframeSupported: 'Yes',
  lastUpdatedOn: '2024-01-15T00:00:00Z',
  learningObjective: 'Learn Jest mocking',
  mediaType: 'video',
  mimeType: NsContent.EMimeTypes.MP4,
  name: 'Mock Content',
  preRequisites: 'None',
  primaryCategory: 'Learning Resource',
  publishedOn: '2024-01-10T00:00:00Z',
  resourceType: 'Video',
  skills: [
    { id: 'skill-1', category: 'Technical', skill: 'Jest', name: 'Jest' },
  ],
  sourceName: 'Learning Platform',
  sourceShortName: 'LP',
  status: 'Live',
  tags: [{ id: 'tag-1', type: 'label', value: 'Test' }],
  topics: [
    { identifier: 'topic-1', name: 'Testing' },
  ],
  track: [
    { id: 'track-1', name: 'Track 1', status: 'active', visibility: 'public' },
  ],
  me_totalSessionsCount: 2
}

const mockUserMailIds = [
  { email: 'user1@example.com' },
  { email: 'user2@example.com' },
]

const mockTxtBody = 'This is a test message'

const mockShareResponse: NsShare.IEmailResponse = {
  response: 'Email sent successfully',
  // Add other properties as needed
}

// const mockShareRequest: NsShare.IShareRequest = {
//   content_id: 'content-123',
//   emails: ['user1@example.com', 'user2@example.com'],
//   // Add other properties as needed
// }

export const mockShareRequest: NsShare.IShareRequest = {
  'event-id': 'share_content',
  'target-data': {
    identifier: 'content-123',
  },
  'tag-value-pair': {
    '#contentType': 'Resource',
    '#contentTitle': 'Sample Content',
    '#targetUrl': 'http://example.com/resource/content-123',
    '#message': 'Please check out this resource!',
  },
  recipients: {
    sharedWith: ['user1@example.com', 'user2@example.com'],
    sharedBy: ['owner@example.com'],
  },
}

// Mock ConfigurationsService
const mockConfigSvc = {
  sitePath: 'https://test-site.com',
  userProfile: {
    userName: 'Test User',
    email: 'test@example.com',
  },
}

// Mock HttpClient
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
}

describe('WidgetContentShareService', () => {
  let service: WidgetContentShareService

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Create a new instance of the service with the mocked dependencies
    service = new WidgetContentShareService(
      mockHttpClient as unknown as HttpClient,
      mockConfigSvc as unknown as ConfigurationsService
    )
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('fetchConfigFile', () => {
    it('should call HttpClient.get with the correct URL', () => {
      // Arrange
      mockHttpClient.get.mockReturnValue(of(mockCommonConfig))

      // Act
      service.fetchConfigFile()

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith('https://test-site.com/feature/common.json')
    })

    it('should return the configuration data from the API', (done) => {
      // Arrange
      mockHttpClient.get.mockReturnValue(of(mockCommonConfig))

      // Act
      service.fetchConfigFile().subscribe(data => {
        // Assert
        expect(data).toEqual(mockCommonConfig)
        done()
      })
    })
  })

  describe('shareContent', () => {
    it('should call shareContentApi with correct request parameters for share type', () => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of(mockShareResponse))

      // Act
      service.shareContent(mockContent, mockUserMailIds, mockTxtBody, 'share')

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/share',
        expect.objectContaining({
          appURL: expect.any(String),
          artifacts: [expect.objectContaining({
            identifier: 'mock-content-id',
            title: 'Mock Content'
          })],
          body: { text: mockTxtBody, isHTML: false },
          emailTo: mockUserMailIds,
          emailType: 'share',
          sharedBy: [{ name: 'Test User', email: 'test@example.com' }],
        })
      )
    })

    it('should call shareContentApi with correct request parameters for attachment type', () => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of(mockShareResponse))

      // Act
      service.shareContent(mockContent, mockUserMailIds, mockTxtBody, 'attachment')

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/share',
        expect.objectContaining({
          emailTo: [{ name: 'Test User', email: 'test@example.com' }],
          ccTo: [],
          emailType: 'attachment',
        })
      )
    })

    it('should call shareContentApi with correct request parameters for query type', () => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of(mockShareResponse))

      // Act
      service.shareContent(mockContent, mockUserMailIds, mockTxtBody, 'query')

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/share',
        expect.objectContaining({
          emailTo: mockUserMailIds,
          emailType: 'query',
        })
      )
    })

    it('should use default share type when not specified', () => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of(mockShareResponse))

      // Act
      service.shareContent(mockContent, mockUserMailIds, mockTxtBody)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/share',
        expect.objectContaining({
          emailType: 'share',
        })
      )
    })

    it('should return the response from shareContentApi', (done) => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of(mockShareResponse))

      // Act
      service.shareContent(mockContent, mockUserMailIds, mockTxtBody).subscribe(response => {
        // Assert
        expect(response).toEqual(mockShareResponse)
        done()
      })
    })

    it('should handle missing userProfile data gracefully', (done) => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of(mockShareResponse))
      const serviceWithoutUserProfile = new WidgetContentShareService(
        mockHttpClient as unknown as HttpClient,
        { ...mockConfigSvc, userProfile: null } as unknown as ConfigurationsService
      )

      // Act
      serviceWithoutUserProfile.shareContent(mockContent, mockUserMailIds, mockTxtBody).subscribe(response => {
        expect(response).toEqual(mockShareResponse)
        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/apis/protected/v8/user/share',
          expect.objectContaining({
            sharedBy: [{ name: '', email: '' }],
          })
        )
        done()
      })
    })
  })

  describe('contentShareNew', () => {
    it('should call HttpClient.post with the correct URL and request body', () => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of({}))

      // Act
      service.contentShareNew(mockShareRequest)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/share/content',
        mockShareRequest
      )
    })

    it('should return the response from the API', (done) => {
      // Arrange
      const mockResponse = { success: true }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.contentShareNew(mockShareRequest).subscribe(response => {
        // Assert
        expect(response).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('shareRequestBuilder (private method indirectly tested)', () => {
    it('should correctly build request with content details', () => {
      // Arrange
      mockHttpClient.post.mockReturnValue(of(mockShareResponse))
      const originalLocation = window.location
      const originalDocumentBaseURI = document.baseURI

      // Mock window.location and document.baseURI
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://test-origin.com' },
        writable: true
      })
      Object.defineProperty(document, 'baseURI', {
        value: 'https://test-base-uri.com/',
        writable: true
      })

      // Act
      service.shareContent(mockContent, mockUserMailIds, mockTxtBody)

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/share',
        expect.objectContaining({
          artifacts: [expect.objectContaining({
            artifactUrl: 'http://example.com/artifact',
            downloadUrl: '', // this is what was actually sent
            thumbnailUrl: 'http://example.com/icon.png',
            title: 'Mock Content',
            track: 'Track 1',
            url: 'https://test-base-uri.com/app/toc/mock-content-id/overview',
          })],
        })
      )

      // Restore original values
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      })
      Object.defineProperty(document, 'baseURI', {
        value: originalDocumentBaseURI,
        writable: true
      })
    })
  })
})