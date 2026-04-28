import { of } from 'rxjs'
import { ViewerUtilService } from './viewer-util.service'

jest.mock('src/environments/environment', () => ({
  environment: {
    contentHost: 'https://cdn.example.com',
    contentBucket: 'my-bucket',
    azureHost: 'https://azure.example.com',
    azureBucket: 'az-bucket',
  },
}), { virtual: true })

describe('ViewerUtilService', () => {
  let service: ViewerUtilService
  let mockHttp: any
  let mockConfigSvc: any
  let mockContentSvc: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
      patch: jest.fn().mockReturnValue(of({})),
    }
    mockConfigSvc = {
      userProfile: { userId: 'user-001' },
      rootOrg: 'igot',
      activeOrg: 'dopt',
    }
    mockContentSvc = {
      currentMetaData: null,
      currentContentReadMetaData: null,
      currentBatchEnrollmentList: [],
    }
    service = new ViewerUtilService(mockHttp, mockConfigSvc, mockContentSvc)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Creation / defaults
  // ──────────────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should expose markAsCompleteSubject', () => {
    expect(service.markAsCompleteSubject).toBeTruthy()
  })

  it('should expose autoPlayNextVideo subject', () => {
    expect(service.autoPlayNextVideo).toBeTruthy()
  })

  it('should expose autoPlayNextAudio subject', () => {
    expect(service.autoPlayNextAudio).toBeTruthy()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // fetchManifestFile
  // ──────────────────────────────────────────────────────────────────────────
  describe('fetchManifestFile', () => {
    it('should call http.get with the url', async () => {
      mockHttp.get.mockReturnValue(of({ manifest: true }))
      const result = await service.fetchManifestFile('https://example.com/manifest.json')
      expect(mockHttp.get).toHaveBeenCalledWith('https://example.com/manifest.json')
      expect(result).toEqual({ manifest: true })
    })

    it('should return undefined on http.get error', async () => {
      const { throwError } = await import('rxjs')
      mockHttp.get.mockReturnValue(throwError(() => new Error('fail')))
      const result = await service.fetchManifestFile('https://example.com/manifest.json')
      expect(result).toBeUndefined()
    })

    it('should call setS3Cookie internally (via http.post)', async () => {
      await service.fetchManifestFile('https://example.com/manifest.json')
      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // realTimeProgressUpdate (no-op)
  // ──────────────────────────────────────────────────────────────────────────
  describe('realTimeProgressUpdate', () => {
    it('should not throw and be a no-op', () => {
      expect(() => service.realTimeProgressUpdate('content-001', {})).not.toThrow()
    })

    it('should not call http', () => {
      service.realTimeProgressUpdate('content-001', {})
      expect(mockHttp.patch).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getContent
  // ──────────────────────────────────────────────────────────────────────────
  describe('getContent', () => {
    it('should call the read API endpoint', () => {
      mockHttp.get.mockReturnValue(of({ result: { content: { identifier: 'c1' } } }))
      service.getContent('c1').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('c1'))
    })

    it('should map response to result.content', (done) => {
      mockHttp.get.mockReturnValue(of({ result: { content: { identifier: 'c1', name: 'Test' } } }))
      service.getContent('c1').subscribe(data => {
        expect(data.name).toBe('Test')
        done()
      })
    })

    it('should return empty object when result.content is null', (done) => {
      mockHttp.get.mockReturnValue(of({ result: { content: null } }))
      service.getContent('c1').subscribe(data => {
        expect(data).toEqual({})
        done()
      })
    })

    it('should return null when data is null', (done) => {
      mockHttp.get.mockReturnValue(of(null))
      service.getContent('c1').subscribe(data => {
        expect(data).toBeNull()
        done()
      })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getAuthoringUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('getAuthoringUrl', () => {
    it('should return empty string for empty url', () => {
      expect(service.getAuthoringUrl('')).toBe('')
    })

    it('should return authContent path for content-store url', () => {
      const result = service.getAuthoringUrl('https://example.com/content-store/path/file.html')
      expect(result).toContain('/apis/authContent/')
      expect(result).toContain('content-store')
    })

    it('should return encoded URL for non-content-store url', () => {
      const result = service.getAuthoringUrl('https://example.com/other/file.html')
      expect(result).toContain('/apis/authContent/')
      expect(result).toContain(encodeURIComponent('https://example.com/other/file.html'))
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // regexDownloadReplace
  // ──────────────────────────────────────────────────────────────────────────
  describe('regexDownloadReplace', () => {
    it('should return authoringBase + encoded group1 + group2', () => {
      const result = service.regexDownloadReplace('', '/content-store/path/file.html', '"')
      expect(result).toBe('/apis/authContent/' + encodeURIComponent('/content-store/path/file.html') + '"')
    })

    it('should handle empty group2', () => {
      const result = service.regexDownloadReplace('', '/content-store/test', '')
      expect(result).toBe('/apis/authContent/' + encodeURIComponent('/content-store/test'))
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // replaceToAuthUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('replaceToAuthUrl', () => {
    it('should return processed data object', () => {
      const data = { url: 'https://example.com/non-matching/file.html' }
      const result = service.replaceToAuthUrl(data)
      expect(result).toEqual(data)
    })

    it('should replace content-store URLs in data', () => {
      const data = { url: 'https://example.com/content-store/path/file.html"' }
      const result = service.replaceToAuthUrl(data)
      expect(JSON.stringify(result)).toContain('/apis/authContent/')
    })

    it('should handle nested objects', () => {
      const data = { nested: { url: 'https://example.com/no-match' } }
      const result = service.replaceToAuthUrl(data)
      expect(result.nested.url).toBe('https://example.com/no-match')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // realTimeProgressUpdateQuiz
  // ──────────────────────────────────────────────────────────────────────────
  describe('realTimeProgressUpdateQuiz', () => {
    it('should call http.patch when userProfile exists', () => {
      service.realTimeProgressUpdateQuiz('content-001', 'col-001', 'batch-001', 2)
      expect(mockHttp.patch).toHaveBeenCalledWith(
        expect.stringContaining('content-001'),
        expect.any(Object),
      )
    })

    it('should use status 2 as default when no status provided', () => {
      service.realTimeProgressUpdateQuiz('content-001', 'col-001', 'batch-001')
      const req = mockHttp.patch.mock.calls[0][1]
      expect(req.request.contents[0].status).toBe(2)
    })

    it('should use provided status value', () => {
      service.realTimeProgressUpdateQuiz('content-001', 'col-001', 'batch-001', 1)
      const req = mockHttp.patch.mock.calls[0][1]
      expect(req.request.contents[0].status).toBe(1)
    })

    it('should include userId from userProfile', () => {
      service.realTimeProgressUpdateQuiz('content-001', 'col-001', 'batch-001')
      const req = mockHttp.patch.mock.calls[0][1]
      expect(req.request.userId).toBe('user-001')
    })

    it('should not call http.patch when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      service.realTimeProgressUpdateQuiz('content-001', 'col-001', 'batch-001')
      expect(mockHttp.patch).not.toHaveBeenCalled()
    })

    it('should include batchId in request', () => {
      service.realTimeProgressUpdateQuiz('content-001', 'col-001', 'batch-001')
      const req = mockHttp.patch.mock.calls[0][1]
      expect(req.request.contents[0].batchId).toBe('batch-001')
    })

    it('should include courseId in request', () => {
      service.realTimeProgressUpdateQuiz('content-001', 'col-001', 'batch-001')
      const req = mockHttp.patch.mock.calls[0][1]
      expect(req.request.contents[0].courseId).toBe('col-001')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getBatchIdAndCourseId
  // ──────────────────────────────────────────────────────────────────────────
  describe('getBatchIdAndCourseId', () => {
    it('should return original courseId and batchId when no content metadata', () => {
      mockContentSvc.currentMetaData = null
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result).toEqual({ courseId: 'course-001', batchId: 'batch-001' })
    })

    it('should return original data when cumulativeTracking is false', () => {
      mockContentSvc.currentMetaData = { primaryCategory: 'Program', children: [] }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: false }
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result).toEqual({ courseId: 'course-001', batchId: 'batch-001' })
    })

    it('should return original data when primaryCategory is not a program type', () => {
      mockContentSvc.currentMetaData = { primaryCategory: 'Course', children: [] }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result).toEqual({ courseId: 'course-001', batchId: 'batch-001' })
    })

    it('should update courseId and batchId when COURSE child has resourceId in childNodes', () => {
      mockContentSvc.currentMetaData = {
        primaryCategory: 'Program',
        children: [{
          primaryCategory: 'Course',
          identifier: 'child-course-001',
          childNodes: ['resource-001'],
        }],
      }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      mockContentSvc.currentBatchEnrollmentList = [{
        contentId: 'child-course-001',
        batch: { batchId: 'child-batch-001' },
      }]
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result.courseId).toBe('child-course-001')
      expect(result.batchId).toBe('child-batch-001')
    })

    it('should not update when COURSE child does not contain resourceId in childNodes', () => {
      mockContentSvc.currentMetaData = {
        primaryCategory: 'Program',
        children: [{
          primaryCategory: 'Course',
          identifier: 'child-course-001',
          childNodes: ['other-resource'],
        }],
      }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      mockContentSvc.currentBatchEnrollmentList = [{
        contentId: 'child-course-001',
        batch: { batchId: 'child-batch-001' },
      }]
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result).toEqual({ courseId: 'course-001', batchId: 'batch-001' })
    })

    it('should not update when COURSE child enrollment list is empty', () => {
      mockContentSvc.currentMetaData = {
        primaryCategory: 'Program',
        children: [{
          primaryCategory: 'Course',
          identifier: 'child-course-001',
          childNodes: ['resource-001'],
        }],
      }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      mockContentSvc.currentBatchEnrollmentList = []
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result).toEqual({ courseId: 'course-001', batchId: 'batch-001' })
    })

    it('should handle CURATED_PROGRAM with COURSE child', () => {
      mockContentSvc.currentMetaData = {
        primaryCategory: 'Curated Program',
        children: [{
          primaryCategory: 'Course',
          identifier: 'child-course-001',
          childNodes: ['resource-001'],
        }],
      }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      mockContentSvc.currentBatchEnrollmentList = [{
        contentId: 'child-course-001',
        batch: { batchId: 'curated-batch' },
      }]
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result.batchId).toBe('curated-batch')
    })

    it('should handle BLENDED_PROGRAM with non-COURSE child containing resourceId', () => {
      mockContentSvc.currentMetaData = {
        primaryCategory: 'Blended Program',
        identifier: 'blended-001',
        childNodes: ['resource-001'],
        children: [{
          primaryCategory: 'Offline Session',
          identifier: 'session-001',
        }],
      }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      mockContentSvc.currentBatchEnrollmentList = [{
        contentId: 'blended-001',
        batch: { batchId: 'blended-batch' },
      }]
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result.batchId).toBe('blended-batch')
      expect(result.courseId).toBe('blended-001')
    })

    it('should not update for BLENDED_PROGRAM when resourceId not in childNodes', () => {
      mockContentSvc.currentMetaData = {
        primaryCategory: 'Blended Program',
        identifier: 'blended-001',
        childNodes: ['other-resource'],
        children: [{
          primaryCategory: 'Offline Session',
          identifier: 'session-001',
        }],
      }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      mockContentSvc.currentBatchEnrollmentList = [{
        contentId: 'blended-001',
        batch: { batchId: 'blended-batch' },
      }]
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result).toEqual({ courseId: 'course-001', batchId: 'batch-001' })
    })

    it('should not update for BLENDED_PROGRAM when enrollment list is empty', () => {
      mockContentSvc.currentMetaData = {
        primaryCategory: 'Blended Program',
        identifier: 'blended-001',
        childNodes: ['resource-001'],
        children: [{
          primaryCategory: 'Offline Session',
        }],
      }
      mockContentSvc.currentContentReadMetaData = { cumulativeTracking: true }
      mockContentSvc.currentBatchEnrollmentList = []
      const result = service.getBatchIdAndCourseId('course-001', 'batch-001', 'resource-001')
      expect(result).toEqual({ courseId: 'course-001', batchId: 'batch-001' })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getPublicUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('getPublicUrl', () => {
    it('should build public URL from content path', () => {
      const result = service.getPublicUrl('https://old.example.com/content/path/file.html')
      expect(result).toBe('https://cdn.example.com/my-bucket/content/path/file.html')
    })

    it('should return base URL when content path is absent', () => {
      const result = service.getPublicUrl('https://old.example.com')
      expect(result).toContain('https://cdn.example.com')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getFormById
  // ──────────────────────────────────────────────────────────────────────────
  describe('getFormById', () => {
    it('should call http.get with the correct form endpoint', () => {
      service.getFormById('form-123').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('form-123'))
    })

    it('should return an observable', () => {
      const result = service.getFormById('form-123')
      expect(result).toBeTruthy()
      expect(typeof result.subscribe).toBe('function')
    })
  })
})
