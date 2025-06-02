import { RolesAccessComponent } from './roles-access.component'
import { Router, ActivatedRoute } from '@angular/router'
import { RolesService } from '../../../users/services/roles.service'
import { UsersService } from '../../../users/services/users.service'
import { TelemetryEvents } from '../../../../head/_services/telemetry.event.model'
import { of } from 'rxjs'
import { EventService } from '@sunbird-cb/utils/lib/services/event.service'

// Mock lodash
jest.mock('lodash', () => ({
    get: jest.fn(),
    uniq: jest.fn(),
    each: jest.fn(),
}))

describe('RolesAccessComponent', () => {
    let component: RolesAccessComponent
    let mockRouter: jest.Mocked<Router>
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>
    let mockUsersService: jest.Mocked<UsersService>
    let mockEventService: jest.Mocked<EventService>
    let mockRolesService: jest.Mocked<RolesService>

    beforeEach(() => {
        // Create mocks
        mockRouter = {
            navigate: jest.fn(),
        } as any

        mockActivatedRoute = {
            snapshot: {
                parent: {
                    data: {
                        configService: {
                            unMappedUser: {
                                rootOrg: {
                                    rootOrgId: 'test-root-org-id'
                                }
                            }
                        }
                    }
                }
            }
        } as any

        mockUsersService = {
            getAllRoleUsers: jest.fn(),
        } as any

        mockEventService = {
            raiseInteractTelemetry: jest.fn(),
        } as any

        mockRolesService = {
            getAllRoles: jest.fn(),
        } as any

        // Create component instance
        component = new RolesAccessComponent(
            mockRouter,
            mockActivatedRoute,
            mockUsersService,
            mockEventService,
            mockRolesService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('ngOnInit', () => {
        it('should initialize component properties correctly', () => {
            const fetchRolesNewSpy = jest.spyOn(component, 'fetchRolesNew').mockImplementation()

            component.ngOnInit()

            expect(component.tabledata).toEqual({
                columns: [
                    { displayName: 'Role', key: 'role' },
                    { displayName: 'Number of users', key: 'count' },
                ],
                actions: [{ icon: 'refresh', label: 'Refresh', name: 'ViewCount', type: 'link', disabled: false }],
                needCheckBox: false,
                needHash: false,
                sortColumn: '',
                sortState: 'asc',
                needUserMenus: false,
                actionColumnName: 'Refresh',
            })

            expect(fetchRolesNewSpy).toHaveBeenCalled()
        })
    })

    describe('onRoleClick', () => {
        it('should navigate to role users page and raise telemetry event', () => {
            const mockRole = { role: 'ADMIN' }

            component.onRoleClick(mockRole)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/roles/ADMIN/users'])
            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: TelemetryEvents.EnumInteractTypes.CLICK,
                    subType: TelemetryEvents.EnumInteractSubTypes.CARD_CONTENT,
                    id: TelemetryEvents.EnumIdtype.ROLES_ROW,
                },
                {
                    id: 'ADMIN',
                    type: TelemetryEvents.EnumIdtype.ROLES,
                }
            )
        })
    })

    describe('fetchIndidualRoleData', () => {
        beforeEach(() => {
            component.data = [
                { role: 'ADMIN', count: '0' },
                { role: 'USER', count: '0' },
                { role: 'MANAGER', count: '0' }
            ]
        })

        it('should fetch individual role data and update count', () => {
            const mockResponse = { count: 25 }
            mockUsersService.getAllRoleUsers.mockReturnValue(of(mockResponse))

            component.fetchIndidualRoleData('root-org-123', 'ADMIN')

            expect(mockUsersService.getAllRoleUsers).toHaveBeenCalledWith('root-org-123', 'ADMIN')
            expect(component.roleCountSpinner).toBe(true)
            expect(component.data[0].count).toBe(25)
        })

        it('should not update count for non-matching roles', () => {
            const mockResponse = { count: 15 }
            mockUsersService.getAllRoleUsers.mockReturnValue(of(mockResponse))

            component.fetchIndidualRoleData('root-org-123', 'NON_EXISTENT_ROLE')

            expect(component.data[0].count).toBe('0')
            expect(component.data[1].count).toBe('0')
            expect(component.data[2].count).toBe('0')
        })
    })

    describe('actionsClick', () => {
        it('should handle ViewCount action correctly', () => {
            const mockEvent = {
                action: 'ViewCount',
                row: { role: 'ADMIN' }
            }

            const fetchIndidualRoleDataSpy = jest.spyOn(component, 'fetchIndidualRoleData').mockImplementation()

            // Mock lodash get
            const _ = require('lodash')
            _.get.mockReturnValue('test-root-org-id')

            component.actionsClick(mockEvent)

            expect(component.roleCountSpinner).toBe(false)
            expect(fetchIndidualRoleDataSpy).toHaveBeenCalledWith('test-root-org-id', 'ADMIN')
        })

        it('should not call fetchIndidualRoleData for other actions', () => {
            const mockEvent = {
                action: 'OTHER_ACTION',
                row: { role: 'ADMIN' }
            }

            const fetchIndidualRoleDataSpy = jest.spyOn(component, 'fetchIndidualRoleData').mockImplementation()

            component.actionsClick(mockEvent)

            expect(fetchIndidualRoleDataSpy).not.toHaveBeenCalled()
        })
    })

    describe('fetchRolesNew', () => {
        it('should fetch roles and process data correctly', () => {
            const mockApiResponse = {
                result: {
                    response: {
                        value: JSON.stringify({
                            orgTypeList: [
                                {
                                    name: 'MDO',
                                    roles: ['ADMIN', 'USER']
                                },
                                {
                                    name: 'OTHER',
                                    roles: ['GUEST']
                                }
                            ]
                        })
                    }
                }
            }

            mockRolesService.getAllRoles.mockReturnValue(of(mockApiResponse))

            // Mock lodash functions
            const _ = require('lodash')
            _.uniq.mockImplementation((arr: any) => [...new Set(arr)])
            _.each.mockImplementation((arr: any, fn: any) => arr.forEach(fn))

            component.fetchRolesNew()

            expect(mockRolesService.getAllRoles).toHaveBeenCalled()
            expect(component.parseRoledata).toEqual({
                orgTypeList: [
                    { name: 'MDO', roles: ['ADMIN', 'USER'] },
                    { name: 'OTHER', roles: ['GUEST'] }
                ]
            })
        })

        it('should handle empty orgTypeList', () => {
            const mockApiResponse = {
                result: {
                    response: {
                        value: JSON.stringify({
                            orgTypeList: []
                        })
                    }
                }
            }

            mockRolesService.getAllRoles.mockReturnValue(of(mockApiResponse))

            const _ = require('lodash')
            _.uniq.mockImplementation((arr: any) => [...new Set(arr)])
            _.each.mockImplementation((arr: any, fn: any) => arr.forEach(fn))

            component.fetchRolesNew()

            expect(component.rolesObject).toEqual([])
            expect(component.uniqueRoles).toEqual([])
        })

        it('should filter only MDO org types', () => {
            const mockApiResponse = {
                result: {
                    response: {
                        value: JSON.stringify({
                            orgTypeList: [
                                { name: 'MDO', roles: ['ADMIN'] },
                                { name: 'SUPPLIER', roles: ['SUPPLIER_ADMIN'] },
                                { name: 'MDO', roles: ['USER'] }
                            ]
                        })
                    }
                }
            }

            mockRolesService.getAllRoles.mockReturnValue(of(mockApiResponse))

            const _ = require('lodash')
            _.uniq.mockImplementation((arr: any) => [...new Set(arr)])
            _.each.mockImplementation((arr: any, fn: any) => arr.forEach(fn))

            component.fetchRolesNew()

            expect(component.rolesObject).toHaveLength(2)
            expect(component.rolesObject[0]).toEqual(['ADMIN'])
            expect(component.rolesObject[1]).toEqual(['USER'])
        })
    })

    describe('ngAfterViewInit', () => {
        it('should be defined', () => {
            expect(component.ngAfterViewInit).toBeDefined()
        })
    })

    describe('ngOnDestroy', () => {
        it('should be defined', () => {
            expect(component.ngOnDestroy).toBeDefined()
        })
    })

    describe('Component Properties', () => {
        it('should initialize with correct default values', () => {
            expect(component.data).toEqual([])
            expect(component.roleCountSpinner).toBe(true)
            expect(component.parseRoledata).toEqual([])
            expect(component.rolesObject).toEqual([])
            expect(component.uniqueRoles).toEqual([])
        })
    })

    describe('Error Handling', () => {
        it('should handle API errors in fetchRolesNew', () => {
            //  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            mockRolesService.getAllRoles.mockReturnValue(
                new (require('rxjs').Observable)((subscriber: any) => {
                    subscriber.error(new Error('API Error'))
                })
            )

            expect(() => component.fetchRolesNew()).not.toThrow()
        })

        it('should handle API errors in fetchIndidualRoleData', () => {
            // const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            mockUsersService.getAllRoleUsers.mockReturnValue(
                new (require('rxjs').Observable)((subscriber: any) => {
                    subscriber.error(new Error('API Error'))
                })
            )

            expect(() => component.fetchIndidualRoleData('org-id', 'role')).not.toThrow()
        })
    })
})