import { TopicService } from '../services/topics.service'
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { TopicResolverService } from './topic.resolver'

describe('TopicResolverService', () => {
  let resolver: TopicResolverService
  let mockTopicService: jest.Mocked<TopicService>
  let mockActivatedRoute: Partial<ActivatedRouteSnapshot>
  let mockRouterState: Partial<RouterStateSnapshot>

  beforeEach(() => {
    // Create mock for TopicService
    mockTopicService = {
      loadTopics: jest.fn()
    } as unknown as jest.Mocked<TopicService>

    // Create mock route and state
    mockActivatedRoute = {}
    mockRouterState = {}

    // Create resolver instance with mocked dependencies
    resolver = new TopicResolverService(mockTopicService)
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  describe('resolve', () => {
    it('should return data and null error on successful API call', (done) => {
      // Arrange
      const mockResponse = {
        terms: [
          { id: '1', name: 'Topic 1' },
          { id: '2', name: 'Topic 2' }
        ]
      }
      mockTopicService.loadTopics.mockReturnValue(of(mockResponse))

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe((result: any) => {
          // Assert
          expect(result).toEqual({
            data: mockResponse.terms,
            error: null
          })
          expect(mockTopicService.loadTopics).toHaveBeenCalled()
          done()
        })
    })

    it('should return empty array when terms is not present in response', (done) => {
      // Arrange
      const mockResponse = {} // No terms property
      mockTopicService.loadTopics.mockReturnValue(of(mockResponse))

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe((result: any) => {
          // Assert
          expect(result).toEqual({
            data: [],
            error: null
          })
          expect(mockTopicService.loadTopics).toHaveBeenCalled()
          done()
        })
    })

    it('should return error and null data on failed API call', (done) => {
      // Arrange
      const mockError = new Error('API Error')
      mockTopicService.loadTopics.mockReturnValue(throwError(mockError))

      // Act
      resolver.resolve(mockActivatedRoute as ActivatedRouteSnapshot, mockRouterState as RouterStateSnapshot)
        .subscribe((result: any) => {
          // Assert
          expect(result).toEqual({
            data: null,
            error: mockError
          })
          expect(mockTopicService.loadTopics).toHaveBeenCalled()
          done()
        })
    })
  })
})