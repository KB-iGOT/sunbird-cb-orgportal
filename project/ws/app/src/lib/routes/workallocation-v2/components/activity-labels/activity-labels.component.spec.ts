import { ActivityLabelsComponent } from './activity-labels.component'
import { UntypedFormBuilder, UntypedFormArray, UntypedFormGroup } from '@angular/forms'
import { of, Subject } from 'rxjs'
import * as _ from 'lodash'

// Mock dependencies
const mockChangeDetectorRef = {
    detectChanges: jest.fn()
}

const mockFormBuilder = new UntypedFormBuilder()

const mockAllocationService = {
    onSearchUser: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } })),
    onSearchActivity: jest.fn().mockReturnValue(of({ responseData: [] })),
    onSearchRole: jest.fn().mockReturnValue(of([]))
}

const mockWatStoreService = {
    setgetactivitiesGroup: jest.fn(),
    getID: 'test-id-123',
    getOfficerId: 'officer-123',
    getcompetencyGroupValue: []
}

const mockSnackBar = {
    open: jest.fn()
}

const mockDialog = {
    open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ ok: true, data: [] }))
    })
}

describe('ActivityLabelsComponent', () => {
    let component: ActivityLabelsComponent

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create component instance
        component = new ActivityLabelsComponent(
            mockChangeDetectorRef as any,
            mockFormBuilder,
            mockAllocationService as any,
            mockWatStoreService as any,
            mockSnackBar as any,
            mockDialog as any
        )
    })

    describe('Constructor and Initialization', () => {
        it('should create component with initial values', () => {
            expect(component).toBeDefined()
            expect(component.labels).toEqual([])
            expect(component.groups).toEqual([])
            expect(component.selectedActivityIdx).toBe(0)
            expect(component.activeGroupIdx).toBe(0)
            expect(component.untitedRole).toBe('Untitled role')
            expect(component.canshowName).toBe(1)
            expect(component.canshow).toBe(-1)
        })
    })

    describe('Getters', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                labelsArray: mockFormBuilder.array([]),
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([])
                    })
                ])
            })
        })

        it('should return labelsList', () => {
            const result = component.labelsList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        it('should return groupList', () => {
            const result = component.groupList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        it('should return grpArray when activityForm exists', () => {
            const result = component.grpArray
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        it('should return null for grpArray when activityForm is null', () => {
            component.activityForm = null as any
            const result = component.grpArray
            expect(result).toBeNull()
        })

        it('should return getControls', () => {
            const result = component.getControls
            expect(Array.isArray(result)).toBe(true)
        })

        it('should return empty array for getControls when grpArray is null', () => {
            component.activityForm = null as any
            const result = component.getControls
            expect(result).toEqual([])
        })

        it('should return groupActivityList', () => {
            const result = component.groupActivityList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        it('should return getActivityForm as stringified JSON', () => {
            const result = component.getActivityForm
            expect(typeof result).toBe('string')
        })
    })

    describe('ngOnInit', () => {
        it('should initialize form and listeners', () => {
            const createFormSpy = jest.spyOn(component, 'createForm').mockImplementation()
            const initListenSpy = jest.spyOn(component, 'initListen').mockImplementation()

            component.ngOnInit()

            expect(component.activityForm).toBeInstanceOf(UntypedFormGroup)
            expect(createFormSpy).toHaveBeenCalled()
            expect(initListenSpy).toHaveBeenCalled()
        })
    })

    describe('initListen', () => {
        it('should set up form value changes listener', () => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([])
            })

            const valueChanges$ = new Subject()
            jest.spyOn(component.activityForm.controls['groupsArray'], 'valueChanges', 'get')
                .mockReturnValue(valueChanges$)

            component.initListen()

            // Trigger value change
            valueChanges$.next([])

            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })
    })

    describe('ngAfterViewInit', () => {
        it('should execute without errors', () => {
            expect(() => component.ngAfterViewInit()).not.toThrow()
        })
    })

    describe('ngOnDestroy', () => {
        it('should emit unsubscribe signal', () => {
            const nextSpy = jest.spyOn(component['unsubscribe'], 'next')
            component.ngOnDestroy()
            expect(nextSpy).toHaveBeenCalled()
        })
    })

    describe('drop', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                labelsArray: mockFormBuilder.array([
                    mockFormBuilder.control('item1'),
                    mockFormBuilder.control('item2')
                ])
            })
        })

        it('should handle drop within same container', () => {
            const mockEvent = {
                previousContainer: { data: [] },
                container: { data: [] },
                previousIndex: 0,
                currentIndex: 1
            } as any

            // Make containers equal
            mockEvent.container = mockEvent.previousContainer

            component.drop(mockEvent)
            // Should not throw error
        })

        it('should handle drop between different containers', () => {
            const mockEvent = {
                previousContainer: { data: ['item1'] },
                container: { data: ['item2'] },
                previousIndex: 0,
                currentIndex: 1
            } as any

            component.drop(mockEvent)
            // Should not throw error
        })
    })

    describe('dropgroup', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([
                            mockFormBuilder.control({ activityDescription: 'test' })
                        ])
                    })
                ])
            })
        })

        it('should handle drop within same container', () => {
            const mockEvent = {
                previousContainer: { data: [] },
                container: { data: [] },
                previousIndex: 0,
                currentIndex: 1,
                item: { data: { activityDescription: 'test' } }
            } as any

            mockEvent.container = mockEvent.previousContainer

            component.dropgroup(mockEvent)
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })

        it('should show snackbar for empty activity drag', () => {
            const mockEvent = {
                previousContainer: { data: [], id: 'groups_0' },
                container: { data: [], id: 'groups_1' },
                previousIndex: 0,
                currentIndex: 1,
                item: { data: {} }
            } as any

            component.dropgroup(mockEvent)
            expect(mockSnackBar.open).toHaveBeenCalledWith('Empty activity!! You can not drag', undefined, { duration: 2000 })
        })

        it('should handle drop between different containers with valid data', () => {
            const mockEvent = {
                previousContainer: { data: [], id: 'groups_0' },
                container: { data: [], id: 'groups_1' },
                previousIndex: 0,
                currentIndex: 1,
                item: { data: { activityDescription: 'test', submissionFrom: 'user', assignedTo: 'user2' } }
            } as any

            component.dropgroup(mockEvent)
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })
    })

    describe('evenPredicate', () => {
        it('should return true for valid item data', () => {
            const mockItem = { data: { activityDescription: 'test' } } as any
            const result = component.evenPredicate(mockItem)
            expect(result).toBe(true)
        })

        it('should return false for invalid item data', () => {
            const mockItem = { data: null } as any
            const result = component.evenPredicate(mockItem)
            expect(result).toBe(false)
        })
    })

    describe('noReturnPredicate', () => {
        it('should always return true', () => {
            const result = component.noReturnPredicate()
            expect(result).toBe(true)
        })
    })

    describe('log', () => {
        it('should handle truthy values', () => {
            expect(() => component.log('test')).not.toThrow()
        })

        it('should handle falsy values', () => {
            expect(() => component.log(null)).not.toThrow()
        })
    })

    describe('setlabelsValues', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                labelsArray: mockFormBuilder.array([])
            })
        })

        it('should patch labels values', () => {
            const patchValueSpy = jest.spyOn(component.labelsList, 'patchValue')
            component.setlabelsValues(['test'])
            expect(patchValueSpy).toHaveBeenCalledWith(['test'])
        })
    })

    describe('setGroupValues', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([])
            })
        })

        it('should patch group values', () => {
            const patchValueSpy = jest.spyOn(component.groupList, 'patchValue')
            component.setGroupValues(['test'])
            expect(patchValueSpy).toHaveBeenCalledWith(['test'])
        })
    })

    describe('deleteActivityGromGrp', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([
                            mockFormBuilder.control('item1'),
                            mockFormBuilder.control('item2')
                        ])
                    })
                ])
            })
        })

        it('should remove activity at valid index', () => {
            const removeAtSpy = jest.spyOn(component.groupActivityList, 'removeAt')
            component.deleteActivityGromGrp(0)
            expect(removeAtSpy).toHaveBeenCalledWith(0)
        })

        it('should not remove activity at invalid index', () => {
            const removeAtSpy = jest.spyOn(component.groupActivityList, 'removeAt')
            component.deleteActivityGromGrp(-1)
            expect(removeAtSpy).not.toHaveBeenCalled()
        })
    })

    describe('setGroupActivityValues', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([])
                    })
                ])
            })
        })

        it('should patch group activity values', () => {
            const patchValueSpy = jest.spyOn(component.groupActivityList, 'patchValue')
            component.setGroupActivityValues(['test'])
            expect(patchValueSpy).toHaveBeenCalledWith(['test'])
        })
    })

    describe('addNewLabel', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                labelsArray: mockFormBuilder.array([])
            })
        })

        it('should add new label form group', () => {
            const initialLength = component.labelsList.length
            component.addNewLabel()
            expect(component.labelsList.length).toBe(initialLength + 1)
        })
    })

    describe('addNewGroup', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([])
            })
        })

        it('should add new group with default activity', () => {
            const initialLength = component.groupList.length
            component.addNewGroup(true)
            expect(component.groupList.length).toBe(initialLength + 1)
            expect(component.canshowName).toBe(component.groupList.length - 1)
        })

        it('should add new group without default activity', () => {
            const initialLength = component.groupList.length
            component.addNewGroup(false)
            expect(component.groupList.length).toBe(initialLength + 1)
        })

        it('should add new group with provided group data', () => {
            const mockGroup: any = {
                localId: 'test-local-id',
                groupId: 'test-group-id',
                groupName: 'Test Group',
                groupDescription: 'Test Description'
            }

            component.addNewGroup(false, mockGroup)
            const addedGroup = component.groupList.at(component.groupList.length - 1)
            expect(addedGroup.get('localId')?.value).toBe('test-local-id')
            expect(addedGroup.get('groupId')?.value).toBe('test-group-id')
        })
    })

    describe('addNewGroupActivityCustom', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([])
                    })
                ])
            })
        })

        it('should add activities to group at valid index', () => {
            const mockActivities = [
                {
                    localId: 'test-id',
                    activityId: 'act-1',
                    activityName: 'Activity 1',
                    activityDescription: 'Description 1',
                    submissionFrom: 'User 1',
                    submissionFromId: 'user-1',
                    submissionFromEmail: 'user1@test.com',
                    assignedTo: 'User 2',
                    assignedToId: 'user-2',
                    assignedToEmail: 'user2@test.com'
                }
            ]

            component.addNewGroupActivityCustom(0, mockActivities)
            expect(component.groupActivityList.length).toBe(1)
        })

        it('should not add activities for invalid index', () => {
            const mockActivities = [{ localId: 'test' }] as any
            component.addNewGroupActivityCustom(-1, mockActivities)
            // Should not throw error
        })
    })

    describe('addNewGroupActivity', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([])
                    })
                ])
            })
        })

        it('should add new activity to group at valid index', () => {
            const initialLength = component.groupActivityList.length
            component.addNewGroupActivity(0)
            expect(component.groupActivityList.length).toBe(initialLength + 1)
        })

        it('should not add activity for invalid index', () => {
            component.addNewGroupActivity(-1)
            // Should not throw error
        })
    })

    describe('enter', () => {
        it('should set active group index', () => {
            component.enter(5)
            expect(component.activeGroupIdx).toBe(5)
        })
    })

    describe('createForm', () => {
        it('should create form without editData', () => {
            const addNewGroupSpy = jest.spyOn(component, 'addNewGroup').mockImplementation()
            component.editData = null

            component.createForm()

            expect(component.activityForm).toBeInstanceOf(UntypedFormGroup)
            expect(addNewGroupSpy).toHaveBeenCalledWith()
        })

        it('should create form with editData containing unmapped activities', () => {
            const addNewGroupSpy = jest.spyOn(component, 'addNewGroup').mockImplementation()
            const addNewGroupActivityCustomSpy = jest.spyOn(component, 'addNewGroupActivityCustom').mockImplementation()

            component.editData = {
                unmdA: [{ activityDescription: 'test' }],
                list: []
            }

            component.createForm()

            expect(addNewGroupSpy).toHaveBeenCalledWith(false)
            expect(addNewGroupActivityCustomSpy).toHaveBeenCalledWith(0, [{ activityDescription: 'test' }])
        })

        it('should create form with editData containing group data', () => {
            const addNewGroupSpy = jest.spyOn(component, 'addNewGroup').mockImplementation()
            const addNewGroupActivityCustomSpy = jest.spyOn(component, 'addNewGroupActivityCustom').mockImplementation()

            component.editData = {
                list: [{
                    roleDetails: {
                        id: 'role-1',
                        name: 'Role 1',
                        description: 'Role Description',
                        childNodes: [{
                            id: 'activity-1',
                            name: 'Activity 1',
                            description: 'Activity Description',
                            submissionFrom: 'User 1',
                            submissionFromId: 'user-1',
                            submissionFromEmail: 'user1@test.com',
                            submittedToName: 'User 2',
                            submittedToId: 'user-2',
                            submittedToEmail: 'user2@test.com'
                        }]
                    }
                }]
            }

            component.createForm()

            expect(addNewGroupSpy).toHaveBeenCalled()
            expect(addNewGroupActivityCustomSpy).toHaveBeenCalled()
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })
    })

    describe('createActivityControl', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                labelsArray: mockFormBuilder.array([])
            })
        })

        it('should create and add activity control', () => {
            const mockActivity = {
                localId: 'test-id',
                activityId: 'act-1',
                activityName: 'Activity 1',
                activityDescription: 'Description',
                assignedTo: 'User 1',
                assignedToId: 'user-1',
                assignedToEmail: 'user1@test.com',
                submissionFrom: 'User 2',
                submissionFromId: 'user-2',
                submissionFromEmail: 'user2@test.com'
            }

            const initialLength = component.labelsList.length
            component.createActivityControl(mockActivity)
            expect(component.labelsList.length).toBe(initialLength + 1)
        })
    })

    describe('createGroupControl', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([])
            })
        })

        it('should create and add group control', () => {
            const mockGroup = {
                localId: 'test-id',
                groupId: 'group-1',
                groupName: 'Group 1',
                groupDescription: 'Description',
                activities: []
            }

            const initialLength = component.groupList.length
            component.createGroupControl(mockGroup)
            expect(component.groupList.length).toBe(initialLength + 1)
        })
    })

    describe('createActivtyControl', () => {
        it('should create activity controls from array', () => {
            const mockActivities = [{
                localId: 'test-id',
                activityId: 'act-1',
                activityName: 'Activity 1',
                activityDescription: 'Description',
                assignedTo: 'User 1',
                assignedToId: 'user-1',
                assignedToEmail: 'user1@test.com',
                submissionFrom: 'User 2',
                submissionFromId: 'user-2',
                submissionFromEmail: 'user2@test.com'
            }]

            const result = component.createActivtyControl(mockActivities)
            expect(Array.isArray(result)).toBe(true)
            expect(result.length).toBe(1)
        })
    })

    describe('submitResult', () => {
        it('should handle truthy form', () => {
            expect(() => component.submitResult({})).not.toThrow()
        })

        it('should handle falsy form', () => {
            expect(() => component.submitResult(null)).not.toThrow()
        })
    })

    describe('filterUsers', () => {
        it('should call allocation service and set users list', async () => {
            await component.filterUsers('test')
            expect(mockAllocationService.onSearchUser).toHaveBeenCalledWith('test')
            expect(component.userslist).toEqual([])
        })
    })

    describe('filterActivities', () => {
        it('should set selectedActivityIdx and filter for long strings', async () => {
            await component.filterActivities('test string', 5)
            expect(component.selectedActivityIdx).toBe(5)
            expect(mockAllocationService.onSearchActivity).toHaveBeenCalled()
        })

        it('should not filter for short strings', async () => {
            await component.filterActivities('te', 5)
            expect(component.selectedActivityIdx).toBe(5)
            expect(mockAllocationService.onSearchActivity).not.toHaveBeenCalled()
        })
    })

    describe('filterRoles', () => {
        it('should filter roles', async () => {
            await component.filterRoles('test')
            expect(mockAllocationService.onSearchRole).toHaveBeenCalledWith('test')
        })
    })

    describe('roleSelected', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        groupDescription: mockFormBuilder.control(''),
                        groupName: mockFormBuilder.control(''),
                        groupId: mockFormBuilder.control(''),
                        activities: mockFormBuilder.array([])
                    })
                ])
            })
        })

        it('should handle role selection with ok result', () => {
            const mockEvent = {
                option: {
                    value: {
                        description: 'Test Description',
                        name: 'Test Role',
                        id: 'role-1'
                    }
                }
            }

            // const addNewGroupActivityCustomSpy = jest.spyOn(component, 'addNewGroupActivityCustom').mockImplementation()
            // const deleteUnselectedActivitiesSpy = jest.spyOn(component, 'deleteUnselectedActivities').mockImplementation()
            // const addNewGroupActivitySpy = jest.spyOn(component, 'addNewGroupActivity').mockImplementation()

            component.roleSelected(mockEvent, 0)

            expect(component.activeGroupIdx).toBe(0)
            expect(mockDialog.open).toHaveBeenCalled()
        })

        it('should handle role selection with cancel result', () => {
            const mockEvent = {
                option: {
                    value: {
                        description: 'Test Description',
                        name: 'Test Role',
                        id: 'role-1'
                    }
                }
            }

            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of({ ok: false }))
            })

            component.roleSelected(mockEvent, 0)

            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })
    })

    describe('deleteUnselectedActivities', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([
                            mockFormBuilder.group({
                                activityDescription: mockFormBuilder.control('Activity 1')
                            })
                        ])
                    })
                ])
            })
        })

        it('should delete unselected activities with values', () => {
            const deleteActivityGromGrpSpy = jest.spyOn(component, 'deleteActivityGromGrp').mockImplementation()
            const unselectVals = [{ activityDescription: 'Activity 1' }]

            component.deleteUnselectedActivities(unselectVals, 0)
            expect(deleteActivityGromGrpSpy).toHaveBeenCalled()
        })

        it('should delete all activities when no unselected values', () => {
            const deleteActivityGromGrpSpy = jest.spyOn(component, 'deleteActivityGromGrp').mockImplementation()

            component.deleteUnselectedActivities([], 0)
            expect(deleteActivityGromGrpSpy).toHaveBeenCalled()
        })
    })

    describe('activitySelected', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([
                            mockFormBuilder.group({
                                activityDescription: mockFormBuilder.control(''),
                                activityId: mockFormBuilder.control('')
                            })
                        ])
                    })
                ])
            })
        })

        it('should set activity values when selected', () => {
            const mockEvent = {
                option: {
                    value: {
                        description: 'Test Activity',
                        id: 'activity-1'
                    }
                }
            }

            component.activitySelected(mockEvent, 0)
            expect(component.activeGroupIdx).toBe(0)
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })
    })

    describe('setSelectedFilter', () => {
        it('should set selected activity index', () => {
            component.setSelectedFilter(3)
            expect(component.selectedActivityIdx).toBe(3)
        })
    })

    describe('displayFn', () => {
        it('should return name when data exists', () => {
            const result = component.displayFn({ name: 'Test Name' })
            expect(result).toBe('Test Name')
        })

        it('should return empty string when data is null', () => {
            const result = component.displayFn(null)
            expect(result).toBe('')
        })
    })

    describe('displayActivityFn', () => {
        it('should return activityDescription when data exists', () => {
            const result = component.displayActivityFn({ activityDescription: 'Test Activity' })
            expect(result).toBe('Test Activity')
        })

        it('should return empty string when data is null', () => {
            const result = component.displayActivityFn(null)
            expect(result).toBe('')
        })
    })

    describe('userClicked', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([
                            mockFormBuilder.group({
                                assignedTo: mockFormBuilder.control(''),
                                assignedToId: mockFormBuilder.control(''),
                                assignedToEmail: mockFormBuilder.control('')
                            })
                        ])
                    })
                ])
            })
        })

        it('should handle Final authority selection', () => {
            const mockEvent = {
                option: { value: 'Final authority' }
            }

            component.userClicked(mockEvent, 0, 'to')
            expect(component.activeGroupIdx).toBe(0)
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })

        it('should handle regular user selection', () => {
            const mockEvent = {
                option: {
                    value: {
                        firstName: 'John',
                        lastName: 'Doe',
                        userId: 'user-123',
                        profileDetails: {
                            personalDetails: {
                                primaryEmail: 'john.doe@test.com'
                            }
                        }
                    }
                }
            }

            component.userClicked(mockEvent, 0, 'to')
            expect(component.activeGroupIdx).toBe(0)
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })

        it('should handle non-to type', () => {
            const mockEvent = {
                option: { value: 'test' }
            }

            component.userClicked(mockEvent, 0, 'from')
            expect(component.activeGroupIdx).toBe(0)
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })

        it('should handle null event', () => {
            component.userClicked(null, 0, 'to')
            expect(mockWatStoreService.setgetactivitiesGroup).not.toHaveBeenCalled()
        })
    })

    describe('deleteRowActivity', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([
                            mockFormBuilder.control('activity1'),
                            mockFormBuilder.control('activity2')
                        ])
                    })
                ])
            })
        })

        it('should delete activity and update store', () => {
            component.deleteRowActivity(0, 1)
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
        })
    })

    describe('deleteSingleActivity', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([
                            mockFormBuilder.control('activity1')
                        ])
                    })
                ])
            })
        })

        it('should open confirmation dialog and delete on confirm', () => {
            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(true))
            })

            const deleteRowActivitySpy = jest.spyOn(component, 'deleteRowActivity').mockImplementation()

            component.deleteSingleActivity(0, 0)

            expect(mockDialog.open).toHaveBeenCalled()
            expect(deleteRowActivitySpy).toHaveBeenCalledWith(0, 0)
            expect(mockSnackBar.open).toHaveBeenCalledWith('Activity deleted successfully!! ', undefined, { duration: 2000 })
        })

        it('should not delete on cancel', () => {
            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(false))
            })

            const deleteRowActivitySpy = jest.spyOn(component, 'deleteRowActivity').mockImplementation()

            component.deleteSingleActivity(0, 0)

            expect(deleteRowActivitySpy).not.toHaveBeenCalled()
        })

        it('should not open dialog for invalid indices', () => {
            component.deleteSingleActivity(-1, 0)
            expect(mockDialog.open).not.toHaveBeenCalled()
        })
    })

    describe('show', () => {
        it('should set canshow to index', () => {
            component.show(5)
            expect(component.canshow).toBe(5)
        })
    })

    describe('hide', () => {
        it('should set canshow to -1', () => {
            component.hide()
            expect(component.canshow).toBe(-1)
        })
    })

    describe('showName', () => {
        it('should set canshowName to index', () => {
            component.showName(3)
            expect(component.canshowName).toBe(3)
        })
    })

    describe('hideName', () => {
        it('should set canshowName to -1', () => {
            component.hideName()
            expect(component.canshowName).toBe(-1)
        })
    })

    describe('trackByFn', () => {
        it('should return localId from form group value', () => {
            const mockFormGroup = {
                value: { localId: 'test-local-id' }
            } as UntypedFormGroup

            const result = component.trackByFn(0, mockFormGroup)
            expect(result).toBe('test-local-id')
        })
    })

    describe('getCompCount', () => {
        beforeEach(() => {
            mockWatStoreService.getcompetencyGroupValue = [
            ]
        })

        it('should count competencies by role name', () => {
            const count = component.getCompCount('Role1', 0, '')
            expect(count).toBe(2)
        })

        it('should count competencies by local id', () => {
            const count = component.getCompCount('', 1, '')
            expect(count).toBe(2)
        })

        it('should count competencies by role id', () => {
            const count = component.getCompCount('', 0, 'role2')
            expect(count).toBe(1)
        })

        it('should return 0 for no matches', () => {
            const count = component.getCompCount('NonExistent', 0, '')
            expect(count).toBe(0)
        })
    })

    describe('deleteGrp', () => {
        beforeEach(() => {
            component.activityForm = mockFormBuilder.group({
                groupsArray: mockFormBuilder.array([
                    mockFormBuilder.group({
                        activities: mockFormBuilder.array([mockFormBuilder.control('activity1')]),
                        groupName: mockFormBuilder.control('Test Group'),
                        localId: mockFormBuilder.control(1),
                        roleId: mockFormBuilder.control('role1')
                    })
                ])
            })
        })

        it('should show snackbar when no officer id', () => {
            // mockWatStoreService.getOfficerId = null

            component.deleteGrp(0)
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please save work order and open in edit mode !! ', undefined, { duration: 2000 })
        })

        it('should open confirmation dialog and delete on confirm', () => {
            mockWatStoreService.getOfficerId = 'officer-123'
            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(true))
            })

            const getCompCountSpy = jest.spyOn(component, 'getCompCount').mockReturnValue(2)

            component.deleteGrp(0)

            expect(mockDialog.open).toHaveBeenCalled()
            expect(getCompCountSpy).toHaveBeenCalled()
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
            expect(mockWatStoreService.setgetactivitiesGroup).toHaveBeenCalled()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Role removed successfully, Please sit back, Page will reload.!! ', undefined, { duration: 2000 })
        })

        it('should not delete on cancel', () => {
            mockWatStoreService.getOfficerId = 'officer-123'
            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(false))
            })

            component.deleteGrp(0)
            expect(mockChangeDetectorRef.detectChanges).not.toHaveBeenCalled()
        })

        it('should not open dialog for invalid index', () => {
            mockWatStoreService.getOfficerId = 'officer-123'

            component.deleteGrp(-1)
            expect(mockDialog.open).not.toHaveBeenCalled()
        })
    })
})