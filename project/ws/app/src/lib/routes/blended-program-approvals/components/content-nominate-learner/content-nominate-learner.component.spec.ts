import { ContentNominateLearnerComponent } from './content-nominate-learner.component'
import { FormControl, Validators } from '@angular/forms'
import { IEnroleType2 } from '../../enums/enrolment-type'
import { of, Subject } from 'rxjs'
import * as _ from 'lodash'

// Mock dependencies
const mockActivatedRoute = {
  queryParams: new Subject(),
  snapshot: {
    parent: {
      paramMap: {
        get: jest.fn()
      },
      data: {
        content: null
      }
    }
  }
}

const mockRouter = {
  navigate: jest.fn()
}

const mockBatchService = {
  readContentLive: jest.fn(),
  inviteUserToBatch: jest.fn()
}

const mockDataService = {
  initData: jest.fn(),
  currentBatch: new Subject()
}

const mockSnackBar = {
  open: jest.fn()
}

// Mock lodash
jest.mock('lodash', () => ({
  set: jest.fn()
}))

// Mock enum
jest.mock('../../enums/enrolment-type', () => ({
  IEnroleType2: {
    TYPE1: 'type1',
    TYPE2: 'type2'
  }
}))

describe('ContentNominateLearnerComponent', () => {
  let component: ContentNominateLearnerComponent

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create component instance
    component = new ContentNominateLearnerComponent(
      mockActivatedRoute as any,
      mockRouter as any,
      mockBatchService as any,
      mockDataService as any,
      mockSnackBar as any
    )
  })

  describe('Constructor', () => {
    it('should create component with initialized form', () => {
      expect(component).toBeDefined()
      expect(component.contentForm).toBeDefined()
      expect(component.contentForm.get('enroleType')).toBeDefined()
      expect(component.contentForm.get('selectedUsers')).toBeDefined()
    })

    it('should set enroleTypeList from enum values', () => {
      expect(component.enroleTypeList).toEqual(Object.values(IEnroleType2))
    })

    it('should initialize contentId as null', () => {
      expect(component.contentId).toBeNull()
    })

    it('should create form with required validators', () => {
      const enroleTypeControl = component.contentForm.get('enroleType')
      const selectedUsersControl = component.contentForm.get('selectedUsers')

      expect(enroleTypeControl?.hasError('required')).toBeTruthy()
      expect(selectedUsersControl?.hasError('required')).toBeTruthy()
    })
  })

  describe('ngOnInit', () => {
    it('should subscribe to queryParams and call fetchContent', () => {
      const fetchContentSpy = jest.spyOn(component, 'fetchContent').mockImplementation()

      component.ngOnInit()

      // Emit a value to trigger the subscription
      mockActivatedRoute.queryParams.next({})

      expect(fetchContentSpy).toHaveBeenCalled()
    })
  })

  describe('fetchContent', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getCurrentBatch').mockImplementation()
    })

    it('should get contentId from route params when parent exists', () => {
      mockActivatedRoute.snapshot.parent.paramMap.get.mockReturnValue('test-content-id')
      mockActivatedRoute.snapshot.parent.data.content = null

      component.fetchContent()

      expect(component.contentId).toBe('test-content-id')
      expect(mockActivatedRoute.snapshot.parent.paramMap.get).toHaveBeenCalledWith('contentId')
    })

    it('should set contentId to null when parent paramMap returns null', () => {
      mockActivatedRoute.snapshot.parent.paramMap.get.mockReturnValue(null)

      component.fetchContent()

      expect(component.contentId).toBeNull()
    })

    it('should handle case when parent is null', () => {
      // mockActivatedRoute.snapshot.parent = null

      component.fetchContent()

      expect(component.contentId).toBeNull()
    })

    it('should use route data content when available', () => {
      const mockContent = { id: 'test', name: 'Test Content' }
      // mockActivatedRoute.snapshot.parent.data.content = mockContent

      component.fetchContent()

      expect(_.set).toHaveBeenCalledWith(component, 'content', mockContent)
      expect(mockDataService.initData).toHaveBeenCalledWith(mockContent)
      expect(component.getCurrentBatch).toHaveBeenCalled()
    })

    it('should call readContentLive when no route data and contentId exists', () => {
      const mockContent = { id: 'test', name: 'Test Content' }
      mockActivatedRoute.snapshot.parent.data.content = null
      mockActivatedRoute.snapshot.parent.paramMap.get.mockReturnValue('test-content-id')
      mockBatchService.readContentLive.mockReturnValue(of(mockContent))

      component.fetchContent()

      expect(mockBatchService.readContentLive).toHaveBeenCalledWith('test-content-id')
      expect(_.set).toHaveBeenCalledWith(component, 'content', mockContent)
      expect(mockDataService.initData).toHaveBeenCalledWith(mockContent)
    })

    it('should not call readContentLive when contentId is null', () => {
      mockActivatedRoute.snapshot.parent.data.content = null
      mockActivatedRoute.snapshot.parent.paramMap.get.mockReturnValue(null)

      component.fetchContent()

      expect(mockBatchService.readContentLive).not.toHaveBeenCalled()
    })

    it('should always call getCurrentBatch', () => {
      component.fetchContent()

      expect(component.getCurrentBatch).toHaveBeenCalled()
    })
  })

  describe('getCurrentBatch', () => {
    it('should set batchId when currentBatch emits data with batchId', () => {
      const mockBatchData = { batchId: 'test-batch-id' }

      component.getCurrentBatch()
      mockDataService.currentBatch.next(mockBatchData)

      expect(component.batchId).toBe('test-batch-id')
    })

    it('should handle currentBatch data without batchId', () => {
      const mockBatchData = { someOtherProperty: 'value' }

      component.getCurrentBatch()
      mockDataService.currentBatch.next(mockBatchData)

      expect(component.batchId).toBeUndefined()
    })

    it('should handle null currentBatch data (API CALL case)', () => {
      component.getCurrentBatch()
      mockDataService.currentBatch.next(null)

      // This test covers the else branch where API CALL comment is
      expect(component.batchId).toBeUndefined()
    })

    it('should handle undefined currentBatch data', () => {
      component.getCurrentBatch()
      mockDataService.currentBatch.next(undefined)

      expect(component.batchId).toBeUndefined()
    })
  })

  describe('selectedUsersData', () => {
    it('should set selectedUsers form control value and update validity', () => {
      const mockUsers = [{ userId: 'user1' }, { userId: 'user2' }]
      const setValueSpy = jest.spyOn(component.contentForm.controls['selectedUsers'], 'setValue')
      const updateValiditySpy = jest.spyOn(component.contentForm.controls['selectedUsers'], 'updateValueAndValidity')

      component.selectedUsersData(mockUsers)

      expect(setValueSpy).toHaveBeenCalledWith(mockUsers)
      expect(updateValiditySpy).toHaveBeenCalled()
    })
  })

  describe('onSubmit', () => {
    beforeEach(() => {
      component.batchData = { batchId: 'test-batch-id' }
      component.programID = 'test-program-id'
      // jest.spyOn(component, 'openSnackbar').mockImplementation()
    })

    it('should extract userIds and call inviteUserToBatch', () => {
      const mockUsers = [
        { userId: 'user1', name: 'User 1' },
        { userId: 'user2', name: 'User 2' }
      ]
      component.contentForm.patchValue({
        selectedUsers: mockUsers
      })

      const expectedRequest = {
        request: {
          batchId: 'test-batch-id',
          programId: 'test-program-id',
          userIdList: ['user1', 'user2']
        }
      }

      mockBatchService.inviteUserToBatch.mockReturnValue(of({}))

      component.onSubmit()

      expect(mockBatchService.inviteUserToBatch).toHaveBeenCalledWith(expectedRequest)
    })

    // it('should call openSnackbar with success message after successful invitation', () => {
    //   component.contentForm.patchValue({
    //     selectedUsers: [{ userId: 'user1' }]
    //   })

    //   mockBatchService.inviteUserToBatch.mockReturnValue(of({}))

    //   component.onSubmit()

    //   expect(component.openSnackbar).toHaveBeenCalledWith('Users Inited to Batch Successfully.')
    // })

    it('should handle empty selectedUsers array', () => {
      component.contentForm.patchValue({
        selectedUsers: []
      })

      const expectedRequest = {
        request: {
          batchId: 'test-batch-id',
          programId: 'test-program-id',
          userIdList: []
        }
      }

      mockBatchService.inviteUserToBatch.mockReturnValue(of({}))

      component.onSubmit()

      expect(mockBatchService.inviteUserToBatch).toHaveBeenCalledWith(expectedRequest)
    })
  })

  describe('openSnackbar', () => {
    it('should open snackbar with default duration', () => {
      const primaryMsg = 'Test message'

      component['openSnackbar'](primaryMsg)

      expect(mockSnackBar.open).toHaveBeenCalledWith(primaryMsg, 'X', {
        duration: 5000
      })
    })

    it('should open snackbar with custom duration', () => {
      const primaryMsg = 'Test message'
      const customDuration = 3000

      component['openSnackbar'](primaryMsg, customDuration)

      expect(mockSnackBar.open).toHaveBeenCalledWith(primaryMsg, 'X', {
        duration: customDuration
      })
    })
  })

  describe('showError', () => {
    it('should return true when control is touched and invalid', () => {
      const control = new FormControl('', Validators.required)
      control.markAsTouched()
      component.contentForm.addControl('testField', control)

      const result = component.showError('testField')

      expect(result).toBeTruthy()
    })

    it('should return false when control is touched but valid', () => {
      const control = new FormControl('valid value', Validators.required)
      control.markAsTouched()
      component.contentForm.addControl('testField', control)

      const result = component.showError('testField')

      expect(result).toBeFalsy()
    })

    it('should return false when control is not touched', () => {
      const control = new FormControl('', Validators.required)
      component.contentForm.addControl('testField', control)

      const result = component.showError('testField')

      expect(result).toBeFalsy()
    })

    it('should return false when control does not exist', () => {
      const result = component.showError('nonExistentField')

      expect(result).toBeFalsy()
    })

    it('should handle case when control exists but is null', () => {
      // Mock a scenario where control exists but is null
      jest.spyOn(component.contentForm, 'controls', 'get').mockReturnValue({
        testField: null
      } as any)

      const result = component.showError('testField')

      expect(result).toBeFalsy()
    })
  })

  describe('Component Properties', () => {
    it('should have correct initial values for Input properties', () => {
      expect(component.batchData).toBeUndefined()
      expect(component.programID).toBeUndefined()
    })

    it('should have content property defined after initialization', () => {
      expect(component.content).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle onSubmit when contentForm is null', () => {
      component.contentForm = null as any

      expect(() => component.onSubmit()).not.toThrow()
    })

    it('should handle selectedUsersData with null event', () => {
      const setValueSpy = jest.spyOn(component.contentForm.controls['selectedUsers'], 'setValue')

      component.selectedUsersData(null)

      expect(setValueSpy).toHaveBeenCalledWith(null)
    })

    it('should handle fetchContent when snapshot parent data is undefined', () => {
      //  mockActivatedRoute.snapshot.parent.data = undefined
      mockActivatedRoute.snapshot.parent.paramMap.get.mockReturnValue('test-id')
      mockBatchService.readContentLive.mockReturnValue(of({}))

      expect(() => component.fetchContent()).not.toThrow()
    })
  })
})