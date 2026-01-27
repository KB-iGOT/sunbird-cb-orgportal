import { Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator'
import { PageEvent } from '@angular/material/paginator'
import { ExploreContentService } from '../../services/explore-content.service'
import { animate, state, style, transition, trigger } from '@angular/animations'

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
    'status',
    'createdBy',
    'language',
    'createdOn',
    'lastSubmittedOn',
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

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator

  constructor(readonly exploreContentService: ExploreContentService,
  ) {
  }

  ngOnInit(): void {
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
    // Placeholder for navigation / preview action
    // Implement routing to content detail when backend is ready
    console.log('View content clicked', row)
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    this.loadContent()
  }

  private loadContent(): void {
    const requestBody = {
      locale: ['en'],
      request: {
        limit: this.pageSize,
        offset: this.pageIndex * this.pageSize,
        query: this.searchQuery || '',
        facets: ['courseCategory'],
        filters: {
          createdFor: ["0140788863598264326"],
          must: {
            courseCategory: [
              'Course',
              'Program',
              'Standalone Assessment',
              'Curated Program',
              'Blended Program',
              'invite-only program',
              'invite-only assessment',
              'Case Study',
              'Comprehensive Assessment Program',
            ],
          },
          status: ['Live'],
        },
        sort_by: {
          lastUpdatedOn: 'desc',
        },
      },
    }

    this.exploreContentService.getAllContent(requestBody).subscribe(
      response => {
        const result = response?.result || {}
        const contents = result.content || []
        this.length = typeof result.count === 'number' ? result.count : contents.length
        if (contents.length) {
          this.processContentResponse(contents)
        } else {
          this.dataSource.data = []
        }
      },
      error => {
        console.error('Error fetching explore content', error)
        this.dataSource.data = []
        this.length = 0
      }
    )
  }

  processContentResponse(contents: any[]): void {
    const contentRows: any[] = contents.map(content => {
      return {
        thumbnail: content.posterImage,
        title: content.name,
        tag: content.courseCategory || 'N/A',
        duration: content.duration ? this.formatDuration(content.duration) : 'N/A',
        createdBy: content.creator || 'Unknown',
        language: content.language || [],
        createdOn: content.createdOn ? new Date(content.createdOn).toLocaleDateString() : 'N/A',
        status: content.status || 'N/A',
        languageMapV1: content.languageMapV1 || {},
        courseCategory: content.courseCategory || '',
        lastSubmittedOn: content.lastSubmittedOn ? new Date(content.lastSubmittedOn).toLocaleDateString() : 'N/A',
      }
    })
    this.dataSource.data = contentRows
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
    const observable = this.exploreContentService.getAllContent(searchData)
    observable.subscribe(
      async data => {
        if (data.result.content && data.result.content.length) {
          this.multilingualCourses = data.result.content
        } else {
          this.multilingualCourses = []
        }
      })
  }

  getLanguageIds(languageMap: { [key: string]: { id: string; status: string } }): string[] {
    if (languageMap) {
      return Object.values(languageMap).filter((lang: any) => !lang.isBaseLang && lang.status?.toLowerCase() === 'live').map(lang => lang.id)
    }
    return []
  }
}
