
import { BreakpointObserver } from '@angular/cdk/layout'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { ActivatedRoute } from '@angular/router'
import { PublicAboutComponent } from './public-about.component'
import { of } from 'rxjs'

describe('PublicAboutComponent', () => {
    let component: PublicAboutComponent

    const breakpointObserver: Partial<BreakpointObserver> = {
        observe: jest.fn(() => of()),
    }
    const domSanitizer: Partial<DomSanitizer> = {}
    const configSvc: Partial<ConfigurationsService> = {}
    const activateRoute: Partial<ActivatedRoute> = {}

    beforeAll(() => {
        component = new PublicAboutComponent(
            breakpointObserver as BreakpointObserver,
            domSanitizer as DomSanitizer,
            configSvc as ConfigurationsService,
            activateRoute as ActivatedRoute
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
