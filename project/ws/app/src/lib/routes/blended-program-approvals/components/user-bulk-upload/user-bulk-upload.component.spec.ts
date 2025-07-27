import { UserBulkUploadComponent, IUserElement } from './user-bulk-upload.component'
import { EventEmitter } from '@angular/core'
import { of, throwError } from 'rxjs'

// Mock dependencies
const mockContentBatchService = {
    validateUser: jest.fn(),
    downloadFile: jest.fn()
}

const mockDialog = {
    open: jest.fn()
}

const mockSnackBar = {
    openFromComponent: jest.fn()
}

describe('UserBulkUploadComponent', () => {
    let component: UserBulkUploadComponent

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()

        // Create component instance with mocked dependencies
        component = new UserBulkUploadComponent(
            mockContentBatchService as any,
            mockDialog as any,
            mockSnackBar as any
        )

        // Initialize component properties
        component.successUserData = new EventEmitter<any>()
    })

    describe('ngOnInit', () => {
        it('should emit empty array on initialization', () => {
            const emitSpy = jest.spyOn(component.successUserData, 'emit')

            component.ngOnInit()

            expect(emitSpy).toHaveBeenCalledWith([])
        })
    })

    describe('onDrop', () => {
        let mockInput: HTMLInputElement

        beforeEach(() => {
            mockInput = {
                name: 'test.csv',
                type: 'text/csv',
                size: 1024
            } as any
        })

        it('should process valid CSV file successfully', () => {
            const mockFileReader = {
                onload: null as any,
                readAsText: jest.fn(),
                result: 'Emailid,Mobilenumber\ntest@test.com,9876543210'
            };

            // Mock FileReader
            (global as any).FileReader = jest.fn(() => mockFileReader)

            const onFileLoadSpy = jest.spyOn(component, 'onFileLoad')

            component.onDrop(mockInput)

            expect(component.fileUploading).toBe(true)
            expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockInput, 'UTF-8')

            // Simulate file load event
            const mockEvent = { target: { result: 'csv content' } }
            mockFileReader.onload(mockEvent)

            expect(onFileLoadSpy).toHaveBeenCalledWith(mockEvent)
        })

        it('should handle invalid file extension', () => {
            mockInput.name = 'test.txt'

            component.onDrop(mockInput)

            expect(component.fileUploading).toBe(false)
            expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    data: {
                        message: 'Unsupported File Format. Please upload a CSV file.',
                        type: 'error'
                    }
                })
            )
        })

        it('should handle no files provided', () => {
            component.onDrop(null as any)

            expect(component.fileUploading).toBe(false)
            expect(mockSnackBar.openFromComponent).toHaveBeenCalled()
        })
    })

    describe('onFileLoad', () => {
        beforeEach(() => {
            jest.spyOn(component, 'callUserCheckApi').mockResolvedValue({ count: 0, content: [] })
        })

        it('should process valid CSV content with correct headers', async () => {
            const mockEvent = {
                target: {
                    result: 'Emailid,Mobilenumber\ntest@test.com,9876543210\ntest2@test.com,9876543211'
                }
            }

            await component.onFileLoad(mockEvent)

            expect(component.contacts).toHaveLength(2)
            expect(component.contacts[0]).toEqual(
                expect.objectContaining({
                    Emailid: 'test@test.com',
                    Mobilenumber: '9876543210'
                })
            )
        })

        it('should handle CSV with incorrect number of headers', async () => {
            const mockEvent = {
                target: {
                    result: 'Emailid,Mobilenumber,ExtraField\ntest@test.com,9876543210,extra'
                }
            }

            await component.onFileLoad(mockEvent)

            expect(component.fileUploading).toBe(false)
            expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    data: {
                        message: 'Field Mismatch. Please ensure your uploaded file matches the sample template provided.',
                        type: 'error'
                    }
                })
            )
        })

        it('should handle CSV missing required headers', async () => {
            const mockEvent = {
                target: {
                    result: 'WrongHeader1,WrongHeader2\nvalue1,value2'
                }
            }

            await component.onFileLoad(mockEvent)

            expect(component.fileUploading).toBe(false)
            expect(mockSnackBar.openFromComponent).toHaveBeenCalled()
        })

        it('should handle more than 30 users', async () => {
            let csvContent = 'Emailid,Mobilenumber\n'
            for (let i = 1; i <= 31; i++) {
                csvContent += `test${i}@test.com,987654321${i % 10}\n`
            }

            const mockEvent = { target: { result: csvContent } }

            await component.onFileLoad(mockEvent)

            expect(mockDialog.open).toHaveBeenCalled()
            expect(component.fileUploading).toBe(false)
        })

        it('should validate email and mobile patterns correctly', async () => {
            const mockEvent = {
                target: {
                    result: 'Emailid,Mobilenumber\ninvalid-email,1234567890\nvalid@test.com,9876543210'
                }
            }

            await component.onFileLoad(mockEvent)

            expect(component.contacts[0].status).toBe('Error')
            expect(component.contacts[0].message).toBe('Invalid Email id')
            expect(component.contacts[1].status).toBe('Success')
        })

        it('should handle API call failure', async () => {
            jest.spyOn(component, 'callUserCheckApi').mockResolvedValue(null)

            const mockEvent = {
                target: {
                    result: 'Emailid,Mobilenumber\ntest@test.com,9876543210'
                }
            }

            await component.onFileLoad(mockEvent)

            expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    data: {
                        message: 'Something went wrong! Please try again',
                        type: 'error'
                    }
                })
            )
        })
    })

    describe('callUserCheckApi', () => {
        it('should call validateUser with email filter', async () => {
            const mockResponse = {
                result: {
                    response: { count: 1, content: [{ userId: '123' }] }
                }
            }
            mockContentBatchService.validateUser.mockReturnValue(of(mockResponse))

            const result = await component.callUserCheckApi(['test@test.com'], 'primaryEmail')

            expect(mockContentBatchService.validateUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    request: expect.objectContaining({
                        filters: { email: ['test@test.com'] }
                    })
                })
            )
            expect(result).toEqual(mockResponse.result.response)
        })

        it('should call validateUser with mobile filter', async () => {
            const mockResponse = {
                result: {
                    response: { count: 1, content: [{ userId: '123' }] }
                }
            }
            mockContentBatchService.validateUser.mockReturnValue(of(mockResponse))

            //const result = await component.callUserCheckApi(['9876543210'], 'mobile')

            expect(mockContentBatchService.validateUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    request: expect.objectContaining({
                        filters: { phone: ['9876543210'] }
                    })
                })
            )
        })

        it('should handle API error', async () => {
            mockContentBatchService.validateUser.mockReturnValue(throwError('API Error'))

            const result = await component.callUserCheckApi(['test@test.com'], 'primaryEmail')

            expect(result).toBeUndefined()
        })
    })

    describe('manageData', () => {
        beforeEach(() => {
            component.contacts = [
                {
                    email: 'test@test.com',
                    mobile: '9876543210',
                    userStatus: true,
                    Emailid: 'test@test.com',
                    Mobilenumber: '9876543210'
                }
            ]
        })

        it('should process user data correctly when both email and mobile match', () => {
            const userEmailData = {
                count: 1,
                content: [{
                    userId: '123',
                    firstName: 'John',
                    rootOrgName: 'Test Ministry',
                    profileDetails: {
                        personalDetails: {
                            primaryEmail: 'test@test.com',
                            mobile: '9876543210'
                        }
                    }
                }]
            }
            const userMobileData = { count: 0 }

            component.manageData(userEmailData, userMobileData)

            expect(component.contacts[0].userId).toBe('123')
            expect(component.contacts[0].fullName).toBe('John')
            expect(component.contacts[0].ministry).toBe('Test Ministry')
            expect(component.isSuccessUserlist).toHaveLength(1)
        })

        it('should handle mismatched credentials', () => {
            const userEmailData = {
                count: 1,
                content: [{
                    userId: '123',
                    firstName: 'John',
                    rootOrgName: 'Test Ministry',
                    profileDetails: {
                        personalDetails: {
                            primaryEmail: 'test@test.com',
                            mobile: '9999999999' // Different mobile
                        }
                    }
                }]
            }
            const userMobileData = { count: 0 }

            component.manageData(userEmailData, userMobileData)

            expect(component.contacts[0].status).toBe('Error')
            expect(component.contacts[0].message).toBe('Given credentials are not matching')
            expect(component.isErrorUserlist).toHaveLength(1)
        })

        it('should handle email-only user', () => {
            component.contacts[0].mobile = ''
            const userEmailData = {
                count: 1,
                content: [{
                    userId: '123',
                    firstName: 'John',
                    rootOrgName: 'Test Ministry',
                    profileDetails: {
                        personalDetails: {
                            primaryEmail: 'test@test.com',
                            mobile: '9876543210'
                        }
                    }
                }]
            }
            const userMobileData = { count: 0 }

            component.manageData(userEmailData, userMobileData)

            expect(component.contacts[0].mobile).toBe('9876543210')
            expect(component.contacts[0].userId).toBe('123')
        })

        it('should handle mobile-only user', () => {
            component.contacts[0].email = ''
            const userEmailData = { count: 0 }
            const userMobileData = {
                count: 1,
                content: [{
                    userId: '123',
                    firstName: 'John',
                    rootOrgName: 'Test Ministry',
                    profileDetails: {
                        personalDetails: {
                            primaryEmail: 'test@test.com',
                            mobile: '9876543210'
                        }
                    }
                }]
            }

            component.manageData(userEmailData, userMobileData)

            expect(component.contacts[0].email).toBe('test@test.com')
            expect(component.contacts[0].userId).toBe('123')
        })

        it('should set selected tab to error when no success users', () => {
            component.contacts[0].userStatus = false
            const userEmailData = { count: 0 }
            const userMobileData = { count: 0 }

            component.manageData(userEmailData, userMobileData)

            expect(component.isSeletedTab).toBe('error')
            expect(component.displayedColumns).toEqual(['email', 'status', 'mobile', 'message'])
        })
    })

    describe('Selection methods', () => {
        beforeEach(() => {
            component.dataSource.data = [
                { fullName: 'John', email: 'john@test.com', ministry: 'Test', status: 'Success', mobile: '9876543210' },
                { fullName: 'Jane', email: 'jane@test.com', ministry: 'Test', status: 'Success', mobile: '9876543211' }
            ] as IUserElement[]
        })

        describe('isAllSelected', () => {
            it('should return true when all rows are selected', () => {
                component.selection.select(...component.dataSource.data)

                expect(component.isAllSelected()).toBe(true)
            })

            it('should return false when not all rows are selected', () => {
                component.selection.select(component.dataSource.data[0])

                expect(component.isAllSelected()).toBe(false)
            })
        })

        describe('toggleAllRows', () => {
            it('should select all rows when none are selected', () => {
                component.toggleAllRows()

                expect(component.selection.selected.length).toBe(2)
            })

            it('should clear selection when all rows are selected', () => {
                component.selection.select(...component.dataSource.data)

                component.toggleAllRows()

                expect(component.selection.selected.length).toBe(0)
            })
        })

        describe('checkboxLabel', () => {
            it('should return select all label when no row is passed', () => {
                const label = component.checkboxLabel()

                expect(label).toBe('select all')
            })

            it('should return deselect all label when all rows are selected', () => {
                component.selection.select(...component.dataSource.data)

                const label = component.checkboxLabel()

                expect(label).toBe('deselect all')
            })

            it('should return row-specific label when row is passed', () => {
                const row = { ...component.dataSource.data[0], position: 0 }

                const label = component.checkboxLabel(row)

                expect(label).toBe('select row 1')
            })
        })
    })

    describe('changeFilterType', () => {
        beforeEach(() => {
            component.isSuccessUserlist = [{ fullName: 'John', status: 'Success' }] as IUserElement[]
            component.isErrorUserlist = [{ email: 'error@test.com', status: 'Error' }] as IUserElement[]
        })

        it('should switch to error view', () => {
            component.changeFilterType('error')

            expect(component.isSeletedTab).toBe('error')
            expect(component.displayedColumns).toEqual(['email', 'status', 'mobile', 'message'])
            expect(component.dataSource.data).toEqual(component.isErrorUserlist)
        })

        it('should switch to success view', () => {
            component.changeFilterType('success')

            expect(component.isSeletedTab).toBe('success')
            expect(component.displayedColumns).toEqual(['fullName', 'email', 'ministry', 'status', 'mobile'])
            expect(component.dataSource.data).toEqual(component.isSuccessUserlist)
        })
    })

    describe('applyFilter', () => {
        it('should apply filter to data source', () => {
            const mockEvent = {
                target: { value: '  Test Value  ' }
            } as any

            component.applyFilter(mockEvent)

            expect(component.dataSource.filter).toBe('test value')
        })
    })

    describe('downloadErrorFile', () => {
        it('should call download file service', () => {
            component.isErrorUserlist = [{ email: 'error@test.com' }] as IUserElement[]

            component.downloadErrorFile()

            expect(mockContentBatchService.downloadFile).toHaveBeenCalledWith(
                component.isErrorUserlist,
                'userErrordata'
            )
        })
    })

    describe('downloadFile', () => {
        it('should exist as a method', () => {
            expect(typeof component.downloadFile).toBe('function')

            // Method currently has no implementation
            component.downloadFile()
        })
    })

    describe('Edge cases and error handling', () => {
        it('should handle empty CSV content', async () => {
            const mockEvent = { target: { result: '' } }

            await component.onFileLoad(mockEvent)

            expect(component.contacts).toEqual([])
        })

        it('should handle CSV with only headers', async () => {
            const mockEvent = { target: { result: 'Emailid,Mobilenumber' } }

            await component.onFileLoad(mockEvent)

            expect(component.contacts).toEqual([])
        })

        it('should handle user data without profileDetails', () => {
            component.contacts = [{ email: 'test@test.com', mobile: '9876543210', userStatus: true }]

            const userEmailData = {
                count: 1,
                content: [{ userId: '123', firstName: 'John' }] // No profileDetails
            }
            const userMobileData = { count: 0 }

            component.manageData(userEmailData, userMobileData)

            expect(component.contacts[0].status).toBe('Error')
        })

        it('should handle invalid mobile number pattern', async () => {
            const mockEvent = {
                target: {
                    result: 'Emailid,Mobilenumber\ntest@test.com,1234567890' // Invalid mobile (doesn't start with 6,7,8,9)
                }
            }
            jest.spyOn(component, 'callUserCheckApi').mockResolvedValue({ count: 0, content: [] })

            await component.onFileLoad(mockEvent)

            expect(component.contacts[0].status).toBe('Error')
            expect(component.contacts[0].message).toBe('Invalid Mobile number')
        })

        it('should handle both invalid email and mobile', async () => {
            const mockEvent = {
                target: {
                    result: 'Emailid,Mobilenumber\ninvalid-email,1234567890'
                }
            }
            jest.spyOn(component, 'callUserCheckApi').mockResolvedValue({ count: 0, content: [] })

            await component.onFileLoad(mockEvent)

            expect(component.contacts[0].status).toBe('Error')
            expect(component.contacts[0].message).toBe('Invalid Email id and Mobile number')
        })
    })
})