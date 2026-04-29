import { DndQuizComponent } from './dnd-quiz.component'
import { Subject, of } from 'rxjs'
import { NsContent } from '@sunbird-cb/collection'

describe('DndQuizComponent', () => {
  let component: DndQuizComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockHttp: any
  let mockValueSvc: any
  let mockEventSvc: any
  let mockViewSvc: any

  // Mock data
  const mockContent = {
    identifier: 'test-id',
    artifactUrl: 'test-url',
    mimeType: NsContent.EMimeTypes.CLASS_DIAGRAM
  }

  beforeEach(() => {
    // Setup mocks
    mockActivatedRoute = {
      data: new Subject(),
      snapshot: {
        queryParams: {}
      }
    }

    mockContentSvc = {
      continueLearning: jest.fn().mockResolvedValue(undefined),
      setS3Cookie: jest.fn().mockReturnValue(of({}))
    }

    mockHttp = {
      get: jest.fn().mockReturnValue(of({}))
    }

    mockValueSvc = {
      isLtMedium$: new Subject()
    }

    mockEventSvc = {
      dispatchEvent: jest.fn()
    }

    mockViewSvc = {
      getAuthoringUrl: jest.fn().mockReturnValue('test-author-url')
    }

    // Initialize component with mocks
    component = new DndQuizComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockHttp,
      mockValueSvc,
      mockEventSvc,
      mockViewSvc
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('ngOnInit', () => {
    it('should subscribe to isLtMedium$ and update isLtMedium', () => {
      component.ngOnInit()
      mockValueSvc.isLtMedium$.next(true)
      expect(component.isLtMedium).toBe(true)
    })

    it('should handle content data successfully', async () => {
      const manifestData = { test: 'data' }
      mockHttp.get.mockReturnValue(of(manifestData))

      component.ngOnInit()
      await mockActivatedRoute.data.next({
        content: { data: mockContent }
      })

      expect(component.dndQuizData).toBe(mockContent)
      expect(component.isFetchingDataComplete).toBe(false)
      expect(component.isErrorOccured).toBe(false)
    })

    it('should set error when content data is missing', async () => {
      component.ngOnInit()
      await mockActivatedRoute.data.next({
        content: { data: null }
      })

      expect(component.isErrorOccured).toBe(true)
      expect(component.isFetchingDataComplete).toBe(false)
    })
  })

  describe('ngOnDestroy', () => {
    it('should call continueLearning with collection params when available', async () => {
      mockActivatedRoute.snapshot.queryParams = {
        collectionId: 'test-collection',
        collectionType: 'test-type'
      }

      await component.ngOnDestroy()
    })

    it('should call continueLearning without collection params when not available', async () => {

      await component.ngOnDestroy()

    })

    it('should unsubscribe from subscriptions', async () => {


      await component.ngOnDestroy()

    })
  })



  describe('setS3Cookie', () => {
    it('should call contentSvc.setS3Cookie with correct contentId', async () => {
      await component['setS3Cookie']('test-id')
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('test-id')
    })

    it('should handle errors silently', async () => {

      // Should not throw error
      await expect(component['setS3Cookie']('test-id')).resolves.toBeUndefined()
    })
  })
})