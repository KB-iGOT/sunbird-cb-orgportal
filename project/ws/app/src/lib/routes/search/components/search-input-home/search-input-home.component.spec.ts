
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { SearchServService } from '../../services/search-serv.service'
import { SearchInputHomeComponent } from './search-input-home.component'

describe('SearchInputHomeComponent', () => {
    let component: SearchInputHomeComponent

    const activated: Partial<ActivatedRoute> = {
        snapshot: {
            data: {
                configService: {
                    userProfile: {
                        rootOrgId: 'sampleRootOrgId',
                        userProfileV2: {
                            email: 'test@example.com',
                            mobile: '1234567890',
                        },
                        orgReadData: {
                            frameworkid: 'sampleFrameworkId',
                        },
                    },
                },
            },
            url: [],
            params: {},
            queryParams: {},
            fragment: null,
            outlet: 'primary',
            component: null,
        } as unknown as ActivatedRouteSnapshot,
    }
    const router: Partial<Router> = {}
    const searchServSvc: Partial<SearchServService> = {
        getLanguageSearchIndex: jest.fn()
    }
    const configSvc: Partial<ConfigurationsService> = {}
    const route: Partial<ActivatedRoute> = {}

    beforeAll(() => {
        component = new SearchInputHomeComponent(
            activated as ActivatedRoute,
            router as Router,
            searchServSvc as SearchServService,
            configSvc as ConfigurationsService,
            route as ActivatedRoute
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