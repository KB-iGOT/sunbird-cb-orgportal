
import { LeadershipComponent } from './leadership.component'
import { of, throwError } from 'rxjs'
import * as _ from 'lodash'

// Mock dependencies
const mockActivatedRoute = {
    snapshot: {
        data: {
            configService: {
                userProfile: {
                    rootOrgId: 'test-root-org-id'
                }
            }
        }
    }
}

const mockConfigurationsService = {
    userProfile: {
        rootOrgId: 'config-root-org-id'
    }
}

const mockMdoInfoService = {
    getTeamUsers: jest.fn()
}

const mockProfileV2UtillService = {
    emailTransform: jest.fn((email: string) => email)
}

const mockMatPaginator = {
    firstPage: jest.fn()
}

const mockMatTableDataSource = {
    data: [],
    paginator: null,
    sort: null,
    filter: ''
}

// Mock MatTableDataSource constructor
jest.mock('@angular/material/table', () => ({
    MatTableDataSource: jest.fn().mockImplementation(() => mockMatTableDataSource)
}))

describe('LeadershipComponent (Without TestBed)', () => {
    let component: LeadershipComponent

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()
        mockMatTableDataSource.data = []
        mockMatTableDataSource.filter = ''

        // Create component instance with mocked dependencies
        component = new LeadershipComponent(
            mockActivatedRoute as any,
            mockConfigurationsService as any,
            mockMdoInfoService as any,
            mockProfileV2UtillService as any
        )

        // Set up paginator mock
        component.paginator = mockMatPaginator as any
    })

    describe('Constructor', () => {
        it('should initialize component with default values', () => {
            expect(component.data).toEqual([])
            expect(component.pageSize).toBe(20)
            expect(component.pageSizeOptions).toEqual([20, 40, 60, 80, 100])
            expect(component.tabData).toBe('MDO_LEADER')
            expect(component.dataSource).toBeDefined()
        })

        it('should set up table data configuration', () => {
            expect(component.tableData.columns).toHaveLength(4)
            expect(component.tableData.columns[0].key).toBe('srnumber')
            expect(component.tableData.columns[1].key).toBe('fullname')
            expect(component.tableData.needCheckBox).toBe(false)
            expect(component.tableData.needUserMenus).toBe(true)
        })
    })

    describe('ngOnInit', () => {
        it('should set deptID from configSvc.userProfile when available', () => {
            component.ngOnInit()
            expect(component.deptID).toBe('config-root-org-id')
        })

        it('should set deptID from activeRoute when configSvc.userProfile is not available', () => {
            component = new LeadershipComponent(
                mockActivatedRoute as any,
                { userProfile: null } as any,
                mockMdoInfoService as any,
                mockProfileV2UtillService as any
            )

            component.ngOnInit()
            expect(component.deptID).toBe('test-root-org-id')
        })

        it('should set displayedColumns from tableData', () => {
            component.ngOnInit()
            expect(component.displayedColumns).toBe(component.tableData.columns)
        })
    })

    describe('ngOnChanges', () => {
        it('should update dataSource data and reset paginator', () => {
            const mockData = [{ id: 1, name: 'Test User' }]
            const changes = {
                data: {
                    currentValue: mockData,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            }

            component.ngOnChanges(changes)

            expect(component.dataSource.data).toBe(mockData)
            expect(component.length).toBe(mockData.length)
            expect(mockMatPaginator.firstPage).toHaveBeenCalled()
        })

        // it('should handle empty data changes', () => {
        //     const changes = {
        //         data: {
        //             currentValue: undefined,
        //             previousValue: null,
        //             firstChange: true,
        //             isFirstChange: () => true
        //         }
        //     }

        //     component.ngOnChanges(changes)
        //     expect(component.dataSource.data).toBeUndefined()
        // })

        it('should handle empty data changes', () => {
            const changes = {
                data: {
                    currentValue: undefined,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            }

            component.ngOnChanges(changes as any)
            expect(component.dataSource.data).toBeUndefined()
            expect(component.length).toBe(0)
        })

    })

    describe('tabChanged', () => {
        it('should set tabData to MDO_LEADER for Leadership team tab', () => {
            const tabChangeEvent = {
                index: 0,
                tab: { textLabel: 'Leadership team' }
            } as any

            component.tabChanged(tabChangeEvent)
            expect(component.tabData).toBe('MDO_LEADER')
        })

        it('should set tabData to MDO_ADMIN for Admin team tab', () => {
            const tabChangeEvent = {
                index: 1,
                tab: { textLabel: 'Admin team' }
            } as any

            component.tabChanged(tabChangeEvent)
            expect(component.tabData).toBe('MDO_ADMIN')
        })
    })

    describe('applyFilter', () => {
        it('should apply filter to dataSource when filterValue is provided', () => {
            const filterValue = '  Test Filter  '

            component.applyFilter(filterValue)

            expect(component.dataSource.filter).toBe('test filter')
        })

        it('should clear filter when filterValue is empty', () => {
            component.dataSource.filter = 'existing filter'

            component.applyFilter('')

            expect(component.dataSource.filter).toBe('')
        })

        it('should clear filter when filterValue is null', () => {
            component.dataSource.filter = 'existing filter'

            component.applyFilter(null)

            expect(component.dataSource.filter).toBe('')
        })
    })

    describe('getFinalColumns', () => {
        it('should return column keys with Menu column when needUserMenus is true', () => {
            const result = component.getFinalColumns()
            expect(result).toEqual(['srnumber', 'fullname', 'position', 'email', 'Menu'])
        })

        it('should include select column when needCheckBox is true', () => {
            component.tableData.needCheckBox = true

            const result = component.getFinalColumns()
            expect(result).toEqual(['select', 'srnumber', 'fullname', 'position', 'email', 'Menu'])
        })

        it('should include SR column when needHash is true', () => {
            component.tableData.needHash = true

            const result = component.getFinalColumns()
            expect(result).toEqual(['SR', 'srnumber', 'fullname', 'position', 'email', 'Menu'])
        })

        it('should include both select and SR columns when both flags are true', () => {
            component.tableData.needCheckBox = true
            component.tableData.needHash = true

            const result = component.getFinalColumns()
            expect(result).toEqual(['select', 'SR', 'srnumber', 'fullname', 'position', 'email', 'Menu'])
        })

        it('should return empty string when tableData is undefined', () => {
            component.tableData = undefined as any

            const result = component.getFinalColumns()
            expect(result).toBe('')
        })
    })

    describe('getUsers', () => {
        const mockUsersResponse = {
            result: {
                response: {
                    content: [
                        {
                            firstName: 'John',
                            email: 'john@example.com',
                            channel: 'Manager',
                            id: 'user-1'
                        },
                        {
                            firstName: 'Jane',
                            email: 'jane@example.com',
                            channel: 'Director',
                            id: 'user-2'
                        }
                    ]
                }
            }
        }

        beforeEach(() => {
            component.deptID = 'test-dept-id'
            mockProfileV2UtillService.emailTransform.mockImplementation((email: string) => email)
        })

        it('should fetch MDO_LEADER users and populate data array', () => {
            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockUsersResponse))

            component.getUsers('MDO_LEADER')

            expect(mockMdoInfoService.getTeamUsers).toHaveBeenCalledWith({
                request: {
                    filters: {
                        rootOrgId: 'test-dept-id',
                        'roles.role': ['MDO_LEADER']
                    }
                }
            })

            expect(component.data).toHaveLength(2)
            expect(component.data[0]).toEqual({
                fullname: 'John',
                email: 'john@example.com',
                position: 'Manager',
                id: 'user-1',
                srnumber: 1
            })
        })

        it('should fetch MDO_ADMIN users and populate admindata array', () => {
            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockUsersResponse))

            component.getUsers('MDO_ADMIN')

            expect(component.admindata).toHaveLength(2)
            expect(component.admindata[1]).toEqual({
                fullname: 'Jane',
                email: 'jane@example.com',
                position: 'Director',
                id: 'user-2',
                srnumber: 2
            })
        })

        it('should update dataSource when fetching MDO_LEADER data', () => {
            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockUsersResponse))

            component.getUsers('MDO_LEADER')

            expect(component.dataSource.data).toBe(component.data)
            expect(component.dataSource.paginator).toBe(component.paginator)
        })

        it('should handle API error gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
            mockMdoInfoService.getTeamUsers.mockReturnValue(throwError('API Error'))

            expect(() => component.getUsers('MDO_LEADER')).not.toThrow()

            consoleSpy.mockRestore()
        })

        it('should handle empty user data', () => {
            const emptyResponse = {
                result: {
                    response: {
                        content: []
                    }
                }
            }
            mockMdoInfoService.getTeamUsers.mockReturnValue(of(emptyResponse))

            component.getUsers('MDO_LEADER')

            expect(component.data).toHaveLength(0)
        })

        it('should call emailTransform for each user', () => {
            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockUsersResponse))

            component.getUsers('MDO_LEADER')

            expect(mockProfileV2UtillService.emailTransform).toHaveBeenCalledWith('john@example.com')
            expect(mockProfileV2UtillService.emailTransform).toHaveBeenCalledWith('jane@example.com')
        })
    })

    describe('matSort setter', () => {
        it('should set sort on dataSource when dataSource.sort is not set', () => {
            const mockSort = { direction: 'asc' } as any
            component.dataSource.sort = null

            component.matSort = mockSort

            expect(component.dataSource.sort).toBe(mockSort)
        })

        it('should not override existing sort on dataSource', () => {
            const existingSort = { direction: 'desc' } as any
            const newSort = { direction: 'asc' } as any
            component.dataSource.sort = existingSort

            component.matSort = newSort

            expect(component.dataSource.sort).toBe(existingSort)
        })
    })

    describe('Component Properties', () => {
        it('should have correct bodyHeight calculation', () => {
            // Mock document.body.clientHeight
            Object.defineProperty(document.body, 'clientHeight', {
                value: 1000,
                configurable: true
            })

            // Create new component to trigger bodyHeight calculation
            const newComponent = new LeadershipComponent(
                mockActivatedRoute as any,
                mockConfigurationsService as any,
                mockMdoInfoService as any,
                mockProfileV2UtillService as any
            )

            expect(newComponent.bodyHeight).toBe(875) // 1000 - 125
        })

        it('should initialize empty arrays for data properties', () => {
            expect(component.ltdata).toEqual([])
            expect(component.admindata).toEqual([])
            expect(component.usersData).toEqual([])
            expect(component.data).toEqual([])
        })
    })
})