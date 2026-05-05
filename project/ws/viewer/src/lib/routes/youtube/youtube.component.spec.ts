// Mock ESM-problem packages
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {},
  IWidgetsPlayerMediaData: {},
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'Learning' },
  },
}))

import { Subject, of } from 'rxjs'
import { YoutubeComponent } from './youtube.component'

// ─── mocks ────────────────────────────────────────────────────────────────────

function buildYoutubeContent(overrides: any = {}): any {
  return {
    identifier: 'yt-001',
    name: 'Test YouTube Video',
    description: 'A youtube video',
    artifactUrl: 'https://www.youtube.com/watch?v=abc123',
    mimeType: 'application/vnd.ekstep.content-collection',
    ...overrides,
  }
}

const paramMapSubject = new Subject<any>()
const routeDataSubject = new Subject<any>()

let mockActivatedRoute: any
let mockValueSvc: any
let mockPlatform: any

function buildComponent() {
  return new YoutubeComponent(mockActivatedRoute, mockValueSvc, mockPlatform)
}

describe('YoutubeComponent', () => {
  let component: YoutubeComponent

  beforeEach(() => {
    jest.clearAllMocks()

    mockActivatedRoute = {
      paramMap: paramMapSubject.asObservable(),
      data: routeDataSubject.asObservable(),
    }

    mockValueSvc = {
      isXSmall$: of(false),
    }

    mockPlatform = {
      ANDROID: false,
    }

    component = buildComponent()
  })

  afterEach(() => {
    component.ngOnDestroy()
  })

  // ─── creation ─────────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set forPreview false by default', () => {
    expect(component.forPreview).toBe(false)
  })

  it('should set isFetchingDataComplete false by default', () => {
    expect(component.isFetchingDataComplete).toBe(false)
  })

  // ─── paramMap subscription (constructor) ──────────────────────────────────

  it('should set forPreview true when preview param is "true"', () => {
    paramMapSubject.next({ get: (k: string) => k === 'preview' ? 'true' : null })
    expect(component.forPreview).toBe(true)
  })

  it('should set forPreview false when preview param is not "true"', () => {
    paramMapSubject.next({ get: (_k: string) => null })
    expect(component.forPreview).toBe(false)
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should subscribe to isXSmall$ and set isScreenSizeSmall', () => {
      mockValueSvc.isXSmall$ = of(true)
      component = buildComponent()
      component.ngOnInit()
      expect(component.isScreenSizeSmall).toBe(true)
    })

    it('should set youtubeData from route data', () => {
      component.ngOnInit()
      const content = buildYoutubeContent()
      routeDataSubject.next({ content: { data: content } })
      expect(component.youtubeData).toBe(content)
    })

    it('should set isFetchingDataComplete to true after data arrives', () => {
      component.ngOnInit()
      routeDataSubject.next({ content: { data: buildYoutubeContent() } })
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should set widgetResolverYoutubeData with correct url', () => {
      component.ngOnInit()
      const content = buildYoutubeContent()
      routeDataSubject.next({ content: { data: content } })
      expect(component.widgetResolverYoutubeData!.widgetData.url).toBe(content.artifactUrl)
    })

    it('should set widgetResolverYoutubeData identifier', () => {
      component.ngOnInit()
      const content = buildYoutubeContent()
      routeDataSubject.next({ content: { data: content } })
      expect(component.widgetResolverYoutubeData!.widgetData.identifier).toBe('yt-001')
    })

    it('should set disableTelemetry true when forPreview', () => {
      component.forPreview = true
      component.ngOnInit()
      routeDataSubject.next({ content: { data: buildYoutubeContent() } })
      expect(component.widgetResolverYoutubeData!.widgetData.disableTelemetry).toBe(true)
    })

    it('should set isVideojs false on ANDROID', () => {
      mockPlatform.ANDROID = true
      component = buildComponent()
      component.ngOnInit()
      routeDataSubject.next({ content: { data: buildYoutubeContent() } })
      expect(component.widgetResolverYoutubeData!.widgetData.isVideojs).toBe(false)
    })

    it('should set isVideojs true on non-ANDROID', () => {
      mockPlatform.ANDROID = false
      component.ngOnInit()
      routeDataSubject.next({ content: { data: buildYoutubeContent() } })
      expect(component.widgetResolverYoutubeData!.widgetData.isVideojs).toBe(true)
    })

    it('should set url to empty string when youtubeData is null', () => {
      component.ngOnInit()
      routeDataSubject.next({ content: { data: null } })
      expect(component.widgetResolverYoutubeData!.widgetData.url).toBe('')
    })

    it('should call formDiscussionForumWidget when youtubeData exists', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      const content = buildYoutubeContent()
      routeDataSubject.next({ content: { data: content } })
      expect(spy).toHaveBeenCalledWith(content)
    })

    it('should not call formDiscussionForumWidget when youtubeData is null', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      routeDataSubject.next({ content: { data: null } })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── initWidgetResolverYoutubeData ────────────────────────────────────────

  describe('initWidgetResolverYoutubeData', () => {
    it('should return correct widget resolver structure', () => {
      const result = component.initWidgetResolverYoutubeData()
      expect(result.widgetType).toBe('player')
      expect(result.widgetSubType).toBe('playerYoutube')
      expect(result.widgetData.disableTelemetry).toBe(false)
      expect(result.widgetData.url).toBe('')
      expect(result.widgetData.identifier).toBe('')
      expect(result.widgetHostClass).toBe('video-full')
    })
  })

  // ─── formDiscussionForumWidget ────────────────────────────────────────────

  describe('formDiscussionForumWidget', () => {
    it('should set discussionForumWidget with correct widgetData', () => {
      const content = buildYoutubeContent()
      component.formDiscussionForumWidget(content)
      expect(component.discussionForumWidget).not.toBeNull()
      expect(component.discussionForumWidget!.widgetData.id).toBe('yt-001')
      expect(component.discussionForumWidget!.widgetData.title).toBe('Test YouTube Video')
      expect(component.discussionForumWidget!.widgetData.description).toBe('A youtube video')
      expect(component.discussionForumWidget!.widgetData.initialPostCount).toBe(2)
    })

    it('should set isDisabled based on forPreview', () => {
      component.forPreview = true
      component.formDiscussionForumWidget(buildYoutubeContent())
      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(true)
    })

    it('should set widget types correctly', () => {
      component.formDiscussionForumWidget(buildYoutubeContent())
      expect(component.discussionForumWidget!.widgetSubType).toBe('discussionForum')
      expect(component.discussionForumWidget!.widgetType).toBe('discussionForum')
    })
  })

  // ─── ngOnDestroy ─────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      component.ngOnInit()
      routeDataSubject.next({ content: { data: buildYoutubeContent() } })
      // no error should be thrown
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
