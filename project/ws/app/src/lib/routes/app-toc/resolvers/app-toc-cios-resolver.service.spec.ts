jest.mock('@ws-widget/collection/src/lib/_services/widget-content.service', () => ({
  WidgetContentService: class MockWidgetContentService { }
}), { virtual: true })

import { of, throwError } from 'rxjs'
import { AppTocCiosResolverService } from './app-toc-cios-resolver.service'

describe('AppTocCiosResolverService', () => {
  let service: AppTocCiosResolverService
  let mockContentSvc: any

  beforeEach(() => {
    mockContentSvc = { fetchExternalContent: jest.fn() }
    service = new AppTocCiosResolverService(mockContentSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should call fetchExternalContent with route id', (done) => {
      const mockData = { id: 'content-1' }
      mockContentSvc.fetchExternalContent.mockReturnValue(of(mockData))
      const route = { params: { id: 'content-1' } } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(mockContentSvc.fetchExternalContent).toHaveBeenCalledWith('content-1')
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should use empty string when route id is missing', (done) => {
      mockContentSvc.fetchExternalContent.mockReturnValue(of({}))
      const route = { params: {} } as any

      service.resolve(route, {} as any).subscribe(() => {
        expect(mockContentSvc.fetchExternalContent).toHaveBeenCalledWith('')
        done()
      })
    })

    it('should handle error with catchError', (done) => {
      const mockError = new Error('fetch failed')
      mockContentSvc.fetchExternalContent.mockReturnValue(throwError(mockError))
      const route = { params: { id: 'bad-id' } } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })
  })
})
