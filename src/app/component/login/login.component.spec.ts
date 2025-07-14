
import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { LoginComponent } from './login.component'

describe('LoginComponent', () => {
    let component: LoginComponent

    const activateRoute: Partial<ActivatedRoute> = {}
    const configSvc: Partial<ConfigurationsService> = {}
    const domSanitizer: Partial<DomSanitizer> = {}

    beforeAll(() => {
        component = new LoginComponent(
            activateRoute as ActivatedRoute,
            configSvc as ConfigurationsService,
            domSanitizer as DomSanitizer
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
