import { YoutubeComponent } from './youtube.component'

describe('YoutubeComponent', () => {
  let component: YoutubeComponent
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
    component = new YoutubeComponent(mockActivatedRoute, mockConfigSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default input values', () => {
    expect(component.isScreenSizeSmall).toBe(false)
    expect(component.isFetchingDataComplete).toBe(false)
    expect(component.forPreview).toBe(false)
    expect(component.youtubeData).toBeNull()
    expect(component.widgetResolverYoutubeData).toBeNull()
    expect(component.discussionForumWidget).toBeNull()
    expect(component.isScreenSizeLtMedium).toBe(false)
    expect(component.isPreviewMode).toBe(false)
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

  it('should set isRestricted to true when restrictedFeatures does not have disscussionForum', () => {
    mockConfigSvc.restrictedFeatures = new Set(['someOtherFeature'])
    component.ngOnInit()
    expect(component.isRestricted).toBe(true)
  })

  it('should set isRestricted to false when restrictedFeatures has disscussionForum', () => {
    mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
    component.ngOnInit()
    expect(component.isRestricted).toBe(false)
  })

  it('should not modify isRestricted when restrictedFeatures is null', () => {
    mockConfigSvc.restrictedFeatures = null
    component.ngOnInit()
    expect(component.isRestricted).toBe(false)
  })

  it('getData should return undefined when widgetResolverYoutubeData is null', () => {
    component.widgetResolverYoutubeData = null
    expect(component.getData).toBeUndefined()
  })

  it('getData should return widgetData when widgetResolverYoutubeData is set', () => {
    const mockWidgetData = { contentId: 'youtube123', url: 'https://youtube.com/watch?v=abc' }
    component.widgetResolverYoutubeData = {
      widgetType: 'player',
      widgetSubType: 'youtube',
      widgetData: mockWidgetData as any,
    }
    expect(component.getData).toEqual(mockWidgetData)
  })

  it('should accept youtubeData input', () => {
    const mockContent = { identifier: 'content123', name: 'Test Youtube' } as any
    component.youtubeData = mockContent
    expect(component.youtubeData).toEqual(mockContent)
  })

  it('should accept discussionForumWidget input', () => {
    const mockForum = { widgetType: 'discussion', widgetSubType: 'forum', widgetData: {} } as any
    component.discussionForumWidget = mockForum
    expect(component.discussionForumWidget).toEqual(mockForum)
  })

  it('should set forPreview input', () => {
    component.forPreview = true
    expect(component.forPreview).toBe(true)
  })

  it('should set isPreviewMode input', () => {
    component.isPreviewMode = true
    expect(component.isPreviewMode).toBe(true)
  })

  it('should set isScreenSizeLtMedium input', () => {
    component.isScreenSizeLtMedium = true
    expect(component.isScreenSizeLtMedium).toBe(true)
  })
})
