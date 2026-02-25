import { Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { PageEvent, MatPaginator } from '@angular/material/paginator'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { ConfirmationBoxComponent } from '../../../../training-plan/components/confirmation-box/confirmation.box.component'
import { RejectReasonDialogComponent } from '../reject-reason-dialog/reject-reason-dialog.component'
import { AchievementsService } from '../../../services/achievements.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'



@Component({
  selector: 'ws-app-approvals-list',
  templateUrl: './approvals-list.component.html',
  styleUrls: ['./approvals-list.component.scss']
})
export class ApprovalsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator

  displayedColumns: string[] = ['select', 'user', 'achievementTitle', 'dateSubmitted', 'actions']
  readonly pendingColumns: string[] = ['select', 'user', 'achievementTitle', 'dateSubmitted', 'actions']
  readonly reviewedColumns: string[] = ['user', 'achievementTitle', 'dateSubmitted', 'decisionDate', 'status', 'actions']

  dataSource: MatTableDataSource<any>
  userDetails: { [key: string]: string } = {}
  selection = new SelectionModel<any>(true, [])
  selectedTabIndex = 0
  filterStatus: 'ALL' | 'APPROVED' | 'REJECTED' = 'ALL'
  sideNavBarOpened: boolean = false
  selectedAchievement: any = null
  stats = {
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0
  }
  pageSize = 10
  totalResults = 0
  currentPage = 0

  constructor(private readonly dialog: MatLegacyDialog,
    private achievementsService: AchievementsService,
    private matSnackBar: MatSnackBar,
    private loaderService: LoaderService,
  ) {
    this.dataSource = new MatTableDataSource()
  }

  ngOnInit(): void {
    this.setTabData(0)
  }

  findFilters() {
    if (this.selectedTabIndex === 1) {
      if (this.filterStatus === 'APPROVED') {
        return ['APPROVED']
      }
      if (this.filterStatus === 'REJECTED') {
        return ['REJECTED']
      }
      return ['APPROVED', 'REJECTED']
    } else {
      return ['PENDING']
    }
  }

  loadData(): void {
    this.loaderService.changeLoad.next(true)
    const requestBody = {
      filterCriteriaMap: {
        status: this.findFilters()
      },
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      orderBy: 'createdOn',
      orderDirection: 'desc',
      facets: ['status']
    }

    this.achievementsService.getApprovalsList(requestBody).subscribe((res: any) => {
      if (res && res.result && res.result.search_results && res.result.search_results.userDetails) {
        this.userDetails = res.result.search_results.userDetails
      }
      if (res && res.result && res.result.search_results && res.result.search_results.data) {
        const items = res.result.search_results.data
        // add avatar object and stable avatarColor per item
        items.forEach((it: any) => {
          if (!it.avatarColor) {
            it.avatarColor = this.getRandomColor()
          }
          it.avatar = {
            initials: this.getInitials(it.userId),
            color: it.avatarColor,
          }
        })
        this.dataSource.data = items
        this.totalResults = res.result.search_results.totalCount || 0
      }
      if (res && res.result && res.result.search_results && res.result.search_results.facets && res.result.search_results.facets.status) {
        let statusFacets = res.result.search_results.facets.status
        const pendingFacet = statusFacets.find((f: any) => f.value === 'PENDING')
        const approvedFacet = statusFacets.find((f: any) => f.value === 'APPROVED')
        const rejectedFacet = statusFacets.find((f: any) => f.value === 'REJECTED')
        if (pendingFacet) { this.stats.totalPending = pendingFacet.count }
        if (approvedFacet) { this.stats.totalApproved = approvedFacet.count }
        if (rejectedFacet) { this.stats.totalRejected = rejectedFacet.count }
      }
      this.loaderService.changeLoad.next(false)
    }, () => {
      this.dataSource.data = []
      this.totalResults = 0
      this.loaderService.changeLoad.next(false)
    })
  }

  getUserName(userId: string): string {
    return (this.userDetails && this.userDetails[userId]) ? this.userDetails[userId] : '--'
  }

  getInitials(userId: string): string {
    const name = this.getUserName(userId)
    if (!name || name === '--') { return '' }
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index
    this.currentPage = 0
    this.setTabData(index)
  }

  private setTabData(index: number): void {
    this.currentPage = 0
    if (this.paginator) {
      this.paginator.pageIndex = 0
    }

    if (index === 0) {
      this.displayedColumns = this.pendingColumns
      this.loadData()
    } else {
      this.displayedColumns = this.reviewedColumns
      this.selection.clear()
      this.filterStatus = 'ALL'
      this.loadData()
    }

    this.totalResults = this.dataSource.data.length
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear()
      return
    }
    this.selection.select(...this.dataSource.data)
  }

  approve(element: any): void {
    if (element) {
      this.action('approve', element)
    }
  }

  reject(element: any): void {
    if (element) {
      this.action('reject', element)
    }
  }

  action(type: 'approve' | 'reject', element: any): void {
    if (type === 'reject') {
      const dialogRef = this.dialog.open(RejectReasonDialogComponent, {
        disableClose: true,
        data: {
          title: 'Remarks',
          maxLength: 500,
        },
        autoFocus: false,
        width: '1000px',
      })

      dialogRef.afterClosed().subscribe((reason: string | undefined) => {
        if (reason) {
          this.triggerAPICall(element, reason, 'REJECTED')
        }
      })
      return
    }
    const dialogRef = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: {
        type: 'conformation',
        icon: 'radio_on',
        title: `Are you sure you want to ${type} this?`,
        primaryAction: 'Confirm',
        secondaryAction: 'Cancel',
      },
      autoFocus: false,
    })
    dialogRef.afterClosed().subscribe((btnAction: any) => {
      if (btnAction) {
        this.triggerAPICall(element, 'this is approved via API', 'APPROVED')
      }
    })
  }

  triggerAPICall(element: any, reason: string, status: string): void {
    const requestBody = {
      request: {
        learnerId: element.userId,
        id: element.id,
        status: status,
        reason: reason,
        contextType: "achievements",
      }
    }
    this.achievementsService.updateApprovalStatus(requestBody).subscribe((resp) => {
      if (resp && resp.responseCode === 'OK') {
        this.matSnackBar.open(`Achievement ${status === 'REJECTED' ? 'rejected' : 'approved'} successfully`)
        this.currentPage = 0
        setTimeout(() => { this.loadData() }, 500)
      }
    }, (error) => {
      if (error && error.error.params.errMsg && error.error.params && error.error.params.errMsg) {
        this.matSnackBar.open(error.error.params.errMsg)
        return
      }
      this.matSnackBar.open(`Something went wrong while ${status === 'REJECTED' ? 'rejecting' : 'approving'} achievement`)
    })
  }

  bulkApprove(): void {
    const dialogRef = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: {
        type: 'conformation',
        icon: 'radio_on',
        title: 'Are you sure you want to approve all?',
        primaryAction: 'Confirm',
        secondaryAction: 'Cancel',
      },
      autoFocus: false,
    })

    dialogRef.afterClosed().subscribe((btnAction: any) => {
      if (btnAction) {
        // Integrate API call here to approve the achievement
      }
    })
  }

  onFilterChange(status: 'ALL' | 'APPROVED' | 'REJECTED'): void {
    this.filterStatus = status
    this.currentPage = 0
    if (this.paginator) {
      this.paginator.pageIndex = 0
    }
    if (this.selectedTabIndex === 1) {
      this.getFilteredReviewedData()
    }
  }

  private getFilteredReviewedData() {
    if (this.filterStatus === 'APPROVED') {
      this.loadData()
    }

    if (this.filterStatus === 'REJECTED') {
      this.loadData()
    }
    if (this.filterStatus === 'ALL') {
      this.loadData()
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize
    this.currentPage = event.pageIndex
    this.loadData()
  }

  handleCloseSidenav(): void {
    this.sideNavBarOpened = false
    this.selectedAchievement = null
  }

  view(rowData: any): void {
    this.sideNavBarOpened = true
    this.selectedAchievement = rowData
  }

  getRandomColor() {
    const randomcolors = [
      '#EB7181',
      '#006400',
      '#000000',
      '#3670B2',
      '#4E9E87',
      '#7E4C8D',
    ]
    return randomcolors[Math.floor(Math.random() * randomcolors.length)]
  }
}
