// users.component.spec.ts
import { UsersComponent } from './users.component'
import * as _ from 'lodash'

describe('UsersComponent', () => {
    let component: UsersComponent
    let mockUsersService: any
    let mockUsersService2: any
    // let mockRouter: any
    let mockActivatedRoute: any
    let mockRoute: any
    let mockProfileUtilSvc: any
    let mockCDRef: any

    beforeEach(() => {
        mockUsersService = {
            getUsers: jest.fn().mockReturnValue({
                subscribe: (cb: Function) => cb({ users: [{ first_name: 'John', email: 'j@example.com', department_name: 'IT', wid: '123' }] })
            }),
            blockUser: jest.fn(),
            deActiveUser: jest.fn(),
            activeUser: jest.fn(),
            searchUserByenter: jest.fn().mockReturnValue({
                subscribe: (cb: Function) => cb({
                    result: {
                        response: {
                            content: [{
                                firstName: 'Jane',
                                email: 'jane@example.com',
                                organisations: [{ roles: ['Admin'], isDeleted: false }],
                                profileDetails: { personalDetails: { primaryEmail: 'jane@example.com' } },
                                userId: '321',
                                department_name: 'HR',
                                isDeleted: false,
                            }]
                        }
                    }
                })
            }),
        }

        mockUsersService2 = {
            getTotalRoleUsers: jest.fn().mockReturnValue({
                subscribe: (cb: Function) => cb({ count: { content: [] } })
            }),
        }

        const mockRouter = {
            url: '/app/Admin/users',
        } as any

        mockActivatedRoute = {
            params: {
                subscribe: (cb: Function) => cb({ role: 'Admin' }),
            },
        }

        mockRoute = {
            snapshot: {
                parent: {
                    data: {
                        configService: {
                            unMappedUser: {
                                rootOrg: {
                                    rootOrgId: 'org123',
                                    id: 'org123',
                                }
                            }
                        }
                    }
                }
            }
        }

        mockProfileUtilSvc = {
            emailTransform: jest.fn((email: string) => email)
        }

        mockCDRef = { detectChanges: jest.fn() }

        component = new UsersComponent(
            mockUsersService,
            mockRouter,
            mockActivatedRoute,
            mockRoute,
            mockProfileUtilSvc,
            mockUsersService2,
            mockCDRef,
        )
    })

    it('should initialize with correct role and table data', () => {
        component.ngOnInit()
        expect(component.role).toBe('Admin')
        expect(component.roleName).toBe('Admin')
        expect(component.tabledata.columns.length).toBeGreaterThan(0)
    })

    it('should call fetchAllUsersWithRole and getMyDepartment on init', () => {
        const getMyDepartmentSpy = jest.spyOn(component, 'getMyDepartment')
        component.ngOnInit()
        expect(mockUsersService2.getTotalRoleUsers).toHaveBeenCalledWith('org123', 'Admin')
        expect(getMyDepartmentSpy).toHaveBeenCalled()
    })

    it('should process users in fetchUsersWithRole', () => {
        component.role = 'Admin'
        component.fetchUsersWithRole()
        expect(component.data.length).toBe(1)
        expect(component.data[0].fullName).toBe('John')
    })

    it('should open karma profile URL on showOnKarma', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
        component.data2 = { id: 'dept1' }
        component.menuActions({ action: 'showOnKarma', row: { wid: '321' } })
        expect(openSpy).toHaveBeenCalled()
    })

    it('should call blockUser on "block" action', () => {
        const row = {
            wid: '123',
            roleInfo: [{ roleName: 'Admin' }],
        }
        component.data2 = { id: 'dept1' }
        component.menuActions({ action: 'block', row })
        expect(mockUsersService.blockUser).toHaveBeenCalled()
    })

    it('should call searchUserByenter and populate data', () => {
        component.roleName = 'Admin'
        component.onEnterkySearch('Jane')
        expect(mockUsersService.searchUserByenter).toHaveBeenCalled()
        expect(component.data.length).toBe(1)
        expect(component.data[0].fullName).toBe('Jane')
    })

    it('should unsubscribe on destroy if subscription exists', () => {
        const unsubscribe = jest.fn()
        component['defaultSideNavBarOpenedSubscription'] = { unsubscribe }
        component.ngOnDestroy()
        expect(unsubscribe).toHaveBeenCalled()
    })

    it('should call detectChanges in ngAfterContentChecked', () => {
        component.ngAfterContentChecked()
        expect(mockCDRef.detectChanges).toHaveBeenCalled()
    })
})
