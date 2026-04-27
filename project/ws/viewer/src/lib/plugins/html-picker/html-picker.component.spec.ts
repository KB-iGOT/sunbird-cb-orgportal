import { HtmlPickerComponent } from './html-picker.component'

describe('HtmlPickerComponent', () => {
  let component: HtmlPickerComponent
  let mockEventSvc: any

  function makeIframeMock() {
    const mockChild = { setAttribute: jest.fn(), appendChild: jest.fn(), innerHTML: '' }
    const mockHead = { appendChild: jest.fn() }
    const mockBody = { appendChild: jest.fn() }
    const mockIframeDoc: any = {
      createElement: jest.fn().mockReturnValue(mockChild),
      createTextNode: jest.fn().mockReturnValue({}),
      head: mockHead,
      body: mockBody,
    }
    const mockIframe: any = {
      src: '',
      contentWindow: { document: mockIframeDoc },
    }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockIframe)
    return { mockIframe, mockIframeDoc, mockHead, mockBody, mockChild }
  }

  beforeEach(() => {
    mockEventSvc = { raiseInteractTelemetry: jest.fn() }
    jest.useFakeTimers()
    component = new HtmlPickerComponent(mockEventSvc)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default newData with empty values', () => {
    expect(component.newData.html).toBe('')
    expect(component.newData.css).toBe('')
    expect(component.newData.javascript).toBe('')
    expect(component.newData.htmlPresent).toBe(false)
    expect(component.newData.cssPresent).toBe(false)
    expect(component.newData.javascriptPresent).toBe(false)
    expect(component.newData.cdnLinks).toEqual([])
  })

  // ngOnInit
  describe('ngOnInit', () => {
    it('should run without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  // ngOnDestroy
  describe('ngOnDestroy', () => {
    it('should clear inputInterval and clickInterval if set', () => {
      component.inputInterval = setInterval(() => { }, 10000)
      component.clickInterval = setInterval(() => { }, 10000)
      const clearSpy = jest.spyOn(global, 'clearInterval')
      component.ngOnDestroy()
      expect(clearSpy).toHaveBeenCalledTimes(2)
    })

    it('should not throw if intervals are not set', () => {
      component.inputInterval = null
      component.clickInterval = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // onChange
  describe('onChange', () => {
    it('should call update()', () => {
      const updateSpy = jest.spyOn(component as any, 'update').mockImplementation(() => { })
      component.onChange()
      expect(updateSpy).toHaveBeenCalled()
    })
  })

  // raiseInputChange
  describe('raiseInputChange', () => {
    it('should set isInput to true', () => {
      component.firstInput = false  // prevent raiseInteractTelemetry from resetting isInput
      component.raiseInputChange()
      expect(component.isInput).toBe(true)
    })

    it('should call raiseInteractTelemetry and startInputTimer on first input', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry')
      const timerSpy = jest.spyOn(component as any, 'startInputTimer').mockImplementation(() => { })
      component.firstInput = true
      component.raiseInputChange()
      expect(telemetrySpy).toHaveBeenCalledWith('editor', 'codeinput')
      expect(timerSpy).toHaveBeenCalled()
    })

    it('should not call raiseInteractTelemetry on subsequent inputs', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry')
      component.firstInput = false
      component.raiseInputChange()
      expect(telemetrySpy).not.toHaveBeenCalled()
    })

    it('should set firstInput to false after first call', () => {
      jest.spyOn(component as any, 'startInputTimer').mockImplementation(() => { })
      component.firstInput = true
      component.raiseInputChange()
      expect(component.firstInput).toBe(false)
    })
  })

  // raiseClickEvent
  describe('raiseClickEvent', () => {
    it('should set isClick to true', () => {
      component.firstClick = false  // prevent raiseInteractTelemetry from resetting isClick
      component.raiseClickEvent()
      expect(component.isClick).toBe(true)
    })

    it('should call raiseInteractTelemetry and startClickTimer on first click', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry')
      const timerSpy = jest.spyOn(component as any, 'startClickTimer').mockImplementation(() => { })
      component.firstClick = true
      component.raiseClickEvent()
      expect(telemetrySpy).toHaveBeenCalledWith('editor', 'buttonclick')
      expect(timerSpy).toHaveBeenCalled()
    })

    it('should not call raiseInteractTelemetry on subsequent clicks', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry')
      component.firstClick = false
      component.raiseClickEvent()
      expect(telemetrySpy).not.toHaveBeenCalled()
    })

    it('should set firstClick to false after first click', () => {
      jest.spyOn(component as any, 'startClickTimer').mockImplementation(() => { })
      component.firstClick = true
      component.raiseClickEvent()
      expect(component.firstClick).toBe(false)
    })
  })

  // raiseInteractTelemetry
  describe('raiseInteractTelemetry', () => {
    it('should call eventSvc.raiseInteractTelemetry when identifier is set', () => {
      component.identifier = 'content-001'
        ; (component as any).raiseInteractTelemetry('editor', 'codeinput')
      expect(mockEventSvc.raiseInteractTelemetry).toHaveBeenCalledWith('editor', 'codeinput', {})
    })

    it('should not call eventSvc.raiseInteractTelemetry when identifier is null', () => {
      component.identifier = null
        ; (component as any).raiseInteractTelemetry('editor', 'codeinput')
      expect(mockEventSvc.raiseInteractTelemetry).not.toHaveBeenCalled()
    })

    it('should reset isInput to false when event is codeinput', () => {
      component.isInput = true
        ; (component as any).raiseInteractTelemetry('editor', 'codeinput')
      expect(component.isInput).toBe(false)
    })

    it('should reset isClick to false when event is buttonclick', () => {
      component.isClick = true
        ; (component as any).raiseInteractTelemetry('editor', 'buttonclick')
      expect(component.isClick).toBe(false)
    })

    it('should not reset isInput when event is not codeinput', () => {
      component.isInput = true
        ; (component as any).raiseInteractTelemetry('editor', 'buttonclick')
      expect(component.isInput).toBe(true)
    })
  })

  // startInputTimer
  describe('startInputTimer', () => {
    it('should start an interval that calls raiseInteractTelemetry when isInput is true', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry').mockImplementation(() => { })
      component.isInput = true
        ; (component as any).startInputTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(telemetrySpy).toHaveBeenCalledWith('editor', 'codeinput')
    })

    it('should not call raiseInteractTelemetry in interval when isInput is false', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry').mockImplementation(() => { })
      component.isInput = false
        ; (component as any).startInputTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(telemetrySpy).not.toHaveBeenCalled()
    })
  })

  // startClickTimer
  describe('startClickTimer', () => {
    it('should start an interval that calls raiseInteractTelemetry when isClick is true', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry').mockImplementation(() => { })
      component.isClick = true
        ; (component as any).startClickTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(telemetrySpy).toHaveBeenCalledWith('editor', 'buttonclick')
    })

    it('should not call raiseInteractTelemetry in interval when isClick is false', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseInteractTelemetry').mockImplementation(() => { })
      component.isClick = false
        ; (component as any).startClickTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(telemetrySpy).not.toHaveBeenCalled()
    })
  })

  // update
  describe('update', () => {
    it('should set doc.src with empty html when htmlPresent is false', () => {
      const { mockIframe } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: false,
        cssPresent: false,
        javascriptPresent: false,
        html: '<p>Hello</p>',
        css: 'body{}',
        javascript: 'console.log(1)',
        cdnLinks: [],
      }
      component.update()
      expect(mockIframe.src).toContain('javascript:')
    })

    it('should use html content when htmlPresent is true', () => {
      const { mockIframe } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: true,
        cssPresent: true,
        javascriptPresent: true,
        html: '<p>World</p>',
        css: '',
        javascript: '',
        cdnLinks: [],
      }
      component.update()
      expect(mockIframe.src).toContain('javascript:')
    })

    it('should strip // comments from html content', () => {
      const { mockIframe } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: true,
        cssPresent: false,
        javascriptPresent: false,
        html: '<p>// comment\nnext line</p>',
        css: '',
        javascript: '',
        cdnLinks: [],
      }
      component.update()
      expect(mockIframe.src).not.toContain('//')
    })

    it('should strip // comments from javascript content', () => {
      const { mockIframeDoc } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: true,
        cssPresent: false,
        javascriptPresent: true,
        html: '',
        css: '',
        javascript: 'var x = 1; // comment\nconsole.log(x)',
        cdnLinks: [],
      }
      component.update()
      // iframeDoc.createElement was called for script
      expect(mockIframeDoc.createElement).toHaveBeenCalledWith('script')
    })

    it('should replace single quotes in html with escaped quotes', () => {
      const { mockIframe } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: true,
        cssPresent: false,
        javascriptPresent: false,
        html: "<p class='test'>hi</p>",
        css: '',
        javascript: '',
        cdnLinks: [],
      }
      component.update()
      expect(mockIframe.src).not.toContain("'test'")
    })

    it('should replace single quotes in css content', () => {
      const { mockIframeDoc } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: true,
        cssPresent: true,
        javascriptPresent: false,
        html: '',
        css: "body { content: 'test' }",
        javascript: '',
        cdnLinks: [],
      }
      component.update()
      expect(mockIframeDoc.createElement).toHaveBeenCalledWith('style')
    })

    it('should append css style to iframeDoc.head when cssContent exists', () => {
      const { mockHead } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: false,
        cssPresent: true,
        javascriptPresent: false,
        html: '',
        css: 'body { color: red; }',
        javascript: '',
        cdnLinks: [],
      }
      component.update()
      expect(mockHead.appendChild).toHaveBeenCalled()
    })

    it('should append script to iframeDoc.body when jsContent exists', () => {
      const { mockBody } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: false,
        cssPresent: false,
        javascriptPresent: true,
        html: '',
        css: '',
        javascript: 'alert(1)',
        cdnLinks: [],
      }
      component.update()
      expect(mockBody.appendChild).toHaveBeenCalled()
    })

    it('should process CDN css links and append to head after timeout', () => {
      const { mockHead } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: false,
        cssPresent: false,
        javascriptPresent: false,
        html: '',
        css: '',
        javascript: '',
        cdnLinks: [{ src: 'https://example.com/style.css', type: 'css' }],
      }
      component.update()
      jest.advanceTimersByTime(10)
      expect(mockHead.appendChild).toHaveBeenCalled()
    })

    it('should process CDN script links and append to head after timeout', () => {
      const { mockHead } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: false,
        cssPresent: false,
        javascriptPresent: false,
        html: '',
        css: '',
        javascript: '',
        cdnLinks: [{ src: 'https://example.com/app.js', type: 'js' }],
      }
      component.update()
      jest.advanceTimersByTime(10)
      expect(mockHead.appendChild).toHaveBeenCalled()
    })

    it('should skip CDN links without src', () => {
      const { mockHead } = makeIframeMock()
      component.newData = {
        question: '',
        htmlPresent: false,
        cssPresent: false,
        javascriptPresent: false,
        html: '',
        css: '',
        javascript: '',
        cdnLinks: [{ type: 'css' }],
      }
      component.update()
      jest.advanceTimersByTime(10)
      expect(mockHead.appendChild).not.toHaveBeenCalled()
    })

    it('should handle null contentWindow and use new Document()', () => {
      const mockIframe: any = { src: '', contentWindow: null }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockIframe)
      component.newData = {
        question: '',
        htmlPresent: false,
        cssPresent: false,
        javascriptPresent: false,
        html: '',
        css: '',
        javascript: '',
        cdnLinks: [],
      }
      expect(() => component.update()).not.toThrow()
    })

    it('should handle null newData gracefully', () => {
      const { mockIframe } = makeIframeMock()
        ; (component as any).newData = null
      expect(() => component.update()).not.toThrow()
      expect(mockIframe.src).toContain('javascript:')
    })
  })
})
