
import { RolesAccessService } from './roles-access.service'
import { of } from 'rxjs'

describe('RolesAccessService', () => {
    let service: RolesAccessService
    let mockHttp: any

    beforeEach(() => {
        jest.clearAllMocks()
        mockHttp = { get: jest.fn() }
        service = new RolesAccessService(mockHttp)
    })

    it('should create a instance of component', () => {
        expect(service).toBeTruthy()
    })

    describe('getRoles()', () => {
        it('should GET from the correct endpoint', () => {
            mockHttp.get.mockReturnValue(of({ result: [] }))
            service.getRoles().subscribe()
            expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/user/roles/rolesv2/usercount')
        })

        it('should return the observable response', (done) => {
            const mockResponse = { result: [{ role: 'admin' }] }
            mockHttp.get.mockReturnValue(of(mockResponse))
            service.getRoles().subscribe(res => {
                expect(res).toEqual(mockResponse)
                done()
            })
        })
    })
})