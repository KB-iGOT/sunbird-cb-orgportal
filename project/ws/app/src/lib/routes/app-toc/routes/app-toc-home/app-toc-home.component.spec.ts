jest.mock('./app-toc-home.service', () => ({
  AppTocHomeService: class MockAppTocHomeService {
    getComponent() { return class MockHomeComponent { } }
  },
}))

import { AppTocHomeComponent } from './app-toc-home.component'
import { AppTocHomeDirective } from './app-toc-home.directive'

describe('AppTocHomeComponent (routes)', () => {
  let component: AppTocHomeComponent
  let mockComponentFactoryResolver: any
  let mockAppTocHomeService: any
  let mockViewContainerRef: any

  beforeEach(() => {
    mockViewContainerRef = {
      clear: jest.fn(),
      createComponent: jest.fn(),
    }

    mockAppTocHomeService = {
      getComponent: jest.fn().mockReturnValue(class MockComponent { }),
    }

    mockComponentFactoryResolver = {
      resolveComponentFactory: jest.fn().mockReturnValue({
        create: jest.fn(),
      }),
    }

    component = new AppTocHomeComponent(
      mockComponentFactoryResolver,
      mockAppTocHomeService,
    )

    component.wsAppAppTocHome = {
      viewContainerRef: mockViewContainerRef,
    } as AppTocHomeDirective
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit should not throw', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('loadComponent should resolve factory and create component in view container', () => {
    component.loadComponent()

    expect(mockAppTocHomeService.getComponent).toHaveBeenCalled()
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
