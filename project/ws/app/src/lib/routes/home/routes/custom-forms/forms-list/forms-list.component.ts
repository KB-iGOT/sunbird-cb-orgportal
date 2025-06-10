import { AfterViewInit, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import * as _ from 'lodash'
import { CustomFieldsService } from '../../../../users/services/custom-fields.service'
import { ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
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
  pageNumber = 0
  rootOrgId: any
  searchResults: any[] = []
  isLoading = false
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(private customFieldsService: CustomFieldsService,
    private activeRoute: ActivatedRoute, private matSnackBar: MatSnackBar,
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
        { displayName: 'Created on', key: 'createdOn' },
        { displayName: 'Mandatory', key: 'isMandatory' },
        { displayName: 'Status', key: 'status' },
        { displayName: 'Actions', key: 'actions' },
        { displayName: 'Preview', key: 'preview' },

      ],
      // actions: [],
      needCheckBox: false,
      needHash: false,
      needUserMenus: false,
      sortColumn: '',
      sortState: 'asc',
    }
    this.loadData()
  }

  loadData() {
    this.isLoading = true
    let payload = {
      filterCriteriaMap: {
        organisationId: this.rootOrgId,
      },
      requestedFields: [],
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      facets: []
    }
    this.data = []
    this.customFieldsService.getCustomFields(payload).subscribe((res: any) => {
      this.searchResults = _.get(res, 'result.searchResults.data')
      this.length = _.get(res, 'result.searchResults.totalCount')
      if (this.searchResults.length) {
        this.searchResults.forEach((element: any) => {
          this.data.push({
            fieldName: element.name,
            fieldAttribute: element.attributeName,
            createdOn: element.createdOn,
            isMandatory: element.isMandatory,
            object: element,
            customFieldId: element.customFieldId,
            status: element.isActive
          })
        })
      }
      this.dataSource.data = this.data
      this.isLoading = false
    }, (err: any) => {
      console.error(err)
      this.isLoading = false
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
      this.loadData()
      this.showCreateForm = false
    } else {
      this.showCreateForm = false
    }

  }

  onPageChange(event: any) {
    console.log("event", event)
  }

  deleteHandler(rowData: any) {
    console.log(rowData)
    this.customFieldsService.deleteCustomField(rowData.customFieldId).subscribe((res: any) => {
      if (res.result && res.result.status === 'deleted') {
        this.matSnackBar.open('Field is deleted successfully!')
        setTimeout(() => {
          this.loadData()
        }, 1000)
      } else {
        console.log('Error while deleting custom field')
      }
    }, error => {
      console.log(error)
    })
  }
}
