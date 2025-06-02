import { DownloadReportService } from './download-report.service'
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { of, throwError } from 'rxjs'

// Mock HttpClient
const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn()
}

// Mock ConfigurationsService
const mockConfigurationsService = {
    sitePath: 'http://localhost:3000'
}

describe('DownloadReportService', () => {
    let service: DownloadReportService
    let httpClient: jest.Mocked<HttpClient>
    let configService: jest.Mocked<ConfigurationsService>

    const API_END_POINTS = {
        GET_REPORTS_INFO: `/apis/proxies/v8/operationalreports/v1/reportInfo`,
        DOWNLOAD_REPORTS: `/apis/proxies/v8/operationalreports/download`,
        GET_ADMINS: `/apis/proxies/v8/user/v1/search`,
        GET_ADMINS_ACCESSS_DETAILS: `/apis/proxies/v8/operationalreports/`,
        UPDATE_ACCESS: `/apis/proxies/v8/operationalreports/admin/grantaccess`,
        SEARCH_ORG: '/api/org/ext/v2/signup/search',
        GET_ORGS_OF_DEPT: '/apis/public/v8/org/v2/list',
        DOWNLOAD_OPS_REPORTS: '/apis/proxies/v8/operationalreports/v2/download',
        GET_DEPARTMENT_TYPE: 'apis/proxies/v8/data/v1/system/settings/get/orgTypeConfig',
    }

    beforeEach(() => {
        httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>
        configService = mockConfigurationsService as jest.Mocked<ConfigurationsService>
        service = new DownloadReportService(httpClient, configService)

        // Clear all mocks before each test
        jest.clearAllMocks()
    })

    describe('constructor', () => {
        it('should create service with dependencies', () => {
            expect(service).toBeDefined()
            expect(service.baseUrl).toBe('http://localhost:3000')
        })
    })

    describe('getReportInfo', () => {
        it('should fetch report info and return result', (done) => {
            const mockResponse = {
                result: {
                    reports: ['report1', 'report2'],
                    count: 2
                }
            }

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getReportInfo().subscribe(result => {
                expect(result).toEqual(mockResponse.result)
                expect(httpClient.get).toHaveBeenCalledWith(API_END_POINTS.GET_REPORTS_INFO)
                done()
            })
        })

        it('should handle empty result', (done) => {
            const mockResponse = {}
            httpClient.get.mockReturnValue(of(mockResponse))

            service.getReportInfo().subscribe(result => {
                expect(result).toBeUndefined()
                done()
            })
        })

        it('should handle HTTP error', (done) => {
            const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            httpClient.get.mockReturnValue(throwError(() => error))

            service.getReportInfo().subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('downloadReports', () => {
        it('should download reports as blob', (done) => {
            const mockBlob = new Blob(['test data'], { type: 'application/octet-stream' })
            const mockResponse = new HttpResponse({ body: mockBlob })

            httpClient.get.mockReturnValue(of(mockResponse))

            service.downloadReports().subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(API_END_POINTS.DOWNLOAD_REPORTS, {
                    observe: 'response',
                    responseType: 'blob'
                })
                done()
            })
        })

        it('should handle download error', (done) => {
            const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' })
            httpClient.get.mockReturnValue(throwError(() => error))

            service.downloadReports().subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('getAdminsList', () => {
        it('should get admins list with filter', (done) => {
            const filter = { name: 'admin' }
            const mockResponse = {
                result: {
                    response: {
                        content: [{ id: '1', name: 'Admin 1' }],
                        count: 1
                    }
                }
            }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.getAdminsList(filter).subscribe(result => {
                expect(result).toEqual(mockResponse.result.response)
                expect(httpClient.post).toHaveBeenCalledWith(API_END_POINTS.GET_ADMINS, filter)
                done()
            })
        })

        it('should handle empty response', (done) => {
            const filter = { name: 'admin' }
            const mockResponse = {}

            httpClient.post.mockReturnValue(of(mockResponse))

            service.getAdminsList(filter).subscribe(result => {
                expect(result).toBeUndefined()
                done()
            })
        })
    })

    describe('getAccessDetails', () => {
        it('should get access details for endpoint', (done) => {
            const endpoint = 'test-endpoint'
            const mockResponse = {
                result: {
                    response: {
                        access: true,
                        permissions: ['read', 'write']
                    }
                }
            }

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getAccessDetails(endpoint).subscribe(result => {
                expect(result).toEqual(mockResponse.result.response)
                expect(httpClient.get).toHaveBeenCalledWith(`${API_END_POINTS.GET_ADMINS_ACCESSS_DETAILS}${endpoint}`)
                done()
            })
        })

        it('should handle access details error', (done) => {
            const endpoint = 'test-endpoint'
            const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' })
            httpClient.get.mockReturnValue(throwError(() => error))

            service.getAccessDetails(endpoint).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('updateAccessToReports', () => {
        it('should update access to reports', (done) => {
            const formData = { userId: '123', access: true }
            const mockResponse = { success: true }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.updateAccessToReports(formData).subscribe(result => {
                expect(result).toEqual(mockResponse)
                expect(httpClient.post).toHaveBeenCalledWith(API_END_POINTS.UPDATE_ACCESS, formData)
                done()
            })
        })

        it('should handle update access error', (done) => {
            const formData = { userId: '123', access: true }
            const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' })
            httpClient.post.mockReturnValue(throwError(() => error))

            service.updateAccessToReports(formData).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('searchOrgs', () => {
        it('should search organizations with filters', (done) => {
            const filterReq = { orgType: 'department' }
            const expectedRequest = {
                request: {
                    filters: filterReq,
                    limit: 10,
                },
            }
            const mockResponse = { organizations: [] }

            httpClient.post.mockReturnValue(of(mockResponse))

            service.searchOrgs(filterReq).subscribe(result => {
                expect(result).toEqual(mockResponse)
                expect(httpClient.post).toHaveBeenCalledWith(API_END_POINTS.SEARCH_ORG, expectedRequest)
                done()
            })
        })

        it('should handle search organizations error', (done) => {
            const filterReq = { orgType: 'department' }
            const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            httpClient.post.mockReturnValue(throwError(() => error))

            service.searchOrgs(filterReq).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('getOrgsOfDepartment', () => {
        it('should get organizations of department by mapId', (done) => {
            const mapId = 'dept-123'
            const mockResponse = { organizations: ['org1', 'org2'] }

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getOrgsOfDepartment(mapId).subscribe(result => {
                expect(result).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(`${API_END_POINTS.GET_ORGS_OF_DEPT}/${mapId}`)
                done()
            })
        })

        it('should handle get organizations error', (done) => {
            const mapId = 'dept-123'
            const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' })
            httpClient.get.mockReturnValue(throwError(() => error))

            service.getOrgsOfDepartment(mapId).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('downloadReportsForEachOrgId', () => {
        it('should download reports for multiple organizations', (done) => {
            const rootOrgId = 'root-123'
            const data = [
                { sbOrgId: 'org-1', name: 'Org 1' },
                { sbOrgId: 'org-2', name: 'Org 2' }
            ]
            const mockBlob1 = new Blob(['data1'], { type: 'application/octet-stream' })
            const mockBlob2 = new Blob(['data2'], { type: 'application/octet-stream' })
            const mockResponse1 = new HttpResponse({ body: mockBlob1 })
            const mockResponse2 = new HttpResponse({ body: mockBlob2 })

            httpClient.post
                .mockReturnValueOnce(of(mockResponse1))
                .mockReturnValueOnce(of(mockResponse2))

            service.downloadReportsForEachOrgId(rootOrgId, data).subscribe(responses => {
                expect(responses).toHaveLength(2)
                expect(responses[0]).toEqual(mockResponse1)
                expect(responses[1]).toEqual(mockResponse2)

                expect(httpClient.post).toHaveBeenCalledTimes(2)
                expect(httpClient.post).toHaveBeenNthCalledWith(1,
                    `${API_END_POINTS.DOWNLOAD_OPS_REPORTS}/${rootOrgId}`,
                    { request: { childId: ['org-1'] } },
                    { responseType: 'blob', observe: 'response' }
                )
                expect(httpClient.post).toHaveBeenNthCalledWith(2,
                    `${API_END_POINTS.DOWNLOAD_OPS_REPORTS}/${rootOrgId}`,
                    { request: { childId: ['org-2'] } },
                    { responseType: 'blob', observe: 'response' }
                )
                done()
            })
        })

        it('should handle root organization (empty childId)', (done) => {
            const rootOrgId = 'root-123'
            const data = [{ sbOrgId: 'root-123', name: 'Root Org' }]
            const mockBlob = new Blob(['data'], { type: 'application/octet-stream' })
            const mockResponse = new HttpResponse({ body: mockBlob })

            httpClient.post.mockReturnValue(of(mockResponse))

            service.downloadReportsForEachOrgId(rootOrgId, data).subscribe(responses => {
                expect(responses).toHaveLength(1)
                expect(httpClient.post).toHaveBeenCalledWith(
                    `${API_END_POINTS.DOWNLOAD_OPS_REPORTS}/${rootOrgId}`,
                    { request: { childId: [] } },
                    { responseType: 'blob', observe: 'response' }
                )
                done()
            })
        })

        it('should filter out items without sbOrgId', (done) => {
            const rootOrgId = 'root-123'
            const data = [
                { sbOrgId: 'org-1', name: 'Org 1' },
                { name: 'Invalid Org' }, // No sbOrgId
                null, // Null item
                { sbOrgId: 'org-2', name: 'Org 2' }
            ]
            const mockBlob1 = new Blob(['data1'], { type: 'application/octet-stream' })
            const mockBlob2 = new Blob(['data2'], { type: 'application/octet-stream' })
            const mockResponse1 = new HttpResponse({ body: mockBlob1 })
            const mockResponse2 = new HttpResponse({ body: mockBlob2 })

            httpClient.post
                .mockReturnValueOnce(of(mockResponse1))
                .mockReturnValueOnce(of(mockResponse2))

            service.downloadReportsForEachOrgId(rootOrgId, data).subscribe(responses => {
                expect(responses).toHaveLength(2) // Only valid items
                expect(httpClient.post).toHaveBeenCalledTimes(2)
                done()
            })
        })

        it('should handle 500 error and return 404 response', (done) => {
            const rootOrgId = 'root-123'
            const data = [{ sbOrgId: 'org-1', name: 'Org 1' }]
            const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })

            httpClient.post.mockReturnValue(throwError(() => error))

            service.downloadReportsForEachOrgId(rootOrgId, data).subscribe(responses => {
                expect(responses).toHaveLength(1)
                expect(responses[0]).toBeInstanceOf(HttpResponse)
                expect(responses[0].status).toBe(404)
                expect(responses[0].body).toEqual({ message: 'Report not found for the requested organization' })
                done()
            })
        })

        it('should handle other HTTP errors', (done) => {
            const rootOrgId = 'root-123'
            const data = [{ sbOrgId: 'org-1', name: 'Org 1' }]
            const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' })

            httpClient.post.mockReturnValue(throwError(() => error))

            service.downloadReportsForEachOrgId(rootOrgId, data).subscribe(responses => {
                expect(responses).toHaveLength(1)
                expect(responses[0]).toBe(error)
                done()
            })
        })

        it('should return empty array when no valid data provided', (done) => {
            const rootOrgId = 'root-123'
            const data: any[] = []

            service.downloadReportsForEachOrgId(rootOrgId, data).subscribe(responses => {
                expect(responses).toEqual([])
                expect(httpClient.post).not.toHaveBeenCalled()
                done()
            })
        })

        it('should return empty array when data contains no valid items', (done) => {
            const rootOrgId = 'root-123'
            const data = [
                { name: 'Invalid Org' }, // No sbOrgId
                null, // Null item
                undefined // Undefined item
            ]

            service.downloadReportsForEachOrgId(rootOrgId, data).subscribe(responses => {
                expect(responses).toEqual([])
                expect(httpClient.post).not.toHaveBeenCalled()
                done()
            })
        })
    })

    describe('getDepartmentType', () => {
        it('should get department type configuration', (done) => {
            const mockResponse = {
                departmentTypes: ['government', 'private', 'ngo']
            }

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getDepartmentType().subscribe(result => {
                expect(result).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(API_END_POINTS.GET_DEPARTMENT_TYPE)
                done()
            })
        })

        it('should handle get department type error', (done) => {
            const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            httpClient.get.mockReturnValue(throwError(() => error))

            service.getDepartmentType().subscribe({
                next: () => fail('Should have failed'),
                error: (err) => {
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('Service Properties', () => {
        it('should have correct baseUrl from configuration service', () => {
            expect(service.baseUrl).toBe('http://localhost:3000')
        })
    })
})