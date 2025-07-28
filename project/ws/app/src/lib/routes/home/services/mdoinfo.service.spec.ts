import { of } from 'rxjs'
import { MdoInfoService } from './mdoinfo.service'

// Mock lodash
jest.mock('lodash', () => ({
    get: jest.fn()
}))

describe('MdoInfoService', () => {
    let service: MdoInfoService
    let mockHttpClient: any
    let mockLodash: any

    beforeEach(() => {
        // Create mock HttpClient
        mockHttpClient = {
            post: jest.fn(),
            get: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn()
        }

        // Get mock lodash
        mockLodash = require('lodash')

        // Create service instance
        service = new MdoInfoService(mockHttpClient)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getAllUsers', () => {
        it('should make POST request to correct endpoint and map response using lodash', () => {
            const mockFilter = { name: 'test' }
            const mockResponse = { result: { response: 'mapped data' } }
            const expectedMappedData = 'mapped data'

            mockHttpClient.post.mockReturnValue(of(mockResponse))
            mockLodash.get.mockReturnValue(expectedMappedData)

            service.getAllUsers(mockFilter).subscribe((result: any) => {
                expect(result).toBe(expectedMappedData)
            })

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/proxies/v8/user/v1/search',
                mockFilter
            )
            expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.response')
        })

        it('should handle empty response in getAllUsers', () => {
            const mockFilter = { name: 'test' }
            const mockResponse = {}

            mockHttpClient.post.mockReturnValue(of(mockResponse))
            mockLodash.get.mockReturnValue(undefined)

            service.getAllUsers(mockFilter).subscribe((result: any) => {
                expect(result).toBeUndefined()
            })

            expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.response')
        })
    })

    describe('getDesignations', () => {
        it('should make POST request to correct endpoint', () => {
            const mockRequest = { searchText: 'designation' }
            const mockResponse = { data: 'designations' }

            mockHttpClient.post.mockReturnValue(of(mockResponse))

            service.getDesignations(mockRequest).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/frac/searchNodes',
                mockRequest
            )
        })
    })

    describe('getTeamUsers', () => {
        it('should make POST request to correct endpoint', () => {
            const mockRequest = { team: 'test' }
            const mockResponse = { users: [] }

            mockHttpClient.post.mockReturnValue(of(mockResponse))

            service.getTeamUsers(mockRequest).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/proxies/v8/user/v1/search',
                mockRequest
            )
        })
    })

    describe('assignTeamRole', () => {
        it('should make POST request to correct endpoint', () => {
            const mockRequest = { userId: '123', role: 'admin' }
            const mockResponse = { success: true }

            mockHttpClient.post.mockReturnValue(of(mockResponse))

            service.assignTeamRole(mockRequest).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/proxies/v8/user/private/v1/assign/role',
                mockRequest
            )
        })
    })

    describe('getStaffdetails', () => {
        it('should make GET request with orgId parameter', () => {
            const orgId = 'org123'
            const mockResponse = { staff: [] }

            mockHttpClient.get.mockReturnValue(of(mockResponse))

            service.getStaffdetails(orgId).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.get).toHaveBeenCalledWith(
                '/apis/proxies/v8/staff/position/org123'
            )
        })

        it('should handle null orgId', () => {
            const orgId = null
            const mockResponse = { staff: [] }

            mockHttpClient.get.mockReturnValue(of(mockResponse))

            service.getStaffdetails(orgId).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.get).toHaveBeenCalledWith(
                '/apis/proxies/v8/staff/position/null'
            )
        })
    })

    describe('addStaffdetails', () => {
        it('should make POST request to correct endpoint', () => {
            const mockRequest = { name: 'John Doe', position: 'Manager' }
            const mockResponse = { id: '123' }

            mockHttpClient.post.mockReturnValue(of(mockResponse))

            service.addStaffdetails(mockRequest).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/proxies/v8/staff/position',
                mockRequest
            )
        })
    })

    describe('updateStaffdetails', () => {
        it('should make PATCH request to correct endpoint', () => {
            const mockRequest = { id: '123', name: 'Jane Doe' }
            const mockResponse = { success: true }

            mockHttpClient.patch.mockReturnValue(of(mockResponse))

            service.updateStaffdetails(mockRequest).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.patch).toHaveBeenCalledWith(
                '/apis/proxies/v8/staff/position',
                mockRequest
            )
        })
    })

    describe('deleteStaffdetails', () => {
        it('should make DELETE request with correct URL parameters', () => {
            const id = 'staff123'
            const orgId = 'org456'
            const mockResponse = { success: true }

            mockHttpClient.delete.mockReturnValue(of(mockResponse))

            service.deleteStaffdetails(id, orgId).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.delete).toHaveBeenCalledWith(
                '/apis/proxies/v8/staff/position?orgId=org456&id=staff123'
            )
        })

        it('should handle null parameters in deleteStaffdetails', () => {
            const id = null
            const orgId = null
            const mockResponse = { success: true }

            mockHttpClient.delete.mockReturnValue(of(mockResponse))

            service.deleteStaffdetails(id, orgId).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.delete).toHaveBeenCalledWith(
                '/apis/proxies/v8/staff/position?orgId=null&id=null'
            )
        })
    })

    describe('getBudgetdetails', () => {
        it('should make GET request with orgId and budgetYear parameters', () => {
            const orgId = 'org123'
            const budgetYear = '2024'
            const mockResponse = { budget: {} }

            mockHttpClient.get.mockReturnValue(of(mockResponse))

            service.getBudgetdetails(orgId, budgetYear).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.get).toHaveBeenCalledWith(
                '/apis/proxies/v8/budget/scheme/org123/2024'
            )
        })

        it('should handle null parameters in getBudgetdetails', () => {
            const orgId = null
            const budgetYear = null
            const mockResponse = { budget: {} }

            mockHttpClient.get.mockReturnValue(of(mockResponse))

            service.getBudgetdetails(orgId, budgetYear).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.get).toHaveBeenCalledWith(
                '/apis/proxies/v8/budget/scheme/null/null'
            )
        })
    })

    describe('addBudgetdetails', () => {
        it('should make POST request to correct endpoint', () => {
            const mockRequest = { amount: 1000, year: '2024' }
            const mockResponse = { id: '456' }

            mockHttpClient.post.mockReturnValue(of(mockResponse))

            service.addBudgetdetails(mockRequest).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/proxies/v8/budget/scheme',
                mockRequest
            )
        })
    })

    describe('updateBudgetdetails', () => {
        it('should make PATCH request to correct endpoint', () => {
            const mockRequest = { id: '456', amount: 2000 }
            const mockResponse = { success: true }

            mockHttpClient.patch.mockReturnValue(of(mockResponse))

            service.updateBudgetdetails(mockRequest).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.patch).toHaveBeenCalledWith(
                '/apis/proxies/v8/budget/scheme',
                mockRequest
            )
        })
    })

    describe('deleteBudgetdetails', () => {
        it('should make DELETE request with correct URL parameters', () => {
            const id = 'budget123'
            const orgId = 'org789'
            const mockResponse = { success: true }

            mockHttpClient.delete.mockReturnValue(of(mockResponse))

            service.deleteBudgetdetails(id, orgId).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.delete).toHaveBeenCalledWith(
                '/apis/proxies/v8/budget/scheme?orgId=org789&id=budget123'
            )
        })

        it('should handle null parameters in deleteBudgetdetails', () => {
            const id = null
            const orgId = null
            const mockResponse = { success: true }

            mockHttpClient.delete.mockReturnValue(of(mockResponse))

            service.deleteBudgetdetails(id, orgId).subscribe((result: any) => {
                expect(result).toBe(mockResponse)
            })

            expect(mockHttpClient.delete).toHaveBeenCalledWith(
                '/apis/proxies/v8/budget/scheme?orgId=null&id=null'
            )
        })
    })

    describe('Service instantiation', () => {
        it('should create service instance', () => {
            expect(service).toBeDefined()
            expect(service).toBeInstanceOf(MdoInfoService)
        })
    })
})