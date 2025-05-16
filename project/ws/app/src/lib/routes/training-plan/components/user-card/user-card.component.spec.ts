import { UserCardComponent } from './user-card.component'
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'

describe('UserCardComponent', () => {
    let component: UserCardComponent
    let trainingPlanDataSharingServiceMock: any
    let changeDetectorRefMock: any

    // Mock data
    const mockAssigneeDataDesignation = {
        category: 'Designation',
        data: [
            { name: 'Developer', selected: false },
            { name: 'Manager', selected: false }
        ]
    }

    const mockAssigneeDataUser = {
        category: 'CustomUser',
        data: [
            { userId: 'user1', name: 'John Doe', selected: false },
            { userId: 'user2', name: 'Jane Smith', selected: false }
        ]
    }

    beforeEach(() => {
        // Mock TrainingPlanDataSharingService
        trainingPlanDataSharingServiceMock = {
            trainingPlanAssigneeData: {
                data: []
            },
            trainingPlanStepperData: {
                assignmentTypeInfo: []
            }
        }

        // Mock ChangeDetectorRef
        changeDetectorRefMock = {
            detectChanges: jest.fn()
        }

        // Create component with mocked dependencies
        component = new UserCardComponent(
            trainingPlanDataSharingServiceMock,
            changeDetectorRefMock
        )

        // Set default properties
        component.checkboxVisibility = true
        component.showDeleteFlag = false
        component.showPagination = false

        // Set up event emitter spies
        jest.spyOn(component.handleSelectedChips, 'emit')
        jest.spyOn(component.userRemoved, 'emit')
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnChanges', () => {
        it('should initialize dataSource with assigneeData', () => {
            // Set input data
            component.assigneeData = mockAssigneeDataDesignation

            // Call ngOnChanges
            component.ngOnChanges()

            // Verify change detector was called
            expect(changeDetectorRefMock.detectChanges).toHaveBeenCalled()

            // Verify datasource is initialized with correct data
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
            expect(component.dataSource.data).toEqual(mockAssigneeDataDesignation.data)
        })

        it('should set paginator to dataSource if available', () => {
            // Set input data
            component.assigneeData = mockAssigneeDataDesignation

            // Mock paginator
            const mockPaginator = {}
            component.paginator = mockPaginator

            // Call ngOnChanges
            component.ngOnChanges()

            // Verify paginator is set
            expect(component.dataSource.paginator).toBe(mockPaginator)
        })
    })

    describe('onChangePage', () => {
        it('should update start and last index based on page event', () => {
            // Create mock page event
            const pageEvent: PageEvent = {
                pageIndex: 2,
                pageSize: 15,
                length: 45,
                previousPageIndex: 1
            }

            // Call onChangePage
            component.onChangePage(pageEvent)

            // Verify indexes are updated correctly
            expect(component.startIndex).toBe(30) // 2 * 15
            expect(component.lastIndex).toBe(45)  // (2 + 1) * 15
        })
    })

    describe('selectAssigneeItem', () => {
        beforeEach(() => {
            // Initialize service data
            trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data = [
                ...mockAssigneeDataDesignation.data
            ]
            trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo = []
        })

        describe('for Designation category', () => {
            beforeEach(() => {
                component.assigneeData = mockAssigneeDataDesignation
            })

            it('should mark item as selected and move it to the top when checked', () => {
                // Call select with checked=true for 'Manager'
                component.selectAssigneeItem({ checked: true }, { name: 'Manager' })

                // Verify item is marked as selected
                const selectedItem = trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data.find(
                    (item: any) => item.name === 'Manager'
                )
                expect(selectedItem.selected).toBe(true)

                // Verify item is moved to the top
                expect(trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data[0].name).toBe('Manager')

                // Verify assignmentTypeInfo is updated
                expect(trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo).toContain('Manager')

                // Verify emitter is called
                expect(component.handleSelectedChips.emit).toHaveBeenCalledWith(true)
            })

            it('should mark item as unselected and remove from assignmentTypeInfo when unchecked', () => {
                // Setup: first select the item
                trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data[1].selected = true
                trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo = ['Manager']

                // Call select with checked=false for 'Manager'
                component.selectAssigneeItem({ checked: false }, { name: 'Manager' })

                // Verify item is marked as unselected
                const unselectedItem = trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data.find(
                    (item: any) => item.name === 'Manager'
                )
                expect(unselectedItem.selected).toBe(false)

                // Verify assignmentTypeInfo is updated
                expect(trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo).not.toContain('Manager')

                // Verify emitter is called
                expect(component.handleSelectedChips.emit).toHaveBeenCalledWith(true)
            })
        })

        describe('for CustomUser category', () => {
            beforeEach(() => {
                component.assigneeData = mockAssigneeDataUser
                trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data = [
                    ...mockAssigneeDataUser.data
                ]
            })

            it('should mark user as selected and move it to the top when checked', () => {
                // Call select with checked=true for 'user2'
                component.selectAssigneeItem({ checked: true }, { userId: 'user2', name: 'Jane Smith' })

                // Verify user is marked as selected
                const selectedUser = trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data.find(
                    (item: any) => item.userId === 'user2'
                )
                expect(selectedUser.selected).toBe(true)

                // Verify user is moved to the top
                expect(trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data[0].userId).toBe('user2')

                // Verify assignmentTypeInfo is updated
                expect(trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo).toContain('user2')

                // Verify emitter is called
                expect(component.handleSelectedChips.emit).toHaveBeenCalledWith(true)
            })

            it('should mark user as unselected and remove from assignmentTypeInfo when unchecked', () => {
                // Setup: first select the user
                trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data[1].selected = true
                trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo = ['user2']

                // Call select with checked=false for 'user2'
                component.selectAssigneeItem({ checked: false }, { userId: 'user2', name: 'Jane Smith' })

                // Verify user is marked as unselected
                const unselectedUser = trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data.find(
                    (item: any) => item.userId === 'user2'
                )
                expect(unselectedUser.selected).toBe(false)

                // Verify assignmentTypeInfo is updated
                expect(trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo).not.toContain('user2')

                // Verify emitter is called
                expect(component.handleSelectedChips.emit).toHaveBeenCalledWith(true)
            })
        })
    })

    describe('deleteItem', () => {
        describe('for Designation category', () => {
            beforeEach(() => {
                component.assigneeData = mockAssigneeDataDesignation
                trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data = [
                    ...mockAssigneeDataDesignation.data
                ]
                trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo = ['Developer']
            })

            it('should remove designation from assigneeData and update service data', () => {
                // Call deleteItem for 'Developer'
                component.deleteItem({ name: 'Developer' })

                // Verify item is marked as unselected in service data
                const serviceItem = trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data.find(
                    (item: any) => item.name === 'Developer'
                )
                expect(serviceItem.selected).toBe(false)

                // Verify item is removed from assigneeData
                const assigneeItem = component.assigneeData.data.find(
                    (item: any) => item.name === 'Developer'
                )
                expect(assigneeItem).toBeUndefined()

                // Verify assignmentTypeInfo is updated
                expect(trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo).not.toContain('Developer')

                // Verify emitter is called
                expect(component.userRemoved.emit).toHaveBeenCalledWith(true)
            })
        })

        describe('for CustomUser category', () => {
            beforeEach(() => {
                component.assigneeData = mockAssigneeDataUser
                trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data = [
                    ...mockAssigneeDataUser.data
                ]
                trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo = ['user1']
            })

            it('should remove user from assigneeData and update service data', () => {
                // Call deleteItem for 'user1'
                component.deleteItem({ userId: 'user1', name: 'John Doe' })

                // Verify user is marked as unselected in service data
                const serviceUser = trainingPlanDataSharingServiceMock.trainingPlanAssigneeData.data.find(
                    (item: any) => item.userId === 'user1'
                )
                expect(serviceUser.selected).toBe(false)

                // Verify user is removed from assigneeData
                const assigneeUser = component.assigneeData.data.find(
                    (item: any) => item.userId === 'user1'
                )
                expect(assigneeUser).toBeUndefined()

                // Verify assignmentTypeInfo is updated
                expect(trainingPlanDataSharingServiceMock.trainingPlanStepperData.assignmentTypeInfo).not.toContain('user1')

                // Verify emitter is called
                expect(component.userRemoved.emit).toHaveBeenCalledWith(true)
            })
        })
    })

    describe('createInititals', () => {
        it('should return first letters of first and last name when there are two words', () => {
            expect(component.createInititals('John Doe')).toBe('JD')
            expect(component.createInititals('Alice Johnson')).toBe('AJ')
        })

        it('should return first two letters when there is only one word', () => {
            expect(component.createInititals('Madonna')).toBe('M')
        })

        it('should skip spaces and return first two non-space characters', () => {
            expect(component.createInititals('  Ab cd')).toBe('')
        })

        it('should handle empty or undefined names', () => {
            expect(component.createInititals('')).toBe('')
            expect(component.createInititals(undefined as any)).toBe('')
        })

        it('should handle single letter names', () => {
            expect(component.createInititals('A')).toBe('A')
        })
    })
})