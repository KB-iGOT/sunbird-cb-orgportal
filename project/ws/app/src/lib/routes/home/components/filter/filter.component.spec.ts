import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ChangeDetectorRef } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { of, Subject } from 'rxjs'
import { FilterComponent } from './filter.component'
import { TrainingPlanService } from '../../../training-plan/services/traininig-plan.service'
import { UsersService } from '../../../users/services/users.service'

describe('FilterComponent', () => {
    let component: FilterComponent
    let fixture: ComponentFixture<FilterComponent>
    let mockTrainingPlanService: jest.Mocked<TrainingPlanService>
    let mockUsersService: jest.Mocked<UsersService>
    let mockChangeDetectorRef: jest.Mocked<ChangeDetectorRef>

    const mockFilterFacetsData = [
        {
            name: 'profileDetails.professionalDetails.group',
            values: [
                { name: 'Group 1', selected: false },
                { name: 'Group 2', selected: false }
            ]
        },
        {
            name: 'profileDetails.professionalDetails.designation',
            values: [
                { name: 'Manager', selected: false },
                { name: 'Developer', selected: false }
            ]
        },
        {
            name: 'profileDetails.additionalDetails.tag',
            values: [
                { name: 'Tag 1', selected: false },
                { name: 'Tag 2', selected: false }
            ]
        }
    ]

    beforeEach(async () => {
        const filterToggleSubject = new Subject()
        const clearFilterSubject = new Subject()
        const getFilterDataObjectSubject = new Subject()

        mockTrainingPlanService = {
            getDesignations: jest.fn()
        } as any

        mockUsersService = {
            filterToggle: filterToggleSubject,
            clearFilter: clearFilterSubject,
            getFilterDataObject: getFilterDataObjectSubject
        } as any

        mockChangeDetectorRef = {
            detectChanges: jest.fn()
        } as any

        await TestBed.configureTestingModule({
            declarations: [FilterComponent],
            providers: [
                { provide: TrainingPlanService, useValue: mockTrainingPlanService },
                { provide: UsersService, useValue: mockUsersService },
                { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(FilterComponent)
        component = fixture.componentInstance
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.designationList).toEqual([])
            expect(component.providersList).toEqual([])
            expect(component.selectedProviders).toEqual([])
            expect(component.groupList).toEqual([])
            expect(component.rolesList).toEqual([])
            expect(component.tagsList).toEqual([])
            expect(component.competencyList).toEqual([])
            expect(component.competencyThemeList).toEqual([])
            expect(component.competencySubThemeList).toEqual([])
            expect(component.filterObj).toEqual({
                competencyArea: [],
                competencyTheme: [],
                competencySubTheme: [],
                providers: []
            })
            expect(component.assigneeFilterObj).toEqual({
                group: [],
                designation: [],
                roles: [],
                tags: []
            })
        })

        it('should initialize form controls', () => {
            expect(component.searchThemeControl).toBeInstanceOf(UntypedFormControl)
            expect(component.searchSubThemeControl).toBeInstanceOf(UntypedFormControl)
            expect(component.searchProviderControl).toBeInstanceOf(UntypedFormControl)
        })
    })

    describe('ngOnInit', () => {
        it('should subscribe to filterToggle', () => {
            const spy = jest.spyOn(component, 'setData')
            component.ngOnInit()

            mockUsersService.filterToggle.next({
                status: true,
                data: mockFilterFacetsData
            })

            expect(spy).toHaveBeenCalled()
            expect(component.filterFacetsData).toEqual(mockFilterFacetsData)
        })

        it('should subscribe to clearFilter', () => {
            const spy = jest.spyOn(component, 'clearFilter')
            component.ngOnInit()

            mockUsersService.clearFilter.next({
                status: true,
                from: 'content'
            })

            expect(spy).toHaveBeenCalled()
            expect(component.from).toBe('content')
        })

        it('should call resetFilter', () => {
            const spy = jest.spyOn(component, 'resetFilter')
            component.ngOnInit()
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('setData', () => {
        beforeEach(() => {
            component.filterFacetsData = mockFilterFacetsData
            jest.spyOn(component, 'getFilteredGroupList')
            jest.spyOn(component, 'getFilteredDesignationList')
            jest.spyOn(component, 'getFilteredTagsList')
        })

        it('should set group list and call getFilteredGroupList', () => {
            component.setData()
            expect(component.groupList).toEqual(mockFilterFacetsData[0].values)
            expect(component.getFilteredGroupList).toHaveBeenCalled()
        })

        it('should set designation list and call getFilteredDesignationList', () => {
            component.setData()
            expect(component.designationList).toEqual(mockFilterFacetsData[1].values)
            expect(component.getFilteredDesignationList).toHaveBeenCalled()
        })

        it('should set tags list and call getFilteredTagsList', () => {
            component.setData()
            expect(component.tagsList).toEqual(mockFilterFacetsData[2].values)
            expect(component.getFilteredTagsList).toHaveBeenCalled()
        })
    })

    describe('Search Functions', () => {
        it('should update group search key and call getFilteredGroupList', () => {
            const spy = jest.spyOn(component, 'getFilteredGroupList')
            component.searchGroup('test')
            expect(component.groupSearchKey).toBe('test')
            expect(spy).toHaveBeenCalled()
        })

        it('should update designation search key and call getFilteredDesignationList', () => {
            const spy = jest.spyOn(component, 'getFilteredDesignationList')
            component.searchDesignation('manager')
            expect(component.designationSearchKey).toBe('manager')
            expect(spy).toHaveBeenCalled()
        })

        it('should update roles search key and call getFilteredRolesList', () => {
            const spy = jest.spyOn(component, 'getFilteredRolesList')
            component.searchRoles('admin')
            expect(component.rolesSearchKey).toBe('admin')
            expect(spy).toHaveBeenCalled()
        })

        it('should update tags search key and call getFilteredTagsList', () => {
            const spy = jest.spyOn(component, 'getFilteredTagsList')
            component.searchTags('important')
            expect(component.tagsSearchKey).toBe('important')
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('getFilteredGroupList', () => {
        beforeEach(() => {
            component.groupList = [
                { name: 'Group Alpha', selected: false },
                { name: 'Group Beta', selected: false },
                { name: 'Team Gamma', selected: false }
            ]
        })

        it('should filter groups based on search key', () => {
            component.groupSearchKey = 'Group'
            component.getFilteredGroupList()
            expect(component.filteredGroupList).toHaveLength(2)
            expect(component.filteredGroupList[0].name).toBe('Group Alpha')
            expect(component.filteredGroupList[1].name).toBe('Group Beta')
        })

        it('should mark selected groups', () => {
            component.assigneeFilterObj.group = ['Group Alpha']
            component.getFilteredGroupList()
            expect(component.filteredGroupList[0].selected).toBe(true)
            expect(component.filteredGroupList[1].selected).toBe(false)
        })

        it('should handle empty search key', () => {
            component.groupSearchKey = ''
            component.getFilteredGroupList()
            expect(component.filteredGroupList).toHaveLength(3)
        })
    })

    describe('getFilteredDesignationList', () => {
        beforeEach(() => {
            component.designationList = [
                { name: 'Manager', selected: false },
                { name: 'Senior Manager', selected: false },
                { name: 'Developer', selected: false }
            ]
        })

        it('should filter designations based on search key', () => {
            component.designationSearchKey = 'Manager'
            component.getFilteredDesignationList()
            expect(component.filteredDesignationList).toHaveLength(2)
        })

        it('should mark selected designations', () => {
            component.assigneeFilterObj.designation = ['Manager']
            component.getFilteredDesignationList()
            expect(component.filteredDesignationList[0].selected).toBe(true)
        })
    })

    describe('Selection Management', () => {
        describe('manageSelectedGroup', () => {
            const mockGroup = { name: 'Test Group', selected: false }

            beforeEach(() => {
                component.filteredGroupList = [mockGroup]
            })

            it('should add group when checked', () => {
                const event = { checked: true }
                component.manageSelectedGroup(event, mockGroup)
                expect(component.assigneeFilterObj.group).toContain('Test Group')
                expect(mockGroup.selected).toBe(true)
            })

            it('should remove group when unchecked', () => {
                component.assigneeFilterObj.group = ['Test Group']
                const event = { checked: false }
                component.manageSelectedGroup(event, mockGroup)
                expect(component.assigneeFilterObj.group).not.toContain('Test Group')
                expect(mockGroup.selected).toBe(false)
            })
        })

        describe('manageSelectedDesignation', () => {
            const mockDesignation = { name: 'Manager', selected: false }

            beforeEach(() => {
                component.filteredDesignationList = [mockDesignation]
            })

            it('should add designation when checked', () => {
                const event = { checked: true }
                component.manageSelectedDesignation(event, mockDesignation)
                expect(component.assigneeFilterObj.designation).toContain('Manager')
            })

            it('should remove designation when unchecked', () => {
                component.assigneeFilterObj.designation = ['Manager']
                const event = { checked: false }
                component.manageSelectedDesignation(event, mockDesignation)
                expect(component.assigneeFilterObj.designation).not.toContain('Manager')
            })
        })

        describe('manageSelectedTags', () => {
            const mockTag = { name: 'Important', selected: false }

            beforeEach(() => {
                component.filteredTagsList = [mockTag]
            })

            it('should add tag when checked', () => {
                const event = { checked: true }
                component.manageSelectedTags(event, mockTag)
                expect(component.assigneeFilterObj.tags).toContain('Important')
            })

            it('should remove tag when unchecked', () => {
                component.assigneeFilterObj.tags = ['Important']
                const event = { checked: false }
                component.manageSelectedTags(event, mockTag)
                expect(component.assigneeFilterObj.tags).not.toContain('Important')
            })
        })

        describe('manageSelectedRoles', () => {
            const mockRole = { name: 'Admin', selected: false }

            beforeEach(() => {
                component.filteredRolesList = [mockRole]
            })

            it('should add role when checked', () => {
                const event = { checked: true }
                component.manageSelectedRoles(event, mockRole)
                expect(component.assigneeFilterObj.roles).toContain('Admin')
            })

            it('should remove role when unchecked', () => {
                component.assigneeFilterObj.roles = ['Admin']
                const event = { checked: false }
                component.manageSelectedRoles(event, mockRole)
                expect(component.assigneeFilterObj.roles).not.toContain('Admin')
            })
        })
    })

    describe('Competency Management', () => {
        describe('getCompetencyTheme', () => {
            beforeEach(() => {
                component.competencyList = [
                    {
                        name: 'comp1',
                        selected: false,
                        children: [
                            { name: 'theme1', selected: false },
                            { name: 'theme2', selected: false }
                        ]
                    }
                ]
                component.filterObj = {
                    competencyArea: [],
                    competencyTheme: [],
                    competencySubTheme: [],
                    providers: []
                }
            })

            it('should add competency area when checked', () => {
                const event = { checked: true }
                const ctype = { id: 'comp1', selected: false }

                component.getCompetencyTheme(event, ctype)

                expect(component.filterObj.competencyArea).toContain('comp1')
                expect(ctype.selected).toBe(true)
                expect(component.competencyThemeList).toHaveLength(2)
            })

            it('should remove competency area when unchecked', () => {
                component.filterObj.competencyArea = ['comp1']
                const event = { checked: false }
                const ctype = { id: 'comp1', selected: true }

                component.getCompetencyTheme(event, ctype)

                expect(component.filterObj.competencyArea).not.toContain('comp1')
                expect(ctype.selected).toBe(false)
            })
        })

        describe('getCompetencySubTheme', () => {
            beforeEach(() => {
                component.competencyThemeList = [
                    {
                        name: 'theme1',
                        parent: 'comp1',
                        selected: false,
                        children: [
                            { name: 'subtheme1' },
                            { name: 'subtheme2' }
                        ]
                    }
                ]
                component.filterObj = {
                    competencyArea: [],
                    competencyTheme: [],
                    competencySubTheme: [],
                    providers: []
                }
            })

            it('should add competency theme when checked', () => {
                const event = { checked: true }
                const cstype = { name: 'theme1' }

                component.getCompetencySubTheme(event, cstype)

                expect(component.filterObj.competencyTheme).toContain('theme1')
                expect(component.competencySubThemeList).toHaveLength(2)
            })

            it('should remove competency theme when unchecked', () => {
                component.filterObj.competencyTheme = ['theme1']
                const event = { checked: false }
                const cstype = { name: 'theme1' }

                component.getCompetencySubTheme(event, cstype)

                expect(component.filterObj.competencyTheme).not.toContain('theme1')
            })
        })

        describe('manageCompetencySubTheme', () => {
            beforeEach(() => {
                component.competencySubThemeList = [
                    { name: 'subtheme1', selected: false }
                ]
                component.filterObj = {
                    competencyArea: [],
                    competencyTheme: [],
                    competencySubTheme: [],
                    providers: []
                }
            })

            it('should add sub theme when checked', () => {
                const event = { checked: true }
                const csttype = { name: 'subtheme1' }

                component.manageCompetencySubTheme(event, csttype)

                expect(component.filterObj.competencySubTheme).toContain('subtheme1')
            })

            it('should remove sub theme when unchecked', () => {
                component.filterObj.competencySubTheme = ['subtheme1']
                const event = { checked: false }
                const csttype = { name: 'subtheme1' }

                component.manageCompetencySubTheme(event, csttype)

                expect(component.filterObj.competencySubTheme).not.toContain('subtheme1')
            })
        })
    })

    describe('Provider Management', () => {
        describe('checkedProviders', () => {
            beforeEach(() => {
                component.providersList = [
                    { name: 'Provider 1', selected: false }
                ]
                component.filterObj = {
                    competencyArea: [],
                    competencyTheme: [],
                    competencySubTheme: [],
                    providers: []
                }
            })

            it('should add provider when checked', () => {
                const event = { checked: true }
                const item = { name: 'Provider 1', checked: false }

                component.checkedProviders(event, item)

                expect(component.filterObj.providers).toContain('Provider 1')
                expect(item.checked).toBe(true)
            })

            it('should remove provider when unchecked', () => {
                component.filterObj.providers = ['Provider 1']
                const event = { checked: false }
                const item = { name: 'Provider 1', checked: true }

                component.checkedProviders(event, item)

                expect(component.filterObj.providers).not.toContain('Provider 1')
                expect(item.checked).toBe(false)
            })
        })
    })

    describe('Filter Actions', () => {
        describe('applyFilter', () => {
            it('should emit filter data for content', () => {
                component.from = 'content'
                const spy = jest.spyOn(component, 'hideFilter')
                const serviceSpy = jest.spyOn(mockUsersService.getFilterDataObject, 'next')

                component.applyFilter()

                expect(serviceSpy).toHaveBeenCalledWith(component.filterObj)
                expect(spy).toHaveBeenCalledWith('applyFilter')
            })

            it('should emit assignee filter data for assignee', () => {
                component.from = 'assignee'
                const spy = jest.spyOn(component, 'hideFilter')
                const serviceSpy = jest.spyOn(mockUsersService.getFilterDataObject, 'next')

                component.applyFilter()

                expect(serviceSpy).toHaveBeenCalledWith(component.assigneeFilterObj)
                expect(spy).toHaveBeenCalledWith('applyFilter')
            })
        })

        describe('clearFilter', () => {
            it('should clear content filters', () => {
                component.from = 'content'
                component.filterObj = {
                    competencyArea: ['area1'],
                    competencyTheme: ['theme1'],
                    competencySubTheme: ['subtheme1'],
                    providers: ['provider1']
                }
                component.selectedProviders = ['provider1']
                component.competencyThemeList = [{ name: 'theme1' }]
                component.competencySubThemeList = [{ name: 'subtheme1' }]

                const resetSpy = jest.spyOn(component, 'resetFilter')

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
                expect(resetSpy).toHaveBeenCalled()
            })

            it('should clear assignee filters', () => {
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
                expect(component.groupSearchKey).toBe('')
                expect(component.designationSearchKey).toBe('')
                expect(component.rolesSearchKey).toBe('')
                expect(component.tagsSearchKey).toBe('')
            })
        })

        describe('hideFilter', () => {
            it('should emit toggle filter event', () => {
                const spy = jest.spyOn(component.toggleFilter, 'emit')
                const serviceSpy = jest.spyOn(mockUsersService.filterToggle, 'next')

                component.hideFilter('test')

                expect(spy).toHaveBeenCalledWith({
                    filter: 'test',
                    filtersList: component.assigneeFilterObj
                })
                expect(serviceSpy).toHaveBeenCalledWith({ from: '', status: false })
            })
        })
    })

    describe('Reset Functions', () => {
        describe('resetFilter', () => {
            it('should reset competency theme list selections', () => {
                component.competencyThemeList = [
                    { name: 'theme1', selected: true },
                    { name: 'theme2', selected: true }
                ]

                component.resetFilter()

                component.competencyThemeList.forEach(item => {
                    expect(item.selected).toBe(false)
                })
            })

            it('should reset competency sub theme list selections', () => {
                component.competencySubThemeList = [
                    { name: 'subtheme1', selected: true }
                ]

                component.resetFilter()

                component.competencySubThemeList.forEach(item => {
                    expect(item.selected).toBe(false)
                })
            })

            it('should reset providers list selections', () => {
                component.providersList = [
                    { name: 'provider1', selected: true }
                ]

                component.resetFilter()

                component.providersList.forEach(item => {
                    expect(item.selected).toBe(false)
                })
            })
        })

        describe('resetAssigneeFilter', () => {
            it('should reset assignee filter object and search keys', () => {
                const spy = jest.spyOn(component, 'hideFilter')

                component.resetAssigneeFilter()

                expect(component.assigneeFilterObj.group).toEqual([])
                expect(component.assigneeFilterObj.designation).toEqual([])
                expect(component.assigneeFilterObj.roles).toEqual([])
                expect(component.assigneeFilterObj.tags).toEqual([])
                expect(component.groupSearchKey).toBe('')
                expect(component.designationSearchKey).toBe('')
                expect(component.rolesSearchKey).toBe('')
                expect(component.tagsSearchKey).toBe('')
                expect(spy).toHaveBeenCalledWith('clearFilter')
            })
        })
    })

    describe('Service Integration', () => {
        describe('getDesignation', () => {
            it('should fetch and set designations', () => {
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
                const spy = jest.spyOn(component, 'getFilteredDesignationList')

                component.getDesignation()

                expect(mockTrainingPlanService.getDesignations).toHaveBeenCalled()
                expect(component.designationList).toEqual(mockResponse.result.response.content)
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('ngAfterContentChecked', () => {
        it('should call detectChanges', () => {
            component.ngAfterContentChecked()
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })
    })

    describe('clearFilterWhileSearch', () => {
        it('should uncheck all checkboxes', () => {
            const mockElement1 = { checked: true }
            const mockElement2 = { checked: true }
            const mockQueryList = {
                forEach: jest.fn((callback) => {
                    callback(mockElement1)
                    callback(mockElement2)
                })
            } as any

            component.checkboxes = mockQueryList

            component.clearFilterWhileSearch()

            expect(mockElement1.checked).toBe(false)
            expect(mockElement2.checked).toBe(false)
        })
    })
})