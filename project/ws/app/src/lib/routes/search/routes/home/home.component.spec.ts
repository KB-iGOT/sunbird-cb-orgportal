
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { SearchServService } from '../../services/search-serv.service'
import { HomeComponent } from './home.component'

describe('HomeComponent', () => {
    let component: HomeComponent

    const configSvc: Partial<ConfigurationsService> = {}
    const router: Partial<Router> = {}
    const route: Partial<ActivatedRoute> = {
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
                pageData: {
                    data: {
                        search: {
                            isAutoCompleAllowed: true
                        }
                    }
                }
            },
            url: [],
            params: {},
            queryParams: {},
            fragment: null,
            outlet: 'primary',
            component: null,
        } as unknown as ActivatedRouteSnapshot,
    }
    const searchSvc: Partial<SearchServService> = {
        getLanguageSearchIndex: jest.fn()
    }

    beforeAll(() => {
        component = new HomeComponent(
            configSvc as ConfigurationsService,
            router as Router,
            route as ActivatedRoute,
            searchSvc as SearchServService
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