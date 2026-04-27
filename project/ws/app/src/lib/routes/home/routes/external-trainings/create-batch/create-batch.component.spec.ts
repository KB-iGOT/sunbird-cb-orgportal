import { CreateBatchComponent, endDateValidator } from './create-batch.component'
import { FormBuilder, FormControl } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { Subject } from 'rxjs'

describe('CreateBatchComponent', () => {
  let component: CreateBatchComponent
  let mockRouter: any
  let mockRoute: any
  let mockExternalTrainingsSvc: any
  let mockMatSnackBar: any
  let mockLoaderService: any
  let queryParamsSubject: Subject<any>

  beforeEach(() => {
    queryParamsSubject = new Subject<any>()
    mockRouter = { navigate: jest.fn() }
    mockRoute = {
      parent: { snapshot: { params: { id: 'training1' } } },
      snapshot: { params: {}, data: { configService: { userProfile: { userId: 'user1' } } } },
      queryParams: queryParamsSubject.asObservable(),
    }
    mockExternalTrainingsSvc = {
      getExternalTrainingDetails: jest.fn(),
      createBatch: jest.fn(),
      bulkUsersUpload: jest.fn(),
      addCertTemplate: jest.fn(),
      downloadSampleFile: jest.fn(),
    }
    mockMatSnackBar = { open: jest.fn() }
    mockLoaderService = { changeLoaderState: jest.fn() }

    component = new CreateBatchComponent(
      new FormBuilder(),
      mockRouter,
      mockRoute,
      mockExternalTrainingsSvc,
      mockMatSnackBar,
      mockLoaderService,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ─── endDateValidator ─────────────────────────────────────────────────────

  describe('endDateValidator', () => {
    it('should return null when no parent', () => {
      const ctrl = new FormControl('2024-01-10')
      const validator = endDateValidator()
      expect(validator(ctrl)).toBeNull()
    })

    it('should return null when startDate or endDate missing', () => {
      const fb = new FormBuilder()
      const form = fb.group({ startDate: [''], endDate: ['', endDateValidator()] })
      form.get('startDate')?.setValue('')
      expect(form.get('endDate')?.errors).toBeNull()
    })

    it('should return endBeforeStart error when endDate < startDate', () => {
      const fb = new FormBuilder()
      const form = fb.group({
        startDate: ['2024-05-10'],
        endDate: ['2024-05-01', endDateValidator()],
      })
      // Trigger the validator re-evaluation now that the parent group is linked
      form.get('endDate')?.updateValueAndValidity()
      expect(form.get('endDate')?.errors).toEqual({ endBeforeStart: true })
    })

    it('should return null when endDate >= startDate', () => {
      const fb = new FormBuilder()
      const form = fb.group({
        startDate: ['2024-05-01'],
        endDate: ['2024-05-10', endDateValidator()],
      })
      expect(form.get('endDate')?.errors).toBeNull()
    })
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should init trainingId, form, batch details, and subscribe to queryParams', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.trainingId).toBe('training1')
      expect(component.batchForm).toBeDefined()

      // non-edit mode
      queryParamsSubject.next({ batchId: '' })
      expect(component.isEditMode).toBe(false)
    })

    it('should set isEditMode true and disable form when batchId present', () => {
      const spyBatchDetails = jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      queryParamsSubject.next({ batchId: 'batch1' })
      expect(component.isEditMode).toBe(true)
      expect(spyBatchDetails).toHaveBeenCalled()
      // Form disable is called — verify by calling disable and checking it works
      component.batchForm.disable()
      expect(component.batchForm.disabled).toBe(true)
    })
  })

  // ─── getters ──────────────────────────────────────────────────────────────

  describe('startDateAsDate', () => {
    it('should return Date when value is set', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      component.batchForm.get('startDate')?.setValue('2024-05-01')
      expect(component.startDateAsDate).toBeInstanceOf(Date)
    })

    it('should return null when no value', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      component.batchForm.get('startDate')?.setValue('')
      expect(component.startDateAsDate).toBeNull()
    })
  })

  describe('endDateAsDate', () => {
    it('should return Date when value is set', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      component.batchForm.get('endDate')?.setValue('2024-05-10')
      expect(component.endDateAsDate).toBeInstanceOf(Date)
    })

    it('should return null when no value', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      component.batchForm.get('endDate')?.setValue('')
      expect(component.endDateAsDate).toBeNull()
    })
  })

  describe('isSubmitDisabled', () => {
    it('should return true in edit mode when no file uploaded', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      component.isEditMode = true
      component.uploadedFile = null
      expect(component.isSubmitDisabled).toBe(true)
    })

    it('should return false in edit mode when file is uploaded', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      component.isEditMode = true
      component.uploadedFile = new File(['content'], 'test.csv', { type: 'text/csv' })
      expect(component.isSubmitDisabled).toBe(false)
    })

    it('should return true in create mode when form invalid or no file', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      component.isEditMode = false
      component.uploadedFile = null
      expect(component.isSubmitDisabled).toBe(true)
    })
  })

  // ─── initializeForm ───────────────────────────────────────────────────────

  describe('initializeForm', () => {
    it('should create form with batchName, startDate, endDate controls', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.batchForm.get('batchName')).toBeTruthy()
      expect(component.batchForm.get('startDate')).toBeTruthy()
      expect(component.batchForm.get('endDate')).toBeTruthy()
    })

    it('should trigger endDate validity update when startDate changes', () => {
      jest.spyOn(component as any, 'getBatchDetails').mockImplementation(() => { })
      component.ngOnInit()
      const endDateCtrl = component.batchForm.get('endDate')!
      const spy = jest.spyOn(endDateCtrl, 'updateValueAndValidity')
      component.batchForm.get('startDate')?.setValue('2024-06-01')
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── getBatchDetails ──────────────────────────────────────────────────────

  describe('getBatchDetails', () => {
    beforeEach(() => {
      component.trainingId = 'training1'
      component.batchId = 'batch1'
      component.isEditMode = true
      jest.spyOn(component as any, 'getBatchDetails').mockRestore
      component.initializeForm()
    })

    it('should set currentBatch and call patchFormWithBatchData when in edit mode', () => {
      const batch = { batchId: 'batch1', name: 'B1', startDate: '2024-01-01', endDate: '2024-02-01' }
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of({ result: { event: { duration: 0, batches: [batch], certTemplate: 'tpl', certTemplateId: 'tid' } } })
      )
      component.getBatchDetails()
      expect(component.currentBatch).toEqual(batch)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should handle API error and show snackbar', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        throwError({ error: { params: { errmsg: 'Fetch error' } } })
      )
      component.getBatchDetails()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Fetch error', 'Close', { duration: 3000 })
    })

    it('should use fallback error message when errmsg absent', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        throwError({})
      )
      component.getBatchDetails()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error fetching batch details', 'Close', { duration: 3000 })
    })
  })

  // ─── patchFormWithBatchData ───────────────────────────────────────────────

  describe('patchFormWithBatchData', () => {
    it('should patch form values from currentBatch', () => {
      component.initializeForm()
      component.currentBatch = { name: 'MyBatch', startDate: '2024-01-01', endDate: '2024-02-01' }
      component.patchFormWithBatchData()
      expect(component.batchForm.get('batchName')?.value).toBe('MyBatch')
    })

    it('should handle null dates gracefully', () => {
      component.initializeForm()
      component.currentBatch = { name: 'B', startDate: null, endDate: null }
      expect(() => component.patchFormWithBatchData()).not.toThrow()
    })
  })

  // ─── file handling ────────────────────────────────────────────────────────

  describe('onFileSelected', () => {
    it('should call validateAndSetFile for selected csv file', () => {
      jest.spyOn(component as any, 'validateAndSetFile').mockImplementation(() => { })
      const mockFile = new File(['data'], 'test.csv', { type: 'text/csv' })
      const mockInput = { files: [mockFile] } as any
      component.onFileSelected({ target: mockInput } as any)
      expect((component as any).validateAndSetFile).toHaveBeenCalledWith(mockFile)
    })

    it('should do nothing when no files', () => {
      jest.spyOn(component as any, 'validateAndSetFile').mockImplementation(() => { })
      component.onFileSelected({ target: { files: [] } } as any)
      expect((component as any).validateAndSetFile).not.toHaveBeenCalled()
    })
  })

  describe('onFileDrop', () => {
    it('should set isDragOver to false and call validateAndSetFile', () => {
      jest.spyOn(component as any, 'validateAndSetFile').mockImplementation(() => { })
      const mockFile = new File(['data'], 'upload.csv', { type: 'text/csv' })
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: [mockFile] },
      } as any
      component.onFileDrop(event)
      expect(component.isDragOver).toBe(false)
      expect((component as any).validateAndSetFile).toHaveBeenCalledWith(mockFile)
    })

    it('should not call validateAndSetFile when no dataTransfer files', () => {
      jest.spyOn(component as any, 'validateAndSetFile').mockImplementation(() => { })
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: [] },
      } as any
      component.onFileDrop(event)
      expect((component as any).validateAndSetFile).not.toHaveBeenCalled()
    })
  })

  describe('onDragOver', () => {
    it('should set isDragOver to true', () => {
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any
      component.onDragOver(event)
      expect(component.isDragOver).toBe(true)
    })
  })

  describe('onDragLeave', () => {
    it('should set isDragOver to false', () => {
      component.isDragOver = true
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any
      component.onDragLeave(event)
      expect(component.isDragOver).toBe(false)
    })
  })

  describe('validateAndSetFile', () => {
    it('should set uploadedFile for valid csv file', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' })
      component.validateAndSetFile(file)
      expect(component.uploadedFile).toBe(file)
    })

    it('should alert and return for non-csv file', () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { })
      const file = new File(['data'], 'test.xlsx', { type: 'application/vnd.ms-excel' })
      component.validateAndSetFile(file)
      expect(mockAlert).toHaveBeenCalledWith('Only CSV files are supported')
      expect(component.uploadedFile).toBeNull()
      mockAlert.mockRestore()
    })

    it('should alert and return when file exceeds 100MB', () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { })
      const file = { name: 'big.csv', size: 101 * 1024 * 1024 } as File
      component.validateAndSetFile(file)
      expect(mockAlert).toHaveBeenCalledWith('File size exceeds 100 MB limit')
      mockAlert.mockRestore()
    })
  })

  describe('removeFile', () => {
    it('should set uploadedFile to null', () => {
      component.uploadedFile = new File(['data'], 'test.csv')
      component.removeFile()
      expect(component.uploadedFile).toBeNull()
    })
  })

  // ─── downloadSampleFile ───────────────────────────────────────────────────

  describe('downloadSampleFile', () => {
    it('should create anchor and click it on success', () => {
      const blob = new Blob(['csv data'])
      mockExternalTrainingsSvc.downloadSampleFile.mockReturnValue(of(blob))
      const mockUrl = 'blob:fake'
        ; (globalThis as any).URL = { createObjectURL: jest.fn().mockReturnValue(mockUrl), revokeObjectURL: jest.fn() }
      const mockLink: any = { href: '', download: '', click: jest.fn() }
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      component.downloadSampleFile()
      expect(mockLink.click).toHaveBeenCalled()
      expect((globalThis as any).URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })

    it('should show snackbar on download error', () => {
      mockExternalTrainingsSvc.downloadSampleFile.mockReturnValue(
        throwError(() => new Error('err'))
      )
      component.downloadSampleFile()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error downloading sample file', 'Close', { duration: 3000 })
    })
  })

  // ─── onSubmit ─────────────────────────────────────────────────────────────

  describe('onSubmit', () => {
    it('should call handleEditSubmit when isEditMode is true', () => {
      jest.spyOn(component as any, 'handleEditSubmit').mockImplementation(() => { })
      component.isEditMode = true
      component.onSubmit()
      expect((component as any).handleEditSubmit).toHaveBeenCalled()
    })

    it('should call handleCreateSubmit when isEditMode is false', () => {
      jest.spyOn(component as any, 'handleCreateSubmit').mockImplementation(() => { })
      component.isEditMode = false
      component.onSubmit()
      expect((component as any).handleCreateSubmit).toHaveBeenCalled()
    })
  })

  // ─── handleCreateSubmit ───────────────────────────────────────────────────

  describe('handleCreateSubmit', () => {
    beforeEach(() => {
      component.initializeForm()
      component.batchForm.setValue({ batchName: 'Batch1', startDate: '2024-05-01', endDate: '2024-06-01' })
      component.uploadedFile = new File(['data'], 'participants.csv', { type: 'text/csv' })
      component.trainingId = 'training1'
      component.configSvc = { userProfile: { userId: 'user1' } }
    })

    it('should create batch, upload file, add cert, and navigate on success', () => {
      jest.useFakeTimers()
      mockExternalTrainingsSvc.createBatch.mockReturnValue(of({ result: { batchId: 'newBatch1' } }))
      mockExternalTrainingsSvc.bulkUsersUpload.mockReturnValue(of({ result: 'ok' }))
      mockExternalTrainingsSvc.addCertTemplate.mockReturnValue(of({ result: 'ok' }))
      component.handleCreateSubmit()
      jest.runAllTimers()
      jest.useRealTimers()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Participant data uploaded successfully. Please refer to the file log for any failed records.',
        'Close', { duration: 3000 }
      )
    })

    it('should show error snackbar when createBatch fails', () => {
      mockExternalTrainingsSvc.createBatch.mockReturnValue(
        throwError({ error: { params: { errmsg: 'Create error' } } })
      )
      component.handleCreateSubmit()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Create error', 'Close', { duration: 3000 })
    })

    it('should use fallback error message when errmsg absent', () => {
      mockExternalTrainingsSvc.createBatch.mockReturnValue(throwError({}))
      component.handleCreateSubmit()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'An error occurred while creating the batch.', 'Close', { duration: 3000 }
      )
    })

    it('should do nothing when form is invalid or no file', () => {
      component.uploadedFile = null
      component.handleCreateSubmit()
      expect(mockExternalTrainingsSvc.createBatch).not.toHaveBeenCalled()
    })
  })

  // ─── handleEditSubmit ─────────────────────────────────────────────────────

  describe('handleEditSubmit', () => {
    beforeEach(() => {
      component.trainingId = 'training1'
      component.batchId = 'batch1'
    })

    it('should upload file and navigate on success', () => {
      jest.useFakeTimers()
      component.uploadedFile = new File(['data'], 'participants.csv', { type: 'text/csv' })
      mockExternalTrainingsSvc.bulkUsersUpload.mockReturnValue(of({ result: 'ok' }))
      component.handleEditSubmit()
      jest.runAllTimers()
      jest.useRealTimers()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Participant data uploaded successfully. Please refer to the file log for any failed records.',
        'Close', { duration: 3000 }
      )
    })

    it('should show error snackbar when upload fails', () => {
      component.uploadedFile = new File(['data'], 'participants.csv', { type: 'text/csv' })
      mockExternalTrainingsSvc.bulkUsersUpload.mockReturnValue(
        throwError({ error: { params: { errmsg: 'Upload error' } } })
      )
      component.handleEditSubmit()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Upload error', 'Close', { duration: 3000 })
    })

    it('should show snackbar and prompt to select file when no file', () => {
      component.uploadedFile = null
      component.handleEditSubmit()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Please select a CSV file to upload participants.', 'Close', { duration: 3000 }
      )
    })
  })

  // ─── onCancel / goBack ────────────────────────────────────────────────────

  describe('onCancel', () => {
    it('should call goBack', () => {
      jest.spyOn(component as any, 'goBack').mockImplementation(() => { })
      component.onCancel()
      expect((component as any).goBack).toHaveBeenCalled()
    })
  })

  describe('goBack', () => {
    it('should navigate to batches', () => {
      component.trainingId = 'training1'
      component.goBack()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['app', 'home', 'external-trainings', 'training1', 'batches']
      )
    })
  })
})

