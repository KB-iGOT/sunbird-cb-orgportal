import { of, throwError, Subject } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { BulkUploadApprovalComponent } from './bulk-upload.component'

// Mock dependencies
const mockFileService = {
    getBulkApprovalUploadDataV1: jest.fn(),
    download: jest.fn(),
    validateFile: jest.fn(),
    uploadApproval: jest.fn()
}

const mockMatSnackBar = {
    open: jest.fn()
}

const mockActivatedRoute = {
    snapshot: {
        parent: {
            data: {
                configService: {
                    unMappedUser: {
                        rootOrg: {
                            rootOrgId: 'test-root-org-id'
                        }
                    },
                    userProfileV2: {
                        email: 'test@example.com',
                        mobile: '+1234567890'
                    }
                }
            }
        }
    },
    data: of({
        pageData: {
            data: {
                downloadSampleFilePath: '/sample/path',
                downloadAsFileName: 'sample.csv'
            }
        }
    })
}

const mockMatDialog = {
    open: jest.fn().mockReturnValue({
        componentInstance: {
            resendOTP: new Subject(),
            otpVerified: new Subject()
        },
        close: jest.fn()
    })
}

const mockUsersService = {
    sendOtp: jest.fn()
}

describe('BulkUploadApprovalComponent', () => {
    let component: BulkUploadApprovalComponent

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Set up default mock returns before component creation
        mockFileService.getBulkApprovalUploadDataV1.mockReturnValue(of({ result: { content: [] } }))
        mockUsersService.sendOtp.mockReturnValue(of({}))
        mockFileService.validateFile.mockReturnValue(true)
        mockFileService.uploadApproval.mockReturnValue(of({}))

        // Create component instance with mocked dependencies
        component = new BulkUploadApprovalComponent(
            mockFileService as any,
            mockMatSnackBar as any,
            mockActivatedRoute as any,
            mockMatDialog as any,
            mockUsersService as any
        )

        // Initialize component properties that would normally be set by Angular
        component.ngOnInit()
    })

    afterEach(() => {
        component.ngOnDestroy()
    })

    describe('Component Initialization', () => {
        it('should create component instance', () => {
            expect(component).toBeDefined()
        })

        it('should initialize with default values', () => {
            expect(component.lastUploadList).toEqual([])
            expect(component.sizeOptions).toEqual([10, 20])
            expect(component.startIndex).toBe(0)
            expect(component.pageSize).toBe(10)
            expect(component.showFileError).toBe(false)
        })

        it('should set rootOrgId and userProfile from route data', () => {
            expect(component.rootOrgId).toBe('test-root-org-id')
            expect(component.userProfile.email).toBe('test@example.com')
            expect(component.userProfile.mobile).toBe('+1234567890')
        })

        it('should set download paths from route data', () => {
            expect(component.downloadSampleFilePath).toBe('/sample/path')
            expect(component.downloadAsFileName).toBe('sample.csv')
        })
    })

    describe('ngAfterViewInit', () => {
        it('should set lastIndex to first size option', () => {
            component.ngAfterViewInit()
            expect(component.lastIndex).toBe(10)
        })
    })

    describe('getBulkStatusList', () => {
        const mockApiResponse = {
            result: {
                content: [
                    { id: 1, datecreatedon: '2023-01-02', filename: 'file1.csv' },
                    { id: 2, datecreatedon: '2023-01-01', filename: 'file2.csv' }
                ]
            }
        }

        it('should fetch and sort bulk status list by date descending', () => {
            // Reset the mock to return our test data
            mockFileService.getBulkApprovalUploadDataV1.mockReturnValue(of(mockApiResponse))

            component.getBulkStatusList()

            expect(mockFileService.getBulkApprovalUploadDataV1).toHaveBeenCalled()
            expect(component.lastUploadList).toHaveLength(2)
            expect(component.lastUploadList[0].datecreatedon).toBe('2023-01-02')
            expect(component.lastUploadList[1].datecreatedon).toBe('2023-01-01')
        })

        it('should handle error when fetching bulk status list fails', () => {
            const errorResponse: any = new HttpErrorResponse({ status: 500, error: 'Server Error' })
            errorResponse.ok = false
            mockFileService.getBulkApprovalUploadDataV1.mockReturnValue(throwError(errorResponse))

            component.getBulkStatusList()

            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to get Bulk status list')
        })
    })

    describe('onChangePage', () => {
        it('should update pagination indices', () => {
            const pageEvent = { pageIndex: 2, pageSize: 10 }

            component.onChangePage(pageEvent as any)

            expect(component.startIndex).toBe(20)
            expect(component.lastIndex).toBe(30)
        })
    })

    describe('handleChangePage', () => {
        it('should update page size and indices', () => {
            const pageEvent = { pageIndex: 1, pageSize: 20 }

            component.handleChangePage(pageEvent as any)

            expect(component.pageSize).toBe(20)
            expect(component.startIndex).toBe(20)
            expect(component.lastIndex).toBe(40)
        })
    })

    describe('showFileUploadProgress', () => {
        it('should open file progress dialog', () => {
            component.showFileUploadProgress()

            expect(mockMatDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {},
                disableClose: true,
                panelClass: 'progress-modal'
            })
        })
    })

    describe('handleDownloadFile', () => {
        it('should open download URL in new window', () => {
            const mockOpen = jest.fn()
            Object.defineProperty(window, 'open', { value: mockOpen, writable: true })

            const listObj = { filename: 'test-file.csv' }
            component.handleDownloadFile(listObj)

            expect(mockOpen).toHaveBeenCalledWith(
                '/apis/proxies/v8/workflow/admin/bulkuploadfile/download/test-file.csv',
                '_blank'
            )
        })
    })

    describe('handleDownloadSampleFile', () => {
        it('should call file service download with correct parameters', () => {
            component.handleDownloadSampleFile()

            expect(mockFileService.download).toHaveBeenCalledWith('/sample/path', 'sample.csv')
        })
    })

    describe('handleFileClick', () => {
        it('should clear file input value', () => {
            const mockEvent = { target: { value: 'some-file.csv' } }

            component.handleFileClick(mockEvent)

            expect(mockEvent.target.value).toBe('')
        })
    })

    describe('sendOTP', () => {
        it('should generate OTP for email when user has email', () => {
            const spy = jest.spyOn(component, 'generateAndVerifyOTP')

            component.sendOTP()

            expect(spy).toHaveBeenCalledWith('email')
        })

        it('should generate OTP for phone when user has no email', () => {
            component.userProfile.email = null
            const spy = jest.spyOn(component, 'generateAndVerifyOTP')

            component.sendOTP()

            expect(spy).toHaveBeenCalledWith('phone')
        })
    })

    describe('generateAndVerifyOTP', () => {
        it('should send OTP to email and show success message', () => {
            mockUsersService.sendOtp.mockReturnValue(of({}))
            const spy = jest.spyOn(component, 'verifyOTP')

            component.generateAndVerifyOTP('email')

            expect(mockUsersService.sendOtp).toHaveBeenCalledWith('test@example.com', 'email')
            expect(mockMatSnackBar.open).toHaveBeenCalledWith(
                "An OTP has been sent to your Email address, (Valid for 15 min's)"
            )
            expect(spy).toHaveBeenCalledWith('email')
        })

        it('should send OTP to phone and show success message', () => {
            mockUsersService.sendOtp.mockReturnValue(of({}))
            const spy = jest.spyOn(component, 'verifyOTP')

            component.generateAndVerifyOTP('phone')

            expect(mockUsersService.sendOtp).toHaveBeenCalledWith('+1234567890', 'phone')
            expect(mockMatSnackBar.open).toHaveBeenCalledWith(
                "An OTP has been sent to your Mobile number, (Valid for 15 min's)"
            )
            expect(spy).toHaveBeenCalledWith('phone')
        })

        it('should not call verifyOTP when resendFlag is provided', () => {
            mockUsersService.sendOtp.mockReturnValue(of({}))
            const spy = jest.spyOn(component, 'verifyOTP')

            component.generateAndVerifyOTP('email', 'resend')

            expect(spy).not.toHaveBeenCalled()
        })

        it('should handle OTP send error', () => {
            const errorResponse: any = new HttpErrorResponse({
                status: 400,
                error: { params: { errmsg: 'Invalid email' } }
            })
            errorResponse.ok = false
            mockUsersService.sendOtp.mockReturnValue(throwError(errorResponse))

            component.generateAndVerifyOTP('email')

            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Invalid email')
        })

        it('should show default error message when error message is not available', () => {
            const errorResponse: any = new HttpErrorResponse({ status: 500 })
            errorResponse.ok = false
            mockUsersService.sendOtp.mockReturnValue(throwError(errorResponse))

            component.generateAndVerifyOTP('phone')

            expect(mockMatSnackBar.open).toHaveBeenCalledWith(
                'Unable to send OTP to your phone, please try again later!'
            )
        })
    })

    describe('handleOnFileChange', () => {
        const createMockEvent = (files: File[]) => ({
            target: { files } as unknown as HTMLInputElement
        })

        const createMockFile = (name: string): File => ({
            name,
            size: 1024,
            type: 'text/csv'
        } as File)

        it('should handle valid file selection', () => {
            const mockFile = createMockFile('test.csv')
            const mockEvent = createMockEvent([mockFile])
            mockFileService.validateFile.mockReturnValue(true)
            const spy = jest.spyOn(component, 'verifyOTP')

            component.handleOnFileChange(mockEvent)

            expect(component.showFileError).toBe(false)
            expect(component.fileName).toBe('test.csv')
            expect(component.fileSelected).toBe(mockFile)
            expect(spy).toHaveBeenCalledWith('email')
        })

        it('should show error for invalid file', () => {
            const mockFile = createMockFile('test.txt')
            const mockEvent = createMockEvent([mockFile])
            mockFileService.validateFile.mockReturnValue(false)

            component.handleOnFileChange(mockEvent)

            expect(component.showFileError).toBe(true)
        })

        it('should handle empty file list', () => {
            const mockEvent = createMockEvent([])

            component.handleOnFileChange(mockEvent)

            expect(component.fileName).toBeUndefined()
            expect(component.fileSelected).toBeUndefined()
        })
    })

    describe('verifyOTP', () => {
        let mockDialogRef: any

        beforeEach(() => {
            mockDialogRef = {
                componentInstance: {
                    resendOTP: new Subject(),
                    otpVerified: new Subject()
                }
            }
            mockMatDialog.open.mockReturnValue(mockDialogRef)
        })

        it('should open OTP verification dialog with email data', () => {
            component.verifyOTP('email')

            expect(mockMatDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                data: {
                    type: 'email',
                    email: 'test@example.com',
                    mobile: '+1234567890'
                },
                disableClose: false,
                panelClass: 'common-modal'
            })
        })

        it('should handle resend OTP event', () => {
            const spy = jest.spyOn(component, 'generateAndVerifyOTP')
            component.verifyOTP('email')

            mockDialogRef.componentInstance.resendOTP.next('email')

            expect(spy).toHaveBeenCalledWith('email', 'resend')
        })

        it('should handle OTP verified event', () => {
            const showProgressSpy = jest.spyOn(component, 'showFileUploadProgress')
            const uploadSpy = jest.spyOn(component, 'uploadCSVFile')
            component.verifyOTP('email')

            mockDialogRef.componentInstance.otpVerified.next(true)

            expect(showProgressSpy).toHaveBeenCalled()
            expect(uploadSpy).toHaveBeenCalled()
        })
    })

    describe('uploadCSVFile', () => {
        beforeEach(() => {
            component.fileName = 'test.csv'
            component.fileSelected = new File(['content'], 'test.csv', { type: 'text/csv' })
            component.fileUploadDialogInstance = { close: jest.fn() }
        })

        it('should upload valid CSV file successfully', () => {
            mockFileService.validateFile.mockReturnValue(true)
            mockFileService.uploadApproval.mockReturnValue(of({}))
            const spy = jest.spyOn(component, 'getBulkStatusList')

            component.uploadCSVFile()

            expect(mockFileService.uploadApproval).toHaveBeenCalledWith(
                'test.csv',
                expect.any(FormData)
            )
            expect(component.fileUploadDialogInstance.close).toHaveBeenCalled()
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('File uploaded successfully!')
            expect(component.fileName).toBe('')
            expect(component.fileSelected).toBe('')
            expect(spy).toHaveBeenCalled()
        })

        it('should handle upload error', () => {
            mockFileService.validateFile.mockReturnValue(true)
            const errorResponse: any = new HttpErrorResponse({ status: 500 })
            errorResponse.ok = false
            mockFileService.uploadApproval.mockReturnValue(throwError(errorResponse))

            component.uploadCSVFile()

            expect(mockMatSnackBar.open).toHaveBeenCalledWith(
                'Uploading CSV file failed due to some error, please try again later!'
            )
        })

        it('should show error for invalid file', () => {
            mockFileService.validateFile.mockReturnValue(false)

            component.uploadCSVFile()

            expect(component.showFileError).toBe(true)
            expect(mockFileService.uploadApproval).not.toHaveBeenCalled()
        })

        it('should handle case when no file is selected', () => {
            component.fileSelected = null
            mockFileService.validateFile.mockReturnValue(true)

            component.uploadCSVFile()

            expect(mockFileService.uploadApproval).not.toHaveBeenCalled()
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from destroy subject', () => {
            const spy = jest.spyOn(component['destroySubject$'], 'unsubscribe')

            component.ngOnDestroy()

            expect(spy).toHaveBeenCalled()
        })
    })
})