import { AchievementsService } from './achievements.service'
import { of } from 'rxjs'

describe('AchievementsService', () => {
  let service: AchievementsService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockReturnValue(of({})),
      put: jest.fn().mockReturnValue(of({})),
      get: jest.fn().mockReturnValue(of({})),
    }
    service = new AchievementsService(mockHttp)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getApprovalsList', () => {
    it('should POST to the approvals list endpoint with the given request', () => {
      const req = { filterCriteriaMap: { status: ['PENDING'] } }
      service.getApprovalsList(req)
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/learner/achievement/search',
        req,
      )
    })

    it('should return the observable from http.post', (done) => {
      const mockResponse = { result: { data: [] } }
      mockHttp.post.mockReturnValue(of(mockResponse))
      service.getApprovalsList({}).subscribe((res) => {
        expect(res).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('updateApprovalStatus', () => {
    it('should PUT to the status update endpoint with the given request', () => {
      const req = { request: { id: 'abc', status: 'APPROVED' } }
      service.updateApprovalStatus(req)
      expect(mockHttp.put).toHaveBeenCalledWith(
        '/apis/proxies/v8/learner/achievement/status/update',
        req,
      )
    })

    it('should return the observable from http.put', (done) => {
      const mockResponse = { responseCode: 'OK' }
      mockHttp.put.mockReturnValue(of(mockResponse))
      service.updateApprovalStatus({}).subscribe((res) => {
        expect(res).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('getAchievementDetails', () => {
    it('should GET with the correct achievement id in the URL', () => {
      service.getAchievementDetails('id123')
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/learner/achievement/id123',
      )
    })

    it('should return the observable from http.get', (done) => {
      const mockDetail = { id: 'id123', title: 'Test' }
      mockHttp.get.mockReturnValue(of(mockDetail))
      service.getAchievementDetails('id123').subscribe((res) => {
        expect(res).toEqual(mockDetail)
        done()
      })
    })
  })
})

