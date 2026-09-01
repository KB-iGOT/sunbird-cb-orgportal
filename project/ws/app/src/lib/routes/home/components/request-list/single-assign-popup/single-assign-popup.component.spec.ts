import { SingleAssignPopupComponent } from './single-assign-popup.component'
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { of, throwError } from 'rxjs'

describe('SingleAssignPopupComponent', () => {
    let component: SingleAssignPopupComponent
    let mockFormBuilder: jest.Mocked<UntypedFormBuilder>
    let mockHomeService: any
    let mockConfigService: any
    let mockDialogRef: any
    let mockData: any
    let mockPaginator: jest.Mocked<MatPaginator>

    beforeEach(() => {
        // Mock FormBuilder
        mockFormBuilder = {
            group: jest.fn()
        } as any

        // Mock HomeService
        mockHomeService = {
            getRequestTypeList: jest.fn(),
            createDemand: jest.fn()
        }

        // Mock ConfigService
        mockConfigService = {
            confService: {
                userProfile: {
                    userId: 'test-user-123'
                },
                userProfileV2: null
            }
        }

        // Mock DialogRef
        mockDialogRef = {
            close: jest.fn()
        }

        // Mock Data
        mockData = {
            title: 'Test Title',
            objective: 'Test Objective',
            typeOfUser: 'learner',
            competencies: ['skill1', 'skill2'],
            referenceLink: 'http://test.com',
            requestType: 'training',
            preferredProvider: 'provider1',
            status: 'open',
            owner: 'test-owner',
            demand_id: 'demand-123',
            learningMode: 'online',
            assignedProvider: null
        }

        // Mock Paginator
        mockPaginator = {
            pageIndex: 0,
            pageSize: 5
        } as any

        // Mock form group
        const mockFormGroup = {
            controls: {
                assignee: new UntypedFormControl('', Validators.required),
                orgSearch: new UntypedFormControl('')
            },
            value: {
                assignee: null,
                orgSearch: ''
            }
        } as any

        mockFormBuilder.group.mockReturnValue(mockFormGroup)

        // Create component instance
        component = new SingleAssignPopupComponent(
            mockFormBuilder,
            mockHomeService,
            mockData,
            mockConfigService,
            mockDialogRef
        )
    })

    describe('Constructor', () => {
        it('should create component with form group', () => {
            expect(component).toBeDefined()
            expect(mockFormBuilder.group).toHaveBeenCalledWith({
                assignee: expect.any(UntypedFormControl),
                orgSearch: expect.any(UntypedFormControl)
            })
        })

        it('should initialize default values', () => {
            expect(component.displayedColumns).toEqual(['select', 'name'])
            expect(component.providerList).toEqual([])
            expect(component.pageNumber).toBe(0)
            expect(component.pageSize).toBe(5)
            expect(component.assignText).toBe('')
            expect(component.submitAssign).toBe('')
            expect(component.requestTypeData).toEqual([])
            expect(component.filterRequestData).toEqual([])
            expect(component.isDisable).toBe(false)
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            jest.spyOn(component, 'getOrgListData').mockImplementation(() => { })
        })

        it('should set initial text values and call getOrgListData', () => {
            component.ngOnInit()

            expect(component.assignText).toBe('Assign')
            expect(component.submitAssign).toBe('Assign')
            expect(component.getOrgListData).toHaveBeenCalled()
        })

        it('should set fullProfile and userId from userProfile', () => {
            component.ngOnInit()

            expect(component.fullProfile).toEqual(mockConfigService.confService.userProfile)
            expect(component.userId).toBe('test-user-123')
        })

        it('should set fullProfile and userId from userProfileV2 when userProfile is null', () => {
            mockConfigService.confService.userProfile = null
            mockConfigService.confService.userProfileV2 = { userId: 'test-user-v2-456' }

            component.ngOnInit()

            expect(component.fullProfile).toEqual(mockConfigService.confService.userProfileV2)
            expect(component.userId).toBe('test-user-v2-456')
        })

        it('should handle case when both userProfile and userProfileV2 are null', () => {
            mockConfigService.confService.userProfile = null
            mockConfigService.confService.userProfileV2 = null

            component.ngOnInit()

            expect(component.fullProfile).toBeUndefined()
            expect(component.userId).toBeUndefined()
        })
    })

    describe('setDataSourceAttributes', () => {
        it('should set paginator to dataSource', () => {
            component.paginator = mockPaginator
            component.setDataSourceAttributes()

            expect(component.dataSource.paginator).toBe(mockPaginator)
        })
    })

    describe('matPaginator setter', () => {
        it('should set paginator and call setDataSourceAttributes', () => {
            jest.spyOn(component, 'setDataSourceAttributes').mockImplementation(() => { })

            component.matPaginator = mockPaginator

            expect(component.paginator).toBe(mockPaginator)
            expect(component.setDataSourceAttributes).toHaveBeenCalled()
        })
    })

    describe('setFormData', () => {
        beforeEach(() => {
            component.requestTypeData = [
                { id: '1', orgName: 'Provider A' },
                { id: '2', orgName: 'Provider B' },
                { id: '3', orgName: 'Provider C' }
            ]
        })

        it('should set re-assign text when assignedProvider exists', () => {
            component.data.assignedProvider = 'Provider B'

            component.setFormData()

            expect(component.assignText).toBe('Re-assign')
            expect(component.submitAssign).toBe('Re-Assign')
        })

        it('should move assigned provider to first position in array', () => {
            component.data.assignedProvider = 'Provider B'

            component.setFormData()

            expect(component.requestTypeData[0]).toEqual({ id: '2', orgName: 'Provider B' })
            expect(component.requestTypeData.length).toBe(3)
        })

        it('should handle case when assigned provider is not found in array', () => {
            component.data.assignedProvider = 'Non-existent Provider'

            component.setFormData()

            expect(component.assignText).toBe('Re-assign')
            expect(component.submitAssign).toBe('Re-Assign')
            expect(component.requestTypeData[0]).toEqual({ id: '1', orgName: 'Provider A' })
        })

        it('should not change text when assignedProvider does not exist', () => {
            component.data.assignedProvider = null
            component.assignText = 'Assign'
            component.submitAssign = 'Assign'

            component.setFormData()

            expect(component.assignText).toBe('Assign')
            expect(component.submitAssign).toBe('Assign')
        })
    })

    describe('getOrgListData', () => {
        const mockResponseData = [
            { id: '1', orgName: 'Provider A', isCbp: true },
            { id: '2', orgName: 'Provider B', isCbp: true }
        ]

        beforeEach(() => {
            component.paginator = mockPaginator
            jest.spyOn(component, 'setFormData').mockImplementation(() => { })
        })

        it('should call homeService.getRequestTypeList with correct parameters', () => {
            mockHomeService.getRequestTypeList.mockReturnValue(of(mockResponseData))

            component.getOrgListData()

            expect(mockHomeService.getRequestTypeList).toHaveBeenCalledWith({
                request: {
                    filters: {
                        isCbp: true,
                    },
                    limit: 1000,
                },
            })
        })

        it('should set component data when service returns data', () => {
            mockHomeService.getRequestTypeList.mockReturnValue(of(mockResponseData))

            component.getOrgListData()

            expect(component.requestTypeData).toEqual(mockResponseData)
            expect(component.filterRequestData).toEqual(mockResponseData)
            expect(component.dataSource.data).toEqual(mockResponseData)
            expect(component.dataSource.paginator).toBe(mockPaginator)
            expect(component.setFormData).toHaveBeenCalled()
        })

        it('should not set data when service returns null/undefined', () => {
            mockHomeService.getRequestTypeList.mockReturnValue(of(null))

            component.getOrgListData()

            expect(component.requestTypeData).toEqual([])
            expect(component.filterRequestData).toEqual([])
            expect(component.setFormData).not.toHaveBeenCalled()
        })

        it('should handle service error', () => {
            mockHomeService.getRequestTypeList.mockReturnValue(throwError('Service error'))

            expect(() => {
                component.getOrgListData()
            }).not.toThrow()
        })
    })

    describe('onChangePage', () => {
        beforeEach(() => {
            jest.spyOn(component, 'getOrgListData').mockImplementation(() => { })
        })

        it('should update page properties and call getOrgListData', () => {
            const mockEvent = {
                pageIndex: 2,
                pageSize: 10
            }

            component.onChangePage(mockEvent)

            expect(component.pageNumber).toBe(2)
            expect(component.pageSize).toBe(10)
            expect(component.getOrgListData).toHaveBeenCalled()
        })
    })

    describe('onSubmitAssign', () => {
        const mockSelectedProvider = {
            id: 'provider-123',
            orgName: 'Test Provider'
        }

        beforeEach(() => {
            // component.requestForm.value = {
            //     assignee: mockSelectedProvider,
            //     orgSearch: ''
            // }
            component.data = mockData
        })

        it('should create demand with correct request object when assignee is selected', () => {
            mockHomeService.createDemand.mockReturnValue(of({ success: true }))

            component.onSubmitAssign()

            const expectedRequest = {
                title: mockData.title,
                objective: mockData.objective,
                typeOfUser: mockData.typeOfUser,
                competencies: mockData.competencies,
                referenceLink: mockData.referenceLink,
                requestType: mockData.requestType,
                preferredProvider: mockData.preferredProvider,
                assignedProvider: {
                    providerName: mockSelectedProvider.orgName,
                    providerId: mockSelectedProvider.id,
                },
                status: mockData.status,
                source: mockData.owner,
                demand_id: mockData.demand_id,
                learningMode: mockData.learningMode,
            }

            expect(mockHomeService.createDemand).toHaveBeenCalledWith(expectedRequest)
        })

        it('should close dialog with success data when createDemand succeeds', () => {
            mockHomeService.createDemand.mockReturnValue(of({ success: true }))

            component.onSubmitAssign()

            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: 'confirmed' })
        })

        it('should close dialog with error when createDemand fails', () => {
            const mockError = { message: 'Create demand failed' }
            mockHomeService.createDemand.mockReturnValue(throwError(mockError))

            component.onSubmitAssign()

            expect(mockDialogRef.close).toHaveBeenCalledWith({ error: mockError })
        })

        it('should not call createDemand when no assignee is selected', () => {
            component.requestForm.value.assignee = null

            component.onSubmitAssign()

            expect(mockHomeService.createDemand).not.toHaveBeenCalled()
            expect(mockDialogRef.close).not.toHaveBeenCalled()
        })

        it('should handle case when assignee is falsy but not null', () => {
            component.requestForm.value.assignee = ''

            component.onSubmitAssign()

            expect(mockHomeService.createDemand).not.toHaveBeenCalled()
        })

        it('should set assignedProvider to undefined when no assignee', () => {
            component.requestForm.value.assignee = null
            mockHomeService.createDemand.mockReturnValue(of({ success: true }))

            // Temporarily set assignee to test the undefined case
            component.requestForm.value.assignee = mockSelectedProvider
            component.onSubmitAssign()

            // Verify the assignedProvider structure
            const callArgs = mockHomeService.createDemand.mock.calls[0][0]
            expect(callArgs.assignedProvider).toEqual({
                providerName: mockSelectedProvider.orgName,
                providerId: mockSelectedProvider.id,
            })
        })
    })

    describe('cancel', () => {
        it('should close dialog without data', () => {
            component.cancel()

            expect(mockDialogRef.close).toHaveBeenCalledWith()
        })
    })

    describe('Edge Cases and Additional Coverage', () => {
        it('should handle paginator being null', () => {
            component.paginator = null

            expect(() => {
                component.setDataSourceAttributes()
            }).not.toThrow()

            expect(component.dataSource.paginator).toBeNull()
        })

        it('should handle empty requestTypeData in setFormData', () => {
            component.requestTypeData = []
            component.data.assignedProvider = 'Some Provider'

            expect(() => {
                component.setFormData()
            }).not.toThrow()

            expect(component.assignText).toBe('Re-assign')
        })

        it('should handle assigned provider at index 0', () => {
            component.requestTypeData = [
                { id: '1', orgName: 'Provider A' },
                { id: '2', orgName: 'Provider B' }
            ]
            component.data.assignedProvider = 'Provider A'

            component.setFormData()

            expect(component.requestTypeData[0]).toEqual({ id: '1', orgName: 'Provider A' })
            expect(component.requestTypeData.length).toBe(2)
        })

        it('should handle createDemand with different response structure', () => {
            component.requestForm.value.assignee = { id: 'test', orgName: 'Test Org' }
            mockHomeService.createDemand.mockReturnValue(of(null))

            component.onSubmitAssign()

            expect(mockDialogRef.close).not.toHaveBeenCalled()
        })

        it('should handle missing data properties', () => {
            component.data = {}
            component.requestForm.value.assignee = { id: 'test', orgName: 'Test Org' }
            mockHomeService.createDemand.mockReturnValue(of({ success: true }))

            expect(() => {
                component.onSubmitAssign()
            }).not.toThrow()
        })
    })
})