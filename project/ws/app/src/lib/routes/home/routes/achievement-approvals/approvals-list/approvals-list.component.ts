import { Component, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { PageEvent } from '@angular/material/paginator'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationBoxComponent } from '../../../../training-plan/components/confirmation-box/confirmation.box.component'
import { RejectReasonDialogComponent } from '../reject-reason-dialog/reject-reason-dialog.component'

export interface AchievementApproval {
  id: string
  userName: string
  userEmail: string
  studentInitials: string
  avatarColor: string
  achievementTitle: string
  dateSubmitted: Date
  status?: 'Approved' | 'Rejected'
  decisionDate?: Date
  evidenceUrl?: string
}

@Component({
    selector: 'ws-app-approvals-list',
    templateUrl: './approvals-list.component.html',
    styleUrls: ['./approvals-list.component.scss'],
    standalone: false
})
export class ApprovalsListComponent implements OnInit {
  displayedColumns: string[] = ['select', 'user', 'achievementTitle', 'dateSubmitted', 'actions'];
  readonly pendingColumns: string[] = ['select', 'user', 'achievementTitle', 'dateSubmitted', 'actions']
  readonly reviewedColumns: string[] = ['user', 'achievementTitle', 'dateSubmitted', 'decisionDate', 'status']

  dataSource: MatTableDataSource<AchievementApproval>
  selection = new SelectionModel<AchievementApproval>(true, []);
  selectedTabIndex = 0;
  filterStatus: 'All' | 'Approved' | 'Rejected' = 'All'

  stats = {
    totalPending: 24,
    totalApproved: 1240,
    totalRejected: 45
  };

  pageSize = 10;
  totalResults = 24;
  currentPage = 0;

  // Sample data for Pending tab
  private readonly pendingData: AchievementApproval[] = [
    {
      id: '1',
      userName: 'Sarah Jenkins',
      userEmail: 's.jenkins@university.edu',
      studentInitials: 'SJ',
      avatarColor: '#C8B88A',
      achievementTitle: 'Top Performer Q3',
      dateSubmitted: new Date('2023-10-12')
    },
    {
      id: '2',
      userName: 'Michael Chen',
      userEmail: 'm.chen@tech.org',
      studentInitials: 'MC',
      avatarColor: '#7BC5C5',
      achievementTitle: 'Product Innovation Award',
      dateSubmitted: new Date('2023-10-11')
    }
  ];

  // Sample data for Approved / Rejected tab
  private readonly reviewedData: AchievementApproval[] = [
    {
      id: '3',
      userName: 'Alex Rivera',
      userEmail: 'a.rivera@college.edu',
      studentInitials: 'AR',
      avatarColor: '#A1C4FD',
      achievementTitle: 'Leadership Excellence',
      dateSubmitted: new Date('2023-09-21'),
      status: 'Approved',
      decisionDate: new Date('2023-09-25')
    },
    {
      id: '4',
      userName: 'Priya Singh',
      userEmail: 'p.singh@university.edu',
      studentInitials: 'PS',
      avatarColor: '#FBC2EB',
      achievementTitle: 'Community Impact Award',
      dateSubmitted: new Date('2023-09-18'),
      status: 'Rejected',
      decisionDate: new Date('2023-09-22')
    }
  ];

  constructor(private readonly dialog: MatDialog) {
    this.dataSource = new MatTableDataSource()
  }

  ngOnInit(): void {
    // Load initial data
    this.setTabData(0)
    this.loadApprovals()
  }

  loadApprovals(): void {
    // API call will be implemented when backend is ready
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index
    this.setTabData(index)
  }

  private setTabData(index: number): void {
    this.currentPage = 0

    if (index === 0) {
      this.displayedColumns = this.pendingColumns
      this.dataSource.data = this.pendingData
    } else {
      this.displayedColumns = this.reviewedColumns
      this.selection.clear()
      this.filterStatus = 'All'
      this.dataSource.data = this.getFilteredReviewedData()
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

  approve(element: AchievementApproval): void {
    if (element) {
      this.action('approve')
    }
  }

  reject(element: AchievementApproval): void {
    if (element) {
      this.action('reject')
    }
  }

  action(type: 'approve' | 'reject'): void {
    if (type === 'reject') {
      const dialogRef = this.dialog.open(RejectReasonDialogComponent, {
        disableClose: true,
        data: {
          title: 'Please specify the reason for rejection',
          maxLength: 500,
        },
        autoFocus: false,
        width: '1000px',
      })

      dialogRef.afterClosed().subscribe((reason: string | undefined) => {
        if (reason) {
          // Integrate API call here to reject the achievement with this reason
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
        // Integrate API call here to approve the achievement
      }
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

  onFilterChange(status: 'All' | 'Approved' | 'Rejected'): void {
    this.filterStatus = status

    if (this.selectedTabIndex === 1) {
      this.dataSource.data = this.getFilteredReviewedData()
      this.totalResults = this.dataSource.data.length
    }
  }

  private getFilteredReviewedData(): AchievementApproval[] {
    if (this.filterStatus === 'Approved') {
      return this.reviewedData.filter(item => item.status === 'Approved')
    }

    if (this.filterStatus === 'Rejected') {
      return this.reviewedData.filter(item => item.status === 'Rejected')
    }

    return this.reviewedData
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize
    this.currentPage = event.pageIndex
  }
}
