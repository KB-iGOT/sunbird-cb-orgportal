jest.mock('../../components/app-toc-overview/app-toc-overview.component', () => ({
  AppTocOverviewComponent: class MockAppTocOverviewComponent { },
}))

import { AppTocOverviewService } from './app-toc-overview.service'
import { AppTocOverviewComponent } from '../../components/app-toc-overview/app-toc-overview.component'

describe('AppTocOverviewService', () => {
  let service: AppTocOverviewService

  beforeEach(() => {
    service = new AppTocOverviewService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('getComponent should return AppTocOverviewComponent class reference', () => {
    const result = service.getComponent()
    expect(result).toBe(AppTocOverviewComponent)
  })

  it('getComponent should return a constructor (class)', () => {
    const result = service.getComponent()
    expect(typeof result).toBe('function')
  })
})
