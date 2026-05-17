import { Component, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
/* tslint:disable */
import * as _ from 'lodash'
import { AICBPRequestService } from '../../../services/ai-cbp-request.service'
import { MatDialog } from '@angular/material/dialog'
/* tslint:enable */
export enum statusValue {
  Assigned = 'Assigned',
  Unassigned = 'Unassigned',
  Inprogress = 'InProgress',
  invalid = 'Invalid',
  fullfill = 'Fulfill',
}
@Component({
  selector: 'ws-view-non-mapping-designation',
  templateUrl: './view-non-mapping-designation.component.html',
  styleUrls: ['./view-non-mapping-designation.component.scss'],
})
export class ViewNonMappingDesignationComponent implements OnInit {
  constructor(public aicbpRequestSvc: AICBPRequestService, public dialog: MatDialog) {

  }

  displayedColumns: string[] = [
    'designation_name',
    'organisation',
    'created_at',
    'status'
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

    this.aicbpRequestSvc.getNonMappingDesignationList()
      .subscribe((approvalRequest: any) => {

        console.log('approvalRequest', approvalRequest)

        approvalRequest?.items?.forEach((request: any) => {

          this.staticRequestList.push({
            designation_name: request.designation_name,
            organisation: request.organisation || 'N/A',
            division: request.division || 'N/A',
            status: request.status || 'N/A',
            email: request.email || 'N/A',
            id: request.id,
            created_at: new Date(request.created_at) || 'N/A',
          })

        })

        this.dataSource = new MatTableDataSource(this.staticRequestList)

        this.requestCount = this.staticRequestList.length

        console.log('requestCount =>', this.requestCount)
      })
  }

  viewNonMatchingDesignation() {

  }

  close() {
    this.dialog.closeAll()
  }

}
