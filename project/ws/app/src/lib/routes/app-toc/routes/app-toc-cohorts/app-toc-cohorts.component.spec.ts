import { AppTocCohortsComponent } from './app-toc-cohorts.component'
import { AppTocCohortsDirective } from './app-toc-cohorts.directive'


describe('AppTocCohortsComponent', () => {
    let component: AppTocCohortsComponent
    let mockComponentFactoryResolver: any
    let mockAppTocCohortsService: any
    let mockViewContainerRef: any

    beforeEach(() => {
        mockViewContainerRef = {
            clear: jest.fn(),
            createComponent: jest.fn(),
        }

        mockAppTocCohortsService = {
            getComponent: jest.fn().mockReturnValue('MockComponent'),
        }

        mockComponentFactoryResolver = {
            resolveComponentFactory: jest.fn().mockReturnValue({
                create: jest.fn(),
            }),
        }

        component = new AppTocCohortsComponent(
            mockComponentFactoryResolver,
            mockAppTocCohortsService,
        )

        // Mock the ViewChild directive
        component.wsAppAppTocCohorts = {
            viewContainerRef: mockViewContainerRef,
        } as AppTocCohortsDirective
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should load component on ngOnInit', () => {
        component.ngOnInit()

        expect(mockAppTocCohortsService.getComponent).toHaveBeenCalled()
        expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith('MockComponent')
        expect(mockViewContainerRef.clear).toHaveBeenCalled()
        expect(mockViewContainerRef.createComponent).toHaveBeenCalled()
    })

    it('should call loadComponent when loadComponent is invoked', () => {
        component.loadComponent()

        expect(mockAppTocCohortsService.getComponent).toHaveBeenCalled()
        expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith('MockComponent')
        expect(mockViewContainerRef.clear).toHaveBeenCalled()
        expect(mockViewContainerRef.createComponent).toHaveBeenCalled()
    })
})
