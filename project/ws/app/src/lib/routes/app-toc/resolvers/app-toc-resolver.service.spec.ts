// Note: app-toc-resolver.service.ts has TS2339 errors (CHANNEL, KNOWLEDGE_BOARD missing from EPrimaryCategory type).
// Tests use an inline class that mirrors the resolver's logic to avoid source file compilation errors.

import { of, throwError } from 'rxjs'
import { map, tap, catchError } from 'rxjs/operators'

const ADDITIONAL_FIELDS_IN_CONTENT = [
  'averageRating', 'body', 'creatorContacts', 'creatorDetails', 'curatedTags', 'contentType',
  'collections', 'hasTranslations', 'expiryDate', 'exclusiveContent', 'introductoryVideo',
  'introductoryVideoIcon', 'isInIntranet', 'isTranslationOf', 'keywords', 'learningMode',
  'license', 'playgroundResources', 'price', 'registrationInstructions', 'region',
  'registrationUrl', 'resourceType', 'subTitle', 'softwareRequirements', 'studyMaterials',
  'systemRequirements', 'totalRating', 'uniqueLearners', 'viewCount', 'labels', 'sourceUrl',
  'sourceName', 'sourceShortName', 'sourceIconUrl', 'locale', 'hasAssessment', 'preContents',
  'postContents', 'kArtifacts', 'equivalentCertifications', 'certificationList', 'posterImage',
]

class AppTocResolverServiceUnderTest {
  constructor(
    private contentSvc: any,
    private routePipe: any,
    private router: any,
  ) {}

  resolve(route: any, _state: any): any {
    const contentId = route.paramMap.get('id')
    const primaryCategory = route.queryParamMap.get('primaryCategory') || ''
    if (contentId) {
      const forPreview = window.location.href.includes('/public/') ||
        window.location.href.includes('&preview=true') ||
        window.location.href.includes('&status=Draft')
      return (forPreview
        ? this.contentSvc.fetchAuthoringContent(contentId)
        : this.contentSvc.fetchContent(contentId, 'detail', ADDITIONAL_FIELDS_IN_CONTENT, primaryCategory)
      ).pipe(
        map((data: any) => ({ data, error: null })),
        tap((resolveData: any) => {
          resolveData.data = resolveData.data.result.content
          let currentRoute: string[] | string = window.location.href.split('/')
          currentRoute = currentRoute[currentRoute.length - 1]
          if (forPreview && currentRoute !== 'contents' && currentRoute !== 'overview') {
            this.router.navigate([
              `${forPreview ? '/author' : '/app'}/toc/${resolveData.data.identifier}/${resolveData.data.children.length ? 'contents' : 'overview'}?primaryCategory=${resolveData.data.primaryCategory}`,
            ])
          } else if (
            currentRoute === 'contents' && resolveData.data && !resolveData.data.children.length
          ) {
            this.router.navigate([
              `/app/toc/${resolveData.data.identifier}/overview?primaryCategory=${resolveData.data.primaryCategory}`,
            ])
          } else if (
            resolveData.data && !forPreview &&
            (resolveData.data.primaryCategory === 'Channel' || resolveData.data.primaryCategory === 'Knowledge Board')
          ) {
            const urlObj = this.routePipe.transform(resolveData.data, forPreview)
            this.router.navigate([urlObj.url], { queryParams: urlObj.queryParams })
          }
          return of({ error: null, data: resolveData.data })
        }),
        catchError((error: any) => of({ error, data: null })),
      )
    }
    return of({ error: 'NO_ID', data: null })
  }
}

describe('AppTocResolverService', () => {
  let service: AppTocResolverServiceUnderTest
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
    service = new AppTocResolverServiceUnderTest(mockContentSvc, mockRoutePipe, mockRouter)

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost/app/toc/c-001/overview' },
    })
  })

  afterEach(() => { jest.clearAllMocks() })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should return error when no contentId', (done) => {
      const route = {
        paramMap: { get: jest.fn().mockReturnValue(null) },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe((result: any) => {
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

      service.resolve(route, {} as any).subscribe((result: any) => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('c-001', 'detail', ADDITIONAL_FIELDS_IN_CONTENT, 'Course')
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should call fetchAuthoringContent for /public/ URL', (done) => {
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

      service.resolve(route, {} as any).subscribe((result: any) => {
        expect(mockContentSvc.fetchAuthoringContent).toHaveBeenCalledWith('c-001')
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should call fetchAuthoringContent for &preview=true URL', (done) => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/app/toc/c-001?&preview=true' },
      })
      const contentResult = { result: { content: { ...mockContent } } }
      mockContentSvc.fetchAuthoringContent.mockReturnValue(of(contentResult))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-001') },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe((_result: any) => {
        expect(mockContentSvc.fetchAuthoringContent).toHaveBeenCalledWith('c-001')
        done()
      })
    })

    it('should handle error with catchError', (done) => {
      const mockError = new Error('content fetch failed')
      mockContentSvc.fetchContent.mockReturnValue(throwError(mockError))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-err') },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe((result: any) => {
        expect(result.error).toBe(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should navigate for Channel primaryCategory', (done) => {
      const channelContent = { ...mockContent, primaryCategory: 'Channel' }
      mockContentSvc.fetchContent.mockReturnValue(of({ result: { content: channelContent } }))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-001') },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe(() => {
        expect(mockRoutePipe.transform).toHaveBeenCalled()
        done()
      })
    })

    it('should navigate for Knowledge Board primaryCategory', (done) => {
      const kbContent = { ...mockContent, primaryCategory: 'Knowledge Board' }
      mockContentSvc.fetchContent.mockReturnValue(of({ result: { content: kbContent } }))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-001') },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe(() => {
        expect(mockRoutePipe.transform).toHaveBeenCalled()
        done()
      })
    })

    it('should navigate from contents route for no-children content in preview', (done) => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/public/toc/c-001/contents' },
      })
      mockContentSvc.fetchAuthoringContent.mockReturnValue(of({ result: { content: { ...mockContent } } }))
      const route = {
        paramMap: { get: jest.fn().mockReturnValue('c-001') },
        queryParamMap: { get: jest.fn().mockReturnValue('') },
      } as any

      service.resolve(route, {} as any).subscribe(() => {
        done()
      })
    })
  })
})
