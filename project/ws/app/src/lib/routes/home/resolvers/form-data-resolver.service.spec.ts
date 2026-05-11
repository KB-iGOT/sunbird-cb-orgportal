import { of, throwError } from 'rxjs'
import { FormDataResolverService } from './form-data-resolver.service'

describe('FormDataResolverService', () => {
  let service: FormDataResolverService
  let mockHttp: any
  let mockConfigSvc: any
  let mockFormSvc: any

  const mockFormData = { fields: [{ name: 'title', type: 'text' }] }
  const mockFormResponse = { result: { form: { data: mockFormData } } }

  const makeRoute = (overrides: any = {}): any => ({
    data: { pageKey: 'home', pageType: 'feature', ...overrides },
  })
  const mockState: any = {}

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
    }
    mockConfigSvc = {
      orgReadData: { rootOrgId: 'org-001' },
      sitePath: '/assets',
    }
    mockFormSvc = {
      formReadData: jest.fn(),
    }

    service = new FormDataResolverService(mockHttp, mockConfigSvc, mockFormSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve() - primary path succeeds (microsite-v3-preview)', () => {
    it('should return form data when formReadData succeeds on first try', (done) => {
      mockFormSvc.formReadData.mockReturnValue(of(mockFormResponse))

      service.resolve(makeRoute(), mockState).subscribe((result: any) => {
        expect(result.data).toEqual(mockFormData)
        expect(result.error).toBeNull()
        expect(result.default).toBe(false)
        done()
      })
    })

    it('should call formReadData with correct request body', (done) => {
      mockFormSvc.formReadData.mockReturnValue(of(mockFormResponse))

      service.resolve(makeRoute(), mockState).subscribe(() => {
        expect(mockFormSvc.formReadData).toHaveBeenCalledWith(
          expect.objectContaining({
            request: expect.objectContaining({
              type: 'MDO-channel',
              subType: 'microsite-v3-preview',
              action: 'page-configuration',
              component: 'portal',
              rootOrgId: 'org-001',
            }),
          }),
        )
        done()
      })
    })

    it('should use empty rootOrgId when orgReadData is missing', (done) => {
      mockConfigSvc.orgReadData = null
      mockFormSvc.formReadData.mockReturnValue(of(mockFormResponse))

      service.resolve(makeRoute(), mockState).subscribe(() => {
        expect(mockFormSvc.formReadData).toHaveBeenCalledWith(
          expect.objectContaining({
            request: expect.objectContaining({ rootOrgId: '' }),
          }),
        )
        done()
      })
    })
  })

  describe('resolve() - first fails, second (microsite-v3) succeeds', () => {
    it('should fall back to microsite-v3 when preview fails', (done) => {
      mockFormSvc.formReadData
        .mockReturnValueOnce(throwError({ message: 'preview-fail' }))
        .mockReturnValueOnce(of(mockFormResponse))

      service.resolve(makeRoute(), mockState).subscribe((result: any) => {
        expect(result.data).toEqual(mockFormData)
        expect(result.error).toBeNull()
        expect(result.default).toBe(false)
        expect(mockFormSvc.formReadData).toHaveBeenCalledTimes(2)
        done()
      })
    })
  })

  describe('resolve() - both form calls fail, HTTP fallback', () => {
    it('should fall back to HTTP JSON file when both form reads fail', (done) => {
      const httpResponse = { body: { data: mockFormData } }
      mockFormSvc.formReadData.mockReturnValue(throwError({ message: 'all-fail' }))
      mockHttp.get.mockReturnValue(of(httpResponse))

      service.resolve(makeRoute(), mockState).subscribe((result: any) => {
        expect(result.data).toEqual(mockFormData)
        expect(result.error).toBeNull()
        expect(result.default).toBe(true)
        done()
      })
    })

    it('should build correct HTTP URL with pageKey and pageType from route', (done) => {
      mockFormSvc.formReadData.mockReturnValue(throwError({ message: 'fail' }))
      const httpResponse = { body: { data: mockFormData } }
      mockHttp.get.mockReturnValue(of(httpResponse))

      service.resolve(makeRoute({ pageKey: 'dashboard', pageType: 'page' }), mockState).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/assets/page/dashboard.json',
          expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
        )
        done()
      })
    })

    it('should use feature as default pageType when not specified', (done) => {
      mockFormSvc.formReadData.mockReturnValue(throwError({ message: 'fail' }))
      const httpResponse = { body: { data: mockFormData } }
      mockHttp.get.mockReturnValue(of(httpResponse))

      service.resolve(makeRoute({ pageKey: 'mypage' }), mockState).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/assets/feature/mypage.json',
          expect.anything(),
        )
        done()
      })
    })

    it('should return empty data when HTTP response has no body', (done) => {
      mockFormSvc.formReadData.mockReturnValue(throwError({ message: 'fail' }))
      mockHttp.get.mockReturnValue(of({ body: null }))

      service.resolve(makeRoute(), mockState).subscribe((result: any) => {
        expect(result.data).toBeNull()
        expect(result.error).toBe('Empty response')
        done()
      })
    })

    it('should return error when HTTP call also fails', (done) => {
      const httpError = { message: 'network-error', status: 500 }
      mockFormSvc.formReadData.mockReturnValue(throwError({ message: 'fail' }))
      mockHttp.get.mockReturnValue(throwError(httpError))

      service.resolve(makeRoute(), mockState).subscribe((result: any) => {
        expect(result.data).toBeNull()
        expect(result.error).toEqual(httpError)
        done()
      })
    })
  })
})
