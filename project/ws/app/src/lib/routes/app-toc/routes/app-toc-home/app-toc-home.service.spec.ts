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

  it('should return AppTocHomeComponent from getComponent', () => {
    const component = service.getComponent()
    expect(component).toBe(AppTocHomeComponent)
  })
})