import { of } from 'rxjs'
import { NominateUsersDialogComponent } from './nominate-users-dialog.component'

jest.mock('../../../users/services/users.service')
jest.mock('../../services/blended-approval.service')

describe('NominateUsersDialogComponent', () => {
    let component: NominateUsersDialogComponent
    let usersServiceMock: jest.Mocked<any>
    let blendedApprovalServiceMock: jest.Mocked<any>
    let dialogMock: jest.Mocked<any>
    let dialogRefMock: jest.Mocked<any>
    let snackBarMock: jest.Mocked<any>

    const mockData = {
        orgId: 'org1',
        learners: [{ user_id: 'user1' }, { user_id: 'user2' }],
        courseId: 'course1',
        applicationId: 'app1',
        totalBatchCount: 10,
        wfApprovalType: 'twoStepMDOAndPCApproval'
    }

    const mockUserData = {
        content: [
            {
                id: 'user3',
                firstName: 'Test',
                maskedEmail: 'test@example.com',
                rootOrgName: 'Test Org',
                profileDetails: {
                    employmentDetails: {
                        departmentName: 'IT'
                    }
                }
            },
            {
                id: 'user4',
                firstName: 'User',
                maskedEmail: 'user@example.com',
                rootOrgName: 'Test Org',
                profileDetails: null
            }
        ]
    }

    beforeEach(() => {
        usersServiceMock = {
            getAllUsers: jest.fn().mockReturnValue(of(mockUserData))
        }

        blendedApprovalServiceMock = {
            nominateLearners: jest.fn().mockReturnValue(of([{ result: { status: 'OK' } }])),
            getSerchRequests: jest.fn().mockReturnValue(of({
                result: {
                    data: [{ id: 1 }, { id: 2 }]
                }
            }))
        }

        dialogMock = {
            open: jest.fn()
        }

        dialogRefMock = {
            close: jest.fn()
        }

        snackBarMock = {
            open: jest.fn()
        }

        component = new NominateUsersDialogComponent(
            dialogRefMock,
            usersServiceMock,
            dialogMock,
            mockData,
            blendedApprovalServiceMock,
            snackBarMock
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should call getAllUsers with correct filter object', () => {
            const expectedFilterObj = {
                request: {
                    query: '',
                    filters: {
                        rootOrgId: mockData.orgId,
                        status: 1,
                    },
                    limit: 100,
                    offset: 0,
                },
            }

            const getAllUsersSpy = jest.spyOn(component, 'getAllUsers')

            component.ngOnInit()

            expect(getAllUsersSpy).toHaveBeenCalledWith(expectedFilterObj)
        })
    })

    describe('getAllUsers', () => {
        it('should filter out users who are already learners', () => {
            const filterObj = {
                request: {
                    query: '',
                    filters: {
                        rootOrgId: mockData.orgId,
                        status: 1,
                    },
                    limit: 100,
                    offset: 0,
                },
            }

            component.ngOnInit() // This will call getAllUsers

            expect(usersServiceMock.getAllUsers).toHaveBeenCalledWith(filterObj)
            expect(component.filteredUsers.length).toBe(2) // Both mock users should pass the filter
            expect(component.displayLoader).toBe(false)
        })

        it('should set department name correctly for users with profileDetails', () => {
            component.ngOnInit() // Call getAllUsers

            const userWithProfileDetails = component.filteredUsers.find(
                (user: any) => user.userId === 'user3'
            )

            expect(userWithProfileDetails.deptName).toBe('IT')
        })

        it('should set department name to rootOrgName for users without profileDetails', () => {
            component.ngOnInit() // Call getAllUsers

            const userWithoutProfileDetails = component.filteredUsers.find(
                (user: any) => user.userId === 'user4'
            )

            expect(userWithoutProfileDetails.deptName).toBe('Test Org')
        })
    })

    describe('searchUsers', () => {
        it('should call getAllUsers with the search filter', () => {
            const getAllUsersSpy = jest.spyOn(component, 'getAllUsers')
            const searchText = { value: 'test search' }

            component.searchUsers(searchText)

            const expectedFilterObj = {
                request: {
                    query: 'test search',
                    filters: {
                        rootOrgId: mockData.orgId,
                        status: 1,
                    },
                },
            }

            expect(getAllUsersSpy).toHaveBeenCalledWith(expectedFilterObj)
        })

        it('should call getAllUsers with empty query when searchText is empty', () => {
            const getAllUsersSpy = jest.spyOn(component, 'getAllUsers')
            const searchText = { value: '' }

            component.searchUsers(searchText)

            const expectedFilterObj = {
                request: {
                    query: '',
                    filters: {
                        rootOrgId: mockData.orgId,
                        status: 1,
                    },
                },
            }

            expect(getAllUsersSpy).toHaveBeenCalledWith(expectedFilterObj)
        })
    })

    describe('getUsersCount', () => {
        it('should fetch and calculate user counts correctly', async () => {
            const result = await component.getUsersCount()

            expect(blendedApprovalServiceMock.getSerchRequests).toHaveBeenCalledWith({
                serviceName: ['blendedprogram'],
                applicationStatus: ['SEND_FOR_PC_APPROVAL', 'SEND_FOR_MDO_APPROVAL', 'APPROVED'],
                applicationIds: [mockData.applicationId],
                limit: 100,
                offset: 0,
            })

            expect(result).toEqual({
                enrolled: 0,
                totalApplied: 2, // Based on the mock data length
                rejected: 0,
            })
        })

        it('should handle errors in getSerchRequests', async () => {
            blendedApprovalServiceMock.getSerchRequests.mockReturnValue(
                of(Promise.reject('Error'))
            )

            const result = await component.getUsersCount()

            expect(result).toEqual({
                enrolled: 0,
                totalApplied: 0,
                rejected: 0,
            })
        })
    })

    describe('closeDiaogBox', () => {
        it('should close the dialog with "close" message', () => {
            component.closeDiaogBox()

            expect(dialogRefMock.close).toHaveBeenCalledWith('close')
        })
    })


    describe('openSnackbar', () => {
        it('should open snackbar with given message and default duration', () => {
            const message = 'Test message';

            (component as any).openSnackbar(message)

            expect(snackBarMock.open).toHaveBeenCalledWith(message, 'X', {
                duration: 5000,
            })
        })

        it('should open snackbar with given message and custom duration', () => {
            const message = 'Test message'
            const duration = 3000;

            (component as any).openSnackbar(message, duration)

            expect(snackBarMock.open).toHaveBeenCalledWith(message, 'X', {
                duration,
            })
        })
    })
})