
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { EventService } from '@sunbird-cb/utils-v2'
import { ViewEventComponent } from './view-event.component'
import { of } from 'rxjs'

describe('ViewEventComponent', () => {
    let component: ViewEventComponent

    const activeRoute: Partial<ActivatedRoute> = {}
    const router: Partial<Router> = {
        events: of(new NavigationEnd(0, '', '')),
    }
    const events: Partial<EventService> = {}

    beforeAll(() => {
        component = new ViewEventComponent(
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
