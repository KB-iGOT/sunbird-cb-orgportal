import { of } from 'rxjs'
import { DesignationsService } from './designations.service'

// Mock dependencies
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}

const mockConfigurationsService = {
  orgReadData: null,
}

// Mock environment
jest.mock('../../../../../../../../../../src/environments/environment', () => ({
  environment: {
    ODCSMasterFramework: 'test-master-framework'
  }
}))

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123')
}))

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, defaultValue) => {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key]
      } else {
        return defaultValue
      }
    }
    return result
  })
}))

describe('DesignationsService', () => {
  let service: DesignationsService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new DesignationsService(
      mockHttpClient as any,
      mockConfigurationsService as any
    )
  })

  describe('Constructor and Initial State', () => {
    it('should initialize with default values', () => {
      expect(service.list).toBeInstanceOf(Map)
      expect(service.orgDesignationList).toEqual([])
      expect(service.selectedDesignationList).toEqual([])
      expect(service.frameWorkInfo).toBeUndefined()
      expect(service.userProfile).toBeUndefined()
    })
  })

  describe('User Profile Management', () => {
    it('should set user profile', () => {
      const profileDetails = { userId: '123', name: 'Test User' }
      service.setUserProfile(profileDetails)
      expect(service.userProfile).toEqual(profileDetails)
    })

    it('should get user profile details', () => {
      const profileDetails = { userId: '123', name: 'Test User' }
      service.setUserProfile(profileDetails)
      expect(service.userProfileDetails).toEqual(profileDetails)
    })
  })

  describe('Framework Operations', () => {
    it('should create framework', () => {
      const mockResponse = { success: true }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const frameworkName = 'test-framework'
      const orgId = 'org-123'
      const termName = 'test term'

      service.createFrameWork(frameworkName, orgId, termName)

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/apis/proxies/v8/org/framework/read?frameworkName=${frameworkName}&orgId=${orgId}&termName=${encodeURIComponent(termName)}`
      )
    })

    it('should copy framework', (done) => {
      const mockResponse = { result: { response: 'success' } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const request = { frameworkId: 'test-id' }

      service.copyFramework(request).subscribe(result => {
        expect(result).toBe('success')
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          `/api/framework/v1/copy/test-master-framework`,
          request
        )
        done()
      })
    })

    it('should publish framework', () => {
      const mockResponse = { success: true }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const frameworkName = 'test-framework'
      service.publishFramework(frameworkName)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `apis/proxies/v8/framework/v1/publish/${frameworkName}`,
        {}
      )
    })

    it('should set framework info', () => {
      const frameWorkInfo = { id: 'framework-123', name: 'Test Framework' }
      service.setFrameWorkInfo(frameWorkInfo)
      expect(service.frameWorkInfo).toEqual(frameWorkInfo)
    })
  })

  describe('Designation Management', () => {
    it('should get IGOT master designations with valid response', (done) => {
      const mockResponse = {
        result: {
          result: {
            data: [
              { id: '1', name: 'Designation 1' },
              { id: '2', name: 'Designation 2' }
            ],
            facets: [],
            totalCount: 2
          }
        }
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const request = { filters: {} }

      service.getIgotMasterDesignations(request).subscribe(result => {
        expect(result.formatedDesignationsLsit).toBeDefined()
        expect(result.totalCount).toBe(2)
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          'apis/proxies/v8/designation/search',
          request
        )
        done()
      })
    })

    it('should handle empty response for IGOT master designations', (done) => {
      mockHttpClient.post.mockReturnValue(of(null))

      const request = { filters: {} }

      service.getIgotMasterDesignations(request).subscribe(result => {
        expect(result).toBeNull()
        done()
      })
    })

    it('should update selected designation list', () => {
      const selectedList = [{ id: '1', name: 'Selected Designation' }]
      service.updateSelectedDesignationList(selectedList)
      expect(service.selectedDesignationList).toEqual(selectedList)
    })

    it('should calculate selected designation count', () => {
      service.orgDesignationList = [{ id: '1' }, { id: '2' }]
      service.selectedDesignationList = [{ id: '3' }]
      expect(service.selecteDesignationCount).toBe(3)
    })

    it('should set current org designations list', () => {
      const orgDesignationList = [{ id: '1', refId: 'ref-1' }]
      service.setCurrentOrgDesignationsList(orgDesignationList)
      expect(service.orgDesignationList).toEqual(orgDesignationList)
    })

    it('should import designation', () => {
      const mockResponse = { success: true }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const framework = 'test-framework'
      const category = 'test-category'
      const reqBody = { designation: 'test' }

      service.importDesigantion(framework, category, reqBody)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `api/framework/v1/term/create?framework=${framework}&category=${category}`,
        reqBody
      )
    })

    it('should delete designation', () => {
      const mockResponse = { success: true }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const frameworkName = 'test-framework'
      const category = 'test-category'
      const formBody = { designation: 'test' }

      service.deleteDesignation(frameworkName, category, formBody)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/apis/proxies/v8/framework/v1/term/retire?framework=${frameworkName}&category=${category}`,
        formBody
      )
    })
  })

  describe('Term Operations', () => {
    it('should create term', () => {
      const mockResponse = { success: true }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const requestBody = { term: 'test-term' }
      service.createTerm(requestBody)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/apis/proxies/v8/designation/create/term`,
        requestBody
      )
    })

    it('should update terms', () => {
      const mockResponse = { success: true }
      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      const frameworkId = 'framework-123'
      const categoryId = 'category-123'
      const categoryTermCode = 'term-123'
      const requestBody = { name: 'Updated Term' }

      service.updateTerms(frameworkId, categoryId, categoryTermCode, requestBody)

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `apis/proxies/v8/framework/v1/term/update/${categoryTermCode}?framework=${frameworkId}&category=${categoryId}`,
        requestBody
      )
    })
  })

  describe('Organization Operations', () => {
    it('should get org read data', (done) => {
      const mockResponse = {
        result: {
          response: { orgId: '123', name: 'Test Org' }
        }
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const organisationId = 'org-123'

      service.getOrgReadData(organisationId).subscribe(result => {
        expect(result).toEqual({ orgId: '123', name: 'Test Org' })
        expect(mockConfigurationsService.orgReadData).toEqual({ orgId: '123', name: 'Test Org' })
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/org/v1/read',
          { request: { organisationId } }
        )
        done()
      })
    })

    it('should update org', () => {
      const mockResponse = { success: true }
      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      const request = { org: 'updated-org' }
      service.updateOrg(request)

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/apis/proxies/v8/org/v1/update',
        request
      )
    })
  })

  describe('Framework Info Operations', () => {
    it('should get framework info and format data', (done) => {
      const mockResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'cat1',
                identifier: 'id1',
                index: 1,
                name: 'Category 1',
                terms: [
                  {
                    code: 'term1',
                    name: 'Term 1',
                    associations: [],
                    additionalProperties: {
                      importedById: 'user-123',
                      importedByName: 'Test User',
                      importedOn: '2023-01-01'
                    }
                  }
                ]
              }
            ]
          }
        }
      }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const frameWorkName = 'test-framework'

      service.getFrameworkInfo(frameWorkName).subscribe(() => {
        expect(mockHttpClient.get).toHaveBeenCalledWith(
          `/apis/proxies/v8/framework/v1/read/${frameWorkName}`,
          { withCredentials: true }
        )
        expect(service.list.size).toBeGreaterThan(0)
        done()
      })
    })
  })

  describe('Format Master Designation List', () => {
    beforeEach(() => {
      service.orgDesignationList = [{ refId: '1' }]
      service.selectedDesignationList = [{ id: '2' }]
    })

    it('should format master designation list with data', (done) => {
      const response = {
        data: [
          { id: '1', name: 'Designation 1' },
          { id: '2', name: 'Designation 2' },
          { id: '3', name: 'Designation 3' }
        ],
        facets: [],
        totalCount: 3
      }

      service.formateMasterDesignationList(response).subscribe(result => {
        expect(result.formatedDesignationsLsit).toHaveLength(3)
        expect(result.totalCount).toBe(3)
        expect(result.formatedDesignationsLsit[0].isOrgDesignation).toBe(true)
        expect(result.formatedDesignationsLsit[1].selected).toBe(true)
        done()
      })
    })

    it('should handle empty data in format master designation list', (done) => {
      const response = {
        data: null,
        facets: [],
        totalCount: 0
      }

      service.formateMasterDesignationList(response).subscribe(result => {
        expect(result.formatedDesignationsLsit).toEqual([])
        expect(result.totalCount).toBe(0)
        done()
      })
    })
  })

  describe('Format Children', () => {
    beforeEach(() => {
      service.userProfile = { userId: 'user-123' }
    })

    it('should format children with associations', () => {
      const terms = [
        {
          code: 'term1',
          name: 'Term 1',
          associations: [
            {
              code: 'subterm1',
              name: 'Sub Term 1',
              associations: []
            }
          ],
          additionalProperties: {
            importedById: 'user-123',
            importedByName: 'Test User',
            importedOn: '2023-01-01'
          }
        }
      ]

      const result = service.formateChildren(terms)

      expect(result).toHaveLength(1)
      expect(result[0].children).toHaveLength(1)
      expect(result[0].importedByName).toBe('You')
      expect(result[0].importedOn).toBe('2023-01-01')
    })

    it('should format children without associations', () => {
      const terms = [
        {
          code: 'term1',
          name: 'Term 1',
          associations: [],
          additionalProperties: {
            importedById: 'different-user',
            importedByName: 'Other User',
            importedOn: '2023-01-01'
          }
        }
      ]

      const result = service.formateChildren(terms)

      expect(result).toHaveLength(1)
      expect(result[0].children).toEqual([])
      expect(result[0].importedByName).toBe('Other User')
    })
  })

  describe('UUID Generation', () => {
    it('should generate UUID', () => {
      expect(service.getUuid).toBe('test-uuid-123')
    })
  })

  describe('Format Data', () => {
    it('should format framework response data', () => {
      const response = {
        result: {
          framework: {
            categories: [
              {
                code: 'cat1',
                identifier: 'id1',
                index: 1,
                name: 'Category 1',
                selected: true,
                status: 'active',
                description: 'Test category',
                translations: {},
                category: 'designation',
                associations: [],
                terms: []
              }
            ]
          }
        }
      }

      service.formateData(response)

      expect(service.list.has('cat1')).toBe(true)
      const category = service.list.get('cat1')
      expect(category.name).toBe('Category 1')
      expect(category.children).toEqual([])
    })
  })
})