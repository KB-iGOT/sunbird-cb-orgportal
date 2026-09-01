import { FormExtService } from './form-ext.service'
import { of, throwError } from 'rxjs'

describe('FormExtService', () => {
  let service: FormExtService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttp = {
      post: jest.fn(),
      get: jest.fn(),
    }
    mockConfigSvc = { sitePath: '/base-url' }
    service = new FormExtService(mockHttp, mockConfigSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('formReadData', () => {
    it('should POST to FORM_READ endpoint', (done) => {
      const request = { type: 'org', action: 'create' }
      const mockResponse = { result: { form: { data: { fields: [] } } } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.formReadData(request).subscribe(res => {
        expect(res).toEqual(mockResponse)
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/v1/form/read', request)
        done()
      })
    })
  })

  describe('homeFormReadData', () => {
    it('should return form data on success', (done) => {
      const request = { type: 'home' }
      const formData = { fields: ['field1'] }
      const mockResponse = { result: { form: { data: formData } } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.homeFormReadData(request).subscribe(res => {
        expect(res).toEqual(formData)
        done()
      })
    })

    it('should fallback to home.json on formReadData error', (done) => {
      const request = { type: 'home' }
      const fallbackData = { fields: ['fallback'] }
      mockHttp.post.mockReturnValue(throwError(() => new Error('fail')))
      mockHttp.get.mockReturnValue(of(fallbackData))

      service.homeFormReadData(request).subscribe(res => {
        expect(res).toEqual(fallbackData)
        expect(mockHttp.get).toHaveBeenCalledWith('/base-url/page/home.json')
        done()
      })
    })

    it('should return error object when both formRead and fallback fail', (done) => {
      const request = { type: 'home' }
      mockHttp.post.mockReturnValue(throwError(() => new Error('fail')))
      mockHttp.get.mockReturnValue(throwError(() => new Error('fallback fail')))

      service.homeFormReadData(request).subscribe(res => {
        expect(res).toHaveProperty('data', null)
        expect(res).toHaveProperty('error')
        done()
      })
    })
  })
})
