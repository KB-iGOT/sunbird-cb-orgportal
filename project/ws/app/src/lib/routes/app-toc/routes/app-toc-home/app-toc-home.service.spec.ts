jest.mock('../../components/app-toc-home/app-toc-home.component', () => ({
  AppTocHomeComponent: class MockAppTocHomeComponent { },
}))

import { AppTocHomeService } from './app-toc-home.service'
import { AppTocHomeComponent } from '../../components/app-toc-home/app-toc-home.component'

describe('AppTocHomeService', () => {
  let service: AppTocHomeService

  beforeEach(() => {
    service = new AppTocHomeService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('getComponent should return AppTocHomeComponent class reference', () => {
    const result = service.getComponent()
    expect(result).toBe(AppTocHomeComponent)
  })

  it('getComponent should return a constructor (class)', () => {
    const result = service.getComponent()
    expect(typeof result).toBe('function')
  })
})
