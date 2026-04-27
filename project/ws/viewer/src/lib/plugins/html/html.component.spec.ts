import { HtmlComponent } from './html.component'

jest.mock('../../../../../../../src/environments/environment', () => ({
  environment: {
    production: false,
    azureHost: 'https://azure.example.com',
    azureBucket: 'test-bucket',
    mdoPath: '/mdo',
    contentBucket: 'content-bucket',
  },
}))

describe('HtmlComponent', () => {
  let component: HtmlComponent
  let mockDomSanitizer: any
  let mockMobAppSvc: any
  let mockScormAdapterService: any
  let mockRouter: any
  let mockConfigSvc: any
  let mockSnackBar: any
  let mockEvents: any

  beforeEach(() => {
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url'),
    }
    mockMobAppSvc = {
      isMobile: false,
    }
    mockScormAdapterService = {
      contentId: '',
    }
    mockRouter = {
      navigate: jest.fn(),
    }
    mockConfigSvc = {
      instanceConfig: {
        intranetIframeUrls: ['http://intranet.example.com'],
      },
    }
    mockSnackBar = {
      open: jest.fn(),
    }
    mockEvents = {
      raiseInteractTelemetry: jest.fn(),
    }

    jest.useFakeTimers()
    jest.spyOn(window, 'addEventListener').mockImplementation(() => { })
    jest.spyOn(window, 'removeEventListener').mockImplementation(() => { })

    component = new HtmlComponent(
      mockDomSanitizer,
      mockMobAppSvc,
      mockScormAdapterService,
      mockRouter,
      mockConfigSvc,
      mockSnackBar,
      mockEvents,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set window.API in constructor', () => {
    expect((window as any).API).toBe(mockScormAdapterService)
  })

  it('should add message event listener in constructor', () => {
    expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
  })

  // ngOnInit
  describe('ngOnInit', () => {
    it('should set scormAdapterService.contentId when htmlContent has identifier', () => {
      component.htmlContent = { identifier: 'content-123' }
      component.ngOnInit()
      expect(mockScormAdapterService.contentId).toBe('content-123')
    })

    it('should not set contentId when htmlContent is null', () => {
      component.htmlContent = null
      mockScormAdapterService.contentId = ''
      component.ngOnInit()
      expect(mockScormAdapterService.contentId).toBe('')
    })

    it('should not set contentId when htmlContent has no identifier', () => {
      component.htmlContent = {}
      mockScormAdapterService.contentId = ''
      component.ngOnInit()
      expect(mockScormAdapterService.contentId).toBe('')
    })
  })

  // ngOnDestroy
  describe('ngOnDestroy', () => {
    it('should remove event listener on destroy', () => {
      component.ngOnDestroy()
      expect(window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })
  })

  // ngOnChanges
  describe('ngOnChanges', () => {
    it('should set pageFetchStatus to artifactUrlMissing when artifactUrl is empty string', () => {
      component.htmlContent = { artifactUrl: '' }
      component.ngOnChanges()
      expect(component.pageFetchStatus).toBe('artifactUrlMissing')
      expect(component.iframeUrl).toBeNull()
    })

    it('should set pageFetchStatus to error when htmlContent has no artifactUrl', () => {
      component.htmlContent = {}
      component.ngOnChanges()
      expect(component.pageFetchStatus).toBe('error')
      expect(component.iframeUrl).toBeNull()
    })

    it('should set pageFetchStatus to error when htmlContent is null', () => {
      component.htmlContent = null
      component.ngOnChanges()
      expect(component.pageFetchStatus).toBe('error')
      expect(component.iframeUrl).toBeNull()
    })

    it('should use empty array for intranetUrlPatterns when instanceConfig is null', () => {
      mockConfigSvc.instanceConfig = null
      component.htmlContent = {}
      component.ngOnChanges()
      expect(component.intranetUrlPatterns).toEqual([])
    })

    it('should set showIframeSupportWarning and call openInNewTab after timeout when isIframeSupported is "No"', () => {
      const openInNewTabSpy = jest.spyOn(component, 'openInNewTab').mockImplementation(() => { })
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'No',
        mimeType: 'text/html',
      }
      component.ngOnChanges()
      expect(component.showIframeSupportWarning).toBe(true)
      jest.advanceTimersByTime(3001)
      expect(openInNewTabSpy).toHaveBeenCalled()
    })

    it('should show iframe support warning when isIframeSupported is "maybe"', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Maybe',
        mimeType: 'text/html',
      }
      component.ngOnChanges()
      expect(component.showIframeSupportWarning).toBe(true)
    })

    it('should not show iframe support warning when isIframeSupported is "yes"', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: 'https://azure.example.com/stream',
      }
      component.ngOnChanges()
      expect(component.showIframeSupportWarning).toBe(false)
    })

    it('should set isIframeSupported to No when artifactUrl starts with http://', () => {
      component.htmlContent = {
        artifactUrl: 'http://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: 'https://azure.example.com/stream',
      }
      component.ngOnChanges()
      expect(component.htmlContent.isIframeSupported).toBe('No')
    })

    it('should set isIntranetUrl to true when artifactUrl matches intranetUrlPattern', () => {
      component.htmlContent = {
        artifactUrl: 'http://intranet.example.com/page',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: null,
        identifier: 'test-id',
      }
      component.ngOnChanges()
      expect(component.isIntranetUrl).toBe(true)
    })

    it('should set iframeUrl using streamingUrl when it includes azureHost', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: 'https://azure.example.com/stream/path',
      }
      component.ngOnChanges()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        'https://azure.example.com/stream/path'
      )
    })

    it('should use initFile with streaming URL when streamingUrl does not include azureHost', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: 'https://other.example.com/content/files',
        initFile: 'index.html',
      }
      component.ngOnChanges()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
      const callArg = mockDomSanitizer.bypassSecurityTrustResourceUrl.mock.calls[0][0]
      expect(callArg).toContain('index.html')
    })

    it('should fall back to production URL when streamingUrl has no initFile in production', () => {
      const envMock = require('../../../../../../../src/environments/environment')
      const originalProd = envMock.environment.production
      envMock.environment.production = true
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: 'https://other.example.com/stream',
        identifier: 'content-abc',
      }
      component.ngOnChanges()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
      envMock.environment.production = originalProd
    })

    it('should fall back to non-production URL when no initFile and not production', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: 'https://other.example.com/stream',
        identifier: 'content-abc',
      }
      component.ngOnChanges()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
      const callArg = mockDomSanitizer.bypassSecurityTrustResourceUrl.mock.calls[0][0]
      expect(callArg).toContain('/abcd/')
    })

    it('should set iframeUrl using initFile when no streamingUrl', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: null,
        identifier: 'content-abc',
        initFile: 'main.html',
      }
      component.ngOnChanges()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
      const callArg = mockDomSanitizer.bypassSecurityTrustResourceUrl.mock.calls[0][0]
      expect(callArg).toContain('main.html')
    })

    it('should set iframeUrl to index.html snapshot when no streamingUrl and no initFile', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: null,
        identifier: 'content-abc',
      }
      component.ngOnChanges()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
      const callArg = mockDomSanitizer.bypassSecurityTrustResourceUrl.mock.calls[0][0]
      expect(callArg).toContain('index.html')
    })

    it('should set iframeUrl from artifactUrl after timeout for text/x-url mimeType', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/external',
        isIframeSupported: 'Yes',
        mimeType: 'text/x-url',
      }
      component.ngOnChanges()
      jest.advanceTimersByTime(1001)
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        'https://example.com/external'
      )
    })

    it('should not set iframeUrl after timeout if htmlContent no longer has artifactUrl', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/external',
        isIframeSupported: 'Yes',
        mimeType: 'text/x-url',
      }
      component.ngOnChanges()
      component.htmlContent = null
      jest.advanceTimersByTime(1001)
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
    })

    it('should not show loading message after 3s timeout if still fetching (for non-No iframeSupport)', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: 'Yes',
        mimeType: 'text/html',
        streamingUrl: 'https://azure.example.com/stream',
      }
      component.ngOnChanges()
      jest.advanceTimersByTime(3001)
      expect(component.showIsLoadingMessage).toBe(false)
    })

    it('should handle isIframeSupported as boolean true (skip string check)', () => {
      component.htmlContent = {
        artifactUrl: 'https://example.com/content',
        isIframeSupported: true,
        mimeType: 'text/html',
        streamingUrl: 'https://azure.example.com/stream',
      }
      component.ngOnChanges()
      expect(component.showIframeSupportWarning).toBe(false)
    })
  })

  // backToDetailsPage
  describe('backToDetailsPage', () => {
    it('should navigate to toc overview for current content', () => {
      component.htmlContent = { identifier: 'abc-123' }
      component.backToDetailsPage()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/abc-123/overview'])
    })

    it('should navigate with empty identifier when htmlContent is null', () => {
      component.htmlContent = null
      component.backToDetailsPage()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc//overview'])
    })
  })

  // receiveMessage
  describe('receiveMessage', () => {
    it('should call raiseTelemetry with msg.data when data exists', () => {
      component.htmlContent = { identifier: 'test-id' }
      const msg = { data: { event: 'play', id: 'x1' } }
      component.receiveMessage(msg)
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        'play',
        'scrom',
        expect.objectContaining({ contentId: 'test-id' })
      )
    })

    it('should call raiseTelemetry with message/id object when msg.data is falsy', () => {
      component.htmlContent = { identifier: 'test-id' }
      const msg = { data: null, message: 'complete', id: 'x2' }
      component.receiveMessage(msg)
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        'complete',
        'scrom',
        expect.objectContaining({ contentId: 'test-id' })
      )
    })

    it('should not call raiseInteractTelemetry when htmlContent is null', () => {
      component.htmlContent = null
      component.receiveMessage({ data: { event: 'test' } })
      expect(mockEvents.raiseInteractTelemetry).not.toHaveBeenCalled()
    })
  })

  // openInNewTab
  describe('openInNewTab', () => {
    it('should do nothing when htmlContent is null', () => {
      component.htmlContent = null
      expect(() => component.openInNewTab()).not.toThrow()
    })

    it('should trigger click on mobileOpenInNewTab element when isMobile is true', () => {
      mockMobAppSvc.isMobile = true
      const clickMock = jest.fn()
        ; (component as any).mobileOpenInNewTab = { nativeElement: { click: clickMock } }
      component.htmlContent = { artifactUrl: 'https://example.com' }
      component.openInNewTab()
      jest.advanceTimersByTime(1)
      expect(clickMock).toHaveBeenCalled()
    })

    it('should open new window when isMobile is false and window.open succeeds', () => {
      mockMobAppSvc.isMobile = false
      const openMock = jest.spyOn(window, 'open').mockReturnValue({} as any)
      component.htmlContent = { artifactUrl: 'https://example.com' }
      component.openInNewTab()
      expect(openMock).toHaveBeenCalled()
    })

    it('should show snackbar when window.open returns null (popup blocked)', () => {
      mockMobAppSvc.isMobile = false
      jest.spyOn(window, 'open').mockReturnValue(null)
      component.htmlContent = { artifactUrl: 'https://example.com' }
      component.openInNewTab()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  // dismiss
  describe('dismiss', () => {
    it('should reset showIframeSupportWarning and isIntranetUrl', () => {
      component.showIframeSupportWarning = true
      component.isIntranetUrl = true
      component.dismiss()
      expect(component.showIframeSupportWarning).toBe(false)
      expect(component.isIntranetUrl).toBe(false)
    })
  })

  // onIframeLoadOrError
  describe('onIframeLoadOrError', () => {
    it('should set pageFetchStatus to error on error event', () => {
      component.onIframeLoadOrError('error')
      expect(component.pageFetchStatus).toBe('error')
    })

    it('should set iframe.onload callback on load event with iframe.contentWindow', () => {
      const iframe: any = { contentWindow: {}, onload: null }
      component.onIframeLoadOrError('load', iframe)
      expect(typeof iframe.onload).toBe('function')
    })

    it('should call iframe.onload and set pageFetchStatus to done when target exists', () => {
      const iframe: any = { contentWindow: {}, onload: jest.fn() }
      const event = {} as any
      component.onIframeLoadOrError('load', iframe, event)
      // Call the newly set onload callback
      iframe.onload({ target: document.createElement('iframe') })
      expect(component.pageFetchStatus).toBe('done')
      expect(component.showIsLoadingMessage).toBe(false)
    })

    it('should not set pageFetchStatus to done when data.target is falsy', () => {
      component.pageFetchStatus = 'fetching'
      const iframe: any = { contentWindow: {}, onload: null }
      component.onIframeLoadOrError('load', iframe)
      iframe.onload({ target: null })
      expect(component.pageFetchStatus).toBe('fetching')
    })

    it('should not change pageFetchStatus on load event without iframe', () => {
      component.pageFetchStatus = 'fetching'
      component.onIframeLoadOrError('load')
      expect(component.pageFetchStatus).toBe('fetching')
    })

    it('should not change pageFetchStatus on load event when contentWindow is null', () => {
      component.pageFetchStatus = 'fetching'
      const iframe: any = { contentWindow: null }
      component.onIframeLoadOrError('load', iframe)
      expect(component.pageFetchStatus).toBe('fetching')
    })
  })

  // raiseTelemetry
  describe('raiseTelemetry', () => {
    it('should call raiseInteractTelemetry when htmlContent is set', () => {
      component.htmlContent = { identifier: 'id-001' }
        ; (component as any).raiseTelemetry({ event: 'complete', id: 'y1' })
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        'complete',
        'scrom',
        expect.objectContaining({ contentId: 'id-001', event: 'complete', id: 'y1' })
      )
    })

    it('should not call raiseInteractTelemetry when htmlContent is null', () => {
      component.htmlContent = null
        ; (component as any).raiseTelemetry({ event: 'test' })
      expect(mockEvents.raiseInteractTelemetry).not.toHaveBeenCalled()
    })
  })

  // getUrl
  describe('getUrl', () => {
    it('should return same url when url is empty', () => {
      expect((component as any).getUrl('')).toBe('')
    })

    it('should return same url when url is falsy', () => {
      expect((component as any).getUrl(null)).toBeNull()
    })

    it('should return collection path when url contains /collection', () => {
      const url = 'https://host.com/content/collection/item'
      const result = (component as any).getUrl(url)
      expect(result).toContain('/mdo/')
      expect(result).toContain('content-bucket')
    })

    it('should return content path when url contains content segment', () => {
      const url = 'https://host.com/content/html/file.html'
      const result = (component as any).getUrl(url)
      expect(result).toContain('/mdo/')
      expect(result).toContain('content-bucket')
    })

    it('should return original url when no content segment found', () => {
      const url = 'https://host.com/path/file.html'
      const result = (component as any).getUrl(url)
      expect(result).toBe(url)
    })
  })

  // generateUrl
  describe('generateUrl', () => {
    it('should replace host and bucket in the URL', () => {
      const oldUrl = 'https://old-host.com/old-bucket/content/file.html'
      const result = (component as any).generateUrl(oldUrl)
      expect(result).toContain('azure.example.com')
      expect(result).toContain('test-bucket')
    })
  })
})
