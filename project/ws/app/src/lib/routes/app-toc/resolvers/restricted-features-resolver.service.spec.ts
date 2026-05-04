import { RestrictedFeaturesResolverService } from './restricted-features-resolver.service'

describe('RestrictedFeaturesResolverService', () => {
  let service: RestrictedFeaturesResolverService
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = { restrictedFeatures: new Set(['feature-a', 'feature-b']) }
    service = new RestrictedFeaturesResolverService(mockConfigSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should return observable with restrictedFeatures', (done) => {
      service.resolve({} as any, {} as any).subscribe(result => {
        expect(result.data).toBe(mockConfigSvc.restrictedFeatures)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should return null data when restrictedFeatures is null', (done) => {
      mockConfigSvc.restrictedFeatures = null
      service.resolve({} as any, {} as any).subscribe(result => {
        expect(result.data).toBeNull()
        done()
      })
    })
  })
})
