import { ResourceCollectionService } from './resource-collection.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

describe('ResourceCollectionService', () => {
  let service: ResourceCollectionService
  let mockHttp: jest.Mocked<HttpClient>

  const BASE = '/apis/protected/v8/user/exercise'

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
    } as any

    service = new ResourceCollectionService(mockHttp)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the service', () => {
    expect(service).toBeTruthy()
  })

  describe('getAllSubmission', () => {
    it('should call GET with correct URL for type and contentId', () => {
      const mockResponse = [{ id: 'sub1' }]
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.getAllSubmission('all', 'content123').subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttp.get).toHaveBeenCalledWith(`${BASE}/getSubmissions?type=all&contentId=content123`)
    })

    it('should handle different type values', () => {
      mockHttp.get.mockReturnValue(of([]))

      service.getAllSubmission('my', 'content456').subscribe()

      expect(mockHttp.get).toHaveBeenCalledWith(`${BASE}/getSubmissions?type=my&contentId=content456`)
    })
  })

  describe('createContentDirectory', () => {
    it('should call POST with correct URL and null body', () => {
      mockHttp.post.mockReturnValue(of({ success: true }))

      service.createContentDirectory('content123').subscribe()

      expect(mockHttp.post).toHaveBeenCalledWith(`${BASE}/createContentDirectory/content123`, null)
    })
  })

  describe('uploadFile', () => {
    it('should call POST with correct URL and formData', () => {
      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.pdf'))
      mockHttp.post.mockReturnValue(of({ contentUrl: 'http://test.com/file' }))

      service.uploadFile(formData, 'content123').subscribe()

      expect(mockHttp.post).toHaveBeenCalledWith(`${BASE}/uploadFileToContentDirectory/content123`, formData)
    })
  })

  describe('postSubmission', () => {
    it('should call POST with correct URL and request data', () => {
      const requestData = { submission_type: 'application/pdf', url: 'http://test.com/file' }
      mockHttp.post.mockReturnValue(of({ response: 'Success' }))

      service.postSubmission(requestData, 'content123').subscribe()

      expect(mockHttp.post).toHaveBeenCalledWith(`${BASE}/postsubmission/content123`, requestData)
    })
  })

  describe('readContentTextFile', () => {
    it('should call GET with correct URL and text responseType', () => {
      const testUrl = 'http://test.com/file.txt'
      mockHttp.get.mockReturnValue(of('file content'))

      service.readContentTextFile(testUrl).subscribe()

      expect(mockHttp.get).toHaveBeenCalledWith(testUrl, { responseType: 'text' })
    })
  })
})

