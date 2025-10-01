
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { TncAppResolverService } from './tnc-app-resolver.service'

describe('TncAppResolverService', () => {
    let component: TncAppResolverService

    const http: Partial<HttpClient> = {}
    const configSvc: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new TncAppResolverService(
            http as HttpClient,
            configSvc as ConfigurationsService
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
