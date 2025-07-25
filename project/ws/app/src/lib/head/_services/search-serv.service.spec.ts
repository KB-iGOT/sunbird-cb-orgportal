import { SearchServService } from './search-serv.service'
import { WsEvents } from '@sunbird-cb/utils'
import { of } from 'rxjs'

// Mock dependencies
const mockHttpClient = {
  get: jest.fn()
}

const mockEventService = {
  dispatchEvent: jest.fn()
}

const mockSearchApiService = {
  getSearchAutoCompleteResults: jest.fn(),
  getSearch: jest.fn(),
  getSearchResults: jest.fn()
}

const mockConfigurationsService = {
  sitePath: '/test-site-path',
  activeOrg: 'test-org',
  rootOrg: 'test-root-org'
}

describe('SearchServService', () => {
  let service: SearchServService

  beforeEach(() => {
    jest.clearAllMocks()

    // Create service instance with mocked dependencies
    service = new SearchServService(
      mockEventService as any,
      mockSearchApiService as any,
      mockConfigurationsService as any,
      mockHttpClient as any
    )

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  describe('defaultFiltersTranslated', () => {
    it('should return default filters structure', () => {
      const result = service.defaultFiltersTranslated
      expect(result).toEqual({ en: {}, all: {} })
    })
  })

  describe('getSearchConfig', () => {
    it('should fetch and cache search config', async () => {
      const mockConfig = { search: { tabs: [{ phraseSearch: true }] } }
      mockHttpClient.get.mockReturnValue(of(mockConfig))

      const result = await service.getSearchConfig()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/test-site-path/feature/search.json')
      expect(result).toEqual(mockConfig)
      expect(service.searchConfig).toEqual(mockConfig)
    })

    it('should return cached config on subsequent calls', async () => {
      const mockConfig = { search: { tabs: [{ phraseSearch: true }] } }
      service.searchConfig = mockConfig

      const result = await service.getSearchConfig()

      expect(mockHttpClient.get).not.toHaveBeenCalled()
      expect(result).toEqual(mockConfig)
    })
  })

  describe('getApplyPhraseSearch', () => {
    it('should return true when phraseSearch is true', async () => {
      const mockConfig = { search: { tabs: [{ phraseSearch: true }] } }
      service.searchConfig = mockConfig

      const result = await service.getApplyPhraseSearch()

      expect(result).toBe(true)
    })

    it('should return true when phraseSearch is undefined', async () => {
      const mockConfig = { search: { tabs: [{}] } }
      service.searchConfig = mockConfig

      const result = await service.getApplyPhraseSearch()

      expect(result).toBe(true)
    })

    it('should return false when phraseSearch is false', async () => {
      const mockConfig = { search: { tabs: [{ phraseSearch: false }] } }
      service.searchConfig = mockConfig

      const result = await service.getApplyPhraseSearch()

      expect(result).toBe(false)
    })
  })

  describe('searchAutoComplete', () => {
    it('should return empty array', async () => {
      const params = { q: 'TEST QUERY', l: 'en' }

      const result = await service.searchAutoComplete(params)

      expect(result).toEqual([])
      expect(params.q).toBe('test query') // Should be converted to lowercase
    })
  })

  describe('getLearning', () => {
    it('should call searchV6Wrapper with request', () => {
      const mockRequest = { query: 'test', filters: {} }
      const mockResponse = { result: { response: { docs: [] } } }
      jest.spyOn(service, 'searchV6Wrapper').mockReturnValue(of(mockResponse as any))

      const result = service.getLearning(mockRequest)

      expect(service.searchV6Wrapper).toHaveBeenCalledWith(mockRequest)
      expect(result).toBeDefined()
    })
  })

  describe('searchV6Wrapper', () => {
    it('should transform request and call search API', () => {
      const mockRequest = {
        query: 'test query',
        filters: { contentType: ['Course'] },
        lastUpdatedOn: 'desc',
        fields: ['name', 'description']
      }

      service.searchConfig = {
        search: {
          visibleFiltersV2: {
            contentType: {},
            resourceCategory: {}
          }
        }
      }

      const mockResponse = { result: { response: { docs: [] } } }
      mockSearchApiService.getSearch.mockReturnValue(of(mockResponse))

      service.searchV6Wrapper(mockRequest)

      expect(mockSearchApiService.getSearch).toHaveBeenCalledWith({
        request: {
          query: 'test query',
          filters: { contentType: ['Course'] },
          sort_by: { lastUpdatedOn: 'desc' },
          facets: ['contentType', 'resourceCategory'],
          fields: ['name', 'description']
        }
      })
    })
  })

  describe('fetchSocialSearchUsers', () => {
    it('should add org and rootOrg to request and call search API', () => {
      const mockRequest = { query: 'user' }
      const mockResponse = { users: [] }
      mockSearchApiService.getSearchResults.mockReturnValue(of(mockResponse))

      service.fetchSocialSearchUsers(mockRequest)

      expect(mockSearchApiService.getSearchResults).toHaveBeenCalledWith({
        org: 'test-org',
        rootOrg: 'test-root-org',
        query: 'user'
      })
    })
  })

  describe('fetchSearchDataDocs', () => {
    it('should return empty string', () => {
      const result = service.fetchSearchDataDocs({})
      expect(result).toBe('')
    })
  })

  describe('fetchSearchDataProjects', () => {
    it('should return empty string', () => {
      const result = service.fetchSearchDataProjects({})
      expect(result).toBe('')
    })
  })

  describe('updateSelectedFiltersSet', () => {
    it('should create filter set and determine reset status', () => {
      const filters = {
        contentType: ['Course', 'Resource'],
        tags: ['programming/javascript', 'web/development'],
        duration: []
      }

      const result = service.updateSelectedFiltersSet(filters)

      expect(result.filterReset).toBe(true)
      expect(result.filterSet.has('Course')).toBe(true)
      expect(result.filterSet.has('Resource')).toBe(true)
      expect(result.filterSet.has('programming')).toBe(true)
      expect(result.filterSet.has('programming/javascript')).toBe(true)
      expect(result.filterSet.has('web')).toBe(true)
      expect(result.filterSet.has('web/development')).toBe(true)
    })

    it('should handle empty filters', () => {
      const result = service.updateSelectedFiltersSet({})

      expect(result.filterReset).toBe(false)
      expect(result.filterSet.size).toBe(0)
    })

    it('should handle null filters', () => {
      const result = service.updateSelectedFiltersSet(null as any)

      expect(result.filterReset).toBe(false)
      expect(result.filterSet.size).toBe(0)
    })
  })

  describe('transformSearchV6Filters', () => {
    it('should transform v6 filters to flat object', () => {
      const v6filters: any = [
        {
          andFilters: [
            { contentType: ['Course'] },
            { resourceCategory: ['Learn'] }
          ]
        },
        {
          andFilters: [
            { duration: ['Medium'] }
          ]
        }
      ]

      const result = service.transformSearchV6Filters(v6filters)

      expect(result).toEqual({
        contentType: ['Course'],
        resourceCategory: ['Learn'],
        duration: ['Medium']
      })
    })

    it('should handle filters without andFilters', () => {
      const v6filters = [{}]
      const result = service.transformSearchV6Filters(v6filters)
      expect(result).toEqual({})
    })
  })

  describe('handleFilters', () => {
    it('should process filters correctly', () => {
      const filters = [
        {
          type: 'contentType',
          content: [
            { type: 'Course', count: 10, children: [] },
            { type: 'Resource', count: 5, children: [] }
          ]
        },
        {
          type: 'concepts',
          content: Array.from({ length: 15 }, (_, i) => ({ type: `concept${i}`, count: 1 }))
        },
        {
          type: 'dtLastModified',
          content: [{ type: 'recent', count: 3 }]
        }
      ]

      const selectedFilterSet = new Set(['Course'])
      const selectedFilters = { contentType: ['Course'] }

      const result = service.handleFilters(filters, selectedFilterSet, selectedFilters)

      expect(result.concept).toHaveLength(10) // Should slice to 10
      expect(result.filtersRes).toHaveLength(1) // Should exclude concepts and dtLastModified
      expect(result.filtersRes[0].type).toBe('contentType')
      expect(result.filtersRes[0].checked).toBe(true)
      expect(result.filtersRes[0].content[0].checked).toBe(true)
      expect(result.filtersRes[0].content[1].checked).toBe(false)
    })

    it('should handle showContentType parameter', () => {
      const filters = [
        { type: 'contentType', content: [] },
        { type: 'resourceCategory', content: [] }
      ]

      const result = service.handleFilters(filters, new Set(), {}, true)

      expect(result.filtersRes).toHaveLength(1)
      expect(result.filtersRes[0].type).toBe('resourceCategory')
    })
  })

  describe('setTilesDocs', () => {
    it('should transform docs response to tiles format', () => {
      const response = [
        {
          authors: ['John Doe'],
          category: 'Programming',
          description: 'Test description',
          itemId: '123',
          itemType: 'Course',
          noOfViews: 100,
          isAccessRestricted: 'N',
          source: 'kshop',
          title: 'Test Course',
          topics: ['JavaScript'],
          url: 'http://example.com',
          dateCreated: '2023-01-01',
          sourceId: 1
        }
      ]

      const result = service.setTilesDocs(response)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        author: ['John Doe'],
        category: 'Programming',
        description: 'Test description',
        itemId: '123',
        itemType: 'Course',
        noOfViews: 100,
        restricted: 'N',
        source: 'kshop',
        title: 'Test Course',
        topics: ['JavaScript'],
        url: 'http://example.com',
        color: '3px solid #f26522',
        sourceId: 1
      })
    })

    it('should handle missing properties with defaults', () => {
      const response = [{ itemId: '123', source: 'other' }]
      const result = service.setTilesDocs(response)

      expect(result[0]).toMatchObject({
        author: [],
        category: '',
        description: '',
        itemType: '',
        noOfViews: 0,
        restricted: 'N',
        title: '',
        topics: [],
        url: '',
        color: '3px solid #28a9b2',
        sourceId: 0
      })
    })

    it('should throw error when processing fails', () => {
      expect(() => service.setTilesDocs(null as any)).toThrow()
    })
  })

  describe('setTileProject', () => {
    it('should transform project response to tiles format', () => {
      const response = [
        {
          pm: ['Manager 1'],
          dm: ['Developer 1'],
          mstObjectives: 'Test objectives',
          risks: ['Risk 1'],
          contributions: ['Contribution 1'],
          mstProjectScope: 'Test scope',
          mstBusinessContext: 'Test context',
          itemId: 'proj123',
          isAccessRestricted: 'Y',
          mstProjectName: 'Test Project',
          topics: ['Management'],
          dateStartDate: '2023-01-01'
        }
      ]

      const result = service.setTileProject(response)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        pm: ['Manager 1'],
        dm: ['Developer 1'],
        objectives: 'Test objectives',
        risks: ['Risk 1'],
        contribution: ['Contribution 1'],
        category: 'Project',
        projectScope: 'Test scope',
        businessContext: 'Test context',
        itemId: 'proj123',
        restricted: 'Y',
        source: 'PROMT',
        title: 'Test Project',
        topics: ['Management'],
        url: '',
        color: '3px solid #e94a48',
        sourceId: 0
      })
    })

    it('should throw error when processing fails', () => {
      expect(() => service.setTileProject(null as any)).toThrow()
    })
  })

  describe('formatKhubFilters', () => {
    it('should format filters correctly', () => {
      const filters = {
        contentType: [
          { key: 'Course', doc_count: 10 },
          { key: 'Resource', doc_count: 5 }
        ],
        topics: [
          { key: 'JavaScript', doc_count: 3 }
        ]
      }

      const result = service.formatKhubFilters(filters)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        type: 'contentType',
        displayName: 'contentType', // Default display name
        content: [
          { count: 10, displayName: 'Course', type: 'Course' },
          { count: 5, displayName: 'Resource', type: 'Resource' }
        ]
      })
    })

    it('should throw error when processing fails', () => {
      expect(() => service.formatKhubFilters(null as any)).toThrow()
    })
  })

  describe('formatFilterForSearch', () => {
    it('should format filters for search query', () => {
      const filters = {
        contentType: ['Course', 'Resource'],
        topics: ['JavaScript']
      }

      const result = service.formatFilterForSearch(filters)

      expect(result).toBe('"contentType":["Course","Resource"]$"topics":["JavaScript"]')
    })

    it('should handle empty filter arrays', () => {
      const filters = {
        contentType: ['Course'],
        topics: []
      }

      const result = service.formatFilterForSearch(filters)

      expect(result).toBe('"contentType":["Course"]')
    })

    it('should throw error when processing fails', () => {
      expect(() => service.formatFilterForSearch(null as any)).toThrow()
    })
  })

  describe('getDisplayName', () => {
    const testCases = [
      { input: 'automationcentral', expected: 'Tools' },
      { input: 'AUTOMATIONCENTRAL', expected: 'Tools' },
      { input: 'autogeneratedtopic', expected: 'Topics' },
      { input: 'topics', expected: 'Topics' },
      { input: 'kshopdocument', expected: 'Kshop Document' },
      { input: 'project', expected: 'Project References' },
      { input: 'kshop', expected: 'Documents' },
      { input: 'itemtype', expected: 'Item Type' },
      { input: 'authors.mailid', expected: 'Authors' },
      { input: 'mstlocation', expected: 'Location' },
      { input: 'status', expected: 'Project Status' },
      { input: 'marketing', expected: 'Marketing' },
      { input: 'unknown', expected: 'unknown' }
    ]

    testCases.forEach(({ input, expected }) => {
      it(`should return "${expected}" for "${input}"`, () => {
        expect(service.getDisplayName(input)).toBe(expected)
      })
    })
  })

  describe('getLanguageSearchIndex', () => {
    it('should return "zh" for "zh-CN"', () => {
      expect(service.getLanguageSearchIndex('zh-CN')).toBe('zh')
    })

    it('should return original language for other languages', () => {
      expect(service.getLanguageSearchIndex('en')).toBe('en')
      expect(service.getLanguageSearchIndex('fr')).toBe('fr')
    })
  })

  describe('raiseSearchEvent', () => {
    it('should dispatch search event', () => {
      const query = 'test query'
      const filters = { contentType: ['Course'] }
      const locale = 'en'

      service.raiseSearchEvent(query, filters, locale)

      expect(mockEventService.dispatchEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Warn,
        data: {
          eventSubType: WsEvents.EnumTelemetrySubType.Interact,
          object: { query, filters, locale },
          type: 'search'
        },
        from: 'search',
        to: 'telemetry'
      })
    })
  })

  describe('raiseSearchResponseEvent', () => {
    it('should dispatch search response event', () => {
      const query = 'test query'
      const filters = { contentType: ['Course'] }
      const totalHits = 42
      const locale = 'en'

      service.raiseSearchResponseEvent(query, filters, totalHits, locale)

      expect(mockEventService.dispatchEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Warn,
        data: {
          query,
          filters,
          locale,
          eventSubType: WsEvents.EnumTelemetrySubType.Search,
          size: totalHits,
          type: 'search'
        },
        from: 'search',
        to: 'telemetry'
      })
    })
  })

  describe('translateSearchFilters', () => {
    beforeEach(() => {
      (window.localStorage.getItem as jest.Mock).mockClear();
      (window.localStorage.setItem as jest.Mock).mockClear()
    })

    it('should return cached translation for single language', async () => {
      const cachedTranslations = {
        en: { course: 'Course' },
        fr: { course: 'Cours' }
      };
      (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(cachedTranslations))

      const result = await service.translateSearchFilters('fr')

      expect(result).toEqual({ course: 'Cours' })
    })

    it('should fetch and cache new translation', async () => {
      const cachedTranslations = { en: {} }
      const newTranslation = { course: 'Cours' };

      (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(cachedTranslations))
      mockHttpClient.get.mockReturnValue(of(newTranslation))

      const result = await service.translateSearchFilters('fr')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/protected/v8/translate/filterdata/fr')
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(2)
      expect(result).toEqual(newTranslation)
    })

    it('should return English translation for multiple languages', async () => {
      const cachedTranslations = {
        en: { course: 'Course' }
      };
      (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(cachedTranslations))

      const result = await service.translateSearchFilters('en,fr')

      expect(result).toEqual({ course: 'Course' })
      expect(mockHttpClient.get).not.toHaveBeenCalled()
    })

    it('should handle missing localStorage data', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null)
      const newTranslation = { course: 'Cours' }
      mockHttpClient.get.mockReturnValue(of(newTranslation))

      const result = await service.translateSearchFilters('fr')

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'filtersTranslation',
        JSON.stringify({ en: {}, all: {}, fr: {} })
      )
      expect(result).toEqual(newTranslation)
    })
  })
})