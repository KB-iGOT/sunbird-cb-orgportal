import { ValueService, ConfigurationsService, WidgetContentService } from '@sunbird-cb/utils-v2'
import { ActivatedRoute, Router } from '@angular/router'
import { MdoinfoComponent } from './mdoinfo.component'
import { of } from 'rxjs'

describe('MdoinfoComponent', () => {
    let component: MdoinfoComponent

    const route: Partial<ActivatedRoute> = {}
    const router: Partial<Router> = {
        events: of()
    }
    const valueSvc: Partial<ValueService> = {
        isLtMedium$: of(true)
    }
    const configSvc: Partial<ConfigurationsService> = {}
    const widgetContentSvc: Partial<WidgetContentService> = {}

    beforeAll(() => {
        component = new MdoinfoComponent(
            route as ActivatedRoute,
            router as Router,
            valueSvc as ValueService,
            configSvc as ConfigurationsService,
            widgetContentSvc as WidgetContentService
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