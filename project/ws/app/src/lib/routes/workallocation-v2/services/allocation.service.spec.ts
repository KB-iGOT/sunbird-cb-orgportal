import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { AllocationService } from './allocation.service'
import { EMPTY } from 'rxjs'

describe('AllocationService', () => {
  let service: AllocationService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AllocationService]
    })

    service = TestBed.inject(AllocationService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('onSearchUser', () => {
    it('should make a GET request to search users', () => {
      const testSearchTerm = 'testUser'
      const mockResponse = { users: [{ id: '1', name: 'Test User' }] }

      service.onSearchUser(testSearchTerm).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`apis/proxies/v8/user/v1/autocomplete/${testSearchTerm}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('onSearchRole', () => {
    it('should make a GET request to search roles', () => {
      const testRoleTerm = 'admin'
      const mockResponse = { roles: [{ id: '1', name: 'Admin' }] }

      service.onSearchRole(testRoleTerm).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`apis/protected/v8/roleactivity/${testRoleTerm}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('onSearchPosition', () => {
    it('should make a POST request to search positions', () => {
      const testRequest = { searchTerm: 'manager' }
      const mockResponse = { positions: [{ id: '1', name: 'Manager' }] }

      service.onSearchPosition(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('apis/protected/v8/frac/searchNodes')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })
  })

  describe('onSearchActivity', () => {
    it('should make a POST request to search activities', () => {
      const testRequest = { searchTerm: 'reporting' }
      const mockResponse = { activities: [{ id: '1', name: 'Reporting' }] }

      service.onSearchActivity(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('apis/protected/v8/frac/searchNodes')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })
  })

  describe('onSearchCompetency', () => {
    it('should make a GET request to search competencies', () => {
      const testCompetencyTerm = 'leadership'
      const mockResponse = { competencies: [{ id: '1', name: 'Leadership' }] }

      service.onSearchCompetency(testCompetencyTerm).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`/apis/protected/v8/frac/COMPETENCY/${testCompetencyTerm}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('createAllocation', () => {
    it('should make a POST request to create allocation', () => {
      const testRequest = { userId: '1', workDetails: {} }
      const mockResponse = { id: '123', status: 'success' }

      service.createAllocation(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('apis/protected/v8/workallocation/add')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })
  })

  describe('createAllocationV2', () => {
    it('should make a POST request to create allocation v2', () => {
      const testRequest = { userId: '1', workDetails: {} }
      const mockResponse = { id: '123', status: 'success' }

      service.createAllocationV2(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('/apis/protected/v8/workallocation/v2/add')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })
  })

  describe('updateAllocationV2', () => {
    it('should make a POST request when request is different from previous', () => {
      const testRequest = { id: '123', userId: '1', workDetails: {} }
      const mockResponse = { status: 'success' }

      service.updateAllocationV2(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('/apis/protected/v8/workallocation/v2/update')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })

    it('should return EMPTY when request is same as previous', () => {
      const testRequest = { id: '123', userId: '1', workDetails: {} }
      const mockResponse = { status: 'success' }

      // First call to set the oldObj
      service.updateAllocationV2(testRequest).subscribe()
      const req = httpMock.expectOne('/apis/protected/v8/workallocation/v2/update')
      req.flush(mockResponse)

      // Second call with the same request
      let result
      service.updateAllocationV2(testRequest).subscribe(res => {
        result = res
      })

      // No HTTP request should be made for the second call
      httpMock.expectNone('/apis/protected/v8/workallocation/v2/update')

      // Expect result to be EMPTY
      expect(result).toBe(EMPTY)
    })
  })

  describe('updateAllocation', () => {
    it('should make a POST request to update allocation', () => {
      const testRequest = { id: '123', changes: {} }
      const mockResponse = { status: 'success' }

      service.updateAllocation(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('apis/protected/v8/workallocation/update')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })
  })

  describe('getUsers', () => {
    it('should make a POST request to get users', () => {
      const testRequest = { departmentId: '123' }
      const mockResponse = { users: [{ id: '1', name: 'User 1' }] }

      service.getUsers(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('/apis/protected/v8/workallocation/userSearch')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })
  })

  describe('getAllocationDetails', () => {
    it('should make a POST request to get allocation details', () => {
      const testRequest = { allocationId: '123' }
      const mockResponse = { details: { id: '123', workDetails: {} } }

      service.getAllocationDetails(testRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne('/apis/protected/v8/workallocation/userSearch')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(testRequest)
      req.flush(mockResponse)
    })
  })

  describe('getAllocatedUsers', () => {
    it('should make a GET request to get allocated users', () => {
      const testId = '123'
      const mockResponse = { users: [{ id: '1', name: 'User 1' }] }

      service.getAllocatedUsers(testId).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`/apis/protected/v8/workallocation/getWorkOrderById/${testId}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })
})