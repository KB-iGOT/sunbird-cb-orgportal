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
  constructor(public aicbpRequestSvc: AICBPRequestService, public dialog: MatDialog,
    private router: Router,
    private configSvc: ConfigurationsService
  ) {

  }

  displayedColumns: string[] = [
    'RequestId',
    'title',
    'requestor',
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

    this.aicbpRequestSvc.getApprovalRequests().subscribe((requests: any) => {

      console.log('API Response:', requests)

      requests?.items?.forEach((request: any) => {
        this.staticRequestList.push({
          demand_id: request.id,
          title: request.request_name,
          ownerName: request.state_center_name || 'N/A',
          requestType: 'N/A',
          status: request.status || 'N/A',
          assignedProvider: 'N/A',
          createdOn: new Date(request.created_at) || 'N/A',
          interestCount: request.designation_count || 0,
        })
      })

      this.dataSource = new MatTableDataSource(this.staticRequestList)

      this.requestCount = this.staticRequestList.length

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
    this.router.navigateByUrl('app/home/ai-cbp-requests/acbp-list/review-request/' + element.demand_id, {
      state: {
        configData: {
          userData: this.configSvc.unMappedUser,
          requestRowData: element,
          fromPortal: 'mdo'
        },
      },
    })
  }





}
