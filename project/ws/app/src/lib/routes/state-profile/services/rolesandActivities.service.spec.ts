import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { RolesAndActivityService } from './rolesandActivities.service'

describe('RolesAndActivityService', () => {
  let service: RolesAndActivityService
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new RolesAndActivityService(mockHttpClient)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('loadRoles', () => {
    it('should call the correct API endpoint with the keyword', (done) => {
      const keyword = 'admin'
      const mockResponse = { roles: ['admin', 'editor'] }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.loadRoles(keyword).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
        done()
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith('apis/protected/v8/roleactivity/admin')
    })

    it('should work with different keyword values', (done) => {
      mockHttpClient.get.mockReturnValue(of({ roles: [] }))
      service.loadRoles('user').subscribe(() => done())
      expect(mockHttpClient.get).toHaveBeenCalledWith('apis/protected/v8/roleactivity/user')
    })
  })

  describe('createRoles', () => {
    it('should POST to the UPDATE_PROFILE endpoint with role data', (done) => {
      const mockRole = {
        request: {
          userId: 'user123',
          profileDetails: {
            userRoles: [{ id: 'role1', name: 'Admin' } as any]
          }
        }
      }
      const mockResponse = { response: 'success' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.createRoles(mockRole).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
        done()
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', mockRole)
    })
  })
})