import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { FileService } from '../../../../users/services/upload.service'
import { UsersService } from '../../../../users/services/users.service'
import { BulkUploadApprovalComponent } from './bulk-upload.component'
import { HttpErrorResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { PageEvent } from '@angular/material/paginator'
import { FileProgressComponent } from '../../users-view/file-progress/file-progress.component'

describe('BulkUploadApprovalComponent', () => {
    let component: BulkUploadApprovalComponent

    const fileService: Partial<FileService> = {
        validateFile: jest.fn(),
    }
    const matSnackBar: Partial<MatSnackBar> = {
        open: jest.fn(),

    }

    const router: Partial<ActivatedRoute> = {
        snapshot: {
            parent: {
                data: {
                    configService: {
                        unMappedUser: {
                            rootOrg: {
                                rootOrgId: 'sampleRootOrgId',
                            },
                        },
                        userProfileV2: {},
                    },
                },
            },
        } as any,
        data: of({
            pageData: {
                data: {
                    downloadSampleFilePath: 'samplePath',
                    downloadAsFileName: 'sampleFileName',
                },
            },
        }),
    }

    const dialog: Partial<MatDialog> = {
        open: jest.fn().mockReturnValue({
            componentInstance: {
                resendOTP: of(),
                otpVerified: of(),
            },
        }),
    }
    const usersService: Partial<UsersService> = {
        sendOtp: jest.fn(),
    }

    beforeAll(() => {
        component = new BulkUploadApprovalComponent(
            fileService as FileService,
            matSnackBar as MatSnackBar,
            router as ActivatedRoute,
            dialog as MatDialog,
            usersService as UsersService
        )
        component.userProfile = {
            email: 'test@example.com',
            mobile: '1234567890',
        } as any
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create an instance of the component', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should call getBulkApprovalUploadDataV1 API', () => {
            // arrange
            const mockResponse = {
                result: {
                    content: [
                        { datecreatedon: '2023-10-08T12:00:00Z' },
                        { datecreatedon: '2023-10-09T12:00:00Z' },
                    ],
                },
            }
            fileService.getBulkApprovalUploadDataV1 = jest.fn().mockReturnValue(of(mockResponse))

            // act
            component.ngOnInit()

            // assert
            expect(fileService.getBulkApprovalUploadDataV1).toHaveBeenCalled()
        })

        it('should handle error when getBulkApprovalUploadDataV1 API fails', () => {
            // arrange
            const mockError = new HttpErrorResponse({
                status: 500,
                statusText: 'Server Error',
            })
            fileService.getBulkApprovalUploadDataV1 = jest.fn().mockReturnValue(throwError(mockError))

            // act
            component.ngOnInit()

            // assert
            expect(fileService.getBulkApprovalUploadDataV1).toHaveBeenCalled()
        })
    })

    describe('ngAfterViewInit', () => {
        it('should set lastIndex to the first element of sizeOptions', () => {
            // arrange
            component.sizeOptions = [10, 20, 30]

            // act
            component.ngAfterViewInit()

            // assert
            expect(component.lastIndex).toBe(10)
        })
    })

    describe('onChangePage', () => {
        it('should update startIndex and lastIndex based on the page event', () => {
            // arrange
            const mockPageEvent: PageEvent = {
                pageIndex: 2,
                pageSize: 10,
                length: 100,
            }

            // act
            component.onChangePage(mockPageEvent)

            // assert
            expect(component.startIndex).toBe(20)
            expect(component.lastIndex).toBe(30)
        })
    })

    describe('showFileUploadProgress', () => {
        let mockDialog: MatDialog

        beforeEach(() => {
            mockDialog = {
                open: jest.fn(),
            } as any

            component.dialog = mockDialog
        })

        it('should open the FileProgressComponent', () => {
            // act
            component.showFileUploadProgress()

            // assert
            expect(mockDialog.open).toHaveBeenCalledWith(FileProgressComponent, {
                data: {},
                disableClose: true,
                panelClass: 'progress-modal',
            })
        })
    })

    describe('handleDownloadFile', () => {
        it('should open the correct file download URL', () => {
            // arrange
            const filename = 'test-file.pdf'
            const listObj = { filename }
            const filePath = `/apis/proxies/v8/workflow/admin/bulkuploadfile/download/${filename}`
            const openSpy = jest.spyOn(window, 'open').mockImplementation()

            // act
            component.handleDownloadFile(listObj)

            // assert
            expect(openSpy).toHaveBeenCalledWith(filePath, '_blank')
            openSpy.mockRestore()
        })
    })

    describe('handleDownloadSampleFile', () => {
        it('should call fileService.download', () => {
            // arrange
            component.downloadSampleFilePath = 'path/to/sample/file'
            component.downloadAsFileName = 'sample-file.pdf'
            fileService.download = jest.fn()

            // act
            component.handleDownloadSampleFile()

            // assert
            expect(fileService.download).toHaveBeenCalledWith(
                component.downloadSampleFilePath,
                component.downloadAsFileName
            )
        })
    })

    describe('handleFileClick', () => {
        it('should reset the value of event.target', () => {
            // arrange
            const mockEvent = {
                target: {
                    value: 'some file value',
                },
            }
            // act
            component.handleFileClick(mockEvent)
            // assert
            expect(mockEvent.target.value).toBe('')
        })
    })
    describe('handleChangePage', () => {
        it('should update pageSize, startIndex, and lastIndex correctly', () => {
            // arrange
            const pageEvent: PageEvent = {
                pageIndex: 2,
                pageSize: 10,
                length: 100,
            }

            // act
            component.handleChangePage(pageEvent)

            // assert
            expect(component.pageSize).toBe(10)
            expect(component.startIndex).toBe(20)
            expect(component.lastIndex).toBe(30)
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from destroySubject$', () => {
            // arrange
            const unsubscribeSpy = jest.spyOn(component['destroySubject$'], 'unsubscribe')

            // act
            component.ngOnDestroy()

            // assert
            expect(unsubscribeSpy).toHaveBeenCalled()
        })
    })

    describe('sendOTP', () => {
        it('should call generateAndVerifyOTP with "email" when userProfile.email exists', () => {
            // arrange
            spyOn(component, 'generateAndVerifyOTP')
            // act
            component.sendOTP()
            // assert
            expect(component.generateAndVerifyOTP).toHaveBeenCalledWith('email')
        })

        it('should call generateAndVerifyOTP with "phone" when userProfile.email is falsy', () => {
            // arrange
            spyOn(component, 'generateAndVerifyOTP')
            component.userProfile.email = null
            // act
            component.sendOTP()
            // assert
            expect(component.generateAndVerifyOTP).toHaveBeenCalledWith('phone')
        })
    })

    describe('generateAndVerifyOTP', () => {
        it('should call usersService.sendOtp with email when contactType is "email"', () => {
            // act
            component.generateAndVerifyOTP('email')
            // assert
            expect(usersService.sendOtp).toHaveBeenCalledWith('test@example.com', 'email')
        })

        it('should call usersService.sendOtp with mobile when contactType is "phone"', () => {
            // act
            component.generateAndVerifyOTP('phone')
            // assert
            expect(usersService.sendOtp).toHaveBeenCalledWith('1234567890', 'phone')
        })

        it('should show success message when OTP is sent successfully', () => {
            // act
            component.generateAndVerifyOTP('email')
            // assert
            expect(matSnackBar.open).toHaveBeenCalledWith('An OTP has been sent to your Email address, (Valid for 15 min\'s)')
        })

        it('should call verifyOTP if resendFlag is not provided', () => {
            // arrange
            spyOn(component, 'verifyOTP')
            // act
            component.generateAndVerifyOTP('email')
            // assert
            expect(component.verifyOTP).toHaveBeenCalledWith('email')
        })

        it('should not call verifyOTP if resendFlag is provided', () => {
            // arrange
            spyOn(component, 'verifyOTP')
            // act
            component.generateAndVerifyOTP('email', 'resend')
            // assert
            expect(component.verifyOTP).not.toHaveBeenCalled()
        })

        it('should handle errors', () => {
            // act
            component.generateAndVerifyOTP('email')
            // assert
            expect(matSnackBar.open).toHaveBeenCalledWith('Error occurred')
        })

        it('should show default error message', () => {
            // act
            component.generateAndVerifyOTP('email')
            // assert
            expect(matSnackBar.open).toHaveBeenCalledWith('Unable to send OTP to your email, please try again later!')
        })
    })
})
