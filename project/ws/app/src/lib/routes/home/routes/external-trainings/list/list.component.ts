import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'
import { MatTableDataSource } from '@angular/material/table'
import { MatSort } from '@angular/material/sort'
import { MatPaginator } from '@angular/material/paginator'
import moment from 'moment'

@Component({
  selector: 'ws-app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort!: MatSort
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator

  // Data Properties
  externalTrainingsData: any = []
  fetchContentDone = false
  totalCount = 0
  dataSource = new MatTableDataSource<any>([])

  // Pagination
  pageIndex = 0
  limit = 20
  searchQuery = ''

  // Table columns
  displayedColumns: string[] = ['trainingName', 'provider', 'deliveryMode', 'duration', 'createdAt', 'actions']

  // Config
  configSvc: any
  currentRowActions: any[] = []

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private externalTrainingsSvc: ExternalTrainingsService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.configSvc = this.activeRoute.snapshot.data['configService']
    this.getExternalTrainings()
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  // Search
  searchTrainings(searchString: string) {
    this.pageIndex = 0
    this.searchQuery = searchString.trim()
    this.getExternalTrainings()
  }

  // API call
  getExternalTrainings() {
    this.loaderService.changeLoaderState(true)
    this.fetchContentDone = false

    const payload: any = {
      filter: {
        orgIdList: [this.configSvc?.userProfile?.rootOrgId],
      },
      pageNumber: this.pageIndex,
      pageSize: this.limit,
      searchString: this.searchQuery,
    }

    if (!this.searchQuery) {
      payload.orderBy = 'createdAt'
      payload.orderDirection = 'desc'
    }

    this.externalTrainingsData = [
      {
        id: '1',
        trainingName: 'Angular Advanced',
        provider: 'Udemy',
        deliveryMode: 'Online',
        duration: '20 Hours',
        createdAt: '2025-01-15T10:00:00Z',
        status: 'Pending',
      },
      {
        id: '2',
        trainingName: 'React Masterclass',
        provider: 'Coursera',
        deliveryMode: 'Online',
        duration: '15 Hours',
        createdAt: '2025-02-01T12:00:00Z',
        status: 'Approved',
      },
      {
        id: '3',
        trainingName: 'Leadership Program',
        provider: 'IIM Bangalore',
        deliveryMode: 'Offline',
        duration: '5 Days',
        createdAt: '2024-12-20T09:30:00Z',
        status: 'Rejected',
      },
    ]
    this.convertDataForTable()
    // this.externalTrainingsSvc.getApprovalsList(payload).subscribe({
    //   next: (response: any) => {
    //     const data = response?.result?.result?.data || response?.result?.data || []
    //     this.totalCount = response?.result?.result?.totalCount || response?.result?.totalCount || data.length
    //     this.externalTrainingsData = data
    //     this.convertDataForTable()
    //   },
    //   error: () => {
    //     this.loaderService.changeLoaderState(false)
    //     this.fetchContentDone = true
    //   },
    // })
  }

  // Data processing
  convertDataForTable() {
    this.externalTrainingsData.forEach((item: any) => {
      item.createdAtFormatted = item?.createdAt ? moment(item.createdAt).format('MMM DD[,] YYYY') : ''
      item.createdAtSort = item?.createdAt ? moment(item.createdAt).valueOf() : 0
    })

    this.dataSource = new MatTableDataSource(this.externalTrainingsData)
    this.setupTableSorting()
    this.fetchContentDone = true
    this.loaderService.changeLoaderState(false)
  }

  private setupTableSorting() {
    setTimeout(() => {
      this.dataSource.sort = this.sort
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'createdAt': return item.createdAtSort
          case 'trainingName': return item.trainingName?.toLowerCase() || ''
          case 'provider': return item.provider?.toLowerCase() || ''
          case 'deliveryMode': return item.deliveryMode?.toLowerCase() || ''
          case 'duration': return item.duration?.toLowerCase() || ''
          default: return item[property] || ''
        }
      }
    }, 0)
  }

  // Actions
  prepareActions() {
    this.currentRowActions = [
      { key: 'viewDetails', name: 'View Details', icon: 'visibility' },
      { key: 'createBatch', name: 'Create Batch', icon: 'add' },
    ]

  }

  menuSelected(row: any, actionKey: string) {
    if (row?.id) {
      switch (actionKey) {
        case 'viewDetails':
          this.router.navigate(['app', 'home', 'external-trainings', row.id, 'details'])
          break
        case 'createBatch':
          this.router.navigate(['app', 'home', 'external-trainings', row.id, 'batches'])
          break
        default:
          break
      }
    }
  }

  updateStatus(row: any, status: string) {
    this.loaderService.changeLoaderState(true)
    const payload = {
      request: {
        id: row.id,
        status,
      },
    }

    this.externalTrainingsSvc.updateApprovalStatus(payload).subscribe({
      next: () => {
        this.loaderService.changeLoaderState(false)
        this.getExternalTrainings()
      },
      error: () => {
        this.loaderService.changeLoaderState(false)
      },
    })
  }

  // Pagination
  onPaginateChange(pageData: any) {
    this.pageIndex = pageData?.pageIndex || 0
    this.limit = pageData?.pageSize || 20
    this.getExternalTrainings()
  }

  onSortChange(event: any) {
    console.log('Sort changed:', event)
  }

  trackByActionKey(_index: number, action: any): any {
    return action.key
  }
}
