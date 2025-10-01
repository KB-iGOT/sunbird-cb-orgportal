
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { EventService } from '@sunbird-cb/utils-v2'
import { HomeComponent } from './home.component'
import { of } from 'rxjs'

describe('HomeComponent', () => {
    let component: HomeComponent

    const activeRoute: Partial<ActivatedRoute> = {}
    const router: Partial<Router> = {
        events: of(new NavigationEnd(0, '', '')),
    }
    const events: Partial<EventService> = {}

    beforeAll(() => {
        component = new HomeComponent(
            activeRoute as ActivatedRoute,
            router as Router,
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
