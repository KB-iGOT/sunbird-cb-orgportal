import { of } from 'rxjs'
import { UserAutocompleteService } from './user-autocomplete.service'

describe('UserAutocompleteService', () => {
  let service: UserAutocompleteService
  let httpMock: any
  let configSvcMock: any

  beforeEach(() => {
    httpMock = {
      get: jest.fn().mockReturnValue(of([])),
      post: jest.fn().mockReturnValue(of([])),
    }

    configSvcMock = {
      userProfile: null,
      instanceConfig: null,
    }

    service = new UserAutocompleteService(httpMock, configSvcMock)
  })

  afterEach(() => jest.restoreAllMocks())

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  // ── fetchAutoComplete ───────────────────────────────────────────────────
  describe('fetchAutoComplete', () => {
    it('should call http.get with autocomplete URL', () => {
      service.fetchAutoComplete('john')
      expect(httpMock.get).toHaveBeenCalledWith(
        expect.stringContaining('/user/autocomplete/john'),
      )
    })

    it('should not append query params when userProfile is null', () => {
      service.fetchAutoComplete('alice')
      const calledUrl: string = httpMock.get.mock.calls[0][0]
      expect(calledUrl).not.toContain('?')
    })

    it('should append dealerCode query param when userProfile has dealerCode', () => {
      configSvcMock.userProfile = { dealerCode: 'DEALER-001' }
      service.fetchAutoComplete('alice')
      const calledUrl: string = httpMock.get.mock.calls[0][0]
      expect(calledUrl).toContain('DEALER-001')
    })

    it('should append sourceFields query param when instanceConfig has sourceFieldsUserAutocomplete', () => {
      configSvcMock.instanceConfig = { sourceFieldsUserAutocomplete: 'firstName,lastName' }
      service.fetchAutoComplete('bob')
      const calledUrl: string = httpMock.get.mock.calls[0][0]
      expect(calledUrl).toContain('firstName')
    })

    it('should append both dealerCode and sourceFields when both present', () => {
      configSvcMock.userProfile = { dealerCode: 'D1' }
      configSvcMock.instanceConfig = { sourceFieldsUserAutocomplete: 'name' }
      service.fetchAutoComplete('test')
      const calledUrl: string = httpMock.get.mock.calls[0][0]
      expect(calledUrl).toContain('?')
    })

    it('should return observable', () => {
      const result = service.fetchAutoComplete('test')
      expect(result).toBeDefined()
    })
  })

  // ── fetchAutoCompleteByDept ─────────────────────────────────────────────
  describe('fetchAutoCompleteByDept', () => {
    it('should call http.post with autocomplete-by-department URL', () => {
      service.fetchAutoCompleteByDept('john', ['dept-001'])
      expect(httpMock.post).toHaveBeenCalledWith(
        expect.stringContaining('/user/autocomplete/department/john'),
        { departments: ['dept-001'] },
      )
    })

    it('should not append query params when userProfile is null', () => {
      service.fetchAutoCompleteByDept('alice', [])
      const calledUrl: string = httpMock.post.mock.calls[0][0]
      expect(calledUrl).not.toContain('?')
    })

    it('should append dealerCode when userProfile has dealerCode', () => {
      configSvcMock.userProfile = { dealerCode: 'DEALER-XYZ' }
      service.fetchAutoCompleteByDept('bob', ['hr'])
      const calledUrl: string = httpMock.post.mock.calls[0][0]
      expect(calledUrl).toContain('DEALER-XYZ')
    })

    it('should append sourceFields when instanceConfig has sourceFieldsUserAutocomplete', () => {
      configSvcMock.instanceConfig = { sourceFieldsUserAutocomplete: 'email' }
      service.fetchAutoCompleteByDept('alice', ['finance'])
      const calledUrl: string = httpMock.post.mock.calls[0][0]
      expect(calledUrl).toContain('email')
    })

    it('should pass departments in the request body', () => {
      service.fetchAutoCompleteByDept('test', ['dept-a', 'dept-b'])
      expect(httpMock.post).toHaveBeenCalledWith(
        expect.any(String),
        { departments: ['dept-a', 'dept-b'] },
      )
    })

    it('should return observable', () => {
      const result = service.fetchAutoCompleteByDept('test', [])
      expect(result).toBeDefined()
    })
  })

  // ── searchUser ──────────────────────────────────────────────────────────
  describe('searchUser', () => {
    it('should call http.post with SEARCH_USERS endpoint', () => {
      service.searchUser('john', 'root-org-001')
      expect(httpMock.post).toHaveBeenCalledWith(
        expect.stringContaining('/user/v1/search'),
        expect.objectContaining({
          request: expect.objectContaining({ query: 'john' }),
        }),
      )
    })

    it('should include rootOrgId in filters', () => {
      service.searchUser('alice', 'my-root-org')
      expect(httpMock.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({ rootOrgId: 'my-root-org' }),
          }),
        }),
      )
    })

    it('should include status filter of 1', () => {
      service.searchUser('test', 'org-001')
      expect(httpMock.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({ status: 1 }),
          }),
        }),
      )
    })

    it('should return observable', () => {
      const result = service.searchUser('test', 'org-001')
      expect(result).toBeDefined()
    })
  })
})
