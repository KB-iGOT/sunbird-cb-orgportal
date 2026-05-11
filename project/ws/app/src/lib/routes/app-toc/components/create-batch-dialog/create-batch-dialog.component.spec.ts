(window as any)['env'] = {
  name: 'test-environment',
  sitePath: '/test-site-path',
  karmYogiPath: '/test-karm-yogi-path',
  cbpPath: '/test-cbp-path'
}
jest.mock('@ws/app', () => ({
  AppDateAdapter: class AppDateAdapter {},
  APP_DATE_FORMATS: { parse: { dateInput: 'input' }, display: { dateInput: 'input' } },
  startWithYearformat: jest.fn().mockReturnValue('2024-01-01'),
}), { virtual: true })
import '@angular/compiler'
import { of, throwError } from 'rxjs'
import { CreateBatchDialogComponent } from './create-batch-dialog.component'


describe('CreateBatchDialogComponent', () => {
  let component: CreateBatchDialogComponent


  const mockDialogRef = {
    close: jest.fn(),
  }

  const mockDialogData = {
    content: {
      identifier: 'test-course-id',
    },
  }

  const mockAppTocService = {
    createBatch: jest.fn(),
  }

  const mockSnackBar = {
    open: jest.fn(),
  }

  const mockConfigService = {
    userProfile: {
      userId: 'test-user-id',
      rootOrgId: 'test-org-id',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    component = new CreateBatchDialogComponent(
      mockDialogRef as any,
      mockDialogData,
      mockAppTocService as any,
      mockSnackBar as any,
      mockConfigService as any
    )

    component.toastSuccess = { nativeElement: { value: 'Success message' } } as any
    component.toastError = { nativeElement: { value: 'Error message' } } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('Form Validation', () => {
    it('should initialize with invalid form', () => {
      expect(component.createBatchForm.valid).toBeFalsy()
    })

    it('should validate required fields', () => {
      const form = component.createBatchForm
      expect(form.get('name')?.errors?.['required']).toBeTruthy()
      expect(form.get('startDate')?.errors?.['required']).toBeTruthy()
      expect(form.get('enrollmentType')?.errors).toBeFalsy() // Has default value
    })

    it('should validate name pattern', () => {
      const nameControl = component.createBatchForm.get('name')
      nameControl?.setValue('Test123') // Invalid - contains numbers
      expect(nameControl?.errors?.['pattern']).toBeTruthy()

      nameControl?.setValue('Valid Name') // Valid
      expect(nameControl?.errors).toBeFalsy()
    })
  })

  describe('createBatchSubmit', () => {
    const mockValidForm = {
      value: {
        name: 'Test Batch',
        description: 'Test Description',
        enrollmentType: 'open',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        enrollmentEndDate: new Date('2025-06-30'),
        mentors: ['mentor1'],
      },
    }

    it('should successfully create batch', () => {
      mockAppTocService.createBatch.mockReturnValue(of({}))

      component.createBatchSubmit(mockValidForm)

      expect(mockAppTocService.createBatch).toHaveBeenCalled()
      expect(component.uploadSaveData).toBeFalsy()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Success message', 'X', { duration: 5000 })
      expect(mockDialogRef.close).toHaveBeenCalled()
    })



    it('should handle API error without error message', () => {
      mockAppTocService.createBatch.mockReturnValue(throwError(() => new Error()))

      component.createBatchSubmit(mockValidForm)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message', 'X', { duration: 5000 })
      expect(component.uploadSaveData).toBeFalsy()
      expect(mockDialogRef.close).not.toHaveBeenCalled()
    })


  })
})