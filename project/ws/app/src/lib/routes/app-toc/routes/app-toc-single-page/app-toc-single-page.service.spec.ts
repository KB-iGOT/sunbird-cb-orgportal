jest.mock('../../components/app-toc-single-page/app-toc-single-page.component', () => ({
  AppTocSinglePageComponent: class MockAppTocSinglePageComponent { },
}))

import { AppTocSinglePageService } from './app-toc-single-page.service'
import { AppTocSinglePageComponent } from '../../components/app-toc-single-page/app-toc-single-page.component'

describe('AppTocSinglePageService', () => {
  let service: AppTocSinglePageService

  beforeEach(() => {
    service = new AppTocSinglePageService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('getComponent should return AppTocSinglePageComponent class reference', () => {
    const result = service.getComponent()
    expect(result).toBe(AppTocSinglePageComponent)
  })

  it('getComponent should return a constructor/class (function type)', () => {
    const result = service.getComponent()
    expect(typeof result).toBe('function')
  })

  it('getComponent should return same reference on multiple calls', () => {
    const result1 = service.getComponent()
    const result2 = service.getComponent()
    expect(result1).toBe(result2)
  })
})
