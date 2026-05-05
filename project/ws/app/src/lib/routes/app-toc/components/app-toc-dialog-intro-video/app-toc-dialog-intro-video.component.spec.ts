// Mock @ws-widget/collection and @ws-widget/resolver to avoid ESM issues
jest.mock('@ws-widget/collection', () => ({
  ROOT_WIDGET_CONFIG: {
    player: { video: 'playerVideo', _type: 'player' },
  },
}), { virtual: true })
jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}), { virtual: true })

import { AppTocDialogIntroVideoComponent } from './app-toc-dialog-intro-video.component'

describe('AppTocDialogIntroVideoComponent', () => {
  let component: AppTocDialogIntroVideoComponent
  let mockDialogRef: any
  const mockVideoUrl = 'https://example.com/intro.mp4'

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    component = new AppTocDialogIntroVideoComponent(mockVideoUrl, mockDialogRef)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have data injected', () => {
    expect(component.data).toBe(mockVideoUrl)
  })

  it('introVideoRenderConfig should be null before ngOnInit', () => {
    expect(component.introVideoRenderConfig).toBeNull()
  })

  describe('ngOnInit', () => {
    beforeEach(() => component.ngOnInit())

    it('should set introVideoRenderConfig after ngOnInit', () => {
      expect(component.introVideoRenderConfig).not.toBeNull()
    })

    it('should set widgetData.url to the injected data', () => {
      expect(component.introVideoRenderConfig!.widgetData.url).toBe(mockVideoUrl)
    })

    it('should set widgetData.autoplay to true', () => {
      expect(component.introVideoRenderConfig!.widgetData.autoplay).toBe(true)
    })

    it('should set widgetHostClass to video-full block', () => {
      expect(component.introVideoRenderConfig!.widgetHostClass).toBe('video-full block')
    })

    it('should set widgetHostStyle height to 350px', () => {
      expect(component.introVideoRenderConfig!.widgetHostStyle.height).toBe('350px')
    })
  })

  describe('closeDialog', () => {
    it('should call dialogRef.close', () => {
      component.closeDialog()
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })
  })
})
