import { HttpRequest, HttpHandler } from '@angular/common/http'
import { of } from 'rxjs'
import { CA_DRAFT_PREVIEW_PARAM, CaHierarchyInterceptorService } from './ca-hierarchy-interceptor.service'

describe('CaHierarchyInterceptorService', () => {
  let service: CaHierarchyInterceptorService
  let next: HttpHandler
  let handled: HttpRequest<any>

  const onPath = (path: string) => window.history.pushState({}, '', path)
  const intercept = (req: HttpRequest<any>) => {
    service.intercept(req, next).subscribe()
    return handled
  }

  beforeEach(() => {
    service = new CaHierarchyInterceptorService()
    next = {
      handle: (req: HttpRequest<any>) => {
        handled = req
        return of({} as any)
      },
    }
  })

  describe('on the assessment builder', () => {
    beforeEach(() => onPath('/app/home/comprehensive-assessment/edit/do_123'))

    it('reads the draft hierarchy instead of the course hierarchy', () => {
      const req = new HttpRequest('GET', 'apis/proxies/v8/course/v1/hierarchy/do_123?mode=edit')

      expect(intercept(req).url)
        .toBe('apis/proxies/v8/action/content/v3/hierarchy/do_123?mode=edit')
    })

    it('rewrites the leading slash and hierarchyType forms the library also builds', () => {
      const detail = new HttpRequest('GET',
                                     '/apis/proxies/v8/course/v1/hierarchy/do_9?hierarchyType=detail')
      expect(intercept(detail).url)
        .toBe('apis/proxies/v8/action/content/v3/hierarchy/do_9?mode=edit')

      const api = new HttpRequest('GET', '/api/course/v1/hierarchy/do_9?hierarchyType=detail')
      expect(intercept(api).url)
        .toBe('apis/proxies/v8/action/content/v3/hierarchy/do_9?mode=edit')
    })

    it('leaves every other read alone', () => {
      const url = '/apis/proxies/v8/content/v2/read/do_123'
      expect(intercept(new HttpRequest('GET', url)).url).toBe(url)
    })

    it('leaves writes alone', () => {
      const url = 'apis/proxies/v8/course/v1/hierarchy/do_123?mode=edit'
      expect(intercept(new HttpRequest('POST', url, {})).url).toBe(url)
    })
  })

  /**
   * The builder frames the player rather than navigating to it, so inside the frame the
   * path is the player's own. The marker on that url is what still identifies the read.
   */
  describe('inside the player the builder frames', () => {
    it('reads the draft hierarchy when the frame carries the marker', () => {
      onPath(`/app/home/explore-content/viewer/practice/do_qs?preview=true&${CA_DRAFT_PREVIEW_PARAM}=true`)
      const req = new HttpRequest('GET', 'apis/proxies/v8/course/v1/hierarchy/do_123?mode=edit')

      expect(intercept(req).url)
        .toBe('apis/proxies/v8/action/content/v3/hierarchy/do_123?mode=edit')
    })

    /** The same player opened for a published course still reads through the course reader. */
    it('leaves the course hierarchy alone on the same route without the marker', () => {
      onPath('/app/home/explore-content/viewer/practice/do_qs?preview=true&editMode=true')
      const url = 'apis/proxies/v8/course/v1/hierarchy/do_123?mode=edit'

      expect(intercept(new HttpRequest('GET', url)).url).toBe(url)
    })
  })

  it('leaves the course hierarchy alone away from the assessment builder', () => {
    onPath('/app/home/explore-content/preview/do_123')
    const url = '/apis/proxies/v8/course/v1/hierarchy/do_123?hierarchyType=detail'

    expect(intercept(new HttpRequest('GET', url)).url).toBe(url)
  })
})
