import { Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator'
import { PageEvent } from '@angular/material/paginator'
import { ExploreContentService } from '../../services/explore-content.service'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { Router } from '@angular/router'
import { LoaderService } from '../../../../../../../../../src/app/services/loader.service'

@Component({
  selector: 'ws-app-explore-content',
  templateUrl: './explore-content.component.html',
  styleUrls: ['./explore-content.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })), // Removed display: 'none'
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ExploreContentComponent implements OnInit {
  displayedColumns: string[] = [
    'expand',
    'contentName',
    'createdBy',
    'language',
    'createdOn',
    'publishedOn',
    'actions',
  ]
  dataSource = new MatTableDataSource<any>([])

  searchQuery = ''
  length = 0
  pageSize = 10
  pageIndex = 0
  pageSizeOptions: number[] = [10, 25, 50]
  expandedElement: any = null
  multilingualCourses: any[] = []
  currentTab: 'live' | 'draft' | 'retired' = 'live'
  sideNavBarOpened = false
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator
  searchBody: any
  allFacets: any
  defaultFacets: any = ["courseCategory", "avgRating", "language", "organisation",
    "competencies_v6.competencyAreaName", "competencies_v6.competencyThemeName",
    "competencies_v6.competencySubThemeName"]
  defaultCategories: string[] = [
    'Course',
    'Program',
    'Standalone Assessment',
    'Curated Program',
    'Blended Program',
    'invite-only program',
    'invite-only assessment',
    'Case Study',
    'Comprehensive Assessment Program',
    'multilingual course'
  ]
  constructor(
    readonly exploreContentService: ExploreContentService,
    private router: Router,
    private loaderService: LoaderService,
  ) {
  }

  ngOnInit(): void {
    this.searchBody = {
      locale: ['en'],
      request: {
        limit: this.pageSize,
        offset: this.pageIndex * this.pageSize,
        query: this.searchQuery || '',
        facets: this.defaultFacets,
        filters: {
          contentType: ["Course"],
          courseCategory: this.defaultCategories,
          status: ['Live'],
        },
        sort_by: {
          lastUpdatedOn: 'desc',
        },
      },
    }
    this.loadContent()
  }

  applySearch(value: string): void {
    this.searchQuery = (value || '').trim()
    this.pageIndex = 0
    this.loadContent()
  }

  clearSearch(): void {
    this.searchQuery = ''
    this.applySearch('')
  }

  viewContent(row: any): void {
    if (!row || !row.identifier) {
      console.warn('Cannot navigate to preview: missing identifier on row', row)
      return
    }
    this.router.navigate([
      'app',
      'home',
      'explore-content',
      row.identifier,
      'preview',
    ])
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    this.loadContent()
  }

  private loadContent(): void {
    this.loaderService.changeLoaderState(true)

    this.exploreContentService.getAllContent(this.searchBody).subscribe(
      response => {
        const result = response?.result || {}
        const contents = result.content || []
        this.length = typeof result.count === 'number' ? result.count : contents.length
        if (contents.length) {
          this.dataSource.data = contents
          this.allFacets = result.facets || []
          this.loaderService.changeLoaderState(false)
        } else {
          this.dataSource.data = []
          this.loaderService.changeLoaderState(false)
        }
      },
      error => {
        console.error('Error fetching explore content', error)
        this.dataSource.data = []
        this.length = 0
        this.loaderService.changeLoaderState(false)
      }
    )
  }

  formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60)
    const seconds = durationInSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  public getLanguageCount(languageMap: { [key: string]: any }): number {
    if (languageMap) {
      const filteredLanguages = Object.values(languageMap).filter(
        (lang: any) => lang.status?.toLowerCase() === 'live' && !lang.isBaseLang
      )
      return filteredLanguages.length
    }
    return 0
  }

  public getFormattedLanguageNames(languageMap: any): any {
    if (languageMap) {
      // Use Object.entries to get both keys and values
      return Object.entries(languageMap)
        .filter(([_, lang]: [string, any]) =>
          lang.status?.toLowerCase() === 'live' &&
          !lang.isBaseLang
        )
        .map(([key, value]) => {
          return {
            key,
            value
          }
        })
    }
    return ''
  }

  takeAction(action: 'overview' | 'edit', course: any): void {
    // Placeholder for navigation; wire to router when ready
    console.log('Take action', action, 'for course', course)
  }

  changeToDefaultImg(event: Event): void {
    const target = event.target as HTMLImageElement
    target.src = '/assets/common/mdo-assets/images/content-thumbnail-placeholder.svg'
  }

  getPendingStatus(element: any): string {
    return element?.contentRetiredStatus || ''
  }

  getMultiLanguageCourses(element: any): void {
    const searchData = {
      locale: ['en'],
      request: {
        limit: 10,
        offset: 0,
        query: '',
        facets: ['courseCategory', 'resourceCategory'],
        filters: {
          identifier: this.getLanguageIds(element.languageMapV1 || {}),
          status: ["Live"],
        },
        sort_by: {
          lastUpdatedOn: 'desc',
        },
      },
    }
    this.loaderService.changeLoaderState(true)
    const observable = this.exploreContentService.getAllContent(searchData)
    observable.subscribe(
      async data => {
        if (data.result.content && data.result.content.length) {
          this.multilingualCourses = data.result.content
        } else {
          this.multilingualCourses = []
        }
        this.loaderService.changeLoaderState(false)
      })
  }

  getLanguageIds(languageMap: { [key: string]: { id: string; status: string } }): string[] {
    if (languageMap) {
      return Object.values(languageMap).filter((lang: any) => !lang.isBaseLang && lang.status?.toLowerCase() === 'live').map(lang => lang.id)
    }
    return []
  }

  handleCloseSidenav(): void {
    this.sideNavBarOpened = false
  }

  handleFiltersChanges(selectedFilters: any): void {
    console.log('Selected filters received:', selectedFilters)
    this.pageIndex = 0

    // Update filters in searchBody
    this.searchBody.request.filters = this.processSelectedFilters(selectedFilters)
    console.log('Updated searchBody with filters:', this.searchBody)
    this.loadContent()
  }

  processSelectedFilters(selectedFilters: any): any {
    const filters: any = {
      contentType: ['Course'],
      status: ['Live'],
      courseCategory: this.defaultCategories,
      query: this.searchQuery || '',
    }

    // override default courseCategory if user selected categories
    if (selectedFilters && Array.isArray(selectedFilters.categoryType) && selectedFilters.categoryType.length > 0) {
      filters.courseCategory = selectedFilters.categoryType
    }

    // helper to add array filters only when non-empty
    const addIfNonEmpty = (key: string, arr?: any[]) => {
      if (Array.isArray(arr) && arr.length > 0) {
        filters[key] = arr
      }
    }

    // ratings -> avgRating (parse leading numeric value)
    if (selectedFilters && Array.isArray(selectedFilters.ratings) && selectedFilters.ratings.length > 0) {
      const re = /^\d+(?:\.\d+)?/
      const parsed: number[] = []
      for (const r of selectedFilters.ratings) {
        const m = re.exec(String(r))
        if (m?.[0]) {
          parsed.push(Number.parseFloat(m[0]))
        }
      }
      if (parsed.length) {
        // choose the smallest threshold so the filter is inclusive
        const threshold = Math.min(...parsed)
        filters.avgRating = { '>=': String(threshold) }
      }
    }
    addIfNonEmpty('organisation', selectedFilters.organisations)
    addIfNonEmpty('competencies_v6.competencyAreaName', selectedFilters.competencyArea)
    addIfNonEmpty('competencies_v6.competencyThemeName', selectedFilters.competencyTheme)
    addIfNonEmpty('competencies_v6.competencySubThemeName', selectedFilters.competencySubTheme)
    return filters
  }
}
