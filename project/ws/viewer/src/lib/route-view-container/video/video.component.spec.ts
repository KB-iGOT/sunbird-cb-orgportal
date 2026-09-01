import { VideoComponent } from './video.component'

describe('VideoComponent', () => {
  let component: VideoComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
      },
    }
    mockConfigSvc = {
      restrictedFeatures: null,
    }
    component = new VideoComponent(mockActivatedRoute, mockConfigSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default input values', () => {
    expect(component.isScreenSizeSmall).toBe(false)
    expect(component.isNotEmbed).toBe(true)
    expect(component.isFetchingDataComplete).toBe(false)
    expect(component.forPreview).toBe(false)
    expect(component.videoData).toBeNull()
    expect(component.widgetResolverVideoData).toBeNull()
    expect(component.discussionForumWidget).toBeNull()
    expect(component.isPreviewMode).toBe(false)
  })

  it('should set isTypeOfCollection to false when collectionType query param is absent', () => {
    mockActivatedRoute.snapshot.queryParams = {}
    component.ngOnInit()
    expect(component.isTypeOfCollection).toBe(false)
  })

  it('should set isTypeOfCollection to true when collectionType query param is present', () => {
    mockActivatedRoute.snapshot.queryParams = { collectionType: 'course' }
    component.ngOnInit()
    expect(component.isTypeOfCollection).toBe(true)
  })

  it('should set isRestricted to false when restrictedFeatures has disscussionForum', () => {
    mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
    component.ngOnInit()
    expect(component.isRestricted).toBe(false)
  })

  it('should set isRestricted to true when restrictedFeatures does not have disscussionForum', () => {
    mockConfigSvc.restrictedFeatures = new Set(['someOtherFeature'])
    component.ngOnInit()
    expect(component.isRestricted).toBe(true)
  })

  it('should not set isRestricted when restrictedFeatures is null', () => {
    mockConfigSvc.restrictedFeatures = null
    component.ngOnInit()
    expect(component.isRestricted).toBe(false)
  })

  it('should accept videoData input', () => {
    const mockContent = { identifier: 'content123', name: 'Test Video' } as any
    component.videoData = mockContent
    expect(component.videoData).toEqual(mockContent)
  })

  it('should accept widgetResolverVideoData input', () => {
    const mockWidgetData = { widgetType: 'player', widgetSubType: 'video', widgetData: {} } as any
    component.widgetResolverVideoData = mockWidgetData
    expect(component.widgetResolverVideoData).toEqual(mockWidgetData)
  })

  it('should accept discussionForumWidget input', () => {
    const mockForum = { widgetType: 'discussion', widgetSubType: 'forum', widgetData: {} } as any
    component.discussionForumWidget = mockForum
    expect(component.discussionForumWidget).toEqual(mockForum)
  })

  it('should set isScreenSizeSmall input', () => {
    component.isScreenSizeSmall = true
    expect(component.isScreenSizeSmall).toBe(true)
  })

  it('should set forPreview input', () => {
    component.forPreview = true
    expect(component.forPreview).toBe(true)
  })

  it('should set isPreviewMode input', () => {
    component.isPreviewMode = true
    expect(component.isPreviewMode).toBe(true)
  })

  it('should initialize isTypeOfCollection as false', () => {
    expect(component.isTypeOfCollection).toBe(false)
  })

  it('should initialize isRestricted as false', () => {
    expect(component.isRestricted).toBe(false)
  })

  it('should initialize isMobile as false', () => {
    expect(component.isMobile).toBe(false)
  })
})
