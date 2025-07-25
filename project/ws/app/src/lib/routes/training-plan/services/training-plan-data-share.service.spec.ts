import { Subject } from 'rxjs'
import { TrainingPlanDataSharingService } from './training-plan-data-share.service'

describe('TrainingPlanDataSharingService', () => {
  let service: TrainingPlanDataSharingService

  beforeEach(() => {
    service = new TrainingPlanDataSharingService()
  })

  afterEach(() => {
    // Clean up subjects to prevent memory leaks
    service.clearFilter.complete()
    service.trainingPlanCategoryChangeEvent.complete()
    service.moderatedCourseSelectStatus.complete()
    service.handleContentPageChange.complete()
    service.filterToggle.complete()
    service.getFilterDataObject.complete()
  })

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize all Subject properties', () => {
      expect(service.clearFilter).toBeInstanceOf(Subject)
      expect(service.trainingPlanCategoryChangeEvent).toBeInstanceOf(Subject)
      expect(service.moderatedCourseSelectStatus).toBeInstanceOf(Subject)
      expect(service.handleContentPageChange).toBeInstanceOf(Subject)
      expect(service.filterToggle).toBeInstanceOf(Subject)
      expect(service.getFilterDataObject).toBeInstanceOf(Subject)
    })

    it('should initialize string properties with default values', () => {
      expect(service.trainingPlanTitle).toBe('')
      expect(service.selectedTabType).toBe('')
      expect(service.currentUserDepartment).toBe('')
    })

    it('should initialize object properties as undefined', () => {
      expect(service.trainingPlanContentData).toBeUndefined()
      expect(service.trainingPlanAssigneeData).toBeUndefined()
    })

    it('should initialize trainingPlanStepperData with default structure', () => {
      const expectedStepperData = {
        name: '',
        contentType: '',
        contentList: [],
        assignmentType: '',
        assignmentTypeInfo: [],
        endDate: '',
      }
      expect(service.trainingPlanStepperData).toEqual(expectedStepperData)
    })
  })

  describe('Subject Observables', () => {
    it('should emit values through clearFilter subject', (done) => {
      const testValue = 'clear-filter-test'

      service.clearFilter.subscribe((value) => {
        expect(value).toBe(testValue)
        done()
      })

      service.clearFilter.next(testValue)
    })

    it('should emit values through trainingPlanCategoryChangeEvent subject', (done) => {
      const testValue = { categoryId: 1, categoryName: 'Test Category' }

      service.trainingPlanCategoryChangeEvent.subscribe((value) => {
        expect(value).toEqual(testValue)
        done()
      })

      service.trainingPlanCategoryChangeEvent.next(testValue)
    })

    it('should emit values through moderatedCourseSelectStatus subject', (done) => {
      const testValue = { isSelected: true, courseId: 123 }

      service.moderatedCourseSelectStatus.subscribe((value) => {
        expect(value).toEqual(testValue)
        done()
      })

      service.moderatedCourseSelectStatus.next(testValue)
    })

    it('should emit values through handleContentPageChange subject', (done) => {
      const testValue = { page: 2, size: 10 }

      service.handleContentPageChange.subscribe((value) => {
        expect(value).toEqual(testValue)
        done()
      })

      service.handleContentPageChange.next(testValue)
    })

    it('should emit values through filterToggle subject', (done) => {
      const testValue = { isOpen: true }

      service.filterToggle.subscribe((value) => {
        expect(value).toEqual(testValue)
        done()
      })

      service.filterToggle.next(testValue)
    })

    it('should emit values through getFilterDataObject subject', (done) => {
      const testValue = { filters: { category: 'test', status: 'active' } }

      service.getFilterDataObject.subscribe((value) => {
        expect(value).toEqual(testValue)
        done()
      })

      service.getFilterDataObject.next(testValue)
    })
  })

  describe('Property Setters and Getters', () => {
    it('should set and get trainingPlanTitle', () => {
      const testTitle = 'Test Training Plan'
      service.trainingPlanTitle = testTitle
      expect(service.trainingPlanTitle).toBe(testTitle)
    })

    it('should set and get trainingPlanContentData', () => {
      const testData = {
        id: 1,
        title: 'Test Content',
        description: 'Test Description'
      }
      service.trainingPlanContentData = testData
      expect(service.trainingPlanContentData).toEqual(testData)
    })

    it('should set and get trainingPlanAssigneeData', () => {
      const testData = {
        userId: 1,
        userName: 'John Doe',
        department: 'IT'
      }
      service.trainingPlanAssigneeData = testData
      expect(service.trainingPlanAssigneeData).toEqual(testData)
    })

    it('should set and get selectedTabType', () => {
      const testTabType = 'content-tab'
      service.selectedTabType = testTabType
      expect(service.selectedTabType).toBe(testTabType)
    })

    it('should set and get currentUserDepartment', () => {
      const testDepartment = 'Human Resources'
      service.currentUserDepartment = testDepartment
      expect(service.currentUserDepartment).toBe(testDepartment)
    })

    it('should set and get trainingPlanStepperData', () => {
      const testStepperData = {
        name: 'Test Plan',
        contentType: 'video',
        contentList: [{ id: 1, title: 'Test Content' }],
        assignmentType: 'mandatory',
        assignmentTypeInfo: [{ id: 1, name: 'All Employees' }],
        endDate: '2024-12-31',
      }
      service.trainingPlanStepperData = testStepperData
      expect(service.trainingPlanStepperData).toEqual(testStepperData)
    })
  })

  describe('resetAllObjects method', () => {
    beforeEach(() => {
      // Set up some test data before reset
      service.trainingPlanTitle = 'Test Title'
      service.trainingPlanContentData = { id: 1, title: 'Test' }
      service.trainingPlanAssigneeData = { userId: 1, name: 'John' }
      service.selectedTabType = 'test-tab'
      service.trainingPlanStepperData = {
        name: 'Modified Plan',
        contentType: 'document',
        contentList: [{ id: 1 }],
        assignmentType: 'optional',
        assignmentTypeInfo: [{ id: 1 }],
        endDate: '2024-06-30',
      }
    })

    it('should reset trainingPlanTitle to empty string', () => {
      service.resetAllObjects()
      expect(service.trainingPlanTitle).toBe('')
    })

    it('should reset trainingPlanContentData to empty object', () => {
      service.resetAllObjects()
      expect(service.trainingPlanContentData).toEqual({})
    })

    it('should reset trainingPlanAssigneeData to empty object', () => {
      service.resetAllObjects()
      expect(service.trainingPlanAssigneeData).toEqual({})
    })

    it('should reset selectedTabType to empty string', () => {
      service.resetAllObjects()
      expect(service.selectedTabType).toBe('')
    })

    it('should reset trainingPlanStepperData to default structure', () => {
      service.resetAllObjects()
      const expectedStepperData = {
        name: '',
        contentType: '',
        contentList: [],
        assignmentType: '',
        assignmentTypeInfo: [],
        endDate: '',
      }
      expect(service.trainingPlanStepperData).toEqual(expectedStepperData)
    })

    it('should reset all properties in a single call', () => {
      service.resetAllObjects()

      expect(service.trainingPlanTitle).toBe('')
      expect(service.trainingPlanContentData).toEqual({})
      expect(service.trainingPlanAssigneeData).toEqual({})
      expect(service.selectedTabType).toBe('')
      expect(service.trainingPlanStepperData).toEqual({
        name: '',
        contentType: '',
        contentList: [],
        assignmentType: '',
        assignmentTypeInfo: [],
        endDate: '',
      })
    })

    it('should not affect Subject instances', () => {
      const originalClearFilter = service.clearFilter
      const originalCategoryChange = service.trainingPlanCategoryChangeEvent

      service.resetAllObjects()

      expect(service.clearFilter).toBe(originalClearFilter)
      expect(service.trainingPlanCategoryChangeEvent).toBe(originalCategoryChange)
    })

    it('should not affect currentUserDepartment', () => {
      service.currentUserDepartment = 'Test Department'
      service.resetAllObjects()
      expect(service.currentUserDepartment).toBe('Test Department')
    })
  })

  describe('Subject Error Handling', () => {
    it('should handle errors in clearFilter subject', () => {
      const errorSpy = jest.fn()

      service.clearFilter.subscribe({
        next: jest.fn(),
        error: errorSpy
      })

      const testError = new Error('Test error')
      service.clearFilter.error(testError)

      expect(errorSpy).toHaveBeenCalledWith(testError)
    })

    it('should complete subjects without errors', () => {
      const completeSpy = jest.fn()

      service.clearFilter.subscribe({
        next: jest.fn(),
        complete: completeSpy
      })

      service.clearFilter.complete()

      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('Multiple Subscribers', () => {
    it('should support multiple subscribers on the same subject', () => {
      const subscriber1 = jest.fn()
      const subscriber2 = jest.fn()
      const testValue = 'test-multi-subscriber'

      service.clearFilter.subscribe(subscriber1)
      service.clearFilter.subscribe(subscriber2)

      service.clearFilter.next(testValue)

      expect(subscriber1).toHaveBeenCalledWith(testValue)
      expect(subscriber2).toHaveBeenCalledWith(testValue)
    })

    it('should emit to all subscribers simultaneously', (done) => {
      let callCount = 0
      const testValue = { test: 'multi-emit' }

      const checkComplete = () => {
        callCount++
        if (callCount === 3) {
          done()
        }
      }

      service.trainingPlanCategoryChangeEvent.subscribe((value) => {
        expect(value).toEqual(testValue)
        checkComplete()
      })

      service.trainingPlanCategoryChangeEvent.subscribe((value) => {
        expect(value).toEqual(testValue)
        checkComplete()
      })

      service.trainingPlanCategoryChangeEvent.subscribe((value) => {
        expect(value).toEqual(testValue)
        checkComplete()
      })

      service.trainingPlanCategoryChangeEvent.next(testValue)
    })
  })
})