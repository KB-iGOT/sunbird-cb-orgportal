
import { of } from 'rxjs'
import { ProfileV2Service } from './home.servive'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn()
}))

describe('ProfileV2Service', () => {
  let service: ProfileV2Service
  let mockHttpClient: any
  let mockLodash: any

  beforeEach(() => {
    // Create mock HttpClient
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    }

    // Get mocked lodash
    mockLodash = require('lodash')

    // Create service instance
    service = new ProfileV2Service(mockHttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchDiscussProfile', () => {
    it('should fetch discuss profile for given wid', (done) => {
      const mockWid = 'test-wid-123'
      const mockResponse = { id: 'test-id', name: 'Test User' }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchDiscussProfile(mockWid).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.get).toHaveBeenCalledWith(`/apis/protected/v8/discussionHub/users/${mockWid}`)
        done()
      })
    })
  })

  describe('fetchProfile', () => {
    it('should fetch profile and return profiledetails', (done) => {
      const mockUserId = 'user-123'
      const mockResponse = {
        profiledetails: { id: 'profile-1', name: 'John Doe' }
      }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchProfile(mockUserId).subscribe(result => {
        expect(result).toEqual(mockResponse.profiledetails)
        expect(mockHttpClient.get).toHaveBeenCalledWith(`/apis/proxies/v8/api/user/v2/read/${mockUserId}`)
        done()
      })
    })

    it('should return empty array if profiledetails is undefined', (done) => {
      const mockUserId = 'user-123'
      const mockResponse = {}

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.fetchProfile(mockUserId).subscribe(result => {
        expect(result).toEqual([])
        done()
      })
    })
  })

  describe('fetchPost', () => {
    it('should make POST request with given request data', (done) => {
      const mockRequest = { postId: 'post-123' }
      const mockResponse = { posts: [] }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchPost(mockRequest).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/apis/protected/v8/social/post/viewConversation',
          mockRequest
        )
        done()
      })
    })
  })

  describe('checkIsUserAdmin', () => {
    it('should check if user is admin', (done) => {
      const mockResponse = { isAdmin: true }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.checkIsUserAdmin().subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/protected/v8/portal/isAdmin/mdo')
        done()
      })
    })
  })

  describe('getMyDepartmentAll', () => {
    it('should get all department users', (done) => {
      const mockResponse = { departments: [] }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getMyDepartmentAll().subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/mydepartment?allUsers=true')
        done()
      })
    })
  })

  describe('getUserDetails', () => {
    it('should get user details with timestamp', (done) => {
      const mockResponse = { user: { id: '123' } }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getUserDetails().subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.get).toHaveBeenCalledWith(
          expect.stringMatching(/^\/apis\/protected\/v8\/user\/details\?ts='\d+$/)
        )
        done()
      })
    })
  })

  describe('getFilterEntity', () => {
    it('should get filter entity and map competency result', (done) => {
      const mockFilter = { type: 'skill' }
      const mockResponse = { result: { competency: ['skill1', 'skill2'] } }
      const mockMappedResult = ['skill1', 'skill2']

      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockLodash.get.mockReturnValue(mockMappedResult)

      service.getFilterEntity(mockFilter).subscribe(result => {
        expect(result).toEqual(mockMappedResult)
        expect(mockHttpClient.post).toHaveBeenCalledWith('apis/proxies/v8/competency/v4/search', mockFilter)
        expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.competency')
        done()
      })
    })
  })

  describe('getFilterEntityV2', () => {
    it('should get filter entity V2 and map framework categories', (done) => {
      const mockResponse = { result: { framework: { categories: ['cat1', 'cat2'] } } }
      const mockMappedResult = ['cat1', 'cat2']

      mockHttpClient.get.mockReturnValue(of(mockResponse))
      mockLodash.get.mockReturnValue(mockMappedResult)

      service.getFilterEntityV2().subscribe(result => {
        expect(result).toEqual(mockMappedResult)
        expect(mockHttpClient.get).toHaveBeenCalledWith('apis/proxies/v8/framework/v1/read/kcmfinal_fw')
        expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.framework.categories')
        done()
      })
    })
  })

  describe('getRequestTypeList', () => {
    it('should get request type list and map content result', (done) => {
      const mockRequest = { search: 'test' }
      const mockResponse = { result: { response: { content: ['type1', 'type2'] } } }
      const mockMappedResult = ['type1', 'type2']

      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockLodash.get.mockReturnValue(mockMappedResult)

      service.getRequestTypeList(mockRequest).subscribe(result => {
        expect(result).toEqual(mockMappedResult)
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/org/v1/search', mockRequest)
        expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.response.content')
        done()
      })
    })
  })

  describe('createDemand', () => {
    it('should create demand request', (done) => {
      const mockRequest = { demand: 'test demand' }
      const mockResponse = { success: true }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.createDemand(mockRequest).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/demand/content/create', mockRequest)
        done()
      })
    })
  })

  describe('getRequestList', () => {
    it('should get request list and map result', (done) => {
      const mockRequest = { filter: 'active' }
      const mockResponse = { result: { result: ['request1', 'request2'] } }
      const mockMappedResult = ['request1', 'request2']

      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockLodash.get.mockReturnValue(mockMappedResult)

      service.getRequestList(mockRequest).subscribe(result => {
        expect(result).toEqual(mockMappedResult)
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/demand/content/search', mockRequest)
        expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.result')
        done()
      })
    })
  })

  describe('markAsInvalid', () => {
    it('should mark request as invalid', (done) => {
      const mockRequest = { id: 'request-123', status: 'invalid' }
      const mockResponse = { success: true }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.markAsInvalid(mockRequest).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/demand/content/v1/update/status', mockRequest)
        done()
      })
    })
  })

  describe('getRequestDataById', () => {
    it('should get request data by ID and map result', (done) => {
      const mockDemandId = 'demand-123'
      const mockResponse = { result: { result: { id: 'demand-123', data: 'test' } } }
      const mockMappedResult = { id: 'demand-123', data: 'test' }

      mockHttpClient.get.mockReturnValue(of(mockResponse))
      mockLodash.get.mockReturnValue(mockMappedResult)

      service.getRequestDataById(mockDemandId).subscribe(result => {
        expect(result).toEqual(mockMappedResult)
        expect(mockHttpClient.get).toHaveBeenCalledWith(`apis/proxies/v8/demand/content/read/${mockDemandId}`)
        expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.result')
        done()
      })
    })
  })

  describe('getOrgInterestList', () => {
    it('should get organization interest list and map result', (done) => {
      const mockRequest = { orgId: 'org-123' }
      const mockResponse = { result: { result: ['interest1', 'interest2'] } }
      const mockMappedResult = ['interest1', 'interest2']

      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockLodash.get.mockReturnValue(mockMappedResult)

      service.getOrgInterestList(mockRequest).subscribe(result => {
        expect(result).toEqual(mockMappedResult)
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/interest/v1/search', mockRequest)
        expect(mockLodash.get).toHaveBeenCalledWith(mockResponse, 'result.result')
        done()
      })
    })
  })

  describe('assignToOrg', () => {
    it('should assign request to organization', (done) => {
      const mockRequest = { requestId: 'req-123', orgId: 'org-456' }
      const mockResponse = { success: true }

      mockHttpClient.put.mockReturnValue(of(mockResponse))

      service.assignToOrg(mockRequest).subscribe(result => {
        expect(result).toEqual(mockResponse)
        expect(mockHttpClient.put).toHaveBeenCalledWith('/apis/proxies/v8/interest/v1/assign', mockRequest)
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('should handle HTTP errors in fetchProfile', (done) => {
      const mockUserId = 'user-123'
      const mockError = new Error('HTTP Error')

      mockHttpClient.get.mockReturnValue(of().pipe(() => {
        throw mockError
      }))

      service.fetchProfile(mockUserId).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error).toBe(mockError)
          done()
        }
      })
    })

    it('should handle HTTP errors in createDemand', (done) => {
      const mockRequest = { demand: 'test' }
      const mockError = new Error('Network Error')

      mockHttpClient.post.mockReturnValue(of().pipe(() => {
        throw mockError
      }))

      service.createDemand(mockRequest).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error).toBe(mockError)
          done()
        }
      })
    })
  })
})