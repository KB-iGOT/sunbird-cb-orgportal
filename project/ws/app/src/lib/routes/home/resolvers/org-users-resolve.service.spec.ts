import { of, throwError } from 'rxjs'
import { OrgUsersResolve } from './org-users-resolve.service'

describe('OrgUsersResolve', () => {
  let resolver: OrgUsersResolve
  let mockOrgHieService: any

  beforeEach(() => {
    mockOrgHieService = {
      getOrgReadData: jest.fn(),
      setOrgData: jest.fn(),
      setParentOrgData: jest.fn(),
    }
    resolver = new OrgUsersResolve(mockOrgHieService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  describe('resolve() - no organisationId', () => {
    it('should return error result when roleId query param is missing', (done: any) => {
      const route: any = { queryParams: {} }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.orgData).toBeNull()
        expect(result.parentOrgData).toBeNull()
        expect(result.error).toBe('No organisationId provided')
        expect(mockOrgHieService.getOrgReadData).not.toHaveBeenCalled()
        done()
      })
    })

    it('should return error result when roleId is undefined', (done: any) => {
      const route: any = { queryParams: { roleId: undefined } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.error).toBe('No organisationId provided')
        done()
      })
    })
  })

  describe('resolve() - non-ministry org', () => {
    it('should call getOrgReadData once and set orgData when org is not ministry type', (done: any) => {
      const mockOrgResponse = {
        result: {
          response: {
            orgName: 'Test Org',
            ministryOrStateType: 'state',
          },
        },
      }
      mockOrgHieService.getOrgReadData.mockReturnValue(of(mockOrgResponse))

      const route: any = { queryParams: { roleId: 'org-123' } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(mockOrgHieService.getOrgReadData).toHaveBeenCalledTimes(1)
        expect(mockOrgHieService.getOrgReadData).toHaveBeenCalledWith({
          request: { organisationId: 'org-123' },
        })
        expect(result.orgData).toEqual(mockOrgResponse.result.response)
        expect(result.parentOrgData).toBeNull()
        expect(result.error).toBeNull()
        expect(mockOrgHieService.setOrgData).toHaveBeenCalledWith(mockOrgResponse.result.response)
        expect(mockOrgHieService.setParentOrgData).toHaveBeenCalledWith(null)
        done()
      })
    })

    it('should handle org with no ministryOrStateType set', (done: any) => {
      const mockOrgResponse = {
        result: {
          response: {
            orgName: 'Another Org',
          },
        },
      }
      mockOrgHieService.getOrgReadData.mockReturnValue(of(mockOrgResponse))

      const route: any = { queryParams: { roleId: 'org-456' } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.orgData).toEqual(mockOrgResponse.result.response)
        expect(result.parentOrgData).toBeNull()
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should handle response where result.response is undefined', (done: any) => {
      const mockOrgResponse = { result: {} }
      mockOrgHieService.getOrgReadData.mockReturnValue(of(mockOrgResponse))

      const route: any = { queryParams: { roleId: 'org-789' } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.orgData).toBeUndefined()
        expect(result.parentOrgData).toBeNull()
        expect(result.error).toBeNull()
        done()
      })
    })
  })

  describe('resolve() - ministry org', () => {
    it('should call getOrgReadData twice and set both orgData and parentOrgData for ministry type', (done: any) => {
      const mockOrgData = {
        orgName: 'Ministry Org',
        ministryOrStateType: 'ministry',
        ministryOrStateId: 'parent-org-id',
      }
      const mockOrgResponse = { result: { response: mockOrgData } }
      const mockParentOrgData = { orgName: 'Parent Ministry', id: 'parent-org-id' }
      const mockParentOrgResponse = { result: { response: mockParentOrgData } }

      mockOrgHieService.getOrgReadData
        .mockReturnValueOnce(of(mockOrgResponse))
        .mockReturnValueOnce(of(mockParentOrgResponse))

      const route: any = { queryParams: { roleId: 'ministry-org-123' } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(mockOrgHieService.getOrgReadData).toHaveBeenCalledTimes(2)
        expect(mockOrgHieService.getOrgReadData).toHaveBeenNthCalledWith(1, {
          request: { organisationId: 'ministry-org-123' },
        })
        expect(mockOrgHieService.getOrgReadData).toHaveBeenNthCalledWith(2, {
          request: { organisationId: 'parent-org-id' },
        })
        expect(result.orgData).toEqual(mockOrgData)
        expect(result.parentOrgData).toEqual(mockParentOrgData)
        expect(result.error).toBeNull()
        expect(mockOrgHieService.setOrgData).toHaveBeenCalledWith(mockOrgData)
        expect(mockOrgHieService.setParentOrgData).toHaveBeenCalledWith(mockParentOrgData)
        done()
      })
    })

    it('should handle null parent org response gracefully', (done: any) => {
      const mockOrgData = {
        orgName: 'Ministry Org',
        ministryOrStateType: 'ministry',
        ministryOrStateId: 'parent-org-id',
      }
      const mockOrgResponse = { result: { response: mockOrgData } }
      const mockParentOrgResponse = { result: {} }

      mockOrgHieService.getOrgReadData
        .mockReturnValueOnce(of(mockOrgResponse))
        .mockReturnValueOnce(of(mockParentOrgResponse))

      const route: any = { queryParams: { roleId: 'ministry-org-456' } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.parentOrgData).toBeNull()
        expect(result.error).toBeNull()
        done()
      })
    })
  })

  describe('resolve() - error handling', () => {
    it('should catch HTTP errors and return error result', (done: any) => {
      const httpError = new Error('HTTP 500 Internal Server Error')
      mockOrgHieService.getOrgReadData.mockReturnValue(throwError(() => httpError))

      const route: any = { queryParams: { roleId: 'org-error' } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.orgData).toBeNull()
        expect(result.parentOrgData).toBeNull()
        expect(result.error).toBe(httpError)
        done()
      })
    })

    it('should catch errors from the parent org API call', (done: any) => {
      const mockOrgData = {
        orgName: 'Ministry Org',
        ministryOrStateType: 'ministry',
        ministryOrStateId: 'parent-org-id',
      }
      const mockOrgResponse = { result: { response: mockOrgData } }
      const parentError = new Error('Parent API failed')

      mockOrgHieService.getOrgReadData
        .mockReturnValueOnce(of(mockOrgResponse))
        .mockReturnValueOnce(throwError(() => parentError))

      const route: any = { queryParams: { roleId: 'ministry-org-err' } }
      const state: any = {}

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.orgData).toBeNull()
        expect(result.parentOrgData).toBeNull()
        expect(result.error).toBe(parentError)
        done()
      })
    })
  })
})
