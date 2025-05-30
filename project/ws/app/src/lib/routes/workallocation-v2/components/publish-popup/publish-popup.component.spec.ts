import { of, throwError } from 'rxjs'
import { PublishPopupComponent } from './publish-popup.component'

// Mock dependencies
const mockUploadService = {
    getProfile: jest.fn(),
    crreateAsset: jest.fn(),
    uploadFile: jest.fn(),
    updateWorkOrder: jest.fn(),
    getDraftPDF: jest.fn()
}

const mockRouter = {
    navigate: jest.fn()
}

const mockDialogRef = {
    close: jest.fn()
}

const mockConfigSvc = {
    userProfile: {
        rootOrgId: 'test-org-id',
        departmentName: 'Test Department'
    }
}

const mockDialogData = {
    data: {
        id: 'test-workorder-id',
        name: 'Test Work Order',
        status: 'Draft'
    }
}

describe('PublishPopupComponent', () => {
    let component: PublishPopupComponent
    let mockFile: any

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Mock user data - THIS MUST BE SET BEFORE COMPONENT CREATION
        const mockUserData = {
            result: {
                response: {
                    id: 'user-123',
                    firstName: 'John',
                    lastName: 'Doe'
                }
            }
        }
        mockUploadService.getProfile.mockReturnValue(of(mockUserData))

        // Create component instance AFTER setting up mocks
        component = new PublishPopupComponent(
            mockUploadService as any,
            mockRouter as any,
            mockDialogRef as any,
            mockConfigSvc as any,
            mockDialogData
        )

        // Mock ViewChild file element
        mockFile = {
            nativeElement: {
                click: jest.fn()
            }
        }
        component.file = mockFile
    })

    describe('Constructor and Initialization', () => {
        it('should create component instance', () => {
            expect(component).toBeDefined()
            expect(component.workorderData).toEqual(mockDialogData.data)
        })

        it('should initialize properties with default values', () => {
            expect(component.files).toBeInstanceOf(Set)
            expect(component.uploading).toBe(false)
            expect(component.uploadSuccessful).toBe(false)
            expect(component.comparePDF).toBe(false)
        })

        it('should fetch user profile on initialization', () => {
            expect(mockUploadService.getProfile).toHaveBeenCalled()
        })

        it('should set userData when profile is fetched successfully', (done) => {
            const expectedUserData = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe'
            }

            // Wait for the subscription to complete
            setTimeout(() => {
                expect(component.userData).toEqual(expectedUserData)
                done()
            }, 0)
        })
    })

    describe('addFiles', () => {
        it('should trigger file input click', () => {
            component.addFiles()
            expect(mockFile.nativeElement.click).toHaveBeenCalled()
        })
    })

    describe('onFilesAdded', () => {
        it('should handle file selection and set uploading to true', () => {
            const mockFileEvent = {
                target: {
                    files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })]
                }
            }

            const closeDialogSpy = jest.spyOn(component, 'closeDialog').mockImplementation()

            component.onFilesAdded(mockFileEvent)

            expect(component.uploading).toBe(true)
            expect(component.uploadedFile).toEqual(mockFileEvent.target.files[0])
            expect(closeDialogSpy).toHaveBeenCalled()
        })

        it('should handle empty file list', () => {
            const mockFileEvent = {
                target: {
                    files: null
                }
            }

            const closeDialogSpy = jest.spyOn(component, 'closeDialog').mockImplementation()

            component.onFilesAdded(mockFileEvent)

            expect(component.uploading).toBe(true)
            expect(closeDialogSpy).not.toHaveBeenCalled()
        })
    })

    describe('closeDialog', () => {
        beforeEach(() => {
            component.userData = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe'
            }
            component.uploadedFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
        })

        it('should create asset and upload file successfully', (done) => {
            const mockAssetResponse = { result: { identifier: 'asset-123' } }
            const mockUploadResponse = { result: { artifactUrl: 'https://example.com/file.pdf' } }
            const mockUpdateResponse = { result: { message: 'Successful' } }

            mockUploadService.crreateAsset.mockReturnValue(of(mockAssetResponse))
            mockUploadService.uploadFile.mockReturnValue(of(mockUploadResponse))
            mockUploadService.updateWorkOrder.mockReturnValue(of(mockUpdateResponse))

            component.closeDialog()

            setTimeout(() => {
                expect(mockUploadService.crreateAsset).toHaveBeenCalledWith({
                    request: {
                        content: {
                            name: 'PDF Asset',
                            creator: 'John',
                            createdBy: 'user-123',
                            code: 'pdf asset',
                            mimeType: 'application/pdf',
                            contentType: 'Asset',
                            primaryCategory: 'Asset',
                            organisation: ['Test Department'],
                            createdFor: ['test-org-id']
                        }
                    }
                })

                expect(mockUploadService.uploadFile).toHaveBeenCalledWith(
                    'asset-123',
                    expect.any(FormData)
                )

                expect(component.workorderData.signedPdfLink).toBe('https://example.com/file.pdf')
                expect(mockUploadService.updateWorkOrder).toHaveBeenCalledWith(component.workorderData)
                expect(component.uploading).toBe(false)
                done()
            }, 0)
        })

        it('should handle create asset error', (done) => {
            mockUploadService.crreateAsset.mockReturnValue(throwError('Asset creation failed'))

            component.closeDialog()

            setTimeout(() => {
                expect(mockUploadService.crreateAsset).toHaveBeenCalled()
                expect(mockUploadService.uploadFile).not.toHaveBeenCalled()
                done()
            }, 0)
        })

        it('should handle file upload error', (done) => {
            const mockAssetResponse = { result: { identifier: 'asset-123' } }
            mockUploadService.crreateAsset.mockReturnValue(of(mockAssetResponse))
            mockUploadService.uploadFile.mockReturnValue(throwError('Upload failed'))

            component.closeDialog()

            setTimeout(() => {
                expect(mockUploadService.crreateAsset).toHaveBeenCalled()
                expect(mockUploadService.uploadFile).toHaveBeenCalled()
                expect(mockUploadService.updateWorkOrder).not.toHaveBeenCalled()
                done()
            }, 0)
        })

        it('should create request with empty arrays when userProfile is not available', (done) => {
            const mockUploadServiceForTest = {
                getProfile: jest.fn().mockReturnValue(of({
                    result: {
                        response: {
                            id: 'user-123',
                            firstName: 'John',
                            lastName: 'Doe'
                        }
                    }
                })),
                crreateAsset: jest.fn(),
                uploadFile: jest.fn(),
                updateWorkOrder: jest.fn(),
                getDraftPDF: jest.fn()
            }

            const componentWithoutProfile = new PublishPopupComponent(
                mockUploadServiceForTest as any,
                mockRouter as any,
                mockDialogRef as any,
                { userProfile: null } as any,
                mockDialogData
            )
            componentWithoutProfile.userData = component.userData
            componentWithoutProfile.uploadedFile = component.uploadedFile

            const mockAssetResponse = { result: { identifier: 'asset-123' } }
            const mockUploadResponse = { result: { artifactUrl: 'https://example.com/file.pdf' } }
            const mockUpdateResponse = { result: { message: 'Successful' } }

            mockUploadServiceForTest.crreateAsset.mockReturnValue(of(mockAssetResponse))
            mockUploadServiceForTest.uploadFile.mockReturnValue(of(mockUploadResponse))
            mockUploadServiceForTest.updateWorkOrder.mockReturnValue(of(mockUpdateResponse))

            componentWithoutProfile.closeDialog()

            setTimeout(() => {
                expect(mockUploadServiceForTest.crreateAsset).toHaveBeenCalledWith({
                    request: {
                        content: {
                            name: 'PDF Asset',
                            creator: 'John',
                            createdBy: 'user-123',
                            code: 'pdf asset',
                            mimeType: 'application/pdf',
                            contentType: 'Asset',
                            primaryCategory: 'Asset',
                            organisation: [],
                            createdFor: []
                        }
                    }
                })
                done()
            }, 0)
        })
    })

    describe('compareFiles', () => {
        beforeEach(() => {
            component.workorderData = {
                id: 'test-id',
                signedPdfLink: 'https://example.com/signed.pdf'
            }
        })

        it('should fetch draft PDF and set comparison data', (done) => {
            const mockPdfData = new ArrayBuffer(8)
            mockUploadService.getDraftPDF.mockReturnValue(of(mockPdfData))

            // Mock URL.createObjectURL
            global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url')

            component.compareFiles()

            setTimeout(() => {
                expect(mockUploadService.getDraftPDF).toHaveBeenCalledWith('test-id')
                expect(component.comparePDF).toBe(true)
                expect(component.signedPDF).toBe('https://example.com/signed.pdf')
                expect(component.draftPDF).toBe('blob:mock-url')
                done()
            }, 0)
        })

        it('should handle getDraftPDF error', (done) => {
            mockUploadService.getDraftPDF.mockReturnValue(throwError('Failed to fetch draft PDF'))

            component.compareFiles()

            setTimeout(() => {
                expect(mockUploadService.getDraftPDF).toHaveBeenCalledWith('test-id')
                expect(component.comparePDF).toBe(false)
                done()
            }, 0)
        })
    })

    describe('publishOrder', () => {
        it('should update work order status to Published', (done) => {
            const mockUpdateResponse = { result: { message: 'Successful' } }
            mockUploadService.updateWorkOrder.mockReturnValue(of(mockUpdateResponse))

            component.publishOrder()

            expect(component.comparePDF).toBe(false)
            expect(component.uploading).toBe(false)
            expect(component.uploadedFile).toBe('')
            expect(component.uploadSuccessful).toBe(true)
            expect(component.workorderData.status).toBe('Published')

            setTimeout(() => {
                expect(mockUploadService.updateWorkOrder).toHaveBeenCalledWith(component.workorderData)
                expect(component.uploadSuccessful).toBe(true)
                done()
            }, 0)
        })

        it('should handle updateWorkOrder error', (done) => {
            mockUploadService.updateWorkOrder.mockReturnValue(throwError('Update failed'))

            component.publishOrder()

            setTimeout(() => {
                expect(mockUploadService.updateWorkOrder).toHaveBeenCalled()
                // uploadSuccessful should still be true from the initial setting
                expect(component.uploadSuccessful).toBe(true)
                done()
            }, 0)
        })
    })

    describe('dismiss', () => {
        it('should close dialog and navigate to home', () => {
            component.dismiss()

            expect(mockDialogRef.close).toHaveBeenCalled()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/workallocation', { tab: 'Published' }])
        })
    })

    describe('reupload', () => {
        it('should reset upload-related properties', () => {
            // Set some values first
            component.comparePDF = true
            component.uploadedFile = 'some-file'
            component.uploading = true
            component.uploadSuccessful = true

            component.reupload()

            expect(component.comparePDF).toBe(false)
            expect(component.uploadedFile).toBe('')
            expect(component.uploading).toBe(false)
            expect(component.uploadSuccessful).toBe(false)
        })
    })

    describe('ngOnInit', () => {
        it('should execute without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('Error Handling', () => {
        it('should handle getProfile error gracefully', () => {
            const mockUploadServiceWithError = {
                getProfile: jest.fn().mockReturnValue(throwError('Profile fetch failed')),
                crreateAsset: jest.fn(),
                uploadFile: jest.fn(),
                updateWorkOrder: jest.fn(),
                getDraftPDF: jest.fn()
            }

            const componentWithError = new PublishPopupComponent(
                mockUploadServiceWithError as any,
                mockRouter as any,
                mockDialogRef as any,
                mockConfigSvc as any,
                mockDialogData
            )

            expect(componentWithError.userData).toBeUndefined()
        })
    })

    describe('Edge Cases', () => {
        it('should handle undefined workorderData', () => {
            const componentWithUndefinedData = new PublishPopupComponent(
                mockUploadService as any,
                mockRouter as any,
                mockDialogRef as any,
                mockConfigSvc as any,
                { data: undefined }
            )

            expect(componentWithUndefinedData.workorderData).toBeUndefined()
        })

        it('should handle file selection with multiple files', () => {
            const mockFileEvent = {
                target: {
                    files: [
                        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
                        new File(['test2'], 'test2.pdf', { type: 'application/pdf' })
                    ]
                }
            }

            const closeDialogSpy = jest.spyOn(component, 'closeDialog').mockImplementation()

            component.onFilesAdded(mockFileEvent)

            // Should only use the first file
            expect(component.uploadedFile).toEqual(mockFileEvent.target.files[0])
            expect(closeDialogSpy).toHaveBeenCalled()
        })
    })
})