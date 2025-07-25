import { FilterComponent } from './filter.component'
import { ChangeDetectorRef } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { of, Subject } from 'rxjs'

// Define interfaces for testing


interface GroupItem {
    id: string
    name: string
    selected?: boolean
}

interface ProviderItem {
    name: string
    selected?: boolean
    checked?: boolean
}

describe('FilterComponent', () => {
    let component: FilterComponent
    let mockChangeDetectorRef: jest.Mocked<ChangeDetectorRef>
    let mockTrainingPlanService: any
    let mockTpdsSvc: any
    let mockInitService: any

    beforeEach(() => {
        // Mock ChangeDetectorRef
        mockChangeDetectorRef = {
            detectChanges: jest.fn(),
            markForCheck: jest.fn(),
            detach: jest.fn(),
            reattach: jest.fn(),
            checkNoChanges: jest.fn()
        } as jest.Mocked<ChangeDetectorRef>

        // Mock TrainingPlanService
        mockTrainingPlanService = {
            getFilterEntity: jest.fn().mockReturnValue(of([])),
            getProviders: jest.fn().mockReturnValue(of([])),
            getDesignations: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } }))
        }

        // Mock TrainingPlanDataSharingService
        mockTpdsSvc = {
            filterToggle: new Subject(),
            clearFilter: new Subject(),
            getFilterDataObject: new Subject(),
            trainingPlanAssigneeData: null
        }

        // Mock InitService
        mockInitService = {
            configSvc: {
                competency: {
                    'v1': {
                        vKey: 'v1',
                        vCompetencyArea: 'competencyArea',
                        vCompetencyAreaDescription: 'competencyAreaDescription',
                        vCompetencyTheme: 'competencyTheme',
                        vCompetencySubTheme: 'competencySubTheme'
                    }
                }
            }
        };

        // Mock environment
        (global as any).environment = {
            compentencyVersionKey: 'v1'
        }

        // Create component instance
        component = new FilterComponent(
            mockChangeDetectorRef,
            mockTrainingPlanService,
            mockTpdsSvc,
            mockInitService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize default values', () => {
            expect(component.designationList).toEqual([])
            expect(component.providersList).toEqual([])
            expect(component.selectedProviders).toEqual([])
            expect(component.competencyList).toEqual([])
            expect(component.competencyThemeList).toEqual([])
            expect(component.competencySubThemeList).toEqual([])
        })

        it('should initialize competency type list with default values', () => {
            expect(component.competencyTypeList).toEqual([
                { id: 'Behavioural', name: 'Behavioural' },
                { id: 'Functional', name: 'Functional' },
                { id: 'Domain', name: 'Domain' }
            ])
        })

        it('should initialize group list with default values', () => {
            expect(component.groupList).toEqual([
                { id: 'groupA', name: 'Group A' },
                { id: 'groupB', name: 'Group B' },
                { id: 'groupC', name: 'Group C' },
                { id: 'groupD', name: 'Group D' },
                { id: 'contractualStaff', name: 'Contractual Staff' },
                { id: 'others', name: 'Others' }
            ])
        })

        it('should initialize form controls', () => {
            expect(component.searchThemeControl).toBeInstanceOf(UntypedFormControl)
            expect(component.searchSubThemeControl).toBeInstanceOf(UntypedFormControl)
            expect(component.searchProviderControl).toBeInstanceOf(UntypedFormControl)
        })
    })

    describe('ngOnInit', () => {
        it('should initialize competency key and filter object', () => {
            component.ngOnInit()

            expect(component.compentencyKey).toEqual({
                vKey: 'v1',
                vCompetencyArea: 'competencyArea',
                vCompetencyAreaDescription: 'competencyAreaDescription',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            })

            expect(component.filterObj).toEqual({
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: [],
                providers: []
            })
        })

        it('should subscribe to filterToggle with content data', () => {
            const getFilterEntitySpy = jest.spyOn(component, 'getFilterEntity')
            const getProvidersSpy = jest.spyOn(component, 'getProviders')

            component.ngOnInit()
            mockTpdsSvc.filterToggle.next({ from: 'content', status: true })

            expect(getFilterEntitySpy).toHaveBeenCalled()
            expect(getProvidersSpy).toHaveBeenCalled()
        })

        it('should subscribe to filterToggle with non-content data', () => {
            const getDesignationSpy = jest.spyOn(component, 'getDesignation')
            component.designationList = []

            component.ngOnInit()
            mockTpdsSvc.filterToggle.next({ from: 'other', status: true })

            expect(getDesignationSpy).toHaveBeenCalled()
        })

        it('should subscribe to clearFilter', () => {
            const clearFilterSpy = jest.spyOn(component, 'clearFilter')

            component.ngOnInit()
            mockTpdsSvc.clearFilter.next({ from: 'test', status: true })

            expect(component.from).toBe('test')
            expect(clearFilterSpy).toHaveBeenCalled()
        })
    })

    describe('ngAfterContentChecked', () => {
        it('should call detectChanges', () => {
            component.ngAfterContentChecked()
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })
    })

    describe('getFilterEntity', () => {
        it('should call trainingPlanService.getFilterEntity and set competencyList', () => {
            const mockResponse = [{ id: 1, name: 'Test Competency' }]
            mockTrainingPlanService.getFilterEntity.mockReturnValue(of(mockResponse))

            component.getFilterEntity()

            expect(mockTrainingPlanService.getFilterEntity).toHaveBeenCalledWith({
                search: { type: 'Competency Area' },
                filter: { isDetail: true }
            })
            expect(component.competencyList).toEqual(mockResponse)
        })
    })

    describe('getProviders', () => {
        it('should call trainingPlanService.getProviders and set providersList', () => {
            const mockProviders: ProviderItem[] = [{ name: 'Provider 1' }, { name: 'Provider 2' }]
            mockTrainingPlanService.getProviders.mockReturnValue(of(mockProviders))
            component.filterObj = { providers: ['Provider 1'] }

            component.getProviders()

            expect(mockTrainingPlanService.getProviders).toHaveBeenCalled()
            expect(component.providersList).toEqual(mockProviders)
            expect((component.providersList[0] as ProviderItem).selected).toBe(true)
            expect((component.providersList[1] as ProviderItem).selected).toBe(false)
        })
    })

    describe('hideFilter', () => {
        it('should emit filterToggle with false status', () => {
            const nextSpy = jest.spyOn(mockTpdsSvc.filterToggle, 'next')

            component.hideFilter()

            expect(nextSpy).toHaveBeenCalledWith({ from: '', status: false })
        })
    })

    describe('checkedProviders', () => {
        beforeEach(() => {
            component.providersList = [{ name: 'Provider 1' }, { name: 'Provider 2' }]
            component.filterObj = { providers: [] }
        })

        it('should add provider when checked', () => {
            const event = { checked: true }
            const item: ProviderItem = { name: 'Provider 1' }

            component.checkedProviders(event, item)

            expect(item.checked).toBe(true)
            expect((component.providersList[0] as ProviderItem).selected).toBe(true)
            expect(component.filterObj.providers).toContain('Provider 1')
        })

        it('should remove provider when unchecked', () => {
            const event = { checked: false }
            const item: ProviderItem = { name: 'Provider 1' }
            component.filterObj.providers = ['Provider 1']

            component.checkedProviders(event, item)

            expect(item.checked).toBe(false)
            expect((component.providersList[0] as ProviderItem).selected).toBe(false)
            expect(component.filterObj.providers).not.toContain('Provider 1')
        })
    })

    describe('getCompetencyTheme', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vKey: 'v1',
                vCompetencyArea: 'competencyArea',
                vCompetencyAreaDescription: 'competencyAreaDescription',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
            component.competencyList = [
                {
                    name: 'Behavioural',
                    children: [{ name: 'Theme 1' }, { name: 'Theme 2' }]
                }
            ]
        })

        it('should add competency area when checked', () => {
            const event = { checked: true }
            const ctype: GroupItem = { id: 'Behavioural', name: 'Behavioural' }

            component.getCompetencyTheme(event, ctype)

            expect(ctype.selected).toBe(true)
            expect(component.filterObj.competencyArea).toContain('Behavioural')
            expect(component.competencyThemeList.length).toBe(2)
        })

        it('should remove competency area and related themes when unchecked', () => {
            const event = { checked: false }
            const ctype: GroupItem = { id: 'Behavioural', name: 'Behavioural' }
            component.filterObj.competencyArea = ['Behavioural']
            component.competencyThemeList = [{ name: 'Theme 1', parent: 'Behavioural' }]

            component.getCompetencyTheme(event, ctype)

            expect(ctype.selected).toBe(false)
            expect(component.filterObj.competencyArea).not.toContain('Behavioural')
            expect(component.competencyThemeList.length).toBe(0)
        })
    })

    describe('getCompetencySubTheme', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vKey: 'v1',
                vCompetencyArea: 'competencyArea',
                vCompetencyAreaDescription: 'competencyAreaDescription',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
            component.competencyThemeList = [
                {
                    name: 'Theme 1',
                    parent: 'Behavioural',
                    children: [{ name: 'SubTheme 1' }]
                }
            ]
        })

        it('should add competency theme when checked', () => {
            const event = { checked: true }
            const cstype = { name: 'Theme 1' }

            component.getCompetencySubTheme(event, cstype)

            expect(component.filterObj.competencyTheme).toContain('Theme 1')
            expect(component.competencySubThemeList.length).toBe(1)
        })

        it('should remove competency theme when unchecked', () => {
            const event = { checked: false }
            const cstype = { name: 'Theme 1' }
            component.filterObj.competencyTheme = ['Theme 1']
            component.competencySubThemeList = [{ name: 'SubTheme 1', parent: 'Theme 1' }]

            component.getCompetencySubTheme(event, cstype)

            expect(component.filterObj.competencyTheme).not.toContain('Theme 1')
            expect(component.competencySubThemeList.length).toBe(0)
        })
    })

    describe('manageCompetencySubTheme', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vKey: 'v1',
                vCompetencyArea: 'competencyArea',
                vCompetencyAreaDescription: 'competencyAreaDescription',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
            component.competencySubThemeList = [{ name: 'SubTheme 1' }]
        })

        it('should add competency sub-theme when checked', () => {
            const event = { checked: true }
            const csttype = { name: 'SubTheme 1' }

            component.manageCompetencySubTheme(event, csttype)

            expect((component.competencySubThemeList[0] as any).selected).toBe(true)
            expect(component.filterObj.competencySubTheme).toContain('SubTheme 1')
        })

        it('should remove competency sub-theme when unchecked', () => {
            const event = { checked: false }
            const csttype = { name: 'SubTheme 1' }
            component.filterObj.competencySubTheme = ['SubTheme 1']

            component.manageCompetencySubTheme(event, csttype)

            expect((component.competencySubThemeList[0] as any).selected).toBe(false)
            expect(component.filterObj.competencySubTheme).not.toContain('SubTheme 1')
        })
    })

    describe('applyFilter', () => {
        it('should emit filter data for content', () => {
            const nextSpy = jest.spyOn(mockTpdsSvc.getFilterDataObject, 'next')
            const filterToggleSpy = jest.spyOn(mockTpdsSvc.filterToggle, 'next')
            component.from = 'content'
            component.filterObj = { test: 'data' }

            component.applyFilter()

            expect(nextSpy).toHaveBeenCalledWith({ test: 'data' })
            expect(filterToggleSpy).toHaveBeenCalledWith({ from: '', status: false })
        })

        it('should emit assignee filter data for non-content', () => {
            const nextSpy = jest.spyOn(mockTpdsSvc.getFilterDataObject, 'next')
            component.from = 'assignee'
            component.assigneeFilterObj = { group: [], designation: [] }

            component.applyFilter()

            expect(nextSpy).toHaveBeenCalledWith({ group: [], designation: [] })
        })
    })

    describe('clearFilter', () => {
        it('should clear content filters', () => {
            component.from = 'content'
            component.compentencyKey = {
                vKey: 'v1',
                vCompetencyArea: 'competencyArea',
                vCompetencyAreaDescription: 'competencyAreaDescription',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }
            const resetFilterSpy = jest.spyOn(component, 'resetFilter')

            component.clearFilter()

            expect(component.filterObj).toEqual({
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: [],
                providers: []
            })
            expect(component.selectedProviders).toEqual([])
            expect(component.competencyThemeList).toEqual([])
            expect(component.competencySubThemeList).toEqual([])
            expect(resetFilterSpy).toHaveBeenCalled()
        })

        it('should clear assignee filters', () => {
            component.from = 'assignee'
            const resetAssigneeFilterSpy = jest.spyOn(component, 'resetAssigneeFilter')

            component.clearFilter()

            expect(component.assigneeFilterObj).toEqual({ group: [], designation: [] })
            expect(resetAssigneeFilterSpy).toHaveBeenCalled()
        })
    })

    describe('getDesignation', () => {
        it('should call trainingPlanService.getDesignations and set designationList', () => {
            const mockResponse = {
                result: {
                    response: {
                        content: [{ name: 'Manager' }, { name: 'Developer' }]
                    }
                }
            }
            mockTrainingPlanService.getDesignations.mockReturnValue(of(mockResponse))

            component.getDesignation()

            expect(mockTrainingPlanService.getDesignations).toHaveBeenCalled()
            expect(component.designationList).toEqual(mockResponse.result.response.content)
        })
    })

    describe('manageSelectedGroup', () => {
        beforeEach(() => {
            component.assigneeFilterObj = { group: [], designation: [] }
        })

        it('should add group when checked', () => {
            const event = { checked: true }
            const group: GroupItem = { id: 'groupA', name: 'Group A' }

            component.manageSelectedGroup(event, group)

            expect(group.selected).toBe(true)
            expect(component.assigneeFilterObj.group).toContain('Group A')
        })

        it('should remove group when unchecked', () => {
            const event = { checked: false }
            const group: GroupItem = { id: 'groupA', name: 'Group A' }
            component.assigneeFilterObj.group = ['Group A']

            component.manageSelectedGroup(event, group)

            expect(group.selected).toBe(false)
            expect(component.assigneeFilterObj.group).not.toContain('Group A')
        })
    })

    describe('manageSelectedDesignation', () => {
        beforeEach(() => {
            component.assigneeFilterObj = { group: [], designation: [] }
            component.designationList = [{ name: 'Manager' }, { name: 'Developer' }]
        })

        it('should add designation when checked', () => {
            const event = { checked: true }
            const designation = { name: 'Manager' }

            component.manageSelectedDesignation(event, designation)

            expect((component.designationList[0] as any).selected).toBe(true)
            expect(component.assigneeFilterObj.designation).toContain('Manager')
        })

        it('should remove designation when unchecked', () => {
            const event = { checked: false }
            const designation = { name: 'Manager' }
            component.assigneeFilterObj.designation = ['Manager']

            component.manageSelectedDesignation(event, designation)

            expect((component.designationList[0] as any).selected).toBe(false)
            expect(component.assigneeFilterObj.designation).not.toContain('Manager')
        })
    })

    describe('resetFilter', () => {
        it('should reset all filter selections', () => {
            component.competencyTypeList = [{ id: 'test', name: 'Test', selected: true } as any]
            component.competencyThemeList = [{ name: 'Theme', selected: true } as any]
            component.competencySubThemeList = [{ name: 'SubTheme', selected: true } as any]
            component.providersList = [{ name: 'Provider', selected: true } as any]

            component.resetFilter()

            expect((component.competencyTypeList[0] as any).selected).toBe(false)
            expect((component.competencyThemeList[0] as any).selected).toBe(false)
            expect((component.competencySubThemeList[0] as any).selected).toBe(false)
            expect((component.providersList[0] as any).selected).toBe(false)
        })
    })

    describe('resetAssigneeFilter', () => {
        it('should reset assignee filter selections', () => {
            component.groupList = [{ id: 'groupA', name: 'Group A', selected: true }]
            component.designationList = [{ name: 'Manager', selected: true } as any]

            component.resetAssigneeFilter()

            expect(component.groupList[0].selected).toBe(false)
            expect((component.designationList[0] as any).selected).toBe(false)
        })
    })

    describe('clearFilterWhileSearch', () => {
        it('should uncheck all checkboxes', () => {
            const mockCheckbox1 = { checked: true }
            const mockCheckbox2 = { checked: true }
            const mockQueryList = {
                forEach: jest.fn((callback) => {
                    callback(mockCheckbox1)
                    callback(mockCheckbox2)
                })
            } as any

            component.checkboxes = mockQueryList
            component.clearFilterWhileSearch()

            expect(mockCheckbox1.checked).toBe(false)
            expect(mockCheckbox2.checked).toBe(false)
        })
    })
})