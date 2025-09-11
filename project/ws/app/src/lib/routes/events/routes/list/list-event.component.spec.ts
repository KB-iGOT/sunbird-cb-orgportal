
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'
import { EventsService } from '../../services/events.service'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils-v2'
import { DatePipe } from '@angular/common'
import { ListEventComponent } from './list-event.component'
import { of } from 'rxjs'

describe('ListEventComponent', () => {
    let component: ListEventComponent

    const router: Partial<Router> = {}
    const eventSvc: Partial<EventsService> = {}
    const configSvc: Partial<ConfigurationsService> = {}
    const activeRoute: Partial<ActivatedRoute> = {
        data: of({
            pageData: {
                data: {
                    bulkUploadConfig: {
                        pageSize: 10,
                        pageSizeOptions: [10, 20, 30],
                    },
                },
            },
        }),
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
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        outlet: 'primary',
        component: null,
    } as unknown as ActivatedRoute
    const events: Partial<EventService> = {}
    const datePipe: Partial<DatePipe> = {}

    beforeAll(() => {
        component = new ListEventComponent(
            router as Router,
            eventSvc as EventsService,
            configSvc as ConfigurationsService,
            activeRoute as ActivatedRoute,
            events as EventService,
            datePipe as DatePipe
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
