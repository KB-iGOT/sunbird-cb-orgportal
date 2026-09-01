jest.mock('./app-toc-overview.service', () => ({
  AppTocOverviewService: class MockAppTocOverviewService {
    getComponent() { return class MockOverviewComponent { } }
  },
}))

import { AppTocOverviewComponent } from './app-toc-overview.component'
import { AppTocOverviewDirective } from './app-toc-overview.directive'

describe('AppTocOverviewComponent (routes)', () => {
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
      getComponent: jest.fn().mockReturnValue(class MockComponent { }),
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

    component.wsAppAppTocOverview = {
      viewContainerRef: mockViewContainerRef,
    } as AppTocOverviewDirective
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit should call loadComponent', () => {
    const spy = jest.spyOn(component, 'loadComponent')
    component.ngOnInit()
    expect(spy).toHaveBeenCalled()
  })

  it('loadComponent should resolve factory and create component in view container', () => {
    component.loadComponent()

    expect(mockAppTocOverviewService.getComponent).toHaveBeenCalled()
    expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalled()
    expect(mockViewContainerRef.clear).toHaveBeenCalled()
    expect(mockViewContainerRef.createComponent).toHaveBeenCalled()
  })

  it('loadComponent should clear view container before creating component', () => {
    const callOrder: string[] = []
    mockViewContainerRef.clear.mockImplementation(() => callOrder.push('clear'))
    mockViewContainerRef.createComponent.mockImplementation(() => callOrder.push('create'))

    component.loadComponent()

    expect(callOrder.indexOf('clear')).toBeLessThan(callOrder.indexOf('create'))
  })
})
