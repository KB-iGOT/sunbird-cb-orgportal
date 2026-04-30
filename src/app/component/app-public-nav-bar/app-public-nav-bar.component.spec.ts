import { AppPublicNavBarComponent } from './app-public-nav-bar.component'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

describe('AppPublicNavBarComponent', () => {
    let component: AppPublicNavBarComponent
    let mockDomSanitizer: Partial<DomSanitizer>
    let mockConfigSvc: Partial<ConfigurationsService>

    beforeEach(() => {
        mockDomSanitizer = {
            bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safeUrl'),
        }

        mockConfigSvc = {
            instanceConfig: {
                logos: {
                    appTransparent: 'some-logo-url',
                },
                details: {
                    appName: 'Test App',
                },
            } as any,
            primaryNavBar: { background: 'blue' } as any,
        }

        component = new AppPublicNavBarComponent(
            mockDomSanitizer as DomSanitizer,
            mockConfigSvc as ConfigurationsService
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should have null appIcon, empty appName and null navBar before ngOnInit', () => {
        expect(component.appIcon).toBeNull()
        expect(component.appName).toBe('')
        expect(component.navBar).toBeNull()
    })

    it('should set appIcon, appName, and navBar on ngOnInit when instanceConfig is present', () => {
        component.ngOnInit()

        expect(component.appIcon).toBe('safeUrl')
        expect(component.appName).toBe('Test App')
        expect(component.navBar).toEqual({ background: 'blue' })
        expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('some-logo-url')
    })

    it('should not set properties when instanceConfig is null', () => {
        mockConfigSvc.instanceConfig = null as any
        component = new AppPublicNavBarComponent(
            mockDomSanitizer as DomSanitizer,
            mockConfigSvc as ConfigurationsService
        )
        component.ngOnInit()

        expect(component.appIcon).toBeNull()
        expect(component.appName).toBe('')
        expect(component.navBar).toBeNull()
        expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
    })

    it('should return true for showPublicNavbar', () => {
        expect(component.showPublicNavbar).toBe(true)
    })
})
