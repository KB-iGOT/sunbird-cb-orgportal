import { of, throwError } from 'rxjs'
import { ContentCertificationResolver } from './content-certification.resolver'

describe('ContentCertificationResolver', () => {
  let resolver: ContentCertificationResolver
  let mockContentSvc: any

  const mockContent = {
    identifier: 'content-001',
    name: 'Test Content',
    mimeType: 'application/pdf',
  }

  beforeEach(() => {
    mockContentSvc = {
      fetchContent: jest.fn(),
    }
    resolver = new ContentCertificationResolver(mockContentSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  describe('resolve() - parent data available', () => {
    it('should return parent content when route.parent.data.content exists', (done) => {
      const parentData = { data: mockContent, error: null }
      const route: any = {
        parent: { data: { content: parentData } },
        paramMap: { get: jest.fn() },
      }

      resolver.resolve(route).subscribe((result: any) => {
        expect(result).toBe(parentData)
        expect(mockContentSvc.fetchContent).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('resolve() - no parent, has contentId', () => {
    it('should call fetchContent when no parent data and contentId exists', (done) => {
      mockContentSvc.fetchContent.mockReturnValue(of(mockContent))
      const route: any = {
        parent: null,
        paramMap: { get: jest.fn().mockReturnValue('content-001') },
      }

      resolver.resolve(route).subscribe((result: any) => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('content-001', 'detail')
        expect(result).toEqual({ data: mockContent, error: null })
        done()
      })
    })

    it('should return error object when fetchContent throws', (done) => {
      const error = { message: 'fetch failed', status: 500 }
      mockContentSvc.fetchContent.mockReturnValue(throwError(error))
      const route: any = {
        parent: null,
        paramMap: { get: jest.fn().mockReturnValue('content-001') },
      }

      resolver.resolve(route).subscribe((result: any) => {
        expect(result.error).toEqual(error)
        expect(result.data).toBeNull()
        done()
      })
    })
  })

  describe('resolve() - no parent, no contentId', () => {
    it('should return NO_ID error when contentId is null', (done) => {
      const route: any = {
        parent: null,
        paramMap: { get: jest.fn().mockReturnValue(null) },
      }

      resolver.resolve(route).subscribe((result: any) => {
        expect(result).toEqual({ error: 'NO_ID', data: null })
        expect(mockContentSvc.fetchContent).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('resolve() - parent without content data', () => {
    it('should fall through to paramMap when parent exists but data.content is falsy', (done) => {
      mockContentSvc.fetchContent.mockReturnValue(of(mockContent))
      const route: any = {
        parent: { data: { content: null } },
        paramMap: { get: jest.fn().mockReturnValue('content-002') },
      }

      resolver.resolve(route).subscribe((result: any) => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('content-002', 'detail')
        expect(result).toEqual({ data: mockContent, error: null })
        done()
      })
    })
  })
})
