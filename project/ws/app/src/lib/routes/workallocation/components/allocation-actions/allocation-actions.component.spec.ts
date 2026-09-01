import { AllocationActionsComponent } from './allocation-actions.component'
// import { AllocationService } from '../../services/allocation.service'
import { UntypedFormBuilder } from '@angular/forms'
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { of } from 'rxjs'

describe('AllocationActionsComponent', () => {
    let component: AllocationActionsComponent
    let allocateServiceMock: any
    let formBuilderMock: UntypedFormBuilder
    let dialogRefMock: any
    let mockDialogData: any

    beforeEach(() => {
        // Create mocks for the dependencies
        allocateServiceMock = {
            onSearchRole: jest.fn(),
            onSearchActivity: jest.fn(),
            onSearchCompetency: jest.fn(),
            createAllocation: jest.fn()
        }

        formBuilderMock = new UntypedFormBuilder()

        dialogRefMock = {
            close: jest.fn()
        }

        mockDialogData = {
            userData: {
                userDetails: {
                    wid: 'user123',
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User'
                }
            },
            department_id: 'dept123',
            department_name: 'Test Department'
        }

        // Mock document.getElementById since it's used in the component
        document.getElementById = jest.fn().mockImplementation(() => {
            return {
                style: {
                    display: 'none',
                    backgroundColor: '',
                    color: '',
                    paddingRight: ''
                }
            }
        })

        // Create component instance
        component = new AllocationActionsComponent(
            allocateServiceMock,
            formBuilderMock,
            dialogRefMock,
            mockDialogData
        )

        // Initialize the component
        component.ngOnInit()
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    describe('close method', () => {
        it('should close the dialog', () => {
            component.close()
            expect(dialogRefMock.close).toHaveBeenCalled()
        })
    })

    describe('onSearchRole method', () => {
        it('should set similarRoles when search returns results', () => {
            // Arrange
            const mockRoles = [
                {
                    type: 'ROLE',
                    name: 'Developer',
                    description: 'Software Developer',
                    status: 'ACTIVE',
                    source: 'SYSTEM',
                    childNodes: []
                }
            ]
            allocateServiceMock.onSearchRole.mockReturnValue(of(mockRoles))

            // Mock the displayLoader method
            jest.spyOn(component, 'displayLoader')

            // Act
            component.onSearchRole({ target: { value: 'dev' } })

            // Assert
            expect(allocateServiceMock.onSearchRole).toHaveBeenCalledWith('dev')
            expect(component.displayLoader).toHaveBeenCalledWith('true')
            expect(component.displayLoader).toHaveBeenCalledWith('false')
            expect(component.similarRoles.length).toBe(1)
            expect(component.similarRoles[0].name).toBe('Developer')
            expect(component.nosimilarRoles).toBeFalsy()
        })

        it('should set nosimilarRoles to true when no roles found', () => {
            // Arrange
            allocateServiceMock.onSearchRole.mockReturnValue(of([]))

            // Act
            component.onSearchRole({ target: { value: 'nonexistent' } })

            // Assert
            expect(component.nosimilarRoles).toBeTruthy()
        })

        it('should not call the search service if search term is less than 3 characters', () => {
            // Act
            component.onSearchRole({ target: { value: 'ab' } })

            // Assert
            expect(allocateServiceMock.onSearchRole).not.toHaveBeenCalled()
        })
    })

    describe('selectRole method', () => {
        it('should set the selected role and update form controls', () => {
            // Arrange
            const mockRole = {
                type: 'ROLE',
                name: 'Developer',
                description: 'Software Developer',
                status: 'ACTIVE',
                childNodes: [{ name: 'Coding' }]
            }
            component.similarRoles = [mockRole]

            // Act
            component.selectRole(mockRole)

            // Assert
            expect(component.selectedRole).toEqual({
                type: 'ROLE',
                name: 'Developer',
                description: 'Software Developer',
                status: 'ACTIVE',
                childNodes: [{ name: 'Coding' }]
            })
            expect(component.activitieslist).toEqual([{ name: 'Coding' }])
            expect(component.similarRoles).toEqual([])
            expect(component.allocationFieldForm.controls['role'].value).toBe('Developer')
            expect(component.allocationFieldForm.controls['roleDesc'].value).toBe('Software Developer')
        })

        it('should set validators for activities if childNodes is empty', () => {
            // Arrange
            const mockRole = {
                type: 'ROLE',
                name: 'Developer',
                description: 'Software Developer',
                status: 'ACTIVE',
                childNodes: []
            }
            component.similarRoles = [mockRole]

            // Spy on updateValueAndValidity
            const updateValueSpy = jest.spyOn(component.allocationFieldForm.controls['mapActivities'], 'updateValueAndValidity')

            // Act
            component.selectRole(mockRole)

            // Assert
            expect(updateValueSpy).toHaveBeenCalled()
        })
    })

    describe('onSearchCompetency method', () => {
        it('should set similarCompetencies when search returns results', () => {
            // Arrange
            const mockCompetencies = [
                {
                    type: 'COMPETENCY',
                    id: 'comp1',
                    name: 'JavaScript',
                    description: 'JavaScript knowledge',
                    status: 'ACTIVE',
                    childNodes: [],
                    additionalProperties: { competencyArea: 'Programming' }
                }
            ]
            const mockResponse = { responseData: mockCompetencies }
            allocateServiceMock.onSearchCompetency.mockReturnValue(of(mockResponse))

            // Act
            component.onSearchCompetency({ target: { value: 'java' } })

            // Assert
            expect(allocateServiceMock.onSearchCompetency).toHaveBeenCalledWith('java')
            expect(component.similarCompetencies).toEqual(mockCompetencies)
        })
    })

    describe('selectCompetency method', () => {
        it('should set the selected competency and update form controls', () => {
            // Arrange
            const mockCompetency = {
                type: 'COMPETENCY',
                id: 'comp1',
                name: 'JavaScript',
                description: 'JavaScript knowledge',
                status: 'ACTIVE',
                childNodes: [],
                source: 'SYSTEM',
                reviewComments: '',
                createdDate: '2023-01-01',
                additionalProperties: { competencyArea: 'Programming' },
                children: []
            }

            // Act
            component.selectCompetency(mockCompetency)

            // Assert
            expect(component.selectedCompetency.length).toBe(1)
            expect(component.selectedCompetency[0].name).toBe('JavaScript')
            expect(component.similarCompetencies).toEqual([])
            expect(component.allocationFieldForm.controls['competency'].value).toBe('JavaScript')
            expect(component.allocationFieldForm.controls['compDesc'].value).toBe('JavaScript knowledge')
            expect(component.allocationFieldForm.controls['compArea'].value).toBe('Programming')
        })
    })

    describe('onSearchActivity method', () => {
        it('should set similarActivities when search returns results', () => {
            // Arrange
            const mockActivities = [
                {
                    id: 'act1',
                    name: 'Coding',
                    description: 'Writing code'
                }
            ]
            const mockResponse = { responseData: mockActivities }
            allocateServiceMock.onSearchActivity.mockReturnValue(of(mockResponse))

            // Act
            component.onSearchActivity({ target: { value: 'code' } })

            // Assert
            expect(allocateServiceMock.onSearchActivity).toHaveBeenCalledWith({
                searches: [
                    {
                        type: 'ACTIVITY',
                        field: 'name',
                        keyword: 'code',
                    },
                    {
                        type: 'ACTIVITY',
                        field: 'status',
                        keyword: 'VERIFIED',
                    },
                ],
            })
            expect(component.similarActivities).toEqual(mockActivities)
        })
    })

    describe('selectActivity method', () => {
        it('should set the selected activity and update form controls', () => {
            // Arrange
            const mockActivity = {
                id: 'act1',
                name: 'Coding',
                description: 'Writing code'
            }

            // Act
            component.selectActivity(mockActivity)

            // Assert
            expect(component.selectedActivity).toEqual(mockActivity)
            expect(component.similarActivities).toEqual([])
            expect(component.allocationFieldForm.controls['mapActivities'].value).toBe('Coding')
        })
    })

    describe('mapSelectedActivity method', () => {
        it('should add activity to activitieslist if form value is not empty', () => {
            // Arrange
            component.allocationFieldForm.controls['mapActivities'].setValue('Coding')
            component.selectedActivity = {
                id: 'act1',
                name: 'Coding',
                description: 'Writing code'
            }
            component.activitieslist = []

            // Act
            component.mapSelectedActivity()

            // Assert
            expect(component.activitieslist.length).toBe(1)
            expect(component.activitieslist[0].name).toBe('Coding')
            expect(component.activitieslist[0].desc).toBe('Writing code')
            expect(component.activitieslist[0].id).toBe('act1')
        })
    })

    describe('showRemoveActivity method', () => {
        it('should update styles for activity element', () => {
            // Setup mock elements
            const mockStyleElement = {
                style: {
                    display: '',
                    backgroundColor: '',
                    color: '',
                    paddingRight: ''
                }
            }
            document.getElementById = jest.fn().mockImplementation(() => mockStyleElement)

            // Act
            component.showRemoveActivity(1)

            // Assert
            expect(document.getElementById).toHaveBeenCalledWith('showremove1')
            expect(document.getElementById).toHaveBeenCalledWith('elementActivity1')
            expect(mockStyleElement.style.display).toBe('block')
            expect(mockStyleElement.style.backgroundColor).toBe('#716B66')
            expect(mockStyleElement.style.color).toBe('#fff')
            expect(mockStyleElement.style.paddingRight).toBe('0px')
        })
    })

    describe('removeActivity method', () => {
        it('should remove activity from activitieslist at given index', () => {
            // Arrange
            component.activitieslist = [
                { name: 'Activity 1' },
                { name: 'Activity 2' },
                { name: 'Activity 3' }
            ]

            // Act
            component.removeActivity(1)

            // Assert
            expect(component.activitieslist.length).toBe(2)
            expect(component.activitieslist[0].name).toBe('Activity 1')
            expect(component.activitieslist[1].name).toBe('Activity 3')
        })
    })

    describe('selectLevel method', () => {
        it('should set compatecnyLevel and update form control', () => {
            // Act
            component.selectLevel('Advanced')

            // Assert
            expect(component.compatecnyLevel).toBe('Advanced')
            expect(component.allocationFieldForm.controls['compLevel'].value).toBe('Advanced')
        })
    })

    describe('mapSelectedCompetency method', () => {
        it('should add competency to competencieslist if level is selected', () => {
            // Arrange
            component.compatecnyLevel = 'Advanced'
            component.allocationFieldForm.controls['competency'].setValue('JavaScript')
            component.competencieslist = []

            // Act
            component.mapSelectedCompetency()

            // Assert
            expect(component.competencieslist.length).toBe(1)
            expect(component.competencieslist[0].name).toBe('JavaScript')
        })

        it('should not add competency to list if level is not selected', () => {
            // Arrange
            component.compatecnyLevel = ''
            component.allocationFieldForm.controls['competency'].setValue('JavaScript')
            component.competencieslist = []

            // Act
            component.mapSelectedCompetency()

            // Assert
            expect(component.competencieslist.length).toBe(0)
        })
    })

    describe('saveWorkOrder method', () => {
        it('should call createAllocation and close dialog on success', () => {
            // Arrange
            component.selectedUser = mockDialogData
            component.selectedRole = {
                type: 'ROLE',
                name: 'Developer',
                description: 'Software Developer',
                status: 'ACTIVE',
                childNodes: []
            }
            component.selectedCompetency = [{
                type: 'COMPETENCY',
                id: 'comp1',
                name: 'JavaScript',
                description: 'JavaScript knowledge',
                status: 'ACTIVE',
                childNodes: [],
                childCount: 0, // This should be deleted
                source: 'SYSTEM',
                reviewComments: '',
                createdDate: '2023-01-01',
                additionalProperties: { competencyArea: 'Programming' },
                children: []
            }]

            const expectedRequest = {
                id: 'user123',
                userId: 'user123',
                userName: 'Test User',
                userEmail: 'test@example.com',
                deptId: 'dept123',
                deptName: 'Test Department',
                roleCompetencyList: [{
                    roleDetails: component.selectedRole,
                    competencyDetails: [{
                        type: 'COMPETENCY',
                        id: 'comp1',
                        name: 'JavaScript',
                        description: 'JavaScript knowledge',
                        status: 'ACTIVE',
                        childNodes: [],
                        source: 'SYSTEM',
                        reviewComments: '',
                        createdDate: '2023-01-01',
                        additionalProperties: { competencyArea: 'Programming' },
                        children: []
                    }]
                }],
                userPosition: undefined,
                positionId: '',
                status: 'Draft',
                waId: ''
            }

            allocateServiceMock.createAllocation.mockReturnValue(of({ success: true }))

            // Act
            component.saveWorkOrder()

            // Assert
            expect(allocateServiceMock.createAllocation).toHaveBeenCalledWith(expectedRequest)
            expect(dialogRefMock.close).toHaveBeenCalledWith({
                event: 'close',
                data: expectedRequest
            })
        })
    })
})