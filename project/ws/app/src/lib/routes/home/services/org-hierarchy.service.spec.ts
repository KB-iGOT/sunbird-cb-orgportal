import { OrgHierarchyService } from './org-hierarchy.service'
import { of } from 'rxjs'

describe('OrgHierarchyService', () => {
  let service: OrgHierarchyService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ result: 'ok' })),
      post: jest.fn().mockReturnValue(of({ result: 'ok' })),
    }
    service = new OrgHierarchyService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  // ─── HTTP methods ─────────────────────────────────────────────────────────

  describe('getCenterOrStateList', () => {
    it('should POST to ORG_V1_Search', () => {
      const req = { request: { filters: {} } }
      service.getCenterOrStateList(req).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/org/v1/search', req
      )
    })
  })

  describe('createMasterFrameWork', () => {
    it('should POST to CREATE_FRAMEWORK with query params', () => {
      const req = { frameworkName: 'org_hierarchy', identifier: 'org1' }
      service.createMasterFrameWork(req).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        'apis/proxies/v8/org/framework/v1/create?masterFrameworkName=org_hierarchy&orgId=org1',
        {}
      )
    })
  })

  describe('downloadFileLog', () => {
    it('should GET download file log url', () => {
      service.downloadFileLog('report.xlsx').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/organisation/v1/hierarchy/download/file/report.xlsx'
      )
    })
  })

  describe('downloadSampleTemplate', () => {
    it('should GET sample template url', () => {
      service.downloadSampleTemplate('ministry').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/organisation/v1/getMappingFile/sample/ministry'
      )
    })
  })

  describe('exportFramework', () => {
    it('should GET export framework url', () => {
      service.exportFramework('state').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/organisation/v1/hierarchy/download/state'
      )
    })
  })

  describe('uploadFreameworkTemplate', () => {
    it('should POST to bulk upload url with frameworkId', () => {
      const formData = new FormData()
      const frameworkData = { orgHierarchyFrameworkId: 'fw123' }
      service.uploadFreameworkTemplate(formData, frameworkData).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/organisation/v1/hierarchy/bulkUpload/fw123',
        formData
      )
    })
  })

  describe('getOrgReadData', () => {
    it('should POST to ORG_READ', () => {
      const req = { request: { organisationId: 'org1' } }
      service.getOrgReadData(req).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/org/v1/read', req)
    })
  })

  describe('getOrganizationDetails', () => {
    it('should POST to ORG_V1_Search', () => {
      const req = { request: { filters: {} } }
      service.getOrganizationDetails(req).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/org/v1/search', req)
    })
  })

  describe('getBulkuploadProgress', () => {
    it('should GET bulk upload progress url', () => {
      service.getBulkuploadProgress('fw123').subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/organisation/v1/hierarchy/progress/details/bulkUpload/fw123'
      )
    })
  })

  describe('getOrgUserListV1', () => {
    it('should POST to ORG_USER_LIST_V1', () => {
      const req = { request: {} }
      service.getOrgUserListV1(req).subscribe()
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', req)
    })
  })

  // ─── setters / getters ────────────────────────────────────────────────────

  describe('configService', () => {
    it('should set and get configService', () => {
      const cfg = { userRoles: new Set(['admin']) }
      service.setConfigService(cfg)
      expect(service.getConfigService()).toBe(cfg)
    })
  })

  describe('orgData', () => {
    it('should set and get orgData', () => {
      const data = { id: 'org1', name: 'Org' }
      service.setOrgData(data)
      expect(service.getOrgData()).toBe(data)
    })
  })

  describe('parentOrgData', () => {
    it('should set and get parentOrgData', () => {
      const data = { id: 'parent1' }
      service.setParentOrgData(data)
      expect(service.getParentOrgData()).toBe(data)
    })
  })

  describe('userRoles', () => {
    it('should set and get user roles', () => {
      const roles = new Set(['mdo_admin', 'mdo_leader'])
      service.setUserRoles(roles)
      expect(service.getUserRoles()).toBe(roles)
    })
  })
})
