
import { ActivatedRoute } from '@angular/router'
import { ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { PublicFaqComponent } from './public-faq.component'
import { of } from 'rxjs'

describe('PublicFaqComponent', () => {
    let component: PublicFaqComponent

    const route: Partial<ActivatedRoute> = {}
    const valueSvc: Partial<ValueService> = {
        isLtMedium$: of(),
    }
    const configSvc: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new PublicFaqComponent(
            route as ActivatedRoute,
            valueSvc as ValueService,
            configSvc as ConfigurationsService
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
