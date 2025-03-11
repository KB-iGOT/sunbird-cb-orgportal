import { of } from 'rxjs'
import { WidgetContentService } from './widget-content.service'
import { NsContent } from './widget-content.model'
import { NSSearch } from './widget-search.model'

describe('WidgetContentService', () => {
  let service: WidgetContentService
  let httpClientMock: any
  let configSvcMock: any

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    }

    configSvcMock = {
      userProfile: {
        country: 'India',
      },
    }

    service = new WidgetContentService(httpClientMock, configSvcMock)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('isResource', () => {
    it('should return true for learning resource primary category', () => {
      const result = service.isResource(NsContent.EResourcePrimaryCategories.LEARNING_RESOURCE)
      expect(result).toBe(true)
    })

    it('should return false for other primary categories', () => {
      const result = service.isResource('Course')
      expect(result).toBe(false)
    })

    it('should return false for undefined primary category', () => {
      const result = service.isResource(undefined as any)
      expect(result).toBe(false)
    })
  })

  describe('fetchMarkAsCompleteMeta', () => {
    it('should call the correct API endpoint', async () => {
      const mockResponse = { data: 'some data' }
      httpClientMock.get.mockReturnValue(of(mockResponse))

      const identifier = 'course-123'
      const result = await service.fetchMarkAsCompleteMeta(identifier)

      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/progress/course-123')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('fetchContent', () => {
    it('should call the resource API for resource content type', () => {
      const contentId = 'resource-123'
      const mockResponse = { result: { content: { id: contentId } } }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchContent(contentId, 'detail', [], NsContent.EResourcePrimaryCategories.LEARNING_RESOURCE)

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/proxies/v8/action/content/v3/read/${contentId}`
      )
    })

    it('should call the hierarchy API for non-resource content type', () => {
      const contentId = 'course-123'
      const mockResponse = { result: { content: { id: contentId } } }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchContent(contentId, 'detail', [], 'Course')

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/proxies/v8/action/content/v3/hierarchy/${contentId}?hierarchyType=detail`
      )
    })
  })

  describe('fetchAuthoringContent', () => {
    it('should call the correct API endpoint', () => {
      const contentId = 'content-123'
      const mockResponse = { id: contentId }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAuthoringContent(contentId)

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/authApi/hierarchy/${contentId}`
      )
    })
  })

  describe('fetchMultipleContent', () => {
    it('should call the correct API endpoint with joined IDs', () => {
      const ids = ['id1', 'id2', 'id3']
      const mockResponse = [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }]

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchMultipleContent(ids)

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/content/multiple/id1,id2,id3'
      )
    })
  })

  describe('fetchCollectionHierarchy', () => {
    it('should call the correct API endpoint with default pagination', () => {
      const type = 'course'
      const id = 'course-123'
      const mockResponse = { result: { content: [] } }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchCollectionHierarchy(type, id)

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/protected/v8/content/collection/${type}/${id}?pageNumber=0&pageSize=1`
      )
    })

    it('should call the correct API endpoint with custom pagination', () => {
      const type = 'course'
      const id = 'course-123'
      const pageNumber = 2
      const pageSize = 10
      const mockResponse = { result: { content: [] } }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchCollectionHierarchy(type, id, pageNumber, pageSize)

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/protected/v8/content/collection/${type}/${id}?pageNumber=2&pageSize=10`
      )
    })
  })

  describe('fetchCourseBatches', () => {
    it('should transform the response correctly', () => {
      const req = { filters: { courseId: 'course-123' } }
      const mockApiResponse = {
        result: {
          response: {
            content: [{ batchId: 'batch-1' }],
            count: 1
          }
        }
      }

      httpClientMock.post.mockReturnValue(of(mockApiResponse))

      service.fetchCourseBatches(req).subscribe(response => {
        expect(response).toEqual(mockApiResponse.result.response)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/learner/course/v1/batch/list',
        req
      )
    })
  })

  describe('enrollUserToBatch', () => {
    it('should call the correct API endpoint', async () => {
      const req = { request: { userId: 'user-1', courseId: 'course-1', batchId: 'batch-1' } }
      const mockResponse = { result: { response: 'Success' } }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      await service.enrollUserToBatch(req)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/learner/course/v1/enrol',
        req
      )
    })
  })

  describe('fetchContentLikes', () => {
    it('should call the correct API endpoint', async () => {
      const contentIds = { content_id: ['id1', 'id2'] }
      const mockResponse = { id1: 10, id2: 5 }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      const result = await service.fetchContentLikes(contentIds)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/content/likeCount',
        contentIds
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('continueLearning', () => {
    it('should handle playlist type correctly', async () => {
      const id = 'content-123'
      const collectionId = 'playlist-123'
      const collectionType = 'Playlist'

      httpClientMock.post.mockReturnValue(of({ result: 'success' }))

      await service.continueLearning(id, collectionId, collectionType)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/history/continue',
        expect.objectContaining({
          contextPathId: collectionId,
          resourceId: id,
          contextType: 'playlist',
          data: expect.any(String)
        })
      )
    })

    it('should handle non-playlist type correctly', async () => {
      const id = 'content-123'
      const collectionId = 'course-123'
      const collectionType = 'Course'

      httpClientMock.post.mockReturnValue(of({ result: 'success' }))

      await service.continueLearning(id, collectionId, collectionType)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/history/continue',
        expect.objectContaining({
          contextPathId: collectionId,
          resourceId: id,
          data: expect.any(String)
        })
      )
    })
  })

  describe('searchRegionRecommendation', () => {
    it('should add country from user profile to filters', () => {
      const req: NSSearch.ISearchOrgRegionRecommendationRequest = {
        query: 'test',
        preLabelValue: 'label-',
        filters: {}
      }

      httpClientMock.post.mockReturnValue(of({}))

      service.searchRegionRecommendation(req)

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/content/searchRegionRecommendation',
        {
          request: expect.objectContaining({
            preLabelValue: 'label-India',
            filters: { labels: ['label-India'] }
          })
        }
      )
    })
  })

  describe('getFirstChildInHierarchy', () => {
    it('should return the content if it has no children', () => {
      const content: any = {
        identifier: 'content-1',
        name: 'Test Content',
        contentType: 'Resource',
        children: []
      }

      const result = service.getFirstChildInHierarchy(content)

      expect(result).toBe(content)
    })

    it('should return the content if it is a Resource', () => {
      const content: any = {
        identifier: 'content-1',
        name: 'Test Content',
        contentType: 'Resource',
        children: [
          {
            identifier: 'child-1',
            name: 'Child Content',
            contentType: 'Resource',
            children: []
          }
        ]
      }

      const result = service.getFirstChildInHierarchy(content)

      expect(result).toBe(content)
    })

    it('should return the first child if content is a Learning Path without artifactUrl', () => {
      const childContent: any = {
        identifier: 'child-1',
        name: 'Child Content',
        contentType: 'Resource',
        children: []
      }

      const content: any = {
        identifier: 'content-1',
        name: 'Test Content',
        contentType: 'Learning Path',
        artifactUrl: '',
        children: [childContent]
      }

      const result = service.getFirstChildInHierarchy(content)

      expect(result).toBe(childContent)
    })

    it('should return the Learning Path if it has an artifactUrl', () => {
      const content: any = {
        identifier: 'content-1',
        name: 'Test Content',
        contentType: 'Learning Path',
        artifactUrl: 'http://example.com/path',
        children: [
          {
            identifier: 'child-1',
            name: 'Child Content',
            contentType: 'Resource',
            children: []
          }
        ]
      }

      const result = service.getFirstChildInHierarchy(content)

      expect(result).toBe(content)
    })
  })
})