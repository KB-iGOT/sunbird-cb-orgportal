import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { HomeComponent } from './home.component'
import { of } from 'rxjs'

describe('HomeComponent', () => {
    let component: HomeComponent

    const valueSvc: Partial<ValueService> = {
        isLtMedium$: of(true),
    }
    const router: Partial<Router> = {
        events: of(new NavigationEnd(0, '', '')),
    }
    const activeRoute: Partial<ActivatedRoute> = {}

    beforeAll(() => {
        component = new HomeComponent(
            valueSvc as ValueService,
            router as Router,
            activeRoute as ActivatedRoute
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
