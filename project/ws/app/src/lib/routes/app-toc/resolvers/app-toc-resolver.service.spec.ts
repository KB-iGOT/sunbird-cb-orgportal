jest.mock('@ws-widget/collection', () => ({
  NsContent: { EPrimaryCategory: { CHANNEL: 'Channel', KNOWLEDGE_BOARD: 'Knowledge Board' } },
  PipeContentRoutePipe: class MockPipe { },
  WidgetContentService: class MockWidgetContentService { }
}), { virtual: true })

import { of, throwError } from 'rxjs'
import { AppTocResolverService } from './app-toc-resolver.service'

// Minimal mock to satisfy the complex resolver logic
describe('AppTocResolverService', () => {
  let service: AppTocResolverService
  let mockContentSvc: any
  let mockRoutePipe: any
  let mockRouter: any

  const mockContent = {
    identifier: 'c-001',
    primaryCategory: 'Course',
    children: [],
  }

  beforeEach(() => {
    mockContentSvc = {
      fetchAuthoringContent: jest.fn(),
      fetchContent: jest.fn(),
    }
    mockRoutePipe = {
      transform: jest.fn().mockReturnValue({ url: '/app/toc/c-001', queryParams: {} }),
    }
    mockRouter = { navigate: jest.fn() }
    service = new AppTocResolverService(mockContentSvc, mockRoutePipe, mockRouter)

    // Mock window.location to avoid jsdom issues
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost/app/toc/c-001/overview' },
    })
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should return error when no contentId', (done) => {
      const route = { paramMap: { get: jest.fn().mockReturnValue(null) }, queryParamMap: { get: jest.fn().mockReturnValue('') } } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe('NO_ID')
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should call fetchContent for non-preview URL', (done) => {
      const contentResult = { result: { content: { ...mockContent } } }
      mockContentSvc.fetchContent.mockReturnValue(of(contentResult))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-001') },
        queryParamMap: { get: jest.fn().mockReturnValue('Course') },
      } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalled()
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should call fetchAuthoringContent for preview URL', (done) => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/public/toc/c-001/overview' },
      })
      const contentResult = { result: { content: { ...mockContent } } }
      mockContentSvc.fetchAuthoringContent.mockReturnValue(of(contentResult))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-001') },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(mockContentSvc.fetchAuthoringContent).toHaveBeenCalledWith('c-001')
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should handle error with catchError and return error result', (done) => {
      const mockError = new Error('content fetch failed')
      mockContentSvc.fetchContent.mockReturnValue(throwError(mockError))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-err') },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })
  })
})
