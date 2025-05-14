import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { CommunityService } from './community.service'

describe('CommunityService', () => {
  let service: CommunityService
  let httpClientMock: jest.Mocked<HttpClient>

  beforeEach(() => {
    // Create a mock HttpClient with all the methods we need
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    service = new CommunityService(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('communitySearch', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { searchTerm: 'test' }
      const mockResponse = { results: [] };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.communitySearch(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/community/v1/mdo/search',
        mockRequest
      )
    })
  })

  describe('getTopicDetails', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { topicId: '123' }
      const mockResponse = { topic: {} };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.getTopicDetails(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/community/v1/topic/search',
        mockRequest
      )
    })
  })

  describe('getUserDetails', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { userId: '123' }
      const mockResponse = { user: {} };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.getUserDetails(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/search',
        mockRequest
      )
    })
  })

  describe('createCommunity', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { name: 'New Community' }
      const mockResponse = { id: '123' };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.createCommunity(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/community/v1/create',
        mockRequest
      )
    })
  })

  describe('updateCommunity', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { id: '123', name: 'Updated Community' }
      const mockResponse = { success: true };

      (httpClientMock.put as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.updateCommunity(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.put).toHaveBeenCalledWith(
        '/apis/proxies/v8/community/v1/update',
        mockRequest
      )
    })
  })

  describe('fileUpload', () => {
    it('should call the correct endpoint with the provided request and community ID', () => {
      // Arrange
      const mockRequest = { file: 'base64string' }
      const communityId = '123'
      const mockResponse = { fileUrl: 'path/to/file' };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.fileUpload(mockRequest, communityId).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        `/apis/proxies/v8/community/v1/fileUpload/${communityId}`,
        mockRequest
      )
    })
  })

  describe('getCommunityDetailsById', () => {
    it('should call the correct endpoint with the provided ID', () => {
      // Arrange
      const communityId = '123'
      const mockResponse = { community: {} };

      (httpClientMock.get as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.getCommunityDetailsById(communityId).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/proxies/v8/community/v1/read/${communityId}`
      )
    })
  })

  describe('publishCommunity', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { id: '123' }
      const mockResponse = { success: true };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.publishCommunity(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/community/v1/publish',
        mockRequest
      )
    })
  })

  describe('getAllReportedDiscussion', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { filter: 'reported' }
      const mockResponse = { discussions: [] };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.getAllReportedDiscussion(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/feedDiscussion/search',
        mockRequest
      )
    })
  })

  describe('getHiddenDiscussions', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { filter: 'hidden' }
      const mockResponse = { discussions: [] };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.getHiddenDiscussions(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/feedDiscussion/search',
        mockRequest
      )
    })
  })

  describe('getReportedIssuesStats', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = {}
      const mockResponse = { reportedCount: 10, hiddenCount: 5 };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.getReportedIssuesStats(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/feedDiscussion/getReportStatistics',
        mockRequest
      )
    })
  })

  describe('hideReportedPost', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { postId: '123' }
      const mockResponse = { success: true };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.hideReportedPost(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/feedDiscussion/admin/removePost',
        mockRequest
      )
    })
  })

  describe('displayReportedPost', () => {
    it('should call the correct endpoint with the provided request', () => {
      // Arrange
      const mockRequest = { postId: '123' }
      const mockResponse = { success: true };

      (httpClientMock.post as jest.Mock).mockReturnValue(of(mockResponse))

      // Act
      let result: any
      service.displayReportedPost(mockRequest).subscribe(response => {
        result = response
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(httpClientMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/feedDiscussion/admin/activatePost',
        mockRequest
      )
    })
  })
})