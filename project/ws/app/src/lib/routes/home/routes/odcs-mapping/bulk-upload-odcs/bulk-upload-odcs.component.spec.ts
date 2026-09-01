import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { PageEvent } from '@angular/material/paginator'
import { BulkUploadOdcsComponent } from './bulk-upload-odcs.component'
import { FileProgressComponent } from '../../users-view/file-progress/file-progress.component'

describe('BulkUploadOdcsComponent', () => {
    let component: BulkUploadOdcsComponent
    let mockFileService: any
    let mockMatSnackBar: any
    let mockDialog: any
    let mockUsersService: any
    let mockActivatedRoute: any

    const uploadListContent = [
        {
            identifier: 'id-1', totalRecords: 100, fileName: 'fileA.csv',
            successfulRecordsCount: 80, failedRecordsCount: 20,
            dateCreatedOn: '2024-10-01T10:30:00.000Z', status: 'SUCCESS',
        },
        {
            identifier: 'id-2', totalRecords: 200, fileName: 'fileB.csv',
            successfulRecordsCount: 150, failedRecordsCount: 50,
            dateCreatedOn: '2024-10-02T10:30:00.000Z', status: 'WARNING',
        },
    ]

    const mockUserProfile = {
        email: 'test@example.com',
        mobile: '1234567890',
    }

    const configService = {
        userProfile: { rootOrgId: 'org-001' },
        userProfileV2: mockUserProfile,
        orgReadData: { frameworkid: 'fw-001' },
    }

    beforeEach(() => {
        jest.useFakeTimers()

        mockFileService = {
            validateExcelFile: jest.fn().mockReturnValue(false),
            getBulkCompetencyUploadData: jest.fn().mockReturnValue(of({ result: { content: uploadListContent } })),
            getBulkCompetencyStatus: jest.fn().mockReturnValue('/path/to/file'),
            downloadBulkUploadCompetencySampleFile: jest.fn().mockReturnValue('/path/to/sample'),
            downloadWithDispositionName: jest.fn(),
            bulkUploadCompetency: jest.fn(),
        }
        mockMatSnackBar = { open: jest.fn() }
        mockDialog = { open: jest.fn().mockReturnValue({ componentInstance: { resendOTP: of(), otpVerified: of() }, close: jest.fn() }) }
        mockUsersService = { sendOtp: jest.fn() }
        mockActivatedRoute = {
            data: of({
                pageData: { data: { bulkUploadConfig: { pageSize: 10, pageSizeOptions: [10, 20, 30] } } }
            }),
            snapshot: { data: { configService } }
        }

        component = new BulkUploadOdcsComponent(
            mockFileService, mockMatSnackBar, mockDialog, mockUsersService, mockActivatedRoute
        )
        component.userProfile = mockUserProfile
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should set rootOrgId from configService userProfile', () => {
        expect(component.rootOrgId).toBe('org-001')
    })

    it('should set bulkUploadFrameworkId from orgReadData', () => {
        expect(component.bulkUploadFrameworkId).toBe('fw-001')
    })

    describe('ngOnInit()', () => {
        it('should call getBulkStatusList on init', () => {
            jest.spyOn(component, 'getBulkStatusList')
            component.ngOnInit()
            expect(component.getBulkStatusList).toHaveBeenCalled()
        })

        it('should set bulkUploadConfig pageSize and sizeOptions', () => {
            component.ngOnInit()
            expect(component.pageSize).toBe(10)
            expect(component.sizeOptions).toEqual([10, 20, 30])
        })
    })

    describe('ngAfterViewInit()', () => {
        it('should set lastIndex to first sizeOption', () => {
            component.sizeOptions = [5, 10, 20]
            component.ngAfterViewInit()
            expect(component.lastIndex).toBe(5)
        })
    })

    describe('onChangePage()', () => {
        it('should update startIndex and lastIndex', () => {
            component.onChangePage({ pageIndex: 1, pageSize: 10, length: 100 } as PageEvent)
            expect(component.startIndex).toBe(10)
            expect(component.lastIndex).toBe(20)
        })
    })

    describe('handleChangePage()', () => {
        it('should update pageSize, startIndex, lastIndex', () => {
            component.handleChangePage({ pageIndex: 2, pageSize: 10, length: 100 } as PageEvent)
            expect(component.pageSize).toBe(10)
            expect(component.startIndex).toBe(20)
            expect(component.lastIndex).toBe(30)
        })
    })

    describe('getBulkStatusList()', () => {
        it('should set lastUploadList sorted by dateCreatedOn descending', () => {
            component.getBulkStatusList()
            expect(component.lastUploadList.length).toBe(2)
            // newer date should be first
            expect(new Date(component.lastUploadList[0].dateCreatedOn) >= new Date(component.lastUploadList[1].dateCreatedOn)).toBe(true)
        })

        it('should show snackbar on error', () => {
            mockFileService.getBulkCompetencyUploadData.mockReturnValue(throwError(new HttpErrorResponse({ status: 500 })))
            component.getBulkStatusList()
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to get Bulk status list')
        })
    })

    describe('showFileUploadProgress()', () => {
        it('should open FileProgressComponent dialog', () => {
            component.showFileUploadProgress()
            expect(mockDialog.open).toHaveBeenCalledWith(FileProgressComponent, {
                data: {}, disableClose: true, panelClass: 'progress-modal'
            })
        })
    })

    describe('handleDownloadFile()', () => {
        it('should get path and call downloadWithDispositionName', () => {
            component.handleDownloadFile({ fileName: 'fileA.csv' } as any)
            expect(mockFileService.getBulkCompetencyStatus).toHaveBeenCalledWith('fileA.csv')
            expect(mockFileService.downloadWithDispositionName).toHaveBeenCalledWith('/path/to/file')
        })
    })

    describe('handleDownloadSampleFile()', () => {
        it('should call downloadBulkUploadCompetencySampleFile and downloadWithDispositionName', () => {
            component.bulkUploadFrameworkId = 'fw-001'
            component.handleDownloadSampleFile()
            expect(mockFileService.downloadBulkUploadCompetencySampleFile).toHaveBeenCalledWith('fw-001')
            expect(mockFileService.downloadWithDispositionName).toHaveBeenCalledWith('/path/to/sample')
        })
    })

    describe('handleFileClick()', () => {
        it('should reset input value to empty string', () => {
            const event = { target: { value: 'old-value' } }
            component.handleFileClick(event)
            expect(event.target.value).toBe('')
        })
    })

    describe('generateAndVerifyOTP()', () => {
        it('should call sendOtp with email', () => {
            mockUsersService.sendOtp = jest.fn().mockReturnValue(of({}))
            component.userProfile = { email: 'a@b.com', mobile: '' }
            component.generateAndVerifyOTP('email')
            expect(mockUsersService.sendOtp).toHaveBeenCalledWith('a@b.com', 'email')
            expect(mockMatSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Email address'))
        })

        it('should call sendOtp with mobile', () => {
            mockUsersService.sendOtp = jest.fn().mockReturnValue(of({}))
            component.userProfile = { email: '', mobile: '9876543210' }
            component.generateAndVerifyOTP('phone')
            expect(mockUsersService.sendOtp).toHaveBeenCalledWith('9876543210', 'phone')
            expect(mockMatSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Mobile number'))
        })

        it('should show error message when OTP sending fails with errmsg', () => {
            const err = new HttpErrorResponse({ error: { params: { errmsg: 'Server error' } }, status: 500 })
            mockUsersService.sendOtp = jest.fn().mockReturnValue(throwError(err))
            component.generateAndVerifyOTP('email')
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Server error')
        })

        it('should show generic error message when no errmsg', () => {
            const err = new HttpErrorResponse({ error: {}, status: 500 })
            mockUsersService.sendOtp = jest.fn().mockReturnValue(throwError(err))
            component.generateAndVerifyOTP('email')
            expect(mockMatSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Unable to send OTP'))
        })

        it('should not open verify dialog when resendFlag is set', () => {
            mockUsersService.sendOtp = jest.fn().mockReturnValue(of({}))
            component.generateAndVerifyOTP('email', 'resend')
            // dialog.open should not be called for OTP dialog (only for FileProgress)
            expect(mockDialog.open).not.toHaveBeenCalled()
        })
    })

    describe('sendOTP()', () => {
        it('should call generateAndVerifyOTP with email type when email exists', () => {
            jest.spyOn(component, 'generateAndVerifyOTP').mockImplementation(jest.fn())
            component.userProfile = { email: 'a@b.com', mobile: '' }
            component.sendOTP()
            expect(component.generateAndVerifyOTP).toHaveBeenCalledWith('email')
        })

        it('should call generateAndVerifyOTP with phone type when email is empty', () => {
            jest.spyOn(component, 'generateAndVerifyOTP').mockImplementation(jest.fn())
            component.userProfile = { email: '', mobile: '9876' }
            component.sendOTP()
            expect(component.generateAndVerifyOTP).toHaveBeenCalledWith('phone')
        })
    })

    describe('handleOnFileChange()', () => {
        it('should set fileName and fileType from selected file', () => {
            mockFileService.validateExcelFile.mockReturnValue(false)
            const file = new File(['content'], 'upload.xlsx', { type: 'application/vnd.ms-excel' })
            component.handleOnFileChange([file])
            expect(component.fileName).toBe('upload.xlsx')
            expect(component.fileType).toBe('application/vnd.ms-excel')
        })

        it('should set showFileError=true when file type is invalid', () => {
            mockFileService.validateExcelFile.mockReturnValue(false)
            const file = new File(['content'], 'upload.txt', { type: 'text/plain' })
            component.handleOnFileChange([file])
            expect(component.showFileError).toBe(true)
        })

        it('should not throw when fileList is empty', () => {
            expect(() => component.handleOnFileChange([])).not.toThrow()
        })
    })

    describe('uploadCSVFile()', () => {
        it('should set showFileError=true when file type is invalid', () => {
            mockFileService.validateExcelFile.mockReturnValue(false)
            component.fileType = 'text/plain'
            component.uploadCSVFile()
            expect(component.showFileError).toBe(true)
        })

        it('should not upload when no file is selected', () => {
            mockFileService.validateExcelFile.mockReturnValue(true)
            component.fileSelected = null
            component.uploadCSVFile()
            expect(mockFileService.bulkUploadCompetency).not.toHaveBeenCalled()
        })

        it('should call bulkUploadCompetency and show success snackbar', () => {
            mockFileService.validateExcelFile.mockReturnValue(true)
            mockFileService.bulkUploadCompetency = jest.fn().mockReturnValue(of({}))
            mockFileService.getBulkCompetencyUploadData.mockReturnValue(of({ result: { content: [] } }))
            component.fileSelected = new File(['data'], 'test.xlsx', { type: 'application/vnd.ms-excel' })
            component.fileName = 'test.xlsx'
            component.fileUploadDialogInstance = { close: jest.fn() }
            component.uploadCSVFile()
            expect(mockFileService.bulkUploadCompetency).toHaveBeenCalled()
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('File uploaded successfully!')
        })

        it('should show error snackbar on upload failure', () => {
            mockFileService.validateExcelFile.mockReturnValue(true)
            mockFileService.bulkUploadCompetency = jest.fn().mockReturnValue(throwError(new HttpErrorResponse({ status: 500 })))
            component.fileSelected = new File(['data'], 'test.xlsx', { type: 'application/vnd.ms-excel' })
            component.fileName = 'test.xlsx'
            component.fileUploadDialogInstance = { close: jest.fn() }
            component.uploadCSVFile()
            expect(mockMatSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Uploading CSV file failed'))
        })
    })

    describe('startTimer()', () => {
        it('should set interval', () => {
            component.startTimer()
            expect(component.interval).toBeDefined()
        })

        it('should call getBulkStatusList after timeLeft seconds', () => {
            jest.spyOn(component, 'getBulkStatusList')
            component.timeLeft = 2
            component.startTimer()
            jest.advanceTimersByTime(3000)
            expect(component.getBulkStatusList).toHaveBeenCalled()
        })
    })

    describe('ngOnDestroy()', () => {
        it('should clear interval and unsubscribe', () => {
            component.interval = setInterval(() => { }, 1000)
            jest.spyOn(global, 'clearInterval')
            component.ngOnDestroy()
            expect(clearInterval).toHaveBeenCalled()
        })

        it('should not throw when no interval is set', () => {
            component.interval = undefined
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })
})
