// ── Mock heavy dependencies before any imports ────────────────────────────
jest.mock('video.js', () => {
  const mockPlayer = {
    dispose: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    ready: jest.fn(),
  }
  const videoJs: any = jest.fn(() => mockPlayer)
  videoJs.__mockPlayer = mockPlayer
  return videoJs
})

jest.mock('videojs-youtube', () => ({}))

const mockYoutubeInitializer = jest.fn().mockReturnValue({ dispose: jest.fn() })

jest.mock('../../../../../app/src/lib/head/_services/videojs-util', () => ({
  get youtubeInitializer() { return mockYoutubeInitializer },
}))

jest.mock('@sunbird-cb/collection', () => ({
  ROOT_WIDGET_CONFIG: { player: { video: 'playerVideo' } },
}))

jest.mock('../../../../../app/src/lib/head/_services/widget-content.model', () => ({
  NsContent: { EMimeTypes: { YOUTUBE: 'video/x-youtube' } },
}))

import { of } from 'rxjs'
import { PlayerYoutubeComponent } from './player-youtube.component'

describe('PlayerYoutubeComponent', () => {
  let component: PlayerYoutubeComponent
  let mockEventSvc: any
  let mockContentSvc: any
  let mockActivatedRoute: any
  let mockValueSvc: any

  beforeEach(() => {
    mockEventSvc = { dispatchEvent: jest.fn() }
    mockContentSvc = {
      saveContinueLearning: jest.fn().mockReturnValue(of(null)),
    }
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
      },
    }
    mockValueSvc = {
      isXSmall$: of(false),
    }

    component = new PlayerYoutubeComponent(
      mockEventSvc,
      mockContentSvc,
      mockActivatedRoute,
      mockValueSvc,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── Creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize screenSubscription as null', () => {
    expect(component.screenSubscription).toBeNull()
  })

  it('should initialize screenHeight as null', () => {
    expect(component.screenHeight).toBeNull()
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should subscribe to isXSmall$ on init', () => {
      component.ngOnInit()
      expect(component.screenSubscription).not.toBeNull()
    })

    it('should set screenHeight to 100% on small screen', () => {
      mockValueSvc.isXSmall$ = of(true)
      component = new PlayerYoutubeComponent(
        mockEventSvc, mockContentSvc, mockActivatedRoute, mockValueSvc,
      )
      component.ngOnInit()
      expect(component.screenHeight).toBe('100%')
    })

    it('should set screenHeight to 500vh on non-small screen', () => {
      mockValueSvc.isXSmall$ = of(false)
      component = new PlayerYoutubeComponent(
        mockEventSvc, mockContentSvc, mockActivatedRoute, mockValueSvc,
      )
      component.ngOnInit()
      expect(component.screenHeight).toBe('500vh')
    })
  })

  // ─── extractVideoId ────────────────────────────────────────────────────────

  describe('extractVideoId', () => {
    it('should extract video id from standard youtube URL', () => {
      const id = component.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should extract video id from short youtu.be URL', () => {
      const id = component.extractVideoId('https://youtu.be/dQw4w9WgXcQ')
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should extract video id from embed URL', () => {
      const id = component.extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should extract video id from URL with extra params', () => {
      const id = component.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')
      expect(id).toBe('dQw4w9WgXcQ')
    })

    it('should return null for non-youtube URL', () => {
      const id = component.extractVideoId('https://vimeo.com/123456')
      expect(id).toBeNull()
    })

    it('should return null for empty string', () => {
      const id = component.extractVideoId('')
      expect(id).toBeNull()
    })

    it('should return null for invalid URL', () => {
      const id = component.extractVideoId('not-a-url')
      expect(id).toBeNull()
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should not throw when player and dispose are null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should unsubscribe screenSubscription if set', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component.screenSubscription as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should call player.dispose when player exists', () => {
      const mockDispose = jest.fn()
        ; (component as any).player = { dispose: mockDispose }
      component.ngOnDestroy()
      expect(mockDispose).toHaveBeenCalled()
    })

    it('should call dispose function when dispose is set', () => {
      const mockDispose = jest.fn()
        ; (component as any).dispose = mockDispose
      component.ngOnDestroy()
      expect(mockDispose).toHaveBeenCalled()
    })
  })

  // ─── ngAfterViewInit ─────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    function setupYoutubeTag() {
      const nativeElement = document.createElement('div')
        ; (component as any).youtubeTag = { nativeElement }
    }

    it('should not call initializeYPlayer when widgetData has no url', () => {
      setupYoutubeTag()
      component.widgetData = {} as any
      component.ngAfterViewInit()
      expect(mockYoutubeInitializer).not.toHaveBeenCalled()
    })

    it('should call initializeYPlayer with embed video id for embed URL', () => {
      setupYoutubeTag()
      component.widgetData = { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', disableTelemetry: true } as any
      component.ngAfterViewInit()
      expect(mockYoutubeInitializer).toHaveBeenCalled()
    })

    it('should call initializeYPlayer with extracted video id for watch URL', () => {
      setupYoutubeTag()
      component.widgetData = { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', disableTelemetry: true } as any
      component.ngAfterViewInit()
      expect(mockYoutubeInitializer).toHaveBeenCalled()
    })

    it('should enable telemetry when disableTelemetry is false and defined', () => {
      setupYoutubeTag()
      component.widgetData = {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        disableTelemetry: false,
        identifier: 'yt-001',
      } as any
      component.ngAfterViewInit()
      expect(mockYoutubeInitializer).toHaveBeenCalled()
      // 8th argument (index 7) is enableTelemetry
      const callArgs = mockYoutubeInitializer.mock.calls[0]
      expect(callArgs[7]).toBe(true)
    })

    it('should dispatch event when identifier is set (dispatcher closure)', () => {
      setupYoutubeTag()
      component.widgetData = {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        disableTelemetry: true,
        identifier: 'yt-001',
      } as any
      component.ngAfterViewInit()
      // Get the dispatcher function (3rd arg = index 2)
      const dispatcher = mockYoutubeInitializer.mock.calls[0][2]
      dispatcher({ type: 'test' })
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    })

    it('should not dispatch event when identifier is not set (dispatcher closure)', () => {
      setupYoutubeTag()
      component.widgetData = {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        disableTelemetry: true,
      } as any
      component.ngAfterViewInit()
      const dispatcher = mockYoutubeInitializer.mock.calls[0][2]
      dispatcher({ type: 'test' })
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should call saveContinueLearning for non-playlist (saveCLearning closure)', () => {
      setupYoutubeTag()
      component.widgetData = {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        disableTelemetry: true,
        identifier: 'yt-001',
      } as any
      mockActivatedRoute.snapshot.queryParams = {}
      component.ngAfterViewInit()
      const saveCLearning = mockYoutubeInitializer.mock.calls[0][3]
      saveCLearning({ resourceId: 'r1', progress: 50 })
      expect(mockContentSvc.saveContinueLearning).toHaveBeenCalled()
    })

    it('should call saveContinueLearning with playlist context type', () => {
      setupYoutubeTag()
      component.widgetData = {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        disableTelemetry: true,
        identifier: 'yt-001',
      } as any
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Playlist', collectionId: 'col-1' }
      component.ngAfterViewInit()
      const saveCLearning = mockYoutubeInitializer.mock.calls[0][3]
      saveCLearning({ resourceId: 'r1', progress: 50 })
      const callArg = mockContentSvc.saveContinueLearning.mock.calls[0][0]
      expect(callArg.contextType).toBe('playlist')
    })

    it('should not call saveContinueLearning when no identifier (saveCLearning closure)', () => {
      setupYoutubeTag()
      component.widgetData = {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        disableTelemetry: true,
      } as any
      component.ngAfterViewInit()
      const saveCLearning = mockYoutubeInitializer.mock.calls[0][3]
      saveCLearning({ resourceId: 'r1', progress: 50 })
      expect(mockContentSvc.saveContinueLearning).not.toHaveBeenCalled()
    })
  })
})
