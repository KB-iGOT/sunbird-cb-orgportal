
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { TrainingPlanDashboardService } from './training-plan-dashboard.service'


describe('TrainingPlanDashboardService', () => {
    let service: TrainingPlanDashboardService
    let mockHttp: jest.Mocked<HttpClient>

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()

        mockHttp = {
            post: jest.fn(),
        } as any

        service = new TrainingPlanDashboardService(mockHttp)
    })

    it('should create a instance of service', () => {
        expect(service).toBeTruthy()
    })

    describe('getUserList', () => {
        it('should POST to CBP_PLAN_LIST endpoint with request body', () => {
            const mockReq = { userId: 'u1', limit: 10 }
            const mockResponse = { result: { data: [] } }
            mockHttp.post.mockReturnValue(of(mockResponse))

            let result: any
            service.getUserList(mockReq).subscribe(res => (result = res))

            expect(mockHttp.post).toHaveBeenCalledWith(
                '/apis/proxies/v8/cbplan/v1/list',
                mockReq
            )
            expect(result).toEqual(mockResponse)
        })

        it('should return an Observable', () => {
            mockHttp.post.mockReturnValue(of({}))
            const obs = service.getUserList({})
            expect(obs).toBeDefined()
            expect(typeof obs.subscribe).toBe('function')
        })
    })

    describe('getTrainingPlansV2', () => {
        it('should POST to CBP_PLAN_LIST_V2 endpoint with request body', () => {
            const mockReq = { query: 'test', limit: 20 }
            const mockResponse = { result: { content: [] } }
            mockHttp.post.mockReturnValue(of(mockResponse))

            let result: any
            service.getTrainingPlansV2(mockReq).subscribe(res => (result = res))

            expect(mockHttp.post).toHaveBeenCalledWith(
                '/apis/proxies/v8/cbplan/v2/search',
                mockReq
            )
            expect(result).toEqual(mockResponse)
        })

        it('should return an Observable', () => {
            mockHttp.post.mockReturnValue(of({}))
            const obs = service.getTrainingPlansV2({})
            expect(obs).toBeDefined()
            expect(typeof obs.subscribe).toBe('function')
        })
    })
})