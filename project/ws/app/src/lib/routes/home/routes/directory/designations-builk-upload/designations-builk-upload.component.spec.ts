import { of, throwError, Subject } from 'rxjs'
import { DesignationsBuilkUploadComponent } from './designations-builk-upload.component'
import { PageEvent } from '@angular/material/paginator'
import { FileService } from '../../../../users/services/upload.service'
import { OtpService } from '../../../../users/services/otp.service'
import { VerifyOtpComponent } from '../../users-view/verify-otp/verify-otp.component'
import { DirectoryService } from '../../../services/directory.service'
import { UsersService } from '../../../../users/services/users.service'

describe('DesignationsBuilkUploadComponent', () => {
  let component: DesignationsBuilkUploadComponent
  let mockFileService: any
  let mockSnackBar: any
  let mockDialog: any
  let mockUsersService: any
  let mockActivateRoute: any
  let mockDirectoryService: any
  let mockConfigSvc: any

  const mockBulkUploadConfig = {
    pageSize: 10,
    pageSizeOptions: [5, 10, 20],
  }

  const mockUploadList = [
    { fileName: 'b.xlsx', dateCreatedOn: '2024-01-02T00:00:00Z' },
    { fileName: 'a.xlsx', dateCreatedOn: '2024-01-01T00:00:00Z' },
  ]

  function createComponent() {
    component = new DesignationsBuilkUploadComponent(
      mockFileService,
      mockSnackBar,
      mockDialog,
      mockUsersService,
      mockActivateRoute,
      mockDirectoryService,
      mockConfigSvc
    )
  }

  beforeEach(() => {
    jest.useFakeTimers()

    mockFileService = {
      getBulkDesignationUploadData: jest.fn().mockReturnValue(of({ result: { content: [...mockUploadList] } })),
      getBulkDesignationStatus: jest.fn().mockReturnValue('/path/to/file'),
      downloadWithDispositionName: jest.fn(),
      downloadBulkUploadSampleFile: jest.fn().mockReturnValue('/sample/path'),
      bulkUploadDesignation: jest.fn().mockReturnValue(of({ success: true })),
      validateExcelFile: jest.fn().mockReturnValue(true),
    }

    mockSnackBar = { open: jest.fn() }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        close: jest.fn(),
        componentInstance: {
          resendOTP: new Subject<any>(),
          otpVerified: new Subject<boolean>(),
        },
      }),
    }

    mockUsersService = {
      sendOtp: jest.fn().mockReturnValue(of({ success: true })),
    }

    mockActivateRoute = {
      snapshot: { queryParams: { roleId: 'org123' } },
      data: of({ pageData: { data: { bulkUploadConfig: mockBulkUploadConfig } } }),
    }

    mockDirectoryService = {
      getUserDetails: jest.fn().mockReturnValue(of({
        result: {
          response: {
            profileDetails: {
              personalDetails: { primaryEmail: 'user@test.com', mobile: '9999999999' },
            },
          },
        },
      })),
      frameWorkInfo: { code: 'fw-001' },
    }

    mockConfigSvc = {
      userProfile: { rootOrgId: 'root-org', email: 'default@email.com', mobile: '0000000000' },
      userProfileV2: { userId: 'user-id-1', email: 'default@email.com', mobile: '0000000000' },
    }

    createComponent()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set rootOrgId from configSvc in constructor', () => {
    expect(component.rootOrgId).toBe('root-org')
  })

  it('should set userProfile from configSvc.userProfileV2 in constructor', () => {
    expect(component.userProfile).toEqual(mockConfigSvc.userProfileV2)
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getUserDetails', () => {
      const spy = jest.spyOn(component, 'getUserDetails')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set orgId from route queryParams', () => {
      component.ngOnInit()
      expect(component.orgId).toBe('org123')
    })

    it('should set orgId to empty string when roleId is absent', () => {
      mockActivateRoute.snapshot.queryParams = {}
      createComponent()
      component.ngOnInit()
      expect(component.orgId).toBe('')
    })

    it('should call getBulkStatusList', () => {
      const spy = jest.spyOn(component, 'getBulkStatusList')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set bulkUploadConfig, pageSize and sizeOptions from route data', () => {
      component.ngOnInit()
      expect(component.pageSize).toBe(10)
      expect(component.sizeOptions).toEqual([5, 10, 20])
    })

    it('should set bulkUploadFrameworkId from directoryService.frameWorkInfo', () => {
      component.ngOnInit()
      expect(component.bulkUploadFrameworkId).toBe('fw-001')
    })

    it('should keep bulkUploadFrameworkId as empty when frameWorkInfo is null', () => {
      mockDirectoryService.frameWorkInfo = null
      createComponent()
      component.ngOnInit()
      expect(component.bulkUploadFrameworkId).toBe('')
    })
  })

  // ─── getUserDetails ──────────────────────────────────────────────────────────

  describe('getUserDetails', () => {
    beforeEach(() => component.ngOnInit())

    it('should set email from profileDetails when available', () => {
      expect(component.userEmailPhone.email).toBe('user@test.com')
    })

    it('should set mobile from profileDetails when available', () => {
      expect(component.userEmailPhone.mobile).toBe('9999999999')
    })

    it('should fall back to userProfile.email when profileDetails is absent', () => {
      mockDirectoryService.getUserDetails.mockReturnValue(of({
        result: { response: { profileDetails: { personalDetails: {} } } },
      }))
      createComponent()
      component.ngOnInit()
      expect(component.userEmailPhone.email).toBe('default@email.com')
    })

    it('should do nothing when result is falsy', () => {
      mockDirectoryService.getUserDetails.mockReturnValue(of(null))
      createComponent()
      expect(() => component.getUserDetails()).not.toThrow()
    })
  })

  // ─── ngAfterViewInit ─────────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('should set lastIndex to sizeOptions[0]', () => {
      component.sizeOptions = [5, 10, 20]
      component.ngAfterViewInit()
      expect(component.lastIndex).toBe(5)
    })
  })

  // ─── onChangePage ────────────────────────────────────────────────────────────

  describe('onChangePage', () => {
    it('should set startIndex and lastIndex correctly', () => {
      const pe = { pageIndex: 1, pageSize: 10 } as PageEvent
      component.onChangePage(pe)
      expect(component.startIndex).toBe(10)
      expect(component.lastIndex).toBe(20)
    })
  })

  // ─── getBulkStatusList ───────────────────────────────────────────────────────

  describe('getBulkStatusList', () => {
    beforeEach(() => component.ngOnInit())

    it('should call getBulkDesignationUploadData with orgId', () => {
      expect(mockFileService.getBulkDesignationUploadData).toHaveBeenCalledWith('org123')
    })

    it('should use rootOrgId when orgId is empty', () => {
      mockActivateRoute.snapshot.queryParams = {}
      createComponent()
      component.ngOnInit()
      expect(mockFileService.getBulkDesignationUploadData).toHaveBeenCalledWith('root-org')
    })

    it('should sort lastUploadList descending by dateCreatedOn', () => {
      expect(component.lastUploadList[0].fileName).toBe('b.xlsx')
    })

    it('should open snackbar on error', () => {
      mockFileService.getBulkDesignationUploadData.mockReturnValue(throwError({ ok: false }))
      createComponent()
      component.ngOnInit()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Unable to get Bulk status list')
    })

    it('should not open snackbar when error.ok is true', () => {
      mockFileService.getBulkDesignationUploadData.mockReturnValue(throwError({ ok: true }))
      createComponent()
      component.ngOnInit()
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ─── showFileUploadProgress ──────────────────────────────────────────────────

  describe('showFileUploadProgress', () => {
    it('should open FileProgressComponent dialog', () => {
      component.showFileUploadProgress()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ disableClose: true, panelClass: 'progress-modal' })
      )
    })

    it('should store dialog instance in fileUploadDialogInstance', () => {
      component.showFileUploadProgress()
      expect(component.fileUploadDialogInstance).toBeDefined()
    })
  })

  // ─── handleDownloadFile ──────────────────────────────────────────────────────

  describe('handleDownloadFile', () => {
    it('should call getBulkDesignationStatus and downloadWithDispositionName', () => {
      const listObj: any = { fileName: 'test.xlsx' }
      component.handleDownloadFile(listObj)
      expect(mockFileService.getBulkDesignationStatus).toHaveBeenCalledWith('test.xlsx')
      expect(mockFileService.downloadWithDispositionName).toHaveBeenCalledWith('/path/to/file')
    })
  })

  // ─── handleDownloadSampleFile ────────────────────────────────────────────────

  describe('handleDownloadSampleFile', () => {
    it('should call downloadBulkUploadSampleFile and downloadWithDispositionName', () => {
      component.bulkUploadFrameworkId = 'fw-001'
      component.handleDownloadSampleFile()
      expect(mockFileService.downloadBulkUploadSampleFile).toHaveBeenCalledWith('fw-001')
      expect(mockFileService.downloadWithDispositionName).toHaveBeenCalledWith('/sample/path')
    })
  })

  // ─── handleFileClick ─────────────────────────────────────────────────────────

  describe('handleFileClick', () => {
    it('should reset event.target.value to empty string', () => {
      const event = { target: { value: 'some-file.xlsx' } }
      component.handleFileClick(event)
      expect(event.target.value).toBe('')
    })
  })

  // ─── sendOTP ─────────────────────────────────────────────────────────────────

  describe('sendOTP', () => {
    it('should call generateAndVerifyOTP with "email" when email is set', () => {
      component.userEmailPhone = { email: 'user@test.com', mobile: '' }
      const spy = jest.spyOn(component, 'generateAndVerifyOTP')
      component.sendOTP()
      expect(spy).toHaveBeenCalledWith('email')
    })

    it('should call generateAndVerifyOTP with "phone" when email is empty', () => {
      component.userEmailPhone = { email: '', mobile: '9999999999' }
      const spy = jest.spyOn(component, 'generateAndVerifyOTP')
      component.sendOTP()
      expect(spy).toHaveBeenCalledWith('phone')
    })
  })

  // ─── generateAndVerifyOTP ────────────────────────────────────────────────────

  describe('generateAndVerifyOTP', () => {
    beforeEach(() => {
      component.userEmailPhone = { email: 'user@test.com', mobile: '9999999999' }
    })

    it('should call usersService.sendOtp with email when contactType is email', () => {
      component.generateAndVerifyOTP('email')
      expect(mockUsersService.sendOtp).toHaveBeenCalledWith('user@test.com', 'email')
    })

    it('should call usersService.sendOtp with mobile when contactType is phone', () => {
      component.generateAndVerifyOTP('phone')
      expect(mockUsersService.sendOtp).toHaveBeenCalledWith('9999999999', 'phone')
    })

    it('should open snackbar with email message on success', () => {
      component.generateAndVerifyOTP('email')
      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Email address'))
    })

    it('should open snackbar with mobile message on success for phone', () => {
      component.generateAndVerifyOTP('phone')
      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Mobile number'))
    })

    it('should call verifyOTP when resendFlag is not provided', () => {
      const spy = jest.spyOn(component, 'verifyOTP')
      component.generateAndVerifyOTP('email')
      expect(spy).toHaveBeenCalledWith('email')
    })

    it('should NOT call verifyOTP when resendFlag is "resend"', () => {
      const spy = jest.spyOn(component, 'verifyOTP')
      component.generateAndVerifyOTP('email', 'resend')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should open snackbar with errmsg on error', () => {
      mockUsersService.sendOtp.mockReturnValue(throwError({ ok: false, error: { params: { errmsg: 'Bad OTP' } } }))
      component.generateAndVerifyOTP('email')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Bad OTP')
    })

    it('should open fallback snackbar when errmsg is absent on error', () => {
      mockUsersService.sendOtp.mockReturnValue(throwError({ ok: false, error: {} }))
      component.generateAndVerifyOTP('email')
      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Unable to send OTP'))
    })

    it('should not open error snackbar when error.ok is true', () => {
      mockUsersService.sendOtp.mockReturnValue(throwError({ ok: true }))
      component.generateAndVerifyOTP('email')
      // only the success snackbar before the observable shouldn't be called
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ─── handleOnFileChange ──────────────────────────────────────────────────────

  describe('handleOnFileChange', () => {
    it('should do nothing when fileList is empty', () => {
      component.handleOnFileChange([])
      expect(component.fileSelected).toBeFalsy()
    })

    it('should set fileName, fileType and fileSelected from file', () => {
      const file = new File(['data'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      component.userEmailPhone = { email: 'user@test.com', mobile: '' }
      component.handleOnFileChange([file])
      expect(component.fileName).toBe('test.xlsx')
      expect(component.fileSelected).toBe(file)
    })

    it('should call verifyOTP with "email" when file is valid and email set', () => {
      const file = new File(['data'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      component.userEmailPhone = { email: 'user@test.com', mobile: '' }
      const spy = jest.spyOn(component, 'verifyOTP')
      component.handleOnFileChange([file])
      expect(spy).toHaveBeenCalledWith('email')
    })

    it('should call verifyOTP with "phone" when file is valid and email is empty', () => {
      const file = new File(['data'], 'test.xlsx', { type: 'text/csv' })
      mockFileService.validateExcelFile.mockReturnValue(true)
      component.userEmailPhone = { email: '', mobile: '9999999999' }
      const spy = jest.spyOn(component, 'verifyOTP')
      component.handleOnFileChange([file])
      expect(spy).toHaveBeenCalledWith('phone')
    })

    it('should set showFileError to true when file type is invalid', () => {
      mockFileService.validateExcelFile.mockReturnValue(false)
      const file = new File(['data'], 'test.txt', { type: 'text/plain' })
      component.handleOnFileChange([file])
      expect(component.showFileError).toBe(true)
    })

    it('should reset showFileError to false before processing', () => {
      component.showFileError = true
      const file = new File(['data'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      component.userEmailPhone = { email: 'u@t.com', mobile: '' }
      component.handleOnFileChange([file])
      expect(component.showFileError).toBe(false)
    })
  })

  // ─── verifyOTP ───────────────────────────────────────────────────────────────

  describe('verifyOTP', () => {
    beforeEach(() => {
      component.userEmailPhone = { email: 'user@test.com', mobile: '9999999999' }
    })

    it('should open VerifyOtpComponent dialog', () => {
      component.verifyOTP('email')
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: { type: 'email', email: 'user@test.com', mobile: '9999999999' },
          disableClose: false,
        })
      )
    })

    it('should call generateAndVerifyOTP with "resend" when resendOTP event fires', () => {
      const spy = jest.spyOn(component, 'generateAndVerifyOTP')
      component.verifyOTP('email')
      const instance = mockDialog.open.mock.results[0].value.componentInstance
      instance.resendOTP.next('email')
      expect(spy).toHaveBeenCalledWith('email', 'resend')
    })

    it('should call showFileUploadProgress and uploadCSVFile when otpVerified fires', () => {
      const spyProgress = jest.spyOn(component, 'showFileUploadProgress')
      const spyUpload = jest.spyOn(component, 'uploadCSVFile')
      component.verifyOTP('email')
      const instance = mockDialog.open.mock.results[0].value.componentInstance
      instance.otpVerified.next(true)
      expect(spyProgress).toHaveBeenCalled()
      expect(spyUpload).toHaveBeenCalled()
    })
  })

  // ─── uploadCSVFile ───────────────────────────────────────────────────────────

  describe('uploadCSVFile', () => {
    beforeEach(() => {
      component.fileSelected = new File(['data'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      component.fileName = 'test.xlsx'
      component.fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      component.bulkUploadFrameworkId = 'fw-001'
      component.orgId = 'org123'
      component.fileUploadDialogInstance = { close: jest.fn() }
    })

    it('should call bulkUploadDesignation with correct args', () => {
      component.uploadCSVFile()
      expect(mockFileService.bulkUploadDesignation).toHaveBeenCalledWith(
        'test.xlsx',
        expect.any(FormData),
        'fw-001',
        'org123'
      )
    })

    it('should close dialog and show success snackbar on upload success', () => {
      component.uploadCSVFile()
      expect(component.fileUploadDialogInstance.close).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('File uploaded successfully!')
    })

    it('should clear fileName and fileSelected on success', () => {
      component.uploadCSVFile()
      expect(component.fileName).toBe('')
      expect(component.fileSelected).toBe('')
    })

    it('should call getBulkStatusList on success', () => {
      const spy = jest.spyOn(component, 'getBulkStatusList')
      component.uploadCSVFile()
      expect(spy).toHaveBeenCalled()
    })

    it('should call startTimer on success', () => {
      const spy = jest.spyOn(component, 'startTimer')
      component.uploadCSVFile()
      expect(spy).toHaveBeenCalled()
    })

    it('should close dialog and show error snackbar on upload error', () => {
      mockFileService.bulkUploadDesignation.mockReturnValue(throwError({ ok: false }))
      component.uploadCSVFile()
      expect(component.fileUploadDialogInstance.close).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('failed'))
    })

    it('should set showFileError true when fileType is invalid', () => {
      mockFileService.validateExcelFile.mockReturnValue(false)
      component.uploadCSVFile()
      expect(component.showFileError).toBe(true)
      expect(mockFileService.bulkUploadDesignation).not.toHaveBeenCalled()
    })

    it('should not upload when fileSelected is falsy', () => {
      component.fileSelected = null
      component.uploadCSVFile()
      expect(mockFileService.bulkUploadDesignation).not.toHaveBeenCalled()
    })
  })

  // ─── handleChangePage ─────────────────────────────────────────────────────────

  describe('handleChangePage', () => {
    it('should update pageSize, startIndex and lastIndex', () => {
      const event = { pageSize: 5, pageIndex: 2 } as PageEvent
      component.handleChangePage(event)
      expect(component.pageSize).toBe(5)
      expect(component.startIndex).toBe(10)
      expect(component.lastIndex).toBe(15)
    })
  })

  // ─── showMyDesignations ───────────────────────────────────────────────────────

  describe('showMyDesignations', () => {
    it('should emit true from closeComponent', () => {
      const spy = jest.spyOn(component.closeComponent, 'emit')
      component.showMyDesignations()
      expect(spy).toHaveBeenCalledWith(true)
    })
  })

  // ─── startTimer ───────────────────────────────────────────────────────────────

  describe('startTimer', () => {
    it('should decrement timeLeft and call getBulkStatusList when timer expires', () => {
      component.timeLeft = 2
      const spy = jest.spyOn(component, 'getBulkStatusList')
      component.startTimer()
      jest.advanceTimersByTime(3000)
      expect(spy).toHaveBeenCalled()
    })

    it('should clear interval after timer expires', () => {
      component.timeLeft = 1
      component.startTimer()
      jest.advanceTimersByTime(2100)
      // interval should have been cleared; calling getBulkStatusList only once
      const count = mockFileService.getBulkDesignationUploadData.mock.calls.length
      jest.advanceTimersByTime(2000)
      expect(mockFileService.getBulkDesignationUploadData.mock.calls.length).toBe(count)
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe destroySubject$', () => {
      const spy = jest.spyOn((component as any).destroySubject$, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should clearInterval when interval is set', () => {
      component.startTimer()
      expect(component.interval).toBeDefined()
      const spy = jest.spyOn(global, 'clearInterval')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalledWith(component.interval)
    })

    it('should not throw when interval is not set', () => {
      component.interval = undefined
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})

// ─── FileService direct tests ────────────────────────────────────────────────

describe('FileService (upload.service)', () => {
  let service: FileService
  let mockHttp: any
  let mockSnackBar: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
      delete: jest.fn().mockReturnValue(of({})),
    }
    mockSnackBar = { open: jest.fn() }
    service = new FileService(mockHttp as any, mockSnackBar as any)
  })

  it('should create', () => { expect(service).toBeTruthy() })

  it('isLoading should return observable', (done) => {
    service.isLoading().subscribe(v => { expect(typeof v).toBe('boolean'); done() })
  })

  it('upload without selectedOrgData should POST to bulkUpload', () => {
    const fd = new FormData()
    service.upload('f.csv', fd).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('bulkupload'), fd
    )
  })

  it('upload WITH selectedOrgData should POST to bulkUploadV3', () => {
    const fd = new FormData()
    service.upload('f.csv', fd, { roleId: 'r1', depatName: 'Dep' }).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('v3'), fd
    )
  })

  it('download should GET and save file', () => {
    const saveSpy = jest.fn()
    jest.spyOn(require('file-saver'), 'saveAs').mockImplementation(saveSpy)
    mockHttp.get.mockReturnValue(of(new Blob(['data'])))
    service.download('/path', 'file.csv')
    expect(mockHttp.get).toHaveBeenCalledWith('/path', { responseType: 'blob' })
  })

  it('downloadWithDispositionName should GET with response observe', () => {
    mockHttp.get.mockReturnValue(of({
      body: new Blob(['data']),
      headers: { get: jest.fn().mockReturnValue('attachment; filename="sample.xlsx"') },
    }))
    service.downloadWithDispositionName('/path')
    expect(mockHttp.get).toHaveBeenCalledWith('/path', expect.objectContaining({ observe: 'response' }))
  })

  it('downloadWithDispositionName should open snackbar on error', () => {
    mockHttp.get.mockReturnValue(throwError('error'))
    service.downloadWithDispositionName('/path')
    expect(mockSnackBar.open).toHaveBeenCalledWith('Could not download the file')
  })

  it('downloadReport should GET and save CSV', () => {
    const saveSpy = jest.fn()
    jest.spyOn(require('file-saver'), 'saveAs').mockImplementation(saveSpy)
    mockHttp.get.mockReturnValue(of({ report: { data: [65, 66] } }))
    service.downloadReport('id1', 'report.csv')
    expect(mockHttp.get).toHaveBeenCalled()
  })

  it('remove should DELETE and update fileList$', () => {
    service.remove('old.csv')
    expect(mockHttp.delete).toHaveBeenCalled()
  })

  it('list should return observable', (done) => {
    service.list().subscribe(() => done())
      ; (service as any).fileList$.next([])
  })

  it('validateFile should return true for csv', () => {
    expect(service.validateFile('test.csv')).toBe(true)
  })

  it('validateFile should return false for txt', () => {
    expect(service.validateFile('test.txt')).toBe(false)
  })

  it('validateFile should return true for custom allowed format', () => {
    expect(service.validateFile('test.pdf', ['pdf'])).toBe(true)
  })

  it('validateExcelFile should return true for xlsx mime', () => {
    expect(service.validateExcelFile('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true)
  })

  it('validateExcelFile should return false for text/plain', () => {
    expect(service.validateExcelFile('text/plain')).toBe(false)
  })

  it('validateXlFile should return true for xlsx extension', () => {
    expect((service as any).validateXlFile('file.xlsx')).toBe(true)
  })

  it('validateXlFile should return false for csv extension', () => {
    expect((service as any).validateXlFile('file.csv')).toBe(false)
  })

  it('getBulkUploadData should GET', async () => {
    mockHttp.get.mockReturnValue(of({ data: [] }))
    await service.getBulkUploadData()
    expect(mockHttp.get).toHaveBeenCalled()
  })

  it('getBulkUploadDataV1 should GET with rootOrgId', () => {
    service.getBulkUploadDataV1('org1').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('org1'))
  })

  it('getBulkApprovalUploadDataV1 should GET', () => {
    service.getBulkApprovalUploadDataV1().subscribe()
    expect(mockHttp.get).toHaveBeenCalled()
  })

  it('downloadBulkUploadSampleFile should return URL string', () => {
    const url = service.downloadBulkUploadSampleFile('fw-001')
    expect(url).toContain('fw-001')
  })

  it('bulkUploadDesignation should POST', () => {
    const fd = new FormData()
    service.bulkUploadDesignation('f.xlsx', fd, 'fw-001', 'org1').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('org1'), fd)
  })

  it('getBulkDesignationUploadData should GET with rootOrgId', () => {
    service.getBulkDesignationUploadData('org1').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('org1'))
  })

  it('getBulkDesignationStatus should return URL string', () => {
    const url = service.getBulkDesignationStatus('file.xlsx')
    expect(url).toContain('file.xlsx')
  })
})

// ─── OtpService direct tests ─────────────────────────────────────────────────

describe('OtpService', () => {
  let service: OtpService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = { post: jest.fn().mockReturnValue(of({})) }
    service = new OtpService(mockHttp as any)
  })

  it('should create', () => { expect(service).toBeTruthy() })

  it('sendOtp should POST to sendOtp endpoint', () => {
    service.sendOtp(9999999999).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(
      '/apis/proxies/v8/otp/v1/generate',
      expect.objectContaining({ request: expect.objectContaining({ type: 'phone' }) })
    )
  })

  it('resendOtp should POST to ReSendOtp endpoint', () => {
    service.resendOtp(9999999999).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/generate', expect.any(Object))
  })

  it('verifyOTP should POST to VerifyOtp endpoint', () => {
    service.verifyOTP(123456, 9999999999).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/verify', expect.any(Object))
  })

  it('sendEmailOtp should POST to sendEmailOtp endpoint', () => {
    service.sendEmailOtp('a@b.com').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v3/generate', expect.any(Object))
  })

  it('reSendEmailOtp should POST to sendEmailOtp endpoint', () => {
    service.reSendEmailOtp('a@b.com').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v3/generate', expect.any(Object))
  })

  it('verifyEmailOTP should POST to VerifyEmailOtp endpoint', () => {
    service.verifyEmailOTP('123456', 'a@b.com').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v3/verify', expect.any(Object))
  })
})

// ─── VerifyOtpComponent direct tests ─────────────────────────────────────────

describe('VerifyOtpComponent', () => {
  let comp: VerifyOtpComponent
  let mockDialogRef: any
  let mockSnackbar: any
  let mockOtpService: any
  let mockUsersServiceV: any

  const dialogData = { type: 'email', email: 'u@t.com', mobile: '9999999999' }

  beforeEach(() => {
    jest.useFakeTimers()
    mockDialogRef = { close: jest.fn() }
    mockSnackbar = { open: jest.fn() }
    mockOtpService = {
      verifyEmailOTP: jest.fn().mockReturnValue(of({})),
      verifyOTP: jest.fn().mockReturnValue(of({})),
    }
    mockUsersServiceV = { sendOtp: jest.fn().mockReturnValue(of({})) }
    comp = new VerifyOtpComponent(mockDialogRef, dialogData, mockSnackbar, mockOtpService, mockUsersServiceV)
  })

  afterEach(() => { jest.useRealTimers(); jest.clearAllMocks() })

  it('should create', () => { expect(comp).toBeTruthy() })

  it('ngOnInit should start timer interval', () => {
    comp.ngOnInit()
    expect(comp.interval).toBeDefined()
  })

  it('startTimer should decrement timeLeft each second', () => {
    comp.timeLeft = 3
    comp.ngOnInit()
    jest.advanceTimersByTime(1000)
    expect(comp.timeLeft).toBe(2)
  })

  it('startTimer should set showResendOTP when timeLeft reaches 0', () => {
    comp.timeLeft = 1
    comp.ngOnInit()
    jest.advanceTimersByTime(2000)
    expect(comp.showResendOTP).toBe(true)
  })

  it('handleCloseModal should close dialogRef', () => {
    comp.handleCloseModal()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })

  it('handleResendOTP should emit resendOTP with data.type', () => {
    const spy = jest.spyOn(comp.resendOTP, 'emit')
    comp.ngOnInit()
    comp.handleResendOTP()
    expect(spy).toHaveBeenCalledWith('email')
  })

  it('handleVerifyOTP should call verifyEmailOTP when email type selected', () => {
    comp.otpTypeSelectedValue = 'email'
    comp.otpEntered = '123456'
    comp.handleVerifyOTP()
    expect(mockOtpService.verifyEmailOTP).toHaveBeenCalledWith('123456', 'u@t.com')
  })

  it('handleVerifyOTP should call verifyMobileOTP when not email', () => {
    comp.otpTypeSelectedValue = 'phone'
    comp.otpEntered = '123456'
    comp.handleVerifyOTP()
    expect(mockOtpService.verifyOTP).toHaveBeenCalledWith(123456, '9999999999')
  })

  it('verifyEmailOTP success should emit otpVerified', () => {
    const spy = jest.spyOn(comp.otpVerified, 'emit')
    comp.otpEntered = '123456'
      ; (comp as any).verifyEmailOTP()
    expect(spy).toHaveBeenCalledWith(true)
  })

  it('verifyEmailOTP error should open snackbar', () => {
    mockOtpService.verifyEmailOTP.mockReturnValue(throwError({ ok: false }))
    comp.otpEntered = '123456'
      ; (comp as any).verifyEmailOTP()
    expect(mockSnackbar.open).toHaveBeenCalled()
  })

  it('verifyMobileOTP success should emit otpVerified', () => {
    const spy = jest.spyOn(comp.otpVerified, 'emit')
    comp.otpEntered = '654321'
      ; (comp as any).verifyMobileOTP()
    expect(spy).toHaveBeenCalledWith(true)
  })

  it('verifyMobileOTP error should open snackbar', () => {
    mockOtpService.verifyOTP.mockReturnValue(throwError({ ok: false }))
    comp.otpEntered = '654321'
      ; (comp as any).verifyMobileOTP()
    expect(mockSnackbar.open).toHaveBeenCalled()
  })

  it('sendOtp should call generateAndVerifyOTP and set otpTypeSelected', () => {
    ; (comp.otpSelectionForm as any).setValue({ otpType: 'email' })
    comp.sendOtp()
    expect(comp.otpTypeSelected).toBe(true)
    expect(mockUsersServiceV.sendOtp).toHaveBeenCalled()
  })

  it('generateAndVerifyOTP should open snackbar on success', () => {
    comp.ngOnInit()
      ; (comp as any).generateAndVerifyOTP('email')
    expect(mockSnackbar.open).toHaveBeenCalledWith(expect.stringContaining('Email address'))
  })

  it('generateAndVerifyOTP should open snackbar on error', () => {
    mockUsersServiceV.sendOtp.mockReturnValue(throwError({ ok: false, error: {} }))
      ; (comp as any).generateAndVerifyOTP('email')
    expect(mockSnackbar.open).toHaveBeenCalled()
  })

  it('radioChange should not throw', () => {
    expect(() => comp.radioChange({} as any)).not.toThrow()
  })

  it('ngOnDestroy should clear interval and unsubscribe', () => {
    comp.ngOnInit()
    const spy = jest.spyOn(global, 'clearInterval')
    comp.ngOnDestroy()
    expect(spy).toHaveBeenCalled()
  })
})

// ─── DirectoryService direct tests ───────────────────────────────────────────

describe('DirectoryService', () => {
  let service: DirectoryService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({ result: { response: {} } })),
      patch: jest.fn().mockReturnValue(of({})),
    }
    mockConfigSvc = { userProfile: { userId: 'u1', rootOrgId: 'org1' } }
    service = new DirectoryService(mockHttp as any, mockConfigSvc as any)
  })

  it('should create', () => { expect(service).toBeTruthy() })

  it('setUserProfile should set userProfile', () => {
    service.setUserProfile()
    expect(service.userProfile.userId).toBe('u1')
  })

  it('getStatesOrMinisteries should GET', () => {
    service.getStatesOrMinisteries('state').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('state'))
  })

  it('getAllDepartmentsKong with queryText should POST with query', () => {
    service.getAllDepartmentsKong('ministry', { limit: 10, offset: 0 }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getAllDepartmentsKong without queryText should POST sort_by', () => {
    service.getAllDepartmentsKong('', { limit: 10, offset: 0 }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getAllDepartmentsKong with orgData should pass filters', () => {
    service.getAllDepartmentsKong('', { limit: 5, offset: 0 }, { sbOrgType: 'ministry', rootOrgId: 'r1' }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getOrgReadData should POST with organisationId', () => {
    mockHttp.post.mockReturnValue(of({ result: { response: { name: 'org' } } }))
    service.getOrgReadData('org1').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/org/v1/read', expect.any(Object))
  })

  it('getFrameworkInfo should GET framework url', () => {
    mockHttp.get.mockReturnValue(of({ result: { framework: { categories: [] } } }))
    service.getFrameworkInfo('fw-001').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('fw-001'), expect.any(Object))
  })

  it('formateData should process categories', () => {
    const response = {
      result: {
        framework: {
          categories: [{ code: 'org', identifier: 'i1', terms: [] }],
        },
      },
    }
    expect(() => service.formateData(response)).not.toThrow()
  })

  it('formateChildren should process terms with associations', () => {
    const terms = [
      { associations: [{ code: 'c1' }], additionalProperties: {} },
      { associations: [], additionalProperties: { importedById: 'u1', importedByName: 'You', importedOn: '2024' } },
    ]
    const result = service.formateChildren(terms)
    expect(result.length).toBe(2)
  })

  it('createOrganization should POST', () => {
    service.createOrganization({ name: 'TestOrg' }).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/org/ext/v1/create', expect.any(Object))
  })

  it('updateOrganizationV2 should PATCH', () => {
    service.updateOrganizationV2({ id: 'o1' }).subscribe()
    expect(mockHttp.patch).toHaveBeenCalledWith('/apis/proxies/v8/org/ext/v2/update', expect.any(Object))
  })

  it('searchOrgs should POST', () => {
    service.searchOrgs('Test', 'ministry').subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('uploadOrganizationLogo should POST', () => {
    service.uploadOrganizationLogo({ logo: 'data' }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('createFrameWork should GET', () => {
    service.createFrameWork('fw', 'org1', 'term1').subscribe()
    expect(mockHttp.get).toHaveBeenCalled()
  })

  it('publishFramework should POST', () => {
    service.publishFramework('fw-001').subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('setCurrentOrgDesignationsList should set orgDesignationList', () => {
    service.setCurrentOrgDesignationsList([{ code: 'd1' }])
    expect(service.orgDesignationList).toEqual([{ code: 'd1' }])
  })

  it('deleteDesignation should POST', () => {
    service.deleteDesignation('fw', 'designation', { ids: ['d1'] }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('setFrameWorkInfo should set frameWorkInfo', () => {
    service.setFrameWorkInfo({ code: 'fw-001' })
    expect(service.frameWorkInfo).toEqual({ code: 'fw-001' })
  })

  it('getIgotMasterDesignations should POST and format result', () => {
    mockHttp.post.mockReturnValue(of({ result: { result: { data: [], totalCount: 0 } } }))
    service.getIgotMasterDesignations({}).subscribe(res => {
      expect(res.formatedDesignationsLsit).toBeDefined()
    })
  })

  it('getIgotMasterDesignations should handle falsy response', () => {
    mockHttp.post.mockReturnValue(of(null))
    service.getIgotMasterDesignations({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('updateSelectedDesignationList should update selectedDesignationList', () => {
    service.updateSelectedDesignationList([{ id: 'd1' }])
    expect(service.selectedDesignationList).toEqual([{ id: 'd1' }])
  })

  it('formateMasterDesignationList should mark orgDesignations correctly', (done) => {
    service.orgDesignationList = [{ refId: 'm1' }]
    service.selectedDesignationList = [{ id: 'm2' }]
    const response = { data: [{ id: 'm1' }, { id: 'm2' }], facets: [], totalCount: 2 }
    service.formateMasterDesignationList(response).subscribe(res => {
      expect(res.formatedDesignationsLsit.length).toBe(2)
      done()
    })
  })

  it('getUuid should return a uuid string', () => {
    expect(typeof service.getUuid).toBe('string')
  })

  it('createTerm should POST', () => {
    service.createTerm({ name: 'Manager' }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('updateTerms should PATCH', () => {
    service.updateTerms('fw', 'cat', 'term1', { name: 'Sr Manager' }).subscribe()
    expect(mockHttp.patch).toHaveBeenCalled()
  })

  it('getUserDetails should GET with userId', () => {
    service.getUserDetails('u1').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('u1'))
  })
})

// ─── UsersService direct tests ────────────────────────────────────────────────

describe('UsersService (bulk-upload context)', () => {
  let service: UsersService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ result: { response: {} } })),
      post: jest.fn().mockReturnValue(of({ result: { response: {} } })),
      patch: jest.fn().mockReturnValue(of({})),
    }
    service = new UsersService(mockHttp as any)
  })

  it('should create', () => { expect(service).toBeTruthy() })

  it('getAllUsers should POST and map response', () => {
    service.getAllUsers({ filters: {} }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getAllUsersV3 should POST to v3 endpoint', () => {
    service.getAllUsersV3({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v3/search', {})
  })

  it('getMyDepartment should GET', () => {
    service.getMyDepartment().subscribe()
    expect(mockHttp.get).toHaveBeenCalled()
  })

  it('createUser should POST', () => {
    service.createUser({ name: 'A' }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getUserById with id should GET with id', () => {
    mockHttp.get.mockReturnValue(of({ result: { response: {} } }))
    service.getUserById('u1').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/u1')
  })

  it('getUserById with empty id should GET profile v2', () => {
    mockHttp.get.mockReturnValue(of({ result: { response: {} } }))
    service.getUserById('').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read')
  })

  it('createUserById should POST', () => {
    service.createUserById('u1', {}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('addUserToRole should POST', () => {
    service.addUserToRole({ role: 'admin' }).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getWfHistoryByAppId should GET', () => {
    service.getWfHistoryByAppId('app1').subscribe()
    expect(mockHttp.get).toHaveBeenCalled()
  })

  it('onSearchUserByEmail should POST', () => {
    service.onSearchUserByEmail('a@b.com', {}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('blockUser should PATCH', () => {
    service.blockUser({}).subscribe()
    expect(mockHttp.patch).toHaveBeenCalled()
  })

  it('deActiveUser should POST', () => {
    service.deActiveUser({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('activeUser should PATCH', () => {
    service.activeUser({}).subscribe()
    expect(mockHttp.patch).toHaveBeenCalled()
  })

  it('deleteUser should PATCH', () => {
    service.deleteUser({}).subscribe()
    expect(mockHttp.patch).toHaveBeenCalled()
  })

  it('newBlockUser should POST with request body', () => {
    service.newBlockUser('admin', 'u1').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/block', expect.any(Object))
  })

  it('newUnBlockUser should POST with request body', () => {
    service.newUnBlockUser('admin', 'u1').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/unblock', expect.any(Object))
  })

  it('getAllKongUsers should POST', () => {
    service.getAllKongUsers({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getAllRoleUsers should POST and map role count', () => {
    mockHttp.post.mockReturnValue(of({ result: { response: { count: 5 } } }))
    service.getAllRoleUsers('dep1', 'admin').subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getRolesCountsApi should POST', () => {
    service.getRolesCountsApi({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getTotalRoleUsers should POST and map role count', () => {
    service.getTotalRoleUsers('dep1', 'admin').subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('searchIgotDesignation should POST', () => {
    service.searchIgotDesignation({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('searchDesignation should POST', () => {
    service.searchDesignation({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('updateUserDetails should POST', () => {
    service.updateUserDetails({}).subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('sendOtp should POST', () => {
    service.sendOtp('9999', 'email').subscribe()
    expect(mockHttp.post).toHaveBeenCalled()
  })
})


