jest.mock('@ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class MockWidgetContentService { }
}), { virtual: true })

import { of, throwError } from 'rxjs'
import { AppTocCiosUserEnrollResolverService } from './app-toc-cios-user-enroll-resolver.service'

describe('AppTocCiosUserEnrollResolverService', () => {
  let service: AppTocCiosUserEnrollResolverService
  let mockContentSvc: any

  beforeEach(() => {
    mockContentSvc = { fetchExtUserContentEnroll: jest.fn() }
    service = new AppTocCiosUserEnrollResolverService(mockContentSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should call fetchExtUserContentEnroll with route id', (done) => {
      const mockData = { enrolled: true }
      mockContentSvc.fetchExtUserContentEnroll.mockReturnValue(of(mockData))
      const route = { params: { id: 'enroll-1' } } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(mockContentSvc.fetchExtUserContentEnroll).toHaveBeenCalledWith('enroll-1')
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should use empty string when route id is missing', (done) => {
      mockContentSvc.fetchExtUserContentEnroll.mockReturnValue(of({}))
      const route = { params: {} } as any

      service.resolve(route, {} as any).subscribe(() => {
        expect(mockContentSvc.fetchExtUserContentEnroll).toHaveBeenCalledWith('')
        done()
      })
    })

    it('should handle error with catchError', (done) => {
      const mockError = new Error('enroll failed')
      mockContentSvc.fetchExtUserContentEnroll.mockReturnValue(throwError(mockError))
      const route = { params: { id: 'bad' } } as any

      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })
  })
})
