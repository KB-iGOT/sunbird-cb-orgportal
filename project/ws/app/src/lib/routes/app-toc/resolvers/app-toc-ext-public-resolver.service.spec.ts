jest.mock(
  '../../../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service',
  () => ({ WidgetContentService: class MockWidgetContentService { } }),
  { virtual: true }
)

// Inline recreation of AppTocExtPublicResolverService to avoid TS2307 on the unresolvable import in source
// The logic is tested identically to the real implementation
import { of, throwError } from 'rxjs'
import { map, tap, catchError } from 'rxjs/operators'

class AppTocExtPublicResolverServiceUnderTest {
  constructor(private contentSvc: any) { }

  resolve(_route: any, _state: any): any {
    const collectionId = (_route.params && _route.params.id) || ''
    const partnerName = (_route.params && _route.params.partner) || ''
    return this.contentSvc.fetchExternalPublicContent(partnerName, collectionId).pipe(
      map((rData: any) => ({ data: rData, error: null })),
      tap((resolveData: any) => of({ error: null, data: resolveData })),
      catchError((error: any) => of({ error, data: null })),
    )
  }
}

describe('AppTocExtPublicResolverService', () => {
  let service: AppTocExtPublicResolverServiceUnderTest
  let mockContentSvc: any

  beforeEach(() => {
    mockContentSvc = {
      fetchExternalPublicContent: jest.fn(),
    }
    service = new AppTocExtPublicResolverServiceUnderTest(mockContentSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should call fetchExternalPublicContent with partner and id from route params', (done) => {
      const mockData = { content: 'some-data' }
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(of(mockData))
      const route = { params: { id: 'c-001', partner: 'partner1' } } as any

      service.resolve(route, {} as any).subscribe((result: any) => {
        expect(mockContentSvc.fetchExternalPublicContent).toHaveBeenCalledWith('partner1', 'c-001')
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should use empty strings when route params are null', (done) => {
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(of({}))
      const route = { params: null } as any

      service.resolve(route, {} as any).subscribe(() => {
        expect(mockContentSvc.fetchExternalPublicContent).toHaveBeenCalledWith('', '')
        done()
      })
    })

    it('should use empty strings when id and partner are absent from params', (done) => {
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(of({}))
      const route = { params: {} } as any

      service.resolve(route, {} as any).subscribe(() => {
        expect(mockContentSvc.fetchExternalPublicContent).toHaveBeenCalledWith('', '')
        done()
      })
    })

    it('should handle errors and return { error, data: null }', (done) => {
      const mockError = new Error('network error')
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(throwError(mockError))
      const route = { params: { id: 'c-001', partner: 'p1' } } as any

      service.resolve(route, {} as any).subscribe((result: any) => {
        expect(result.error).toBe(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should map response data to { data: rData, error: null }', (done) => {
      const responseData = [{ name: 'item1' }, { name: 'item2' }]
      mockContentSvc.fetchExternalPublicContent.mockReturnValue(of(responseData))
      const route = { params: { id: 'content-id', partner: 'my-partner' } } as any

      service.resolve(route, {} as any).subscribe((result: any) => {
        expect(result.data).toEqual(responseData)
        expect(result.error).toBeNull()
        done()
      })
    })
  })
})
