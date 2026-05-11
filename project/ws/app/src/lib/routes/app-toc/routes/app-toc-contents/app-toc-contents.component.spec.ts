import { of } from 'rxjs'
import { ParamMap } from '@angular/router'
import { NsContent } from '@ws-widget/collection'
import { AppTocContentsComponent } from './app-toc-contents.component'

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  ActivatedRoute: jest.fn(),
}))

describe('AppTocContentsComponent', () => {
  let component: AppTocContentsComponent
  let mockActivatedRoute: any
  let mockDomSanitizer: any
  let mockTocService: any
  let mockConfigService: any
  let mockViewerSvc: any

  function buildComponent() {
    return new AppTocContentsComponent(
      mockActivatedRoute,
      mockDomSanitizer,
      mockTocService,
      mockConfigService,
      mockViewerSvc,
    )
  }

  beforeEach(() => {
    mockDomSanitizer = {
      bypassSecurityTrustStyle: jest.fn().mockReturnValue('sanitized-style'),
    }

    const paramMap: ParamMap = {
      get: (param: string) => {
        if (param === 'contextId') return 'test-context-id'
        if (param === 'contextPath') return 'test-context-path'
        if (param === 'batchId') return 'test-batch-id'
        return null
      },
      getAll: jest.fn(),
      has: jest.fn(),
      keys: [] as string[],
    }

    mockActivatedRoute = {
      queryParamMap: of(paramMap),
      parent: {
        data: of({
          content: { data: { identifier: 'test-id', primaryCategory: 'Resource', status: 'Live' } },
        }),
      },
    }

    mockTocService = {
      initData: jest.fn().mockReturnValue({
        content: {
          identifier: 'test-id',
          primaryCategory: 'Resource',
          mimeType: 'application/pdf' as any,
          artifactUrl: 'test-url',
          appIcon: 'test-icon',
          status: 'Live',
        },
        errorCode: null,
      }),
      fetchContentParents: jest.fn().mockReturnValue(of([{ identifier: 'parent-id' }])),
    }

    mockConfigService = {
      instanceConfig: { logos: { defaultContent: 'default-thumbnail' } },
      rootOrg: 'test-org',
    }

    mockViewerSvc = {
      getPublicUrl: jest.fn().mockReturnValue('https://cdn.example.com/icon.png'),
    }

    component = buildComponent()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ── Creation ──────────────────────────────────────────────────────────────
  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.content).toBeNull()
      expect(component.forPreview).toBe(false)
      expect(component.isPlayable).toBe(false)
      expect(component.contentPlayWidgetConfig).toBeNull()
      expect(component.expandAll).toBe(false)
      expect(component.expandPartOf).toBe(false)
    })
  })

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should set contextId and contextPath from query params', () => {
      component.ngOnInit()
      expect(component.contextId).toBe('test-context-id')
      expect(component.contextPath).toBe('test-context-path')
    })

    it('should set batchId from query params', () => {
      component.ngOnInit()
      expect(component.batchId).toBe('test-batch-id')
    })

    it('should set default thumbnail from config', () => {
      component.ngOnInit()
      expect(component.defaultThumbnail).toBe('default-thumbnail')
    })

    it('should call initData when parent route data emits', () => {
      component.ngOnInit()
      expect(mockTocService.initData).toHaveBeenCalled()
    })

    it('should handle missing instanceConfig gracefully', () => {
      mockConfigService.instanceConfig = null
      component = buildComponent()
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should not throw when parent route is missing', () => {
      mockActivatedRoute.parent = null
      component = buildComponent()
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should not set contextId/contextPath when query params return null', () => {
      const emptyParamMap: ParamMap = {
        get: () => null,
        getAll: jest.fn(),
        has: jest.fn(),
        keys: [],
      }
      mockActivatedRoute.queryParamMap = of(emptyParamMap)
      component = buildComponent()
      component.ngOnInit()
      expect(component.contextId).toBeUndefined()
      expect(component.contextPath).toBeUndefined()
    })
  })

  // ── ngOnDestroy ────────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should unsubscribe from routeSubscription', () => {
      component['routeSubscription'] = { unsubscribe: jest.fn() } as any
      component.ngOnDestroy()
      expect((component['routeSubscription'] as any).unsubscribe).toHaveBeenCalled()
    })

    it('should unsubscribe from routeQuerySubscription', () => {
      component['routeQuerySubscription'] = { unsubscribe: jest.fn() } as any
      component.ngOnDestroy()
      expect((component['routeQuerySubscription'] as any).unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when subscriptions are null', () => {
      component['routeSubscription'] = null
      component['routeQuerySubscription'] = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // ── sanitizedBackgroundImage ───────────────────────────────────────────────
  describe('sanitizedBackgroundImage', () => {
    it('should call bypassSecurityTrustStyle with url()', () => {
      component.sanitizedBackgroundImage('https://example.com/img.png')
      expect(mockDomSanitizer.bypassSecurityTrustStyle)
        .toHaveBeenCalledWith('url(https://example.com/img.png)')
    })

    it('should return the sanitized value', () => {
      const result = component.sanitizedBackgroundImage('https://example.com/img.png')
      expect(result).toBe('sanitized-style')
    })
  })

  // ── resourceLink ───────────────────────────────────────────────────────────
  describe('resourceLink', () => {
    it('should return object with url and queryParams', () => {
      const resource = { identifier: 'res-001', mimeType: 'application/pdf' } as NsContent.IContent
      const result = component.resourceLink(resource)
      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('queryParams')
    })
  })

  // ── contentTrackBy ─────────────────────────────────────────────────────────
  describe('contentTrackBy', () => {
    it('should return identifier for valid content', () => {
      const content = { identifier: 'abc-123' } as NsContent.IContent
      expect(component.contentTrackBy(0, content)).toBe('abc-123')
    })

    it('should return null for falsy content', () => {
      expect(component.contentTrackBy(0, null as any)).toBeNull()
    })
  })

  // ── showYouMayAlsoLikeTab getter ───────────────────────────────────────────
  describe('showYouMayAlsoLikeTab', () => {
    it('should return true by default', () => {
      expect(component.showYouMayAlsoLikeTab).toBe(true)
    })
  })

  // ── populateContentPlayWidget (private) ────────────────────────────────────
  describe('populateContentPlayWidget (private)', () => {
    it('should set isPlayable and config for PDF resource', () => {
      const content = {
        primaryCategory: 'Learning Resource',
        mimeType: 'application/pdf' as any,
        artifactUrl: 'doc.pdf',
        appIcon: '',
      } as NsContent.IContent
      component['populateContentPlayWidget'](content)
      expect(component.isPlayable).toBe(true)
      expect(component.contentPlayWidgetConfig).not.toBeNull()
    })

    it('should set isPlayable and config for MP4 video resource', () => {
      const content = {
        primaryCategory: 'Learning Resource',
        mimeType: 'video/mp4' as any,
        artifactUrl: 'video.mp4',
        appIcon: 'icon.png',
      } as NsContent.IContent
      component['populateContentPlayWidget'](content)
      expect(component.isPlayable).toBe(true)
    })

    it('should set isPlayable for MP3 audio resource', () => {
      const content = {
        primaryCategory: 'Learning Resource',
        mimeType: 'audio/mpeg' as any,
        artifactUrl: 'audio.mp3',
        appIcon: '',
      } as NsContent.IContent
      component['populateContentPlayWidget'](content)
      expect(component.isPlayable).toBe(true)
    })

    it('should set isPlayable for YOUTUBE resource', () => {
      const content = {
        primaryCategory: 'Learning Resource',
        mimeType: 'video/x-youtube' as any,
        artifactUrl: 'https://youtube.com/watch?v=abc',
        appIcon: '',
      } as NsContent.IContent
      component['populateContentPlayWidget'](content)
      expect(component.isPlayable).toBe(true)
    })

    it('should set isPlayable for OFFLINE_SESSION resource', () => {
      const content = {
        primaryCategory: 'Learning Resource',
        mimeType: 'application/offline-session' as any,
        artifactUrl: '',
        appIcon: '',
      } as NsContent.IContent
      component['populateContentPlayWidget'](content)
      expect(component.isPlayable).toBe(true)
    })

    it('should not set isPlayable for non-playable category', () => {
      const content = {
        primaryCategory: 'Course',
        mimeType: 'application/vnd.ekstep.content-collection' as any,
        artifactUrl: '',
        appIcon: '',
      } as NsContent.IContent
      component['populateContentPlayWidget'](content)
      expect(component.isPlayable).toBe(false)
    })
  })

  // ── initData (private) ─────────────────────────────────────────────────────
  describe('initData (private)', () => {
    it('should set errorCode from initData result', () => {
      mockTocService.initData.mockReturnValue({ content: null, errorCode: 'NO_CONTENT' })
      component['initData']({})
      expect(component.errorCode).toBe('NO_CONTENT')
    })

    it('should fetch content parents when content has identifier', () => {
      component.content = {
        identifier: 'content-001',
        primaryCategory: 'Learning Resource',
      } as any
      component.contextId = 'context-001'
      component.contextPath = 'Course'
      component['initData']({})
      expect(mockTocService.fetchContentParents).toHaveBeenCalled()
    })
  })
})
