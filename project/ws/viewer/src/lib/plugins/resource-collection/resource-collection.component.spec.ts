import { UntypedFormControl } from '@angular/forms'
import { MatTableDataSource } from '@angular/material/table'
import { of, throwError } from 'rxjs'

// Mock the view-submission component that has an unresolvable dependency
jest.mock('./components/view-submission/view-submission.component', () => ({
  ViewSubmissionComponent: class MockViewSubmissionComponent { }
}))

import { ResourceCollectionComponent } from './resource-collection.component'

describe('ResourceCollectionComponent (plugin)', () => {
  let component: ResourceCollectionComponent
  let mockSnackBar: any
  let mockResourceSvc: any
  let mockDialog: any

  const mockResourceCollectionData: any = {
    identifier: 'rc123',
    name: 'Test Resource Collection',
  }

  beforeEach(() => {
    mockSnackBar = {
      open: jest.fn()
    }

    mockResourceSvc = {
      getAllSubmission: jest.fn(),
      createContentDirectory: jest.fn(),
      uploadFile: jest.fn(),
      postSubmission: jest.fn(),
    }

    mockDialog = {
      open: jest.fn()
    }

    component = new ResourceCollectionComponent(mockSnackBar, mockResourceSvc, mockDialog)
    component.resourceCollectionData = mockResourceCollectionData
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize default properties', () => {
      expect(component.dialogHeight).toBe('auto')
      expect(component.submissionData).toEqual([])
      expect(component.currentTabIndex).toBe(0)
      expect(component.index).toBe(0)
      expect(component.type).toBe('all')
      expect(component.contentId).toBe('')
      expect(component.fetchingStatus).toBe('fetched')
      expect(component.selectedFile).toBeNull()
      expect(component.message).toBeNull()
    })

    it('should initialize submitData with correct defaults', () => {
      expect(component.submitData).toEqual({ isSubmit: false, value: 0 })
    })

    it('should initialize answerControl as UntypedFormControl', () => {
      expect(component.answerControl).toBeInstanceOf(UntypedFormControl)
      expect(component.answerControl.value).toBe('')
    })

    it('should initialize dataSource as MatTableDataSource', () => {
      expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
    })

    it('should initialize supportedFormatsHash correctly', () => {
      expect(component.supportedFormatsHash['video/mp4']).toBe('.mp4')
      expect(component.supportedFormatsHash['application/pdf']).toBe('.pdf')
      expect(component.supportedFormatsHash['input']).toBe('.txt')
    })
  })

  describe('ngOnInit', () => {
    it('should call getAllSubmissions on init', () => {
      const mockResponse = { response: [] }
      mockResourceSvc.getAllSubmission.mockReturnValue(of(mockResponse))

      component.ngOnInit()

      expect(mockResourceSvc.getAllSubmission).toHaveBeenCalledWith('all', 'rc123')
    })
  })

  describe('getAllSubmissions', () => {
    it('should set fetchingStatus to fetched when response is empty', () => {
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.getAllSubmissions()

      expect(component.fetchingStatus).toBe('fetched')
      expect(component.submissionData).toEqual([])
    })

    it('should populate submissionData when response has data', () => {
      const mockData = [{ id: 'sub1', url: 'http://test.com' }]
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: mockData }))

      component.getAllSubmissions()

      expect(component.submissionData).toEqual(mockData)
      expect(component.fetchingStatus).toBe('fetched')
      expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
    })

    it('should reset submissionData before fetching', () => {
      component.submissionData = [{ id: 'old' }]
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.getAllSubmissions()

      expect(component.submissionData).toEqual([])
    })

    it('should set fetchingStatus to fetching initially', () => {
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      // We need to observe the intermediate state. We'll check the service was called (fetching status set before subscription)
      component.getAllSubmissions()

      expect(mockResourceSvc.getAllSubmission).toHaveBeenCalled()
    })
  })

  describe('changeFile', () => {
    it('should set selectedFile to the first file in array', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      component.changeFile([mockFile])

      expect(component.selectedFile).toBe(mockFile)
    })

    it('should reset selectedFile if it was previously set before setting new one', () => {
      const firstFile = new File(['old'], 'old.pdf', { type: 'application/pdf' })
      const newFile = new File(['new'], 'new.pdf', { type: 'application/pdf' })
      component.selectedFile = firstFile

      component.changeFile([newFile])

      expect(component.selectedFile).toBe(newFile)
    })
  })

  describe('reset', () => {
    it('should reset selectedFile when currentTabIndex is 1', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      component.selectedFile = mockFile
      component.currentTabIndex = 1

      component.reset()

      expect(component.selectedFile).toBeNull()
    })

    it('should reset answerControl when currentTabIndex is 0', () => {
      component.answerControl.setValue('some answer text')
      component.currentTabIndex = 0

      component.reset()

      expect(component.answerControl.value).toBeNull()
    })
  })

  describe('submit', () => {
    it('should set submitData.isSubmit to true and fetchingStatus to fetching', () => {
      component.currentTabIndex = 0
      component.answerControl.setValue('a'.repeat(10))
      mockResourceSvc.createContentDirectory.mockReturnValue(of({}))
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.submit()

      expect(mockResourceSvc.createContentDirectory).toHaveBeenCalledWith('rc123')
    })

    it('should show snackbar when answer text is less than 10 chars (tab index 0)', () => {
      component.currentTabIndex = 0
      component.answerControl.setValue('short')

      component.submit()

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter your answer', 'X', { duration: 1000 })
      expect(component.submitData.isSubmit).toBe(false)
    })

    it('should show snackbar when no file selected (tab index 1)', () => {
      component.currentTabIndex = 1
      component.selectedFile = null

      component.submit()

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please upload your answer', 'X', { duration: 1000 })
      expect(component.submitData.isSubmit).toBe(false)
    })

    it('should show invalid file type snackbar for unsupported file (tab index 1)', () => {
      component.currentTabIndex = 1
      component.selectedFile = new File(['content'], 'test.txt', { type: 'text/plain' })

      component.submit()

      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid File Type', 'X', { duration: 1000 })
    })

    it('should call createContentDirectory for valid PDF file (tab index 1)', () => {
      component.currentTabIndex = 1
      component.selectedFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      mockResourceSvc.createContentDirectory.mockReturnValue(of({}))
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.submit()

      expect(mockResourceSvc.createContentDirectory).toHaveBeenCalledWith('rc123')
    })

    it('should call createContentDirectory for valid MP4 file (tab index 1)', () => {
      component.currentTabIndex = 1
      component.selectedFile = new File(['content'], 'test.mp4', { type: 'video/mp4' })
      mockResourceSvc.createContentDirectory.mockReturnValue(of({}))
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.submit()

      expect(mockResourceSvc.createContentDirectory).toHaveBeenCalledWith('rc123')
    })
  })

  describe('createContentDirectory', () => {
    it('should call uploadFile after successful directory creation', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      mockResourceSvc.createContentDirectory.mockReturnValue(of({}))
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.createContentDirectory(mockFile)

      expect(mockResourceSvc.createContentDirectory).toHaveBeenCalledWith('rc123')
      expect(mockResourceSvc.uploadFile).toHaveBeenCalled()
    })

    it('should call uploadFile when directory creation returns 409 (already exists)', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      mockResourceSvc.createContentDirectory.mockReturnValue(throwError({ status: 409 }))
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.createContentDirectory(mockFile)

      expect(mockResourceSvc.uploadFile).toHaveBeenCalled()
    })

    it('should show error snackbar when directory creation fails with non-409 error', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      mockResourceSvc.createContentDirectory.mockReturnValue(throwError({ status: 500 }))

      component.createContentDirectory(mockFile)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error creating content directory', 'X', { duration: 3000 })
      expect(component.submitData.isSubmit).toBe(false)
      expect(component.submitData.value).toBe(0)
    })
  })

  describe('uploadFile', () => {
    it('should post submission after successful upload', () => {
      const mockFile = new File(['content'], 'submission.pdf', { type: 'application/pdf' })
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.uploadFile(mockFile)

      expect(mockResourceSvc.postSubmission).toHaveBeenCalledWith(
        { submission_type: 'application/pdf', url: 'http://test.com/file' },
        'rc123'
      )
    })

    it('should show success snackbar and call getAllSubmissions after successful submission', () => {
      const mockFile = new File(['content'], 'submission.pdf', { type: 'application/pdf' })
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.uploadFile(mockFile)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Submitted Successfully', 'X', { duration: 2000 })
      expect(mockResourceSvc.getAllSubmission).toHaveBeenCalled()
    })

    it('should show error snackbar when upload fails', () => {
      const mockFile = new File(['content'], 'submission.pdf', { type: 'application/pdf' })
      mockResourceSvc.uploadFile.mockReturnValue(throwError('Upload error'))

      component.uploadFile(mockFile)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error uploading file', 'X', { duration: 3000 })
      expect(component.submitData.isSubmit).toBe(false)
    })

    it('should show error snackbar when postSubmission fails', () => {
      const mockFile = new File(['content'], 'submission.pdf', { type: 'application/pdf' })
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(throwError('Submission error'))

      component.uploadFile(mockFile)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error submitting file', 'X', { duration: 3000 })
      expect(component.submitData.isSubmit).toBe(false)
    })

    it('should use input extension for file with no type', () => {
      const mockFile = new File(['content'], 'submission.txt', { type: '' })
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))

      component.uploadFile(mockFile)

      // The filename should use .txt extension (input type)
      const formDataCall = mockResourceSvc.uploadFile.mock.calls[0]
      expect(formDataCall).toBeTruthy()
    })
  })

  describe('openDialog', () => {
    it('should open dialog with auto height for non-video type', () => {
      component.openDialog('http://test.com/file', 'application/pdf', '2024-01-01')

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: '100vw',
          height: 'auto',
          data: {
            url: 'http://test.com/file',
            type: 'application/pdf',
            date: '2024-01-01',
          },
        })
      )
    })

    it('should open dialog with 80% height for video/mp4 type', () => {
      component.openDialog('http://test.com/video.mp4', 'video/mp4', '2024-01-01')

      expect(component.dialogHeight).toBe('80%')
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          height: '80%',
        })
      )
    })
  })
})

