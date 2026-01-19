import { Component, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { PageEvent } from '@angular/material/paginator'

export interface AchievementApproval {
  id: string
  studentName: string
  studentEmail: string
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
  displayedColumns: string[] = ['select', 'student', 'achievementTitle', 'dateSubmitted', 'actions'];
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

  // Sample data
  private readonly sampleData: AchievementApproval[] = [
    {
      id: '1',
      studentName: 'Sarah Jenkins',
      studentEmail: 's.jenkins@university.edu',
      studentInitials: 'SJ',
      avatarColor: '#C8B88A',
      achievementTitle: 'Top Performer Q3',
      dateSubmitted: new Date('2023-10-12')
    },
    {
      id: '2',
      studentName: 'Michael Chen',
      studentEmail: 'm.chen@tech.org',
      studentInitials: 'MC',
      avatarColor: '#7BC5C5',
      achievementTitle: 'Product Innovation Award',
      dateSubmitted: new Date('2023-10-11')
    }
  ];

  constructor() {
    this.dataSource = new MatTableDataSource(this.sampleData)
  }

  ngOnInit(): void {
    // Load initial data
    this.loadApprovals()
  }

  loadApprovals(): void {
    // API call will be implemented when backend is ready
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
