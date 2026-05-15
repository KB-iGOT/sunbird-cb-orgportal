import { Component, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { Router } from '@angular/router'
/* tslint:disable */
import * as _ from 'lodash'
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
  constructor(private router: Router,) {

  }

  displayedColumns: string[] = [
    'RequestId',
    'title',
    'requestor',
    'requestType',
    'requestStatus',
    'assignee',
    'requestedOn',
    'interests',
    'action',
  ]

  staticRequestList: any[] = [
    {
      demand_id: 'REQ-1001',
      title: 'Angular Basics Course',
      ownerName: 'John Doe',
      requestType: 'Single',
      status: statusValue.Unassigned,
      assignedProvider: null,
      createdOn: new Date('2024-12-01'),
      interestCount: 2,
    },
    {
      demand_id: 'REQ-1002',
      title: 'AI for Beginners',
      ownerName: 'Jane Smith',
      requestType: 'Multiple',
      status: statusValue.Assigned,
      assignedProvider: 'ABC Learning',
      createdOn: new Date('2024-11-20'),
      interestCount: 4,
    },
    {
      demand_id: 'REQ-1003',
      title: 'Advanced TypeScript',
      ownerName: 'Michael Brown',
      requestType: 'Single',
      status: statusValue.Inprogress,
      assignedProvider: 'Tech Academy',
      createdOn: new Date('2024-10-15'),
      interestCount: 0,
    },
    {
      demand_id: 'REQ-1004',
      title: 'Cloud Fundamentals',
      ownerName: 'Emily Clark',
      requestType: 'Multiple',
      status: statusValue.fullfill,
      assignedProvider: 'CloudPro',
      createdOn: new Date('2024-09-05'),
      interestCount: 3,
    },
  ]
  dataSource!: MatTableDataSource<any>
  requestCount: number = 0



  ngOnInit() {
    this.loadStaticTableData()
  }

  loadStaticTableData() {
    this.dataSource = new MatTableDataSource(this.staticRequestList)
    this.requestCount = this.staticRequestList.length
  }

  viewACBPRoleMapping() {
    this.router.navigateByUrl('app/home/ai-cbp-requests/acbp-list')
  }


}
