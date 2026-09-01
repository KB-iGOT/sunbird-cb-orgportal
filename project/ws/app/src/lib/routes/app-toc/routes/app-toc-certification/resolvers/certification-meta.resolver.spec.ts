import { of, throwError } from 'rxjs'
import { CertificationMetaResolver } from './certification-meta.resolver'

describe('CertificationMetaResolver', () => {
  let resolver: CertificationMetaResolver
  let certificationApiMock: any

  beforeEach(() => {
    certificationApiMock = {
      getCertificationInfo: jest.fn(),
    }
    resolver = new CertificationMetaResolver(certificationApiMock)
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  describe('resolve', () => {
    it('should return error NO_ID when route has no parent', (done) => {
      const routeMock: any = { parent: null }
      resolver.resolve(routeMock).subscribe(result => {
        expect(result).toEqual({ error: 'NO_ID', data: null })
        done()
      })
    })

    it('should return error NO_ID when parent paramMap returns null id', (done) => {
      const routeMock: any = {
        parent: {
          paramMap: { get: jest.fn().mockReturnValue(null) },
        },
      }
      resolver.resolve(routeMock).subscribe(result => {
        expect(result).toEqual({ error: 'NO_ID', data: null })
        done()
      })
    })

    it('should return data when certificationApi resolves successfully', (done) => {
      const mockData = { certificationId: 'cert123', title: 'Test Cert' }
      certificationApiMock.getCertificationInfo.mockReturnValue(of(mockData))

      const routeMock: any = {
        parent: {
          paramMap: { get: jest.fn().mockReturnValue('content-id-1') },
        },
      }

      resolver.resolve(routeMock).subscribe(result => {
        expect(certificationApiMock.getCertificationInfo).toHaveBeenCalledWith('content-id-1')
        expect(result).toEqual({ data: mockData, error: null })
        done()
      })
    })

    it('should return error when certificationApi throws an error', (done) => {
      const mockError = new Error('API Error')
      certificationApiMock.getCertificationInfo.mockReturnValue(throwError(mockError))

      const routeMock: any = {
        parent: {
          paramMap: { get: jest.fn().mockReturnValue('content-id-2') },
        },
      }

      resolver.resolve(routeMock).subscribe(result => {
        expect(result).toEqual({ error: mockError, data: null })
        done()
      })
    })
  })
})
