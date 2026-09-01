import { LeadershiptableComponent } from './leadershiptable.component'
import { SelectionModel } from '@angular/cdk/collections'
import { MatTableDataSource } from '@angular/material/table'
import { of, throwError } from 'rxjs'

// Mock dependencies
const mockDialog = {
    open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ data: [] }))
    })
}

const mockActiveRoute = {
    snapshot: {
        data: {
            configService: {
                userProfile: {
                    rootOrgId: 'test-org-id'
                }
            }
        }
    }
}

const mockSnackBar = {
    open: jest.fn()
}

const mockMdoInfoService = {
    getAllUsers: jest.fn(),
    getTeamUsers: jest.fn(),
    assignTeamRole: jest.fn()
}

const mockConfigSvc = {
    userProfile: {
        rootOrgId: 'config-org-id'
    }
}

const mockRouter = {
    navigate: jest.fn()
}

const mockProfileUtilSvc = {
    emailTransform: jest.fn().mockImplementation((email) => email)
}

const mockPaginator = {
    firstPage: jest.fn(),
    pageSize: 20,
    pageSizeOptions: [20, 40, 60, 80, 100]
}

describe('LeadershiptableComponent', () => {
    let component: LeadershiptableComponent

    beforeEach(() => {
        jest.clearAllMocks()

        // Create component instance with mocked dependencies
        component = new LeadershiptableComponent(
            mockDialog as any,
            mockActiveRoute as any,
            mockSnackBar as any,
            mockMdoInfoService as any,
            mockConfigSvc as any,
            mockRouter as any,
            mockProfileUtilSvc as any
        )

        // Set up paginator mock
        component.paginator = mockPaginator as any
    })

    describe('Constructor', () => {
        it('should initialize component with default values', () => {
            expect(component.tableData).toBeDefined()
            expect(component.tableData.columns).toHaveLength(4)
            expect(component.data).toEqual([])
            expect(component.pageSize).toBe(20)
            expect(component.pageSizeOptions).toEqual([20, 40, 60, 80, 100])
            expect(component.selection).toBeInstanceOf(SelectionModel)
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
        })

        it('should set up table data with correct structure', () => {
            expect(component.tableData.actions).toEqual([])
            expect(component.tableData.needCheckBox).toBe(false)
            expect(component.tableData.needHash).toBe(false)
            expect(component.tableData.sortColumn).toBe('fullname')
            expect(component.tableData.sortState).toBe('asc')
            expect(component.tableData.needUserMenus).toBe(true)
        })
    })

    describe('ngOnInit', () => {
        it('should set displayedColumns from tableData', () => {
            component.ngOnInit()
            expect(component.displayedColumns).toBe(component.tableData.columns)
        })

        it('should set deptID from configSvc.userProfile', () => {
            component.ngOnInit()
            expect(component.deptID).toBe('config-org-id')
        })

        it('should set deptID from activeRoute when configSvc.userProfile is not available', () => {
            // component.configSvc.userProfile = null
            component.ngOnInit()
            expect(component.deptID).toBe('test-org-id')
        })

        it('should call getAllUsers and getUsers when deptID is available', () => {
            const getAllUsersSpy = jest.spyOn(component, 'getAllUsers').mockImplementation()
            const getUsersSpy = jest.spyOn(component, 'getUsers').mockImplementation()

            component.ngOnInit()

            expect(getAllUsersSpy).toHaveBeenCalledWith('config-org-id')
            expect(getUsersSpy).toHaveBeenCalledWith('MDO_LEADER')
        })

        it('should not call getAllUsers and getUsers when deptID is not available', () => {
            // component.configSvc.userProfile = null
            // component.activeRoute.snapshot.data.configService.userProfile.rootOrgId = undefined

            const getAllUsersSpy = jest.spyOn(component, 'getAllUsers').mockImplementation()
            const getUsersSpy = jest.spyOn(component, 'getUsers').mockImplementation()

            component.ngOnInit()

            expect(getAllUsersSpy).not.toHaveBeenCalled()
            expect(getUsersSpy).not.toHaveBeenCalled()
        })
    })

    describe('ngOnChanges', () => {
        it('should update dataSource and length when data changes', () => {
            const mockData = [{ id: 1, name: 'Test' }]
            const changes = {
                data: {
                    currentValue: mockData
                }
            }

            component.ngOnChanges(changes as any)

            expect(component.dataSource.data).toBe(mockData)
            expect(component.length).toBe(1)
            expect(mockPaginator.firstPage).toHaveBeenCalled()
        })

        it('should handle undefined data in changes', () => {
            const changes = {
                data: {
                    currentValue: undefined
                }
            }

            component.ngOnChanges(changes as any)

            expect(component.dataSource.data).toBeUndefined()
            expect(component.length).toBe(0)
        })
    })

    describe('getAllUsers', () => {
        it('should call mdoinfoSrvc.getAllUsers and process response', () => {
            const mockResponse = { content: [{ id: 1, name: 'User1' }] }
            mockMdoInfoService.getAllUsers.mockReturnValue(of(mockResponse))
            const filterAllUsersSpy = jest.spyOn(component, 'filterAllUsers').mockImplementation()

            component.getAllUsers('test-org')

            expect(mockMdoInfoService.getAllUsers).toHaveBeenCalledWith({
                request: {
                    query: '',
                    filters: {
                        rootOrgId: 'test-org'
                    }
                }
            })
            expect(filterAllUsersSpy).toHaveBeenCalledWith(mockResponse.content)
        })
    })

    describe('filterAllUsers', () => {
        it('should filter users when data exists', () => {
            component.data = [1]
            component.usersData = []
            const allUsers = [{ id: 1 }, { id: 2 }]

            component.filterAllUsers(allUsers)

            expect(component.usersData).toEqual([{ id: 2 }])
        })

        it('should use all users when data is empty', () => {
            component.data = []
            component.usersData = []
            const allUsers = [{ id: 1 }, { id: 2 }]

            component.filterAllUsers(allUsers)

            expect(component.usersData).toEqual(allUsers)
        })

        it('should use all users when data is not set', () => {
            component.data = undefined
            component.usersData = []
            const allUsers = [{ id: 1 }, { id: 2 }]

            component.filterAllUsers(allUsers)

            expect(component.usersData).toEqual(allUsers)
        })
    })

    describe('getUsers', () => {
        it('should get users and process successful response', () => {
            const mockUser = {
                id: 1,
                firstName: 'John',
                email: 'john@test.com',
                profileDetails: {
                    professionalDetails: [{ designation: 'Manager' }]
                }
            }
            const mockResponse = {
                result: {
                    response: {
                        content: [mockUser]
                    }
                }
            }

            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockResponse))
            component.deptID = 'test-dept'

            component.getUsers('MDO_LEADER')

            expect(mockMdoInfoService.getTeamUsers).toHaveBeenCalledWith({
                request: {
                    filters: {
                        rootOrgId: 'test-dept',
                        'roles.role': ['MDO_LEADER']
                    }
                }
            })

            expect(component.data).toEqual([{
                srnumber: 1,
                fullname: 'John',
                email: 'john@test.com',
                position: 'Manager',
                id: 1
            }])

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/mdoinfo/leadership'])
        })

        it('should handle user without professional details', () => {
            const mockUser = {
                id: 1,
                firstName: 'Jane',
                email: 'jane@test.com',
                profileDetails: {}
            }
            const mockResponse = {
                result: {
                    response: {
                        content: [mockUser]
                    }
                }
            }

            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockResponse))
            // const getAllUsersSpy = jest.spyOn(component, 'getAllUsers').mockImplementation()

            component.getUsers('MDO_LEADER')

            expect(component.data).toEqual([{
                srnumber: 1,
                fullname: 'Jane',
                email: 'jane@test.com',
                position: '',
                id: 1
            }])
        })

        it('should call getAllUsers when no users found', () => {
            const mockResponse = {
                result: {
                    response: {
                        content: []
                    }
                }
            }

            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockResponse))
            const getAllUsersSpy = jest.spyOn(component, 'getAllUsers').mockImplementation()
            component.deptID = 'test-dept'

            component.getUsers('MDO_LEADER')

            expect(getAllUsersSpy).toHaveBeenCalledWith('test-dept')
        })

        it('should handle service error', () => {
            mockMdoInfoService.getTeamUsers.mockReturnValue(throwError('Service error'))

            component.getUsers('MDO_LEADER')

            // Should not throw error and continue execution
            expect(component.data).toEqual([])
        })

        it('should not make request when role is falsy', () => {
            component.getUsers(null)
            component.getUsers('')
            component.getUsers(undefined)

            expect(mockMdoInfoService.getTeamUsers).not.toHaveBeenCalled()
        })

        it('should sort users by firstName', () => {
            const mockUsers = [
                { id: 1, firstName: 'Zoe', email: 'zoe@test.com' },
                { id: 2, firstName: 'Alice', email: 'alice@test.com' }
            ]
            const mockResponse = {
                result: {
                    response: {
                        content: mockUsers
                    }
                }
            }

            mockMdoInfoService.getTeamUsers.mockReturnValue(of(mockResponse))

            component.getUsers('MDO_LEADER')

            expect(component.data[0].fullname).toBe('Alice')
            expect(component.data[1].fullname).toBe('Zoe')
        })
    })

    describe('getFinalColumns', () => {
        it('should return columns with Menu when needUserMenus is true', () => {
            const result = component.getFinalColumns()
            expect(result).toEqual(['srnumber', 'fullname', 'position', 'email', 'Menu'])
        })

        it('should return columns with select when needCheckBox is true', () => {
            component.tableData.needCheckBox = true
            const result = component.getFinalColumns()
            expect(result).toEqual(['select', 'srnumber', 'fullname', 'position', 'email', 'Menu'])
        })

        it('should return columns with SR when needHash is true', () => {
            component.tableData.needHash = true
            const result = component.getFinalColumns()
            expect(result).toEqual(['SR', 'srnumber', 'fullname', 'position', 'email', 'Menu'])
        })

        it('should return columns with both select and SR', () => {
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

    describe('adduser', () => {
        it('should open dialog and process response', () => {
            const mockDialogResponse = {
                data: [{ id: 1 }, { id: 2 }]
            }
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of(mockDialogResponse))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.usersData = [{ id: 1 }, { id: 2 }, { id: 3 }]
            const assignRoleSpy = jest.spyOn(component, 'assignRole').mockImplementation()

            component.adduser()

            expect(mockDialog.open).toHaveBeenCalled()
            expect(assignRoleSpy).toHaveBeenCalledTimes(2)
            expect(assignRoleSpy).toHaveBeenCalledWith({ id: 1 })
            expect(assignRoleSpy).toHaveBeenCalledWith({ id: 2 })
        })

        it('should handle dialog response without data', () => {
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of(null))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            const assignRoleSpy = jest.spyOn(component, 'assignRole').mockImplementation()

            component.adduser()

            expect(assignRoleSpy).not.toHaveBeenCalled()
        })

        it('should handle dialog response with empty data array', () => {
            const mockDialogResponse = { data: [] }
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of(mockDialogResponse))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            const assignRoleSpy = jest.spyOn(component, 'assignRole').mockImplementation()

            component.adduser()

            expect(assignRoleSpy).not.toHaveBeenCalled()
        })
    })

    describe('assignRole', () => {
        it('should assign role and refresh users list', () => {
            const mockUser = {
                id: 1,
                organisations: [{ roles: ['USER'] }]
            }

            mockMdoInfoService.assignTeamRole.mockReturnValue(of({}))
            const getUsersSpy = jest.spyOn(component, 'getUsers').mockImplementation()
            const openSnackbarSpy = jest.spyOn(component as any, 'openSnackbar').mockImplementation()
            component.deptID = 'test-dept'

            component.assignRole(mockUser)

            expect(mockMdoInfoService.assignTeamRole).toHaveBeenCalledWith({
                request: {
                    organisationId: 'test-dept',
                    userId: 1,
                    roles: ['USER', 'MDO_LEADER']
                }
            })
            expect(openSnackbarSpy).toHaveBeenCalledWith('User is added successfully!')
            expect(getUsersSpy).toHaveBeenCalledWith('MDO_LEADER')
        })
    })

    describe('openSnackbar', () => {
        it('should open snackbar with default duration', () => {
            (component as any).openSnackbar('Test message')

            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
                duration: 5000
            })
        })

        it('should open snackbar with custom duration', () => {
            (component as any).openSnackbar('Test message', 3000)

            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
                duration: 3000
            })
        })
    })

    describe('applyFilter', () => {
        it('should apply filter when filterValue is provided', () => {
            const filterValue = '  Test Filter  '

            component.applyFilter(filterValue)

            expect(component.dataSource.filter).toBe('test filter')
        })

        it('should clear filter when filterValue is empty', () => {
            component.applyFilter('')

            expect(component.dataSource.filter).toBe('')
        })

        it('should clear filter when filterValue is null', () => {
            component.applyFilter(null)

            expect(component.dataSource.filter).toBe('')
        })

        it('should clear filter when filterValue is undefined', () => {
            component.applyFilter(undefined)

            expect(component.dataSource.filter).toBe('')
        })
    })

    describe('updateData', () => {
        it('should navigate to user details page', () => {
            const rowData = { id: 123 }

            component.updateData(rowData)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/app/users/123/details'],
                { queryParams: { param: 'MDOinfo', path: 'Leadership' } }
            )
        })
    })

    describe('matSort setter', () => {
        it('should set sort when dataSource.sort is not set', () => {
            const mockSort = { direction: 'asc' }
            component.dataSource.sort = undefined

            component.matSort = mockSort as any

            expect(component.dataSource.sort).toBe(mockSort)
        })

        it('should not set sort when dataSource.sort is already set', () => {
            const existingSort = { direction: 'desc' }
            const newSort = { direction: 'asc' }
            component.dataSource.sort = existingSort as any

            component.matSort = newSort as any

            expect(component.dataSource.sort).toBe(existingSort)
        })
    })

    describe('Component Properties', () => {
        it('should have correct initial state data', () => {
            expect(component.statedata).toEqual({
                param: 'MDOinfo',
                path: 'Leadership'
            })
        })

        it('should have correct table data structure', () => {
            expect(component.tableData.columns).toEqual([
                { displayName: 'Sr. no.', key: 'srnumber' },
                { displayName: 'Full name', key: 'fullname' },
                { displayName: 'Position', key: 'position', isList: true },
                { displayName: 'Email', key: 'email' }
            ])
        })
    })
})