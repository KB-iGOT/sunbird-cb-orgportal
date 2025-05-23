import { CompetencyLabelsComponent } from './competency-labels.component'
import { BehaviorSubject, of } from 'rxjs'
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms'

// Mock dependencies
describe('CompetencyLabelsComponent', () => {
    let component: CompetencyLabelsComponent
    let mockChangeDetector: any
    let mockFormBuilder: any
    let mockAllocateService: any
    let mockWatStore: any
    let mockSnackBar: any
    let mockDialog: any
    let mockActivatedRoute: any
    let mockDialogRef: any

    beforeEach(() => {
        // Mock dependencies
        mockChangeDetector = {
            detectChanges: jest.fn()
        }

        mockFormBuilder = {
            group: jest.fn().mockReturnValue({}),
            array: jest.fn().mockReturnValue([]),
            control: jest.fn()
        }

        mockAllocateService = {
            onSearchUser: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } })),
            onSearchCompetency: jest.fn().mockReturnValue(of({ responseData: [] }))
        }

        mockWatStore = {
            getactivitiesGroup: new BehaviorSubject([]),
            getID: 'mock-id',
            setgetcompetencyGroup: jest.fn(),
            getUpdateCompGroupById: jest.fn().mockReturnValue({})
        }

        mockSnackBar = {
            open: jest.fn()
        }

        mockDialogRef = {
            afterClosed: jest.fn().mockReturnValue(of({
                ok: true,
                data: {
                    compId: 'comp-1',
                    compName: 'Competency 1',
                    compDescription: 'Description',
                    compLevel: 'Level 1',
                    compType: 'Type 1',
                    compArea: 'Area 1',
                    compSource: 'Source 1',
                    levelList: []
                }
            })),
            componentInstance: {}
        }

        mockDialog = {
            open: jest.fn().mockReturnValue(mockDialogRef)
        }

        mockActivatedRoute = {
            snapshot: {
                data: {
                    pageData: {
                        data: {
                            levels: []
                        }
                    }
                }
            }
        }

        // Create actual FormBuilder for certain tests
        const realFormBuilder = new UntypedFormBuilder()
        mockFormBuilder.group = realFormBuilder.group.bind(realFormBuilder)
        mockFormBuilder.array = realFormBuilder.array.bind(realFormBuilder)

        // Create component instance
        component = new CompetencyLabelsComponent(
            mockChangeDetector,
            mockFormBuilder,
            mockAllocateService,
            mockWatStore,
            mockSnackBar,
            mockDialog,
            mockActivatedRoute
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize activityForm in ngOnInit', () => {
            // Setup form spies
            jest.spyOn(component, 'createForm')
            jest.spyOn(component, 'initListen')

            // Call ngOnInit
            component.ngOnInit()

            // Verify form creation and initialization
            expect(component.createForm).toHaveBeenCalled()
            expect(component.initListen).toHaveBeenCalled()
        })

        it('should subscribe to watStore.getactivitiesGroup in ngOnInit', () => {
            // Setup spy
            const subscriptionSpy = jest.spyOn(mockWatStore.getactivitiesGroup, 'subscribe')

            // Call ngOnInit
            component.ngOnInit()

            // Verify subscription
            expect(subscriptionSpy).toHaveBeenCalled()
        })

        it('should unsubscribe on ngOnDestroy', () => {
            // Setup
            const unsubscribeSpy = jest.spyOn(component['unsubscribe'], 'next')
            const activitySubscriptionSpy = { unsubscribe: jest.fn() }
            component['activitySubscription'] = activitySubscriptionSpy

            // Call ngOnDestroy
            component.ngOnDestroy()

            // Verify unsubscriptions
            expect(unsubscribeSpy).toHaveBeenCalled()
            expect(activitySubscriptionSpy.unsubscribe).toHaveBeenCalled()
        })
    })

    describe('Form Management', () => {
        beforeEach(() => {
            // Call createForm to set up the form
            component.createForm()
        })

        it('should add a new group with createForm', () => {
            // Spy on addNewGroup method
            jest.spyOn(component, 'addNewGroup')

            // Call createForm
            component.createForm()

            // Verify addNewGroup was called
            expect(component.addNewGroup).toHaveBeenCalled()
        })

        it('should add a new group with addNewGroup', () => {
            // Create a fake form array and spy on its push method
            const formArray = new UntypedFormArray([])
            const pushSpy = jest.spyOn(formArray, 'push')

            // Mock the activityForm to return this form array
            component['activityForm'] = new UntypedFormGroup({
                groupsArray: formArray
            })

            // Spy on internal method
            jest.spyOn(component, 'setGroupValues')

            // Call the method under test
            component.addNewGroup()

            // Assert expectations
            expect(pushSpy).toHaveBeenCalled()
            expect(component.setGroupValues).toHaveBeenCalled()
        })


        it('should add a new group activity with addNewGroupActivity', () => {
            // Mock FormArray
            const mockGroupCompetencyList = {
                push: jest.fn(),
                patchValue: jest.fn(), // ✅ this fixes the error
                value: []
            }

            // Spy on groupcompetencyList getter
            jest.spyOn(component, 'groupcompetencyList', 'get').mockReturnValue(mockGroupCompetencyList as any)

            // Spy on setGroupActivityValues
            jest.spyOn(component, 'setGroupActivityValues')

            // Call the method
            component.addNewGroupActivity(0)

            // Assert push and setGroupActivityValues were called
            expect(mockGroupCompetencyList.push).toHaveBeenCalled()
            expect(component.setGroupActivityValues).toHaveBeenCalled()
        })

    })

    describe('Event Handlers', () => {
        beforeEach(() => {
            // Create form for testing event handlers
            component.createForm()
        })

        it('should update activeGroupIdx when enter is called', () => {
            // Call enter with index 2
            component.enter(2)

            // Verify activeGroupIdx was updated
            expect(component.activeGroupIdx).toBe(2)
        })

        it('should filter users when filterUsers is called', async () => {
            // Call filterUsers
            await component.filterUsers('test')

            // Verify onSearchUser was called
            expect(mockAllocateService.onSearchUser).toHaveBeenCalledWith('test')
        })

        it('should filter competencies when filterCompetencies is called', async () => {
            // Setup spy
            const nextSpy = jest.spyOn(component.filteredCompetenciesV1, 'next')

            // Call filterCompetencies with search term longer than 2 chars
            await component.filterCompetencies('test', 1)

            // Verify
            expect(component.selectedCompIdx).toBe(1)
            expect(mockAllocateService.onSearchCompetency).toHaveBeenCalledWith('test')
            expect(nextSpy).toHaveBeenCalled()
        })

        it('should not filter competencies when search term is too short', async () => {
            // Call filterCompetencies with short search term
            await component.filterCompetencies('te', 1)

            // Verify onSearchCompetency was not called
            expect(mockAllocateService.onSearchCompetency).not.toHaveBeenCalled()
        })
    })

    describe('Drag and Drop Functionality', () => {


        it('should handle dropping within the same container', () => {
            const mockPatchValue = jest.fn()
            const mockValue = { compName: 'Test', id: 1 }

            // Mock for form control (FormGroup)
            const mockFormGroup = {
                value: mockValue,
                patchValue: mockPatchValue
            }

            // Mock for competencies FormArray
            const mockCompetenciesArray = {
                at: jest.fn().mockReturnValue(mockFormGroup),
                controls: [mockFormGroup, mockFormGroup, mockFormGroup],
                value: [mockValue, mockValue, mockValue]
            }

            // Mock for FormArray inside groupsArray
            const mockGroupsArray = {
                at: jest.fn().mockReturnValue({
                    get: jest.fn().mockImplementation((key: string) => {
                        if (key === 'competincies') {
                            return mockCompetenciesArray
                        }
                        return undefined
                    })
                })
            }

            // Mock activityForm.get
            component['activityForm'] = {
                get: jest.fn().mockReturnValue(mockGroupsArray)
            } as any

            const mockEvent = {
                previousContainer: {
                    id: 'compe_0',
                    data: [mockValue, mockValue, mockValue]
                },
                container: {
                    id: 'compe_0',
                    data: [mockValue, mockValue, mockValue]
                },
                previousIndex: 1,
                currentIndex: 2,
                item: { data: mockValue }
            }

            // Stub moveItemInArray directly if your method uses it
            const moveItemInArray = jest.fn()
            jest.mocked(moveItemInArray)

            mockWatStore.setgetcompetencyGroup = jest.fn()

            // Call the method
            component.dropgroup(mockEvent as any)

            // Assert correct behavior
            expect(mockPatchValue).toHaveBeenCalled()
            expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
        })

    })



    describe('Competency Selection and Updates', () => {

        it('should open dialog when competency is selected', () => {
            const mockPatchValue = jest.fn()

            const mockFormControl = {
                get: jest.fn().mockReturnValue({ value: 'mock-id' }),
                patchValue: mockPatchValue
            }

            const mockFormArray = {
                at: jest.fn().mockReturnValue(mockFormControl),
                get: jest.fn().mockReturnValue(mockFormControl),
                value: [{ localId: 'mock-id', compName: 'Test' }],
                patchValue: mockPatchValue
            }

            const mockGroup = {
                get: jest.fn().mockImplementation((key: string) => {
                    if (key === 'competincies') {
                        return mockFormArray
                    }
                    return undefined
                }),
            }

            Object.defineProperty(component, 'groupList', {
                get: jest.fn().mockReturnValue({
                    at: jest.fn().mockReturnValue(mockGroup),
                    value: [{}],
                })
            })

            component.selectedCompIdx = 0

            const mockDialogRef = {
                componentInstance: {},
                afterClosed: jest.fn().mockReturnValue({
                    subscribe: jest.fn()
                }),
            }

            mockDialog.open.mockReturnValue(mockDialogRef)

            const mockEvent = {
                option: {
                    value: {
                        name: 'Competency 1',
                        id: 'comp-1',
                        description: 'Description',
                        children: []
                    }
                }
            }

            component.competencySelected(mockEvent, 0)

            expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                restoreFocus: false,
                disableClose: true,
                data: expect.any(Object)
            }))
        })


        it('should update form values when dialog is closed with OK', () => {
            // Setup mock form structure
            const mockFormGroup = new UntypedFormGroup({
                compId: new UntypedFormControl(''),
                compDescription: new UntypedFormControl(''),
                localId: new UntypedFormControl('mock-id'),
                compName: new UntypedFormControl(''),
                compSource: new UntypedFormControl(''),
                compLevel: new UntypedFormControl(''),
                compType: new UntypedFormControl(''),
                compArea: new UntypedFormControl(''),
                levelList: new UntypedFormArray([]),
            })

            const competenciesArray = new UntypedFormArray([mockFormGroup])

            const group = new UntypedFormGroup({
                competincies: competenciesArray
            })

            const groupsArray = new UntypedFormArray([group])

            component['activityForm'] = new UntypedFormGroup({
                groupsArray: groupsArray
            })

            // Ensure selectedCompIdx is valid
            component.selectedCompIdx = 0

            // Mock ActivatedRoute snapshot
            component['activated'] = {
                snapshot: {
                    data: {
                        pageData: {
                            data: {
                                levels: []
                            }
                        }
                    }
                }
            } as any

            // Mock dialog
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of({
                    ok: true,
                    data: {
                        compId: 'new-id',
                        compDescription: 'new-desc',
                        localId: 'new-local-id',
                        compName: 'new-name',
                        compSource: 'new-source',
                        compLevel: 'Level 1',
                        compType: 'Type X',
                        compArea: 'Area Y',
                        levelList: ['L1', 'L2']
                    }
                })),
                componentInstance: {}
            }
            jest.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any)

            // Spy updateCompData
            jest.spyOn(component, 'updateCompData')

            // Mock event
            const mockEvent = {
                option: {
                    value: {
                        name: 'Competency 1',
                        id: 'comp-1',
                        description: 'Description',
                        children: []
                    }
                }
            }

            // Call the method
            component.competencySelected(mockEvent, 0)

            // Verify patchValue updates
            const updatedGroup = (component.groupList.at(0).get('competincies') as UntypedFormArray).at(0)
            expect(updatedGroup.get('compId')?.value).toBe('new-id')
            expect(updatedGroup.get('compName')?.value).toBe('new-name')
            expect(updatedGroup.get('compDescription')?.value).toBe('new-desc')

            // Verify store and update call
            expect(component['watStore'].setgetcompetencyGroup).toHaveBeenCalled()
            expect(component.updateCompData).toHaveBeenCalled()
        })

    })

    describe('Delete Operations', () => {
        it('should delete competency when confirmed', () => {
            // Setup mocks
            jest.spyOn(component, 'deleteRowCompetency').mockImplementation(() => { })
            mockDialogRef.afterClosed = jest.fn().mockReturnValue(of(true))

            // Call deleteSingleCompetency
            component.deleteSingleCompetency(0, 0)

            // Verify dialog was opened
            expect(mockDialog.open).toHaveBeenCalled()

            // Verify deleteRowCompetency was called and snackbar was shown
            expect(component.deleteRowCompetency).toHaveBeenCalledWith(0, 0)
            expect(mockSnackBar.open).toHaveBeenCalled()
        })

        it('should not delete competency when canceled', () => {
            // Setup mocks
            jest.spyOn(component, 'deleteRowCompetency').mockImplementation(() => { })
            mockDialogRef.afterClosed = jest.fn().mockReturnValue(of(false))

            // Call deleteSingleCompetency
            component.deleteSingleCompetency(0, 0)

            // Verify dialog was opened
            expect(mockDialog.open).toHaveBeenCalled()

            // Verify deleteRowCompetency was not called
            expect(component.deleteRowCompetency).not.toHaveBeenCalled()
            expect(mockSnackBar.open).not.toHaveBeenCalled()
        })


        it('should remove competency at specified index with deleteRowCompetency', () => {
            // Create a mock form array for competencies
            const removeAtSpy = jest.fn()
            const mockCompetinciesArray = {
                removeAt: removeAtSpy
            } as unknown as UntypedFormArray

            // Mock the role group that returns the competencies array
            const mockRoleGroup = new UntypedFormGroup({
                competincies: new UntypedFormArray([])
            })
            jest.spyOn(mockRoleGroup, 'get').mockReturnValue(mockCompetinciesArray)

            // Create the mock groups array (i.e., groupList)
            const groupsArray = new UntypedFormArray([mockRoleGroup])

            // Assign the mocked form to component.activityForm
            component['activityForm'] = new UntypedFormGroup({
                groupsArray: groupsArray
            })

            // Call the method
            component.deleteRowCompetency(0, 1)

            // Assert
            expect(removeAtSpy).toHaveBeenCalledWith(1)
            expect(mockWatStore.setgetcompetencyGroup).toHaveBeenCalled()
        })

    })
})