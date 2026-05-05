import { AppTocSinglePageComponent } from './app-toc-single-page.component'
import { AppTocSinglePageDirective } from './app-toc-single-page.directive'

describe('AppTocSinglePageComponent', () => {
  let component: AppTocSinglePageComponent
  let mockComponentFactoryResolver: any
  let mockAppTocSinglePageService: any
  let mockViewContainerRef: any

  beforeEach(() => {
    mockViewContainerRef = {
      clear: jest.fn(),
      createComponent: jest.fn(),
    }

    mockAppTocSinglePageService = {
      getComponent: jest.fn().mockReturnValue('MockComponent'),
    }

    mockComponentFactoryResolver = {
      resolveComponentFactory: jest.fn().mockReturnValue({
        create: jest.fn(),
      }),
    }

    component = new AppTocSinglePageComponent(
      mockComponentFactoryResolver,
      mockAppTocSinglePageService,
    )

    // Mock the ViewChild directive
    component.wsAppAppTocSinglePage = {
      viewContainerRef: mockViewContainerRef,
    } as AppTocSinglePageDirective
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should load component on ngOnInit', () => {
    component.ngOnInit()

    expect(mockAppTocSinglePageService.getComponent).toHaveBeenCalled()
    expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith('MockComponent')
    expect(mockViewContainerRef.clear).toHaveBeenCalled()
    expect(mockViewContainerRef.createComponent).toHaveBeenCalled()
  })

  it('should call loadComponent when loadComponent is invoked', () => {
    component.loadComponent()

    expect(mockAppTocSinglePageService.getComponent).toHaveBeenCalled()
    expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith('MockComponent')
    expect(mockViewContainerRef.clear).toHaveBeenCalled()
    expect(mockViewContainerRef.createComponent).toHaveBeenCalled()
  })
})
