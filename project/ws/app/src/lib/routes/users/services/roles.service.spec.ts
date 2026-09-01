
import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { RolesService } from './roles.service'

describe('RolesService', () => {
    let service: RolesService
    let mockHttp: jest.Mocked<HttpClient>

    const ENDPOINT = '/apis/proxies/v8/data/v1/system/settings/get/orgTypeList'

    beforeEach(() => {
        mockHttp = {
            get: jest.fn()
        } as any

        service = new RolesService(mockHttp)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should create an instance of service', () => {
        expect(service).toBeTruthy()
    })

    describe('getAllRoles', () => {
        it('should call GET request with the correct endpoint', () => {
            const mockResponse = { result: { response: { value: ['Role1', 'Role2'] } } }
            mockHttp.get.mockReturnValue(of(mockResponse))

            service.getAllRoles().subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(mockHttp.get).toHaveBeenCalledWith(ENDPOINT)
            expect(mockHttp.get).toHaveBeenCalledTimes(1)
        })

        it('should return an observable', () => {
            mockHttp.get.mockReturnValue(of({ result: {} }))

            const result = service.getAllRoles()

            expect(result.subscribe).toBeDefined()
        })

        it('should propagate errors from the HTTP call', () => {
            const error = new Error('Network error')
            mockHttp.get.mockReturnValue(throwError(error))

            let thrownError: any
            service.getAllRoles().subscribe({
                error: err => { thrownError = err }
            })

            expect(thrownError).toBe(error)
        })

        it('should handle empty response', () => {
            mockHttp.get.mockReturnValue(of(null))

            let result: any
            service.getAllRoles().subscribe(res => { result = res })

            expect(result).toBeNull()
        })
    })
})
