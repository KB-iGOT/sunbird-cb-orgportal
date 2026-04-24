import { BulkUploadOrgComponent } from './bulk-upload-org.component'
import { GlobalEventsService } from '../../../../../../../../../../src/app/services/global-events.service'
import { of, throwError } from 'rxjs'

describe('BulkUploadOrgComponent', () => {
  let component: BulkUploadOrgComponent
  let mockDialogRef: any
  let mockData: any
  let mockOrgHieService: any
  let mockLoaderService: any
  let mockSnackbar: any

  const makeFrameworkData = () => ({
    orgHierarchyFrameworkId: 'fw123_abc',
    orgName: 'Test Org',
  })

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockData = {
      bulkUploadConfig: {
        frameworkData: makeFrameworkData(),
        mainHeading: 'Upload',
      }
    }
    mockOrgHieService = {
      downloadSampleTemplate: jest.fn(),
      uploadFreameworkTemplate: jest.fn(),
      getBulkuploadProgress: jest.fn(),
      downloadFileLog: jest.fn(),
    }
    mockLoaderService = new GlobalEventsService()
    jest.spyOn(mockLoaderService, 'setLoaderState')
    mockSnackbar = { open: jest.fn() }

    component = new BulkUploadOrgComponent(
      mockDialogRef,
      mockData,
      mockOrgHieService,
      mockLoaderService,
      mockSnackbar,
    )
  })

  // ─── create ───────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set bulkUploadConfig and call getBulkuploadPrgressData', () => {
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        of({ params: { status: 'successful' }, result: { content: [] } })
      )
      jest.spyOn(component as any, 'getBulkuploadPrgressData')
      component.ngOnInit()
      expect(component.bulkUploadConfig).toEqual(mockData.bulkUploadConfig)
      expect((component as any).getBulkuploadPrgressData).toHaveBeenCalled()
    })

    it('should use empty object when bulkUploadConfig is absent', () => {
      mockData.bulkUploadConfig = undefined
      jest.spyOn(component as any, 'getBulkuploadPrgressData').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.bulkUploadConfig).toEqual({})
    })
  })

  // ─── handleDownloadSampleFile ─────────────────────────────────────────────

  describe('handleDownloadSampleFile', () => {
    beforeEach(() => {
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        of({ params: { status: 'successful' }, result: { content: [] } })
      )
      component.ngOnInit()
    })

    it('should download and show success snackbar', async () => {
      mockOrgHieService.downloadSampleTemplate.mockReturnValue(of({ data: 'file' }))
      await component.handleDownloadSampleFile()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Download successfully')
    })

    it('should handle download error and show snackbar', async () => {
      mockOrgHieService.downloadSampleTemplate.mockReturnValue(
        throwError({ error: { params: { errMsg: 'Download failed' } } })
      )
      await component.handleDownloadSampleFile()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Download failed')
      expect(mockLoaderService.setLoaderState).toHaveBeenCalledWith(false)
    })

    it('should do nothing when frameworkData has no orgHierarchyFrameworkId', async () => {
      component.bulkUploadConfig = { frameworkData: {} }
      await component.handleDownloadSampleFile()
      expect(mockOrgHieService.downloadSampleTemplate).not.toHaveBeenCalled()
    })
  })

  // ─── handleFileClick ──────────────────────────────────────────────────────

  describe('handleFileClick', () => {
    it('should reset target value', () => {
      const mockEvent = { target: { value: 'something' } }
      component.handleFileClick(mockEvent)
      expect(mockEvent.target.value).toBe('')
    })
  })

  // ─── onFileSelected ───────────────────────────────────────────────────────

  describe('onFileSelected', () => {
    beforeEach(() => {
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        of({ params: { status: 'successful' }, result: { content: [] } })
      )
      component.ngOnInit()
    })

    it('should call uploadExcelFile for valid xlsx file', async () => {
      const mockFile = {
        name: 'test.xlsx',
        size: 1024,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
      jest.spyOn(component as any, 'uploadExcelFile').mockResolvedValue(undefined)
      await component.onFileSelected({ target: { files: [mockFile] } })
      expect((component as any).uploadExcelFile).toHaveBeenCalledWith(mockFile)
    })

    it('should show message for invalid file type', () => {
      const mockFile = { name: 'test.csv', size: 100, type: 'text/csv' }
      component.onFileSelected({ target: { files: [mockFile] } })
      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'Please select a valid Excel file (.xlsx)', 'Close', expect.any(Object)
      )
    })

    it('should show message when file exceeds 5MB', () => {
      const mockFile = {
        name: 'big.xlsx',
        size: 6 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
      component.onFileSelected({ target: { files: [mockFile] } })
      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'File size should not exceed 5MB', 'Close', expect.any(Object)
      )
    })

    it('should do nothing when no file is selected', () => {
      component.onFileSelected({ target: { files: [] } })
      expect(mockSnackbar.open).not.toHaveBeenCalled()
    })
  })

  // ─── uploadExcelFile ──────────────────────────────────────────────────────

  describe('uploadExcelFile', () => {
    beforeEach(() => {
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        of({ params: { status: 'successful' }, result: { content: [] } })
      )
      component.ngOnInit()
    })

    it('should upload and show success snackbar', async () => {
      mockOrgHieService.uploadFreameworkTemplate.mockReturnValue(
        of({ result: { fileName: 'test.xlsx' } })
      )
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        of({ params: { status: 'successful' }, result: { content: [{ id: 1 }] } })
      )
      const mockFile = new File(['content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      await (component as any).uploadExcelFile(mockFile)
      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'File uploaded successfully. Please check after 5 minutes for the results.'
      )
    })

    it('should handle upload error and show snackbar', async () => {
      mockOrgHieService.uploadFreameworkTemplate.mockReturnValue(
        throwError({ error: { params: { errMsg: 'Upload failed' } } })
      )
      const mockFile = new File(['content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      await (component as any).uploadExcelFile(mockFile)
      expect(mockSnackbar.open).toHaveBeenCalledWith('Upload failed')
    })
  })

  // ─── showMessage ──────────────────────────────────────────────────────────

  describe('showMessage', () => {
    it('should call snackbar with duration', () => {
      component.showMessage('Test message')
      expect(mockSnackbar.open).toHaveBeenCalledWith('Test message', 'Close', { duration: 5000 })
    })
  })

  // ─── isValidExcelFile ─────────────────────────────────────────────────────

  describe('isValidExcelFile', () => {
    it('should return true for xlsx type', () => {
      const file = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } as File
      expect(component.isValidExcelFile(file)).toBe(true)
    })

    it('should return false for non-xlsx type', () => {
      const file = { type: 'text/csv' } as File
      expect(component.isValidExcelFile(file)).toBe(false)
    })
  })

  // ─── getBulkuploadPrgressData ─────────────────────────────────────────────

  describe('getBulkuploadPrgressData', () => {
    beforeEach(() => {
      component.bulkUploadConfig = { frameworkData: makeFrameworkData() }
    })

    it('should set lastUploadList on successful response', () => {
      const content = [{ id: 1 }, { id: 2 }]
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        of({ params: { status: 'successful' }, result: { content } })
      )
      component.getBulkuploadPrgressData()
      expect(component.lastUploadList).toEqual(content)
    })

    it('should set empty list and show snackbar on non-successful response', () => {
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        of({ params: { status: 'failed' } })
      )
      component.getBulkuploadPrgressData()
      expect(component.lastUploadList).toEqual([])
      expect(mockSnackbar.open).toHaveBeenCalledWith('No progress data found')
    })

    it('should handle error and show snackbar', () => {
      mockOrgHieService.getBulkuploadProgress.mockReturnValue(
        throwError({ message: 'error' })
      )
      component.getBulkuploadPrgressData()
      expect(component.lastUploadList).toEqual([])
      expect(mockSnackbar.open).toHaveBeenCalledWith('Error fetching progress data')
    })
  })

  // ─── handleDownloadFile ───────────────────────────────────────────────────

  describe('handleDownloadFile', () => {
    const mockBlob = new Blob(['data'])
    const mockUrl = 'blob:http://localhost/fake-url'

    beforeEach(() => {
      component.bulkUploadConfig = { frameworkData: makeFrameworkData() }
        ; (global as any).URL = { createObjectURL: jest.fn().mockReturnValue(mockUrl), revokeObjectURL: jest.fn() }
    })

    it('should download file and create anchor element', () => {
      mockOrgHieService.downloadFileLog.mockReturnValue(of(mockBlob))
      const mockAnchor: any = { href: '', download: '', click: jest.fn() }
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)

      component.handleDownloadFile({ fileName: 'report.xlsx' })

      expect(mockOrgHieService.downloadFileLog).toHaveBeenCalledWith('report.xlsx')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect((global as any).URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })

    it('should handle download file error and show snackbar', () => {
      mockOrgHieService.downloadFileLog.mockReturnValue(
        throwError({ message: 'error' })
      )
      component.handleDownloadFile({ fileName: 'report.xlsx' })
      expect(mockSnackbar.open).toHaveBeenCalledWith('Error downloading file')
    })

    it('should show snackbar when item has no fileName', () => {
      component.handleDownloadFile({ fileName: null })
      expect(mockSnackbar.open).toHaveBeenCalledWith('No file name provided for download')
    })

    it('should show snackbar when item is null', () => {
      component.handleDownloadFile(null)
      expect(mockSnackbar.open).toHaveBeenCalledWith('No file name provided for download')
    })
  })
})
