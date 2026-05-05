import { WsCustomTooltipDirective } from './ws-auth-ws-custom-tooltip.directive'

// ─── mocks ────────────────────────────────────────────────────────────────────

const mockDetachFn = jest.fn()
const mockHasAttachedFn = jest.fn().mockReturnValue(false)
const mockOverlayRef = {
  attach: jest.fn().mockReturnValue({
    instance: { tooltipData: null, tooltipTemplate: null },
  }),
  detach: mockDetachFn,
  hasAttached: mockHasAttachedFn,
}

const mockPositionStrategy = {
  flexibleConnectedTo: jest.fn().mockReturnThis(),
  withPositions: jest.fn().mockReturnThis(),
}

const mockScrollStrategy = { reposition: jest.fn().mockReturnValue({}) }

const mockOverlay = {
  create: jest.fn().mockReturnValue(mockOverlayRef),
  scrollStrategies: mockScrollStrategy,
  position: jest.fn().mockReturnValue(mockPositionStrategy),
}

const mockOverlayPositionBuilder = {
  flexibleConnectedTo: jest.fn().mockReturnValue(mockPositionStrategy),
}

const mockElementRef = { nativeElement: document.createElement('div') }

const mockNgZone = {
  runOutsideAngular: jest.fn((fn: any) => { fn() }),
  run: jest.fn((fn: any) => fn()),
}

function buildDirective() {
  return new WsCustomTooltipDirective(
    mockOverlay as any,
    mockOverlayPositionBuilder as any,
    mockElementRef as any,
    mockNgZone as any,
  )
}

describe('WsCustomTooltipDirective', () => {
  let directive: WsCustomTooltipDirective

  beforeEach(() => {
    jest.clearAllMocks()
    mockHasAttachedFn.mockReturnValue(false)
    mockOverlay.create.mockReturnValue(mockOverlayRef)
    mockOverlayRef.attach.mockReturnValue({
      instance: { tooltipData: null, tooltipTemplate: null },
    })
    directive = buildDirective()
  })

  afterEach(() => {
    directive.ngOnDestroy()
  })

  // ─── creation ─────────────────────────────────────────────────────────────

  it('should create an instance', () => {
    expect(directive).toBeTruthy()
  })

  // ─── show ─────────────────────────────────────────────────────────────────

  describe('show()', () => {
    it('should create an overlay and attach the portal', () => {
      directive.tooltipData = { text: 'Hello' }
      directive.show()
      expect(mockOverlay.create).toHaveBeenCalled()
      expect(mockOverlayRef.attach).toHaveBeenCalled()
    })

    it('should set tooltipData on the component instance', () => {
      const tooltipData = { text: 'Hello Tooltip' }
      directive.tooltipData = tooltipData
      directive.show()
      const instance = mockOverlayRef.attach.mock.results[0].value.instance
      expect(instance.tooltipData).toBe(tooltipData)
    })

    it('should set tooltipTemplate on the component instance', () => {
      const tmpl = {} as any
      directive.tooltipTemplate = tmpl
      directive.show()
      const instance = mockOverlayRef.attach.mock.results[0].value.instance
      expect(instance.tooltipTemplate).toBe(tmpl)
    })

    it('should not create overlay again when already attached', () => {
      mockHasAttachedFn.mockReturnValue(true)
        // Simulate overlayRef already exists
        ; (directive as any).overlayRef = mockOverlayRef
      directive.show()
      // create should not be called again since hasAttached returns true
      expect(mockOverlay.create).not.toHaveBeenCalled()
    })

    it('should clear existing hideTimeout before showing', () => {
      const clearSpy = jest.spyOn(global, 'clearTimeout')
        ; (directive as any).hideTimeoutId = 99
      directive.show()
      expect(clearSpy).toHaveBeenCalledWith(99)
    })

    it('should use overlayPositionBuilder.flexibleConnectedTo with elementRef', () => {
      directive.show()
      expect(mockOverlayPositionBuilder.flexibleConnectedTo).toHaveBeenCalledWith(mockElementRef)
    })

    it('should call withPositions with 4 position strategies', () => {
      directive.show()
      const positions = mockPositionStrategy.withPositions.mock.calls[0][0]
      expect(positions).toHaveLength(4)
    })
  })

  // ─── hide ─────────────────────────────────────────────────────────────────

  describe('hide()', () => {
    it('should call ngZone.runOutsideAngular', () => {
      directive.hide()
      expect(mockNgZone.runOutsideAngular).toHaveBeenCalled()
    })

    it('should eventually call closeTooltip (detach overlayRef)', (done) => {
      ; (directive as any).overlayRef = mockOverlayRef
      directive.show()
      directive.hide()
      setTimeout(() => {
        expect(mockDetachFn).toHaveBeenCalled()
        done()
      }, 200)
    })
  })

  // ─── ngOnDestroy ─────────────────────────────────────────────────────────

  describe('ngOnDestroy()', () => {
    it('should clear hideTimeoutId if set', () => {
      const clearSpy = jest.spyOn(global, 'clearTimeout')
        ; (directive as any).hideTimeoutId = 42
      directive.ngOnDestroy()
      expect(clearSpy).toHaveBeenCalledWith(42)
    })

    it('should detach overlayRef if present', () => {
      ; (directive as any).overlayRef = mockOverlayRef
      directive.ngOnDestroy()
      expect(mockDetachFn).toHaveBeenCalled()
    })

    it('should not throw when overlayRef is undefined', () => {
      ; (directive as any).overlayRef = undefined
      expect(() => directive.ngOnDestroy()).not.toThrow()
    })
  })
})
