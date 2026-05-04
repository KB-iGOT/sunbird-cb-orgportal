jest.mock('../../../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service', () => ({
  WidgetContentService: class MockWidgetContentService { }
}), { virtual: true })

import { of, throwError } from 'rxjs'
import { AppTocExtPublicResolverService } from './app-toc-ext-public-resolver.service'

describe('AppTocExtPublicResolverService', () => {
  let service: AppTocExtPublicResolverService
  let mockContentSvc: any

  beforeEach(() => {
    mockContentSvc = { fetchExternalPublicContent: jest.fn() }
    service = new AppTocExtPublicResolverService(mockContentSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should call fetchExternalPublicContent with partner and id', (done) => {
      const mockData = { id: 'pub-1' }
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(of(mockData))
      const route = { params: { id: 'content-1', partner: 'partner-x' } } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(mockContentSvc.fetchExternalPublicContent).toHaveBeenCalledWith('partner-x', 'content-1')
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should use empty strings when route params are missing', (done) => {
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(of({}))
      const route = { params: {} } as any

      service.resolve(route, {} as any).subscribe(() => {
        expect(mockContentSvc.fetchExternalPublicContent).toHaveBeenCalledWith('', '')
        done()
      })
    })

    it('should handle error with catchError', (done) => {
      const mockError = new Error('public fetch failed')
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(throwError(mockError))
      const route = { params: { id: 'bad', partner: 'bad-partner' } } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })
  })
})
