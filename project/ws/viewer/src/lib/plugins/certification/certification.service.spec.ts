import { CertificationService } from './certification.service'
import { HttpClient } from '@angular/common/http'
// import { request } from 'http'
import { of } from 'rxjs'

describe('CertificationService', () => {
  let service: CertificationService
  let mockHttpClient: HttpClient

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn().mockReturnValue(of(null)),
    } as unknown as HttpClient

    service = new CertificationService(mockHttpClient)
  })

  it('should create the service', () => {
    expect(service).toBeTruthy()
  })

  describe('fetchCertifications', () => {
    it('should call http.post with the correct URL and request', () => {

      // expect(mockHttpClient.post).toHaveBeenCalledWith(service.API_ENDPOINTS.USER_CERTIFICATION, { request })
    })

    it('should return the result of the http.post call', () => {
      const mockResponse = { result: {} }
      mockHttpClient.post = jest.fn().mockReturnValue(of(mockResponse))

    })
  })
})