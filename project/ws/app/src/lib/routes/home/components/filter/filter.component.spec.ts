import { ElementRef, QueryList } from '@angular/core'
import { FilterComponent } from './filter.component'
import { UntypedFormControl } from '@angular/forms'
import { of, Subject } from 'rxjs'

describe('FilterComponent', () => {
    let component: FilterComponent
    let mockChangeDetectorRef: any
    let mockTrainingPlanService: any
    let mockUsersService: any

    beforeEach(() => {
        // Create mocks for the dependencies
        mockChangeDetectorRef = {
            detectChanges: jest.fn()
        }

        mockTrainingPlanService = {
            getDesignations: jest.fn().mockReturnValue(of({
                result: {
                    response: {
                        content: [
                            { name: 'Designation 1' },
                            { name: 'Designation 2' }
                        ]
                    }
                }
            }))
        }

        mockUsersService = {
            filterToggle: new Subject(),
            clearFilter: new Subject(),
            getFilterDataObject: new Subject(),
            trainingPlanAssigneeData: { category: 'Custom Users' }
        }

        // Create the component
        component = new FilterComponent(
            mockChangeDetectorRef,
            mockTrainingPlanService,
            mockUsersService
        )

        // Initialize component properties
        component.designationList = []
        component.providersList = []
        component.groupList = []
        component.rolesList = []
        component.tagsList = []
        component.competencyList = []
        component.competencyThemeList = []
        component.competencySubThemeList = []
        component.filterObj = { competencyArea: [], competencyTheme: [], competencySubTheme: [], providers: [] }
        component.assigneeFilterObj = { group: [], designation: [], roles: [], tags: [] }
        component.searchThemeControl = new UntypedFormControl()
        component.searchSubThemeControl = new UntypedFormControl()
        component.searchProviderControl = new UntypedFormControl()
        component.checkboxes = new QueryList<ElementRef>()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should set up subscriptions to filterToggle and clearFilter', () => {
            const filterToggleSpy = jest.spyOn(mockUsersService.filterToggle, 'subscribe')
            const clearFilterSpy = jest.spyOn(mockUsersService.clearFilter, 'subscribe')
            const resetFilterSpy = jest.spyOn(component, 'resetFilter')

            component.ngOnInit()

            expect(filterToggleSpy).toHaveBeenCalled()
            expect(clearFilterSpy).toHaveBeenCalled()
            expect(resetFilterSpy).toHaveBeenCalled()
        })

        it('should not subscribe if filterToggle is not available', () => {
            mockUsersService.filterToggle = null
            mockUsersService.clearFilter = null
            const resetFilterSpy = jest.spyOn(component, 'resetFilter')

            component.ngOnInit()

            expect(resetFilterSpy).toHaveBeenCalled()
        })

        it('should process filterToggle data when received', () => {
            const setDataSpy = jest.spyOn(component, 'setData')
            component.ngOnInit()

            mockUsersService.filterToggle.next({
                status: true,
                data: [{ name: 'test', values: [] }]
            })

            expect(setDataSpy).toHaveBeenCalled()
        })

        it('should clear filter when clearFilter is triggered', () => {
            const clearFilterSpy = jest.spyOn(component, 'clearFilter')
            component.ngOnInit()

            mockUsersService.clearFilter.next({
                status: true,
                from: 'content'
            })

            expect(clearFilterSpy).toHaveBeenCalled()
            expect(component.from).toBe('content')
        })
    })

    describe('setData', () => {
        it('should process and set filter data from filterFacetsData', () => {
            const getFilteredGroupListSpy = jest.spyOn(component, 'getFilteredGroupList')
            const getFilteredDesignationListSpy = jest.spyOn(component, 'getFilteredDesignationList')
            const getFilteredTagsListSpy = jest.spyOn(component, 'getFilteredTagsList')

            component.filterFacetsData = [
                {
                    name: 'profileDetails.professionalDetails.group',
                    values: [{ name: 'Group 1' }]
                },
                {
                    name: 'profileDetails.professionalDetails.designation',
                    values: [{ name: 'Designation 1' }]
                },
                {
                    name: 'profileDetails.additionalDetails.tag',
                    values: [{ name: 'Tag 1' }]
                }
            ]

            component.setData()

            expect(component.groupList).toEqual([{ name: 'Group 1' }])
            expect(component.designationList).toEqual([{ name: 'Designation 1' }])
            expect(component.tagsList).toEqual([{ name: 'Tag 1' }])
            expect(getFilteredGroupListSpy).toHaveBeenCalled()
            expect(getFilteredDesignationListSpy).toHaveBeenCalled()
            expect(getFilteredTagsListSpy).toHaveBeenCalled()
        })

        it('should not process empty values', () => {
            component.filterFacetsData = [
                {
                    name: 'profileDetails.professionalDetails.group',
                    values: []
                }
            ]

            component.setData()

            expect(component.groupList).toEqual([])
        })
    })

    describe('search methods', () => {
        it('should set search key and filter list for groups', () => {
            const getFilteredGroupListSpy = jest.spyOn(component, 'getFilteredGroupList')

            component.searchGroup('Test')

            expect(component.groupSearchKey).toBe('Test')
            expect(getFilteredGroupListSpy).toHaveBeenCalled()
        })

        it('should set search key and filter list for designations', () => {
            const getFilteredDesignationListSpy = jest.spyOn(component, 'getFilteredDesignationList')

            component.searchDesignation('Test')

            expect(component.designationSearchKey).toBe('Test')
            expect(getFilteredDesignationListSpy).toHaveBeenCalled()
        })

        it('should set search key and filter list for roles', () => {
            const getFilteredRolesListSpy = jest.spyOn(component, 'getFilteredRolesList')

            component.searchRoles('Test')

            expect(component.rolesSearchKey).toBe('Test')
            expect(getFilteredRolesListSpy).toHaveBeenCalled()
        })

        it('should set search key and filter list for tags', () => {
            const getFilteredTagsListSpy = jest.spyOn(component, 'getFilteredTagsList')

            component.searchTags('Test')

            expect(component.tagsSearchKey).toBe('Test')
            expect(getFilteredTagsListSpy).toHaveBeenCalled()
        })
    })

    describe('getFilteredGroupList', () => {
        it('should filter group list based on search key', () => {
            component.groupList = [
                { name: 'GroupA' },
                { name: 'GroupB' },
                { name: 'TestGroup' }
            ]
            component.groupSearchKey = 'test'
            component.assigneeFilterObj = { group: ['TestGroup'], designation: [], roles: [], tags: [] }

            component.getFilteredGroupList()

            expect(component.filteredGroupList.length).toBe(1)
            expect(component.filteredGroupList[0].name).toBe('TestGroup')
            expect(component.filteredGroupList[0].selected).toBe(true)
        })

        it('should return all groups when search key is empty', () => {
            component.groupList = [
                { name: 'GroupA' },
                { name: 'GroupB' },
                { name: 'TestGroup' }
            ]
            component.groupSearchKey = ''

            component.getFilteredGroupList()

            expect(component.filteredGroupList.length).toBe(3)
        })

        it('should not mark groups as selected when not in assigneeFilterObj', () => {
            component.groupList = [{ name: 'GroupA' }]
            component.assigneeFilterObj = { group: [], designation: [], roles: [], tags: [] }

            component.getFilteredGroupList()

            expect(component.filteredGroupList[0].selected).toBe(false)
        })
    })

    describe('getFilteredDesignationList', () => {
        it('should filter designation list based on search key', () => {
            component.designationList = [
                { name: 'DesignationA' },
                { name: 'DesignationB' },
                { name: 'TestDesignation' }
            ]
            component.designationSearchKey = 'test'
            component.assigneeFilterObj = { group: [], designation: ['TestDesignation'], roles: [], tags: [] }

            component.getFilteredDesignationList()

            expect(component.filteredDesignationList.length).toBe(1)
            expect(component.filteredDesignationList[0].name).toBe('TestDesignation')
            expect(component.filteredDesignationList[0].selected).toBe(true)
        })
    })

    describe('ngAfterContentChecked', () => {
        it('should call detectChanges', () => {
            component.ngAfterContentChecked()
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })
    })

    describe('hideFilter', () => {
        it('should emit toggleFilter event with filter info', () => {
            const toggleFilterSpy = jest.spyOn(component.toggleFilter, 'emit')
            component.hideFilter('testFilter')

            expect(toggleFilterSpy).toHaveBeenCalledWith({
                filter: 'testFilter',
                filtersList: component.assigneeFilterObj
            })
            expect(mockUsersService.filterToggle.observers.length).toBeGreaterThan(0)
        })
    })

    describe('checkedProviders', () => {
        it('should add provider to filterObj when checked', () => {
            const item = { name: 'Provider1' }
            component.providersList = [{ name: 'Provider1' }, { name: 'Provider2' }]

            component.checkedProviders({ checked: true }, item)

            expect(component.filterObj.providers).toContain('Provider1')
            expect(component.providersList[0].selected).toBe(true)
        })

        it('should remove provider from filterObj when unchecked', () => {
            const item = { name: 'Provider1' }
            component.providersList = [{ name: 'Provider1', selected: true }, { name: 'Provider2' }]
            component.filterObj.providers = ['Provider1', 'Provider2']

            component.checkedProviders({ checked: false }, item)

            expect(component.filterObj.providers).not.toContain('Provider1')
            expect(component.providersList[0].selected).toBe(false)
        })
    })

    describe('applyFilter', () => {
        it('should emit content filter data when from is content', () => {
            component.from = 'content'
            component.filterObj = { competencyArea: ['test'], competencyTheme: [], competencySubTheme: [], providers: [] }

            component.applyFilter()

            expect(mockUsersService.getFilterDataObject.observers.length).toBeGreaterThan(0)
        })

        it('should emit assignee filter data when from is not content', () => {
            component.from = 'assignee'
            component.assigneeFilterObj = { group: ['test'], designation: [], roles: [], tags: [] }

            component.applyFilter()

            expect(mockUsersService.getFilterDataObject.observers.length).toBeGreaterThan(0)
        })
    })

    describe('clearFilter', () => {
        it('should reset content filter data when from is content', () => {
            component.from = 'content'
            component.filterObj = {
                competencyArea: ['area1'],
                competencyTheme: ['theme1'],
                competencySubTheme: ['subtheme1'],
                providers: ['provider1']
            }
            component.resetFilter = jest.fn()

            component.clearFilter()

            expect(component.filterObj).toEqual({
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: [],
                providers: []
            })
            expect(component.resetFilter).toHaveBeenCalled()
        })

        it('should reset assignee filter data when from is not content', () => {
            component.from = 'assignee'
            component.assigneeFilterObj = {
                group: ['group1'],
                designation: ['designation1'],
                roles: ['role1'],
                tags: ['tag1']
            }

            component.clearFilter()

            expect(component.assigneeFilterObj).toEqual({
                group: [],
                designation: [],
                roles: [],
                tags: []
            })
        })
    })

    describe('getCompetencyTheme', () => {
        it('should add competency area to filterObj when checked', () => {
            const ctype = { id: 'area1' }
            component.competencyList = [{
                name: 'area1',
                children: [{ name: 'theme1' }]
            }]

            component.getCompetencyTheme({ checked: true }, ctype)

            expect(component.filterObj.competencyArea).toContain('area1')
            expect(component.competencyList[0].selected).toBe(true)
            expect(component.competencyThemeList).toContainEqual({ name: 'theme1', parent: 'area1' })
        })

        it('should remove competency area and related themes/subthemes when unchecked', () => {
            const ctype = { id: 'area1' }
            component.competencyList = [{ name: 'area1', selected: true }]
            component.filterObj.competencyArea = ['area1']
            component.competencyThemeList = [{ name: 'theme1', parent: 'area1', selected: true }]
            component.competencySubThemeList = [{ name: 'subtheme1', parentType: 'area1', selected: true }]
            component.filterObj.competencyTheme = ['theme1']
            component.filterObj.competencySubTheme = ['subtheme1']

            component.getCompetencyTheme({ checked: false }, ctype)

            expect(component.filterObj.competencyArea).not.toContain('area1')
            expect(component.competencyThemeList).toEqual([])
            expect(component.competencySubThemeList).toEqual([])
            expect(component.filterObj.competencyTheme).not.toContain('theme1')
            expect(component.filterObj.competencySubTheme).not.toContain('subtheme1')
        })
    })
})