import { QuizComponent } from './quiz.component'

describe('QuizComponent', () => {
  let component: QuizComponent
  let mockActivatedRoute: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: {}
      }
    }
    component = new QuizComponent(mockActivatedRoute)
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
      expect(component.quizData).toBeNull()
      expect(component.forPreview).toBe(false)
      expect(component.isPreviewMode).toBe(false)
    })

    it('should have default quizJson with correct structure', () => {
      expect(component.quizJson).toEqual({
        timeLimit: 0,
        questions: [],
        isAssessment: false,
      })
    })

    it('should initialize isTypeOfCollection to false', () => {
      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should initialize collectionId to null', () => {
      expect(component.collectionId).toBeNull()
    })
  })

  describe('ngOnInit', () => {
    it('should set isTypeOfCollection to false when collectionType queryParam is absent', () => {
      mockActivatedRoute.snapshot.queryParams = {}

      component.ngOnInit()

      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should set isTypeOfCollection to true when collectionType queryParam exists', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course', collectionId: 'quiz123' }

      component.ngOnInit()

      expect(component.isTypeOfCollection).toBe(true)
    })

    it('should set collectionId when collectionType queryParam exists', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course', collectionId: 'quiz123' }

      component.ngOnInit()

      expect(component.collectionId).toBe('quiz123')
    })

    it('should not set collectionId when collectionType is absent', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'quiz123' }

      component.ngOnInit()

      expect(component.collectionId).toBeNull()
    })

    it('should handle empty queryParams', () => {
      mockActivatedRoute.snapshot.queryParams = {}

      component.ngOnInit()

      expect(component.isTypeOfCollection).toBe(false)
      expect(component.collectionId).toBeNull()
    })
  })

  describe('ngOnDestroy', () => {
    it('should set isFetchingDataComplete to false on destroy', () => {
      component.isFetchingDataComplete = true

      component.ngOnDestroy()

      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('should reset isFetchingDataComplete even if it was already false', () => {
      component.isFetchingDataComplete = false

      component.ngOnDestroy()

      expect(component.isFetchingDataComplete).toBe(false)
    })
  })

  describe('Input property assignments', () => {
    it('should accept quizData input', () => {
      const mockContent = { identifier: 'quiz123', name: 'Test Quiz' } as any
      component.quizData = mockContent

      expect(component.quizData).toBe(mockContent)
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

    it('should accept isPreviewMode input', () => {
      component.isPreviewMode = true

      expect(component.isPreviewMode).toBe(true)
    })

    it('should accept quizJson input with custom values', () => {
      const customQuizJson = { timeLimit: 30, questions: [{ id: 'q1' } as any], isAssessment: true }
      component.quizJson = customQuizJson

      expect(component.quizJson).toEqual(customQuizJson)
    })
  })
})

