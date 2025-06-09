import { AfterViewInit, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import * as _ from 'lodash'
import { CustomFieldsService } from '../../../../users/services/custom-fields.service'
import { ActivatedRoute } from '@angular/router'
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
  rootOrgId: any
  searchResults: any[] = []
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(private customFieldsService: CustomFieldsService,
    private activeRoute: ActivatedRoute,
  ) {
    this.rootOrgId = _.get(this.activeRoute, 'snapshot.data.configService.userProfile.rootOrgId')
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

    let payload = {
      filterCriteriaMap: {
        organisationId: this.rootOrgId,
      },
      requestedFields: [],
      pageNumber: 0,
      pageSize: 10,
      facets: []
    }
    this.customFieldsService.getCustomFields(payload).subscribe((res: any) => {
      console.log("res  ---------- ", res)
      this.searchResults = _.get(res, 'result.searchResults.data')
      this.length = _.get(res, 'result.searchResults.totalCount')
      if (this.searchResults.length) {
        this.searchResults.forEach((element: any) => {
          this.data.push({
            fieldName: element.name,
            fieldAttribute: element.attributeName,
            createdOn: element.createdOn,
            status: element.isMandatory,
            row: element,
          })
        })
      }
      this.dataSource.data = this.data
    })

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
