import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'
import { FileService } from '../../../../users/services/upload.service'
import { UsersService } from '../../../../users/services/users.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BulkUploadOdcsComponent } from './bulk-upload-odcs.component'
import { PageEvent } from '@angular/material/paginator'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { FileProgressComponent } from '../../users-view/file-progress/file-progress.component'

describe('BulkUploadOdcsComponent', () => {
    let component: BulkUploadOdcsComponent

    const mockFileService = {
        getBulkCompetencyUploadData: jest.fn().mockReturnValue(
            of({
                result: {
                    content: [
                        {
                            dateUpdatedOn: '2024-10-02T10:30:00.000Z',
                            identifier: 'id-1',
                            totalRecords: 100,
                            fileName: 'fileA.csv',
                            successfulRecordsCount: 80,
                            failedRecordsCount: 20,
                            filePath: '/path/to/fileA.csv',
                            comment: 'Uploaded successfully.',
                            dateCreatedOn: '2024-10-01T10:30:00.000Z',
                            rootOrgId: 'sampleRootOrgId',
                            status: 'SUCCESS',
                        },
                        {
                            dateUpdatedOn: '2024-10-03T10:30:00.000Z',
                            identifier: 'id-2',
                            totalRecords: 200,
                            fileName: 'fileB.csv',
                            successfulRecordsCount: 150,
                            failedRecordsCount: 50,
                            filePath: '/path/to/fileB.csv',
                            comment: 'Uploaded with warnings.',
                            dateCreatedOn: '2024-10-02T10:30:00.000Z',
                            rootOrgId: 'sampleRootOrgId',
                            status: 'WARNING',
                        },
                    ],
                },
            })
        ),
        downloadBulkUploadCompetencySampleFile: jest.fn().mockReturnValue(
            of({})
        ),
        getBulkCompetencyStatus: jest.fn().mockReturnValue(
            of({})
        ),
        downloadWithDispositionName: jest.fn().mockReturnValue(
            of({})
        ),
    } as Partial<FileService>

    const mockMatSnackBar = {
        open: jest.fn(),
    } as Partial<MatSnackBar>

    const mockDialog = {
        open: jest.fn(),
    } as Partial<MatDialog>

    const mockUsersService = {
        sendOtp: jest.fn(),
    } as Partial<UsersService>

    const mockActivatedRoute = {
        data: of({
            pageData: {
                data: {
                    bulkUploadConfig: {
                        pageSize: 10,
                        pageSizeOptions: [10, 20, 30],
                    },
                },
            },
        }),
        snapshot: {
            data: {
                configService: {
                    userProfile: {
                        rootOrgId: 'sampleRootOrgId',
                        userProfileV2: {
                            email: 'test@example.com',
                            mobile: '1234567890',
                        },
                        orgReadData: {
                            frameworkid: 'sampleFrameworkId',
                        },
                    },
                },
            },
            url: [],
            params: {},
            queryParams: {},
            fragment: null,
            outlet: 'primary',
            component: null,
        } as unknown as ActivatedRouteSnapshot,
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        outlet: 'primary',
        component: null,
    } as unknown as ActivatedRoute

    const mockUserProfile = {
        userProfileV2: {
            email: 'test@example.com',
            mobile: '1234567890',
        },
        rootOrgId: 'sampleRootOrgId',
        orgReadData: {
            frameworkid: 'sampleFrameworkId',
        },
    } as any

    beforeEach(() => {
        component = new BulkUploadOdcsComponent(
            mockFileService as FileService,
            mockMatSnackBar as MatSnackBar,
            mockDialog as MatDialog,
            mockUsersService as UsersService,
            mockActivatedRoute as ActivatedRoute
        )
        component.userProfile = mockUserProfile
    })

    describe('ngOnInit', () => {
        it('should call getBulkStatusList and set bulkUploadConfig values', () => {
            // arrange
            jest.spyOn(component, 'getBulkStatusList')
            // act
            component.ngOnInit()
            // assert
            expect(component.getBulkStatusList).toHaveBeenCalled()
            expect(component.bulkUploadConfig).toEqual({
                pageSize: 10,
                pageSizeOptions: [10, 20, 30],
            })
            expect(component.pageSize).toBe(10)
            expect(component.sizeOptions).toEqual([10, 20, 30])
        })
    })

    describe('ngAfterViewInit', () => {
        it('should set lastIndex to the first value of sizeOptions', () => {
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
            const pageEvent: PageEvent = {
                pageIndex: 1,
                pageSize: 10,
                length: 100,
            }
            // act
            component.onChangePage(pageEvent)
            // assert
            expect(component.startIndex).toBe(10)
            expect(component.lastIndex).toBe(20)
        })
    })

    describe('getBulkStatusList', () => {
        it('should call getBulkCompetencyUploadData and pipe data correctly', () => {
            // arrange
            component.rootOrgId = 'sampleRootOrgId'
            // act
            component.getBulkStatusList()
            // assert
            expect(mockFileService.getBulkCompetencyUploadData).toHaveBeenCalledWith('sampleRootOrgId')
            expect(component.lastUploadList.length).toBe(2)
        })
        it('should set lastUploadList when the file service returns data', () => {
            // act
            component.getBulkStatusList()
            // assert
            expect(mockFileService.getBulkCompetencyUploadData).toHaveBeenCalledWith(component.rootOrgId)
            expect(component.lastUploadList.length).toBe(2)
            expect(new Date(component.lastUploadList[0].dateCreatedOn)).toEqual(new Date('2024-10-02T10:30:00.000Z'))
        })

        it('should display an error message when file service fails', () => {
            // arrange
            mockFileService.getBulkCompetencyUploadData = jest
                .fn()
                .mockReturnValue(
                    throwError(() => new HttpErrorResponse({ status: 500 }))
                )
            // act
            component.getBulkStatusList()
            // assert
            expect(mockFileService.getBulkCompetencyUploadData).toHaveBeenCalled()
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to get Bulk status list')
        })
    })

    describe('showFileUploadProgress', () => {
        it('should open the file upload progress dialog', () => {
            // act
            component.showFileUploadProgress()
            // assert
            expect(mockDialog.open).toHaveBeenCalledWith(FileProgressComponent, {
                data: {},
                disableClose: true,
                panelClass: 'progress-modal',
            })
            expect(component.fileUploadDialogInstance).toBeUndefined()
        })
    })

    describe('handleDownloadFile', () => {
        it('should handle file download correctly', () => {
            // arrange
            const listObj = {
                dateUpdatedOn: '2024-10-02T10:30:00.000Z',
                identifier: 'id-1',
                totalRecords: 100,
                fileName: 'fileA.csv',
                successfulRecordsCount: 80,
                failedRecordsCount: 20,
                filePath: '/path/to/fileA.csv',
                comment: 'Uploaded successfully.',
                dateCreatedOn: '2024-10-01T10:30:00.000Z',
                rootOrgId: 'sampleRootOrgId',
                status: 'SUCCESS',
            }
            // act
            component.handleDownloadFile(listObj)
            // assert
            expect(mockFileService.getBulkCompetencyStatus).toHaveBeenCalledWith(listObj.fileName)
            expect(mockFileService.downloadWithDispositionName).toHaveBeenCalled()
        })
    })

    describe('handleDownloadSampleFile', () => {
        it('should handle sample file download correctly', () => {
            // act
            component.handleDownloadSampleFile()
            // assert
            expect(mockFileService.downloadBulkUploadCompetencySampleFile).toHaveBeenCalledWith(component.bulkUploadFrameworkId)
            expect(mockFileService.downloadWithDispositionName).toHaveBeenCalled()
        })
    })

    describe('handleFileClick', () => {
        it('should reset file input value on file click', () => {
            // arrange
            const event = { target: { value: 'someValue' } }
            // act
            component.handleFileClick(event)
            // assert
            expect(event.target.value).toBe('')
        })
    })

    describe('generateAndVerifyOTP', () => {
        it('should handle successful OTP sending', () => {
            // arrange
            mockUsersService.sendOtp = jest.fn().mockReturnValue(of({}))
            // act
            component.generateAndVerifyOTP('email')
            // assert
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('An OTP has been sent to your Email address, (Valid for 15 min\'s)')
        })

        it('should handle error during OTP sending', () => {
            // arrange
            const errorResponse = new HttpErrorResponse({
                error: { params: { errmsg: 'Error sending OTP' } },
                status: 500,
                statusText: 'Internal Server Error',
            })
            mockUsersService.sendOtp = jest.fn().mockReturnValue(throwError(() => errorResponse))
            // act
            component.generateAndVerifyOTP('phone')
            // assert
            expect(mockMatSnackBar.open).toHaveBeenCalled()
        })

        it('should show default error message if OTP sending fails', () => {
            // arrange
            const errorResponse = new HttpErrorResponse({
                error: {},
                status: 500,
                statusText: 'Internal Server Error',
            })
            mockUsersService.sendOtp = jest.fn().mockReturnValue(throwError(() => errorResponse))
            // act
            component.generateAndVerifyOTP('email')
            // assert
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to send OTP to your email, please try again later!')
        })
    })

    it('should set showFileError to true when file validation fails', () => {
        // arrange
        const mockFile = new File([''], 'invalid-file.txt', { type: 'text/plain' })
        const mockEvent = {
            target: {
                files: [mockFile],
            },
        }
        component.userProfile = { email: 'test@example.com', phone: '1234567890' }
        mockFileService.validateFile = jest.fn().mockReturnValue(false)
        // act
        component.handleOnFileChange(mockEvent)
        // assert
        expect(component.fileName).toBe('invalid-file.txt')
        expect(component.fileSelected).toBe(mockFile)
        expect(mockFileService.validateFile).toHaveBeenCalledWith('invalid-file.txt')
        expect(component.showFileError).toBe(true)
    })

    it('should not select any file when no file is provided', () => {
        // arrange
        const mockEvent = {
            target: {
                files: [],
            },
        }
        component.userProfile = { email: 'test@example.com', phone: '1234567890' }
        // act
        component.handleOnFileChange(mockEvent)
        // assert
        expect(component.fileName).toBeUndefined()
        expect(component.fileSelected).toBeUndefined()
        expect(component.showFileError).toBe(false)
    })

    describe('handleChangePage', () => {
        it('should update pageSize, startIndex, and lastIndex when handleChangePage is called', () => {
            // arrange
            const pageEvent: PageEvent = { pageIndex: 1, pageSize: 10, length: 100 }
            // act
            component.handleChangePage(pageEvent)
            // assert
            expect(component.pageSize).toBe(10)
            expect(component.startIndex).toBe(10)
            expect(component.lastIndex).toBe(20)
        })

    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe destroySubject$ and clear the interval in ngOnDestroy', () => {
            // arrange
            component.interval = 12345
            jest.spyOn(global, 'clearInterval')
            // act
            component.ngOnDestroy()
            // assert
            expect(clearInterval).toHaveBeenCalledWith(12345)
        })

        it('should not call clearInterval if no interval is set', () => {
            // arrange
            component.interval = undefined
            jest.spyOn(global, 'clearInterval')
            // act
            component.ngOnDestroy()
            // assert
            expect(clearInterval).toHaveBeenCalled()
        })
    })

    describe('Timer', () => {
        it('should start the timer and decrease timeLeft each second', () => {
            // act
            component.startTimer()
            // assert
            expect(component.interval).toBeDefined()
            jest.advanceTimersByTime(3000)
            expect(component.timeLeft).toBe(10)
        })

        it('should clear the interval and call getBulkStatusList when timeLeft reaches 0', () => {
            // arrange
            component.timeLeft = 2
            // act
            component.startTimer()
            // assert
            expect(component.timeLeft).toBe(2)
            expect(clearInterval).toHaveBeenCalledWith(12345)
        })
    })

    describe('uploadCSV', () => {
        it('should show file error if file is invalid', () => {
            // act
            component.uploadCSVFile()
            // assert
            expect(component.showFileError).toBe(true)
        })

        it('should not upload if no file is selected', () => {
            // arrange
            component.fileSelected = null
            // act
            component.uploadCSVFile()
        })
    })
})
