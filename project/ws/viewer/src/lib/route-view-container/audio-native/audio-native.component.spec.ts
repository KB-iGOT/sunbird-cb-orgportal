import { AudioNativeComponent } from './audio-native.component'

describe('AudioNativeComponent', () => {
  let component: AudioNativeComponent
  let mockActivatedRoute: any
  let mockConfigService: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
      },
    }
    mockConfigService = {
      restrictedFeatures: null,
    }
    component = new AudioNativeComponent(mockActivatedRoute, mockConfigService)
  })

  describe('initialization', () => {
    it('should create component with default values', () => {
      expect(component).toBeTruthy()
      expect(component.isScreenSizeSmall).toBeFalsy()
      expect(component.forPreview).toBeFalsy()
      expect(component.isFetchingDataComplete).toBeFalsy()
      expect(component.audioData).toBeNull()
      expect(component.discussionForumWidget).toBeNull()
      expect(component.defaultThumbnail).toBe('')
      expect(component.isPreviewMode).toBeFalsy()
      expect(component.isTypeOfCollection).toBeFalsy()
      expect(component.isRestricted).toBeFalsy()
    })

    it('should set isTypeOfCollection to false when collectionType param is absent', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBeFalsy()
    })

    it('should set isTypeOfCollection to true when collectionType param is present', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'course' }
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBeTruthy()
    })
  })

  describe('restrictedFeatures handling', () => {
    it('should set isRestricted to true when disscussionForum is not in restrictedFeatures', () => {
      mockConfigService.restrictedFeatures = new Set(['otherFeature'])
      component.ngOnInit()
      expect(component.isRestricted).toBeTruthy()
    })

    it('should set isRestricted to false when disscussionForum is in restrictedFeatures', () => {
      mockConfigService.restrictedFeatures = new Set(['disscussionForum'])
      component.ngOnInit()
      expect(component.isRestricted).toBeFalsy()
    })

    it('should handle null restrictedFeatures', () => {
      mockConfigService.restrictedFeatures = null
      component.ngOnInit()
      expect(component.isRestricted).toBeFalsy()
    })
  })

  describe('input properties', () => {
    it('should set isScreenSizeSmall', () => {
      component.isScreenSizeSmall = true
      expect(component.isScreenSizeSmall).toBeTruthy()
    })

    it('should set forPreview', () => {
      component.forPreview = true
      expect(component.forPreview).toBeTruthy()
    })

    it('should set isFetchingDataComplete', () => {
      component.isFetchingDataComplete = true
      expect(component.isFetchingDataComplete).toBeTruthy()
    })

    it('should set audioData', () => {
      const mockAudioData = { identifier: 'audio123', name: 'Test Audio', mediaType: 'audio' } as any
      component.audioData = mockAudioData
      expect(component.audioData).toEqual(mockAudioData)
      expect(component.audioData?.mediaType).toBe('audio')
    })

    it('should set defaultThumbnail', () => {
      const thumbnail = 'test-thumbnail.jpg'
      component.defaultThumbnail = thumbnail
      expect(component.defaultThumbnail).toBe(thumbnail)
    })

    it('should set isPreviewMode', () => {
      component.isPreviewMode = true
      expect(component.isPreviewMode).toBeTruthy()
    })

    it('should set discussionForumWidget', () => {
      const mockForum = { widgetType: 'discussion', widgetSubType: 'forum', widgetData: {} } as any
      component.discussionForumWidget = mockForum
      expect(component.discussionForumWidget).toEqual(mockForum)
    })
  })
})
