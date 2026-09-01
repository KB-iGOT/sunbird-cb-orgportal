import { FiltersComponent } from './filters.component'
import { SimpleChange } from '@angular/core'

const makeFacets = (overrides: any[] = []) => {
  const defaults = [
    { name: 'courseCategory', values: [{ name: 'leadership', count: 5 }, { name: 'management', count: 3 }] },
    { name: 'avgRating', values: [{ name: '4.5', count: 10 }, { name: '3.0', count: 4 }] },
    { name: 'language', values: [{ name: 'english', count: 8 }, { name: 'hindi', count: 2 }] },
    { name: 'organisation', values: [{ name: 'acme', count: 6 }] },
    { name: 'competencies_v6.competencyAreaName', values: [{ name: 'finance', count: 3 }] },
    { name: 'competencies_v6.competencyThemeName', values: [{ name: 'budgeting', count: 2 }] },
    { name: 'competencies_v6.competencySubThemeName', values: [{ name: 'forecasting', count: 1 }] },
    { name: 'difficultyLevel', values: [{ name: 'beginner', count: 7 }] },
  ]
  return [...defaults, ...overrides]
}

describe('FiltersComponent', () => {
  let component: FiltersComponent

  beforeEach(() => {
    component = new FiltersComponent()
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation & defaults ──────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default categoryExpanded to true', () => {
    expect(component.categoryExpanded).toBe(true)
  })

  it('should default all showAll flags to false', () => {
    expect(component.showAllCategories).toBe(false)
    expect(component.showAllLanguages).toBe(false)
    expect(component.showAllOrganisations).toBe(false)
    expect(component.showAllCompetencies).toBe(false)
    expect(component.showAllCompetencyTheme).toBe(false)
    expect(component.showAllCompetencySubTheme).toBe(false)
    expect(component.showAllDifficultyLevels).toBe(false)
  })

  it('should default selectedFilters with empty arrays', () => {
    expect(component.selectedFilters.categoryType).toEqual([])
    expect(component.selectedFilters.languages).toEqual([])
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call initializeFiltersFromFacets', () => {
      component.allFacets = makeFacets()
      component.ngOnInit()
      expect(component.categories.length).toBe(2)
    })

    it('should warn and return when allFacets is empty', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { })
      component.allFacets = []
      component.ngOnInit()
      expect(warnSpy).toHaveBeenCalledWith('No facets available')
    })

    it('should warn and return when allFacets is null', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { })
      component.allFacets = null
      component.ngOnInit()
      expect(warnSpy).toHaveBeenCalledWith('No facets available')
    })
  })

  // ─── ngOnChanges ──────────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should reinitialize filters on subsequent allFacets changes', () => {
      component.allFacets = makeFacets()
      component.ngOnChanges({
        allFacets: new SimpleChange(null, makeFacets(), false),
      })
      expect(component.categories.length).toBe(2)
    })

    it('should NOT reinitialize on firstChange', () => {
      const spy = jest.spyOn(component as any, 'initializeFiltersFromFacets')
      component.ngOnChanges({
        allFacets: new SimpleChange(null, makeFacets(), true),
      })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should do nothing when allFacets key is absent from changes', () => {
      const spy = jest.spyOn(component as any, 'initializeFiltersFromFacets')
      component.ngOnChanges({})
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── initializeFiltersFromFacets (via ngOnInit) ───────────────────────────────

  describe('initializeFiltersFromFacets', () => {
    beforeEach(() => {
      component.allFacets = makeFacets()
      component.ngOnInit()
    })

    it('should populate categories', () => {
      expect(component.categories[0].name).toBe('Leadership')
    })

    it('should populate languages and filteredLanguages', () => {
      expect(component.languages.length).toBe(2)
      expect(component.filteredLanguages.length).toBe(2)
    })

    it('should populate organisations and filteredOrganisations', () => {
      expect(component.organisations.length).toBe(1)
      expect(component.filteredOrganisations.length).toBe(1)
    })

    it('should populate competencies and filteredCompetencies', () => {
      expect(component.competencies.length).toBe(1)
      expect(component.filteredCompetencies.length).toBe(1)
    })

    it('should populate competencyTheme and filteredCompetencyTheme', () => {
      expect(component.competencyTheme.length).toBe(1)
      expect(component.filteredCompetencyTheme.length).toBe(1)
    })

    it('should populate competencySubTheme and filteredCompetencySubTheme', () => {
      expect(component.competencySubTheme.length).toBe(1)
      expect(component.filteredCompetencySubTheme.length).toBe(1)
    })

    it('should populate difficultyLevels and filteredDifficultyLevels', () => {
      expect(component.difficultyLevels.length).toBe(1)
      expect(component.filteredDifficultyLevels.length).toBe(1)
    })

    it('should handle unknown facet name via default case', () => {
      // Fresh component with only unknown facet
      const fresh = new FiltersComponent()
      fresh.allFacets = [{ name: 'unknownFacet', values: [{ name: 'x', count: 1 }] }]
      fresh.ngOnInit()
      // No crash expected, known fields stay empty
      expect(fresh.categories).toEqual([])
    })

    it('should handle facet with null values via mapFacetValues', () => {
      component.allFacets = [{ name: 'language', values: null }]
      component.ngOnInit()
      expect(component.languages).toEqual([])
    })
  })

  // ─── formatRatings & filteredRatings ─────────────────────────────────────────

  describe('formatRatings', () => {
    it('should build filteredRatings with "& Above" label', () => {
      component.allFacets = [{ name: 'avgRating', values: [{ name: '4.5', count: 10 }, { name: '4.0', count: 5 }] }]
      component.ngOnInit()
      expect(component.filteredRatings.length).toBeGreaterThan(0)
      expect(component.filteredRatings[0].name).toContain('& Above')
    })

    it('should return empty filteredRatings when values is null', () => {
      component.allFacets = [{ name: 'avgRating', values: null }]
      component.ngOnInit()
      expect(component.filteredRatings).toEqual([])
    })

    it('should exclude rating ranges with zero count', () => {
      component.allFacets = [{ name: 'avgRating', values: [{ name: '5.0', count: 1 }] }]
      component.ngOnInit()
      // Only ranges where cumulative count > 0
      expect(component.filteredRatings.every((r: any) => r.count > 0)).toBe(true)
    })
  })

  // ─── capitalizeFirstLetter ────────────────────────────────────────────────────

  describe('capitalizeFirstLetter (via mapFacetValues)', () => {
    it('should capitalize each word', () => {
      component.allFacets = [{ name: 'language', values: [{ name: 'spoken english', count: 1 }] }]
      component.ngOnInit()
      expect(component.languages[0].name).toBe('Spoken English')
    })

    it('should return empty string for empty name', () => {
      component.allFacets = [{ name: 'language', values: [{ name: '', count: 1 }] }]
      component.ngOnInit()
      expect(component.languages[0].name).toBe('')
    })
  })

  // ─── Category methods ─────────────────────────────────────────────────────────

  describe('toggleCategoryExpand', () => {
    it('should toggle categoryExpanded', () => {
      component.categoryExpanded = true
      component.toggleCategoryExpand()
      expect(component.categoryExpanded).toBe(false)
      component.toggleCategoryExpand()
      expect(component.categoryExpanded).toBe(true)
    })
  })

  describe('toggleCategoryShowAll', () => {
    it('should toggle showAllCategories', () => {
      component.toggleCategoryShowAll()
      expect(component.showAllCategories).toBe(true)
      component.toggleCategoryShowAll()
      expect(component.showAllCategories).toBe(false)
    })
  })

  describe('getDisplayedCategories', () => {
    beforeEach(() => {
      component.categories = Array.from({ length: 8 }, (_, i) => ({ name: `Cat${i}`, count: i }))
    })

    it('should return first 5 when showAllCategories is false', () => {
      component.showAllCategories = false
      expect(component.getDisplayedCategories().length).toBe(5)
    })

    it('should return all when showAllCategories is true', () => {
      component.showAllCategories = true
      expect(component.getDisplayedCategories().length).toBe(8)
    })
  })

  describe('isAllContentsSelected', () => {
    it('should return true when categoryType is empty', () => {
      component.selectedFilters.categoryType = []
      expect(component.isAllContentsSelected()).toBe(true)
    })

    it('should return false when categoryType has items', () => {
      component.selectedFilters.categoryType = ['Course']
      expect(component.isAllContentsSelected()).toBe(false)
    })
  })

  describe('onAllContentsChange', () => {
    it('should clear categoryType and emit when event.checked is true', () => {
      const spy = jest.spyOn(component.filtersChanged, 'emit')
      component.selectedFilters.categoryType = ['Course']
      component.onAllContentsChange({ checked: true })
      expect(component.selectedFilters.categoryType).toEqual([])
      expect(spy).toHaveBeenCalled()
    })

    it('should do nothing when event.checked is false', () => {
      const spy = jest.spyOn(component.filtersChanged, 'emit')
      component.onAllContentsChange({ checked: false })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── Language methods ─────────────────────────────────────────────────────────

  describe('filterLanguages', () => {
    beforeEach(() => {
      component.languages = [{ name: 'English', count: 5 }, { name: 'Hindi', count: 2 }]
      component.filteredLanguages = [...component.languages]
    })

    it('should filter languages by search string', () => {
      component.languageSearch = 'eng'
      component.filterLanguages()
      expect(component.filteredLanguages.length).toBe(1)
      expect(component.filteredLanguages[0].name).toBe('English')
    })

    it('should show all when search is empty', () => {
      component.languageSearch = ''
      component.filterLanguages()
      expect(component.filteredLanguages.length).toBe(2)
    })
  })

  describe('toggleLanguageShowAll / getDisplayedLanguages', () => {
    it('should toggle and return correct slice', () => {
      component.filteredLanguages = Array.from({ length: 6 }, (_, i) => ({ name: `L${i}`, count: i }))
      component.showAllLanguages = false
      expect(component.getDisplayedLanguages().length).toBe(4)
      component.toggleLanguageShowAll()
      expect(component.getDisplayedLanguages().length).toBe(6)
    })
  })

  // ─── Organisation methods ─────────────────────────────────────────────────────

  describe('filterOrganisations', () => {
    beforeEach(() => {
      component.organisations = [{ name: 'Acme', count: 3 }, { name: 'Beta Corp', count: 1 }]
      component.filteredOrganisations = [...component.organisations]
    })

    it('should filter by search', () => {
      component.organisationSearch = 'beta'
      component.filterOrganisations()
      expect(component.filteredOrganisations.length).toBe(1)
    })
  })

  describe('toggleOrganisationShowAll / getDisplayedOrganisations', () => {
    it('should return 4 by default and all when toggled', () => {
      component.filteredOrganisations = Array.from({ length: 6 }, (_, i) => ({ name: `O${i}`, count: i }))
      expect(component.getDisplayedOrganisations().length).toBe(4)
      component.toggleOrganisationShowAll()
      expect(component.getDisplayedOrganisations().length).toBe(6)
    })
  })

  // ─── Competency methods ───────────────────────────────────────────────────────

  describe('toggleCompetencyShowAll / getDisplayedCompetencies', () => {
    it('should return 4 by default and all when toggled', () => {
      component.competencies = Array.from({ length: 6 }, (_, i) => ({ name: `C${i}`, count: i }))
      expect(component.getDisplayedCompetencies().length).toBe(4)
      component.toggleCompetencyShowAll()
      expect(component.getDisplayedCompetencies().length).toBe(6)
    })
  })

  describe('filterCompetencyTheme', () => {
    beforeEach(() => {
      component.competencyTheme = [{ name: 'Budgeting', count: 2 }, { name: 'Finance', count: 1 }]
      component.filteredCompetencyTheme = [...component.competencyTheme]
    })

    it('should filter competencyTheme by search', () => {
      component.competencyThemeSearch = 'bud'
      component.filterCompetencyTheme()
      expect(component.filteredCompetencyTheme.length).toBe(1)
    })
  })

  describe('toggleCompetencyThemeShowAll / getDisplayedCompetencyTheme', () => {
    it('should return 4 by default and all when toggled', () => {
      component.filteredCompetencyTheme = Array.from({ length: 6 }, (_, i) => ({ name: `T${i}`, count: i }))
      expect(component.getDisplayedCompetencyTheme().length).toBe(4)
      component.toggleCompetencyThemeShowAll()
      expect(component.getDisplayedCompetencyTheme().length).toBe(6)
    })
  })

  describe('filterCompetencySubTheme', () => {
    beforeEach(() => {
      component.competencySubTheme = [{ name: 'Forecasting', count: 1 }, { name: 'Reporting', count: 2 }]
      component.filteredCompetencySubTheme = [...component.competencySubTheme]
    })

    it('should filter competencySubTheme by search', () => {
      component.competencySubThemeSearch = 'fore'
      component.filterCompetencySubTheme()
      expect(component.filteredCompetencySubTheme.length).toBe(1)
    })
  })

  describe('toggleCompetencySubThemeShowAll / getDisplayedCompetencySubTheme', () => {
    it('should return 4 by default and all when toggled', () => {
      component.filteredCompetencySubTheme = Array.from({ length: 6 }, (_, i) => ({ name: `S${i}`, count: i }))
      expect(component.getDisplayedCompetencySubTheme().length).toBe(4)
      component.toggleCompetencySubThemeShowAll()
      expect(component.getDisplayedCompetencySubTheme().length).toBe(6)
    })
  })

  // ─── Difficulty Level methods ─────────────────────────────────────────────────

  describe('toggleDifficultyLevelShowAll / getDisplayedDifficultyLevels', () => {
    it('should return 4 by default and all when toggled', () => {
      component.filteredDifficultyLevels = Array.from({ length: 6 }, (_, i) => ({ name: `D${i}`, count: i }))
      expect(component.getDisplayedDifficultyLevels().length).toBe(4)
      component.toggleDifficultyLevelShowAll()
      expect(component.getDisplayedDifficultyLevels().length).toBe(6)
    })
  })

  // ─── isFilterSelected ─────────────────────────────────────────────────────────

  describe('isFilterSelected', () => {
    it('should return true when value is in selectedFilters', () => {
      component.selectedFilters.languages = ['English']
      expect(component.isFilterSelected('languages', 'English')).toBe(true)
    })

    it('should return false when value is not in selectedFilters', () => {
      expect(component.isFilterSelected('languages', 'French')).toBe(false)
    })
  })

  // ─── onFilterChange ───────────────────────────────────────────────────────────

  describe('onFilterChange', () => {
    it('should add value when checked and not already present', () => {
      const spy = jest.spyOn(component.filtersChanged, 'emit')
      component.onFilterChange('languages', 'English', true)
      expect(component.selectedFilters.languages).toContain('English')
      expect(spy).toHaveBeenCalled()
    })

    it('should not duplicate when value is already selected', () => {
      component.selectedFilters.languages = ['English']
      component.onFilterChange('languages', 'English', true)
      expect(component.selectedFilters.languages.length).toBe(1)
    })

    it('should remove value when unchecked', () => {
      component.selectedFilters.languages = ['English', 'Hindi']
      component.onFilterChange('languages', 'English', false)
      expect(component.selectedFilters.languages).not.toContain('English')
    })

    it('should not throw when unchecking a value not in the array', () => {
      expect(() => component.onFilterChange('languages', 'French', false)).not.toThrow()
    })
  })

  // ─── emitFilterChanges ────────────────────────────────────────────────────────

  describe('emitFilterChanges', () => {
    it('should emit selectedFilters', () => {
      const spy = jest.spyOn(component.filtersChanged, 'emit')
      component.emitFilterChanges()
      expect(spy).toHaveBeenCalledWith(component.selectedFilters)
    })
  })

  // ─── onClose ─────────────────────────────────────────────────────────────────

  describe('onClose', () => {
    it('should emit closeSidenav', () => {
      const spy = jest.spyOn(component.closeSidenav, 'emit')
      component.onClose()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── cancelFilters ────────────────────────────────────────────────────────────

  describe('cancelFilters', () => {
    it('should reset selectedFilters and emit', () => {
      component.selectedFilters.languages = ['English']
      const spy = jest.spyOn(component.filtersChanged, 'emit')
      component.cancelFilters()
      expect(component.selectedFilters.languages).toEqual([])
      expect(spy).toHaveBeenCalled()
    })

    it('should emit closeSidenav', () => {
      const spy = jest.spyOn(component.closeSidenav, 'emit')
      component.cancelFilters()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── onClearAll ───────────────────────────────────────────────────────────────

  describe('onClearAll', () => {
    it('should clear all search fields and selectedFilters, then emit', () => {
      component.languageSearch = 'eng'
      component.organisationSearch = 'acme'
      component.selectedFilters.languages = ['English']
      const spy = jest.spyOn(component.filtersChanged, 'emit')
      component.onClearAll()
      expect(component.languageSearch).toBe('')
      expect(component.organisationSearch).toBe('')
      expect(component.selectedFilters.languages).toEqual([])
      expect(spy).toHaveBeenCalled()
    })

    it('should collapse all sections', () => {
      component.showAllCategories = true
      component.showAllLanguages = true
      component.onClearAll()
      expect(component.showAllCategories).toBe(false)
      expect(component.showAllLanguages).toBe(false)
    })
  })

  // ─── onApplyFilter ────────────────────────────────────────────────────────────

  describe('onApplyFilter', () => {
    it('should clear search fields, collapse sections, emit and close', () => {
      const filterSpy = jest.spyOn(component.filtersChanged, 'emit')
      const closeSpy = jest.spyOn(component.closeSidenav, 'emit')
      component.languageSearch = 'en'
      component.onApplyFilter()
      expect(component.languageSearch).toBe('')
      expect(filterSpy).toHaveBeenCalled()
      expect(closeSpy).toHaveBeenCalled()
    })
  })

  // ─── hasAnyFacetWithValues ────────────────────────────────────────────────────

  describe('hasAnyFacetWithValues', () => {
    it('should return true when at least one facet has values', () => {
      component.allFacets = [{ name: 'language', values: [{ name: 'en', count: 1 }] }]
      expect(component.hasAnyFacetWithValues()).toBe(true)
    })

    it('should return false when all facets have empty values', () => {
      component.allFacets = [{ name: 'language', values: [] }]
      expect(component.hasAnyFacetWithValues()).toBe(false)
    })

    it('should return false when allFacets is null', () => {
      component.allFacets = null
      expect(component.hasAnyFacetWithValues()).toBe(false)
    })

    it('should return false when allFacets is empty array', () => {
      component.allFacets = []
      expect(component.hasAnyFacetWithValues()).toBe(false)
    })
  })
})
