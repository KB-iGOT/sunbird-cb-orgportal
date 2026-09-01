import { of } from 'rxjs'
import { Subject } from 'rxjs'
import { VideoComponent } from './video.component'

jest.mock('../../../../../../../src/environments/environment', () => ({
  environment: {
    azureHost: 'https://azure.example.com',
    azureBucket: 'test-bucket',
  },
}), { virtual: true })

const mockVideoData: any = {
  identifier: 'video-001',
  name: 'Test Video',
  description: 'A test video',
  artifactUrl: 'https://example.com/content/video.mp4',
  mimeType: 'video/mp4',
  primaryCategory: 'Learning Resource',
  duration: 300,
  subTitles: null,
}

describe('VideoComponent', () => {
  let component: VideoComponent
  let mockActivatedRoute: any
  let mockValueSvc: any
  let mockViewerSvc: any
  let mockContentSvc: any
  let mockPlatform: any
  let mockAccessControlSvc: any

  const paramMapSubject = new Subject<any>()

  beforeEach(() => {
    mockActivatedRoute = {
      paramMap: paramMapSubject.asObservable(),
      data: of({ content: { data: { ...mockVideoData } } }),
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue(null) },
        paramMap: { get: jest.fn().mockReturnValue('video-001') },
        queryParams: {},
      },
    }

    mockValueSvc = { isXSmall$: of(false) }

    mockViewerSvc = {
      getContent: jest.fn().mockReturnValue(of({ ...mockVideoData })),
      realTimeProgressUpdate: jest.fn(),
    }

    mockContentSvc = {
      fetchContentHistory: jest.fn().mockReturnValue(of(null)),
    }

    mockPlatform = {
      IOS: false,
      WEBKIT: false,
      SAFARI: false,
      ANDROID: false,
    }

    mockAccessControlSvc = {
      authoringConfig: { newDesign: false },
    }

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/viewer/video/video-001' },
      writable: true,
    })

    component = new VideoComponent(
      mockActivatedRoute,
      mockValueSvc,
      mockViewerSvc,
      mockContentSvc,
      mockPlatform,
      mockAccessControlSvc,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set forPreview from paramMap', () => {
    paramMapSubject.next({ get: () => 'true' })
    expect(component.forPreview).toBe(true)

    paramMapSubject.next({ get: () => null })
    expect(component.forPreview).toBe(false)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit — non-preview (default) path
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit — non-preview mode', () => {
    it('should subscribe to isXSmall$ and set isScreenSizeSmall', () => {
      mockValueSvc.isXSmall$ = of(true)
      component = new VideoComponent(
        mockActivatedRoute, mockValueSvc, mockViewerSvc,
        mockContentSvc, mockPlatform, mockAccessControlSvc,
      )
      component.ngOnInit()
      expect(component.isScreenSizeSmall).toBe(true)
    })

    it('should set isNotEmbed to true when embed param is absent', () => {
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(true)
    })

    it('should set isNotEmbed to false when embed=true', () => {
      mockActivatedRoute.snapshot.queryParamMap = { get: jest.fn().mockReturnValue('true') }
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(false)
    })

    it('should set videoData from route data', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.videoData).toBeTruthy()
      expect(component.videoData.identifier).toBe('video-001')
    })

    it('should set isFetchingDataComplete to true', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should initialize widgetResolverVideoData', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverVideoData).toBeTruthy()
      expect(component.widgetResolverVideoData.widgetType).toBe('player')
    })

    it('should set artifactUrl as url when not forPreview', async () => {
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverVideoData.widgetData.url).toBe(mockVideoData.artifactUrl)
    })

    it('should set generated url when forPreview is true', async () => {
      component.forPreview = true
      component.ngOnInit()
      await Promise.resolve()
      expect(typeof component.widgetResolverVideoData.widgetData.url).toBe('string')
    })

    it('should set identifier in widgetResolverVideoData', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverVideoData.widgetData.identifier).toBe('video-001')
    })

    it('should set mimeType in widgetResolverVideoData', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverVideoData.widgetData.mimeType).toBe('video/mp4')
    })

    it('should call formDiscussionForumWidget when videoData exists', async () => {
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit — preview mode (viewerSvc.getContent path)
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit — preview mode', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParamMap = { get: jest.fn().mockReturnValue('true') }
    })

    it('should call viewerSvc.getContent in preview mode', () => {
      component.ngOnInit()
      expect(mockViewerSvc.getContent).toHaveBeenCalledWith('video-001')
    })

    it('should set videoData from viewerSvc', () => {
      component.ngOnInit()
      expect(component.videoData).toBeTruthy()
    })

    it('should set disableTelemetry to true in preview mode', () => {
      component.ngOnInit()
      expect(component.widgetResolverVideoData?.widgetData.disableTelemetry).toBe(true)
    })

    it('should set isFetchingDataComplete to true in preview mode', () => {
      component.ngOnInit()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should set subtitles when subTitles present with content-store url', () => {
      const videoWithSubTitles = {
        ...mockVideoData,
        subTitles: [{ url: 'https://example.com/content-store/subtitle.vtt' }],
      }
      mockViewerSvc.getContent.mockReturnValue(of(videoWithSubTitles))
      component.ngOnInit()
      expect(component.widgetResolverVideoData?.widgetData.subtitles).toBeDefined()
      expect(component.widgetResolverVideoData?.widgetData.subtitles.length).toBe(1)
    })

    it('should set subtitles when subTitles present with non-content-store url', () => {
      const videoWithSubTitles = {
        ...mockVideoData,
        subTitles: [{ url: 'https://example.com/subtitles/subtitle.vtt' }],
      }
      mockViewerSvc.getContent.mockReturnValue(of(videoWithSubTitles))
      component.ngOnInit()
      expect(component.widgetResolverVideoData?.widgetData.subtitles[0].url).toContain('authContent')
    })

    it('should handle empty subTitles array', () => {
      mockViewerSvc.getContent.mockReturnValue(of({ ...mockVideoData, subTitles: [] }))
      component.ngOnInit()
      expect(component.widgetResolverVideoData?.widgetData.subtitles).toBeDefined()
    })

    it('should not use viewerSvc when newDesign is true', () => {
      mockAccessControlSvc.authoringConfig.newDesign = true
      component.ngOnInit()
      expect(mockViewerSvc.getContent).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // generateUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('generateUrl', () => {
    it('should return empty string for empty input', () => {
      expect(component.generateUrl('')).toBe('')
    })

    it('should reconstruct url replacing host and bucket', () => {
      const result = component.generateUrl('https://old-host.com/old-bucket/path/to/video.mp4')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle url with only 2 parts', () => {
      const result = component.generateUrl('https://host.com')
      expect(typeof result).toBe('string')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getResumePoint
  // ──────────────────────────────────────────────────────────────────────────
  describe('getResumePoint', () => {
    it('should return 0 when content is null', () => {
      expect(component.getResumePoint(null)).toBe(0)
    })

    it('should return 0 when progress is not set', () => {
      expect(component.getResumePoint({ ...mockVideoData, progress: null } as any)).toBe(0)
    })

    it('should return 0 when progressSupported is false', () => {
      expect(component.getResumePoint({
        ...mockVideoData,
        progress: { progressSupported: false, progress: 0.5 },
      } as any)).toBe(0)
    })

    it('should calculate resume point when progress data exists', () => {
      const result = component.getResumePoint({
        ...mockVideoData,
        duration: 100,
        progress: { progressSupported: true, progress: 0.5 },
      } as any)
      expect(result).toBe(50)
    })

    it('should return 0 when progress value is falsy', () => {
      const result = component.getResumePoint({
        ...mockVideoData,
        duration: 100,
        progress: { progressSupported: true, progress: 0 },
      } as any)
      expect(result).toBe(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // initWidgetResolverVideoData
  // ──────────────────────────────────────────────────────────────────────────
  describe('initWidgetResolverVideoData', () => {
    it('should return widgetType player', () => {
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetType).toBe('player')
    })

    it('should return widgetSubType playerVideo', () => {
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetSubType).toBe('playerVideo')
    })

    it('should set isVideojs true for IOS platform', () => {
      mockPlatform.IOS = true
      component = new VideoComponent(
        mockActivatedRoute, mockValueSvc, mockViewerSvc,
        mockContentSvc, mockPlatform, mockAccessControlSvc,
      )
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetData.isVideojs).toBe(true)
    })

    it('should set isVideojs true for ANDROID platform', () => {
      mockPlatform.ANDROID = true
      component = new VideoComponent(
        mockActivatedRoute, mockValueSvc, mockViewerSvc,
        mockContentSvc, mockPlatform, mockAccessControlSvc,
      )
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetData.isVideojs).toBe(true)
    })

    it('should set isVideojs true when not WEBKIT and not IOS and not SAFARI', () => {
      mockPlatform.IOS = false
      mockPlatform.WEBKIT = false
      mockPlatform.SAFARI = false
      component = new VideoComponent(
        mockActivatedRoute, mockValueSvc, mockViewerSvc,
        mockContentSvc, mockPlatform, mockAccessControlSvc,
      )
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetData.isVideojs).toBe(true)
    })

    it('should set isVideojs false for WEBKIT non-IOS non-ANDROID platform', () => {
      mockPlatform.IOS = false
      mockPlatform.WEBKIT = true
      mockPlatform.SAFARI = true
      mockPlatform.ANDROID = false
      component = new VideoComponent(
        mockActivatedRoute, mockValueSvc, mockViewerSvc,
        mockContentSvc, mockPlatform, mockAccessControlSvc,
      )
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetData.isVideojs).toBe(false)
    })

    it('should set continueLearning to true', () => {
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetData.continueLearning).toBe(true)
    })

    it('should set mimeType from content', () => {
      const result = component.initWidgetResolverVideoData(mockVideoData)
      expect(result.widgetData.mimeType).toBe('video/mp4')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // formDiscussionForumWidget
  // ──────────────────────────────────────────────────────────────────────────
  describe('formDiscussionForumWidget', () => {
    it('should set discussionForumWidget', () => {
      component.formDiscussionForumWidget(mockVideoData)
      expect(component.discussionForumWidget).toBeTruthy()
      expect(component.discussionForumWidget?.widgetData.id).toBe('video-001')
    })

    it('should set widgetSubType and widgetType', () => {
      component.formDiscussionForumWidget(mockVideoData)
      expect(component.discussionForumWidget?.widgetSubType).toBe('discussionForum')
      expect(component.discussionForumWidget?.widgetType).toBe('discussionForum')
    })

    it('should set isDisabled from forPreview flag', () => {
      component.forPreview = true
      component.formDiscussionForumWidget(mockVideoData)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // fetchContinueLearning
  // ──────────────────────────────────────────────────────────────────────────
  describe('fetchContinueLearning', () => {
    beforeEach(() => {
      component.widgetResolverVideoData = component.initWidgetResolverVideoData(mockVideoData)
    })

    it('should resolve true on successful fetch', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
      const result = await component.fetchContinueLearning('col-001', 'video-001')
      expect(result).toBe(true)
    })

    it('should set resumePoint when data matches and progress exists', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'video-001',
        continueData: { progress: '45' },
      }))
      await component.fetchContinueLearning('col-001', 'video-001')
      expect(component.widgetResolverVideoData.widgetData.resumePoint).toBe(45)
    })

    it('should not set resumePoint when identifier does not match', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'other-video',
        continueData: { progress: '45' },
      }))
      await component.fetchContinueLearning('col-001', 'video-001')
      expect(component.widgetResolverVideoData.widgetData.resumePoint).toBe(0)
    })

    it('should not set resumePoint when continueData is missing', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'video-001',
        continueData: null,
      }))
      await component.fetchContinueLearning('col-001', 'video-001')
      expect(component.widgetResolverVideoData.widgetData.resumePoint).toBe(0)
    })

    it('should resolve true on error', async () => {
      const { throwError } = await import('rxjs')
      mockContentSvc.fetchContentHistory.mockReturnValue(throwError(() => new Error('fail')))
      const result = await component.fetchContinueLearning('col-001', 'video-001')
      expect(result).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnDestroy
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('should unsubscribe routeDataSubscription', () => {
      const mockUnsub = jest.fn()
        ; (component as any).routeDataSubscription = { unsubscribe: mockUnsub }
      component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should unsubscribe screenSizeSubscription', () => {
      const mockUnsub = jest.fn()
        ; (component as any).screenSizeSubscription = { unsubscribe: mockUnsub }
      component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should unsubscribe viewerDataSubscription', () => {
      const mockUnsub = jest.fn()
        ; (component as any).viewerDataSubscription = { unsubscribe: mockUnsub }
      component.ngOnDestroy()
      expect(mockUnsub).toHaveBeenCalled()
    })

    it('should handle null subscriptions gracefully', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
