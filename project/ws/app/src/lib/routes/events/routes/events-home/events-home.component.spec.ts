
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { ConfigurationsService, ValueService } from '@sunbird-cb/utils-v2'
import { EventsHomeComponent } from './events-home.component'
import { of } from 'rxjs'

describe('EventsHomeComponent', () => {
    let component: EventsHomeComponent

    const valueSvc: Partial<ValueService> = {
        isLtMedium$: of(true),
    }
    const router: Partial<Router> = {
        events: of(new NavigationEnd(0, '', '')),

    }
    const activeRoute: Partial<ActivatedRoute> = {}
    const configService: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new EventsHomeComponent(
            valueSvc as ValueService,
            router as Router,
            activeRoute as ActivatedRoute,
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
