import { BudgetproofspopupComponent, PeriodicElement } from './budgetproofspopup.component'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { of } from 'rxjs'

// Mock dependencies
const mockDialogRef = {
    close: jest.fn()
}

const mockUploadService = {
    getProfile: jest.fn(),
    crreateAsset: jest.fn(),
    uploadFile: jest.fn(),
    updateWorkOrder: jest.fn()
}

const mockData = {
    data: 'Test Section'
}

const mockUserData = {
    result: {
        response: {
            id: 'user123',
            firstName: 'John',
            lastName: 'Doe'
        }
    }
}

describe('BudgetproofspopupComponent', () => {
    let component: BudgetproofspopupComponent

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()

        // Setup default mock implementations
        mockUploadService.getProfile.mockReturnValue(of(mockUserData))

        // Create component instance
        component = new BudgetproofspopupComponent(
            mockDialogRef as any,
            mockData,
            mockUploadService as any
        )
    })

    describe('Constructor', () => {
        it('should create component with initial values', () => {
            expect(component).toBeDefined()
            expect(component.sectioname).toBe('Test Section')
            expect(component.uploadedFilesAssets).toEqual([])
            expect(component.uploading).toBe(false)
            expect(component.uploadSuccessful).toBe(false)
            expect(component.uploadedFiles).toEqual([])
        })

        it('should initialize form with required validators', () => {
            expect(component.uploadform).toBeInstanceOf(UntypedFormGroup)
            expect(component.uploadform.get('files')).toBeInstanceOf(UntypedFormControl)
            expect(component.uploadform.get('files')?.hasError('required')).toBe(true)
        })

        it('should initialize dataSource and selection', () => {
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
            expect(component.selection).toBeInstanceOf(SelectionModel)
            expect(component.selection.isMultipleSelection()).toBe(true)
        })

        it('should call getProfile on initialization', () => {
            expect(mockUploadService.getProfile).toHaveBeenCalled()
        })

        it('should set userData when getProfile returns data', () => {
            expect(component.userData).toEqual(mockUserData.result.response)
        })
    })

    describe('ngOnInit', () => {
        it('should execute without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('Selection Methods', () => {
        beforeEach(() => {
            // Setup test data
            const testData: PeriodicElement[] = [
                {
                    srno: 1,
                    filename: 'test1.pdf',
                    filetype: 'application/pdf',
                    filesize: '1024',
                    uploadedon: new Date(),
                    uploadstatus: 100
                },
                {
                    srno: 2,
                    filename: 'test2.pdf',
                    filetype: 'application/pdf',
                    filesize: '2048',
                    uploadedon: new Date(),
                    uploadstatus: 100
                }
            ]
            component.dataSource.data = testData
        })

        describe('isAllSelected', () => {
            it('should return true when all items are selected', () => {
                component.selection.select(...component.dataSource.data)
                expect(component.isAllSelected()).toBe(true)
            })

            it('should return false when no items are selected', () => {
                component.selection.clear()
                expect(component.isAllSelected()).toBe(false)
            })

            it('should return false when some items are selected', () => {
                component.selection.select(component.dataSource.data[0])
                expect(component.isAllSelected()).toBe(false)
            })
        })

        describe('masterToggle', () => {
            it('should select all items when none are selected', () => {
                component.selection.clear()
                component.masterToggle()
                expect(component.selection.selected.length).toBe(component.dataSource.data.length)
            })

            it('should clear selection when all items are selected', () => {
                component.selection.select(...component.dataSource.data)
                component.masterToggle()
                expect(component.selection.selected.length).toBe(0)
            })

            it('should select all items when some are selected', () => {
                component.selection.select(component.dataSource.data[0])
                component.masterToggle()
                expect(component.selection.selected.length).toBe(component.dataSource.data.length)
            })
        })

        describe('checkboxLabel', () => {
            it('should return "select all" when no row is provided and not all selected', () => {
                component.selection.clear()
                expect(component.checkboxLabel()).toBe('select all')
            })

            it('should return "deselect all" when no row is provided and all selected', () => {
                component.selection.select(...component.dataSource.data)
                expect(component.checkboxLabel()).toBe('deselect all')
            })

            it('should return "select row" when row is provided and not selected', () => {
                const row = component.dataSource.data[0]
                component.selection.deselect(row)
                expect(component.checkboxLabel(row)).toBe('select row')
            })

            it('should return "deselect row" when row is provided and selected', () => {
                const row = component.dataSource.data[0]
                component.selection.select(row)
                expect(component.checkboxLabel(row)).toBe('deselect row')
            })
        })
    })

    describe('File Operations', () => {
        describe('addFiles', () => {
            it('should trigger file input click', () => {
                const mockClick = jest.fn()
                component.file = {
                    nativeElement: {
                        click: mockClick
                    }
                }

                component.addFiles()
                expect(mockClick).toHaveBeenCalled()
            })
        })

        describe('onFilesAdded', () => {
            it('should process files and update component state', () => {
                const mockFile = {
                    name: 'test.pdf',
                    type: 'application/pdf',
                    size: 1024
                }

                const mockEvent = {
                    target: {
                        files: [mockFile]
                    }
                }

                const initialLength = component.uploadedFilesAssets.length

                component.onFilesAdded(mockEvent)

                expect(component.uploading).toBe(true)
                expect(component.uploadedFiles).toContain(mockFile)
                expect(component.uploadedFilesAssets.length).toBe(initialLength + 1)
                expect(component.dataSource.data.length).toBe(initialLength + 1)
            })

            it('should handle multiple files', () => {
                const mockFiles = [
                    { name: 'test1.pdf', type: 'application/pdf', size: 1024 },
                    { name: 'test2.pdf', type: 'application/pdf', size: 2048 }
                ]

                const mockEvent = {
                    target: {
                        files: mockFiles
                    }
                }

                const initialLength = component.uploadedFilesAssets.length

                component.onFilesAdded(mockEvent)

                expect(component.uploadedFiles.length).toBe(2)
                expect(component.uploadedFilesAssets.length).toBe(initialLength + 2)
                expect(component.dataSource.data.length).toBe(initialLength + 2)
            })

            it('should set correct file information', () => {
                const mockFile = {
                    name: 'test.pdf',
                    type: 'application/pdf',
                    size: 1024
                }

                const mockEvent = {
                    target: {
                        files: [mockFile]
                    }
                }

                component.onFilesAdded(mockEvent)

                const addedFile = component.uploadedFilesAssets[0]
                expect(addedFile.filename).toBe(mockFile.name)
                expect(addedFile.filetype).toBe(mockFile.type)
                expect(addedFile.filesize).toBe(mockFile.size)
                expect(addedFile.uploadstatus).toBe(100)
                expect(addedFile.uploadedon).toBeInstanceOf(Date)
            })

            it('should handle empty file list', () => {
                const mockEvent = {
                    target: {
                        files: null
                    }
                }

                const initialLength = component.uploadedFilesAssets.length

                component.onFilesAdded(mockEvent)

                expect(component.uploading).toBe(true)
                expect(component.uploadedFilesAssets.length).toBe(initialLength)
            })
        })

        describe('addSelectedFiles', () => {
            it('should close dialog with form value', () => {
                const mockForm = {
                    value: {
                        files: 'test-files'
                    }
                }

                component.addSelectedFiles(mockForm)

                expect(mockDialogRef.close).toHaveBeenCalledWith({
                    data: mockForm.value
                })
            })
        })
    })

    describe('Component Properties', () => {
        it('should initialize files as empty Set', () => {
            expect(component.files).toBeInstanceOf(Set)
            expect(component.files.size).toBe(0)
        })

        it('should initialize progressInfos as empty array', () => {
            expect(component.progressInfos).toEqual([])
        })

        it('should have correct initial boolean flags', () => {
            expect(component.uploading).toBe(false)
            expect(component.uploadSuccessful).toBe(false)
        })
    })

    describe('Error Handling', () => {
        it('should handle getProfile error gracefully', () => {
            const errorComponent = new BudgetproofspopupComponent(
                mockDialogRef as any,
                mockData,
                {
                    getProfile: jest.fn().mockReturnValue(of(null))
                } as any
            )

            expect(errorComponent.userData).toBeNull()
        })
    })

    describe('Form Validation', () => {
        it('should have invalid form initially', () => {
            expect(component.uploadform.valid).toBe(false)
        })

        it('should be valid when files control has value', () => {
            component.uploadform.get('files')?.setValue('some-file')
            expect(component.uploadform.valid).toBe(true)
        })
    })
})