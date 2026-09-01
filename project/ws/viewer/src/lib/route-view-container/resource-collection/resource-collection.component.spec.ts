import { ResourceCollectionComponent } from './resource-collection.component'

describe('ResourceCollectionComponent', () => {
  let component: ResourceCollectionComponent
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
    component = new ResourceCollectionComponent(mockActivatedRoute, mockConfigSvc)
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
      expect(component.isErrorOccured).toBe(false)
      expect(component.forPreview).toBe(false)
      expect(component.resourceCollectionData).toBeNull()
      expect(component.discussionForumWidget).toBeNull()
      expect(component.isPreviewMode).toBe(false)
    })

    it('should initialize isTypeOfCollection to false', () => {
      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should initialize collectionId to null', () => {
      expect(component.collectionId).toBeNull()
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
      mockConfigSvc.restrictedFeatures = new Set<string>(['someOtherFeature'])

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
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course', collectionId: 'col123' }

      component.ngOnInit()

      expect(component.isTypeOfCollection).toBe(true)
    })

    it('should set collectionId when collectionType queryParam exists', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course', collectionId: 'col123' }

      component.ngOnInit()

      expect(component.collectionId).toBe('col123')
    })

    it('should not set collectionId when collectionType is absent', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'col123' }

      component.ngOnInit()

      expect(component.collectionId).toBeNull()
    })

    it('should handle empty queryParams object', () => {
      mockActivatedRoute.snapshot.queryParams = {}

      component.ngOnInit()

      expect(component.isTypeOfCollection).toBe(false)
      expect(component.collectionId).toBeNull()
    })
  })

  describe('Input property assignments', () => {
    it('should accept resourceCollectionData input', () => {
      const mockContent = { identifier: 'content123', name: 'Test Content' } as any
      component.resourceCollectionData = mockContent

      expect(component.resourceCollectionData).toBe(mockContent)
    })

    it('should accept isFetchingDataComplete input', () => {
      component.isFetchingDataComplete = true

      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should accept isErrorOccured input', () => {
      component.isErrorOccured = true

      expect(component.isErrorOccured).toBe(true)
    })

    it('should accept forPreview input', () => {
      component.forPreview = true

      expect(component.forPreview).toBe(true)
    })

    it('should accept discussionForumWidget input', () => {
      const mockWidget = { widgetType: 'discussionForum' } as any
      component.discussionForumWidget = mockWidget

      expect(component.discussionForumWidget).toBe(mockWidget)
    })
  })
})

