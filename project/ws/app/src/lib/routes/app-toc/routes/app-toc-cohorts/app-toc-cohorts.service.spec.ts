jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  NsAutoComplete: {},
}), { virtual: true })

jest.mock('@sunbird-cb/collection', () => ({
  WidgetContentService: class { },
  NsContentConstants: {},
}))

import { AppTocCohortsService } from './app-toc-cohorts.service'
import { AppTocCohortsComponent } from '../../components/app-toc-cohorts/app-toc-cohorts.component'

describe('AppTocCohortsService', () => {
  let service: AppTocCohortsService
  let mockConfigurationsService: any

  beforeEach(() => {
    mockConfigurationsService = {
      rootOrg: 'defaultOrg',
    }

    service = new AppTocCohortsService(mockConfigurationsService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return AppTocCohortsComponent from getComponent', () => {
    const component = service.getComponent()
    expect(component).toBe(AppTocCohortsComponent)
  })

  it('should return AppTocCohortsComponent when rootOrg is set to a specific value', () => {
    mockConfigurationsService.rootOrg = 'specificOrg'
    const component = service.getComponent()
    expect(component).toBe(AppTocCohortsComponent)
  })

  it('should return AppTocCohortsComponent when rootOrg is undefined', () => {
    mockConfigurationsService.rootOrg = undefined
    const component = service.getComponent()
    expect(component).toBe(AppTocCohortsComponent)
  })
})