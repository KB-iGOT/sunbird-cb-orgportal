import { ProfileResolverService } from './profile-resolver.service'

describe('ProfileResolverService (viewer)', () => {
  let service: ProfileResolverService
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = { userProfile: { userId: 'u-viewer', firstName: 'Viewer User' } }
    service = new ProfileResolverService(mockConfigSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve()', () => {
    it('should return observable wrapping userProfile', (done) => {
      service.resolve({} as any, {} as any).subscribe(result => {
        expect(result.data).toBe(mockConfigSvc.userProfile)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should return null data when userProfile is null', (done) => {
      mockConfigSvc.userProfile = null
      service.resolve({} as any, {} as any).subscribe(result => {
        expect(result.data).toBeNull()
        done()
      })
    })
  })
})
