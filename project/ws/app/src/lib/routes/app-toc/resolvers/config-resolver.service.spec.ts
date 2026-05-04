import { ConfigResolverService } from './config-resolver.service'

describe('ConfigResolverService (app-toc)', () => {
  let service: ConfigResolverService
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = { instanceConfig: { name: 'test-instance' } }
    service = new ConfigResolverService(mockConfigSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should return observable with instanceConfig', (done) => {
      service.resolve({} as any, {} as any).subscribe(result => {
        expect(result.data).toBe(mockConfigSvc.instanceConfig)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should return null data when instanceConfig is null', (done) => {
      mockConfigSvc.instanceConfig = null
      service.resolve({} as any, {} as any).subscribe(result => {
        expect(result.data).toBeNull()
        done()
      })
    })
  })
})
