
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { WorkallocationService } from './workallocation.service'

describe('WorkallocationService', () => {
    let component: WorkallocationService

    const http: Partial<HttpClient> = {}
    const configService: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new WorkallocationService(
            http as HttpClient,
            configService as ConfigurationsService
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