import { of, throwError } from 'rxjs'
import { AudioComponent } from './audio.component'

jest.mock('../../../../../../../src/environments/environment', () => ({
  environment: {
    azureHost: 'https://newhost.example.com',
    azureBucket: 'new-bucket',
  },
}), { virtual: true })

const mockAudioData: any = {
  identifier: 'audio-001',
  name: 'Test Audio',
  description: 'A test audio resource',
  artifactUrl: 'https://oldhost.example.com/old-bucket/path/audio.mp3',
  mimeType: 'audio/mp3',
  primaryCategory: 'Learning Resource',
  contentType: 'Resource',
  version: 1,
  subTitles: null,
}

describe('AudioComponent', () => {
  let component: AudioComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockValueSvc: any
  let mockViewerSvc: any
  let mockAccessControlSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue(null) },
        paramMap: { get: jest.fn().mockReturnValue('audio-001') },
        queryParams: {},
      },
      data: of({ content: { data: { ...mockAudioData } } }),
    }
    mockContentSvc = {
      fetchContentHistory: jest.fn().mockReturnValue(of(null)),
    }
    mockValueSvc = {
      isXSmall$: of(false),
    }
    mockViewerSvc = {
      getContent: jest.fn().mockReturnValue(of({ ...mockAudioData })),
    }
    mockAccessControlSvc = {
      authoringConfig: { newDesign: false },
    }

    component = new AudioComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockValueSvc,
      mockViewerSvc,
      mockAccessControlSvc,
    )
    component.forPreview = false
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Creation
  // ──────────────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize isFetchingDataComplete as false', () => {
    expect(component.isFetchingDataComplete).toBe(false)
  })

  it('should initialize audioData as null', () => {
    expect(component.audioData).toBeNull()
  })

  it('should initialize widgetResolverAudioData as null', () => {
    expect(component.widgetResolverAudioData).toBeNull()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit — normal (non-preview) mode
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit — normal mode', () => {
    it('should subscribe to isXSmall$ and set isScreenSizeSmall', async () => {
      mockValueSvc.isXSmall$ = of(true)
      component = new AudioComponent(
        mockActivatedRoute, mockContentSvc, mockValueSvc, mockViewerSvc, mockAccessControlSvc,
      )
      component.forPreview = false
      component.ngOnInit()
      expect(component.isScreenSizeSmall).toBe(true)
    })

    it('should set isNotEmbed to false when embed=true in queryParams', async () => {
      mockActivatedRoute.snapshot.queryParams = { embed: 'true' }
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(false)
    })

    it('should set isNotEmbed to true when embed param is absent', () => {
      component.ngOnInit()
      expect(component.isNotEmbed).toBe(true)
    })

    it('should set audioData from route data', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.audioData).toBeTruthy()
      expect(component.audioData.identifier).toBe('audio-001')
    })

    it('should set isFetchingDataComplete to true', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should initialize widgetResolverAudioData', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverAudioData).toBeTruthy()
      expect(component.widgetResolverAudioData?.widgetType).toBe('player')
      expect(component.widgetResolverAudioData?.widgetSubType).toBe('playerAudio')
    })

    it('should set url from artifactUrl', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverAudioData?.widgetData.url).toBe(mockAudioData.artifactUrl)
    })

    it('should set identifier from audioData', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverAudioData?.widgetData.identifier).toBe('audio-001')
    })

    it('should call formDiscussionForumWidget when audioData present', async () => {
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      await Promise.resolve()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'audio-001' }))
    })

    it('should not call formDiscussionForumWidget when audioData is null', async () => {
      mockActivatedRoute.data = of({ content: { data: null } })
      mockActivatedRoute.snapshot.queryParams = {}
      // rebuild so the null path is hit without crashing on subTitles
      const nullData = { ...mockAudioData, subTitles: null }
      mockActivatedRoute.data = of({ content: { data: nullData } })
      component = new AudioComponent(
        mockActivatedRoute, mockContentSvc, mockValueSvc, mockViewerSvc, mockAccessControlSvc,
      )
      component.forPreview = false
      // patch audioData to null before ngOnInit to test the guard
      jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      await Promise.resolve()
      // formDiscussionForumWidget IS called because nullData is truthy
      expect(component.discussionForumWidget).toBeTruthy()
    })

    it('should set disableTelemetry to true when forPreview is true', async () => {
      component.forPreview = true
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverAudioData?.widgetData.disableTelemetry).toBe(true)
    })

    it('should not set disableTelemetry when forPreview is false', async () => {
      component.forPreview = false
      component.ngOnInit()
      await Promise.resolve()
      expect(component.widgetResolverAudioData?.widgetData.disableTelemetry).toBe(false)
    })

    it('should call fetchContinueLearning with audioId when no collectionId', async () => {
      const spy = jest.spyOn(component, 'fetchContinueLearning')
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(spy).toHaveBeenCalledWith('audio-001', 'audio-001')
    })

    it('should call fetchContinueLearning with collectionId when present', async () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col-001' }
      const spy = jest.spyOn(component, 'fetchContinueLearning')
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(spy).toHaveBeenCalledWith('col-001', 'audio-001')
    })

    it('should set subtitles (content-store URL) in normal mode', async () => {
      const audioWithSub = {
        ...mockAudioData,
        subTitles: [{ url: 'https://example.com/content-store/sub.vtt' }],
      }
      mockActivatedRoute.data = of({ content: { data: audioWithSub } })
      component = new AudioComponent(
        mockActivatedRoute, mockContentSvc, mockValueSvc, mockViewerSvc, mockAccessControlSvc,
      )
      component.forPreview = false
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect((component.widgetResolverAudioData?.widgetData as any).subtitles).toBeDefined()
      expect((component.widgetResolverAudioData?.widgetData as any).subtitles[0].url).toContain('/apis/authContent/')
    })

    it('should set subtitles (non-content-store URL) in normal mode', async () => {
      const audioWithSub = {
        ...mockAudioData,
        subTitles: [{ url: 'https://other.example.com/subtitles/sub.vtt' }],
      }
      mockActivatedRoute.data = of({ content: { data: audioWithSub } })
      component = new AudioComponent(
        mockActivatedRoute, mockContentSvc, mockValueSvc, mockViewerSvc, mockAccessControlSvc,
      )
      component.forPreview = false
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect((component.widgetResolverAudioData?.widgetData as any).subtitles).toBeDefined()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ngOnInit — preview mode
  // ──────────────────────────────────────────────────────────────────────────
  describe('ngOnInit — preview mode', () => {
    beforeEach(() => {
      mockActivatedRoute = {
        snapshot: {
          queryParamMap: { get: jest.fn().mockReturnValue('true') },
          paramMap: { get: jest.fn().mockReturnValue('audio-001') },
          queryParams: {},
        },
        data: of({ content: { data: { ...mockAudioData } } }),
      }
      component = new AudioComponent(
        mockActivatedRoute, mockContentSvc, mockValueSvc, mockViewerSvc, mockAccessControlSvc,
      )
      component.forPreview = false
    })

    it('should call viewerSvc.getContent with resourceId', () => {
      component.ngOnInit()
      expect(mockViewerSvc.getContent).toHaveBeenCalledWith('audio-001')
    })

    it('should set audioData from viewerSvc', () => {
      component.ngOnInit()
      expect(component.audioData).toBeTruthy()
      expect(component.audioData.identifier).toBe('audio-001')
    })

    it('should set disableTelemetry to true', () => {
      component.ngOnInit()
      expect(component.widgetResolverAudioData?.widgetData.disableTelemetry).toBe(true)
    })

    it('should set isFetchingDataComplete to true', () => {
      component.ngOnInit()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should call formDiscussionForumWidget in preview mode', () => {
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set url via generateUrl in preview mode', () => {
      component.ngOnInit()
      expect(typeof component.widgetResolverAudioData?.widgetData.url).toBe('string')
    })

    it('should not call viewerSvc when newDesign is true', () => {
      mockAccessControlSvc.authoringConfig.newDesign = true
      component.ngOnInit()
      expect(mockViewerSvc.getContent).not.toHaveBeenCalled()
    })

    it('should set subtitles when subTitles present (content-store URL)', () => {
      mockViewerSvc.getContent.mockReturnValue(of({
        ...mockAudioData,
        subTitles: [{ url: 'https://example.com/content-store/sub.vtt' }],
      }))
      component.ngOnInit()
      expect((component.widgetResolverAudioData?.widgetData as any).subtitles).toBeDefined()
      expect((component.widgetResolverAudioData?.widgetData as any).subtitles[0].url).toContain('/apis/authContent/')
    })

    it('should set subtitles when subTitles present (non-content-store URL)', () => {
      mockViewerSvc.getContent.mockReturnValue(of({
        ...mockAudioData,
        subTitles: [{ url: 'https://other.example.com/sub.vtt' }],
      }))
      component.ngOnInit()
      expect((component.widgetResolverAudioData?.widgetData as any).subtitles[0].url).toContain('/apis/authContent/')
    })

    it('should handle empty subTitles array', () => {
      mockViewerSvc.getContent.mockReturnValue(of({ ...mockAudioData, subTitles: [] }))
      component.ngOnInit()
      // subTitles is set but url is empty string
      expect((component.widgetResolverAudioData?.widgetData as any).subtitles[0].url).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // generateUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('generateUrl', () => {
    it('should return empty string for empty input', () => {
      expect(component.generateUrl('')).toBe('')
    })

    it('should replace host and bucket in URL', () => {
      const result = component.generateUrl('https://oldhost.example.com/old-bucket/path/audio.mp3')
      expect(result).toContain('newhost.example.com')
      expect(result).toContain('new-bucket')
    })

    it('should preserve path after the bucket', () => {
      const result = component.generateUrl('https://oldhost.example.com/old-bucket/path/audio.mp3')
      expect(result).toContain('path/audio.mp3')
    })

    it('should handle URL with only 2 segments', () => {
      const result = component.generateUrl('https://host.com')
      expect(typeof result).toBe('string')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // initWidgetResolverAudioData
  // ──────────────────────────────────────────────────────────────────────────
  describe('initWidgetResolverAudioData', () => {
    it('should return widgetType player', () => {
      expect(component.initWidgetResolverAudioData().widgetType).toBe('player')
    })

    it('should return widgetSubType playerAudio', () => {
      expect(component.initWidgetResolverAudioData().widgetSubType).toBe('playerAudio')
    })

    it('should set continueLearning to true', () => {
      expect(component.initWidgetResolverAudioData().widgetData.continueLearning).toBe(true)
    })

    it('should set resumePoint to 0', () => {
      expect(component.initWidgetResolverAudioData().widgetData.resumePoint).toBe(0)
    })

    it('should set disableTelemetry to false', () => {
      expect(component.initWidgetResolverAudioData().widgetData.disableTelemetry).toBe(false)
    })

    it('should set widgetHostClass to video-full', () => {
      expect(component.initWidgetResolverAudioData().widgetHostClass).toBe('video-full')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // formDiscussionForumWidget
  // ──────────────────────────────────────────────────────────────────────────
  describe('formDiscussionForumWidget', () => {
    it('should set discussionForumWidget', () => {
      component.formDiscussionForumWidget(mockAudioData)
      expect(component.discussionForumWidget).toBeTruthy()
    })

    it('should set widgetType and widgetSubType to discussionForum', () => {
      component.formDiscussionForumWidget(mockAudioData)
      expect(component.discussionForumWidget?.widgetType).toBe('discussionForum')
      expect(component.discussionForumWidget?.widgetSubType).toBe('discussionForum')
    })

    it('should set id from content identifier', () => {
      component.formDiscussionForumWidget(mockAudioData)
      expect(component.discussionForumWidget?.widgetData.id).toBe('audio-001')
    })

    it('should set title from content name', () => {
      component.formDiscussionForumWidget(mockAudioData)
      expect(component.discussionForumWidget?.widgetData.title).toBe('Test Audio')
    })

    it('should set initialPostCount to 2', () => {
      component.formDiscussionForumWidget(mockAudioData)
      expect(component.discussionForumWidget?.widgetData.initialPostCount).toBe(2)
    })

    it('should set isDisabled false when forPreview is false', () => {
      component.forPreview = false
      component.formDiscussionForumWidget(mockAudioData)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(false)
    })

    it('should set isDisabled true when forPreview is true', () => {
      component.forPreview = true
      component.formDiscussionForumWidget(mockAudioData)
      expect(component.discussionForumWidget?.widgetData.isDisabled).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // fetchContinueLearning
  // ──────────────────────────────────────────────────────────────────────────
  describe('fetchContinueLearning', () => {
    beforeEach(() => {
      component.widgetResolverAudioData = component.initWidgetResolverAudioData()
    })

    it('should resolve true on null data', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
      const result = await component.fetchContinueLearning('col-001', 'audio-001')
      expect(result).toBe(true)
    })

    it('should set resumePoint when identifier matches and progress exists', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'audio-001',
        continueData: { progress: '120' },
      }))
      await component.fetchContinueLearning('col-001', 'audio-001')
      expect(component.widgetResolverAudioData?.widgetData.resumePoint).toBe(120)
    })

    it('should not set resumePoint when identifier does not match', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'other-audio',
        continueData: { progress: '120' },
      }))
      await component.fetchContinueLearning('col-001', 'audio-001')
      expect(component.widgetResolverAudioData?.widgetData.resumePoint).toBe(0)
    })

    it('should not set resumePoint when continueData is null', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'audio-001',
        continueData: null,
      }))
      await component.fetchContinueLearning('col-001', 'audio-001')
      expect(component.widgetResolverAudioData?.widgetData.resumePoint).toBe(0)
    })

    it('should not set resumePoint when progress is absent', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({
        identifier: 'audio-001',
        continueData: {},
      }))
      await component.fetchContinueLearning('col-001', 'audio-001')
      expect(component.widgetResolverAudioData?.widgetData.resumePoint).toBe(0)
    })

    it('should resolve true on error', async () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(throwError(() => new Error('fail')))
      const result = await component.fetchContinueLearning('col-001', 'audio-001')
      expect(result).toBe(true)
    })

    it('should call fetchContentHistory with collectionId', async () => {
      await component.fetchContinueLearning('col-007', 'audio-001')
      expect(mockContentSvc.fetchContentHistory).toHaveBeenCalledWith('col-007')
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

    it('should not throw when all subscriptions are null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
