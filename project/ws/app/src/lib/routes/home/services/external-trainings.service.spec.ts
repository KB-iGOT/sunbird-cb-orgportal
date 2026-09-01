import { ExternalTrainingsService } from './external-trainings.service'
import { of } from 'rxjs'

describe('ExternalTrainingsService', () => {
  let service: ExternalTrainingsService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
      put: jest.fn().mockReturnValue(of({})),
      patch: jest.fn().mockReturnValue(of({})),
    }

    service = new ExternalTrainingsService(mockHttp as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('createExternalTraining', () => {
    it('should call http.post with correct URL', () => {
      const request = { request: { event: {} } }
      service.createExternalTraining(request).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/externaltraining/v4/create', request)
    })
  })

  describe('uploadTemplate', () => {
    it('should create FormData and call http.post', () => {
      const file = new File(['content'], 'template.svg', { type: 'image/svg+xml' })
      const formData = new FormData()
      formData.append('content', file, file.name)
      service.uploadTemplate(formData).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/storage/v1/uploadCiosIcon',
        expect.any(FormData)
      )
    })
  })

  describe('setTrainingName', () => {
    it('should emit training name via trainingName$', (done) => {
      service.trainingName$.subscribe((name: any) => {
        if (name === 'Test Training') {
          expect(name).toBe('Test Training')
          done()
        }
      })
      service.setTrainingName('Test Training')
    })
  })

  describe('publishExternalTraining', () => {
    it('should call http.post with identifier in URL', () => {
      const formData = { request: { event: { identifier: 'ext123' } } }
      service.publishExternalTraining(formData).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/externaltraining/v4/publish/ext123',
        formData
      )
    })
  })

  describe('mergeLogo', () => {
    it('should call http.post with FormData', () => {
      const formData = new FormData()
      service.mergeLogo(formData).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/externaltraining/v4/merge-logo', formData)
    })
  })

  describe('getApprovalsList', () => {
    it('should call http.post with correct URL', () => {
      const request = { filters: {} }
      service.getApprovalsList(request).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', request)
    })
  })

  describe('updateApprovalStatus', () => {
    it('should call http.put with correct URL', () => {
      const request = { status: 'approved' }
      service.updateApprovalStatus(request).subscribe()
      expect(mockHttp.put).toHaveBeenCalledWith('/apis/proxies/v8/learner/achievement/status/update', request)
    })
  })

  describe('getAchievementDetails', () => {
    it('should call http.get with achievementId in URL', () => {
      service.getAchievementDetails('ach123').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/learner/achievement/ach123')
    })
  })

  describe('getExternalTrainingDetails', () => {
    it('should call http.get with identifier in URL', () => {
      service.getExternalTrainingDetails('ext456').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/externaltraining/v4/read/ext456')
    })
  })

  describe('createBatch', () => {
    it('should call http.post with correct URL', () => {
      const request = { batch: {} }
      service.createBatch(request).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/externaltraining/batch/create', request)
    })
  })

  describe('getDefaultTemplate', () => {
    it('should call http.get with correct URL', () => {
      service.getDefaultTemplate().subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/data/v1/system/settings/get/defaultCertTemplate')
    })
  })

  describe('fetchTemplateByUrl', () => {
    it('should call http.get with URL and blob responseType', () => {
      service.fetchTemplateByUrl('https://example.com/template.svg').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith('https://example.com/template.svg', { responseType: 'blob' })
    })
  })

  describe('createContent', () => {
    it('should call http.post with correct URL', () => {
      const request = { request: { content: {} } }
      service.createContent(request).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/action/content/v3/create', request)
    })
  })

  describe('uploadContent', () => {
    it('should call http.post with identifier in URL', () => {
      const formData = new FormData()
      service.uploadContent('content123', formData).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/upload/action/content/v3/upload/content123',
        formData
      )
    })
  })

  describe('bulkUsersUpload', () => {
    it('should call http.post with eventId and batchId in URL', () => {
      const formData = new FormData()
      service.bulkUsersUpload(formData, 'event1', 'batch1').subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/externaltraining/v1/bulkupload/event1/batch1',
        formData
      )
    })
  })

  describe('downloadSampleFile', () => {
    it('should call http.get with blob responseType', () => {
      service.downloadSampleFile().subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/externaltraining/v1/bulkupload/sample',
        { responseType: 'blob' }
      )
    })
  })

  describe('getParticipantsList', () => {
    it('should call http.post with correct URL', () => {
      const request = { filters: {} }
      service.getParticipantsList(request).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/externaltraining/v1/batch/getParticipants',
        request
      )
    })
  })

  describe('getFileLogs', () => {
    it('should call http.get with query params', () => {
      service.getFileLogs('training1', 'batch1').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(
        'apis/proxies/v8/externaltraining/v1/bulkupload/status?eventId=training1&batchId=batch1'
      )
    })
  })

  describe('addCertTemplate', () => {
    it('should call http.patch with correct URL', () => {
      const request = { template: {} }
      service.addCertTemplate(request).subscribe()
      expect(mockHttp.patch).toHaveBeenCalledWith(
        '/apis/proxies/v8/event/batch/cert/template/add',
        request
      )
    })
  })

  describe('trainingName$', () => {
    it('should initially emit empty string', (done) => {
      service.trainingName$.subscribe((name: any) => {
        expect(name).toBe('')
        done()
      })
    })
  })
})
