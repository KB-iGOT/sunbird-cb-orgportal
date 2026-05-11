import { of } from 'rxjs'
import { PendingFunctionService } from './pending-function.service'

describe('PendingFunctionService', () => {
  let service: PendingFunctionService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
    }
    service = new PendingFunctionService(mockHttp)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should have downloadRegex defined', () => {
    expect(service.downloadRegex).toBeInstanceOf(RegExp)
  })

  it('downloadRegex should be global and multiline', () => {
    expect(service.downloadRegex.flags).toContain('g')
    expect(service.downloadRegex.flags).toContain('m')
  })

  it('downloadRegex should match content-store URLs', () => {
    const url = `https://example.com/content-store/file.pdf'`
    service.downloadRegex.lastIndex = 0
    expect(service.downloadRegex.test(url)).toBe(true)
  })

  // ─── getAssessmentHierarchy ───────────────────────────────────────────────

  describe('getAssessmentHierarchy', () => {
    it('should call http.get with the correct URL', () => {
      const mockResponse = { result: { data: {} } }
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.getAssessmentHierarchy('test-id')

      expect(mockHttp.get).toHaveBeenCalledWith(
        'apis/proxies/v8/questionset/v1/hierarchy/test-id?mode=edit',
      )
    })

    it('should return the observable from http.get', () => {
      const mockResponse = { result: { questionSet: {} } }
      mockHttp.get.mockReturnValue(of(mockResponse))

      const result = service.getAssessmentHierarchy('abc')
      expect(result).toBeDefined()
    })

    it('should work with different ids', () => {
      mockHttp.get.mockReturnValue(of({}))
      service.getAssessmentHierarchy('xyz-123')
      expect(mockHttp.get).toHaveBeenCalledWith(
        'apis/proxies/v8/questionset/v1/hierarchy/xyz-123?mode=edit',
      )
    })

    it('should emit the value from http.get', done => {
      const mockData = { questionSet: { children: [] } }
      mockHttp.get.mockReturnValue(of(mockData))

      service.getAssessmentHierarchy('id-1').subscribe((data: any) => {
        expect(data).toEqual(mockData)
        done()
      })
    })
  })

  // ─── getContentData ────────────────────────────────────────────────────────

  describe('getContentData', () => {
    it('should call http.get with correct URL', () => {
      const apiData = { result: { content: { identifier: 'cnt-01', name: 'Test' } } }
      mockHttp.get.mockReturnValue(of(apiData))

      service.getContentData('cnt-01')

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/action/content/v3/read/cnt-01',
      )
    })

    it('should return the content object from result', done => {
      const content = { identifier: 'cnt-01', name: 'Test Content' }
      const apiData = { result: { content } }
      mockHttp.get.mockReturnValue(of(apiData))

      service.getContentData('cnt-01').subscribe((data: any) => {
        expect(data).toEqual(content)
        done()
      })
    })

    it('should map the data to result.content', done => {
      const content = { identifier: 'cnt-02', mimeType: 'application/pdf' }
      mockHttp.get.mockReturnValue(of({ result: { content } }))

      service.getContentData('cnt-02').subscribe((data: any) => {
        expect(data.mimeType).toBe('application/pdf')
        done()
      })
    })

    it('should work with numeric content id', () => {
      mockHttp.get.mockReturnValue(of({ result: { content: {} } }))
      service.getContentData(123)
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/action/content/v3/read/123',
      )
    })

    it('should return an observable', () => {
      mockHttp.get.mockReturnValue(of({ result: { content: {} } }))
      const obs = service.getContentData('id-x')
      expect(typeof obs.subscribe).toBe('function')
    })
  })
})
