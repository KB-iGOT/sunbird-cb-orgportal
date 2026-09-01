import { ExploreContentComponent } from './explore-content.component'
import { of, throwError } from 'rxjs'

describe('ExploreContentComponent', () => {
  let component: ExploreContentComponent
  let mockExploreContentService: any
  let mockRouter: any
  let mockLoaderService: any

  const makeResponse = (content: any[] = [], count = 0, facets: any[] = []) => ({
    result: { content, count, facets },
  })

  beforeEach(() => {
    mockExploreContentService = {
      getAllContent: jest.fn().mockReturnValue(of(makeResponse())),
    }
    mockRouter = { navigate: jest.fn() }
    mockLoaderService = { changeLoaderState: jest.fn() }

    component = new ExploreContentComponent(
      mockExploreContentService,
      mockRouter,
      mockLoaderService,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ─── create ───────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise with default property values', () => {
    expect(component.searchQuery).toBe('')
    expect(component.pageSize).toBe(10)
    expect(component.pageIndex).toBe(0)
    expect(component.currentTab).toBe('live')
    expect(component.sideNavBarOpened).toBe(false)
    expect(component.multilingualCourses).toEqual([])
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should build searchBody with correct shape and call loadContent', () => {
      component.ngOnInit()
      expect(component.searchBody).toBeDefined()
      expect(component.searchBody.request.limit).toBe(10)
      expect(component.searchBody.request.offset).toBe(0)
      expect(component.searchBody.request.query).toBe('')
      expect(component.searchBody.request.filters.status).toEqual(['Live'])
      expect(mockExploreContentService.getAllContent).toHaveBeenCalled()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
    })
  })

  // ─── loadContent via ngOnInit ─────────────────────────────────────────────

  describe('loadContent', () => {
    it('should populate dataSource and set length when content returned', () => {
      const contents = [{ id: '1' }, { id: '2' }]
      mockExploreContentService.getAllContent.mockReturnValue(of(makeResponse(contents, 5)))
      component.ngOnInit()
      expect(component.dataSource.data).toEqual(contents)
      expect(component.length).toBe(5)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should use contents.length as fallback when count is not a number', () => {
      const contents = [{ id: '1' }, { id: '2' }, { id: '3' }]
      mockExploreContentService.getAllContent.mockReturnValue(
        of({ result: { content: contents } }),
      )
      component.ngOnInit()
      expect(component.length).toBe(3)
    })

    it('should set empty dataSource when no content returned', () => {
      mockExploreContentService.getAllContent.mockReturnValue(of(makeResponse([], 0)))
      component.ngOnInit()
      expect(component.dataSource.data).toEqual([])
      expect(component.length).toBe(0)
    })

    it('should handle response with missing result gracefully', () => {
      mockExploreContentService.getAllContent.mockReturnValue(of({}))
      component.ngOnInit()
      expect(component.dataSource.data).toEqual([])
      expect(component.length).toBe(0)
    })

    it('should set allFacets from response', () => {
      const facets = [{ name: 'language', values: [] }]
      mockExploreContentService.getAllContent.mockReturnValue(
        of(makeResponse([{ id: '1' }], 1, facets)),
      )
      component.ngOnInit()
      expect(component.allFacets).toEqual(facets)
    })

    it('should handle error: reset data, length=0, stop loader', () => {
      mockExploreContentService.getAllContent.mockReturnValue(
        throwError(() => new Error('Network error')),
      )
      component.ngOnInit()
      expect(component.dataSource.data).toEqual([])
      expect(component.length).toBe(0)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should pass correct offset to searchBody when pageIndex > 0', () => {
      component.ngOnInit()
      component.pageIndex = 2
      component.pageSize = 10
      component.onPageChange({ pageIndex: 2, pageSize: 10, length: 100 } as any)
      const lastCall = mockExploreContentService.getAllContent.mock.calls.at(-1)[0]
      expect(lastCall.request.offset).toBe(20)
    })
  })

  // ─── applySearch ──────────────────────────────────────────────────────────

  describe('applySearch', () => {
    beforeEach(() => component.ngOnInit())

    it('should set searchQuery, reset pageIndex, update searchBody.request.query', () => {
      component.pageIndex = 3
      component.applySearch('angular')
      expect(component.searchQuery).toBe('angular')
      expect(component.pageIndex).toBe(0)
      expect(component.searchBody.request.query).toBe('angular')
    })

    it('should trim whitespace from the value', () => {
      component.applySearch('  java  ')
      expect(component.searchQuery).toBe('java')
    })

    it('should default to empty string when value is null', () => {
      component.applySearch(null as any)
      expect(component.searchQuery).toBe('')
    })

    it('should trigger a new content load', () => {
      const callsBefore = mockExploreContentService.getAllContent.mock.calls.length
      component.applySearch('react')
      expect(mockExploreContentService.getAllContent.mock.calls.length).toBeGreaterThan(callsBefore)
    })
  })

  // ─── clearSearch ──────────────────────────────────────────────────────────

  describe('clearSearch', () => {
    beforeEach(() => component.ngOnInit())

    it('should reset searchQuery and trigger reload', () => {
      component.searchQuery = 'something'
      const callsBefore = mockExploreContentService.getAllContent.mock.calls.length
      component.clearSearch()
      expect(component.searchQuery).toBe('')
      expect(mockExploreContentService.getAllContent.mock.calls.length).toBeGreaterThan(callsBefore)
    })
  })

  // ─── viewContent ──────────────────────────────────────────────────────────

  describe('viewContent', () => {
    it('should navigate to content preview with correct path', () => {
      component.viewContent({ identifier: 'abc123' })
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        'app', 'home', 'explore-content', 'abc123', 'preview',
      ])
    })

    it('should warn and not navigate when row has no identifier', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { })
      component.viewContent({ title: 'No ID' })
      expect(mockRouter.navigate).not.toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('should warn and not navigate when row is null', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { })
      component.viewContent(null as any)
      expect(mockRouter.navigate).not.toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  // ─── onPageChange ─────────────────────────────────────────────────────────

  describe('onPageChange', () => {
    beforeEach(() => component.ngOnInit())

    it('should update pageIndex, pageSize and reload content', () => {
      component.onPageChange({ pageIndex: 2, pageSize: 25, length: 100 } as any)
      expect(component.pageIndex).toBe(2)
      expect(component.pageSize).toBe(25)
      expect(mockExploreContentService.getAllContent).toHaveBeenCalled()
    })
  })

  // ─── formatDuration ───────────────────────────────────────────────────────

  describe('formatDuration', () => {
    it('should format 90 seconds as "1m 30s"', () => {
      expect(component.formatDuration(90)).toBe('1m 30s')
    })

    it('should format 0 seconds as "0m 0s"', () => {
      expect(component.formatDuration(0)).toBe('0m 0s')
    })

    it('should format 3600 seconds as "60m 0s"', () => {
      expect(component.formatDuration(3600)).toBe('60m 0s')
    })

    it('should format 65 seconds as "1m 5s"', () => {
      expect(component.formatDuration(65)).toBe('1m 5s')
    })
  })

  // ─── getLanguageCount ─────────────────────────────────────────────────────

  describe('getLanguageCount', () => {
    it('should count only live non-base languages', () => {
      const map = {
        en: { status: 'Live', isBaseLang: true },
        hi: { status: 'Live', isBaseLang: false },
        ta: { status: 'Live', isBaseLang: false },
        te: { status: 'Retired', isBaseLang: false },
      }
      expect(component.getLanguageCount(map)).toBe(2)
    })

    it('should return 0 for empty map', () => {
      expect(component.getLanguageCount({})).toBe(0)
    })

    it('should return 0 when languageMap is null', () => {
      expect(component.getLanguageCount(null as any)).toBe(0)
    })

    it('should not count languages without status=live', () => {
      const map = {
        hi: { status: 'Draft', isBaseLang: false },
      }
      expect(component.getLanguageCount(map)).toBe(0)
    })
  })

  // ─── getFormattedLanguageNames ────────────────────────────────────────────

  describe('getFormattedLanguageNames', () => {
    it('should return key-value pairs for live non-base languages', () => {
      const map = {
        en: { status: 'Live', isBaseLang: true },
        hi: { status: 'Live', isBaseLang: false },
      }
      expect(component.getFormattedLanguageNames(map)).toEqual([
        { key: 'hi', value: { status: 'Live', isBaseLang: false } },
      ])
    })

    it('should return empty string when map is null', () => {
      expect(component.getFormattedLanguageNames(null)).toBe('')
    })

    it('should return empty array when no live non-base languages exist', () => {
      const map = { en: { status: 'Live', isBaseLang: true } }
      expect(component.getFormattedLanguageNames(map)).toEqual([])
    })

    it('should exclude retired languages', () => {
      const map = {
        hi: { status: 'Retired', isBaseLang: false },
        ta: { status: 'Live', isBaseLang: false },
      }
      const result = component.getFormattedLanguageNames(map)
      expect(result.length).toBe(1)
      expect(result[0].key).toBe('ta')
    })
  })

  // ─── takeAction ───────────────────────────────────────────────────────────

  describe('takeAction', () => {
    it('should not throw for overview action', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
      expect(() => component.takeAction('overview', { id: '1' })).not.toThrow()
      logSpy.mockRestore()
    })

    it('should not throw for edit action', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
      expect(() => component.takeAction('edit', { id: '2' })).not.toThrow()
      logSpy.mockRestore()
    })
  })

  // ─── changeToDefaultImg ───────────────────────────────────────────────────

  describe('changeToDefaultImg', () => {
    it('should set image src to the placeholder path', () => {
      const img = document.createElement('img')
      component.changeToDefaultImg({ target: img } as any)
      expect(img.src).toContain('content-thumbnail-placeholder.svg')
    })
  })

  // ─── getPendingStatus ─────────────────────────────────────────────────────

  describe('getPendingStatus', () => {
    it('should return contentRetiredStatus from element', () => {
      expect(component.getPendingStatus({ contentRetiredStatus: 'pending' })).toBe('pending')
    })

    it('should return empty string when element is null', () => {
      expect(component.getPendingStatus(null)).toBe('')
    })

    it('should return empty string when field is missing', () => {
      expect(component.getPendingStatus({})).toBe('')
    })
  })

  // ─── getLanguageIds ───────────────────────────────────────────────────────

  describe('getLanguageIds', () => {
    it('should return ids for live non-base languages', () => {
      const map = {
        en: { id: 'en-id', status: 'Live', isBaseLang: true },
        hi: { id: 'hi-id', status: 'Live', isBaseLang: false },
        ta: { id: 'ta-id', status: 'Retired', isBaseLang: false },
      }
      expect(component.getLanguageIds(map)).toEqual(['hi-id'])
    })

    it('should return empty array when map is null', () => {
      expect(component.getLanguageIds(null as any)).toEqual([])
    })

    it('should return empty array when all are base languages', () => {
      const map = { en: { id: 'en-id', status: 'Live', isBaseLang: true } }
      expect(component.getLanguageIds(map)).toEqual([])
    })
  })

  // ─── handleCloseSidenav ───────────────────────────────────────────────────

  describe('handleCloseSidenav', () => {
    it('should set sideNavBarOpened to false', () => {
      component.sideNavBarOpened = true
      component.handleCloseSidenav()
      expect(component.sideNavBarOpened).toBe(false)
    })
  })

  // ─── getMultiLanguageCourses ──────────────────────────────────────────────

  describe('getMultiLanguageCourses', () => {
    beforeEach(() => component.ngOnInit())

    it('should set multilingualCourses when content is returned', async () => {
      const courses = [{ id: '1' }, { id: '2' }]
      mockExploreContentService.getAllContent.mockReturnValue(
        of({ result: { content: courses } }),
      )
      component.getMultiLanguageCourses({
        languageMapV1: { hi: { id: 'hi-id', status: 'Live', isBaseLang: false } },
      })
      await Promise.resolve()
      expect(component.multilingualCourses).toEqual(courses)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should set multilingualCourses to empty array when no content', async () => {
      mockExploreContentService.getAllContent.mockReturnValue(
        of({ result: { content: [] } }),
      )
      component.getMultiLanguageCourses({ languageMapV1: {} })
      await Promise.resolve()
      expect(component.multilingualCourses).toEqual([])
    })

    it('should handle element without languageMapV1', async () => {
      mockExploreContentService.getAllContent.mockReturnValue(
        of({ result: { content: [] } }),
      )
      component.getMultiLanguageCourses({})
      await Promise.resolve()
      expect(component.multilingualCourses).toEqual([])
    })

    it('should start loader before fetching', () => {
      mockExploreContentService.getAllContent.mockReturnValue(of({ result: { content: [] } }))
      component.getMultiLanguageCourses({})
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
    })
  })

  // ─── handleFiltersChanges ─────────────────────────────────────────────────

  describe('handleFiltersChanges', () => {
    beforeEach(() => component.ngOnInit())

    it('should reset pageIndex, update filters and reload', () => {
      component.pageIndex = 3
      component.handleFiltersChanges({ languages: ['en', 'hi'] })
      expect(component.pageIndex).toBe(0)
      expect(component.searchBody.request.filters.language).toEqual(['en', 'hi'])
      expect(mockExploreContentService.getAllContent).toHaveBeenCalled()
    })

    it('should pass all filter types through to searchBody', () => {
      component.handleFiltersChanges({
        categoryType: ['Course'],
        organisations: ['Org A'],
        difficultyLevel: ['Beginner'],
      })
      expect(component.searchBody.request.filters.courseCategory).toEqual(['Course'])
      expect(component.searchBody.request.filters.organisation).toEqual(['Org A'])
      expect(component.searchBody.request.filters.difficultyLevel).toEqual(['Beginner'])
    })
  })

  // ─── processSelectedFilters ───────────────────────────────────────────────

  describe('processSelectedFilters', () => {
    it('should return base filters when no custom filters selected', () => {
      const result = component.processSelectedFilters({})
      expect(result.contentType).toEqual(['Course'])
      expect(result.status).toEqual(['Live'])
      expect(result.courseCategory).toEqual(component.defaultCategories)
    })

    it('should override courseCategory when categoryType provided and non-empty', () => {
      const result = component.processSelectedFilters({ categoryType: ['Blended Program'] })
      expect(result.courseCategory).toEqual(['Blended Program'])
    })

    it('should not override courseCategory when categoryType is empty array', () => {
      const result = component.processSelectedFilters({ categoryType: [] })
      expect(result.courseCategory).toEqual(component.defaultCategories)
    })

    it('should add language filter when non-empty', () => {
      const result = component.processSelectedFilters({ languages: ['Hindi', 'English'] })
      expect(result.language).toEqual(['Hindi', 'English'])
    })

    it('should not add language when empty array', () => {
      const result = component.processSelectedFilters({ languages: [] })
      expect(result.language).toBeUndefined()
    })

    it('should add organisation filter when non-empty', () => {
      const result = component.processSelectedFilters({ organisations: ['Org A'] })
      expect(result.organisation).toEqual(['Org A'])
    })

    it('should add all competency and difficultyLevel filters', () => {
      const result = component.processSelectedFilters({
        competencyArea: ['Leadership'],
        competencyTheme: ['Theme1'],
        competencySubTheme: ['Sub1'],
        difficultyLevel: ['Intermediate'],
      })
      expect(result['competencies_v6.competencyAreaName']).toEqual(['Leadership'])
      expect(result['competencies_v6.competencyThemeName']).toEqual(['Theme1'])
      expect(result['competencies_v6.competencySubThemeName']).toEqual(['Sub1'])
      expect(result.difficultyLevel).toEqual(['Intermediate'])
    })

    it('should parse ratings and set avgRating with minimum threshold', () => {
      const result = component.processSelectedFilters({ ratings: ['4 Stars', '3 Stars'] })
      expect(result.avgRating).toEqual({ '>=': '3' })
    })

    it('should pick the minimum rating as threshold', () => {
      const result = component.processSelectedFilters({ ratings: ['5.0 Gold', '2.5 Silver'] })
      expect(result.avgRating).toEqual({ '>=': '2.5' })
    })

    it('should skip avgRating when ratings strings have no leading number', () => {
      const result = component.processSelectedFilters({ ratings: ['No rating', 'N/A'] })
      expect(result.avgRating).toBeUndefined()
    })

    it('should return base filters when selectedFilters is an empty object', () => {
      const result = component.processSelectedFilters({})
      expect(result.contentType).toEqual(['Course'])
      expect(result.courseCategory).toEqual(component.defaultCategories)
    })
  })
})

