
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { ApprovalsService } from './approvals.service'

describe('ApprovalsService', () => {
    let component: ApprovalsService

    const http: Partial<HttpClient> = {}
    const configSrv: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new ApprovalsService(
            http as HttpClient,
            configSrv as ConfigurationsService
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })
})