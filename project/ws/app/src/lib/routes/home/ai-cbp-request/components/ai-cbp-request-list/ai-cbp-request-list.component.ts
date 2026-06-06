import { Component, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
/* tslint:disable */
import * as _ from 'lodash'
import { AICBPRequestService } from '../../../services/ai-cbp-request.service'
import { ViewNonMappingDesignationComponent } from '../view-non-mapping-designation/view-non-mapping-designation.component'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import {
  ConfigurationsService
} from '@sunbird-cb/utils-v2'

/* tslint:enable */
export enum statusValue {
  Assigned = 'Assigned',
  Unassigned = 'Unassigned',
  Inprogress = 'InProgress',
  invalid = 'Invalid',
  fullfill = 'Fulfill',
}
@Component({
  selector: 'ws-ai-cbp-request-list',
  templateUrl: './ai-cbp-request-list.component.html',
  styleUrls: ['./ai-cbp-request-list.component.scss'],
})
export class AICBPRequestListComponent implements OnInit {
  searchText = '';
  selectedStatus = '';
  selectedAssignee = '';
  selectedTime = '';

  statusList: string[] = [];
  assigneeList: string[] = [];

  originalData: any[] = [];
  pageNo = 1
  pageSize = 20

  defaultPageSizeOptions = [10, 20, 25, 50, 100]
  showRejectPopupFlag = false
  rejectionDetail: any = {}
  constructor(public aicbpRequestSvc: AICBPRequestService, public dialog: MatDialog,
    private router: Router,
    private configSvc: ConfigurationsService
  ) {

  }

  displayedColumns: string[] = [
    'RequestId',
    'title',
    'requestor',
    'department_name',
    'requestStatus',
    'requestedOn',
    'interests',
    'action',
  ]

  staticRequestList: any[] = [

  ]
  dataSource!: MatTableDataSource<any>
  requestCount: number = 0



  ngOnInit() {
    this.loadStaticTableData()
  }
  loadStaticTableData() {
    this.staticRequestList = []

    this.aicbpRequestSvc.getApprovalRequests(this.pageNo,
      this.pageSize, this.searchText, this.selectedStatus).subscribe((requests: any) => {

        console.log('API Response:', requests)

        requests?.items?.forEach((request: any) => {
          this.staticRequestList.push({
            demand_id: request.id,
            title: request.request_name,
            ownerName: (request.user && request.user.email) ? request.user.email : 'N/A',
            department_name: request.department_name || 'N/A',
            requestType: 'N/A',
            status: request.status || 'N/A',
            assignedProvider: request.assignedProvider || 'Unassigned',
            createdOn: new Date(request.created_at),
            interestCount: request.designation_count || 0,
            reviewer_comments: request.reviewer_comments || 'No Reason Found',
          })
        })

        // IMPORTANT
        this.originalData = [...this.staticRequestList]

        this.prepareFilters(this.originalData)

        this.dataSource = new MatTableDataSource(this.originalData)

        this.requestCount = requests?.pagination?.total_items || 0

        console.log('requestCount =>', this.requestCount)
      })
  }

  viewNonMatchingDesignation() {
    const dialogRef = this.dialog.open(ViewNonMappingDesignationComponent, {
      maxHeight: 'auto',
      height: '65%',
      width: '80%',
      panelClass: 'remove-pad',
    })
    dialogRef.afterClosed().subscribe((response: any) => {
      console.log('Dialog closed with response:', response)

    })
  }

  viewACBPRoleMapping(element: any) {
    console.log('this.configSvc', this.configSvc)
    this.router.navigateByUrl('app/home/ai-cbp-requests/acbp-list/review-request/' + element.demand_id + '?source=mdo', {
      state: {
        configData: {
          userData: this.configSvc.unMappedUser,
          requestRowData: element,
          fromPortal: 'mdo'
        },
      },
    })
  }

  prepareFilters(data: any[]) {

    this.statusList = [

      "Approved", "Rejected", "Pending"
    ]

    this.assigneeList = [
      ...new Set(
        data
          .map(item => item?.assignedProvider)
          .filter(Boolean)
      )
    ]
  }

  applyFilters() {

    let filtered = [...this.originalData]

    // Search
    if (this.searchText?.trim()) {

      const search = this.searchText.toLowerCase()

      filtered = filtered.filter(item =>
        item?.title?.toLowerCase()?.includes(search) ||
        item?.demand_id?.toLowerCase()?.includes(search) ||
        item?.ownerName?.toLowerCase()?.includes(search) ||
        item?.status?.toLowerCase()?.includes(search) ||
        item?.department_name?.toLowerCase()?.includes(search)
      )
    }

    // Status
    if (this.selectedStatus) {

      filtered = filtered.filter(item =>
        item?.status === this.selectedStatus
      )
    }

    // Time Filter
    if (this.selectedTime) {

      const now = new Date()

      filtered = filtered.filter(item => {

        const createdDate = new Date(item.createdOn)

        switch (this.selectedTime) {

          case 'today':

            return (
              createdDate.getDate() === now.getDate() &&
              createdDate.getMonth() === now.getMonth() &&
              createdDate.getFullYear() === now.getFullYear()
            )

          case '7days': {

            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(now.getDate() - 7)

            return createdDate >= sevenDaysAgo
          }

          case '30days': {

            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(now.getDate() - 30)

            return createdDate >= thirtyDaysAgo
          }

          default:
            return true
        }
      })
    }

    this.dataSource.data = filtered

    // IMPORTANT
    this.requestCount = filtered.length
  }

  clearSearch() {
    this.searchText = ''
    this.loadStaticTableData()
  }

  onChangePage(event: any) {
    this.pageNo = event.pageIndex + 1
    this.pageSize = event.pageSize

    this.loadStaticTableData()
  }

  showRejectionSummary(element: any) {
    this.showRejectPopupFlag = true
    this.rejectionDetail = element
    console.log('Rejection Detail =>', this.rejectionDetail)
  }

  closeRejectPopup() {
    this.showRejectPopupFlag = false
  }

  clearAllFilters() {
    this.searchText = ''
    this.selectedStatus = ''
    this.selectedTime = ''
    this.pageNo = 1

    this.loadStaticTableData()
  }





}
