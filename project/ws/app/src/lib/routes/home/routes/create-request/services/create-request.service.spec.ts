import { CreateRequestService } from './create-request.service'
import { of } from 'rxjs'

describe('CreateRequestService', () => {
  let service: CreateRequestService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockReturnValue(of({ result: 'ok' })),
    }
    service = new CreateRequestService(mockHttp)
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('createRequestForm', () => {
    it('should POST to the correct endpoint', () => {
      const req = { title: 'Test', description: 'Desc' }
      service.createRequestForm(req).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/demand/content/create',
        req
      )
    })

    it('should return the observable from http.post', (done) => {
      mockHttp.post.mockReturnValue(of({ id: 'abc', success: true }))
      service.createRequestForm({}).subscribe((result) => {
        expect(result).toEqual({ id: 'abc', success: true })
        done()
      })
    })

    it('should pass the request body through to the HTTP call', () => {
      const body = { requestType: 'Content', priority: 'High' }
      service.createRequestForm(body).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), body)
    })
  })
})
