import { of } from 'rxjs'
import { ParamMap } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser'
import { AppTocService } from '../../services/app-toc.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsContent } from '@ws-widget/collection'
import { AppTocContentsComponent } from './app-toc-contents.component'

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  ActivatedRoute: jest.fn()
}))

describe('AppTocContentsComponent', () => {
  let component: AppTocContentsComponent
  let mockActivatedRoute: any
  let mockDomSanitizer: jest.Mocked<Partial<DomSanitizer>>
  let mockTocService: jest.Mocked<Partial<AppTocService>>
  let mockConfigService: jest.Mocked<Partial<ConfigurationsService>>

  beforeEach(() => {
    // Mock DomSanitizer
    mockDomSanitizer = {
      bypassSecurityTrustStyle: jest.fn().mockReturnValue('sanitized-style'),
    }

    // Mock ParamMap
    const paramMap: ParamMap = {
      get: (param: string) => {
        if (param === 'contextId') return 'test-context-id'
        if (param === 'contextPath') return 'test-context-path'
        return null
      },
      getAll: jest.fn(),
      has: jest.fn(),
      keys: [] as string[]
    }

    // Create activated route mock
    mockActivatedRoute = {
      queryParamMap: of(paramMap),
      parent: {
        data: of({
          content: {
            data: {
              identifier: 'test-id',
              primaryCategory: 'Resource',
              status: 'Live'
            }
          }
        })
      }
    }

    // Mock AppTocService
    mockTocService = {
      initData: jest.fn().mockReturnValue({
        content: {
          identifier: 'test-id',
          primaryCategory: 'Resource',
          mimeType: NsContent.EMimeTypes.PDF,
          artifactUrl: 'test-url',
          appIcon: 'test-icon',
          status: 'Live'
        },
        errorCode: null
      }),
    }

    // Mock ConfigurationsService
    mockConfigService = {
      instanceConfig: {
        logos: {
          defaultContent: 'default-thumbnail',
        },
      },
      rootOrg: 'test-org'
    } as any

    // Create component instance
    component = new AppTocContentsComponent(
      mockActivatedRoute,
      mockDomSanitizer as any,
      mockTocService as any,
      mockConfigService as any
    )
  })

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.content).toBeNull()
      expect(component.forPreview).toBeFalsy()
      expect(component.isPlayable).toBeFalsy()
      expect(component.contentPlayWidgetConfig).toBeNull()
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://test.com/path'
        },
        configurable: true
      })
    })

    it('should set forPreview true if URL contains /author/', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://test.com/author/path'
        },
        configurable: true
      })

      component.ngOnInit()

      expect(component.forPreview).toBeTruthy()
    })

    it('should set context from query params', (done) => {
      component.ngOnInit()

      setTimeout(() => {
        expect(component.contextId).toBe('test-context-id')
        expect(component.contextPath).toBe('test-context-path')
        done()
      })
    })

    it('should set default thumbnail from config', () => {
      component.ngOnInit()
      expect(component.defaultThumbnail).toBe('default-thumbnail')
    })
  })

  describe('populateContentPlayWidget', () => {
    it('should configure PDF player widget', () => {
      const content = {
        primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
        mimeType: NsContent.EMimeTypes.PDF,
        artifactUrl: 'test-pdf-url',
        identifier: 'test-id'
      } as NsContent.IContent

      component['populateContentPlayWidget'](content)

      expect(component.isPlayable).toBeTruthy()
      expect(component.contentPlayWidgetConfig).toEqual({
        widgetSubType: 'playerPDF',
        widgetData: {
          pdfUrl: 'test-pdf-url'
        },
        widgetType: 'player',
        widgetHostClass: 'video-full block',
        widgetHostStyle: {
          height: '375px'
        }
      })
    })
  })

  describe('sanitizedBackgroundImage', () => {
    it('should return sanitized background image style', () => {
      const url = 'test-url'
      const result = component.sanitizedBackgroundImage(url)
      expect(mockDomSanitizer.bypassSecurityTrustStyle)
        .toHaveBeenCalledWith('url(test-url)')
      expect(result).toBe('sanitized-style')
    })
  })

  describe('resourceLink', () => {
    it('should generate correct resource link', () => {
      const resource = {
        identifier: 'test-id',
        mimeType: NsContent.EMimeTypes.PDF
      } as NsContent.IContent

      const result = component.resourceLink(resource)

      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('queryParams')
    })
  })

  describe('contentTrackBy', () => {
    it('should return content identifier', () => {
      const content = {
        identifier: 'test-id'
      } as NsContent.IContent

      const result = component.contentTrackBy(0, content)

      expect(result).toBe('test-id')
    })

    it('should return null for undefined content', () => {
      const result = component.contentTrackBy(0, undefined as any)
      expect(result).toBeNull()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from route subscriptions', () => {
      component['routeSubscription'] = { unsubscribe: jest.fn() } as any
      component['routeQuerySubscription'] = { unsubscribe: jest.fn() } as any

      component.ngOnDestroy()

      expect(component['routeSubscription'].unsubscribe).toHaveBeenCalled()
      expect(component['routeQuerySubscription'].unsubscribe).toHaveBeenCalled()
    })
  })
})
