import { IapComponent } from './iap.component'

describe('IapComponent', () => {
  let component: IapComponent
  let mockDomSanitizer: any
  let mockLogger: any
  let mockContentWindow: any
  let mockIframeElem: any
  let capturedMessageHandler: Function | null

  beforeEach(() => {
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((v: string) => `safe:${v}`),
    }
    mockLogger = {
      log: jest.fn(),
    }

    mockContentWindow = { postMessage: jest.fn() }
    mockIframeElem = {
      contentWindow: mockContentWindow,
      requestFullscreen: jest.fn(),
      mozRequestFullScreen: undefined,
      webkitRequestFullscreen: undefined,
      msRequestFullscreen: undefined,
    }

    jest.spyOn(document, 'getElementById').mockReturnValue(mockIframeElem as any)

    // Capture message listener added in ngAfterViewInit
    capturedMessageHandler = null
    jest.spyOn(window, 'addEventListener').mockImplementation((event: any, handler: any) => {
      if (event === 'message') {
        capturedMessageHandler = handler
      }
    })
    jest.spyOn(window, 'removeEventListener').mockImplementation(() => { })
    jest.spyOn(document.body, 'addEventListener').mockImplementation(() => { })
    jest.spyOn(document.body, 'removeEventListener').mockImplementation(() => { })
    jest.spyOn(document, 'addEventListener').mockImplementation(() => { })
    jest.spyOn(document, 'removeEventListener').mockImplementation(() => { })

    component = new IapComponent(mockDomSanitizer, mockLogger)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default iframeUrl to null', () => {
    expect(component.iframeUrl).toBeNull()
  })

  it('should default proctoringWarning to false', () => {
    expect(component.proctoringWarning).toBe(false)
  })

  it('should default proctoringStarted to false', () => {
    expect(component.proctoringStarted).toBe(false)
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  it('should run ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  // ─── ngOnChanges ─────────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should set iframeUrl when iapContent has artifactUrl', () => {
      component.iapContent = { artifactUrl: 'https://example.com/iap' } as any
      component.ngOnChanges()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://example.com/iap')
      expect(component.iframeUrl).toBe('safe:https://example.com/iap')
    })

    it('should set iframeUrl to null when iapContent is null', () => {
      component.iapContent = null
      component.ngOnChanges()
      expect(component.iframeUrl).toBeNull()
    })

    it('should set iframeUrl to null when iapContent has no artifactUrl', () => {
      component.iapContent = {} as any
      component.ngOnChanges()
      expect(component.iframeUrl).toBeNull()
    })

    it('should set iframeUrl to null when artifactUrl is empty string', () => {
      component.iapContent = { artifactUrl: '' } as any
      component.ngOnChanges()
      expect(component.iframeUrl).toBeNull()
    })
  })

  // ─── ngAfterViewInit (message listener) ──────────────────────────────────────

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      component.ngAfterViewInit()
    })

    it('should register a message event listener', () => {
      expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
      expect(capturedMessageHandler).not.toBeNull()
    })

    it('should log and return when event.data is falsy', () => {
      capturedMessageHandler!({ data: null })
      expect(mockLogger.log).toHaveBeenCalledWith('data unavailable')
    })

    it('should log and return when event.data is undefined', () => {
      capturedMessageHandler!({ data: undefined })
      expect(mockLogger.log).toHaveBeenCalledWith('data unavailable')
    })

    it('should call turnOnProctoring and set proctoringStarted=true for turnOnProctoring event', () => {
      capturedMessageHandler!({ data: { functionToExecute: 'turnOnProctoring' } })
      expect(component.proctoringStarted).toBe(true)
      // sendProctoringInfo('fullScreen') inside turnOnProctoring should set proctoringWarning
      expect(component.proctoringWarning).toBe(true)
    })

    it('should call turnOffProctoring and set proctoringStarted=false for turnOffProctoring event', () => {
      component.proctoringStarted = true
      capturedMessageHandler!({ data: { functionToExecute: 'turnOffProctoring' } })
      expect(component.proctoringStarted).toBe(false)
      expect(component.proctoringWarning).toBe(false)
    })

    it('should do nothing when functionToExecute is an unknown value', () => {
      component.proctoringStarted = false
      capturedMessageHandler!({ data: { functionToExecute: 'someOtherFunction' } })
      expect(component.proctoringStarted).toBe(false)
    })

    it('should do nothing when event.data has no functionToExecute', () => {
      capturedMessageHandler!({ data: { someKey: 'value' } })
      expect(component.proctoringStarted).toBe(false)
    })
  })

  // ─── ngOnDestroy ─────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call turnOffProctoring when proctoringStarted is true', () => {
      component.proctoringStarted = true
      component.ngOnDestroy()
      // turnOffProctoring sets proctoringWarning = false
      expect(component.proctoringWarning).toBe(false)
      expect(window.removeEventListener).toHaveBeenCalled()
    })

    it('should not call turnOffProctoring when proctoringStarted is false', () => {
      component.proctoringStarted = false
      component.ngOnDestroy()
      expect(window.removeEventListener).not.toHaveBeenCalled()
    })
  })

  // ─── enterFullScreen ─────────────────────────────────────────────────────────

  describe('enterFullScreen', () => {
    it('should set proctoringWarning to false', () => {
      component.proctoringWarning = true
      component.enterFullScreen()
      expect(component.proctoringWarning).toBe(false)
    })

    it('should call requestFullscreen when available', () => {
      component.enterFullScreen()
      expect(mockIframeElem.requestFullscreen).toHaveBeenCalled()
    })

    it('should call mozRequestFullScreen when requestFullscreen is absent', () => {
      mockIframeElem.requestFullscreen = undefined
      mockIframeElem.mozRequestFullScreen = jest.fn()
      component.enterFullScreen()
      expect(mockIframeElem.mozRequestFullScreen).toHaveBeenCalled()
    })

    it('should call webkitRequestFullscreen when others are absent', () => {
      mockIframeElem.requestFullscreen = undefined
      mockIframeElem.mozRequestFullScreen = undefined
      mockIframeElem.webkitRequestFullscreen = jest.fn()
      component.enterFullScreen()
      expect(mockIframeElem.webkitRequestFullscreen).toHaveBeenCalled()
    })

    it('should call msRequestFullscreen when others are absent', () => {
      mockIframeElem.requestFullscreen = undefined
      mockIframeElem.mozRequestFullScreen = undefined
      mockIframeElem.webkitRequestFullscreen = undefined
      mockIframeElem.msRequestFullscreen = jest.fn()
      component.enterFullScreen()
      expect(mockIframeElem.msRequestFullscreen).toHaveBeenCalled()
    })

    it('should not throw when elem is null (getElementById returns null)', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.enterFullScreen()).not.toThrow()
    })
  })

  // ─── sendProctoringInfo (via public event handlers) ──────────────────────────

  describe('sendProctoringInfo (via arrow-function handlers)', () => {
    it('contextCheck should postMessage rightClick and call preventDefault', () => {
      const e = { preventDefault: jest.fn() }
      component.contextCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'rightClick' }, '*')
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('beforeUnload should postMessage beforeunload and set returnValue', () => {
      const e: any = { returnValue: '' }
      component.beforeUnload(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'beforeunload' }, '*')
      expect(e.returnValue).toBe('You are not allowed to close window.')
    })

    it('visibilityCheck should log and postMessage visibilitychange', () => {
      component.visibilityCheck()
      expect(mockLogger.log).toHaveBeenCalledWith('document.visibilityState >', document.visibilityState)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'visibilitychange' }, '*')
    })

    it('fullscreenCheck should postMessage fullScreen and set proctoringWarning=true', () => {
      component.fullscreenCheck()
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'fullScreen' }, '*')
      expect(component.proctoringWarning).toBe(true)
    })

    it('copyCheck should postMessage copy and call preventDefault', () => {
      const e = { preventDefault: jest.fn() }
      component.copyCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'copy' }, '*')
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('cutCheck should postMessage cut and call preventDefault', () => {
      const e = { preventDefault: jest.fn() }
      component.cutCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'cut' }, '*')
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('pasteCheck should postMessage paste and call preventDefault', () => {
      const e = { preventDefault: jest.fn() }
      component.pasteCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'paste' }, '*')
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('sendProctoringInfo should set proctoringWarning=true for esc event', () => {
      // esc is sent via keydownCheck
      const e = { key: 'esc', altKey: false, ctrlKey: false, preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(component.proctoringWarning).toBe(true)
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('sendProctoringInfo should not set proctoringWarning for non-esc/fullScreen events', () => {
      const e = { preventDefault: jest.fn() }
      component.contextCheck(e)
      expect(component.proctoringWarning).toBe(false)
    })

    it('should not postMessage when contentWindow is null', () => {
      mockIframeElem.contentWindow = null
      const e = { preventDefault: jest.fn() }
      expect(() => component.contextCheck(e)).not.toThrow()
    })
  })

  // ─── keydownCheck ────────────────────────────────────────────────────────────

  describe('keydownCheck', () => {
    it('should send alt and preventDefault when altKey is true', () => {
      const e = { altKey: true, ctrlKey: false, key: '', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'alt' }, '*')
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('should send ctrl and preventDefault when ctrlKey is true', () => {
      const e = { altKey: false, ctrlKey: true, key: '', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'ctrl' }, '*')
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('should send tab and preventDefault when key is "tab"', () => {
      const e = { altKey: false, ctrlKey: false, key: 'tab', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'tab' }, '*')
    })

    it('should send esc and set proctoringWarning when key is "esc"', () => {
      const e = { altKey: false, ctrlKey: false, key: 'esc', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'esc' }, '*')
      expect(component.proctoringWarning).toBe(true)
    })

    it('should send window and preventDefault when key is "window"', () => {
      const e = { altKey: false, ctrlKey: false, key: 'window', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'window' }, '*')
    })

    it('should send f1 and preventDefault when key is "f1"', () => {
      const e = { altKey: false, ctrlKey: false, key: 'f1', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'f1' }, '*')
    })

    it('should send f8 and preventDefault when key is "f8"', () => {
      const e = { altKey: false, ctrlKey: false, key: 'f8', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'f8' }, '*')
    })

    it('should send f12 and preventDefault when key is "f12"', () => {
      const e = { altKey: false, ctrlKey: false, key: 'f12', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith({ proctoring: 'f12' }, '*')
    })

    it('should do nothing for unrecognised key', () => {
      const e = { altKey: false, ctrlKey: false, key: 'a', preventDefault: jest.fn() } as any
      component.keydownCheck(e)
      expect(e.preventDefault).not.toHaveBeenCalled()
    })
  })

  // ─── exitFullscreen (private, via turnOffProctoring) ──────────────────────────

  describe('exitFullscreen (via turnOffProctoring in ngOnDestroy)', () => {
    it('should call document.exitFullscreen when available', () => {
      const exitMock = jest.fn().mockResolvedValue(undefined)
      Object.defineProperty(document, 'exitFullscreen', { value: exitMock, configurable: true, writable: true })
      component.proctoringStarted = true
      component.ngOnDestroy()
      expect(exitMock).toHaveBeenCalled()
      Object.defineProperty(document, 'exitFullscreen', { value: undefined, configurable: true, writable: true })
    })

    it('should call mozCancelFullScreen when exitFullscreen is absent', () => {
      const mozMock = jest.fn()
      const doc = document as any
      const origExit = doc.exitFullscreen
      doc.exitFullscreen = undefined
      doc.mozCancelFullScreen = mozMock
      component.proctoringStarted = true
      component.ngOnDestroy()
      expect(mozMock).toHaveBeenCalled()
      doc.exitFullscreen = origExit
      doc.mozCancelFullScreen = undefined
    })

    it('should call webkitExitFullscreen when others are absent', () => {
      const webkitMock = jest.fn()
      const doc = document as any
      const origExit = doc.exitFullscreen
      doc.exitFullscreen = undefined
      doc.webkitExitFullscreen = webkitMock
      component.proctoringStarted = true
      component.ngOnDestroy()
      expect(webkitMock).toHaveBeenCalled()
      doc.exitFullscreen = origExit
      doc.webkitExitFullscreen = undefined
    })

    it('should call msExitFullscreen when others are absent', () => {
      const msMock = jest.fn()
      const doc = document as any
      const origExit = doc.exitFullscreen
      doc.exitFullscreen = undefined
      doc.msExitFullscreen = msMock
      component.proctoringStarted = true
      component.ngOnDestroy()
      expect(msMock).toHaveBeenCalled()
      doc.exitFullscreen = origExit
      doc.msExitFullscreen = undefined
    })
  })

  // ─── turnOnProctoring event listeners ────────────────────────────────────────

  describe('turnOnProctoring (via ngAfterViewInit message)', () => {
    it('should register all expected event listeners', () => {
      component.ngAfterViewInit()
      capturedMessageHandler!({ data: { functionToExecute: 'turnOnProctoring' } })

      expect(window.addEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function))
      expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(document.body.addEventListener).toHaveBeenCalledWith('copy', expect.any(Function))
      expect(document.body.addEventListener).toHaveBeenCalledWith('cut', expect.any(Function))
      expect(document.body.addEventListener).toHaveBeenCalledWith('paste', expect.any(Function))
      expect(document.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    })
  })

  // ─── turnOffProctoring event listener removal ────────────────────────────────

  describe('turnOffProctoring (via ngAfterViewInit message)', () => {
    it('should remove all expected event listeners', () => {
      component.ngAfterViewInit()
      capturedMessageHandler!({ data: { functionToExecute: 'turnOffProctoring' } })

      expect(window.removeEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function))
      expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(document.body.removeEventListener).toHaveBeenCalledWith('copy', expect.any(Function))
      expect(document.body.removeEventListener).toHaveBeenCalledWith('cut', expect.any(Function))
      expect(document.body.removeEventListener).toHaveBeenCalledWith('paste', expect.any(Function))
      expect(document.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    })
  })
})
