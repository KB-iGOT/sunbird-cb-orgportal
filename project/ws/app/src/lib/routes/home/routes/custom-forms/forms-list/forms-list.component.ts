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
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (!this.dataSource.sort) {
      this.dataSource.sort = sort
    }
  }
  constructor() {
    this.dataSource = new MatTableDataSource<any>()
    this.dataSource.paginator = this.paginator
  }

  ngOnInit() {
    this.tableData = {
      columns: [
        { displayName: 'Form Name', key: 'formName' },
        { displayName: 'Form Attribute', key: 'formAttribute' },
        //{ displayName: 'Form Validation', key: 'formValidation' },
        { displayName: 'created on', key: 'createdOn' },
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
      formName: 'Gender',
      formAttribute: 'Checkbox',
      createdOn: "2020-01-31T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Age',
      formAttribute: 'Radio',
      createdOn: "2021-04-01T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Cader',
      formAttribute: 'CheckBox',
      createdOn: "2021-08-08T09:30:00.000Z",
      status: true,
    },
    {
      formName: 'Address',
      formAttribute: 'Checkbox',
      createdOn: "2021-12-10T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Street',
      formAttribute: 'Radio',
      createdOn: "2022-12-31T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Pincode',
      formAttribute: 'CheckBox',
      createdOn: "2023-02-27T09:30:00.000Z",
      status: true,
    },
    {
      formName: 'Mother Tongue',
      formAttribute: 'Checkbox',
      createdOn: "2023-12-31T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'DOB',
      formAttribute: 'Radio',
      createdOn: "2024-01-01T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Nationality',
      formAttribute: 'CheckBox',
      createdOn: "2024-01-31T09:30:00.000Z",
      status: true,
    },
    {
      formName: 'Other details',
      formAttribute: 'Checkbox',
      createdOn: "2024-02-12T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Age',
      formAttribute: 'Radio',
      createdOn: "2024-03-28T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Cader',
      formAttribute: 'CheckBox',
      createdOn: "2025-04-24T09:30:00.000Z",
      status: true,
    },
    {
      formName: 'Gender',
      formAttribute: 'Checkbox',
      createdOn: "2025-05-13T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Age',
      formAttribute: 'Radio',
      createdOn: "2025-05-30T09:30:00.000Z",
      status: false,
    },
    {
      formName: 'Cader',
      formAttribute: 'CheckBox',
      createdOn: "2025-06-01T09:30:00.000Z",
      status: true,
    }]
    if (this.tableData) {
      this.displayedColumns = this.tableData.columns
    }
  }
  ngOnChanges(data: SimpleChanges) {
    this.dataSource.data = _.get(data, 'data.currentValue')
    this.length = this.dataSource.data.length
    if (this.paginator) {
      this.paginator.firstPage()
    }
  }

  ngAfterViewInit() {
    if (this.data) {
      this.dataSource.data = this.data
      this.length = this.data.length
      this.dataSource.sort = this.matSort
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
}
