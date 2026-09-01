import { UsersUploadComponent } from './users-upload.component'
import { of, throwError } from 'rxjs'

describe('UsersUploadComponent', () => {
    let component: UsersUploadComponent
    let mockFileService: any
    let mockSnackBar: any
    let mockRoute: any
    let mockDatePipe: any
    let mockUsersService: any
    let mockFormBuilder: any
    let mockElementRef: any

    beforeEach(() => {
        // Mock dependencies
        mockFileService = {
            isLoading: jest.fn().mockReturnValue(of(false)),
            validateFile: jest.fn(),
            upload: jest.fn(),
            getBulkUploadDataV1: jest.fn().mockReturnValue(of({ result: { content: [] } })),
            download: jest.fn(),
            downloadReport: jest.fn()
        }

        mockSnackBar = {
            open: jest.fn()
        }

        mockRoute = {
            data: of({ pageData: { data: { downloadSampleFilePath: 'path', downloadAsFileName: 'file.csv' } } }),
            snapshot: {
                parent: {
                    data: {
                        configService: {
                            unMappedUser: {
                                rootOrg: {
                                    rootOrgId: 'rootOrgId'
                                }
                            },
                            userProfileV2: {
                                email: 'test@example.com',
                                mobile: '1234567890'
                            },
                            userRoles: new Set(['admin'])
                        }
                    }
                }
            }
        }

        mockDatePipe = {
            transform: jest.fn()
        }

        mockUsersService = {
            sendOtp: jest.fn(),
            resendOtp: jest.fn(),
            verifyOTP: jest.fn()
        }

        mockFormBuilder = {
            group: jest.fn().mockReturnValue({
                patchValue: jest.fn(),
                reset: jest.fn(),
                get: jest.fn().mockReturnValue({
                    setValue: jest.fn(),
                    valueChanges: of('test')
                }),
                controls: {
                    file: {
                        setValue: jest.fn()
                    }
                }
            })
        }

        mockElementRef = {
            nativeElement: {
                value: 'Error message'
            }
        }

        // Create component instance
        component = new UsersUploadComponent(
            mockFormBuilder as any,
            mockFileService as any,
            mockSnackBar as any,
            mockRoute as any,
            mockDatePipe as any,
            mockUsersService as any
        )

        // Set up required view children
        component.toastSuccess = mockElementRef
        component.toastError = mockElementRef
        component.paginator = {
            pageIndex: 0,
            pageSize: 10
        } as any
        component.sort = {
            active: 'dateCreatedOn',
            start: 'desc'
        } as any
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should initialize component properties', () => {
            // Spy on the getBulkUploadData method
            jest.spyOn(component, 'getBulkUploadData')

            // Call ngOnInit
            component.ngOnInit()

            // Expectations
            expect(component.getBulkUploadData).toHaveBeenCalled()
            expect(component.userEmail).toBe('test@example.com')
            expect(component.userMobile).toBe('1234567890')
            expect(component.displayLoader).toBeDefined()
            expect(component.contactUsUrl).toBeDefined()
            expect(component.tabledata).toBeDefined()
        })
    })

    describe('onFileChange', () => {
        it('should update file selection when a file is selected', () => {
            // Create a mock event
            const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' })
            const mockEvent = {
                target: {
                    files: [mockFile]
                }
            }

            // Call onFileChange
            component.onFileChange(mockEvent)

            // Expectations
            expect(component.showFileError).toBe(false)
            expect(component.fileName).toBe('test.csv')
            expect(component.fileSelected).toBe(mockFile)
        })
    })

    describe('cancelSelected', () => {
        it('should reset file selection', () => {
            // Setup
            component.fileName = 'test.csv'
            component.fileSelected = 'file-content'

            // Call cancelSelected
            component.cancelSelected()

            // Expectations
            expect(component.fileName).toBe('')
            expect(component.fileSelected).toBe('')
        })
    })

    describe('getBulkUploadData', () => {
        it('should fetch bulk upload data and update data source', () => {
            // Mock response
            const mockResponse = {
                result: {
                    content: [
                        {
                            fileName: 'test.csv',
                            status: 'PROCESSED',
                            failedRecordsCount: 5,
                            successfulRecordsCount: 95,
                            totalRecords: 100,
                            dateCreatedOn: '2023-01-01',
                            dateUpdatedOn: '2023-01-02'
                        }
                    ]
                }
            }

            mockFileService.getBulkUploadDataV1.mockReturnValue(of(mockResponse))

            // Call getBulkUploadData
            component.getBulkUploadData()

            // Expectations
            expect(component.fetching).toBe(false)
            expect(component.bulkUploadData).toEqual(mockResponse.result.content)
            expect(component.tableList.length).toBe(1)
            expect(component.tableList[0].fileName).toBe('test.csv')
        })
    })

    describe('onSubmit', () => {
        it('should upload file when valid', () => {
            // Setup
            component.fileName = 'test.csv'
            component.fileSelected = new File(['content'], 'test.csv', { type: 'text/csv' })
            mockFileService.validateFile.mockReturnValue(true)
            mockFileService.upload.mockReturnValue(of({ success: true }))

            // Mock form
            const mockForm = { file: { value: 'test.csv' } }

            // Spy on methods
            // jest.spyOn(component, 'openSnackbar')
            jest.spyOn(component, 'resetOTPFields')
            jest.spyOn(component, 'getBulkUploadData')

            // Call onSubmit
            component.onSubmit(mockForm)

            // Expectations
            expect(mockFileService.validateFile).toHaveBeenCalledWith('test.csv')
            expect(mockFileService.upload).toHaveBeenCalled()
            // expect(component.openSnackbar).toHaveBeenCalledWith('File uploaded successfully!')
            expect(component.resetOTPFields).toHaveBeenCalled()
            expect(component.getBulkUploadData).toHaveBeenCalled()
        })

        it('should show error when file is invalid', () => {
            // Setup
            component.fileName = 'test.txt'
            mockFileService.validateFile.mockReturnValue(false)

            // Spy on methods
            // jest.spyOn(component, 'openSnackbar')

            // Call onSubmit
            component.onSubmit({})

            // Expectations
            expect(component.showFileError).toBe(true)
            // expect(component.openSnackbar).toHaveBeenCalledWith('Error message')
        })

        it('should handle upload error', () => {
            // Setup
            component.fileName = 'test.csv'
            component.fileSelected = new File(['content'], 'test.csv', { type: 'text/csv' })
            mockFileService.validateFile.mockReturnValue(true)
            mockFileService.upload.mockReturnValue(throwError({ error: 'Upload failed' }))

            // Spy on methods
            // jest.spyOn(component, 'openSnackbar')

            // Call onSubmit
            component.onSubmit({})

            // Expectations
            // expect(component.openSnackbar).toHaveBeenCalledWith('Error message')
        })
    })

    describe('downloadFile', () => {
        it('should call fileService.download with correct parameters', () => {
            // Setup
            component.downloadSampleFilePath = 'path/to/file'
            component.downloadAsFileName = 'sample.csv'

            // Call downloadFile
            component.downloadFile()

            // Expectations
            expect(mockFileService.download).toHaveBeenCalledWith('path/to/file', 'sample.csv')
        })
    })

    describe('OTP related functions', () => {
        describe('sendOtp', () => {
            it('should send OTP to mobile number', () => {
                // Setup
                component.userMobile = '1234567890'
                mockUsersService.sendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

                // Spy on methods
                jest.spyOn(component, 'startCountDown')
                jest.spyOn(window, 'alert').mockImplementation(() => { })

                // Call sendOtp
                component.sendOtp()

                // Expectations
                expect(mockUsersService.sendOtp).toHaveBeenCalledWith('1234567890', 'phone')
                expect(component.otpSend).toBe(true)
                expect(component.startCountDown).toHaveBeenCalled()
                expect(window.alert).toHaveBeenCalled()
            })

            it('should handle error when sending OTP', () => {
                // Setup
                component.userMobile = '1234567890'
                mockUsersService.sendOtp.mockReturnValue(throwError({ error: { params: { errmsg: 'Error sending OTP' } } }))

                // Call sendOtp
                component.sendOtp()

                // Expectations
                expect(mockSnackBar.open).toHaveBeenCalledWith('Error sending OTP')
            })
        })

        describe('verifyOtp', () => {
            it('should verify OTP successfully', () => {
                // Setup
                component.userMobile = '1234567890'
                mockUsersService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

                // Create mock OTP input
                const mockOtp = { value: '1234' }

                // Call verifyOtp
                component.verifyOtp(mockOtp)

                // Expectations
                expect(mockUsersService.verifyOTP).toHaveBeenCalledWith('1234', '1234567890', 'phone')
                expect(component.otpVerified).toBe(true)
                expect(component.isMobileVerified).toBe(true)
                expect(component.disableBtn).toBe(false)
            })

            it('should handle invalid OTP', () => {
                // Setup
                const mockOtp = { value: '123' }

                // Call verifyOtp
                component.verifyOtp(mockOtp)

                // Expectations
                expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid OTP.')
            })

            it('should handle verification error', () => {
                // Setup
                component.userMobile = '1234567890'
                mockUsersService.verifyOTP.mockReturnValue(throwError({
                    error: {
                        params: { errmsg: 'Invalid OTP' },
                        result: { remainingAttempt: 0 }
                    }
                }))

                // Create mock OTP input
                const mockOtp = { value: '1234' }

                // Call verifyOtp
                component.verifyOtp(mockOtp)

                // Expectations
                expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP')
                expect(component.disableVerifyBtn).toBe(true)
            })
        })

        describe('sendOtpEmail', () => {
            it('should send OTP to email', () => {
                // Setup
                component.userEmail = 'test@example.com'
                mockUsersService.sendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

                // Spy on methods
                jest.spyOn(component, 'startCountDownEmail')
                jest.spyOn(window, 'alert').mockImplementation(() => { })

                // Call sendOtpEmail
                component.sendOtpEmail()

                // Expectations
                expect(mockUsersService.sendOtp).toHaveBeenCalledWith('test@example.com', 'email')
                expect(component.otpEmailSend).toBe(true)
                expect(component.startCountDownEmail).toHaveBeenCalled()
                expect(window.alert).toHaveBeenCalled()
            })
        })

        describe('verifyOtpEmail', () => {
            it('should verify email OTP successfully', () => {
                // Setup
                component.userEmail = 'test@example.com'
                mockUsersService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

                // Create mock OTP input
                const mockOtp = { value: '1234' }

                // Call verifyOtpEmail
                component.verifyOtpEmail(mockOtp)

                // Expectations
                expect(mockUsersService.verifyOTP).toHaveBeenCalledWith('1234', 'test@example.com', 'email')
                expect(component.otpEmailSend).toBe(true)
                expect(component.isEmailVerified).toBe(true)
                expect(component.disableBtn).toBe(false)
            })
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from page data subscription', () => {
            component.pageDataSubscription = { unsubscribe: jest.fn() }
            component.ngOnDestroy()
            expect(component.pageDataSubscription.unsubscribe).toHaveBeenCalled()
        })

        it('should not throw when pageDataSubscription is null', () => {
            component.pageDataSubscription = null
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('radioChange', () => {
        it('should reset OTP fields on radio change', () => {
            component.isEmailVerified = true
            component.isMobileVerified = true
            component.otpSend = true
            component.otpEmailSend = true
            const mockEvent = {} as any
            component.radioChange(mockEvent)
            expect(component.isEmailVerified).toBe(false)
            expect(component.isMobileVerified).toBe(false)
            expect(component.otpSend).toBe(false)
            expect(component.otpEmailSend).toBe(false)
        })
    })

    describe('fileClick', () => {
        it('should reset the input value on click', () => {
            const mockEvent = { target: { value: 'somefile.csv' } }
            component.fileClick(mockEvent)
            expect(mockEvent.target.value).toBe('')
        })
    })

    describe('downloadFullFile', () => {
        it('should open a new window with the correct URL', () => {
            const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null as any)
            const event = { row: { fileName: 'bulk-upload.csv' } }
            component.downloadFullFile(event)
            expect(openSpy).toHaveBeenCalledWith(
                '/apis/proxies/v8/user/v1/bulkuser/download/bulk-upload.csv',
                '_blank'
            )
            openSpy.mockRestore()
        })
    })

    describe('emailVerification', () => {
        it('should set emailLengthVal to false for valid email', () => {
            component.emailVerification('test@example.com')
            expect(component.emailLengthVal).toBe(false)
        })

        it('should set emailLengthVal to true when username > 64 chars', () => {
            component.emailVerification(`${'a'.repeat(65)}@example.com`)
            expect(component.emailLengthVal).toBe(true)
        })

        it('should set emailLengthVal to true when domain > 255 chars', () => {
            component.emailVerification(`test@${'a'.repeat(256)}.com`)
            expect(component.emailLengthVal).toBe(true)
        })

        it('should set emailLengthVal to false for non-email string', () => {
            component.emailVerification('notanemail')
            expect(component.emailLengthVal).toBe(false)
        })

        it('should not throw for empty string', () => {
            expect(() => component.emailVerification('')).not.toThrow()
        })
    })

    describe('getBulkUploadData - else branch', () => {
        it('should set fetching to false when result has no content', () => {
            mockFileService.getBulkUploadDataV1.mockReturnValue(of({ result: {} }))
            component.getBulkUploadData()
            expect(component.fetching).toBe(false)
        })

        it('should handle missing result', () => {
            mockFileService.getBulkUploadDataV1.mockReturnValue(of({}))
            component.getBulkUploadData()
            expect(component.fetching).toBe(false)
        })

        it('should populate tableList with defaults for missing fields', () => {
            const mockResponse = {
                result: {
                    content: [{
                        fileName: 'file.csv',
                        // no status, failedRecordsCount, etc.
                    }]
                }
            }
            mockFileService.getBulkUploadDataV1.mockReturnValue(of(mockResponse))
            component.getBulkUploadData()
            expect(component.tableList[0].status).toBe('')
            expect(component.tableList[0].failedRecordsCount).toBe(0)
            expect(component.tableList[0].successfulRecordsCount).toBe(0)
        })
    })

    describe('refreshTable', () => {
        it('should call getBulkUploadData', () => {
            jest.spyOn(component, 'getBulkUploadData')
            component.refreshTable()
            expect(component.getBulkUploadData).toHaveBeenCalled()
        })
    })

    describe('downloadReport', () => {
        it('should call fileService.downloadReport with row data', () => {
            const row = { identifier: 'abc123', name: 'report.csv' }
            component.downloadReport(row)
            expect(mockFileService.downloadReport).toHaveBeenCalledWith('abc123', 'report.csv')
        })
    })

    describe('resetOTPFields', () => {
        it('should reset all OTP-related flags', () => {
            component.isEmailVerified = true
            component.otpEmailSend = true
            component.isMobileVerified = true
            component.otpSend = true
            component.disableVerifyBtn = true
            component.resetOTPFields()
            expect(component.isEmailVerified).toBe(false)
            expect(component.otpEmailSend).toBe(false)
            expect(component.isMobileVerified).toBe(false)
            expect(component.otpSend).toBe(false)
            expect(component.disableVerifyBtn).toBe(false)
        })
    })

    describe('getKarmayogiLink', () => {
        it('should return karmayogi link when user has public role', () => {
            component.myRoles = new Set(['public'])
            const link = component.getKarmayogiLink
            expect(link).toContain('/app/user-profile/details')
        })

        it('should return empty string when user does not have public role', () => {
            component.myRoles = new Set(['admin'])
            expect(component.getKarmayogiLink).toBe('')
        })

        it('should return empty string when myRoles is empty', () => {
            component.myRoles = new Set()
            expect(component.getKarmayogiLink).toBe('')
        })
    })

    describe('sendOtp - no mobile', () => {
        it('should show snackbar when userMobile is empty', () => {
            component.userMobile = ''
            component.sendOtp()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid mobile number')
        })
    })

    describe('resendOTP', () => {
        it('should resend OTP and restart countdown on SUCCESS', () => {
            component.userMobile = '9876543210'
            mockUsersService.resendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }))
            jest.spyOn(component, 'startCountDown')
            jest.spyOn(window, 'alert').mockImplementation(() => { })
            component.resendOTP()
            expect(mockUsersService.resendOtp).toHaveBeenCalledWith('9876543210', 'phone')
            expect(component.otpSend).toBe(true)
            expect(component.disableVerifyBtn).toBe(false)
            expect(component.startCountDown).toHaveBeenCalled()
        })

        it('should show snackbar on resendOTP error', () => {
            component.userMobile = '9876543210'
            mockUsersService.resendOtp.mockReturnValue(
                throwError({ error: { params: { errmsg: 'Resend failed' } } })
            )
            component.resendOTP()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Resend failed')
        })

        it('should show snackbar when userMobile is empty', () => {
            component.userMobile = ''
            component.resendOTP()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid mobile number')
        })
    })

    describe('verifyOtp - edge cases', () => {
        it('should show error when otp is null', () => {
            component.verifyOtp(null)
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid OTP.')
        })

        it('should show error when otp value is null', () => {
            component.verifyOtp({ value: null })
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid OTP.')
        })

        it('should show error when otp value is too short (< 4 chars)', () => {
            component.userMobile = '9876543210'
            component.verifyOtp({ value: '12' })
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid OTP.')
        })

        it('should handle verify error with no remainingAttempt', () => {
            component.userMobile = '9876543210'
            mockUsersService.verifyOTP.mockReturnValue(
                throwError({ error: { params: { errmsg: 'Wrong OTP' }, result: null } })
            )
            component.verifyOtp({ value: '1234' })
            expect(mockSnackBar.open).toHaveBeenCalledWith('Wrong OTP')
        })
    })

    describe('startCountDown', () => {
        it('should not start timer when OTP_TIMER is 0', () => {
            component.OTP_TIMER = 0
            component.startCountDown()
            expect(component.timerSubscription).toBeNull()
        })

        it('should initialize timeLeftforOTP when OTP_TIMER > 0', () => {
            component.OTP_TIMER = 10
            component.startCountDown()
            expect(component.timeLeftforOTP).toBe(10)
            if (component.timerSubscription) {
                component.timerSubscription.unsubscribe()
            }
        })
    })

    describe('sendOtpEmail', () => {
        it('should show snackbar on sendOtpEmail error', () => {
            component.userEmail = 'test@example.com'
            mockUsersService.sendOtp.mockReturnValue(
                throwError({ error: { params: { errmsg: 'Email OTP failed' } } })
            )
            component.sendOtpEmail()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Email OTP failed')
        })

        it('should not call sendOtp when userEmail is empty', () => {
            component.userEmail = ''
            component.sendOtpEmail()
            expect(mockUsersService.sendOtp).not.toHaveBeenCalled()
        })
    })

    describe('resendOTPEmail', () => {
        it('should resend email OTP on SUCCESS', () => {
            component.userEmail = 'test@example.com'
            mockUsersService.resendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }))
            jest.spyOn(component, 'startCountDownEmail')
            jest.spyOn(window, 'alert').mockImplementation(() => { })
            component.resendOTPEmail()
            expect(mockUsersService.resendOtp).toHaveBeenCalledWith('test@example.com', 'email')
            expect(component.otpEmailSend).toBe(true)
            expect(component.startCountDownEmail).toHaveBeenCalled()
        })

        it('should show snackbar on resendOTPEmail error', () => {
            component.userEmail = 'test@example.com'
            mockUsersService.resendOtp.mockReturnValue(
                throwError({ error: { params: { errmsg: 'Resend email failed' } } })
            )
            component.resendOTPEmail()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Resend email failed')
        })

        it('should not call resendOtp when userEmail is empty', () => {
            component.userEmail = ''
            component.resendOTPEmail()
            expect(mockUsersService.resendOtp).not.toHaveBeenCalled()
        })
    })

    describe('verifyOtpEmail - edge cases', () => {
        it('should show error when otp is null', () => {
            component.verifyOtpEmail(null)
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid OTP.')
        })

        it('should show error when otp value is too short', () => {
            component.userEmail = 'test@example.com'
            component.verifyOtpEmail({ value: '12' })
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid OTP.')
        })

        it('should handle verify email error with remainingAttempt=0', () => {
            component.userEmail = 'test@example.com'
            mockUsersService.verifyOTP.mockReturnValue(
                throwError({ error: { params: { errmsg: 'Invalid email OTP' }, result: { remainingAttempt: 0 } } })
            )
            component.verifyOtpEmail({ value: '1234' })
            expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid email OTP')
            expect(component.disableEmailVerifyBtn).toBe(true)
        })

        it('should handle verify email error with no result', () => {
            component.userEmail = 'test@example.com'
            mockUsersService.verifyOTP.mockReturnValue(
                throwError({ error: { params: { errmsg: 'OTP error' }, result: null } })
            )
            component.verifyOtpEmail({ value: '1234' })
            expect(mockSnackBar.open).toHaveBeenCalledWith('OTP error')
        })
    })

    describe('startCountDownEmail', () => {
        it('should not start timer when OTP_TIMER_EMAIL is 0', () => {
            component.OTP_TIMER_EMAIL = 0
            component.startCountDownEmail()
            expect(component.timerSubscriptionEmail).toBeNull()
        })

        it('should initialize timeLeftforOTPEmail when OTP_TIMER_EMAIL > 0', () => {
            component.OTP_TIMER_EMAIL = 10
            component.startCountDownEmail()
            expect(component.timeLeftforOTPEmail).toBe(10)
            if (component.timerSubscriptionEmail) {
                component.timerSubscriptionEmail.unsubscribe()
            }
        })
    })

    describe('ngOnInit - no userProfileV2', () => {
        it('should not set email/mobile when userProfileV2 is null', () => {
            component['userProfileV2'] = null
            component.ngOnInit()
            expect(component.userEmail).toBe('')
        })
    })
})