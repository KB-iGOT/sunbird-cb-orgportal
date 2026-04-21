

import { ComponentFactoryResolver } from '@angular/core'
import { AppTocHomeService } from './app-toc-home.service'
import { AppTocHomeComponent } from './app-toc-home.component'

describe('AppTocHomeComponent', () => {
  let component: AppTocHomeComponent

  const componentFactoryResolver: Partial<ComponentFactoryResolver> = {}
  const appTocHomeSvc: Partial<AppTocHomeService> = {}

  beforeAll(() => {
    component = new AppTocHomeComponent(
      componentFactoryResolver as ComponentFactoryResolver,
      appTocHomeSvc as AppTocHomeService
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
