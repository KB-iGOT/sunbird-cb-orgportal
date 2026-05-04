import { ConfigResolverService } from './config-resolver.service'

describe('ConfigResolverService (viewer)', () => {
  let service: ConfigResolverService
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = { instanceConfig: { sitePath: '/path/to/site' } }
    service = new ConfigResolverService(mockConfigSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should return observable wrapping instanceConfig', (done) => {
      service.resolve({} as any, {} as any).subscribe((result: any) => {
        expect(result.data).toBe(mockConfigSvc.instanceConfig)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should return null data when instanceConfig is undefined', (done) => {
      mockConfigSvc.instanceConfig = undefined
      service.resolve({} as any, {} as any).subscribe((result: any) => {
        expect(result.data).toBeUndefined()
        done()
      })
    })
  })
})
