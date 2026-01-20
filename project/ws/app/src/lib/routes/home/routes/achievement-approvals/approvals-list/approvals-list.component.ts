import { Component, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { PageEvent } from '@angular/material/paginator'

export interface AchievementApproval {
  id: string
  userName: string
  userEmail: string
  studentInitials: string
  avatarColor: string
  achievementTitle: string
  dateSubmitted: Date
  evidenceUrl?: string
}

@Component({
  selector: 'ws-app-approvals-list',
  templateUrl: './approvals-list.component.html',
  styleUrls: ['./approvals-list.component.scss']
})
export class ApprovalsListComponent implements OnInit {
  displayedColumns: string[] = ['select', 'user', 'achievementTitle', 'dateSubmitted', 'actions'];
  readonly pendingColumns: string[] = ['select', 'user', 'achievementTitle', 'dateSubmitted', 'actions']
  readonly reviewedColumns: string[] = ['user', 'achievementTitle', 'dateSubmitted']

  dataSource: MatTableDataSource<AchievementApproval>
  selection = new SelectionModel<AchievementApproval>(true, []);
  selectedTabIndex = 0;

  stats = {
    totalPending: 24,
    reviewedToday: 142,
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
      dateSubmitted: new Date('2023-09-21')
    },
    {
      id: '4',
      userName: 'Priya Singh',
      userEmail: 'p.singh@university.edu',
      studentInitials: 'PS',
      avatarColor: '#FBC2EB',
      achievementTitle: 'Community Impact Award',
      dateSubmitted: new Date('2023-09-18')
    }
  ];

  constructor() {
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
      this.dataSource.data = this.reviewedData
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
    console.log('Approving:', element)
    // Implement approve logic
  }

  reject(element: AchievementApproval): void {
    console.log('Rejecting:', element)
    // Implement reject logic
  }

  bulkApprove(): void {
    console.log('Bulk approving:', this.selection.selected)
    // Implement bulk approve logic
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize
    this.currentPage = event.pageIndex
  }

  getStartIndex(): number {
    return this.currentPage * this.pageSize + 1
  }

  getEndIndex(): number {
    const end = (this.currentPage + 1) * this.pageSize
    return Math.min(end, this.totalResults)
  }
}
