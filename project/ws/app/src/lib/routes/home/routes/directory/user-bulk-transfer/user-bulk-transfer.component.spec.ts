// Mock transitive dependencies so they don't pollute coverage of this spec
jest.mock('../../../../users/services/upload.service', () => ({ FileService: jest.fn() }))
jest.mock('../../../../users/services/users.service', () => ({ UsersService: jest.fn() }))
jest.mock('../../../services/org-hierarchy.service', () => ({ OrgHierarchyService: jest.fn() }))
jest.mock('../../users-view/verify-otp/verify-otp.component', () => ({ VerifyOtpComponent: jest.fn() }))
jest.mock('../../users-view/file-progress/file-progress.component', () => ({ FileProgressComponent: jest.fn() }))

import { of, throwError, Subject } from 'rxjs'
import { UserBulkTransferComponent } from './user-bulk-transfer.component'

describe('UserBulkTransferComponent', () => {
  let component: UserBulkTransferComponent
  let mockFileService: any
  let mockMatSnackBar: any
  let mockRouter: any
  let mockDialog: any
  let mockUsersService: any
  let mockOrgHieService: any

  function createComponent(selectedOrgData: any = null) {
    mockFileService = {
      statusOfBulkUserTransfer: jest.fn().mockReturnValue(of({ result: { content: [] } })),
      validateFile: jest.fn().mockReturnValue(true),
      downloadSampleBulkUserTransferFile: jest.fn(),
      uploadBulkUserTransfer: jest.fn().mockReturnValue(of({ result: 'ok' })),
    }
    mockMatSnackBar = { open: jest.fn() }
    mockRouter = {
      snapshot: {
        parent: {
          data: {
            configService: {
              unMappedUser: { rootOrg: { rootOrgId: 'root-org-001' } },
              userProfileV2: { email: 'user@test.com', mobile: '9999999999' },
            },
          },
        },
        data: {
          configService: {
            userProfileV2: { email: 'user@test.com', mobile: '9999999999' },
          },
        },
      },
    }
    mockDialog = {
      open: jest.fn().mockReturnValue({
        close: jest.fn(),
        componentInstance: {
          resendOTP: new Subject(),
          otpVerified: new Subject(),
        },
      }),
    }
    mockUsersService = {
      sendOtp: jest.fn().mockReturnValue(of({ result: 'ok' })),
    }
    mockOrgHieService = {
      getOrgData: jest.fn().mockReturnValue({ rootOrgId: 'org-001', orgHierarchyFrameworkId: 'fw-001' }),
      getParentOrgData: jest.fn().mockReturnValue({
        orgHierarchyFrameworkStatus: 'completed',
        orgHierarchyFrameworkId: 'parent-fw-001',
      }),
    }
    component = new UserBulkTransferComponent(
      mockFileService,
      mockMatSnackBar,
      mockRouter,
      mockDialog,
      mockUsersService,
      mockOrgHieService
    )
    component.selectedOrgData = selectedOrgData
  }

  beforeEach(() => createComponent())
  afterEach(() => jest.clearAllMocks())

  // ─── creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have correct defaults', () => {
    expect(component.lastUploadList).toEqual([])
    expect(component.showFileError).toBe(false)
    expect(component.sizeOptions).toEqual([10, 20])
    expect(component.startIndex).toBe(0)
    expect(component.pageSize).toBe(10)
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should use router snapshot data for rootOrgId when selectedOrgData is null', () => {
      component.ngOnInit()
      expect(component.rootOrgId).toBe('root-org-001')
    })

    it('should use selectedOrgData.roleId for rootOrgId when selectedOrgData is set', () => {
      createComponent({ roleId: 'selected-org-001' })
      component.ngOnInit()
      expect(component.rootOrgId).toBe('selected-org-001')
    })

    it('should set userProfile from snapshot.parent.data when selectedOrgData is null', () => {
      component.ngOnInit()
      expect(component.userProfile).toEqual({ email: 'user@test.com', mobile: '9999999999' })
    })

    it('should set userProfile from snapshot.data when selectedOrgData is set', () => {
      createComponent({ roleId: 'org-001' })
      component.ngOnInit()
      expect(component.userProfile).toEqual({ email: 'user@test.com', mobile: '9999999999' })
    })

    it('should clone org data from orgHieService when selectedOrgData is set', () => {
      createComponent({ roleId: 'org-001' })
      component.ngOnInit()
      expect(mockOrgHieService.getOrgData).toHaveBeenCalled()
      expect(mockOrgHieService.getParentOrgData).toHaveBeenCalled()
      expect(component.completeOrgData).toEqual({ rootOrgId: 'org-001', orgHierarchyFrameworkId: 'fw-001' })
    })

    it('should not call getOrgData when selectedOrgData is null', () => {
      component.ngOnInit()
      expect(mockOrgHieService.getOrgData).not.toHaveBeenCalled()
    })

    it('should call getBulkStatusList', () => {
      const spy = jest.spyOn(component, 'getBulkStatusList')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── ngAfterViewInit ───────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('should set lastIndex to first sizeOption', () => {
      component.ngAfterViewInit()
      expect(component.lastIndex).toBe(10)
    })
  })

  // ─── onChangePage ──────────────────────────────────────────────────────────

  describe('onChangePage', () => {
    it('should update startIndex and lastIndex based on PageEvent', () => {
      component.onChangePage({ pageIndex: 1, pageSize: 20, length: 100 } as any)
      expect(component.startIndex).toBe(20)
      expect(component.lastIndex).toBe(40)
    })

    it('should set startIndex to 0 for first page', () => {
      component.onChangePage({ pageIndex: 0, pageSize: 10, length: 50 } as any)
      expect(component.startIndex).toBe(0)
      expect(component.lastIndex).toBe(10)
    })
  })

  // ─── getBulkStatusList ─────────────────────────────────────────────────────

  describe('getBulkStatusList', () => {
    it('should sort lastUploadList by dateCreatedOn descending', () => {
      mockFileService.statusOfBulkUserTransfer.mockReturnValue(of({
        result: {
          content: [
            { dateCreatedOn: '2024-01-10' },
            { dateCreatedOn: '2024-01-15' },
            { dateCreatedOn: '2024-01-05' },
          ],
        },
      }))
      component.getBulkStatusList()
      expect(component.lastUploadList[0].dateCreatedOn).toBe('2024-01-15')
      expect(component.lastUploadList[2].dateCreatedOn).toBe('2024-01-05')
    })

    it('should open snackbar on error', () => {
      mockFileService.statusOfBulkUserTransfer.mockReturnValue(
        throwError({ ok: false, status: 500 })
      )
      component.getBulkStatusList()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to get Bulk status list')
    })

    it('should not open snackbar when error.ok is true', () => {
      mockFileService.statusOfBulkUserTransfer.mockReturnValue(
        throwError({ ok: true })
      )
      component.getBulkStatusList()
      expect(mockMatSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ─── showFileUploadProgress ────────────────────────────────────────────────

  describe('showFileUploadProgress', () => {
    it('should open FileProgressComponent dialog', () => {
      component.showFileUploadProgress()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ disableClose: true, panelClass: 'progress-modal' })
      )
    })
  })

  // ─── handleDownloadFile ────────────────────────────────────────────────────

  describe('handleDownloadFile', () => {
    it('should call window.open with the correct file path', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation()
      component.handleDownloadFile({ fileName: 'report.xlsx' })
      expect(openSpy).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/v1/org-migration/bulk-upload/result/report.xlsx',
        '_blank'
      )
      openSpy.mockRestore()
    })
  })

  // ─── handleDownloadSampleFile ──────────────────────────────────────────────

  describe('handleDownloadSampleFile', () => {
    it('should call downloadSampleBulkUserTransferFile when framework is completed', () => {
      component.parentOrgData = {
        orgHierarchyFrameworkStatus: 'Completed',
        orgHierarchyFrameworkId: 'fw-001',
      }
      component.handleDownloadSampleFile()
      expect(mockFileService.downloadSampleBulkUserTransferFile).toHaveBeenCalledWith(
        'orgUserBulkTransferSample.xlsx',
        'fw-001'
      )
    })

    it('should open snackbar when framework status is not completed', () => {
      component.parentOrgData = { orgHierarchyFrameworkStatus: 'pending' }
      component.handleDownloadSampleFile()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Please complete the framework setup of parent organisation to download the sample file'
      )
    })

    it('should open snackbar when parentOrgData is undefined', () => {
      component.parentOrgData = undefined
      component.handleDownloadSampleFile()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Please complete the framework setup of parent organisation to download the sample file'
      )
    })
  })

  // ─── handleFileClick ───────────────────────────────────────────────────────

  describe('handleFileClick', () => {
    it('should reset the file input value', () => {
      const mockEvent = { target: { value: 'something' } }
      component.handleFileClick(mockEvent)
      expect(mockEvent.target.value).toBe('')
    })
  })

  // ─── sendOTP ───────────────────────────────────────────────────────────────

  describe('sendOTP', () => {
    it('should call generateAndVerifyOTP with email when userProfile has email', () => {
      component.userProfile = { email: 'user@test.com' }
      const spy = jest.spyOn(component, 'generateAndVerifyOTP')
      component.sendOTP()
      expect(spy).toHaveBeenCalledWith('email')
    })

    it('should call generateAndVerifyOTP with phone when userProfile has no email', () => {
      component.userProfile = { email: '', mobile: '9999999999' }
      const spy = jest.spyOn(component, 'generateAndVerifyOTP')
      component.sendOTP()
      expect(spy).toHaveBeenCalledWith('phone')
    })
  })

  // ─── generateAndVerifyOTP ──────────────────────────────────────────────────

  describe('generateAndVerifyOTP', () => {
    beforeEach(() => {
      component.userProfile = { email: 'user@test.com', mobile: '9999999999' }
    })

    it('should call sendOtp with email and open snackbar on success', () => {
      const verifyOTPSpy = jest.spyOn(component, 'verifyOTP').mockImplementation()
      component.generateAndVerifyOTP('email')
      expect(mockUsersService.sendOtp).toHaveBeenCalledWith('user@test.com', 'email')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('Email address')
      )
      expect(verifyOTPSpy).toHaveBeenCalledWith('email')
    })

    it('should call sendOtp with mobile and show mobile snackbar', () => {
      const verifyOTPSpy = jest.spyOn(component, 'verifyOTP').mockImplementation()
      component.generateAndVerifyOTP('phone')
      expect(mockUsersService.sendOtp).toHaveBeenCalledWith('9999999999', 'phone')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('Mobile number')
      )
      expect(verifyOTPSpy).toHaveBeenCalledWith('phone')
    })

    it('should NOT call verifyOTP when resendFlag is set', () => {
      const verifyOTPSpy = jest.spyOn(component, 'verifyOTP').mockImplementation()
      component.generateAndVerifyOTP('email', 'resend')
      expect(verifyOTPSpy).not.toHaveBeenCalled()
    })

    it('should show snackbar on sendOtp error with errmsg', () => {
      mockUsersService.sendOtp.mockReturnValue(
        throwError({ ok: false, error: { params: { errmsg: 'OTP send failed' } } })
      )
      component.generateAndVerifyOTP('email')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('OTP send failed')
    })

    it('should show fallback snackbar on sendOtp error without errmsg', () => {
      mockUsersService.sendOtp.mockReturnValue(throwError({ ok: false }))
      component.generateAndVerifyOTP('email')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('Unable to send OTP')
      )
    })

    it('should not show error snackbar when error.ok is true', () => {
      mockUsersService.sendOtp.mockReturnValue(throwError({ ok: true }))
      component.generateAndVerifyOTP('email')
      expect(mockMatSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ─── handleOnFileChange ────────────────────────────────────────────────────

  describe('handleOnFileChange', () => {
    it('should set fileName and fileSelected, and call sendOTP for valid xlsx file', () => {
      mockFileService.validateFile.mockReturnValue(true)
      const sendOTPSpy = jest.spyOn(component, 'sendOTP').mockImplementation()
      const mockFile = new File(['data'], 'transfer.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const event = { target: { files: [mockFile] } }
      component.handleOnFileChange(event)
      expect(component.fileName).toBe('transfer.xlsx')
      expect(component.fileSelected).toBe(mockFile)
      expect(sendOTPSpy).toHaveBeenCalled()
    })

    it('should set showFileError=true for invalid file type', () => {
      mockFileService.validateFile.mockReturnValue(false)
      const mockFile = new File(['data'], 'transfer.txt', { type: 'text/plain' })
      const event = { target: { files: [mockFile] } }
      component.handleOnFileChange(event)
      expect(component.showFileError).toBe(true)
    })

    it('should do nothing when fileList is empty', () => {
      const sendOTPSpy = jest.spyOn(component, 'sendOTP').mockImplementation()
      component.handleOnFileChange({ target: { files: [] } })
      expect(sendOTPSpy).not.toHaveBeenCalled()
    })

    it('should reset showFileError at the start', () => {
      component.showFileError = true
      mockFileService.validateFile.mockReturnValue(true)
      jest.spyOn(component, 'sendOTP').mockImplementation()
      const mockFile = new File(['data'], 'file.xlsx')
      component.handleOnFileChange({ target: { files: [mockFile] } })
      expect(component.showFileError).toBe(false)
    })
  })

  // ─── verifyOTP ─────────────────────────────────────────────────────────────

  describe('verifyOTP', () => {
    beforeEach(() => {
      component.userProfile = { email: 'user@test.com', mobile: '9999999999' }
    })

    it('should open VerifyOtpComponent dialog', () => {
      component.verifyOTP('email')
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: { type: 'email', email: 'user@test.com', mobile: '9999999999' },
          disableClose: true,
        })
      )
    })

    it('should call generateAndVerifyOTP with resend flag on resendOTP event', () => {
      const genSpy = jest.spyOn(component, 'generateAndVerifyOTP').mockImplementation()
      const dialogRef = { componentInstance: { resendOTP: new Subject(), otpVerified: new Subject() } }
      mockDialog.open.mockReturnValue(dialogRef)
      component.verifyOTP('email')
      dialogRef.componentInstance.resendOTP.next('phone')
      expect(genSpy).toHaveBeenCalledWith('phone', 'resend')
    })

    it('should call showFileUploadProgress and uploadCSVFile on otpVerified', () => {
      const showSpy = jest.spyOn(component, 'showFileUploadProgress').mockImplementation()
      const uploadSpy = jest.spyOn(component, 'uploadCSVFile').mockImplementation()
      const dialogRef = { componentInstance: { resendOTP: new Subject(), otpVerified: new Subject() } }
      mockDialog.open.mockReturnValue(dialogRef)
      component.verifyOTP('email')
      dialogRef.componentInstance.otpVerified.next(true)
      expect(showSpy).toHaveBeenCalled()
      expect(uploadSpy).toHaveBeenCalled()
    })
  })

  // ─── uploadCSVFile ─────────────────────────────────────────────────────────

  describe('uploadCSVFile', () => {
    beforeEach(() => {
      component.fileName = 'transfer.xlsx'
      component.fileSelected = new File(['data'], 'transfer.xlsx')
      component.fileUploadDialogInstance = { close: jest.fn() }
      component.completeOrgData = { rootOrgId: 'org-001' }
      component.parentOrgData = { orgHierarchyFrameworkId: 'fw-001' }
    })

    it('should upload file and show success snackbar', () => {
      mockFileService.validateFile.mockReturnValue(true)
      mockFileService.uploadBulkUserTransfer.mockReturnValue(of({ result: 'ok' }))
      const getBulkSpy = jest.spyOn(component, 'getBulkStatusList').mockImplementation()
      component.uploadCSVFile()
      expect(mockFileService.uploadBulkUserTransfer).toHaveBeenCalled()
      expect(component.fileUploadDialogInstance.close).toHaveBeenCalled()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('File uploaded successfully!')
      expect(component.fileName).toBe('')
      expect(component.fileSelected).toBe('')
      expect(getBulkSpy).toHaveBeenCalled()
    })

    it('should show snackbar on upload error', () => {
      mockFileService.validateFile.mockReturnValue(true)
      mockFileService.uploadBulkUserTransfer.mockReturnValue(
        throwError({ ok: false })
      )
      component.uploadCSVFile()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Uploading CSV file failed due to some error, please try again later!'
      )
    })

    it('should set showFileError=true when validateFile returns false', () => {
      mockFileService.validateFile.mockReturnValue(false)
      component.uploadCSVFile()
      expect(component.showFileError).toBe(true)
      expect(mockFileService.uploadBulkUserTransfer).not.toHaveBeenCalled()
    })

    it('should not call uploadBulkUserTransfer when fileSelected is falsy', () => {
      mockFileService.validateFile.mockReturnValue(true)
      component.fileSelected = null
      component.uploadCSVFile()
      expect(mockFileService.uploadBulkUserTransfer).not.toHaveBeenCalled()
    })

    it('should pass empty string as parentOrgData when parentOrgData is null', () => {
      mockFileService.validateFile.mockReturnValue(true)
      mockFileService.uploadBulkUserTransfer.mockReturnValue(of({ result: 'ok' }))
      component.parentOrgData = null
      component.fileUploadDialogInstance = { close: jest.fn() }
      component.uploadCSVFile()
      expect(mockFileService.uploadBulkUserTransfer).toHaveBeenCalledWith(
        expect.any(FormData),
        component.completeOrgData,
        ''
      )
    })
  })

  // ─── handleChangePage ──────────────────────────────────────────────────────

  describe('handleChangePage', () => {
    it('should update pageSize, startIndex, and lastIndex', () => {
      component.handleChangePage({ pageIndex: 2, pageSize: 20, length: 200 } as any)
      expect(component.pageSize).toBe(20)
      expect(component.startIndex).toBe(40)
      expect(component.lastIndex).toBe(60)
    })
  })

  // ─── uploadWithOtp ─────────────────────────────────────────────────────────

  describe('uploadWithOtp', () => {
    it('should call showFileUploadProgress and uploadCSVFile', () => {
      const showSpy = jest.spyOn(component, 'showFileUploadProgress').mockImplementation()
      const uploadSpy = jest.spyOn(component, 'uploadCSVFile').mockImplementation()
      component.uploadWithOtp()
      expect(showSpy).toHaveBeenCalled()
      expect(uploadSpy).toHaveBeenCalled()
    })
  })

  // ─── ngOnDestroy ───────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe destroySubject$', () => {
      const spy = jest.spyOn((component as any).destroySubject$, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })
  })
})

