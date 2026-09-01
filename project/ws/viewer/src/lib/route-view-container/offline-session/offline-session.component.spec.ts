import { OfflineSessionComponent } from './offline-session.component'

describe('OfflineSessionComponent', () => {
  let component: OfflineSessionComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: {}
      }
    }
    mockConfigSvc = {
      restrictedFeatures: null
    }
    component = new OfflineSessionComponent(mockActivatedRoute, mockConfigSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should have default input values', () => {
      expect(component.isFetchingDataComplete).toBe(false)
      expect(component.offlineSessionData).toBeNull()
      expect(component.forPreview).toBe(false)
      expect(component.isPreviewMode).toBe(false)
      expect(component.discussionForumWidget).toBeNull()
    })

    it('should have default widgetResolverOfflineSessionData', () => {
      expect(component.widgetResolverOfflineSessionData).toEqual({
        widgetType: 'player',
        widgetSubType: 'playerOfflineSession',
        widgetData: {
          content: '',
          identifier: '',
          disableTelemetry: false,
          hideControls: true,
        },
      })
    })

    it('should initialize isTypeOfCollection to false', () => {
      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should initialize isRestricted to false', () => {
      expect(component.isRestricted).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should not set isRestricted when restrictedFeatures is null', () => {
      mockConfigSvc.restrictedFeatures = null

      component.ngOnInit()

      expect(component.isRestricted).toBe(false)
    })

    it('should set isRestricted to true when disscussionForum is not in restrictedFeatures', () => {
      mockConfigSvc.restrictedFeatures = new Set<string>(['anotherFeature'])

      component.ngOnInit()

      expect(component.isRestricted).toBe(true)
    })

    it('should set isRestricted to false when disscussionForum is in restrictedFeatures', () => {
      mockConfigSvc.restrictedFeatures = new Set<string>(['disscussionForum'])

      component.ngOnInit()

      expect(component.isRestricted).toBe(false)
    })

    it('should set isTypeOfCollection to false when collectionType queryParam is absent', () => {
      mockActivatedRoute.snapshot.queryParams = {}

      component.ngOnInit()

      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should set isTypeOfCollection to true when collectionType queryParam exists', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course' }

      component.ngOnInit()

      expect(component.isTypeOfCollection).toBe(true)
    })

    it('should handle empty restrictedFeatures set', () => {
      mockConfigSvc.restrictedFeatures = new Set<string>()

      component.ngOnInit()

      expect(component.isRestricted).toBe(true)
    })
  })

  describe('Input property assignments', () => {
    it('should accept offlineSessionData input', () => {
      const mockContent = { identifier: 'offline123', name: 'Test Offline Session' } as any
      component.offlineSessionData = mockContent

      expect(component.offlineSessionData).toBe(mockContent)
    })

    it('should accept isFetchingDataComplete input', () => {
      component.isFetchingDataComplete = true

      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should accept forPreview input', () => {
      component.forPreview = true

      expect(component.forPreview).toBe(true)
    })

    it('should accept isPreviewMode input', () => {
      component.isPreviewMode = true

      expect(component.isPreviewMode).toBe(true)
    })

    it('should accept custom widgetResolverOfflineSessionData', () => {
      const customWidget = {
        widgetType: 'player',
        widgetSubType: 'playerOfflineSession',
        widgetData: {
          content: 'test',
          identifier: 'test123',
          disableTelemetry: true,
          hideControls: false,
        }
      }
      component.widgetResolverOfflineSessionData = customWidget

      expect(component.widgetResolverOfflineSessionData).toEqual(customWidget)
    })

    it('should accept discussionForumWidget input', () => {
      const mockWidget = { widgetType: 'discussionForum' } as any
      component.discussionForumWidget = mockWidget

      expect(component.discussionForumWidget).toBe(mockWidget)
    })
  })
})

