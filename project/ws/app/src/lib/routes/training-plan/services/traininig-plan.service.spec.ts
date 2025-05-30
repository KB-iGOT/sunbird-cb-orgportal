import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TrainingPlanService } from './traininig-plan.service'

describe('TrainingPlanService', () => {
  let service: TrainingPlanService
  let httpMock: HttpTestingController

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
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrainingPlanService]
    })
    service = TestBed.inject(TrainingPlanService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('createPlan', () => {
    it('should create a plan and return result from response', () => {
      const mockObj = { name: 'Test Plan' }
      const mockResponse = { result: { id: '123', name: 'Test Plan' } }
      const expectedResult = { id: '123', name: 'Test Plan' }

      service.createPlan(mockObj).subscribe(result => {
        expect(result).toEqual(expectedResult)
      })

      const req = httpMock.expectOne(API_END_POINTS.CREATE_PLAN)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockObj)
      req.flush(mockResponse)
    })

    it('should handle response without result property', () => {
      const mockObj = { name: 'Test Plan' }
      const mockResponse = { data: 'some data' }

      service.createPlan(mockObj).subscribe(result => {
        expect(result).toBeUndefined()
      })

      const req = httpMock.expectOne(API_END_POINTS.CREATE_PLAN)
      req.flush(mockResponse)
    })
  })

  describe('readPlan', () => {
    it('should read a plan by planId', () => {
      const planId = '123'
      const mockResponse = { id: '123', name: 'Test Plan' }

      service.readPlan(planId).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`${API_END_POINTS.READ_PLAN}/${planId}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('updatePlan', () => {
    it('should update a plan and return result from response', () => {
      const mockObj = { id: '123', name: 'Updated Plan' }
      const mockResponse = { result: { id: '123', name: 'Updated Plan' } }
      const expectedResult = { id: '123', name: 'Updated Plan' }

      service.updatePlan(mockObj).subscribe(result => {
        expect(result).toEqual(expectedResult)
      })

      const req = httpMock.expectOne(API_END_POINTS.UPDATE_PLAN)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockObj)
      req.flush(mockResponse)
    })

    it('should handle response without result property', () => {
      const mockObj = { id: '123', name: 'Updated Plan' }
      const mockResponse = { data: 'some data' }

      service.updatePlan(mockObj).subscribe(result => {
        expect(result).toBeUndefined()
      })

      const req = httpMock.expectOne(API_END_POINTS.UPDATE_PLAN)
      req.flush(mockResponse)
    })
  })

  describe('archivePlan', () => {
    it('should archive a plan with proper headers and body', () => {
      const mockObj = { id: '123' }
      const mockResponse = { success: true }

      service.archivePlan(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.ARCHIVE_PLAN)
      expect(req.request.method).toBe('DELETE')
      expect(req.request.body).toEqual(mockObj)
      expect(req.request.headers.get('Content-Type')).toBe('application/json')
      req.flush(mockResponse)
    })
  })

  describe('publishPlan', () => {
    it('should publish a plan', () => {
      const mockObj = { id: '123' }
      const mockResponse = { published: true }

      service.publishPlan(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.PUBLISH_PLAN)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockObj)
      req.flush(mockResponse)
    })
  })

  describe('getAllContent', () => {
    it('should get all content with filter and return result from response', () => {
      const mockFilter = { search: 'test' }
      const mockResponse = { result: { content: ['content1', 'content2'] } }
      const expectedResult = { content: ['content1', 'content2'] }

      service.getAllContent(mockFilter).subscribe(result => {
        expect(result).toEqual(expectedResult)
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_ALL_CONTENT)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockFilter)
      req.flush(mockResponse)
    })

    it('should handle response without result property', () => {
      const mockFilter = { search: 'test' }
      const mockResponse = { data: 'some data' }

      service.getAllContent(mockFilter).subscribe(result => {
        expect(result).toBeUndefined()
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_ALL_CONTENT)
      req.flush(mockResponse)
    })

    it('should retry once on failure and then succeed', () => {
      const mockFilter = { search: 'test' }
      const mockResponse = { result: { content: ['content1'] } }
      const expectedResult = { content: ['content1'] }

      service.getAllContent(mockFilter).subscribe(result => {
        expect(result).toEqual(expectedResult)
      })

      // First request fails
      const req1 = httpMock.expectOne(API_END_POINTS.GET_ALL_CONTENT)
      req1.flush('Error', { status: 500, statusText: 'Internal Server Error' })

      // Second request (retry) succeeds
      const req2 = httpMock.expectOne(API_END_POINTS.GET_ALL_CONTENT)
      req2.flush(mockResponse)
    })
  })

  describe('getCustomUsers', () => {
    it('should get custom users with filter and return result.response from response', () => {
      const mockFilter = { search: 'user' }
      const mockResponse = { result: { response: ['user1', 'user2'] } }
      const expectedResult = ['user1', 'user2']

      service.getCustomUsers(mockFilter).subscribe(result => {
        expect(result).toEqual(expectedResult)
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_ALL_USERS)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockFilter)
      req.flush(mockResponse)
    })

    it('should handle response without nested result.response property', () => {
      const mockFilter = { search: 'user' }
      const mockResponse = { data: 'some data' }

      service.getCustomUsers(mockFilter).subscribe(result => {
        expect(result).toBeUndefined()
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_ALL_USERS)
      req.flush(mockResponse)
    })

    it('should handle response with result but without response property', () => {
      const mockFilter = { search: 'user' }
      const mockResponse = { result: { data: 'some data' } }

      service.getCustomUsers(mockFilter).subscribe(result => {
        expect(result).toBeUndefined()
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_ALL_USERS)
      req.flush(mockResponse)
    })
  })

  describe('getDesignations', () => {
    it('should get all designations', () => {
      const mockResponse = { designations: ['designation1', 'designation2'] }

      service.getDesignations().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_ALL_DESIGNATIONS)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('getFilterEntity', () => {
    it('should get filter entity and return result.competency from response', () => {
      const mockFilter = { type: 'competency' }
      const mockResponse = { result: { competency: ['comp1', 'comp2'] } }
      const expectedResult = ['comp1', 'comp2']

      service.getFilterEntity(mockFilter).subscribe(result => {
        expect(result).toEqual(expectedResult)
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_FILTER_ENTITY)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockFilter)
      req.flush(mockResponse)
    })

    it('should handle response without nested result.competency property', () => {
      const mockFilter = { type: 'competency' }
      const mockResponse = { data: 'some data' }

      service.getFilterEntity(mockFilter).subscribe(result => {
        expect(result).toBeUndefined()
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_FILTER_ENTITY)
      req.flush(mockResponse)
    })

    it('should handle response with result but without competency property', () => {
      const mockFilter = { type: 'competency' }
      const mockResponse = { result: { data: 'some data' } }

      service.getFilterEntity(mockFilter).subscribe(result => {
        expect(result).toBeUndefined()
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_FILTER_ENTITY)
      req.flush(mockResponse)
    })
  })

  describe('getProviders', () => {
    it('should get all providers', () => {
      const mockResponse = { providers: ['provider1', 'provider2'] }

      service.getProviders().subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.GET_PROVIDERS)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('createNewContentrequest', () => {
    it('should create new content request', () => {
      const mockObj = { title: 'New Content' }
      const mockResponse = { id: '456', title: 'New Content' }

      service.createNewContentrequest(mockObj).subscribe(result => {
        expect(result).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.CREATE_NEWCONTENT)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockObj)
      req.flush(mockResponse)
    })
  })
})