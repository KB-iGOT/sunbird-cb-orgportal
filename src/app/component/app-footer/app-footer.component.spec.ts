import { AppFooterComponent } from './app-footer.component'
import { ConfigurationsService, ValueService } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'

describe('AppFooterComponent', () => {
    let component: AppFooterComponent
    let mockConfigSvc: Partial<ConfigurationsService>
    let mockValueSvc: Partial<ValueService>

    beforeEach(() => {
        mockValueSvc = {
            isXSmall$: of(false),
        }
        mockConfigSvc = {}
    })

    it('should create the component', () => {
        component = new AppFooterComponent(
            mockConfigSvc as ConfigurationsService,
            mockValueSvc as ValueService
        )
        expect(component).toBeTruthy()
    })

    it('should keep termsOfUser as true when restrictedFeatures is not set', () => {
        mockConfigSvc = {}
        component = new AppFooterComponent(
            mockConfigSvc as ConfigurationsService,
            mockValueSvc as ValueService
        )
        expect(component.termsOfUser).toBe(true)
    })

    it('should set termsOfUser to false when restrictedFeatures has "termsOfUser"', () => {
        mockConfigSvc = {
            restrictedFeatures: new Set(['termsOfUser']),
        }
        component = new AppFooterComponent(
            mockConfigSvc as ConfigurationsService,
            mockValueSvc as ValueService
        )
        expect(component.termsOfUser).toBe(false)
    })

    it('should keep termsOfUser as true when restrictedFeatures does not include "termsOfUser"', () => {
        mockConfigSvc = {
            restrictedFeatures: new Set(['someOtherFeature']),
        }
        component = new AppFooterComponent(
            mockConfigSvc as ConfigurationsService,
            mockValueSvc as ValueService
        )
        expect(component.termsOfUser).toBe(true)
    })

    it('should set isXSmall to true when ValueService emits true', () => {
        mockValueSvc = { isXSmall$: of(true) }
        component = new AppFooterComponent(
            mockConfigSvc as ConfigurationsService,
            mockValueSvc as ValueService
        )
        expect(component.isXSmall).toBe(true)
    })

    it('should set isXSmall to false when ValueService emits false', () => {
        mockValueSvc = { isXSmall$: of(false) }
        component = new AppFooterComponent(
            mockConfigSvc as ConfigurationsService,
            mockValueSvc as ValueService
        )
        expect(component.isXSmall).toBe(false)
    })
})

