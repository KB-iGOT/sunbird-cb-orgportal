import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { AllocationService } from './allocation.service'

describe('AllocationService', () => {
  let service: AllocationService
  let httpMock: HttpTestingController

  const API_END_POINTS = {
    SEARCH_USER: 'apis/proxies/v8/user/v1/autocomplete',
    SEARCH_ROLE: 'apis/protected/v8/roleactivity',
    SEARCH_NODES: 'apis/protected/v8/frac/searchNodes',
    CREATE_ALLOCATION: 'apis/protected/v8/workallocation/add',
    UPDATE_ALLOCATION: 'apis/protected/v8/workallocation/update',
    USERS: '/apis/protected/v8/workallocation/userSearch',
    SEARCH_COMPETENCY: '/apis/protected/v8/frac/COMPETENCY',
  }

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
    it('should make GET request to search user endpoint', () => {
      const mockVal = 'testUser'
      const mockResponse = { users: ['user1', 'user2'] }

      service.onSearchUser(mockVal).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`${API_END_POINTS.SEARCH_USER}/${mockVal}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should handle error when searching user', () => {
      const mockVal = 'testUser'
      const errorMessage = 'User not found'

      service.onSearchUser(mockVal).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(404)
        }
      })

      const req = httpMock.expectOne(`${API_END_POINTS.SEARCH_USER}/${mockVal}`)
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' })
    })
  })

  describe('onSearchRole', () => {
    it('should make GET request to search role endpoint', () => {
      const mockVal = 'testRole'
      const mockResponse = { roles: ['role1', 'role2'] }

      service.onSearchRole(mockVal).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`${API_END_POINTS.SEARCH_ROLE}/${mockVal}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should handle error when searching role', () => {
      const mockVal = 'testRole'

      service.onSearchRole(mockVal).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(500)
        }
      })

      const req = httpMock.expectOne(`${API_END_POINTS.SEARCH_ROLE}/${mockVal}`)
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' })
    })
  })

  describe('onSearchPosition', () => {
    it('should make POST request to search position endpoint', () => {
      const mockRequest = { type: 'POSITION', query: 'manager' }
      const mockResponse = { positions: ['position1', 'position2'] }

      service.onSearchPosition(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.SEARCH_NODES)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockRequest)
      req.flush(mockResponse)
    })
  })

  describe('onSearchActivity', () => {
    it('should make POST request to search activity endpoint', () => {
      const mockRequest = { type: 'ACTIVITY', query: 'development' }
      const mockResponse = { activities: ['activity1', 'activity2'] }

      service.onSearchActivity(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.SEARCH_NODES)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockRequest)
      req.flush(mockResponse)
    })
  })

  describe('onSearchCompetency', () => {
    it('should make GET request to search competency endpoint', () => {
      const mockVal = 'testCompetency'
      const mockResponse = { competencies: ['comp1', 'comp2'] }

      service.onSearchCompetency(mockVal).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`${API_END_POINTS.SEARCH_COMPETENCY}/${mockVal}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('createAllocation', () => {
    it('should make POST request to create allocation endpoint', () => {
      const mockRequest = {
        userId: 'user123',
        roleId: 'role456',
        startDate: '2025-01-01'
      }
      const mockResponse = { success: true, id: 'allocation123' }

      service.createAllocation(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.CREATE_ALLOCATION)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockRequest)
      req.flush(mockResponse)
    })

    it('should handle error when creating allocation', () => {
      const mockRequest = { userId: 'user123' }

      service.createAllocation(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400)
        }
      })

      const req = httpMock.expectOne(API_END_POINTS.CREATE_ALLOCATION)
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' })
    })
  })

  describe('updateAllocation', () => {
    it('should make POST request to update allocation endpoint', () => {
      const mockRequest = {
        id: 'allocation123',
        userId: 'user123',
        roleId: 'role456'
      }
      const mockResponse = { success: true }

      service.updateAllocation(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.UPDATE_ALLOCATION)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockRequest)
      req.flush(mockResponse)
    })
  })

  describe('getUsers', () => {
    it('should make POST request to get users endpoint', () => {
      const mockRequest = { department: 'IT', active: true }
      const mockResponse = { users: ['user1', 'user2', 'user3'] }

      service.getUsers(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.USERS)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockRequest)
      req.flush(mockResponse)
    })
  })

  describe('getAllocationDetails', () => {
    it('should make POST request to get allocation details endpoint', () => {
      const mockRequest = { allocationId: 'allocation123' }
      const mockResponse = {
        id: 'allocation123',
        userId: 'user123',
        roleId: 'role456',
        status: 'active'
      }

      service.getAllocationDetails(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(API_END_POINTS.USERS)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockRequest)
      req.flush(mockResponse)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null/undefined values in onSearchUser', () => {
      const mockVal = null
      const mockResponse = { users: [] }

      service.onSearchUser(mockVal).subscribe(response => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`${API_END_POINTS.SEARCH_USER}/${mockVal}`)
      req.flush(mockResponse)
    })

    it('should handle empty request object in createAllocation', () => {
      const mockRequest = {}
      const mockResponse = { error: 'Invalid request' }

      service.createAllocation(mockRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse)
        }
      })

      const req = httpMock.expectOne(API_END_POINTS.CREATE_ALLOCATION)
      expect(req.request.body).toEqual(mockRequest)
      req.flush(mockResponse)
    })
  })
})