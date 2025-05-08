import { FilterComponent } from './filter.component'
import { TrainingPlanService } from './../../services/traininig-plan.service'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { InitService } from '../../../../../../../../../src/app/services/init.service'
import { of, Subject } from 'rxjs'
import { UntypedFormControl } from '@angular/forms'
import { ElementRef, QueryList } from '@angular/core'

describe('FilterComponent', () => {
    let component: FilterComponent
    let trainingPlanServiceMock: jest.Mocked<TrainingPlanService>
    let tpdsServiceMock: jest.Mocked<TrainingPlanDataSharingService>
    let initServiceMock: jest.Mocked<InitService>
    let cdRefMock: any

    // Mock subjects for TPDS service
    const filterToggleSubject = new Subject<any>()
    const clearFilterSubject = new Subject<any>()
    const getFilterDataObjectSubject = new Subject<any>()

    beforeEach(() => {
        // Create mocks
        trainingPlanServiceMock = {
            getFilterEntity: jest.fn(),
            getProviders: jest.fn(),
            getDesignations: jest.fn()
        } as unknown as jest.Mocked<TrainingPlanService>

        tpdsServiceMock = {
            filterToggle: filterToggleSubject,
            clearFilter: clearFilterSubject,
            getFilterDataObject: getFilterDataObjectSubject
        } as unknown as jest.Mocked<TrainingPlanDataSharingService>

        initServiceMock = {
            configSvc: {
                competency: {
                    v1: {
                        vCompetencyArea: 'competencyArea',
                        vCompetencyTheme: 'competencyTheme',
                        vCompetencySubTheme: 'competencySubTheme'
                    }
                }
            }
        } as unknown as jest.Mocked<InitService>

        cdRefMock = {
            detectChanges: jest.fn()
        };

        // Set up environment
        (global as any).environment = {
            compentencyVersionKey: 'v1'
        }

        // Create component instance
        component = new FilterComponent(
            cdRefMock,
            trainingPlanServiceMock,
            tpdsServiceMock,
            initServiceMock
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('ngOnInit', () => {
        it('should initialize filter objects and subscribe to observable services', () => {
            // Spy on methods that might be called during initialization
            jest.spyOn(component, 'resetFilter')

            // Act
            component.ngOnInit()

            // Assert
            expect(component.filterObj).toEqual({
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: [],
                providers: []
            })
            expect(component.assigneeFilterObj).toEqual({ group: [], designation: [] })
            expect(component.resetFilter).toHaveBeenCalled()
        })

        it('should call getFilterEntity and getProviders when filterToggle emits with from=content', () => {
            // Arrange
            jest.spyOn(component, 'getFilterEntity')
            jest.spyOn(component, 'getProviders')
            component.ngOnInit()

            // Act
            filterToggleSubject.next({ status: true, from: 'content' })

            // Assert
            expect(component.getFilterEntity).toHaveBeenCalled()
            expect(component.getProviders).toHaveBeenCalled()
        })

        it('should call getDesignation when filterToggle emits with from!=content and designationList is empty', () => {
            // Arrange
            jest.spyOn(component, 'getDesignation')
            component.ngOnInit()
            component.designationList = []

            // Act
            filterToggleSubject.next({ status: true, from: 'assignee' })

            // Assert
            expect(component.getDesignation).toHaveBeenCalled()
        })

        it('should update designationList selected state when filterToggle emits with from!=content and list exists', () => {
            // Arrange
            component.ngOnInit()
            component.designationList = [
                { id: 1, name: 'Manager' },
                { id: 2, name: 'Developer' }
            ]
            component.assigneeFilterObj.designation = ['Manager']

            // Act
            filterToggleSubject.next({ status: true, from: 'assignee' })

            // Assert
            expect(component.designationList[0].selected).toBe(true)
            expect(component.designationList[1].selected).toBe(false)
        })

        it('should call clearFilter when clearFilter subject emits with status=true', () => {
            // Arrange
            jest.spyOn(component, 'clearFilter')
            component.ngOnInit()

            // Act
            clearFilterSubject.next({ status: true, from: 'content' })

            // Assert
            expect(component.from).toBe('content')
            expect(component.clearFilter).toHaveBeenCalled()
        })
    })

    describe('ngAfterContentChecked', () => {
        it('should call detectChanges on changeDetectorRef', () => {
            // Act
            component.ngAfterContentChecked()

            // Assert
            expect(cdRefMock.detectChanges).toHaveBeenCalled()
        })
    })

    describe('getFilterEntity', () => {
        it('should call trainingPlanService and update competencyList', () => {
            // Arrange
            const mockResponse = [
                { id: 1, name: 'Competency1' },
                { id: 2, name: 'Competency2' }
            ]
            trainingPlanServiceMock.getFilterEntity.mockReturnValue(of(mockResponse))

            // Act
            component.getFilterEntity()

            // Assert
            expect(trainingPlanServiceMock.getFilterEntity).toHaveBeenCalledWith({
                search: { type: 'Competency Area' },
                filter: { isDetail: true }
            })
            expect(component.competencyList).toEqual(mockResponse)
        })
    })

    describe('getProviders', () => {
        it('should call trainingPlanService and update providersList', () => {
            // Arrange
            const mockProviders = [
                { id: 1, name: 'Provider1' },
                { id: 2, name: 'Provider2' }
            ]
            trainingPlanServiceMock.getProviders.mockReturnValue(of(mockProviders))
            component.ngOnInit()
            component.filterObj.providers = ['Provider1']

            // Act
            component.getProviders()

            // Assert
            expect(trainingPlanServiceMock.getProviders).toHaveBeenCalled()
            expect(component.providersList).toEqual([
                { id: 1, name: 'Provider1', selected: true },
                { id: 2, name: 'Provider2', selected: false }
            ])
        })
    })

    describe('hideFilter', () => {
        it('should emit filterToggle event with status=false', () => {
            // Arrange
            jest.spyOn(tpdsServiceMock.filterToggle, 'next')

            // Act
            component.hideFilter()

            // Assert
            expect(tpdsServiceMock.filterToggle.next).toHaveBeenCalledWith({ from: '', status: false })
        })
    })

    describe('checkedProviders', () => {
        beforeEach(() => {
            component.ngOnInit()
            component.providersList = [
                { id: 1, name: 'Provider1' },
                { id: 2, name: 'Provider2' }
            ]
        })

        it('should add provider to filterObj and mark as selected when checked', () => {
            // Arrange
            const provider = { id: 1, name: 'Provider1' }
            const event = { checked: true }

            // Act
            component.checkedProviders(event, provider)

            // Assert
            expect(component.providersList[0].selected).toBe(true)
            expect(component.filterObj.providers).toContain('Provider1')
        })

        it('should remove provider from filterObj and mark as not selected when unchecked', () => {
            // Arrange
            const provider = { id: 1, name: 'Provider1' }
            component.filterObj.providers.push('Provider1')
            component.providersList[0].selected = true
            const event = { checked: false }

            // Act
            component.checkedProviders(event, provider)

            // Assert
            expect(component.providersList[0].selected).toBe(false)
            expect(component.filterObj.providers).not.toContain('Provider1')
        })
    })

    describe('getCompetencyTheme', () => {
        beforeEach(() => {
            component.ngOnInit()
            component.competencyList = [
                {
                    name: 'Behavioural',
                    selected: false,
                    children: [
                        { name: 'Theme1', selected: false, children: [] },
                        { name: 'Theme2', selected: false, children: [] }
                    ]
                }
            ]
            component.competencyThemeList = []
        })

        it('should add competency to filterObj and update competencyThemeList when checked', () => {
            // Arrange
            const competencyType = { id: 'Behavioural', name: 'Behavioural', selected: false }
            const event = { checked: true }

            // Act
            component.getCompetencyTheme(event, competencyType)

            // Assert
            expect(competencyType.selected).toBe(true)
            expect(component.competencyList[0].selected).toBe(true)
            expect(component.filterObj.competencyArea).toContain('Behavioural')
            expect(component.competencyThemeList.length).toBe(2)
            expect(component.competencyThemeList[0].parent).toBe('Behavioural')
        })

        it('should remove competency from filterObj and update lists when unchecked', () => {
            // Arrange
            const competencyType = { id: 'Behavioural', name: 'Behavioural', selected: true }
            component.competencyList[0].selected = true
            component.filterObj.competencyArea.push('Behavioural')
            component.competencyThemeList = [
                { name: 'Theme1', parent: 'Behavioural', selected: true },
                { name: 'Theme2', parent: 'Behavioural', selected: true }
            ]
            component.filterObj.competencyTheme = ['Theme1']
            const event = { checked: false }

            // Act
            component.getCompetencyTheme(event, competencyType)

            // Assert
            expect(competencyType.selected).toBe(false)
            expect(component.competencyList[0].selected).toBe(false)
            expect(component.filterObj.competencyArea).not.toContain('Behavioural')
            expect(component.competencyThemeList.length).toBe(0)
            expect(component.filterObj.competencyTheme).not.toContain('Theme1')
        })
    })

    describe('getCompetencySubTheme', () => {
        beforeEach(() => {
            component.ngOnInit()
            component.competencyThemeList = [
                {
                    name: 'Theme1',
                    parent: 'Behavioural',
                    selected: false,
                    children: [
                        { name: 'SubTheme1', selected: false },
                        { name: 'SubTheme2', selected: false }
                    ]
                }
            ]
            component.competencySubThemeList = []
        })

        it('should add theme to filterObj and update competencySubThemeList when checked', () => {
            // Arrange
            const theme = { name: 'Theme1', parent: 'Behavioural' }
            const event = { checked: true }

            // Act
            component.getCompetencySubTheme(event, theme)

            // Assert
            expect(component.competencyThemeList[0].selected).toBe(true)
            expect(component.filterObj.competencyTheme).toContain('Theme1')
            expect(component.competencySubThemeList.length).toBe(2)
            expect(component.competencySubThemeList[0].parent).toBe('Theme1')
            expect(component.competencySubThemeList[0].parentType).toBe('Behavioural')
        })

        it('should remove theme from filterObj and update lists when unchecked', () => {
            // Arrange
            const theme = { name: 'Theme1', parent: 'Behavioural' }
            component.competencyThemeList[0].selected = true
            component.filterObj.competencyTheme.push('Theme1')
            component.competencySubThemeList = [
                { name: 'SubTheme1', parent: 'Theme1', selected: true },
                { name: 'SubTheme2', parent: 'Theme1', selected: true }
            ]
            const event = { checked: false }

            // Act
            component.getCompetencySubTheme(event, theme)

            // Assert
            expect(component.competencyThemeList[0].selected).toBe(false)
            expect(component.filterObj.competencyTheme).not.toContain('Theme1')
            expect(component.competencySubThemeList.length).toBe(0)
        })
    })

    describe('manageCompetencySubTheme', () => {
        beforeEach(() => {
            component.ngOnInit()
            component.competencySubThemeList = [
                { name: 'SubTheme1', parent: 'Theme1', selected: false },
                { name: 'SubTheme2', parent: 'Theme1', selected: false }
            ]
        })

        it('should add subtheme to filterObj and mark as selected when checked', () => {
            // Arrange
            const subtheme = { name: 'SubTheme1', parent: 'Theme1' }
            const event = { checked: true }

            // Act
            component.manageCompetencySubTheme(event, subtheme)

            // Assert
            expect(component.competencySubThemeList[0].selected).toBe(true)
            expect(component.filterObj.competencySubTheme).toContain('SubTheme1')
        })

        it('should remove subtheme from filterObj and mark as not selected when unchecked', () => {
            // Arrange
            const subtheme = { name: 'SubTheme1', parent: 'Theme1' }
            component.competencySubThemeList[0].selected = true
            component.filterObj.competencySubTheme.push('SubTheme1')
            const event = { checked: false }

            // Act
            component.manageCompetencySubTheme(event, subtheme)

            // Assert
            expect(component.competencySubThemeList[0].selected).toBe(false)
            expect(component.filterObj.competencySubTheme).not.toContain('SubTheme1')
        })
    })

    describe('applyFilter', () => {
        it('should emit content filter data when from=content', () => {
            // Arrange
            component.from = 'content'
            jest.spyOn(tpdsServiceMock.getFilterDataObject, 'next')
            jest.spyOn(tpdsServiceMock.filterToggle, 'next')

            // Act
            component.applyFilter()

            // Assert
            expect(tpdsServiceMock.getFilterDataObject.next).toHaveBeenCalledWith(component.filterObj)
            expect(tpdsServiceMock.filterToggle.next).toHaveBeenCalledWith({ from: '', status: false })
        })

        it('should emit assignee filter data when from!=content', () => {
            // Arrange
            component.from = 'assignee'
            jest.spyOn(tpdsServiceMock.getFilterDataObject, 'next')

            // Act
            component.applyFilter()

            // Assert
            expect(tpdsServiceMock.getFilterDataObject.next).toHaveBeenCalledWith(component.assigneeFilterObj)
        })
    })

    describe('clearFilter', () => {
        it('should reset content filters when from=content', () => {
            // Arrange
            component.ngOnInit()
            component.from = 'content'
            jest.spyOn(component, 'resetFilter')
            component.filterObj.competencyArea = ['Area1']
            component.filterObj.competencyTheme = ['Theme1']
            component.competencyThemeList = [{ name: 'Theme1' }]
            component.searchThemeControl = new UntypedFormControl('test')

            // Mock checkboxes
            component.checkboxes = new QueryList<ElementRef>()
            component.checkboxes.forEach = jest.fn() as any

            // Act
            component.clearFilter()

            // Assert
            expect(component.filterObj).toEqual({
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: [],
                providers: []
            })
            expect(component.competencyThemeList).toEqual([])
            expect(component.searchThemeControl.value).toBeNull()
            expect(component.resetFilter).toHaveBeenCalled()
            expect(component.checkboxes.forEach).toHaveBeenCalled()
        })

        it('should reset assignee filters when from!=content', () => {
            // Arrange
            component.ngOnInit()
            component.from = 'assignee'
            jest.spyOn(component, 'resetAssigneeFilter')
            component.assigneeFilterObj.group = ['Group A']
            component.assigneeFilterObj.designation = ['Manager']

            // Mock checkboxes
            component.checkboxes = new QueryList<ElementRef>()
            component.checkboxes.forEach = jest.fn() as any

            // Act
            component.clearFilter()

            // Assert
            expect(component.assigneeFilterObj).toEqual({ group: [], designation: [] })
            expect(component.resetAssigneeFilter).toHaveBeenCalled()
            expect(component.checkboxes.forEach).toHaveBeenCalled()
        })
    })

    describe('clearFilterWhileSearch', () => {
        it('should reset all checkboxes', () => {
            // Arrange
            component.checkboxes = new QueryList<ElementRef>()
            component.checkboxes.forEach = jest.fn() as any

            // Act
            component.clearFilterWhileSearch()

            // Assert
            expect(component.checkboxes.forEach).toHaveBeenCalled()
        })
    })

    describe('getDesignation', () => {
        it('should call training plan service and update designationList', () => {
            // Arrange
            const mockResponse = {
                result: {
                    response: {
                        content: [
                            { id: 1, name: 'Manager' },
                            { id: 2, name: 'Developer' }
                        ]
                    }
                }
            }
            trainingPlanServiceMock.getDesignations.mockReturnValue(of(mockResponse))

            // Act
            component.getDesignation()

            // Assert
            expect(trainingPlanServiceMock.getDesignations).toHaveBeenCalled()
            expect(component.designationList).toEqual(mockResponse.result.response.content)
        })
    })

    describe('manageSelectedGroup', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should add group to filter and mark as selected when checked', () => {
            // Arrange
            const group = { id: 'groupA', name: 'Group A' }
            const event = { checked: true }

            // Act
            component.manageSelectedGroup(event, group)

            // Assert
            expect(component.assigneeFilterObj.group).toContain('Group A')
            const updatedGroup = component.groupList.find((g: { name: string }) => g.name === 'Group A')
            expect(updatedGroup?.selected).toBe(true)
        })

        it('should remove group from filter and mark as not selected when unchecked', () => {
            // Arrange
            const group = { id: 'groupA', name: 'Group A', selected: true }
            component.assigneeFilterObj.group = ['Group A']
            component.groupList[0].selected = true
            const event = { checked: false }

            // Act
            component.manageSelectedGroup(event, group)

            // Assert
            expect(component.assigneeFilterObj.group).not.toContain('Group A')
            const updatedGroup = component.groupList.find((g: { name: string }) => g.name === 'Group A')
            expect(updatedGroup?.selected).toBe(false)
        })
    })

    describe('manageSelectedDesignation', () => {
        beforeEach(() => {
            component.ngOnInit()
            component.designationList = [
                { id: 1, name: 'Manager' },
                { id: 2, name: 'Developer' }
            ]
        })

        it('should add designation to filter and mark as selected when checked', () => {
            // Arrange
            const designation = { id: 1, name: 'Manager' }
            const event = { checked: true }

            // Act
            component.manageSelectedDesignation(event, designation)

            // Assert
            expect(component.assigneeFilterObj.designation).toContain('Manager')
            expect(component.designationList[0].selected).toBe(true)
        })

        it('should remove designation from filter and mark as not selected when unchecked', () => {
            // Arrange
            const designation = { id: 1, name: 'Manager' }
            component.assigneeFilterObj.designation = ['Manager']
            component.designationList[0].selected = true
            const event = { checked: false }

            // Act
            component.manageSelectedDesignation(event, designation)

            // Assert
            expect(component.assigneeFilterObj.designation).not.toContain('Manager')
            expect(component.designationList[0].selected).toBe(false)
        })
    })

    describe('resetFilter', () => {
        it('should reset selected state for all content filter lists', () => {
            // Arrange
            component.competencyThemeList = [{ name: 'theme1', selected: true }]
            component.competencySubThemeList = [{ name: 'subtheme1', selected: true }]
            component.providersList = [{ name: 'provider1', selected: true }]

            // Act
            component.resetFilter()

            // Assert
            expect(component.competencyThemeList[0].selected).toBe(false)
            expect(component.competencySubThemeList[0].selected).toBe(false)
            expect(component.providersList[0].selected).toBe(false)
        })
    })

    describe('resetAssigneeFilter', () => {
        it('should reset selected state for all assignee filter lists', () => {
            // Arrange
            component.groupList = [{ id: 'group1', name: 'Group 1', selected: true }]
            component.designationList = [{ id: 1, name: 'Manager', selected: true }]

            // Act
            component.resetAssigneeFilter()

            // Assert
            expect(component.groupList[0].selected).toBe(false)
            expect(component.designationList[0].selected).toBe(false)
        })
    })
})