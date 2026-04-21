import { AppTocOverviewComponent } from './app-toc-overview.component'
import { AppTocOverviewDirective } from './app-toc-overview.directive'


describe('AppTocOverviewComponent', () => {
    let component: AppTocOverviewComponent
    let mockComponentFactoryResolver: any
    let mockAppTocOverviewService: any
    let mockViewContainerRef: any

    beforeEach(() => {
        mockViewContainerRef = {
            clear: jest.fn(),
            createComponent: jest.fn(),
        }

        mockAppTocOverviewService = {
            getComponent: jest.fn().mockReturnValue('MockComponent'),
        }

        mockComponentFactoryResolver = {
            resolveComponentFactory: jest.fn().mockReturnValue({
                create: jest.fn(),
            }),
        }

        component = new AppTocOverviewComponent(
            mockComponentFactoryResolver,
            mockAppTocOverviewService,
        )

        // Mock the ViewChild directive
        component.wsAppAppTocOverview = {
            viewContainerRef: mockViewContainerRef,
        } as AppTocOverviewDirective
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should load component on ngOnInit', () => {
        component.ngOnInit()

        expect(mockAppTocOverviewService.getComponent).toHaveBeenCalled()
        expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith('MockComponent')
        expect(mockViewContainerRef.clear).toHaveBeenCalled()
        expect(mockViewContainerRef.createComponent).toHaveBeenCalled()
    })

    it('should call loadComponent when loadComponent is invoked', () => {
        component.loadComponent()

        expect(mockAppTocOverviewService.getComponent).toHaveBeenCalled()
        expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith('MockComponent')
        expect(mockViewContainerRef.clear).toHaveBeenCalled()
        expect(mockViewContainerRef.createComponent).toHaveBeenCalled()
    })
})
