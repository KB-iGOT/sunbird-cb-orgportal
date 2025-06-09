import { AfterViewInit, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import * as _ from 'lodash'
@Component({
  selector: 'ws-app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})

export class FormsListComponent implements OnInit, AfterViewInit {

  searchControl = new FormControl()
  tableData: any = []
  data: any = []
  pageSizeOptions = [5, 10, 20]
  columnsList: any = []
  dataSource!: any
  displayedColumns: any = []
  showCreateForm: boolean = false
  length!: number
  pageSize = 5
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor() {
    this.dataSource = new MatTableDataSource<any>()
    this.dataSource.paginator = this.paginator
  }

  ngOnInit() {
    this.tableData = {
      columns: [
        { displayName: 'Field Name', key: 'fieldName' },
        { displayName: 'Field Attribute', key: 'fieldAttribute' },
        //{ displayName: 'Form Validation', key: 'formValidation' },
        { displayName: 'Created on', key: 'createdOn' },
        { displayName: 'Status', key: 'status' },
      ],
      actions: [],
      needCheckBox: false,
      needHash: false,
      needUserMenus: true,
      sortColumn: '',
      sortState: 'asc',
      actionColumnName: 'Actions',
    }
    this.data = [{
      fieldName: 'Gender',
      fieldAttribute: 'Checkbox',
      createdOn: "2020-01-31T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Age',
      fieldAttribute: 'Radio',
      createdOn: "2021-04-01T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Cader',
      fieldAttribute: 'CheckBox',
      createdOn: "2021-08-08T09:30:00.000Z",
      status: true,
    },
    {
      fieldName: 'Address',
      fieldAttribute: 'Checkbox',
      createdOn: "2021-12-10T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Street',
      fieldAttribute: 'Radio',
      createdOn: "2022-12-31T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Pincode',
      fieldAttribute: 'CheckBox',
      createdOn: "2023-02-27T09:30:00.000Z",
      status: true,
    },
    {
      fieldName: 'Mother Tongue',
      fieldAttribute: 'Checkbox',
      createdOn: "2023-12-31T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'DOB',
      fieldAttribute: 'Radio',
      createdOn: "2024-01-01T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Nationality',
      fieldAttribute: 'CheckBox',
      createdOn: "2024-01-31T09:30:00.000Z",
      status: true,
    },
    {
      fieldName: 'Other details',
      fieldAttribute: 'Checkbox',
      createdOn: "2024-02-12T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Age',
      fieldAttribute: 'Radio',
      createdOn: "2024-03-28T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Cader',
      fieldAttribute: 'CheckBox',
      createdOn: "2025-04-24T09:30:00.000Z",
      status: true,
    },
    {
      fieldName: 'Gender',
      fieldAttribute: 'Checkbox',
      createdOn: "2025-05-13T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Age',
      fieldAttribute: 'Radio',
      createdOn: "2025-05-30T09:30:00.000Z",
      status: false,
    },
    {
      fieldName: 'Cader',
      fieldAttribute: 'CheckBox',
      createdOn: "2025-06-01T09:30:00.000Z",
      status: true,
    }]
    if (this.tableData) {
      this.displayedColumns = this.tableData.columns
    }
  }
  ngOnChanges(data: SimpleChanges) {
    console.log('data', data)
    this.dataSource.data = _.get(data, 'data.currentValue')
    this.length = this.dataSource.data.length
    if (this.paginator) {
      this.paginator.firstPage()
    }
  }

  ngAfterViewInit() {
    if (this.data) {
      this.dataSource.data = this.data
      this.length = this.dataSource.data.length
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort
    }
  }

  onToggleChange(event: any, col: any) {
    if (event.checked) {
      console.log('checked', event, col)
    } else {
      console.log('unchecked')
    }
  }


  getFinalColumns() {
    if (this.tableData !== undefined) {
      const columns = _.map(this.tableData.columns, c => c.key)
      if (this.tableData.needCheckBox) {
        columns.splice(0, 0, 'select')
      }
      if (this.tableData.needHash) {
        columns.splice(0, 0, 'SR')
      }
      if (this.tableData.actions && this.tableData.actions.length > 0) {
        columns.push('Actions')
      }
      if (this.tableData.needUserMenus) {
        columns.push('Menu')
      }
      return columns
    }
    return ''
  }

  redirectToNewForm() {
    this.showCreateForm = true
  }
  closeForm(event: any) {
    console.log(event)
    if (event) {
      this.showCreateForm = false
    }
  }

  onPageChange(event: any) {
    console.log("event", event)
  }
}
