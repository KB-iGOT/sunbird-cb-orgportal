import { FilterComponent } from './filter.component'
import { ChangeDetectorRef, ElementRef, QueryList } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { of, Subject } from 'rxjs'

describe('FilterComponent', () => {
    let component: FilterComponent
    let mockCdRef: jest.Mocked<ChangeDetectorRef>
    let mockTrainingPlanService: any
    let mockTpdsSvc: any
    let mockInitService: any

    beforeEach(() => {
        // Mock ChangeDetectorRef
        mockCdRef = {
            detectChanges: jest.fn(),
            markForCheck: jest.fn(),
            detach: jest.fn(),
            reattach: jest.fn(),
            checkNoChanges: jest.fn()
        } as any

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
                        vCompetencyArea: 'competencyArea',
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

        component = new FilterComponent(
            mockCdRef,
            mockTrainingPlanService,
            mockTpdsSvc,
            mockInitService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        test('should create component', () => {
            expect(component).toBeTruthy()
        })

        test('should initialize properties correctly', () => {
            expect(component.designationList).toEqual([])
            expect(component.providersList).toEqual([])
            expect(component.selectedProviders).toEqual([])
            expect(component.competencyList).toEqual([])
            expect(component.competencyThemeList).toEqual([])
            expect(component.competencySubThemeList).toEqual([])
            expect(component.searchThemeControl).toBeInstanceOf(UntypedFormControl)
            expect(component.searchSubThemeControl).toBeInstanceOf(UntypedFormControl)
            expect(component.searchProviderControl).toBeInstanceOf(UntypedFormControl)
        })

        test('should initialize competencyTypeList with correct values', () => {
            const expectedTypes = [
                { id: 'Behavioural', name: 'Behavioural' },
                { id: 'Functional', name: 'Functional' },
                { id: 'Domain', name: 'Domain' }
            ]
            expect(component.competencyTypeList).toEqual(expectedTypes)
        })

        test('should initialize groupList with correct values', () => {
            const expectedGroups = [
                { id: 'groupA', name: 'Group A' },
                { id: 'groupB', name: 'Group B' },
                { id: 'groupC', name: 'Group C' },
                { id: 'groupD', name: 'Group D' },
                { id: 'contractualStaff', name: 'Contractual Staff' },
                { id: 'others', name: 'Others' }
            ]
            expect(component.groupList).toEqual(expectedGroups)
        })
    })

    describe('ngOnInit', () => {
        test('should set competency key and initialize filter object', () => {
            component.ngOnInit()

            expect(component.compentencyKey).toEqual({
                vCompetencyArea: 'competencyArea',
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

        test('should subscribe to filterToggle and handle content filter', () => {
            jest.spyOn(component, 'getFilterEntity')
            jest.spyOn(component, 'getProviders')

            component.ngOnInit()

            mockTpdsSvc.filterToggle.next({ status: true, from: 'content' })

            expect(component.getFilterEntity).toHaveBeenCalled()
            expect(component.getProviders).toHaveBeenCalled()
        })

        test('should subscribe to filterToggle and handle assignee filter', () => {
            jest.spyOn(component, 'getDesignation')
            component.designationList = []

            component.ngOnInit()

            mockTpdsSvc.filterToggle.next({ status: true, from: 'assignee' })

            expect(component.getDesignation).toHaveBeenCalled()
        })

        test('should subscribe to clearFilter', () => {
            jest.spyOn(component, 'clearFilter')

            component.ngOnInit()

            mockTpdsSvc.clearFilter.next({ status: true, from: 'content' })

            expect(component.clearFilter).toHaveBeenCalled()
            expect(component.from).toBe('content')
        })
    })

    describe('ngAfterContentChecked', () => {
        test('should call detectChanges', () => {
            component.ngAfterContentChecked()
            expect(mockCdRef.detectChanges).toHaveBeenCalled()
        })
    })

    describe('getFilterEntity', () => {
        test('should fetch filter entities and set competency list', () => {
            const mockResponse = [{ name: 'Test Competency' }]
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
        test('should fetch providers and set selected state', () => {
            const mockProviders = [
                { name: 'Provider 1' },
                { name: 'Provider 2' }
            ]
            component.filterObj = { providers: ['Provider 1'] }
            mockTrainingPlanService.getProviders.mockReturnValue(of(mockProviders))

            component.getProviders()

            expect(component.providersList).toEqual([
                { name: 'Provider 1', selected: true },
                { name: 'Provider 2', selected: false }
            ])
        })
    })

    describe('hideFilter', () => {
        test('should emit filter toggle with false status', () => {
            jest.spyOn(mockTpdsSvc.filterToggle, 'next')

            component.hideFilter()

            expect(mockTpdsSvc.filterToggle.next).toHaveBeenCalledWith({
                from: '',
                status: false
            })
        })
    })

    describe('checkedProviders', () => {
        beforeEach(() => {
            component.providersList = [
                { name: 'Provider 1', selected: false },
                { name: 'Provider 2', selected: false }
            ]
            component.filterObj = { providers: [] }
        })

        test('should add provider when checked', () => {
            const event = { checked: true }
            const item = { name: 'Provider 1' }

            component.checkedProviders(event, item)

            expect(item.checked).toBe(true)
            expect(component.providersList[0].selected).toBe(true)
            expect(component.filterObj.providers).toContain('Provider 1')
        })

        test('should remove provider when unchecked', () => {
            const event = { checked: false }
            const item = { name: 'Provider 1' }
            component.filterObj.providers = ['Provider 1']

            component.checkedProviders(event, item)

            expect(item.checked).toBe(false)
            expect(component.providersList[0].selected).toBe(false)
            expect(component.filterObj.providers).not.toContain('Provider 1')
        })
    })

    describe('getCompetencyTheme', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }
            component.competencyList = [
                {
                    name: 'Behavioural',
                    children: [
                        { name: 'Theme 1' },
                        { name: 'Theme 2' }
                    ]
                }
            ]
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
        })

        test('should add competency area when checked', () => {
            const event = { checked: true }
            const ctype = { id: 'Behavioural' }

            component.getCompetencyTheme(event, ctype)

            expect(ctype.selected).toBe(true)
            expect(component.competencyList[0].selected).toBe(true)
            expect(component.filterObj.competencyArea).toContain('Behavioural')
            expect(component.competencyThemeList).toHaveLength(2)
        })

        test('should remove competency area when unchecked', () => {
            const event = { checked: false }
            const ctype = { id: 'Behavioural' }
            component.filterObj.competencyArea = ['Behavioural']
            component.competencyThemeList = [
                { name: 'Theme 1', parent: 'Behavioural' }
            ]

            component.getCompetencyTheme(event, ctype)

            expect(ctype.selected).toBe(false)
            expect(component.filterObj.competencyArea).not.toContain('Behavioural')
            expect(component.competencyThemeList).toHaveLength(0)
        })
    })

    describe('getCompetencySubTheme', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }
            component.competencyThemeList = [
                {
                    name: 'Theme 1',
                    parent: 'Behavioural',
                    children: [
                        { name: 'SubTheme 1' },
                        { name: 'SubTheme 2' }
                    ]
                }
            ]
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
        })

        test('should add competency theme when checked', () => {
            const event = { checked: true }
            const cstype = { name: 'Theme 1' }

            component.getCompetencySubTheme(event, cstype)

            expect(component.competencyThemeList[0].selected).toBe(true)
            expect(component.filterObj.competencyTheme).toContain('Theme 1')
            expect(component.competencySubThemeList).toHaveLength(2)
        })

        test('should remove competency theme when unchecked', () => {
            const event = { checked: false }
            const cstype = { name: 'Theme 1' }
            component.filterObj.competencyTheme = ['Theme 1']
            component.competencySubThemeList = [
                { name: 'SubTheme 1', parent: 'Theme 1' }
            ]

            component.getCompetencySubTheme(event, cstype)

            expect(component.competencyThemeList[0].selected).toBe(false)
            expect(component.filterObj.competencyTheme).not.toContain('Theme 1')
            expect(component.competencySubThemeList).toHaveLength(0)
        })
    })

    describe('manageCompetencySubTheme', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }
            component.competencySubThemeList = [
                { name: 'SubTheme 1', selected: false }
            ]
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
        })

        test('should add sub theme when checked', () => {
            const event = { checked: true }
            const csttype = { name: 'SubTheme 1' }

            component.manageCompetencySubTheme(event, csttype)

            expect(component.competencySubThemeList[0].selected).toBe(true)
            expect(component.filterObj.competencySubTheme).toContain('SubTheme 1')
        })

        test('should remove sub theme when unchecked', () => {
            const event = { checked: false }
            const csttype = { name: 'SubTheme 1' }
            component.filterObj.competencySubTheme = ['SubTheme 1']
            component.competencySubThemeList[0].selected = true

            component.manageCompetencySubTheme(event, csttype)

            expect(component.competencySubThemeList[0].selected).toBe(false)
            expect(component.filterObj.competencySubTheme).not.toContain('SubTheme 1')
        })
    })

    describe('applyFilter', () => {
        test('should emit filter data for content', () => {
            jest.spyOn(mockTpdsSvc.getFilterDataObject, 'next')
            jest.spyOn(mockTpdsSvc.filterToggle, 'next')
            component.from = 'content'
            component.filterObj = { test: 'data' }

            component.applyFilter()

            expect(mockTpdsSvc.getFilterDataObject.next).toHaveBeenCalledWith({ test: 'data' })
            expect(mockTpdsSvc.filterToggle.next).toHaveBeenCalledWith({ from: '', status: false })
        })

        test('should emit assignee filter data for assignee', () => {
            jest.spyOn(mockTpdsSvc.getFilterDataObject, 'next')
            component.from = 'assignee'
            component.assigneeFilterObj = { group: ['Group A'] }

            component.applyFilter()

            expect(mockTpdsSvc.getFilterDataObject.next).toHaveBeenCalledWith({ group: ['Group A'] })
        })
    })

    describe('clearFilter', () => {
        test('should clear content filters', () => {
            jest.spyOn(component, 'resetFilter')
            component.from = 'content'
            component.compentencyKey = {
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencySubTheme: 'competencySubTheme'
            }

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
            expect(component.resetFilter).toHaveBeenCalled()
        })

        test('should clear assignee filters', () => {
            jest.spyOn(component, 'resetAssigneeFilter')
            component.from = 'assignee'

            component.clearFilter()

            expect(component.assigneeFilterObj).toEqual({ group: [], designation: [] })
            expect(component.resetAssigneeFilter).toHaveBeenCalled()
        })
    })

    describe('getDesignation', () => {
        test('should fetch designations and set designation list', () => {
            const mockResponse = {
                result: {
                    response: {
                        content: [
                            { name: 'Manager' },
                            { name: 'Developer' }
                        ]
                    }
                }
            }
            mockTrainingPlanService.getDesignations.mockReturnValue(of(mockResponse))

            component.getDesignation()

            expect(component.designationList).toEqual([
                { name: 'Manager' },
                { name: 'Developer' }
            ])
        })
    })

    describe('manageSelectedGroup', () => {
        beforeEach(() => {
            component.groupList = [
                { name: 'Group A', selected: false },
                { name: 'Group B', selected: false }
            ]
            component.assigneeFilterObj = { group: [], designation: [] }
        })

        test('should add group when checked', () => {
            const event = { checked: true }
            const group = { name: 'Group A' }

            component.manageSelectedGroup(event, group)

            expect(component.groupList[0].selected).toBe(true)
            expect(component.assigneeFilterObj.group).toContain('Group A')
        })

        test('should remove group when unchecked', () => {
            const event = { checked: false }
            const group = { name: 'Group A' }
            component.assigneeFilterObj.group = ['Group A']
            component.groupList[0].selected = true

            component.manageSelectedGroup(event, group)

            expect(component.groupList[0].selected).toBe(false)
            expect(component.assigneeFilterObj.group).not.toContain('Group A')
        })
    })

    describe('manageSelectedDesignation', () => {
        beforeEach(() => {
            component.designationList = [
                { name: 'Manager', selected: false },
                { name: 'Developer', selected: false }
            ]
            component.assigneeFilterObj = { group: [], designation: [] }
        })

        test('should add designation when checked', () => {
            const event = { checked: true }
            const designation = { name: 'Manager' }

            component.manageSelectedDesignation(event, designation)

            expect(component.designationList[0].selected).toBe(true)
            expect(component.assigneeFilterObj.designation).toContain('Manager')
        })

        test('should remove designation when unchecked', () => {
            const event = { checked: false }
            const designation = { name: 'Manager' }
            component.assigneeFilterObj.designation = ['Manager']
            component.designationList[0].selected = true

            component.manageSelectedDesignation(event, designation)

            expect(component.designationList[0].selected).toBe(false)
            expect(component.assigneeFilterObj.designation).not.toContain('Manager')
        })
    })

    describe('resetFilter', () => {
        test('should reset all filter selections', () => {
            component.competencyTypeList = [{ selected: true }]
            component.competencyThemeList = [{ selected: true }]
            component.competencySubThemeList = [{ selected: true }]
            component.providersList = [{ selected: true }]

            component.resetFilter()

            expect(component.competencyTypeList[0].selected).toBe(false)
            expect(component.competencyThemeList[0].selected).toBe(false)
            expect(component.competencySubThemeList[0].selected).toBe(false)
            expect(component.providersList[0].selected).toBe(false)
        })
    })

    describe('resetAssigneeFilter', () => {
        test('should reset assignee filter selections', () => {
            component.groupList = [{ selected: true }]
            component.designationList = [{ selected: true }]

            component.resetAssigneeFilter()

            expect(component.groupList[0].selected).toBe(false)
            expect(component.designationList[0].selected).toBe(false)
        })
    })

    describe('clearFilterWhileSearch', () => {
        test('should clear checkboxes when present', () => {
            const mockCheckbox = { checked: true }
            component.checkboxes = {
                forEach: jest.fn((callback) => callback(mockCheckbox))
            } as any

            component.clearFilterWhileSearch()

            expect(component.checkboxes.forEach).toHaveBeenCalled()
            expect(mockCheckbox.checked).toBe(false)
        })

        test('should handle null checkboxes', () => {
            component.checkboxes = null as any

            expect(() => component.clearFilterWhileSearch()).not.toThrow()
        })
    })

    describe('Edge Cases and Error Handling', () => {
        test('should handle empty competencyList in getCompetencyTheme', () => {
            component.competencyList = []
            const event = { checked: true }
            const ctype = { id: 'Behavioural' }

            expect(() => component.getCompetencyTheme(event, ctype)).not.toThrow()
        })

        test('should handle empty competencyThemeList in getCompetencySubTheme', () => {
            component.competencyThemeList = []
            const event = { checked: true }
            const cstype = { name: 'Theme 1' }

            expect(() => component.getCompetencySubTheme(event, cstype)).not.toThrow()
        })

        test('should handle null filterObj properties', () => {
            component.filterObj = {}
            const event = { checked: true }
            const item = { name: 'Provider 1' }

            expect(() => component.checkedProviders(event, item)).not.toThrow()
        })

        test('should handle missing competency key', () => {
            component.compentencyKey = null as any

            expect(() => component.clearFilter()).not.toThrow()
        })
    })
})