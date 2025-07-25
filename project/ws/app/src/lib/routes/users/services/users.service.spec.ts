import { UsersService } from './users.service'
import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import * as _ from 'lodash'

// Mock lodash
jest.mock('lodash', () => ({
    get: jest.fn()
}))

describe('UsersService', () => {
    let service: UsersService
    let httpClientMock: jest.Mocked<HttpClient>
    let mockGet: jest.MockedFunction<typeof _.get>

    beforeEach(() => {
        // Create mock HttpClient
        httpClientMock = {
            get: jest.fn(),
            post: jest.fn(),
            patch: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            head: jest.fn(),
            options: jest.fn(),
            request: jest.fn()
        } as any

        mockGet = _.get as jest.MockedFunction<typeof _.get>

        // Create service instance with mocked dependencies
        service = new UsersService(httpClientMock)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getAllUsers', () => {
        it('should get all users with filter and return mapped response', (done) => {
            const mockFilter = { status: 1 }
            const mockResponse = { result: { response: [{ id: '1', name: 'John' }] } }
            const expectedResult = [{ id: '1', name: 'John' }]

            httpClientMock.post.mockReturnValue(of(mockResponse))
            mockGet.mockReturnValue(expectedResult)

            service.getAllUsers(mockFilter).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', mockFilter)
                expect(mockGet).toHaveBeenCalledWith(mockResponse, 'result.response')
                expect(result).toEqual(expectedResult)
                done()
            })
        })

        it('should handle error when getAllUsers fails', (done) => {
            const mockFilter = { status: 1 }
            const error = new Error('HTTP Error')

            httpClientMock.post.mockReturnValue(throwError(error))

            service.getAllUsers(mockFilter).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('getAllUsersV3', () => {
        it('should get all users V3 with filter and return mapped response', (done) => {
            const mockFilter = { status: 1 }
            const mockResponse = { result: { response: [{ id: '1', name: 'Jane' }] } }
            const expectedResult = [{ id: '1', name: 'Jane' }]

            httpClientMock.post.mockReturnValue(of(mockResponse))
            mockGet.mockReturnValue(expectedResult)

            service.getAllUsersV3(mockFilter).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v3/search', mockFilter)
                expect(mockGet).toHaveBeenCalledWith(mockResponse, 'result.response')
                expect(result).toEqual(expectedResult)
                done()
            })
        })
    })

    describe('getMyDepartment', () => {
        it('should get my department', (done) => {
            const mockResponse = { department: 'IT' }

            httpClientMock.get.mockReturnValue(of(mockResponse))

            service.getMyDepartment().subscribe(result => {
                expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/mydepartment?allUsers=true')
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('createUser', () => {
        it('should create a user', (done) => {
            const mockRequest = { name: 'John Doe', email: 'john@example.com' }
            const mockResponse = { success: true }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.createUser(mockRequest).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('apis/protected/v8/user/profileDetails/createUser', mockRequest)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('getUserById', () => {
        it('should get user by id when userid is provided', (done) => {
            const userId = '123'
            const mockResponse = { result: { response: { id: '123', name: 'John' } } }
            const expectedResult = { id: '123', name: 'John' }

            httpClientMock.get.mockReturnValue(of(mockResponse))
            mockGet.mockReturnValue(expectedResult)

            service.getUserById(userId).subscribe(result => {
                expect(httpClientMock.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/123')
                expect(mockGet).toHaveBeenCalledWith(mockResponse, 'result.response')
                expect(result).toEqual(expectedResult)
                done()
            })
        })

        it('should get current user when userid is not provided', (done) => {
            const mockResponse = { result: { response: { id: 'current', name: 'Current User' } } }
            const expectedResult = { id: 'current', name: 'Current User' }

            httpClientMock.get.mockReturnValue(of(mockResponse))
            mockGet.mockReturnValue(expectedResult)

            service.getUserById('').subscribe(result => {
                expect(httpClientMock.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read')
                expect(mockGet).toHaveBeenCalledWith(mockResponse, 'result.response')
                expect(result).toEqual(expectedResult)
                done()
            })
        })
    })

    describe('createUserById', () => {
        it('should create user by id', (done) => {
            const id = '123'
            const mockRequest = { name: 'John Doe' }
            const mockResponse = { success: true }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.createUserById(id, mockRequest).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/protected/v8/user/profileRegistry/createUserRegistryV2/123', mockRequest)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('addUserToDepartment', () => {
        it('should add user to department', (done) => {
            const mockRequest = { userId: '123', departmentId: '456' }
            const mockResponse = { success: true }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.addUserToDepartment(mockRequest).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/private/v1/assign/role', mockRequest)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('getWfHistoryByAppId', () => {
        it('should get workflow history by app id', (done) => {
            const appId = 'app123'
            const mockResponse = { history: [] }

            httpClientMock.get.mockReturnValue(of(mockResponse))

            service.getWfHistoryByAppId(appId).subscribe(result => {
                expect(httpClientMock.get).toHaveBeenCalledWith('apis/protected/v8/workflowhandler/historyByApplicationId/app123')
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('onSearchUserByEmail', () => {
        it('should search user by email', (done) => {
            const email = 'test@example.com'
            const mockRequest = { query: 'search' }
            const mockResponse = { users: [] }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.onSearchUserByEmail(email, mockRequest).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('apis/protected/v8/user/autocomplete/department/test@example.com', mockRequest)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('User Block/Unblock Operations', () => {
        describe('blockUser', () => {
            it('should block user', (done) => {
                const mockUser = { userId: '123' }
                const mockResponse = { success: true }

                httpClientMock.patch.mockReturnValue(of(mockResponse))

                service.blockUser(mockUser).subscribe(result => {
                    expect(httpClientMock.patch).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/deptAction/userrole/', mockUser)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('deActiveUser', () => {
            it('should deactivate user', (done) => {
                const mockUser = { userId: '123' }
                const mockResponse = { success: true }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.deActiveUser(mockUser).subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('apis/proxies/v8/user/v1/block/', mockUser)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('activeUser', () => {
            it('should activate user', (done) => {
                const mockUser = { userId: '123' }
                const mockResponse = { success: true }

                httpClientMock.patch.mockReturnValue(of(mockResponse))

                service.activeUser(mockUser).subscribe(result => {
                    expect(httpClientMock.patch).toHaveBeenCalledWith('apis/proxies/v8/user/v1/unblock/', mockUser)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('newBlockUser', () => {
            it('should block user with new API', (done) => {
                const loggedInUser = 'admin123'
                const userId = 'user456'
                const expectedRequest = {
                    request: {
                        userId: 'user456',
                        requestedBy: 'admin123'
                    }
                }
                const mockResponse = { success: true }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.newBlockUser(loggedInUser, userId).subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/block', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('newUnBlockUser', () => {
            it('should unblock user with new API', (done) => {
                const loggedInUser = 'admin123'
                const userId = 'user456'
                const expectedRequest = {
                    request: {
                        userId: 'user456',
                        requestedBy: 'admin123'
                    }
                }
                const mockResponse = { success: true }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.newUnBlockUser(loggedInUser, userId).subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/unblock', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })
    })

    describe('getAllKongUsers', () => {
        it('should get all kong users', (done) => {
            const mockRequest = { request: { filters: {}, limit: 20 } }
            const mockResponse = { users: [] }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.getAllKongUsers(mockRequest).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', mockRequest)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('getAllRoleUsers', () => {
        it('should get role users count', (done) => {
            const depId = 'dept123'
            const role = 'admin'
            const mockResponse = { result: { response: { count: 5 } } }
            const expectedRequest = {
                request: {
                    filters: {
                        rootOrgId: 'dept123',
                        status: 1,
                        'organisations.roles': ['admin']
                    },
                    limit: 1
                }
            }

            httpClientMock.post.mockReturnValue(of(mockResponse))
            mockGet.mockReturnValue(5)

            service.getAllRoleUsers(depId, role).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', expectedRequest)
                expect(mockGet).toHaveBeenCalledWith(mockResponse, 'result.response.count')
                expect(result).toEqual({ role: 'admin', count: 5 })
                done()
            })
        })

        it('should retry once on failure', (done) => {
            const depId = 'dept123'
            const role = 'admin'
            const mockResponse = { result: { response: { count: 3 } } }

            // First call fails, second succeeds
            httpClientMock.post
                .mockReturnValueOnce(throwError(new Error('Network error')))
                .mockReturnValueOnce(of(mockResponse))

            mockGet.mockReturnValue(3)

            service.getAllRoleUsers(depId, role).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledTimes(2)
                expect(result).toEqual({ role: 'admin', count: 3 })
                done()
            })
        })
    })

    describe('getTotalRoleUsers', () => {
        it('should get total role users', (done) => {
            const depId = 'dept123'
            const role = 'user'
            const mockResponse = { result: { response: { users: [], count: 10 } } }
            const expectedRequest = {
                request: {
                    filters: {
                        rootOrgId: 'dept123',
                        'organisations.roles': ['user']
                    }
                }
            }

            httpClientMock.post.mockReturnValue(of(mockResponse))
            mockGet.mockReturnValue({ users: [], count: 10 })

            service.getTotalRoleUsers(depId, role).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', expectedRequest)
                expect(mockGet).toHaveBeenCalledWith(mockResponse, 'result.response')
                expect(result).toEqual({ role: 'user', count: { users: [], count: 10 } })
                done()
            })
        })
    })

    describe('searchUserByenter', () => {
        it('should search user by entered value', (done) => {
            const value = 'john'
            const rootOrgId = 'org123'
            const expectedRequest = {
                request: {
                    query: 'john',
                    filters: {
                        rootOrgId: 'org123'
                    }
                }
            }
            const mockResponse = { users: [] }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.searchUserByenter(value, rootOrgId).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', expectedRequest)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('checkForUserReport', () => {
        it('should check for user report', (done) => {
            const url = 'https://example.com/report'
            const mockResponse = { report: 'data' }

            httpClientMock.get.mockReturnValue(of(mockResponse))

            service.checkForUserReport(url).subscribe(result => {
                expect(httpClientMock.get).toHaveBeenCalledWith(url)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('getDesignations', () => {
        it('should get designations', (done) => {
            const mockResponse = { designations: [] }

            httpClientMock.get.mockReturnValue(of(mockResponse))

            service.getDesignations().subscribe(result => {
                expect(httpClientMock.get).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/positions')
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('updateUserDetails', () => {
        it('should update user details', (done) => {
            const mockRequest = { userId: '123', name: 'Updated Name' }
            const mockResponse = { success: true }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.updateUserDetails(mockRequest).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/admin/extPatch', mockRequest)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('OTP Operations', () => {
        describe('sendOtp', () => {
            it('should send OTP', (done) => {
                const value = 'test@example.com'
                const type = 'email'
                const expectedRequest = {
                    request: {
                        type: 'email',
                        key: 'test@example.com'
                    }
                }
                const mockResponse = { success: true }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.sendOtp(value, type).subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/generate', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('resendOtp', () => {
            it('should resend OTP', (done) => {
                const value = '1234567890'
                const type = 'phone'
                const expectedRequest = {
                    request: {
                        type: 'phone',
                        key: '1234567890'
                    }
                }
                const mockResponse = { success: true }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.resendOtp(value, type).subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/generate', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('verifyOTP', () => {
            it('should verify OTP', (done) => {
                const otp = 123456
                const value = 'test@example.com'
                const type = 'email'
                const expectedRequest = {
                    request: {
                        otp: 123456,
                        type: 'email',
                        key: 'test@example.com'
                    }
                }
                const mockResponse = { verified: true }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.verifyOTP(otp, value, type).subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/verify', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })
    })

    describe('Master Data Operations', () => {
        describe('getMasterLanguages', () => {
            it('should get master languages', (done) => {
                const mockResponse = { languages: [] }

                httpClientMock.get.mockReturnValue(of(mockResponse))

                service.getMasterLanguages().subscribe(result => {
                    expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/profileRegistry/getMasterLanguages')
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('getGroups', () => {
            it('should get groups', (done) => {
                const mockResponse = { groups: [] }

                httpClientMock.get.mockReturnValue(of(mockResponse))

                service.getGroups().subscribe(result => {
                    expect(httpClientMock.get).toHaveBeenCalledWith('/api/user/v1/groups')
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('getMasterNationlity', () => {
            it('should get master nationalities', (done) => {
                const mockResponse = { nationalities: [] }

                httpClientMock.get.mockReturnValue(of(mockResponse))

                service.getMasterNationlity().subscribe(result => {
                    expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/profileRegistry/getMasterNationalities')
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })
    })

    describe('editProfileDetails', () => {
        it('should edit profile details', (done) => {
            const mockData = { name: 'Updated Name', email: 'updated@example.com' }
            const mockResponse = { success: true }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            service.editProfileDetails(mockData).subscribe(result => {
                expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', mockData)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('Approval and Workflow Operations', () => {
        describe('listApprovalPendingFields', () => {
            it('should list approval pending fields', (done) => {
                const expectedRequest = {
                    serviceName: 'profile',
                    applicationStatus: 'SEND_FOR_APPROVAL'
                }
                const mockResponse = { fields: [] }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.listApprovalPendingFields().subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/v2/userWFApplicationFieldsSearch', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('fetchApprovalPendingFields', () => {
            it('should fetch approval pending fields', (done) => {
                const expectedRequest = {
                    serviceName: 'profile',
                    applicationStatus: 'SEND_FOR_APPROVAL'
                }
                const mockResponse = { fields: [] }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.fetchApprovalPendingFields().subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/v2/userWFApplicationFieldsSearch', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('listRejectedFields', () => {
            it('should list rejected fields', (done) => {
                const expectedRequest = {
                    serviceName: 'profile',
                    applicationStatus: 'REJECTED'
                }
                const mockResponse = { fields: [] }

                httpClientMock.post.mockReturnValue(of(mockResponse))

                service.listRejectedFields().subscribe(result => {
                    expect(httpClientMock.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/v2/userWFApplicationFieldsSearch', expectedRequest)
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })

        describe('fetchPendingRequests', () => {
            it('should fetch pending requests', (done) => {
                const mockResponse = { requests: [] }

                httpClientMock.get.mockReturnValue(of(mockResponse))

                service.fetchPendingRequests().subscribe(result => {
                    expect(httpClientMock.get).toHaveBeenCalledWith('/apis/proxies/v8/workflow/admin/pending/request')
                    expect(result).toEqual(mockResponse)
                    done()
                })
            })
        })
    })

    describe('Subject Properties', () => {
        it('should have Subject properties initialized', () => {
            expect(service.handleContentPageChange).toBeDefined()
            expect(service.filterToggle).toBeDefined()
            expect(service.clearFilter).toBeDefined()
            expect(service.getFilterDataObject).toBeDefined()
            expect(service.mentorList$).toBeDefined()
        })

        it('should have TOTAL_USERS_LIMIT constant', () => {
            expect(service.TOTAL_USERS_LIMIT).toBe(10000)
        })
    })

    describe('deleteUser', () => {
        it('should delete user', (done) => {
            const mockUser = { userId: '123' }
            const mockResponse = { success: true }

            httpClientMock.patch.mockReturnValue(of(mockResponse))

            service.deleteUser(mockUser).subscribe(result => {
                expect(httpClientMock.patch).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/deptAction/userrole/', mockUser)
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })
})