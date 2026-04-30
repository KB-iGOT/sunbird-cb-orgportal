import { WorkallocationService } from './workallocation.service'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'

describe('WorkallocationService', () => {
    let service: WorkallocationService
    let httpClient: jest.Mocked<HttpClient>
    let configService: jest.Mocked<ConfigurationsService>

    beforeEach(() => {
        jest.clearAllMocks()
        httpClient = { get: jest.fn(), post: jest.fn() } as unknown as jest.Mocked<HttpClient>
        configService = {
            userProfile: { departmentName: 'Test Department' },
            userProfileV2: { departmentName: 'Test Department V2' },
        } as jest.Mocked<ConfigurationsService>
        service = new WorkallocationService(httpClient, configService)
    })

    describe('getTime', () => {
        it('should format date and time correctly', () => {
            const dateString = 1640995200000 // 2022-01-01 00:00:00 UTC
            const result = service.getTime(dateString)

            expect(result).toContain('2022-01-01')
            expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/)
        })

        it('should handle different timestamps', () => {
            const dateString = 1609459200000 // 2021-01-01 00:00:00 UTC
            const result = service.getTime(dateString)

            expect(result).toContain('2021-01-01')
            expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/)
        })
    })

    describe('getUsers', () => {
        it('should make POST request to correct endpoint with request data', () => {
            const mockRequest = { search: 'test user' }
            const mockResponse = { users: [] }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.getUsers(mockRequest).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/userSearch',
                mockRequest
            )
        })
    })

    describe('getAllUsers', () => {
        it('should make GET request to correct endpoint', () => {
            const mockResponse = { users: [] }

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getAllUsers().subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(httpClient.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read')
        })
    })

    describe('fetchWAT', () => {
        it('should make POST request with correct parameters using userProfile', () => {
            const currentStatus = 'ACTIVE'
            const mockResponse = { workOrders: [] }
            const expectedRequest = {
                status: currentStatus,
                departmentName: 'Test Department',
                pageNo: 0,
                pageSize: 100,
            }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.fetchWAT(currentStatus).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/getWorkOrders',
                expectedRequest
            )
        })

        it('should use userProfileV2 when userProfile is not available', () => {
            configService.userProfile = null
            const currentStatus = 'INACTIVE'
            const expectedRequest = {
                status: currentStatus,
                departmentName: 'Test Department V2',
                pageNo: 0,
                pageSize: 100,
            }

            httpClient.post.mockReturnValue(of({}))

            service.fetchWAT(currentStatus)

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/getWorkOrders',
                expectedRequest
            )
        })

        it('should use empty string when both userProfile and userProfileV2 are not available', () => {
            configService.userProfile = null
            configService.userProfileV2 = null
            const currentStatus = 'PENDING'
            const expectedRequest = {
                status: currentStatus,
                departmentName: '',
                pageNo: 0,
                pageSize: 100,
            }

            httpClient.post.mockReturnValue(of({}))

            service.fetchWAT(currentStatus)

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/getWorkOrders',
                expectedRequest
            )
        })
    })

    describe('addWAT', () => {
        it('should make POST request with correct parameters', () => {
            const departmentName = 'Engineering'
            const deptId = 123
            const mockResponse = { success: true }
            const expectedRequest = {
                deptId: 123,
                name: 'Work order - Engineering',
                deptName: 'Test Department',
            }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.addWAT(departmentName, deptId).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/add/workorder',
                expectedRequest
            )
        })

        it('should handle empty department name', () => {
            const departmentName = null
            const deptId = 456
            const expectedRequest = {
                deptId: 456,
                name: 'Work order - null',
                deptName: 'Test Department',
            }

            httpClient.post.mockReturnValue(of({}))

            service.addWAT(departmentName, deptId)

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/add/workorder',
                expectedRequest
            )
        })

        it('should handle missing userProfile', () => {
            configService.userProfile = null
            const departmentName = 'HR'
            const deptId = 789
            const expectedRequest = {
                deptId: 789,
                name: 'Work order - HR',
                deptName: '',
            }

            httpClient.post.mockReturnValue(of({}))

            service.addWAT(departmentName, deptId)

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/add/workorder',
                expectedRequest
            )
        })
    })

    describe('copyWAT', () => {
        it('should make POST request with correct parameters', () => {
            const workOrderId = 'WO123'
            const departmentName = 'Finance'
            const mockResponse = { copied: true }
            const expectedRequest = {
                id: 'WO123',
                name: 'Work order - Finance',
            }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.copyWAT(workOrderId, departmentName).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/copy/workOrder',
                expectedRequest
            )
        })

        it('should handle empty department name', () => {
            const workOrderId = 'WO456'
            const departmentName = null
            const expectedRequest = {
                id: 'WO456',
                name: 'Work order - null',
            }

            httpClient.post.mockReturnValue(of({}))

            service.copyWAT(workOrderId, departmentName)

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/copy/workOrder',
                expectedRequest
            )
        })
    })

    describe('fetchAllWATRequestBySearch', () => {
        it('should make POST request with search query and status', () => {
            const queryString = 'search term'
            const currentStatus = 'COMPLETED'
            const mockResponse = { results: [] }
            const expectedRequest = {
                status: currentStatus,
                departmentName: 'Test Department',
                query: queryString,
                pageNo: 0,
                pageSize: 100,
            }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.fetchAllWATRequestBySearch(queryString, currentStatus).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/getWorkOrders',
                expectedRequest
            )
        })

        it('should handle missing userProfile', () => {
            configService.userProfile = null
            const queryString = 'test query'
            const currentStatus = 'DRAFT'
            const expectedRequest = {
                status: currentStatus,
                departmentName: '',
                query: queryString,
                pageNo: 0,
                pageSize: 100,
            }

            httpClient.post.mockReturnValue(of({}))

            service.fetchAllWATRequestBySearch(queryString, currentStatus)

            expect(httpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/getWorkOrders',
                expectedRequest
            )
        })
    })

    describe('fetchUserByWID', () => {
        it('should make GET request with WID parameter', () => {
            const wid = 'USER123'
            const mockResponse = { user: { id: 'USER123' } }

            httpClient.get.mockReturnValue(of(mockResponse))

            service.fetchUserByWID(wid).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(httpClient.get).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/getUserBasicInfo/USER123'
            )
        })
    })

    describe('getPDF', () => {
        it('should make GET request with blob response type', () => {
            const val = 'PDF123'
            const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' })

            httpClient.get.mockReturnValue(of(mockBlob))

            service.getPDF(val).subscribe(result => {
                expect(result).toEqual(mockBlob)
            })

            expect(httpClient.get).toHaveBeenCalledWith(
                '/apis/protected/v8/workallocation/getWOPdf/PDF123',
                { responseType: 'blob' as 'json' }
            )
        })
    })

    describe('Service initialization', () => {
        it('should create service instance', () => {
            expect(service).toBeDefined()
            expect(service).toBeInstanceOf(WorkallocationService)
        })
    })

    describe('API endpoints constants', () => {
        it('should have correct API endpoints', () => {
            // Test that the service uses the expected endpoints by checking the calls made
            service.getUsers({})
            service.getAllUsers()
            service.fetchWAT('test')
            service.addWAT('test', 1)
            service.copyWAT('test', 'test')
            service.fetchUserByWID('test')
            service.getPDF('test')

            const postCalls = httpClient.post.mock.calls
            const getCalls = httpClient.get.mock.calls

            expect(postCalls.some(call => call[0].includes('/workallocation/userSearch'))).toBeTruthy()
            expect(postCalls.some(call => call[0].includes('/workallocation/getWorkOrders'))).toBeTruthy()
            expect(postCalls.some(call => call[0].includes('/workallocation/add/workorder'))).toBeTruthy()
            expect(postCalls.some(call => call[0].includes('/workallocation/copy/workOrder'))).toBeTruthy()
            expect(getCalls.some(call => call[0].includes('/api/user/v2/read'))).toBeTruthy()
            expect(getCalls.some(call => call[0].includes('/workallocation/getUserBasicInfo/'))).toBeTruthy()
            expect(getCalls.some(call => call[0].includes('/workallocation/getWOPdf/'))).toBeTruthy()
        })
    })
})