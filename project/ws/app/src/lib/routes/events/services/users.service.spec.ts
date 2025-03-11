import { UsersService } from './users.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

jest.mock('@angular/common/http', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}))

describe('UsersService', () => {
  let service: UsersService
  let httpClientMock: HttpClient

  beforeEach(() => {
    // Initialize the mocked HttpClient
    httpClientMock = new HttpClient(null as any)
    service = new UsersService(httpClientMock)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getAllUsers', () => {
    it('should call http.get with correct endpoint', () => {
      const getAllUsersSpy = jest.spyOn(httpClientMock, 'get').mockReturnValue(of([]))

      service.getAllUsers().subscribe()

      expect(getAllUsersSpy).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/mydepartment?allUsers=true')
    })

    it('should return an observable', (done) => {
      const mockResponse = [{ name: 'John Doe' }]
      jest.spyOn(httpClientMock, 'get').mockReturnValue(of(mockResponse))

      service.getAllUsers().subscribe((data) => {
        expect(data).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('getMyDepartment', () => {
    it('should call http.get with correct endpoint', () => {
      const getMyDeptSpy = jest.spyOn(httpClientMock, 'get').mockReturnValue(of({}))

      service.getMyDepartment().subscribe()

      expect(getMyDeptSpy).toHaveBeenCalledWith('/apis/protected/v8/portal/mdo/mydepartment?allUsers=true')
    })
  })

  describe('createUser', () => {
    it('should call http.post with correct endpoint and request body', () => {
      const req = { name: 'John' }
      const createUserSpy = jest.spyOn(httpClientMock, 'post').mockReturnValue(of({}))

      service.createUser(req).subscribe()

      expect(createUserSpy).toHaveBeenCalledWith('apis/protected/v8/admin/userRegistration/create-user', req)
    })
  })

  describe('getUserById', () => {
    it('should call http.get with correct endpoint and map response', () => {
      const userId = '123'
      const mockProfileDetails = { name: 'John Doe' }
      const getUserByIdSpy = jest.spyOn(httpClientMock, 'get').mockReturnValue(of({ profiledetails: mockProfileDetails }))

      service.getUserById(userId).subscribe((data) => {
        expect(getUserByIdSpy).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/123')
        expect(data).toEqual(mockProfileDetails)
      })
    })
  })

  describe('addUserToDepartment', () => {
    it('should call http.post with correct endpoint and request body', () => {
      const req = { deptId: 1, role: 'admin' }
      const addUserToDeptSpy = jest.spyOn(httpClientMock, 'post').mockReturnValue(of({}))

      service.addUserToDepartment(req).subscribe()

      expect(addUserToDeptSpy).toHaveBeenCalledWith('apis/protected/v8/portal/deptAction/1/userrole', req)
    })
  })

  describe('getWfHistoryByAppId', () => {
    it('should call http.get with correct endpoint', () => {
      const appId = 'abc123'
      const getWfHistorySpy = jest.spyOn(httpClientMock, 'get').mockReturnValue(of([]))

      service.getWfHistoryByAppId(appId).subscribe()

      expect(getWfHistorySpy).toHaveBeenCalledWith('apis/protected/v8/workflowhandler/historyByApplicationId/abc123')
    })
  })

  describe('onSearchUserByEmail', () => {
    it('should call http.post with correct endpoint and request body', () => {
      const email = 'test@example.com'
      const req = { query: 'John' }
      const searchUserSpy = jest.spyOn(httpClientMock, 'post').mockReturnValue(of([]))

      service.onSearchUserByEmail(email, req).subscribe()

      expect(searchUserSpy).toHaveBeenCalledWith('apis/protected/v8/user/autocomplete/department/test@example.com', req)
    })
  })
})
