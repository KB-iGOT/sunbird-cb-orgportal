import { TrainingPlanService } from './traininig-plan.service'
import { of } from 'rxjs'

const API_END_POINTS = {
  CREATE_PLAN: 'apis/proxies/v8/cbplan/v1/create',
  READ_PLAN: 'apis/proxies/v8/cbplan/v1/read',
  UPDATE_PLAN: 'apis/proxies/v8/cbplan/v1/update',
  ARCHIVE_PLAN: 'apis/proxies/v8/cbplan/v1/archive',
  PUBLISH_PLAN: 'apis/proxies/v8/cbplan/v1/publish',
  GET_ALL_CONTENT: 'apis/proxies/v8/sunbirdigot/search',
  GET_ALL_USERS: 'apis/proxies/v8/user/v1/search',
  GET_ALL_DESIGNATIONS: 'apis/proxies/v8/masterData/v2/deptPosition',
  GET_PROVIDERS: 'apis/proxies/v8/searchBy/provider',
  GET_FILTER_ENTITY: 'apis/proxies/v8/competency/v4/search',
  CREATE_NEWCONTENT: 'apis/proxies/v8/cbplan/v1/admin/requestcontent',
  CREATE_PLAN_V2: 'apis/proxies/v8/cbplan/v2/create',
  UPDATE_PLAN_V2: 'apis/proxies/v8/cbplan/v2/update',
  PUBLISH_PLAN_V2: 'apis/proxies/v8/cbplan/v2/publish',
  READ_PLAN_V2: 'apis/proxies/v8/cbplan/v2/read',
  ARCHIVE_PLAN_V2: 'apis/proxies/v8/cbplan/v2/archive',
}

describe('TrainingPlanService', () => {
  let service: TrainingPlanService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    }
    service = new TrainingPlanService(mockHttp)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('createPlan', () => {
    it('should POST to CREATE_PLAN and return result', (done) => {
      const mockObj = { name: 'Test Plan' }
      const mockResponse = { result: { id: '123', name: 'Test Plan' } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.createPlan(mockObj).subscribe(result => {
        expect(result).toEqual({ id: '123', name: 'Test Plan' })
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.CREATE_PLAN, mockObj)
        done()
      })
    })

    it('should return undefined when result property is missing', (done) => {
      mockHttp.post.mockReturnValue(of({ data: 'no result key' }))
      service.createPlan({}).subscribe(result => {
        expect(result).toBeUndefined()
        done()
      })
    })
  })

  describe('readPlan', () => {
    it('should GET plan by planId', (done) => {
      const mockResponse = { id: '123', name: 'Test Plan' }
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.readPlan('123').subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.get).toHaveBeenCalledWith(`${API_END_POINTS.READ_PLAN}/123`)
        done()
      })
    })
  })

  describe('updatePlan', () => {
    it('should POST to UPDATE_PLAN and return result', (done) => {
      const mockObj = { id: '123', name: 'Updated Plan' }
      const mockResponse = { result: { id: '123', name: 'Updated Plan' } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.updatePlan(mockObj).subscribe(result => {
        expect(result).toEqual({ id: '123', name: 'Updated Plan' })
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.UPDATE_PLAN, mockObj)
        done()
      })
    })

    it('should return undefined when result is missing', (done) => {
      mockHttp.post.mockReturnValue(of({}))
      service.updatePlan({}).subscribe(result => {
        expect(result).toBeUndefined()
        done()
      })
    })
  })

  describe('archivePlan', () => {
    it('should DELETE with correct options', (done) => {
      const mockObj = { id: '123' }
      const mockResponse = { success: true }
      mockHttp.delete.mockReturnValue(of(mockResponse))

      service.archivePlan(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.delete).toHaveBeenCalledWith(
          API_END_POINTS.ARCHIVE_PLAN,
          expect.objectContaining({ body: mockObj })
        )
        done()
      })
    })
  })

  describe('publishPlan', () => {
    it('should POST to PUBLISH_PLAN', (done) => {
      const mockObj = { id: '123' }
      const mockResponse = { success: true }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.publishPlan(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.PUBLISH_PLAN, mockObj)
        done()
      })
    })
  })

  describe('getAllContent', () => {
    it('should POST to GET_ALL_CONTENT and return result', (done) => {
      const filter = { query: 'test' }
      const mockResponse = { result: { courses: [{ id: '1' }] } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.getAllContent(filter).subscribe(result => {
        expect(result).toEqual({ courses: [{ id: '1' }] })
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.GET_ALL_CONTENT, filter)
        done()
      })
    })
  })

  describe('getCustomUsers', () => {
    it('should POST to GET_ALL_USERS and return result.response', (done) => {
      const filter = { query: 'user' }
      const mockResponse = { result: { response: { users: [{ id: 'u1' }] } } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.getCustomUsers(filter).subscribe(result => {
        expect(result).toEqual({ users: [{ id: 'u1' }] })
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.GET_ALL_USERS, filter)
        done()
      })
    })
  })

  describe('getDesignations', () => {
    it('should GET designations', (done) => {
      const mockResponse = [{ name: 'Engineer' }]
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.getDesignations().subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.get).toHaveBeenCalledWith(API_END_POINTS.GET_ALL_DESIGNATIONS)
        done()
      })
    })
  })

  describe('getFilterEntity', () => {
    it('should POST to GET_FILTER_ENTITY and return result.competency', (done) => {
      const filter = { term: 'test' }
      const mockResponse = { result: { competency: [{ id: 'c1' }] } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.getFilterEntity(filter).subscribe(result => {
        expect(result).toEqual([{ id: 'c1' }])
        done()
      })
    })
  })

  describe('getProviders', () => {
    it('should GET providers', (done) => {
      const mockResponse = [{ id: 'p1', name: 'Provider' }]
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.getProviders().subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.get).toHaveBeenCalledWith(API_END_POINTS.GET_PROVIDERS)
        done()
      })
    })
  })

  describe('createNewContentrequest', () => {
    it('should POST to CREATE_NEWCONTENT', (done) => {
      const mockObj = { contentId: 'c123' }
      const mockResponse = { success: true }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.createNewContentrequest(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.CREATE_NEWCONTENT, mockObj)
        done()
      })
    })
  })

  describe('V2 API methods', () => {
    it('createPlanV2 should POST to CREATE_PLAN_V2 and return result', (done) => {
      const mockObj = { name: 'Plan V2' }
      const mockResponse = { result: { id: 'v2-123' } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.createPlanV2(mockObj).subscribe(result => {
        expect(result).toEqual({ id: 'v2-123' })
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.CREATE_PLAN_V2, mockObj)
        done()
      })
    })

    it('updatePlanV2 should POST to UPDATE_PLAN_V2 and return result', (done) => {
      const mockObj = { id: 'v2-123' }
      const mockResponse = { result: { id: 'v2-123' } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.updatePlanV2(mockObj).subscribe(result => {
        expect(result).toEqual({ id: 'v2-123' })
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.UPDATE_PLAN_V2, mockObj)
        done()
      })
    })

    it('publishPlanV2 should POST to PUBLISH_PLAN_V2', (done) => {
      const mockObj = { id: 'v2-123' }
      const mockResponse = { success: true }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.publishPlanV2(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.PUBLISH_PLAN_V2, mockObj)
        done()
      })
    })

    it('readPlanV2 should GET plan V2 by planId', (done) => {
      const mockResponse = { id: 'v2-123' }
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.readPlanV2('v2-123').subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.get).toHaveBeenCalledWith(`${API_END_POINTS.READ_PLAN_V2}/v2-123`)
        done()
      })
    })

    it('archivePlanV2 should DELETE with correct options', (done) => {
      const mockObj = { id: 'v2-123' }
      const mockResponse = { success: true }
      mockHttp.delete.mockReturnValue(of(mockResponse))

      service.archivePlanV2(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttp.delete).toHaveBeenCalledWith(
          API_END_POINTS.ARCHIVE_PLAN_V2,
          expect.objectContaining({ body: mockObj })
        )
        done()
      })
    })
  })
})

