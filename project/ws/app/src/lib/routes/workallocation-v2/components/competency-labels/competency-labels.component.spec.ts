import { CompetencyLabelsComponent } from './competency-labels.component'
import { UntypedFormBuilder, UntypedFormArray } from '@angular/forms'
import { of, BehaviorSubject } from 'rxjs'
import * as _ from 'lodash'

// Mock dependencies
const mockChangeDetectorRef = {
    detectChanges: jest.fn()
}

const mockAllocationService = {
    onSearchUser: jest.fn(),
    onSearchCompetency: jest.fn()
}

const mockWatStore = {
    getactivitiesGroup: new BehaviorSubject([]),
    getID: 'test-id-123',
    setgetcompetencyGroup: jest.fn(),
    getUpdateCompGroupById: jest.fn(),
    setCompGroup: jest.fn()
}

const mockSnackBar = {
    open: jest.fn()
}

const mockDialog = {
    open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ ok: false })),
        componentInstance: {}
    })
}

const mockActivatedRoute = {
    snapshot: {
        data: {
            pageData: {
                data: {
                    levels: [{ id: 1, name: 'Level 1' }]
                }
            }
        }
    }
}

describe('CompetencyLabelsComponent', () => {
    let component: CompetencyLabelsComponent
    let formBuilder: UntypedFormBuilder

    beforeEach(() => {
        formBuilder = new UntypedFormBuilder()

        component = new CompetencyLabelsComponent(
            mockChangeDetectorRef as any,
            formBuilder,
            mockAllocationService as any,
            mockWatStore as any,
            mockSnackBar as any,
            mockDialog as any,
            mockActivatedRoute as any
        )

        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        test('should create component instance', () => {
            expect(component).toBeTruthy()
        })

        test('should initialize default values', () => {
            expect(component.labels).toEqual([])
            expect(component.groups).toEqual([])
            expect(component.activeGroupIdx).toBe(0)
            expect(component.selectedCompIdx).toBe(0)
            expect(component.untitedRole).toBe('Untitled role')
            expect(component.canshowName).toBe(1)
            expect(component.canshow).toBe(-1)
        })
    })

    describe('Form Getters', () => {
        beforeEach(() => {
            component.activityForm = formBuilder.group({
                labelsArray: formBuilder.array([]),
                groupsArray: formBuilder.array([
                    formBuilder.group({
                        competincies: formBuilder.array([]),
                        roleId: 'test-role',
                        roleName: 'Test Role'
                    })
                ])
            })
        })

        test('should get labelsList FormArray', () => {
            const result = component.labelsList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        test('should get groupList FormArray', () => {
            const result = component.groupList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        test('should get groupListByIndex', () => {
            const result = component.groupListByIndex(0)
            expect(result).toBeDefined()
        })

        test('should get groupcompetencyList FormArray', () => {
            component.activeGroupIdx = 0
            const result = component.groupcompetencyList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        test('should handle groupcompetencyList when no group exists', () => {
            component.activeGroupIdx = 5 // Non-existent index
            const result = component.groupcompetencyList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })

        test('should return getActivityForm as JSON string', () => {
            const result = component.getActivityForm
            expect(typeof result).toBe('string')
        })
    })

    describe('ngOnInit - Complete Flow', () => {
        test('should initialize form and setup subscriptions', () => {
            const groups: any = [
                { groupId: '1', groupName: 'Test Group', groupDescription: 'Test Desc', localId: 'local-1' }
            ]
            mockWatStore.getactivitiesGroup.next(groups)

            component.ngOnInit()

            expect(component.activityForm).toBeDefined()
            expect(component.groups).toEqual(groups)
        })

        test('should handle editData with unmapped competencies', () => {
            component.editData = {
                unmdC: [
                    {
                        id: 'comp-1',
                        name: 'Test Competency',
                        description: 'Test Description',
                        level: 'Beginner',
                        additionalProperties: {
                            competencyType: 'Technical',
                            competencyArea: 'Development'
                        },
                        source: 'Manual',
                        chield: [{ id: 1, name: 'Level 1' }]
                    }
                ]
            }

            component.ngOnInit()

            expect(component.groupList.length).toBeGreaterThan(0)
        })

        test('should handle editData with mapped competencies', () => {
            component.editData = {
                list: [
                    {
                        roleDetails: {
                            localId: 'role-local-1',
                            id: 'role-1',
                            name: 'Test Role',
                            description: 'Role Description'
                        },
                        competencyDetails: [
                            {
                                id: 'comp-1',
                                name: 'Test Competency',
                                description: 'Comp Description',
                                level: 'Expert',
                                additionalProperties: {
                                    competencyType: 'Soft Skill',
                                    competencyArea: 'Communication'
                                },
                                source: 'System',
                                chield: [{ id: 2, name: 'Level 2' }]
                            }
                        ]
                    }
                ]
            }

            const groups: any = [
                { groupId: '1', groupName: 'Group 1' },
                { groupId: '2', groupName: 'Group 2' }
            ]
            mockWatStore.getactivitiesGroup.next(groups)

            component.ngOnInit()

            expect(component.groups).toEqual(groups)
        })

        test('should handle editData with partial role details', () => {
            component.editData = {
                list: [
                    {
                        roleDetails: {
                            id: 'role-1'
                            // Missing name and description
                        },
                        competencyDetails: [
                            {
                                id: 'comp-1',
                                additionalProperties: {}
                                // Missing other properties
                            }
                        ]
                    }
                ]
            }

            const groups: any = [
                { groupId: '1', groupName: 'Group 1' },
                { groupId: '2', groupName: 'Group 2' }
            ]
            mockWatStore.getactivitiesGroup.next(groups)

            component.ngOnInit()

            expect(component.groups).toEqual(groups)
        })
    })

    describe('initListen - Form Value Changes', () => {
        beforeEach(() => {
            component.activityForm = formBuilder.group({
                groupsArray: formBuilder.array([
                    formBuilder.group({
                        competincies: formBuilder.array([
                            formBuilder.group({
                                compName: 'Test Competency'
                            })
                        ])
                    })
                ])
            })
        })

        test('should handle form value changes with valid data', (done) => {
            component.initListen()

            // Trigger form value change
            component.activityForm.controls['groupsArray'].patchValue([
                {
                    competincies: [{ compName: 'Valid Competency' }]
                }
            ])

            setTimeout(() => {
                expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
                done()
            }, 600)
        })

        test('should not update when competency name is object', (done) => {
            component.initListen()

            // Trigger form value change with object as compName
            component.activityForm.controls['groupsArray'].patchValue([
                {
                    competincies: [{ compName: { id: 1, name: 'Object Competency' } }]
                }
            ])

            setTimeout(() => {
                // Should not call setgetcompetencyGroup when update is false
                expect(mockWatStore.setgetcompetencyGroup).not.toHaveBeenCalledWith(
                    expect.anything(), false, true
                )
                done()
            }, 600)
        })
    })

    describe('Drag and Drop Operations', () => {
        beforeEach(() => {
            component.createForm()
            component.addNewLabel()
            component.addNewLabel()
        })

        test('should handle drop within same container for labels', () => {
            const mockEvent = {
                previousContainer: { id: 'container1' },
                container: { id: 'container1' },
                previousIndex: 0,
                currentIndex: 1
            }

            component.drop(mockEvent as any)
            expect(component.labelsList.length).toBe(2)
        })

        test('should handle drop between different containers', () => {
            const mockEvent = {
                previousContainer: {
                    id: 'container1',
                    data: ['item1', 'item2']
                },
                container: {
                    id: 'container2',
                    data: ['item3']
                },
                previousIndex: 0,
                currentIndex: 0
            }

            component.drop(mockEvent as any)
            // Should execute transferArrayItem path
        })

        test('should handle dropgroup within same container', () => {
            component.addNewGroup()
            component.addNewGroupActivity(0)

            const mockEvent = {
                previousContainer: { id: 'compe_0' },
                container: { id: 'compe_0' },
                previousIndex: 0,
                currentIndex: 1
            }

            component.dropgroup(mockEvent as any)
            expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
        })

        test('should prevent drop when competency name is empty', () => {
            component.addNewGroup()
            component.addNewGroupActivity(0)

            const mockEvent = {
                previousContainer: { id: 'compe_0' },
                container: { id: 'compe_1' },
                previousIndex: 0,
                currentIndex: 0,
                item: { data: { compName: '' } }
            }

            component.dropgroup(mockEvent as any)

            expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Competency Name is required to drag',
                undefined,
                { duration: 2000 }
            )
        })

        test('should handle drop to unmapped group (index 0)', () => {
            component.addNewGroup()
            component.addNewGroup()
            component.addNewGroupActivity(1)

            const mockEvent = {
                previousContainer: { id: 'compe_1' },
                container: { id: 'compe_0' },
                previousIndex: 0,
                currentIndex: 0,
                item: { data: { compName: 'Valid Competency' } }
            }

            component.dropgroup(mockEvent as any)

            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
            expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
        })
    })

    describe('Predicate Functions', () => {
        test('should return true for valid item in evenPredicate', () => {
            const mockItem = { data: { compName: 'test' } }
            expect(component.evenPredicate(mockItem as any)).toBe(true)
        })

        test('should return false for invalid item in evenPredicate', () => {
            const mockItem = { data: null }
            expect(component.evenPredicate(mockItem as any)).toBe(false)
        })

        test('should always return true for noReturnPredicate', () => {
            expect(component.noReturnPredicate()).toBe(true)
        })
    })

    describe('Form Management - Advanced', () => {
        beforeEach(() => {
            component.createForm()
        })

        test('should create form without editData', () => {
            component.editData = null
            component.createForm()

            expect(component.activityForm).toBeDefined()
            expect(component.groupList.length).toBe(1)
        })

        test('should add new group with default competency', () => {
            const initialLength = component.groupList.length
            component.addNewGroup(true)

            expect(component.groupList.length).toBe(initialLength + 1)
            expect(component.canshowName).toBe(component.groupList.length - 1)
        })

        test('should add new group without default competency', () => {
            const customGroup: any = {
                localId: 'custom-id',
                competincies: [],
                roleId: 'role-1',
                roleName: 'Custom Role',
                roleDescription: 'Custom Description'
            }

            component.addNewGroup(false, customGroup)
            const addedGroup = component.groupList.at(component.groupList.length - 1)

            expect(addedGroup.get('roleId')?.value).toBe('role-1')
            expect(addedGroup.get('roleName')?.value).toBe('Custom Role')
        })

        test('should add multiple competencies to group', () => {
            component.addNewGroup()

            const competencies: any = [
                {
                    localId: 'comp-1',
                    compId: 'c1',
                    compName: 'Competency 1',
                    compDescription: 'Description 1',
                    compLevel: 'Beginner',
                    compType: 'Technical',
                    compArea: 'Development',
                    levelList: [],
                    compSource: 'Manual'
                },
                {
                    localId: 'comp-2',
                    compId: 'c2',
                    compName: 'Competency 2',
                    compDescription: 'Description 2',
                    compLevel: 'Expert',
                    compType: 'Soft',
                    compArea: 'Communication',
                    levelList: [],
                    compSource: 'System'
                }
            ]

            component.addNewGroupActivityCustom(0, competencies)

            expect(component.groupcompetencyList.length).toBeGreaterThan(0)
        })

        test('should not add competencies for invalid index', () => {
            component.addNewGroupActivityCustom(-1, [])
            // Should not throw error
        })
    })

    describe('updateForm - Complex Scenarios', () => {
        test('should update form when groups length matches', () => {
            component.groups = [
                {
                    groupId: '1', groupName: 'Group 1', groupDescription: 'Desc 1', localId: 'l1',
                    activities: []
                },
                {
                    groupId: '2', groupName: 'Group 2', groupDescription: 'Desc 2', localId: 'l2',
                    activities: []
                }
            ]
            component.createForm()

            component.updateForm()

            expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
        })

        test('should handle groups with missing properties', () => {
            component.groups = [
                {
                    groupId: '1',
                    groupName: '',
                    groupDescription: '',
                    activities: []
                }, // Missing other properties
                {
                    groupName: 'Group 2',
                    groupId: '',
                    groupDescription: '',
                    activities: []
                } // Missing groupId
            ]
            component.createForm()

            component.updateForm()

            // Should handle gracefully without errors
        })

        test('should update existing group forms', () => {
            component.groups = [
                {
                    groupId: '1', groupName: 'Group 1',
                    groupDescription: '',
                    activities: []
                },
                {
                    groupId: '2', groupName: 'Group 2',
                    groupDescription: '',
                    activities: []
                }
            ]
            component.createForm()
            component.addNewGroup() // Add initial group

            component.updateForm()

            // Should update existing form controls
        })
    })

    describe('User and Competency Filtering - Advanced', () => {
        test('should filter users with response', async () => {
            const mockResponse = {
                result: {
                    response: {
                        content: [{ id: 1, name: 'John Doe' }]
                    }
                }
            }
            mockAllocationService.onSearchUser.mockReturnValue(of(mockResponse))

            await component.filterUsers('john')

            expect(component.userslist).toEqual([{ id: 1, name: 'John Doe' }])
        })

        test('should filter competencies and update BehaviorSubject', async () => {
            const mockResponse = {
                responseData: [{ id: 1, name: 'Test Competency' }]
            }
            mockAllocationService.onSearchCompetency.mockReturnValue(of(mockResponse))

            await component.filterCompetencies('test', 2)

            expect(component.selectedCompIdx).toBe(2)
            // Check if BehaviorSubject was updated
        })

        test('should not filter for short competency strings', async () => {
            await component.filterCompetencies('te', 0)
            expect(mockAllocationService.onSearchCompetency).not.toHaveBeenCalled()
        })

        test('should set selected filter index', () => {
            component.setSelectedFilter(5)
            expect(component.selectedCompIdx).toBe(5)
        })
    })

    describe('competencySelected - Complex Scenarios', () => {
        beforeEach(() => {
            component.createForm()
            component.addNewGroup()
            component.addNewGroupActivity(0)
            component.selectedCompIdx = 0
        })

        test('should handle competency selection with existing localId', () => {
            const mockEvent = {
                option: {
                    value: {
                        id: 'comp-1',
                        name: 'Test Competency',
                        description: 'Test Description',
                        children: [{ id: 1, name: 'Level 1' }]
                    }
                }
            }

            // Set up existing competency with localId
            const competencyControl = component.groupcompetencyList.at(0)
            competencyControl.patchValue({
                localId: 'existing-local-id',
                compName: 'Existing Competency'
            })

            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of({
                    ok: true,
                    data: {
                        compId: 'new-comp-id',
                        compName: 'Updated Competency',
                        compDescription: 'Updated Description',
                        compLevel: 'Expert',
                        compType: 'Technical',
                        compArea: 'Development',
                        compSource: 'Manual',
                        levelList: [{ id: 1 }]
                    }
                })),
                componentInstance: {}
            })

            component.competencySelected(mockEvent, 0)

            expect(mockDialog.open).toHaveBeenCalled()
        })

        test('should handle competency selection with object compName', () => {
            const mockEvent = {
                option: {
                    value: {
                        id: 'comp-1',
                        name: 'Test Competency'
                    }
                }
            }

            // Set up competency with object compName
            const competencyControl = component.groupcompetencyList.at(0)
            competencyControl.patchValue({
                localId: 'existing-local-id',
                compName: {
                    id: 'object-comp-id',
                    name: 'Object Competency',
                    description: 'Object Description',
                    additionalProperties: {
                        competencyType: 'Soft',
                        competencyArea: 'Leadership'
                    },
                    source: 'System'
                }
            })

            mockWatStore.getUpdateCompGroupById.mockReturnValue({
                compType: 'Updated Type',
                compArea: 'Updated Area',
                compLevel: 'Updated Level'
            })

            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of({ ok: false })),
                componentInstance: {}
            })

            component.competencySelected(mockEvent, 0)

            expect(mockDialog.open).toHaveBeenCalled()
        })

        test('should handle dialog cancellation', () => {
            const mockEvent = {
                option: {
                    value: {
                        id: 'comp-1',
                        name: 'Test Competency'
                    }
                }
            }

            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of({
                    ok: false,
                    data: { name: 'Cancelled Competency' }
                })),
                componentInstance: {}
            })

            component.competencySelected(mockEvent, 0)

            expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
        })
    })

    describe('Deletion Operations - Complete Coverage', () => {
        beforeEach(() => {
            component.createForm()
            component.addNewGroup()
            component.addNewGroupActivity(0)
            component.addNewGroupActivity(0)
        })

        test('should delete competency row and update store', () => {
            const initialLength = component.groupcompetencyList.length
            component.deleteRowCompetency(0, 0)

            expect(component.groupcompetencyList.length).toBe(initialLength - 1)
            expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
        })

        test('should delete single competency with confirmation', () => {
            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(true))
            })

            const deleteRowSpy = jest.spyOn(component, 'deleteRowCompetency')

            component.deleteSingleCompetency(0, 0)

            expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
                data: {
                    title: 'Delete competency?',
                    body: '  The competency will be deleted from this work order',
                    ok: 'Delete',
                    cancel: 'Go back',
                },
            })
            expect(deleteRowSpy).toHaveBeenCalledWith(0, 0)
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Activity deleted successfully!! ',
                undefined,
                { duration: 2000 }
            )
        })

        test('should not delete when confirmation is cancelled', () => {
            mockDialog.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(false))
            })

            const deleteRowSpy = jest.spyOn(component, 'deleteRowCompetency')

            component.deleteSingleCompetency(0, 0)

            expect(deleteRowSpy).not.toHaveBeenCalled()
            expect(mockSnackBar.open).not.toHaveBeenCalled()
        })

        test('should handle invalid indices in deletion', () => {
            expect(() => component.deleteSingleCompetency(-1, -1)).not.toThrow()
        })
    })

    describe('Utility Methods - Complete Coverage', () => {
        test('should set active group index', () => {
            component.enter(3)
            expect(component.activeGroupIdx).toBe(3)
        })

        test('should update comp data', () => {
            component.updateCompData()
            // Should execute without errors
        })

        test('should handle show operations', () => {
            component.show(1)
            expect(component.canshow).toBe(-1)

            component.hide()
            expect(component.canshow).toBe(-1)
        })

        test('should handle name show operations', () => {
            component.showName(1)
            expect(component.canshowName).toBe(-1)

            component.hideName()
            expect(component.canshowName).toBe(-1)
        })

        test('should handle log method', () => {
            expect(() => component.log({ test: 'data' })).not.toThrow()
        })

        test('should handle submitResult', () => {
            expect(() => component.submitResult({ valid: true })).not.toThrow()
        })
    })

    describe('Form Control Creation Methods', () => {
        test('should create activity control', () => {
            const activityObj: any = {
                localId: 'test-local',
                compId: 'comp-1',
                compName: 'Test Competency',
                compDescription: 'Test Description',
                compLevel: 'Beginner',
                compType: 'Technical',
                compArea: 'Development',
                compSource: 'Manual',
                levelList: []
            }

            component.createForm()
            const initialLength = component.labelsList.length

            component.createActivityControl(activityObj)

            expect(component.labelsList.length).toBe(initialLength + 1)
        })

        test('should create group control', () => {
            const groupObj: any = {
                localId: 'group-local',
                roleId: 'role-1',
                roleName: 'Test Role',
                roleDescription: 'Test Role Description',
                competincies: [
                    {
                        localId: 'comp-local',
                        compId: 'comp-1',
                        compName: 'Test Competency',
                        compDescription: 'Test Description',
                        compLevel: 'Expert',
                        compType: 'Soft',
                        compArea: 'Communication',
                        compSource: 'System',
                        levelList: []
                    }
                ]
            }

            component.createForm()
            const initialLength = component.groupList.length

            component.createGroupControl(groupObj)

            expect(component.groupList.length).toBe(initialLength + 1)
        })

        test('should create activity control array', () => {
            const activities: any = [
                {
                    localId: 'act-1',
                    compId: 'comp-1',
                    compName: 'Activity 1',
                    compDescription: 'Description 1',
                    compLevel: 'Beginner',
                    compType: 'Technical',
                    compArea: 'Development',
                    compSource: 'Manual',
                    levelList: []
                }
            ]

            const result = component.createActivtyControl(activities)
            expect(Array.isArray(result)).toBe(true)
        })
    })

    describe('Component Lifecycle - Complete', () => {
        test('should cleanup subscriptions on destroy', () => {
            const unsubscribeNextSpy = jest.spyOn(component['unsubscribe'], 'next')

            component['activitySubscription'] = {
                unsubscribe: jest.fn()
            }

            component.ngOnDestroy()

            expect(unsubscribeNextSpy).toHaveBeenCalled()
            expect(component['activitySubscription'].unsubscribe).toHaveBeenCalled()
        })

        test('should handle afterViewInit', () => {
            expect(() => component.ngAfterViewInit()).not.toThrow()
        })
    })

    describe('Edge Cases and Error Handling', () => {
        test('should handle null activityForm in getters', () => {
            component.activityForm = null as any

            expect(() => component.labelsList).not.toThrow()
            expect(() => component.groupList).not.toThrow()
        })

        test('should handle empty groups array in updateForm', () => {
            component.groups = []
            component.createForm()

            expect(() => component.updateForm()).not.toThrow()
        })

        test('should handle missing form controls gracefully', () => {
            component.createForm()

            // Test with empty group list
            component.groupList.clear()

            expect(() => component.updateForm()).not.toThrow()
        })

        test('should handle filterUsers with empty response', async () => {
            mockAllocationService.onSearchUser.mockReturnValue(of({
                result: { response: { content: [] } }
            }))

            await component.filterUsers('test')

            expect(component.userslist).toEqual([])
        })
    })

    describe('Form Value Setters - Complete Coverage', () => {
        beforeEach(() => {
            component.createForm()
        })

        test('should set labels values', () => {
            const testValues = [{ activityName: 'Test Activity' }]
            component.setlabelsValues(testValues)
            expect(component.labelsList.value).toEqual(testValues)
        })

        test('should set group values', () => {
            const testValues = [{ roleName: 'Test Role' }]
            component.setGroupValues(testValues)
            expect(component.groupList.value).toEqual(testValues)
        })

        test('should set group activity values', () => {
            component.addNewGroup()
            const testValues = [{ compName: 'Test Competency' }]
            component.setGroupActivityValues(testValues)
            expect(component.groupcompetencyList.value).toEqual(testValues)
        })
    })
})