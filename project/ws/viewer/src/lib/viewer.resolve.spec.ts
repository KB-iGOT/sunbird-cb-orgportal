// Mock ESM-problem packages first (hoisted by babel-jest)
jest.mock('@sunbird-cb/toc', () => ({
  WidgetContentService: jest.fn(),
}))
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {},
}))
jest.mock('@sunbird-cb/utils', () => ({
  IResolveResponse: {},
  AuthMicrosoftService: jest.fn(),
  ConfigurationsService: jest.fn(),
}))
jest.mock('../../../../../src/app/services/mobile-apps.service', () => ({
  MobileAppsService: jest.fn(),
}))
jest.mock('./viewer-data.service', () => ({
  ViewerDataService: jest.fn(),
}))

import { of, throwError } from 'rxjs'
import { ViewerResolve } from './viewer.resolve'

// ─── mock VIEWER_ROUTE_FROM_MIME ──────────────────────────────────────────────
jest.mock('./services/viewer-route-utils', () => ({
  VIEWER_ROUTE_FROM_MIME: jest.fn((mimeType: string) => {
    if (mimeType === 'application/pdf') { return 'pdf' }
    if (mimeType === 'video/mp4') { return 'video' }
    if (mimeType === 'application/vnd.sunbird.questionset') { return 'questionset' }
    return 'html'
  }),
}))

import { VIEWER_ROUTE_FROM_MIME } from './services/viewer-route-utils'

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildRoute(overrides: any = {}): any {
  const queryMap: any = { preview: null, preAssessment: null, ...(overrides.queryParamMap || {}) }
  return {
    data: { resourceType: 'pdf', ...(overrides.data || {}) },
    paramMap: { get: jest.fn().mockReturnValue('resource-123') },
    queryParamMap: {
      get: jest.fn((key: string) => queryMap[key] ?? null),
    },
  }
}

function buildContent(overrides: any = {}): any {
  return {
    identifier: 'resource-123',
    mimeType: 'application/pdf',
    status: 'Live',
    ssoEnabled: false,
    courseCategory: '',
    children: [],
    ...overrides,
  }
}

// ─── mocks ────────────────────────────────────────────────────────────────────

let mockContentSvc: any
let mockViewerDataSvc: any
let mockMobileAppsSvc: any
let mockRouter: any
let mockMsAuthSvc: any
let mockConfigSvc: any
let mockPlatform: any
let resolver: ViewerResolve

function buildResolver() {
  return new ViewerResolve(
    mockContentSvc,
    mockViewerDataSvc,
    mockMobileAppsSvc,
    mockRouter,
    mockMsAuthSvc,
    mockConfigSvc,
    mockPlatform,
  )
}

describe('ViewerResolve', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockContentSvc = {
      fetchContent: jest.fn(),
      fetchAuthoringContent: jest.fn(),
      fetchContentData: jest.fn(),
    }

    mockViewerDataSvc = {
      reset: jest.fn(),
      resourceId: 'resource-123',
      updateResource: jest.fn(),
    }

    mockMobileAppsSvc = { sendViewerData: jest.fn() }
    mockRouter = { navigate: jest.fn() }
    mockMsAuthSvc = { loginForSSOEnabledEmbed: jest.fn() }
    mockConfigSvc = { userProfile: { email: 'user@test.com' } }
    mockPlatform = { ANDROID: false }

    resolver = buildResolver()
  })

  // ─── null resource id ─────────────────────────────────────────────────────

  it('should return null when resourceId is falsy', () => {
    mockViewerDataSvc.resourceId = null
    const route = buildRoute()
    const result = resolver.resolve(route)
    expect(result).toBeNull()
  })

  // ─── non-preview, normal content ─────────────────────────────────────────

  it('should call fetchContent for normal (non-preview) route', (done) => {
    const content = buildContent()
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockContentSvc.fetchContent).toHaveBeenCalled()
      done()
    })
  })

  // ─── preview mode ─────────────────────────────────────────────────────────

  it('should call fetchAuthoringContent when url includes /author/', (done) => {
    const content = buildContent()
    mockContentSvc.fetchAuthoringContent.mockReturnValue(of(content))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/author/viewer/pdf/resource-123' },
      writable: true,
    })

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockContentSvc.fetchAuthoringContent).toHaveBeenCalledWith('resource-123')
      done()
    })

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
    })
  })

  // ─── preAssessment query param ────────────────────────────────────────────

  it('should call fetchContentData when preAssessment query param is set', (done) => {
    const content = buildContent()
    mockContentSvc.fetchContentData.mockReturnValue(of(content))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({
      data: { resourceType: 'pdf' },
      queryParamMap: { preview: null, preAssessment: 'true' },
    })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockContentSvc.fetchContentData).toHaveBeenCalledWith('resource-123')
      done()
    })
  })

  // ─── resourceType matches mimeType ────────────────────────────────────────

  it('should call updateResource with data when resourceType matches mimeType route', (done) => {
    const content = buildContent()
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(result => {
      expect(result!.data).toBeTruthy()
      expect(result!.error).toBeNull()
      done()
    })
  })

  // ─── resourceType mismatch ────────────────────────────────────────────────

  it('should return mimeTypeMismatch error when resourceType does not match', (done) => {
    const content = buildContent({ mimeType: 'video/mp4' })
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('video')

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(result => {
      expect(result!.error).toBe('mimeTypeMismatch')
      done()
    })
  })

  // ─── resourceType unknown ─────────────────────────────────────────────────

  it('should navigate when resourceType is unknown', (done) => {
    const content = buildContent()
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({ data: { resourceType: 'unknown' } })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalled()
      done()
    })
  })

  // ─── Deleted / Expired content ────────────────────────────────────────────

  it('should navigate to toc overview when content status is Deleted', (done) => {
    const content = buildContent({ status: 'Deleted' })
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('toc')])
      )
      done()
    })
  })

  it('should navigate to toc overview when content status is Expired', (done) => {
    const content = buildContent({ status: 'Expired' })
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalled()
      done()
    })
  })

  // ─── SSO enabled ──────────────────────────────────────────────────────────

  it('should call msAuthSvc.loginForSSOEnabledEmbed when ssoEnabled is true', (done) => {
    const content = buildContent({ ssoEnabled: true })
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockMsAuthSvc.loginForSSOEnabledEmbed).toHaveBeenCalledWith('user@test.com')
      done()
    })
  })

  // ─── Pre Enrolment Assessment category ────────────────────────────────────

  it('should set mimeType to questionset for Pre Enrolment Assessment category', (done) => {
    const child = { identifier: 'child1', contextCategory: 'Pre Enrolment Assessment', mimeType: 'application/pdf' }
    const content = buildContent({
      courseCategory: 'Pre Enrolment Assessment',
      children: [child],
    })
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockImplementation((mime: string) =>
        mime === 'application/vnd.sunbird.questionset' ? 'questionset' : 'pdf'
      )

    const route = buildRoute({ data: { resourceType: 'questionset' } })
    resolver.resolve(route)!.subscribe(result => {
      expect(result).toBeDefined()
      done()
    })
  })

  // ─── sendViewerData on ANDROID ────────────────────────────────────────────

  it('should call sendViewerData on successful resolution', (done) => {
    const content = buildContent()
    mockContentSvc.fetchContent.mockReturnValue(of({ result: { content } }))
      ; (VIEWER_ROUTE_FROM_MIME as jest.Mock).mockReturnValue('pdf')

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(() => {
      expect(mockMobileAppsSvc.sendViewerData).toHaveBeenCalled()
      done()
    })
  })

  // ─── catchError ───────────────────────────────────────────────────────────

  it('should call updateResource with error and return error object on failure', (done) => {
    const error = new Error('Network error')
    mockContentSvc.fetchContent.mockReturnValue(throwError(error))

    const route = buildRoute({ data: { resourceType: 'pdf' } })
    resolver.resolve(route)!.subscribe(result => {
      expect(mockViewerDataSvc.updateResource).toHaveBeenCalledWith(null, error)
      expect(result!.error).toBeTruthy()
      done()
    })
  })
})
