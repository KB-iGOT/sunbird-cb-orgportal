import { TestBed } from '@angular/core/testing'

import { ConfigResolverService } from './config-resolver.service'

describe('ConfigurationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ConfigResolverService = TestBed.get(ConfigResolverService)
    expect(service).toBeTruthy()
  })
})
