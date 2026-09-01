import { of, throwError } from 'rxjs'
import { AppPreAssessmentContentResolverService } from './app-pre-assessment-content-read-resolver.service'

describe('AppPreAssessmentContentResolverService', () => {
  let service: AppPreAssessmentContentResolverService
  let mockContentSvc: any

  beforeEach(() => {
    mockContentSvc = {
      fetchProgramContent: jest.fn().mockReturnValue(of({ result: [] })),
    }
    service = new AppPreAssessmentContentResolverService(mockContentSvc)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve', () => {
    function buildRoute(queryParams: any): any {
      return { queryParams }
    }

    it('should return error response when collectionId is absent', (done) => {
      const route = buildRoute({ preAssessment: 'true' })
      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe('Collection Id not found')
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should return error response when preAssessment is absent', (done) => {
      const route = buildRoute({ collectionId: 'col-001' })
      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe('Collection Id not found')
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should return error response when both are absent', (done) => {
      const route = buildRoute({})
      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBe('Collection Id not found')
        done()
      })
    })

    it('should call fetchProgramContent when collectionId and preAssessment present', (done) => {
      const route = buildRoute({ collectionId: 'col-001', preAssessment: 'true' })
      service.resolve(route, {} as any).subscribe(() => {
        expect(mockContentSvc.fetchProgramContent).toHaveBeenCalledWith('col-001')
        done()
      })
    })

    it('should map successful response to data wrapper', (done) => {
      mockContentSvc.fetchProgramContent.mockReturnValue(of({ items: ['a', 'b'] }))
      const route = buildRoute({ collectionId: 'col-001', preAssessment: 'true' })
      service.resolve(route, {} as any).subscribe(result => {
        expect(result.data).toEqual({ items: ['a', 'b'] })
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should catch error and return error wrapper', (done) => {
      const mockError = new Error('fetch failed')
      mockContentSvc.fetchProgramContent.mockReturnValue(throwError(() => mockError))
      const route = buildRoute({ collectionId: 'col-001', preAssessment: 'true' })
      service.resolve(route, {} as any).subscribe(result => {
        expect(result.error).toBeTruthy()
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should handle null queryParams gracefully', (done) => {
      const route = { queryParams: null }
      service.resolve(route as any, {} as any).subscribe(result => {
        expect(result.error).toBe('Collection Id not found')
        done()
      })
    })
  })
})
