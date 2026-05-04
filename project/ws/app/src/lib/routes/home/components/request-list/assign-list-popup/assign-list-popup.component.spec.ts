import { UntypedFormBuilder } from '@angular/forms'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'
import { of, throwError } from 'rxjs'

import { AssignListPopupComponent } from './assign-list-popup.component'
import { ProfileV2Service } from '../../../services/home.servive'
import { ConfigResolveService } from '../../../resolvers/config-resolve.service'
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'

describe('AssignListPopupComponent', () => {
    let component: AssignListPopupComponent
    let mockHomeService: jest.Mocked<ProfileV2Service>
    let mockConfigService: jest.Mocked<ConfigResolveService>
    let mockDialogRef: jest.Mocked<MatDialogRef<AssignListPopupComponent>>
    let mockDialogData: any

    const mockProviderList = [
        {
            interestId: 1,
            demandId: 123,
            ownerId: 456,
            orgId: 789,
            orgName: 'Provider A',
            description: 'Test provider A',
            turnAroundTime: '2 days',
            status: 'active',
            createdOn: '2024-01-01',
            updatedOn: '2024-01-02'
        },
        {
            interestId: 2,
            demandId: 123,
            ownerId: 457,
            orgId: 790,
            orgName: 'Provider B',
            description: 'Test provider B',
            turnAroundTime: '3 days',
            status: 'active',
            createdOn: '2024-01-01',
            updatedOn: '2024-01-02'
        }
    ]

    const mockUserProfile = {
        userId: 'user123',
        name: 'Test User'
    }

    beforeEach(() => {
        mockHomeService = {
            getOrgInterestList: jest.fn(),
            assignToOrg: jest.fn()
        } as any

        mockConfigService = {
            confService: {
                userProfile: mockUserProfile,
                userProfileV2: null
            }
        } as any

        mockDialogRef = {
            close: jest.fn()
        } as any

        mockDialogData = {
            demand_id: 123,
            assignedProvider: null
        }

        const fb = new UntypedFormBuilder()
        component = new AssignListPopupComponent(
            fb,
            mockHomeService,
            mockDialogData,
            mockConfigService,
            mockDialogRef
        )
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize form with required assignee control', () => {
            expect(component.requestForm).toBeDefined()
            expect(component.requestForm.get('assignee')).toBeDefined()
            expect(component.requestForm.get('assignee')?.hasError('required')).toBeTruthy()
        })

        it('should initialize component properties with default values', () => {
            expect(component.displayedColumns).toEqual(['select', 'providerName', 'details', 'eta'])
            expect(component.providerList).toEqual([])
            expect(component.pageNumber).toBe(0)
            expect(component.pageSize).toBe(5)
            expect(component.assignText).toBe('')
            expect(component.submitAssign).toBe('')
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            mockHomeService.getOrgInterestList.mockReturnValue(of({
                data: mockProviderList,
                totalCount: 2
            }))
        })

        it('should set assign text values', () => {
            component.ngOnInit()

            expect(component.assignText).toBe('Assign')
            expect(component.submitAssign).toBe('Assign')
        })

        it('should call getInterestOrgList', () => {
            component.ngOnInit()

            expect(mockHomeService.getOrgInterestList).toHaveBeenCalled()
        })

        it('should set user profile from userProfile', () => {
            component.ngOnInit()

            expect(component.fullProfile).toEqual(mockUserProfile)
            expect(component.userId).toBe('user123')
        })

        it('should set user profile from userProfileV2 when userProfile is null', () => {
            const mockUserProfileV2 = { userId: 'userV2_123', name: 'Test User V2' }
            mockConfigService.confService.userProfile = null
            mockConfigService.confService.userProfileV2 = mockUserProfileV2

            component.ngOnInit()

            expect(component.fullProfile).toEqual(mockUserProfileV2)
            expect(component.userId).toBe('userV2_123')
        })
    })

    describe('getInterestOrgList', () => {
        it('should fetch org interest list successfully', () => {
            const mockResponse = {
                data: mockProviderList,
                totalCount: 2
            }
            mockHomeService.getOrgInterestList.mockReturnValue(of(mockResponse))

            component.getInterestOrgList()

            expect(mockHomeService.getOrgInterestList).toHaveBeenCalledWith({
                filterCriteriaMap: {
                    demandId: 123
                },
                requestedFields: [],
                pageNumber: 0,
                pageSize: 5
            })
            expect(component.providerList).toEqual(mockProviderList)
            expect(component.providerCount).toBe(2)
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
        })

        it('should handle empty response data', () => {
            mockHomeService.getOrgInterestList.mockReturnValue(of({ data: null }))

            component.getInterestOrgList()

            expect(component.providerList).toEqual([])
        })

        it('should use current pageNumber and pageSize in request', () => {
            component.pageNumber = 2
            component.pageSize = 10
            mockHomeService.getOrgInterestList.mockReturnValue(of({ data: [] }))

            component.getInterestOrgList()

            expect(mockHomeService.getOrgInterestList).toHaveBeenCalledWith(
                expect.objectContaining({
                    pageNumber: 2,
                    pageSize: 10
                })
            )
        })
    })

    describe('setFormData', () => {
        beforeEach(() => {
            component.providerList = [...mockProviderList]
        })

        it('should set re-assign text when assignedProvider exists', () => {
            component.data.assignedProvider = 'Provider A'

            component.setFormData()

            expect(component.assignText).toBe('Re-assign')
            expect(component.submitAssign).toBe('Re-Assign')
        })

        it('should move assigned provider to first position in list', () => {
            component.data.assignedProvider = 'Provider B'

            component.setFormData()

            expect(component.providerList[0].orgName).toBe('Provider B')
            expect(component.providerList[1].orgName).toBe('Provider A')
        })

        it('should handle non-existent assigned provider gracefully', () => {
            component.data.assignedProvider = 'Non-existent Provider'
            const originalList = [...component.providerList]

            component.setFormData()

            expect(component.providerList).toEqual(originalList)
        })

        it('should not modify text when no assignedProvider', () => {
            component.assignText = 'Assign'
            component.submitAssign = 'Assign'
            component.data.assignedProvider = null

            component.setFormData()

            expect(component.assignText).toBe('Assign')
            expect(component.submitAssign).toBe('Assign')
        })
    })

    describe('onChangePage', () => {
        beforeEach(() => {
            mockHomeService.getOrgInterestList.mockReturnValue(of({ data: [] }))
        })

        it('should update pageNumber and pageSize', () => {
            const event = { pageIndex: 2, pageSize: 10 }

            component.onChangePage(event)

            expect(component.pageNumber).toBe(2)
            expect(component.pageSize).toBe(10)
        })

        it('should call getInterestOrgList after page change', () => {
            const event = { pageIndex: 1, pageSize: 5 }

            component.onChangePage(event)

            expect(mockHomeService.getOrgInterestList).toHaveBeenCalled()
        })
    })

    describe('onSubmitAssign', () => {
        const mockSelectedProvider = mockProviderList[0]

        beforeEach(() => {
            component.userId = 'user123'
            component.requestForm.patchValue({ assignee: mockSelectedProvider })
        })

        it('should call assignToOrg with correct request data', () => {
            mockHomeService.assignToOrg.mockReturnValue(of({ success: true }))

            component.onSubmitAssign()

            expect(mockHomeService.assignToOrg).toHaveBeenCalledWith({
                interestId: mockSelectedProvider.interestId,
                demandId: mockSelectedProvider.demandId,
                ownerId: mockSelectedProvider.ownerId,
                orgId: mockSelectedProvider.orgId,
                description: mockSelectedProvider.description,
                turnAroundTime: mockSelectedProvider.turnAroundTime,
                orgName: mockSelectedProvider.orgName,
                status: mockSelectedProvider.status,
                createdOn: mockSelectedProvider.createdOn,
                updatedOn: mockSelectedProvider.updatedOn
            })
        })

        it('should close dialog with confirmed data on success', () => {
            mockHomeService.assignToOrg.mockReturnValue(of({ success: true }))

            component.onSubmitAssign()

            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: 'confirmed' })
        })

        it('should close dialog with error on failure', () => {
            const mockError = new Error('Assignment failed')
            mockHomeService.assignToOrg.mockReturnValue(throwError(mockError))

            component.onSubmitAssign()

            expect(mockDialogRef.close).toHaveBeenCalledWith({ error: mockError })
        })

        it('should not call assignToOrg when no provider selected', () => {
            component.requestForm.patchValue({ assignee: null })

            component.onSubmitAssign()

            expect(mockHomeService.assignToOrg).not.toHaveBeenCalled()
        })

        it('should not call assignToOrg when form is invalid', () => {
            component.requestForm.patchValue({ assignee: '' })

            component.onSubmitAssign()

            expect(mockHomeService.assignToOrg).not.toHaveBeenCalled()
        })
    })

    describe('cancel', () => {
        it('should close dialog without data', () => {
            component.cancel()

            expect(mockDialogRef.close).toHaveBeenCalledWith()
        })
    })

    describe('getAssigneeList', () => {
        it('should not throw when called', () => {
            expect(() => component.getAssigneeList()).not.toThrow()
        })
    })

    describe('Form Validation', () => {
        it('should mark assignee as required', () => {
            const assigneeControl = component.requestForm.get('assignee')

            assigneeControl?.setValue('')
            expect(assigneeControl?.hasError('required')).toBeTruthy()

            assigneeControl?.setValue(mockProviderList[0])
            expect(assigneeControl?.hasError('required')).toBeFalsy()
        })

        it('should have valid form when assignee is selected', () => {
            component.requestForm.patchValue({ assignee: mockProviderList[0] })

            expect(component.requestForm.valid).toBeTruthy()
        })

        it('should have invalid form when no assignee selected', () => {
            component.requestForm.patchValue({ assignee: '' })

            expect(component.requestForm.valid).toBeFalsy()
        })
    })

    describe('Error Handling', () => {
        it('should handle getOrgInterestList error gracefully', () => {
            mockHomeService.getOrgInterestList.mockReturnValue(throwError('API Error'))

            expect(() => component.getInterestOrgList()).not.toThrow()
        })

        it('should handle missing data properties in setFormData', () => {
            component.data = {}
            component.providerList = [...mockProviderList]

            expect(() => component.setFormData()).not.toThrow()
        })

        it('should handle missing demand_id in getInterestOrgList', () => {
            component.data = {}
            mockHomeService.getOrgInterestList.mockReturnValue(of({ data: null }))

            expect(() => component.getInterestOrgList()).not.toThrow()
        })
    })

    describe('Integration Tests', () => {
        it('should complete full workflow: init -> load data -> assign', async () => {
            // Setup
            mockHomeService.getOrgInterestList.mockReturnValue(of({
                data: mockProviderList,
                totalCount: 2
            }))
            mockHomeService.assignToOrg.mockReturnValue(of({ success: true }))

            // Initialize component
            component.ngOnInit()

            // Verify data loaded
            expect(component.providerList).toEqual(mockProviderList)

            // Select provider and submit
            component.requestForm.patchValue({ assignee: mockProviderList[0] })
            component.onSubmitAssign()

            // Verify assignment completed
            expect(mockHomeService.assignToOrg).toHaveBeenCalled()
            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: 'confirmed' })
        })

        it('should handle re-assignment workflow', () => {
            component.data.assignedProvider = 'Provider B'
            mockHomeService.getOrgInterestList.mockReturnValue(of({
                data: mockProviderList,
                totalCount: 2
            }))

            component.ngOnInit()

            expect(component.assignText).toBe('Re-assign')
            expect(component.providerList[0].orgName).toBe('Provider B')
        })
    })
})