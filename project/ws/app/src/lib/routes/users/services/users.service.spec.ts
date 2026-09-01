import { UsersService } from './users.service'
import { of } from 'rxjs'

describe('UsersService', () => {
  let service: UsersService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ result: { response: { content: [], count: 0 } } })),
      post: jest.fn().mockReturnValue(of({ result: { response: { content: [], count: 0 } } })),
      patch: jest.fn().mockReturnValue(of({ result: 'ok' })),
      put: jest.fn().mockReturnValue(of({ result: 'ok' })),
      delete: jest.fn().mockReturnValue(of({ result: 'ok' })),
    }
    service = new UsersService(mockHttp)
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(service).toBeTruthy()
    expect(service.TOTAL_USERS_LIMIT).toBe(10000)
  })

  it('should expose observable subjects', () => {
    expect(service.handleContentPageChange).toBeDefined()
    expect(service.filterToggle).toBeDefined()
    expect(service.clearFilter).toBeDefined()
    expect(service.getFilterDataObject).toBeDefined()
    expect(service.mentorList$).toBeDefined()
  })

  // ─── getAllUsers ────────────────────────────────────────────────────────────
  describe('getAllUsers', () => {
    it('should POST to search endpoint and return result.response', done => {
      mockHttp.post.mockReturnValue(of({ result: { response: { content: [{ id: '1' }] } } }))
      service.getAllUsers({ filters: {} }).subscribe(res => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', { filters: {} })
        expect(res).toEqual({ content: [{ id: '1' }] })
        done()
      })
    })
  })

  // ─── getAllUsersV3 ──────────────────────────────────────────────────────────
  describe('getAllUsersV3', () => {
    it('should POST to v3 search endpoint and return result.response', done => {
      mockHttp.post.mockReturnValue(of({ result: { response: { content: [] } } }))
      service.getAllUsersV3({ filters: {} }).subscribe(res => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v3/search', { filters: {} })
        expect(res).toEqual({ content: [] })
        done()
      })
    })
  })

  // ─── getMyDepartment ───────────────────────────────────────────────────────
  describe('getMyDepartment', () => {
    it('should GET my department', done => {
      service.getMyDepartment().subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/mydepartment?allUsers=true')
        done()
      })
    })
  })

  // ─── createUser ────────────────────────────────────────────────────────────
  describe('createUser', () => {
    it('should POST to createUser endpoint', done => {
      const req = { name: 'Test User' }
      service.createUser(req).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('apis/protected/v8/user/profileDetails/createUser', req)
        done()
      })
    })
  })

  // ─── getUserById ───────────────────────────────────────────────────────────
  describe('getUserById', () => {
    it('should GET user by id when userid is provided', done => {
      mockHttp.get.mockReturnValue(of({ result: { response: { id: 'user1' } } }))
      service.getUserById('user1').subscribe(res => {
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/user1')
        expect(res).toEqual({ id: 'user1' })
        done()
      })
    })

    it('should GET current user when userid is empty', done => {
      mockHttp.get.mockReturnValue(of({ result: { response: { id: 'current' } } }))
      service.getUserById('').subscribe(res => {
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read')
        expect(res).toEqual({ id: 'current' })
        done()
      })
    })
  })

  // ─── createUserById ────────────────────────────────────────────────────────
  describe('createUserById', () => {
    it('should POST to createUserById endpoint', done => {
      const req = { name: 'Test' }
      service.createUserById('id1', req).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/protected/v8/user/profileRegistry/createUserRegistryV2/id1', req)
        done()
      })
    })
  })

  // ─── addUserToRole ─────────────────────────────────────────────────────────
  describe('addUserToRole', () => {
    it('should POST to add user role endpoint', done => {
      const req = { roles: ['mdo_admin'] }
      service.addUserToRole(req).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/private/v1/assign/role', req)
        done()
      })
    })
  })

  // ─── getWfHistoryByAppId ───────────────────────────────────────────────────
  describe('getWfHistoryByAppId', () => {
    it('should GET workflow history by app id', done => {
      service.getWfHistoryByAppId('app123').subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('apis/protected/v8/workflowhandler/historyByApplicationId/app123')
        done()
      })
    })
  })

  // ─── onSearchUserByEmail ───────────────────────────────────────────────────
  describe('onSearchUserByEmail', () => {
    it('should POST to search user by email', done => {
      const req = {}
      service.onSearchUserByEmail('test@test.com', req).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('apis/protected/v8/user/autocomplete/department/test@test.com', req)
        done()
      })
    })
  })

  // ─── blockUser / deActiveUser / activeUser / deleteUser ───────────────────
  describe('blockUser', () => {
    it('should PATCH to block user', done => {
      service.blockUser({ userId: 'u1' }).subscribe(() => {
        expect(mockHttp.patch).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/deptAction/userrole/', { userId: 'u1' })
        done()
      })
    })
  })

  describe('deActiveUser', () => {
    it('should POST to deactivate user', done => {
      service.deActiveUser({ userId: 'u1' }).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/user/v1/block/', { userId: 'u1' })
        done()
      })
    })
  })

  describe('activeUser', () => {
    it('should PATCH to activate user', done => {
      service.activeUser({ userId: 'u1' }).subscribe(() => {
        expect(mockHttp.patch).toHaveBeenCalledWith('apis/proxies/v8/user/v1/unblock/', { userId: 'u1' })
        done()
      })
    })
  })

  describe('deleteUser', () => {
    it('should PATCH to delete user', done => {
      service.deleteUser({ userId: 'u1' }).subscribe(() => {
        expect(mockHttp.patch).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/deptAction/userrole/', { userId: 'u1' })
        done()
      })
    })
  })

  // ─── newBlockUser / newUnBlockUser ─────────────────────────────────────────
  describe('newBlockUser', () => {
    it('should POST to block user with request body', done => {
      service.newBlockUser('admin', 'user1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/block', {
          request: { userId: 'user1', requestedBy: 'admin' },
        })
        done()
      })
    })
  })

  describe('newUnBlockUser', () => {
    it('should POST to unblock user with request body', done => {
      service.newUnBlockUser('admin', 'user1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/unblock', {
          request: { userId: 'user1', requestedBy: 'admin' },
        })
        done()
      })
    })
  })

  // ─── getAllKongUsers ────────────────────────────────────────────────────────
  describe('getAllKongUsers', () => {
    it('should POST to GET_ALL_USERS', done => {
      const reqBody = { request: { filters: {} } }
      service.getAllKongUsers(reqBody).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', reqBody)
        done()
      })
    })
  })

  // ─── getAllRoleUsers ────────────────────────────────────────────────────────
  describe('getAllRoleUsers', () => {
    it('should POST and map to role and count', done => {
      mockHttp.post.mockReturnValue(of({ result: { response: { count: 5 } } }))
      service.getAllRoleUsers('dep1', 'mdo_admin').subscribe(res => {
        expect(res).toEqual({ role: 'mdo_admin', count: 5 })
        done()
      })
    })
  })

  // ─── getRolesCountsApi ─────────────────────────────────────────────────────
  describe('getRolesCountsApi', () => {
    it('should POST to search endpoint', done => {
      const reqBody = { request: {} }
      service.getRolesCountsApi(reqBody).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', reqBody)
        done()
      })
    })
  })

  // ─── getTotalRoleUsers ─────────────────────────────────────────────────────
  describe('getTotalRoleUsers', () => {
    it('should POST and map to role and response', done => {
      mockHttp.post.mockReturnValue(of({ result: { response: { content: [] } } }))
      service.getTotalRoleUsers('dep1', 'mdo_leader').subscribe(res => {
        expect(res.role).toBe('mdo_leader')
        done()
      })
    })
  })

  // ─── searchUserByenter ─────────────────────────────────────────────────────
  describe('searchUserByenter', () => {
    it('should POST to search table endpoint with correct body', done => {
      service.searchUserByenter('john', 'org1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', {
          request: { query: 'john', filters: { rootOrgId: 'org1' } },
        })
        done()
      })
    })
  })

  // ─── checkForUserReport ────────────────────────────────────────────────────
  describe('checkForUserReport', () => {
    it('should GET given url', done => {
      service.checkForUserReport('/some/report/url').subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/some/report/url')
        done()
      })
    })
  })

  // ─── getDesignations ───────────────────────────────────────────────────────
  describe('getDesignations', () => {
    it('should GET designations endpoint', done => {
      service.getDesignations().subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/positions')
        done()
      })
    })
  })

  // ─── searchIgotDesignation / searchDesignation ────────────────────────────
  describe('searchIgotDesignation', () => {
    it('should POST to sunbirdigot v4 search', done => {
      const req = { filters: {} }
      service.searchIgotDesignation(req).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/v4/search', req)
        done()
      })
    })
  })

  describe('searchDesignation', () => {
    it('should POST to designation search', done => {
      const req = { filters: {} }
      service.searchDesignation(req).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/designation/search', req)
        done()
      })
    })
  })

  // ─── updateUserDetails ─────────────────────────────────────────────────────
  describe('updateUserDetails', () => {
    it('should POST to updateUserDetails endpoint', done => {
      const body = { name: 'Updated' }
      service.updateUserDetails(body).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/admin/extPatch', body)
        done()
      })
    })
  })

  // ─── sendOtp / resendOtp / verifyOTP ──────────────────────────────────────
  describe('sendOtp', () => {
    it('should POST with correct OTP request body', done => {
      service.sendOtp('9999999999', 'phone').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/generate', {
          request: { type: 'phone', key: '9999999999' },
        })
        done()
      })
    })
  })

  describe('resendOtp', () => {
    it('should POST with correct resend OTP request body', done => {
      service.resendOtp('user@test.com', 'email').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/generate', {
          request: { type: 'email', key: 'user@test.com' },
        })
        done()
      })
    })
  })

  describe('verifyOTP', () => {
    it('should POST with otp, type and key', done => {
      service.verifyOTP(123456, 'user@test.com', 'email').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/otp/v1/verify', {
          request: { otp: 123456, type: 'email', key: 'user@test.com' },
        })
        done()
      })
    })
  })

  // ─── getMasterLanguages / getGroups / getMasterNationlity ─────────────────
  describe('getMasterLanguages', () => {
    it('should GET master languages', done => {
      service.getMasterLanguages().subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/user/profileRegistry/getMasterLanguages')
        done()
      })
    })
  })

  describe('getGroups', () => {
    it('should GET groups', done => {
      service.getGroups().subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/api/user/v1/groups')
        done()
      })
    })
  })

  describe('getMasterNationlity', () => {
    it('should GET master nationalities', done => {
      service.getMasterNationlity().subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/user/profileRegistry/getMasterNationalities')
        done()
      })
    })
  })

  // ─── editProfileDetails ────────────────────────────────────────────────────
  describe('editProfileDetails', () => {
    it('should POST to editProfileDetails endpoint', done => {
      const data = { firstName: 'John' }
      service.editProfileDetails(data).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', data)
        done()
      })
    })
  })

  // ─── listApprovalPendingFields / fetchApprovalPendingFields ───────────────
  describe('listApprovalPendingFields', () => {
    it('should POST with SEND_FOR_APPROVAL status', done => {
      service.listApprovalPendingFields().subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/v2/userWFApplicationFieldsSearch', {
          serviceName: 'profile',
          applicationStatus: 'SEND_FOR_APPROVAL',
        })
        done()
      })
    })
  })

  describe('fetchApprovalPendingFields', () => {
    it('should POST with SEND_FOR_APPROVAL status (alias method)', done => {
      service.fetchApprovalPendingFields().subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/v2/userWFApplicationFieldsSearch', {
          serviceName: 'profile',
          applicationStatus: 'SEND_FOR_APPROVAL',
        })
        done()
      })
    })
  })

  // ─── listRejectedFields ────────────────────────────────────────────────────
  describe('listRejectedFields', () => {
    it('should POST with REJECTED status', done => {
      service.listRejectedFields().subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/v2/userWFApplicationFieldsSearch', {
          serviceName: 'profile',
          applicationStatus: 'REJECTED',
        })
        done()
      })
    })
  })

  // ─── fetchPendingRequests ──────────────────────────────────────────────────
  describe('fetchPendingRequests', () => {
    it('should GET pending requests', done => {
      service.fetchPendingRequests().subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/workflow/admin/pending/request')
        done()
      })
    })
  })
})
