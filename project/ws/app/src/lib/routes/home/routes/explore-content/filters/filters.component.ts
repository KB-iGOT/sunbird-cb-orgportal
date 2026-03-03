import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'

interface FilterItem {
  name: string
  count: number
}

@Component({
  selector: 'ws-app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnChanges {
  @Input() allFacets: any = []
  @Output() closeSidenav = new EventEmitter<void>()
  @Output() filtersChanged = new EventEmitter<any>()

  // Category data - will be populated from allFacets
  categories: FilterItem[] = []
  ratings: FilterItem[] = []
  filteredRatings: FilterItem[] = []
  languages: FilterItem[] = []
  organisations: FilterItem[] = []
  competencies: FilterItem[] = []
  competencyTheme: FilterItem[] = []
  competencySubTheme: FilterItem[] = []
  difficultyLevels: FilterItem[] = []

  // Filtered and displayed data
  filteredLanguages: FilterItem[] = []
  filteredOrganisations: FilterItem[] = []
  filteredCompetencies: FilterItem[] = []
  filteredCompetencyTheme: FilterItem[] = []
  filteredCompetencySubTheme: FilterItem[] = []
  filteredDifficultyLevels: FilterItem[] = []

  // Search strings
  languageSearch = ''
  organisationSearch = ''
  competencyThemeSearch = ''
  competencySubThemeSearch = ''

  // Expand/collapse states
  categoryExpanded = true
  showAllCategories = false
  showAllLanguages = false
  showAllOrganisations = false
  showAllCompetencies = false
  showAllCompetencyTheme = false
  showAllCompetencySubTheme = false
  showAllDifficultyLevels = false

  // Selected filters
  selectedFilters: any = {
    categoryType: [],
    ratings: [],
    languages: [],
    organisations: [],
    competencyArea: [],
    competencyTheme: [],
    competencySubTheme: [],
    difficultyLevel: []
  }

  constructor() { }

  ngOnInit(): void {
    this.initializeFiltersFromFacets()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allFacets'] && !changes['allFacets'].firstChange) {
      this.initializeFiltersFromFacets()
    }
  }

  private initializeFiltersFromFacets(): void {
    if (!this.allFacets || this.allFacets.length === 0) {
      console.warn('No facets available')
      return
    }

    this.allFacets.forEach((facet: any) => {
      switch (facet.name) {
        case 'courseCategory':
          this.categories = this.mapFacetValues(facet.values)
          break
        case 'avgRating':
          this.ratings = this.formatRatings(facet.values)
          break
        case 'language':
          this.languages = this.mapFacetValues(facet.values)
          break
        case 'organisation':
          this.organisations = this.mapFacetValues(facet.values)
          break
        case 'competencies_v6.competencyAreaName':
          this.competencies = this.mapFacetValues(facet.values)
          break
        case 'competencies_v6.competencyThemeName':
          this.competencyTheme = this.mapFacetValues(facet.values)
          break
        case 'competencies_v6.competencySubThemeName':
          this.competencySubTheme = this.mapFacetValues(facet.values)
          break
        case 'difficultyLevel':
          this.difficultyLevels = this.mapFacetValues(facet.values)
          break
      }
    })

    this.filteredLanguages = [...this.languages]
    this.filteredOrganisations = [...this.organisations]
    this.filteredCompetencies = [...this.competencies]
    this.filteredCompetencyTheme = [...this.competencyTheme]
    this.filteredCompetencySubTheme = [...this.competencySubTheme]
    this.filteredDifficultyLevels = [...this.difficultyLevels]
  }

  private mapFacetValues(values: any[]): FilterItem[] {
    if (!values) return []
    return values.map(v => ({
      name: this.capitalizeFirstLetter(v.name),
      count: v.count
    }))
  }

  private formatRatings(values: any[]): FilterItem[] {
    if (!values) return []
    // Build a simple map from rating string to count
    const valuesMap: Record<string, number> = {}
    values.forEach((v: any) => {
      const key = String(v.name)
      valuesMap[key] = (valuesMap[key] || 0) + (v.count || 0)
    })

    // Create aggregated rating ranges like 4.5, 4.0, 3.5, 3.0
    const ratingRanges = [4.5, 4, 3.5, 3]
    const formatted = ratingRanges
      .map((rating) => {
        const count = Object.entries(valuesMap)
          .filter(([rate]) => Number.parseFloat(rate) >= rating)
          .reduce((sum, [, cnt]) => sum + Number(cnt), 0)
        return count > 0 ? { name: `${rating.toFixed(1)}`, count } : null
      })
      .filter(Boolean) as FilterItem[]

    // Keep original ratings array (sorted) for compatibility, but also store the aggregated filteredRatings
    this.filteredRatings = formatted.map(v => ({
      name: `${v.name} & Above`,
      count: v.count
    }))
    const sortedValues = [...values].sort((a, b) => Number.parseFloat(b.name) - Number.parseFloat(a.name))
    return sortedValues.map(v => ({
      name: `${v.name} & Above`,
      count: v.count
    }))
  }

  private capitalizeFirstLetter(str: string): string {
    if (!str) return ''
    return str.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Category methods
  toggleCategoryExpand(): void {
    this.categoryExpanded = !this.categoryExpanded
  }

  toggleCategoryShowAll(): void {
    this.showAllCategories = !this.showAllCategories
  }

  getDisplayedCategories(): FilterItem[] {
    return this.showAllCategories ? this.categories : this.categories.slice(0, 5)
  }

  isAllContentsSelected(): boolean {
    return this.selectedFilters.categoryType.length === 0
  }

  onAllContentsChange(event: any): void {
    if (event.checked) {
      this.selectedFilters.categoryType = []
      this.emitFilterChanges()
    }
  }

  // Language methods
  filterLanguages(): void {
    const search = this.languageSearch.toLowerCase()
    this.filteredLanguages = this.languages.filter(l => l.name.toLowerCase().includes(search))
  }

  toggleLanguageShowAll(): void {
    this.showAllLanguages = !this.showAllLanguages
  }

  getDisplayedLanguages(): FilterItem[] {
    return this.showAllLanguages ? this.filteredLanguages : this.filteredLanguages.slice(0, 4)
  }

  // Organisation methods
  filterOrganisations(): void {
    const search = this.organisationSearch.toLowerCase()
    this.filteredOrganisations = this.organisations.filter(o => o.name.toLowerCase().includes(search))
  }

  toggleOrganisationShowAll(): void {
    this.showAllOrganisations = !this.showAllOrganisations
  }

  getDisplayedOrganisations(): FilterItem[] {
    return this.showAllOrganisations ? this.filteredOrganisations : this.filteredOrganisations.slice(0, 4)
  }

  // Competency methods
  toggleCompetencyShowAll(): void {
    this.showAllCompetencies = !this.showAllCompetencies
  }

  getDisplayedCompetencies(): FilterItem[] {
    return this.showAllCompetencies ? this.competencies : this.competencies.slice(0, 4)
  }

  // Competency Theme methods
  filterCompetencyTheme(): void {
    const search = this.competencyThemeSearch.toLowerCase()
    this.filteredCompetencyTheme = this.competencyTheme.filter(c => c.name.toLowerCase().includes(search))
  }

  toggleCompetencyThemeShowAll(): void {
    this.showAllCompetencyTheme = !this.showAllCompetencyTheme
  }

  getDisplayedCompetencyTheme(): FilterItem[] {
    return this.showAllCompetencyTheme ? this.filteredCompetencyTheme : this.filteredCompetencyTheme.slice(0, 4)
  }

  // Competency Sub-Theme methods
  filterCompetencySubTheme(): void {
    const search = this.competencySubThemeSearch.toLowerCase()
    this.filteredCompetencySubTheme = this.competencySubTheme.filter(c => c.name.toLowerCase().includes(search))
  }

  toggleCompetencySubThemeShowAll(): void {
    this.showAllCompetencySubTheme = !this.showAllCompetencySubTheme
  }

  getDisplayedCompetencySubTheme(): FilterItem[] {
    return this.showAllCompetencySubTheme ? this.filteredCompetencySubTheme : this.filteredCompetencySubTheme.slice(0, 4)
  }

  // Difficulty Level methods
  toggleDifficultyLevelShowAll(): void {
    this.showAllDifficultyLevels = !this.showAllDifficultyLevels
  }

  getDisplayedDifficultyLevels(): FilterItem[] {
    return this.showAllDifficultyLevels ? this.filteredDifficultyLevels : this.filteredDifficultyLevels.slice(0, 4)
  }

  // Common filter methods
  isFilterSelected(filterType: string, value: string): boolean {
    return this.selectedFilters[filterType].includes(value)
  }

  onFilterChange(filterType: string, value: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedFilters[filterType].includes(value)) {
        this.selectedFilters[filterType].push(value)
      }
    } else {
      const index = this.selectedFilters[filterType].indexOf(value)
      if (index > -1) {
        this.selectedFilters[filterType].splice(index, 1)
      }
    }
    this.emitFilterChanges()
  }

  emitFilterChanges(): void {
    this.filtersChanged.emit(this.selectedFilters)
  }

  onClose(): void {
    this.closeSidenav.emit()
  }

  cancelFilters(): void {
    this.selectedFilters = {
      categoryType: [],
      ratings: [],
      languages: [],
      organisations: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      difficultyLevel: []
    }
    this.emitFilterChanges()
    this.closeSidenav.emit()
  }

  onClearAll(): void {
    this.selectedFilters = {
      categoryType: [],
      ratings: [],
      languages: [],
      organisations: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      difficultyLevel: []
    }
    this.emitFilterChanges()
  }

  onApplyFilter(): void {
    this.emitFilterChanges()
    this.onClose()
  }
}
