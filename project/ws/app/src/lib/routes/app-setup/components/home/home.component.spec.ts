import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { DomSanitizer } from '@angular/platform-browser'
import { NavigationEnd, Router } from '@angular/router'
import { HomeComponent } from './home.component'
import { of } from 'rxjs'

describe('HomeComponent', () => {
    let component: HomeComponent

    const configSvc: Partial<ConfigurationsService> = {}
    const domSanitizer: Partial<DomSanitizer> = {}
    const router: Partial<Router> = {
        events: of(new NavigationEnd(0, '', '')),
    }

    beforeAll(() => {
        component = new HomeComponent(
            configSvc as ConfigurationsService,
            domSanitizer as DomSanitizer,
            router as Router
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
