import { FilterComponent } from './filter.component'
import { ChangeDetectorRef } from '@angular/core'
import { TrainingPlanService } from './../../services/traininig-plan.service'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { InitService } from '../../../../../../../../../src/app/services/init.service'
import { of, Subject } from 'rxjs'

describe('FilterComponent', () => {
    let component: FilterComponent
    let mockCdRef: jest.Mocked<ChangeDetectorRef>
    let mockTrainingPlanService: jest.Mocked<TrainingPlanService>
    let mockTpdsSvc: jest.Mocked<TrainingPlanDataSharingService>
    let mockInitService: jest.Mocked<InitService>

    beforeEach(() => {
        // Create mock services
        mockCdRef = {
            detectChanges: jest.fn(),
            markForCheck: jest.fn(),
            detach: jest.fn(),
            reattach: jest.fn(),
            checkNoChanges: jest.fn()
        } as any

        mockTrainingPlanService = {
            getFilterEntity: jest.fn(),
            getProviders: jest.fn(),
            getDesignations: jest.fn()
        } as any

        mockTpdsSvc = {
            filterToggle: new Subject(),
            clearFilter: new Subject(),
            getFilterDataObject: new Subject()
        } as any

        mockInitService = {
            configSvc: {
                competency: {
                    v1: {
                        vCompetencyArea: 'competencyArea',
                        vCompetencyTheme: 'competencyTheme',
                        vCompetencySubTheme: 'competencySubTheme'
                    }
                }
            }
        } as any

        // Mock environment
        const mockEnvironment = { compentencyVersionKey: 'v1' };
        (global as any).environment = mockEnvironment

        // Create component instance
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
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize default properties', () => {
            expect(component.designationList).toEqual([])
            expect(component.providersList).toEqual([])
            expect(component.selectedProviders).toEqual([])
            expect(component.competencyList).toEqual([])
            expect(component.competencyThemeList).toEqual([])
            expect(component.competencySubThemeList).toEqual([])
        })

        it('should initialize competencyTypeList with correct values', () => {
            expect(component.competencyTypeList).toEqual([
                { id: 'Behavioural', name: 'Behavioural' },
                { id: 'Functional', name: 'Functional' },
                { id: 'Domain', name: 'Domain' }
            ])
        })

        it('should initialize groupList with correct values', () => {
            expect(component.groupList).toEqual([
                { id: 'groupA', name: 'Group A' },
                { id: 'groupB', name: 'Group B' },
                { id: 'groupC', name: 'Group C' },
                { id: 'groupD', name: 'Group D' },
                { id: 'contractualStaff', name: 'Contractual Staff' },
                { id: 'others', name: 'Others' }
            ])
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            jest.spyOn(component, 'resetFilter').mockImplementation()
            jest.spyOn(component, 'getFilterEntity').mockImplementation()
            jest.spyOn(component, 'getProviders').mockImplementation()
            jest.spyOn(component, 'getDesignation').mockImplementation()
            jest.spyOn(component, 'clearFilter').mockImplementation()
        })

        it('should initialize competency key and filter object', () => {
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

        it('should call resetFilter on initialization', () => {
            component.ngOnInit()
            expect(component.resetFilter).toHaveBeenCalled()
        })

        it('should handle filterToggle subscription for content filter', () => {
            component.ngOnInit()

            mockTpdsSvc.filterToggle.next({ status: true, from: 'content' })

            expect(component.getFilterEntity).toHaveBeenCalled()
            expect(component.getProviders).toHaveBeenCalled()
        })

        it('should handle filterToggle subscription for assignee filter', () => {
            component.designationList = []
            component.ngOnInit()

            mockTpdsSvc.filterToggle.next({ status: true, from: 'assignee' })

            expect(component.getDesignation).toHaveBeenCalled()
        })

        it('should handle clearFilter subscription', () => {
            component.ngOnInit()

            mockTpdsSvc.clearFilter.next({ status: true, from: 'content' })

            expect(component.from).toBe('content')
            expect(component.clearFilter).toHaveBeenCalled()
        })
    })

    describe('ngAfterContentChecked', () => {
        it('should call detectChanges', () => {
            component.ngAfterContentChecked()
            expect(mockCdRef.detectChanges).toHaveBeenCalled()
        })
    })

    describe('getFilterEntity', () => {
        it('should call trainingPlanService.getFilterEntity with correct parameters', () => {
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
        it('should fetch providers and set selected state', () => {
            const mockProviders = [
                { name: 'Provider 1' },
                { name: 'Provider 2' }
            ]
            component.filterObj = { providers: ['Provider 1'] }
            mockTrainingPlanService.getProviders.mockReturnValue(of(mockProviders))

            component.getProviders()

            expect(mockTrainingPlanService.getProviders).toHaveBeenCalled()
            expect(component.providersList[0].selected).toBe(true)
            expect(component.providersList[1].selected).toBe(false)
        })
    })

    describe('hideFilter', () => {
        it('should emit filterToggle with correct parameters', () => {
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

        it('should add provider when checked', () => {
            const mockEvent = { checked: true }
            const mockItem = { name: 'Provider 1' }

            component.checkedProviders(mockEvent, mockItem)

            expect(mockItem.checked).toBe(true)
            expect(component.providersList[0].selected).toBe(true)
            expect(component.filterObj.providers).toContain('Provider 1')
        })

        it('should remove provider when unchecked', () => {
            component.filterObj.providers = ['Provider 1']
            component.providersList[0].selected = true
            const mockEvent = { checked: false }
            const mockItem = { name: 'Provider 1' }

            component.checkedProviders(mockEvent, mockItem)

            expect(mockItem.checked).toBe(false)
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
                        { name: 'Theme 1', children: [] },
                        { name: 'Theme 2', children: [] }
                    ]
                }
            ]
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
        })

        it('should add competency area when checked', () => {
            const mockEvent = { checked: true }
            const mockCtype = { id: 'Behavioural' }

            component.getCompetencyTheme(mockEvent, mockCtype)

            expect(mockCtype.selected).toBe(true)
            expect(component.filterObj.competencyArea).toContain('Behavioural')
            expect(component.competencyThemeList.length).toBe(2)
        })

        it('should remove competency area when unchecked', () => {
            component.filterObj.competencyArea = ['Behavioural']
            component.competencyThemeList = [
                { name: 'Theme 1', parent: 'Behavioural' }
            ]
            const mockEvent = { checked: false }
            const mockCtype = { id: 'Behavioural' }

            component.getCompetencyTheme(mockEvent, mockCtype)

            expect(mockCtype.selected).toBe(false)
            expect(component.filterObj.competencyArea).not.toContain('Behavioural')
            expect(component.competencyThemeList.length).toBe(0)
        })
    })

    describe('applyFilter', () => {
        beforeEach(() => {
            jest.spyOn(mockTpdsSvc.getFilterDataObject, 'next')
            jest.spyOn(mockTpdsSvc.filterToggle, 'next')
        })

        it('should emit filter object for content filter', () => {
            component.from = 'content'
            component.filterObj = { test: 'data' }

            component.applyFilter()

            expect(mockTpdsSvc.getFilterDataObject.next).toHaveBeenCalledWith({ test: 'data' })
            expect(mockTpdsSvc.filterToggle.next).toHaveBeenCalledWith({ from: '', status: false })
        })

        it('should emit assignee filter object for assignee filter', () => {
            component.from = 'assignee'
            component.assigneeFilterObj = { group: ['A'], designation: ['Manager'] }

            component.applyFilter()

            expect(mockTpdsSvc.getFilterDataObject.next).toHaveBeenCalledWith({
                group: ['A'],
                designation: ['Manager']
            })
        })
    })

    describe('clearFilter', () => {
        beforeEach(() => {
            jest.spyOn(component, 'resetFilter').mockImplementation()
            jest.spyOn(component, 'resetAssigneeFilter').mockImplementation()
        })

        it('should clear content filter', () => {
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

        it('should clear assignee filter', () => {
            component.from = 'assignee'

            component.clearFilter()

            expect(component.assigneeFilterObj).toEqual({ group: [], designation: [] })
            expect(component.resetAssigneeFilter).toHaveBeenCalled()
        })
    })

    describe('getDesignation', () => {
        it('should fetch designations successfully', () => {
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

            expect(mockTrainingPlanService.getDesignations).toHaveBeenCalled()
            expect(component.designationList).toEqual([
                { name: 'Manager' },
                { name: 'Developer' }
            ])
        })
    })

    describe('manageSelectedGroup', () => {
        beforeEach(() => {
            component.assigneeFilterObj = { group: [], designation: [] }
            component.groupList = [
                { name: 'Group A', selected: false },
                { name: 'Group B', selected: false }
            ]
        })

        it('should add group when checked', () => {
            const mockEvent = { checked: true }
            const mockGroup = { name: 'Group A' }

            component.manageSelectedGroup(mockEvent, mockGroup)

            expect(mockGroup.selected).toBe(true)
            expect(component.groupList[0].selected).toBe(true)
            expect(component.assigneeFilterObj.group).toContain('Group A')
        })

        it('should remove group when unchecked', () => {
            component.assigneeFilterObj.group = ['Group A']
            component.groupList[0].selected = true
            const mockEvent = { checked: false }
            const mockGroup = { name: 'Group A', selected: true }

            component.manageSelectedGroup(mockEvent, mockGroup)

            expect(mockGroup.selected).toBe(false)
            expect(component.groupList[0].selected).toBe(false)
            expect(component.assigneeFilterObj.group).not.toContain('Group A')
        })
    })

    describe('manageSelectedDesignation', () => {
        beforeEach(() => {
            component.assigneeFilterObj = { group: [], designation: [] }
            component.designationList = [
                { name: 'Manager', selected: false },
                { name: 'Developer', selected: false }
            ]
        })

        it('should add designation when checked', () => {
            const mockEvent = { checked: true }
            const mockDesignation = { name: 'Manager' }

            component.manageSelectedDesignation(mockEvent, mockDesignation)

            expect(component.designationList[0].selected).toBe(true)
            expect(component.assigneeFilterObj.designation).toContain('Manager')
        })

        it('should remove designation when unchecked', () => {
            component.assigneeFilterObj.designation = ['Manager']
            component.designationList[0].selected = true
            const mockEvent = { checked: false }
            const mockDesignation = { name: 'Manager' }

            component.manageSelectedDesignation(mockEvent, mockDesignation)

            expect(component.designationList[0].selected).toBe(false)
            expect(component.assigneeFilterObj.designation).not.toContain('Manager')
        })
    })

    describe('resetFilter', () => {
        it('should reset all filter selections', () => {
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
        it('should reset assignee filter selections', () => {
            component.groupList = [{ selected: true }]
            component.designationList = [{ selected: true }]

            component.resetAssigneeFilter()

            expect(component.groupList[0].selected).toBe(false)
            expect(component.designationList[0].selected).toBe(false)
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

        it('should add competency sub theme when checked', () => {
            const mockEvent = { checked: true }
            const mockCstype = { name: 'Theme 1' }

            component.getCompetencySubTheme(mockEvent, mockCstype)

            expect(component.competencyThemeList[0].selected).toBe(true)
            expect(component.filterObj.competencyTheme).toContain('Theme 1')
            expect(component.competencySubThemeList.length).toBe(2)
        })

        it('should remove competency sub theme when unchecked', () => {
            component.filterObj.competencyTheme = ['Theme 1']
            component.competencySubThemeList = [
                { name: 'SubTheme 1', parent: 'Theme 1' }
            ]
            const mockEvent = { checked: false }
            const mockCstype = { name: 'Theme 1' }

            component.getCompetencySubTheme(mockEvent, mockCstype)

            expect(component.competencyThemeList[0].selected).toBe(false)
            expect(component.filterObj.competencyTheme).not.toContain('Theme 1')
            expect(component.competencySubThemeList.length).toBe(0)
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
                { name: 'SubTheme 1', selected: false },
                { name: 'SubTheme 2', selected: false }
            ]
            component.filterObj = {
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: []
            }
        })

        it('should add competency sub theme when checked', () => {
            const mockEvent = { checked: true }
            const mockCsttype = { name: 'SubTheme 1' }

            component.manageCompetencySubTheme(mockEvent, mockCsttype)

            expect(component.competencySubThemeList[0].selected).toBe(true)
            expect(component.filterObj.competencySubTheme).toContain('SubTheme 1')
        })

        it('should remove competency sub theme when unchecked', () => {
            component.filterObj.competencySubTheme = ['SubTheme 1']
            component.competencySubThemeList[0].selected = true
            const mockEvent = { checked: false }
            const mockCsttype = { name: 'SubTheme 1' }

            component.manageCompetencySubTheme(mockEvent, mockCsttype)

            expect(component.competencySubThemeList[0].selected).toBe(false)
            expect(component.filterObj.competencySubTheme).not.toContain('SubTheme 1')
        })
    })

    describe('clearFilterWhileSearch', () => {
        it('should reset all checkboxes', () => {
            const mockCheckboxes = [
                { checked: true },
                { checked: true }
            ]
            component.checkboxes = {
                forEach: jest.fn((callback) => mockCheckboxes.forEach(callback))
            } as any

            component.clearFilterWhileSearch()

            expect(component.checkboxes.forEach).toHaveBeenCalled()
            mockCheckboxes.forEach(checkbox => {
                expect(checkbox.checked).toBe(false)
            })
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty competencyList gracefully', () => {
            component.competencyList = []
            const mockEvent = { checked: true }
            const mockCtype = { id: 'NonExistent' }

            expect(() => component.getCompetencyTheme(mockEvent, mockCtype)).not.toThrow()
        })

        it('should handle missing filter object properties', () => {
            component.filterObj = {}
            const mockEvent = { checked: true }
            const mockItem = { name: 'Provider 1' }

            expect(() => component.checkedProviders(mockEvent, mockItem)).not.toThrow()
        })

        it('should handle undefined designations response', () => {
            mockTrainingPlanService.getDesignations.mockReturnValue(of({}))

            component.getDesignation()

            expect(component.designationList).toEqual([])
        })
    })
})