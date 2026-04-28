import { AudioComponent } from './audio.component'

describe('AudioComponent', () => {
  let component: AudioComponent
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
    component = new AudioComponent(mockActivatedRoute, mockConfigSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default input values', () => {
    expect(component.isScreenSizeSmall).toBe(false)
    expect(component.isFetchingDataComplete).toBe(false)
    expect(component.isNotEmbed).toBe(true)
    expect(component.audioData).toBeNull()
    expect(component.widgetResolverAudioData).toBeNull()
    expect(component.discussionForumWidget).toBeNull()
    expect(component.isPreviewMode).toBe(false)
    expect(component.forPreview).toBe(false)
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

  it('should accept audioData input', () => {
    const mockContent = { identifier: 'audio123', name: 'Test Audio' } as any
    component.audioData = mockContent
    expect(component.audioData).toEqual(mockContent)
  })

  it('should accept widgetResolverAudioData input', () => {
    const mockWidgetData = { widgetType: 'player', widgetSubType: 'audio', widgetData: {} } as any
    component.widgetResolverAudioData = mockWidgetData
    expect(component.widgetResolverAudioData).toEqual(mockWidgetData)
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

  it('should set isNotEmbed input', () => {
    component.isNotEmbed = false
    expect(component.isNotEmbed).toBe(false)
  })
})
