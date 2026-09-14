import { ActivatedRouteSnapshot } from '@angular/router'
import { of, throwError } from 'rxjs'
import { ComprehensiveAssessmentService } from './comprehensive-assessment.service'
import { AssessmentResolverService } from './assessment-resolver'

describe('AssessmentResolverService', () => {
  let resolver: AssessmentResolverService
  let assessmentSvc: any

  const route = (params: any) => ({ params } as unknown as ActivatedRouteSnapshot)

  beforeEach(() => {
    assessmentSvc = {
      getContentHierarchy: jest.fn().mockReturnValue(
        of({ result: { content: { identifier: 'do_123', name: 'APAR assessment' } } })
      ),
    }
    resolver = new AssessmentResolverService(assessmentSvc as ComprehensiveAssessmentService)
  })

  it('should create a instance of the resolver', () => {
    expect(resolver).toBeTruthy()
  })

  it('should resolve the content of the assessment on the route', (done: any) => {
    resolver.resolve(route({ assessmentId: 'do_123' })).subscribe((res: any) => {
      expect(assessmentSvc.getContentHierarchy).toHaveBeenCalledWith('do_123')
      expect(res).toEqual({ data: { identifier: 'do_123', name: 'APAR assessment' }, error: null })
      done()
    })
  })

  /** The router hands the id with its matrix colon still on it when the url is malformed. */
  it('should strip the leading colon off the route param', (done: any) => {
    resolver.resolve(route({ assessmentId: ':do_123' })).subscribe(() => {
      expect(assessmentSvc.getContentHierarchy).toHaveBeenCalledWith('do_123')
      done()
    })
  })

  it('should not call the api when the route carries no assessment', (done: any) => {
    resolver.resolve(route({})).subscribe((res: any) => {
      expect(assessmentSvc.getContentHierarchy).not.toHaveBeenCalled()
      expect(res).toEqual({ data: null, error: 'No assessment id found' })
      done()
    })
  })

  it('should treat a bare colon as no assessment id', (done: any) => {
    resolver.resolve(route({ assessmentId: ':' })).subscribe((res: any) => {
      expect(assessmentSvc.getContentHierarchy).not.toHaveBeenCalled()
      expect(res.error).toBe('No assessment id found')
      done()
    })
  })

  it('should resolve with no data when the hierarchy carries no content', (done: any) => {
    assessmentSvc.getContentHierarchy.mockReturnValue(of({ result: {} }))

    resolver.resolve(route({ assessmentId: 'do_123' })).subscribe((res: any) => {
      expect(res).toEqual({ data: undefined, error: null })
      done()
    })
  })

  /** The builder must still open on a failure, it shows its own message off `error`. */
  it('should resolve with the failure rather than letting the route fail', (done: any) => {
    const failure = { error: { message: 'content service is down' } }
    assessmentSvc.getContentHierarchy.mockReturnValue(throwError(() => failure))

    resolver.resolve(route({ assessmentId: 'do_123' })).subscribe((res: any) => {
      expect(res).toEqual({ data: null, error: failure })
      done()
    })
  })
})
