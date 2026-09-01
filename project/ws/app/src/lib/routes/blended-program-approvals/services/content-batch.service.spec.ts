import { ContentBatchService } from './content-batch.service'
import { of, throwError } from 'rxjs'

// Mock dependencies
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn()
}

const mockConfigurationsService = {
  sitePath: 'http://localhost:3000'
}

// Mock global objects
const mockBlob = jest.fn()
const mockURL = {
  createObjectURL: jest.fn().mockReturnValue('mock-url'),
  revokeObjectURL: jest.fn()
}
const mockDocument = {
  createElement: jest.fn().mockReturnValue({
    href: '',
    download: '',
    style: { visibility: '' },
    setAttribute: jest.fn(),
    click: jest.fn()
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
}
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

// Setup global mocks
global.Blob = mockBlob as any
global.URL = mockURL as any
global.document = mockDocument as any
global.navigator = mockNavigator as any
global.window = { URL: mockURL } as any

describe('ContentBatchService', () => {
  let service: ContentBatchService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ContentBatchService(
      mockHttpClient as any,
      mockConfigurationsService as any
    )
  })

  describe('createABatch', () => {
    it('should create a batch successfully', () => {
      const mockData = { batchName: 'Test Batch' }
      const mockResponse = { result: { batchId: '123' } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.createABatch(mockData).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/authApi/batch/create',
        mockData
      )
    })
  })

  describe('updateABatch', () => {
    it('should update a batch successfully', () => {
      const mockData = { batchId: '123', batchName: 'Updated Batch' }
      const mockResponse = { result: { success: true } }
      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      service.updateABatch(mockData).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/apis/authApi/batch/update',
        mockData
      )
    })
  })

  describe('createABatchCertificate', () => {
    it('should create a batch certificate successfully', () => {
      const mockData = { batchId: '123', certificateTemplate: 'template' }
      const mockResponse = { result: { success: true } }
      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      service.createABatchCertificate(mockData).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/apis/authApi/batch/addCert',
        mockData
      )
    })
  })

  describe('fetchBatchLearners', () => {
    it('should fetch batch learners successfully', () => {
      const mockData = { batchId: '123' }
      const mockResponse = { result: { learners: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchBatchLearners(mockData).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/authApi/batch/getUserProgress',
        mockData
      )
    })
  })

  describe('fetchBatchLearnersList', () => {
    it('should fetch batch learners list with default parameters', () => {
      const mockBatch = { courseId: 'course123', batchId: 'batch123' }
      const mockResponse = { result: { learners: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchBatchLearnersList(mockBatch).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/authApi/batch/getUserProgressV2',
        {
          request: {
            courseId: 'course123',
            batchId: 'batch123',
            limit: 10,
            offset: 0
          }
        }
      )
    })

    it('should fetch batch learners list with custom parameters', () => {
      const mockBatch = { collectionId: 'collection123', batchId: 'batch123' }
      const mockResponse = { result: { learners: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchBatchLearnersList(mockBatch, 20, 5).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/authApi/batch/getUserProgressV2',
        {
          request: {
            courseId: 'collection123',
            batchId: 'batch123',
            limit: 20,
            offset: 5
          }
        }
      )
    })
  })

  describe('inviteUserToBatch', () => {
    it('should invite user to batch successfully', () => {
      const mockData = { batchId: '123', userIds: ['user1'] }
      const mockResponse = { result: { success: true } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.inviteUserToBatch(mockData).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/program/v2/admin/bulkEnroll',
        mockData
      )
    })
  })

  describe('getCertificateConfig', () => {
    it('should get certificate config successfully', async () => {
      const mockConfig = { template: 'default' }
      mockHttpClient.get.mockReturnValue(of(mockConfig))

      const result = await service.getCertificateConfig()

      expect(result).toEqual(mockConfig)
      expect(service.certificateConfig).toEqual(mockConfig)
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'http://localhost:3000/feature/certificate.json'
      )
    })
  })

  describe('updateBlendedRequests', () => {
    it('should update blended requests successfully', () => {
      const mockReq = { requestId: '123' }
      const mockResponse = { result: { success: true } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.updateBlendedRequests(mockReq).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/blendedprogram/workflow/update',
        mockReq
      )
    })
  })

  describe('fetchUserBatchList', () => {
    it('should fetch user batch list without query params', () => {
      const userId = 'user123'
      const mockResponse = {
        result: {
          courses: [{ courseId: 'course1' }, { courseId: 'course2' }]
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchUserBatchList(userId).subscribe(result => {
        expect(result).toEqual(mockResponse.result.courses)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/learner/course/v1/user/enrollment/list/user123?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,primaryCategory,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,identifier,medium,pkgVersion,board,subject,trackable,posterImage,duration,creatorLogo,license,version,versionKey&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates'
      )
    })

    it('should fetch user batch list with query params', () => {
      const userId = 'user123'
      const queryParams = {
        orgdetails: 'orgName',
        licenseDetails: 'name',
        fields: 'contentType',
        batchDetails: 'name'
      }
      const mockResponse = {
        result: {
          courses: [{ courseId: 'course1' }]
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchUserBatchList(userId, queryParams).subscribe(result => {
        expect(result).toEqual(mockResponse.result.courses)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/proxies/v8/learner/course/v1/user/enrollment/list/user123?orgdetails=orgName&licenseDetails=name&fields=contentType&batchDetails=name'
      )
    })

    it('should handle error in fetchUserBatchList', () => {
      const userId = 'user123'
      const errorEvent = new ErrorEvent('error', { message: 'Network error' })
      mockHttpClient.get.mockReturnValue(throwError(errorEvent))

      service.fetchUserBatchList(userId).subscribe(
        () => { },
        error => {
          expect(error).toBe('Error: Network error')
        }
      )
    })
  })

  describe('handleError', () => {
    it('should handle ErrorEvent properly', () => {
      const errorEvent = {
        error: new ErrorEvent('error', { message: 'Test error' })
      } as any

      const result = service.handleError(errorEvent)

      result.subscribe(
        () => { },
        error => {
          expect(error).toBe('Error: Test error')
        }
      )
    })

    it('should handle non-ErrorEvent errors', () => {
      const errorEvent = {
        error: { message: 'Regular error' }
      } as any

      const result = service.handleError(errorEvent)

      result.subscribe(
        () => { },
        error => {
          expect(error).toBe('')
        }
      )
    })
  })

  describe('downloadCert', () => {
    it('should download certificate', () => {
      const certId = 'cert123'
      const mockResponse = { result: { certificateUrl: 'url' } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.downloadCert(certId).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/protected/v8/cohorts/course/batch/cert/download/cert123'
      )
    })
  })

  describe('defaultCertTemplate', () => {
    it('should get default certificate template', () => {
      const mockResponse = { result: { template: 'default' } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.defaultCertTemplate().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/data/v1/system/settings/get/defaultCertTemplate'
      )
    })
  })

  describe('attachDefCert', () => {
    it('should attach default certificate', () => {
      const reqdata = { templateId: 'template123' }
      const mockResponse = { result: { success: true } }
      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      service.attachDefCert(reqdata).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/apis/proxies/v8/course/batch/cert/v1/template/add',
        reqdata
      )
    })
  })

  describe('fetchCustomAttributes', () => {
    it('should fetch custom attributes', () => {
      const mockResponse = { result: { attributes: [] } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchCustomAttributes().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/data/v2/system/settings/get/bpEnrolMandatoryProfileFields'
      )
    })
  })

  describe('createSurvey', () => {
    it('should create survey', () => {
      const reqData = { surveyName: 'Test Survey' }
      const mockResponse = null
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.createSurvey(reqData).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/forms/createForm',
        reqData
      )
    })
  })

  describe('getBpReportStatusApi', () => {
    it('should get BP report status', () => {
      const reqBody = { reportId: 'report123' }
      const mockResponse = null
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.getBpReportStatusApi(reqBody).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/bp/v1/bpreport/status',
        reqBody
      )
    })
  })

  describe('generateBpReport', () => {
    it('should generate BP report', () => {
      const reqBody = { batchId: 'batch123' }
      const mockResponse = null
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.generateBpReport(reqBody).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/bp/v1/generate/report',
        reqBody
      )
    })
  })

  describe('downloadReport', () => {
    it('should download report', () => {
      const fileUrl = 'report.xlsx'
      const fileName = 'test-report.xlsx'
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      mockHttpClient.get.mockReturnValue(of(mockBlob))

      service.downloadReport(fileUrl, fileName)

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/proxies/v8/bp/v1/bpreport/download/report.xlsx',
        { responseType: 'blob' }
      )
    })
  })

  describe('fetchCadredetails', () => {
    it('should fetch cadre details', () => {
      const mockResponse = { result: { cadres: [] } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchCadredetails().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'apis/proxies/v8/data/v2/system/settings/get/cadreConfig'
      )
    })
  })

  describe('readContentLive', () => {
    it('should read content live', () => {
      const contentId = 'content123'
      const mockResponse = {
        result: {
          content: { identifier: 'content123', name: 'Test Content' }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.readContentLive(contentId).subscribe(result => {
        expect(result).toEqual(mockResponse.result.content)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/authApi/action/content/v3/hierarchy/content123'
      )
    })
  })

  describe('validateUser', () => {
    it('should validate user', () => {
      const request = { userId: 'user123' }
      const mockResponse = { result: { user: {} } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result = service.validateUser(request)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/user/v1/search',
        request
      )
    })
  })

  describe('getDepartments', () => {
    it('should get departments', () => {
      const request = { orgId: 'org123' }
      const mockResponse = { result: { departments: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.getDepartments(request).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/masterData/v2/admin/deptPosition',
        request
      )
    })
  })

  describe('getOrgs', () => {
    it('should get organizations', () => {
      const mockResponse = { result: { organizations: [] } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getOrgs().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/portal/v1/admin/listDeptNames'
      )
    })
  })

  describe('downloadFile', () => {
    it('should download file for non-Safari browser', () => {
      const mockData = [
        { email: 'test@example.com', status: 'active', mobile: '1234567890', message: 'success' }
      ]
      const filename = 'test-file'

      service.downloadFile(mockData, filename)

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
      expect(mockURL.createObjectURL).toHaveBeenCalled()
      expect(mockDocument.body.appendChild).toHaveBeenCalled()
      expect(mockDocument.body.removeChild).toHaveBeenCalled()
    })

    it('should download file for Safari browser', () => {
      const originalUserAgent = mockNavigator.userAgent
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15'

      const mockData = [
        { email: 'test@example.com', status: 'active', mobile: '1234567890', message: 'success' }
      ]

      service.downloadFile(mockData)

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')

      // Restore original user agent
      mockNavigator.userAgent = originalUserAgent
    })

    it('should download file with default filename', () => {
      const mockData = [
        { email: 'test@example.com', status: 'active', mobile: '1234567890', message: 'success' }
      ]

      service.downloadFile(mockData)

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    })
  })

  describe('convertToCSV', () => {
    it('should convert object array to CSV', () => {
      const objArray = [
        { email: 'test1@example.com', status: 'active', mobile: '1111111111', message: 'success' },
        { email: 'test2@example.com', status: 'inactive', mobile: '2222222222', message: 'failed' }
      ]
      const headerList = ['email', 'status', 'mobile', 'message']

      const result = service.convertToCSV(objArray, headerList)

      expect(result).toContain('S.No,email ,status ,mobile ,message')
      expect(result).toContain('1 , test1@example.com, active, 1111111111, success')
      expect(result).toContain('2 , test2@example.com, inactive, 2222222222, failed')
    })

    it('should handle JSON string input', () => {
      const objArray = JSON.stringify([
        { email: 'test@example.com', status: 'active', mobile: '1234567890', message: 'success' }
      ])
      const headerList = ['email', 'status']

      const result = service.convertToCSV(objArray, headerList)

      expect(result).toContain('S.No,email ,status')
      expect(result).toContain('1 , test@example.com, active')
    })

    it('should handle empty array elements', () => {
      const objArray = [
        { email: 'test@example.com', status: 'active' },
        null,
        { email: 'test2@example.com', status: 'inactive' }
      ]
      const headerList = ['email', 'status']

      const result = service.convertToCSV(objArray, headerList)

      expect(result).toContain('1 , test@example.com, active')
      expect(result).toContain('3 , test2@example.com, inactive')
    })
  })

  describe('downloadPendingRequestCSV', () => {
    it('should download pending request CSV', () => {
      const request = { batchId: 'batch123' }
      const mockResponse = 'csv,data\ntest,value'
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.downloadPendingRequestCSV(request).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/workflow/blendedprogram/getUserApprovalDataInCsv',
        request,
        {
          responseType: 'text' as 'json',
          withCredentials: true
        }
      )
    })
  })

  describe('approveRejectUser', () => {
    it('should approve/reject user', () => {
      const request = { userIds: ['user1'], action: 'approve' }
      const collectionId = 'collection123'
      const mockResponse = 'success'
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result = service.approveRejectUser(request, collectionId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/workflow/blendedprogram/bulkApprovalDataFromCsv/collection123',
        request,
        {
          responseType: 'text' as 'json',
          withCredentials: true
        }
      )
    })
  })
})