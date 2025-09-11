import '@angular/compiler'
import { Router, ActivatedRoute } from '@angular/router'
import { ConfigurationsService, EventService, ValueService } from '@sunbird-cb/utils-v2'
import { HomeComponent } from './home.component'
import { LeftMenuService } from '@sunbird-cb/collection'

describe('HomeComponent', () => {
    let component: HomeComponent

    const valueSvc: Partial<ValueService> = {}
    const router: Partial<Router> = {}
    const activeRoute: Partial<ActivatedRoute> = {}
    const configService: Partial<ConfigurationsService> = {}
    const leftMenuService: Partial<LeftMenuService> = {}
    const events: Partial<EventService> = {}

    beforeAll(() => {
        component = new HomeComponent(
            valueSvc as ValueService,
            router as Router,
            activeRoute as ActivatedRoute,
            configService as ConfigurationsService,
            leftMenuService as LeftMenuService,
            events as EventService
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