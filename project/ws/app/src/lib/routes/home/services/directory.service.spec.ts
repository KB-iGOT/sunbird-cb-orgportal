import { of } from 'rxjs'
import _ from 'lodash'

describe('DirectoryService', () => {
  let service: any
  let http: any
  let configSvc: any

  beforeEach(() => {
    http = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    }

    configSvc = {
      userProfile: {
        userId: 'user1',
      },
    }

    const { DirectoryService } = require('./directory.service')

    service = new DirectoryService(http, configSvc)
  })

  // ---------------- INIT ----------------
  it('should set user profile', () => {
    service.setUserProfile()
    expect(service.userProfile.userId).toBe('user1')
  })

  // ---------------- GET STATES ----------------
  it('should call getStatesOrMinisteries', () => {
    http.get.mockReturnValue(of({}))

    service.getStatesOrMinisteries('state').subscribe()

    expect(http.get).toHaveBeenCalled()
  })

  // ---------------- GET DEPARTMENTS ----------------
  it('should call getAllDepartmentsKong with query', () => {
    http.post.mockReturnValue(of({}))

    service.getAllDepartmentsKong('abc', { limit: 10, offset: 0 }, {}).subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  it('should call getAllDepartmentsKong without query', () => {
    http.post.mockReturnValue(of({}))

    service.getAllDepartmentsKong('', { limit: 10, offset: 0 }, {}).subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  // ---------------- ORG READ ----------------
  it('should map org read response', () => {
    http.post.mockReturnValue(of({ result: { response: { id: 1 } } }))

    service.getOrgReadData('1').subscribe((res: any) => {
      expect(res.id).toBe(1)
    })
  })

  // ---------------- FRAMEWORK INFO ----------------
  it('should call getFrameworkInfo and trigger format', () => {
    jest.spyOn(service, 'formateData')

    http.get.mockReturnValue(of({ result: { framework: {} } }))

    service.getFrameworkInfo('fw').subscribe()

    expect(service.formateData).toHaveBeenCalled()
  })

  // ---------------- FORMAT DATA ----------------
  it('should format categories into map', () => {
    const response = {
      result: {
        framework: {
          categories: [
            {
              code: 'c1',
              identifier: 'id1',
              terms: [],
            },
          ],
        },
      },
    }

    service.formateData(response)

    expect(service.list.size).toBe(1)
  })

  // ---------------- FORMAT CHILDREN ----------------
  it('should format children recursively', () => {
    const input = [
      {
        id: 1,
        associations: [{ id: 2, associations: [] }],
        additionalProperties: {
          importedById: 'user1',
        },
      },
    ]

    const result = service.formateChildren(input)

    expect(result[0].children.length).toBe(1)
    expect(result[0].importedByName).toBe('You')
  })

  it('should handle children without associations', () => {
    const input = [{ id: 1 }]

    const result = service.formateChildren(input)

    expect(result[0].children.length).toBe(0)
  })

  // ---------------- CREATE ORG ----------------
  it('should create organization', () => {
    http.post.mockReturnValue(of({}))

    service.createOrganization({}).subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  // ---------------- UPDATE ORG ----------------
  it('should update organization', () => {
    http.patch.mockReturnValue(of({}))

    service.updateOrganizationV2({}).subscribe()

    expect(http.patch).toHaveBeenCalled()
  })

  // ---------------- SEARCH ORG ----------------
  it('should search orgs', () => {
    http.post.mockReturnValue(of({}))

    service.searchOrgs('org', 'type').subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  // ---------------- UPLOAD LOGO ----------------
  it('should upload logo', () => {
    http.post.mockReturnValue(of({}))

    service.uploadOrganizationLogo({}).subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  // ---------------- FRAMEWORK ----------------
  it('should create framework', () => {
    http.get.mockReturnValue(of({}))

    service.createFrameWork('fw', '1', 'term').subscribe()

    expect(http.get).toHaveBeenCalled()
  })

  it('should publish framework', () => {
    http.post.mockReturnValue(of({}))

    service.publishFramework('fw').subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  // ---------------- DELETE DESIGNATION ----------------
  it('should delete designation', () => {
    http.post.mockReturnValue(of({}))

    service.deleteDesignation('fw', 'cat', {}).subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  // ---------------- MASTER DESIGNATIONS ----------------
  it('should get master designations', () => {
    jest.spyOn(service, 'formateMasterDesignationList').mockReturnValue(of({}))

    http.post.mockReturnValue(of({ result: { result: {} } }))

    service.getIgotMasterDesignations({}).subscribe()

    expect(service.formateMasterDesignationList).toHaveBeenCalled()
  })

  it('should format master designation list', () => {
    service.orgDesignationList = [{ refId: 1 }]
    service.selectedDesignationList = [{ id: 2 }]

    const response = {
      data: [
        { id: 1 },
        { id: 2 },
      ],
      facets: [],
      totalCount: 2,
    }

    service.formateMasterDesignationList(response).subscribe((res: any) => {
      expect(res.formatedDesignationsLsit.length).toBe(2)
    })
  })

  // ---------------- SETTERS ----------------
  it('should set org designation list', () => {
    service.setCurrentOrgDesignationsList([1])
    expect(service.orgDesignationList.length).toBe(1)
  })

  it('should set framework info', () => {
    service.setFrameWorkInfo({ a: 1 })
    expect(service.frameWorkInfo.a).toBe(1)
  })

  it('should update selected designation list', () => {
    service.updateSelectedDesignationList([1])
    expect(service.selectedDesignationList.length).toBe(1)
  })

  // ---------------- UUID ----------------
  it('should return uuid', () => {
    const id = service.getUuid
    expect(id).toBeTruthy()
  })

  // ---------------- TERMS ----------------
  it('should create term', () => {
    http.post.mockReturnValue(of({}))

    service.createTerm({}).subscribe()

    expect(http.post).toHaveBeenCalled()
  })

  it('should update terms', () => {
    http.patch.mockReturnValue(of({}))

    service.updateTerms('fw', 'cat', 'code', {}).subscribe()

    expect(http.patch).toHaveBeenCalled()
  })

  // ---------------- USER ----------------
  it('should get user details', () => {
    http.get.mockReturnValue(of({}))

    service.getUserDetails('1').subscribe()

    expect(http.get).toHaveBeenCalled()
  })
})