import { AfterViewInit, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import * as _ from 'lodash'
import { CustomFieldsService } from '../../../../users/services/custom-fields.service'
import { ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component'
@Component({
  selector: 'ws-app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})

export class FormsListComponent implements OnInit, AfterViewInit {

  searchControl = new FormControl()
  tableData: any = []
  data: any = []
  pageSizeOptions = [10, 30, 40]
  columnsList: any = []
  dataSource!: any
  displayedColumns: any = []
  showCreateForm: boolean = false
  length!: number
  pageSize = 10
  pageNumber = 0
  rootOrgId: any
  searchResults: any[] = []
  isLoading = false
  selectedOptions: any[] = []
  selectedOptionsMap: { [key: string]: any[] } = {}
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort
  customFieldId: any = ''

  constructor(private customFieldsService: CustomFieldsService,
    private activeRoute: ActivatedRoute, private matSnackBar: MatSnackBar, private matDialog: MatDialog
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
        { displayName: 'Enabled', key: 'isEnabled' },
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
      orderDirection: "DESC",
      orderBy: 'createdOn',
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
            customFieldData: element.customFieldData,
            isEnabled: element.isEnabled,
            validation: element.validation,
            type: element.type,
            // hiracchy: element.type === 'master' ? this.discoverLevels(element.customFieldData, 0, levelMap) : '',
          })
        })
      }
      this.dataSource.data = this.data
      this.dataSource.data = this.data.map((item: any, idx: any) => ({ ...item, rowIndex: idx }))
      this.initializeDropdowns()
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

  onToggleChange(event: any, element: any) {
    let payload = {
      customFieldId: element.customFieldId,
      isEnabled: event.checked,
    }
    this.customFieldsService.updateCustomFieldStatus(payload).subscribe((res: any) => {
      if (res.result && res.result.customFieldId === element.customFieldId) {
        this.loadData()
        this.matSnackBar.open(`Field status ${event.checked ? 'activated' : 'deactivated'} successfully!`)
      } else {
        console.log('Error while updating custom field status')
      }
    })
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
    this.customFieldId = ''
  }
  closeForm(event: any) {
    if (event) {
      this.customFieldId = ''
      this.loadData()
      this.showCreateForm = false
    } else {
      this.showCreateForm = false
    }

  }

  deleteHandler(rowData: any) {
    console.log(rowData)
    const dialog = this.matDialog.open(ConfirmDeleteComponent, {
      width: '400px',
      backdropClass: 'backdropBackground',
    })
    dialog.afterClosed().subscribe(res => {
      if (res === true)
        this.customFieldsService.deleteCustomField(rowData.customFieldId).subscribe((res: any) => {
          if (res.result && res.result.status === 'deleted') {
            this.matSnackBar.open('Field is deleted successfully!')
            setTimeout(() => {
              this.loadData()
            }, 500)
          } else {
            console.log('Error while deleting custom field')
          }
        }, error => {
          this.matSnackBar.open(error)
          console.log(error)
        })
    })
  }

  editHandler(rowData: any) {
    console.log(rowData)
    this.showCreateForm = false
    setTimeout(() => {
      this.showCreateForm = true
      this.customFieldId = ''
      this.customFieldId = rowData.customFieldId
    }, 500)
  }

  onPageChange(event: any) {
    this.pageNumber = event.pageIndex
    this.pageSize = event.pageSize
    this.pageNumber = event.pageIndex
    this.loadData()
  }

  getSelectedOptions(rowKey: string): any[] {
    if (!this.selectedOptionsMap[rowKey]) {
      this.selectedOptionsMap[rowKey] = []
    }
    return this.selectedOptionsMap[rowKey]
  }

  getSelectedOptionsRef(rowKey: string): any[] {
    if (!this.selectedOptionsMap[rowKey]) {
      this.selectedOptionsMap[rowKey] = []
    }
    return this.selectedOptionsMap[rowKey]
  }

  onDropdownChange(level: number, rowKey: string) {
    debugger
    const arr = this.getSelectedOptions(rowKey)
    this.selectedOptionsMap[rowKey] = arr.slice(0, level + 1)
  }

  // Pre-select values for a specific row
  preSelectDropdownValues(rowKey: string, selections: any[]) {
    // Create the row's options array if it doesn't exist
    if (!this.selectedOptionsMap[rowKey]) {
      this.selectedOptionsMap[rowKey] = []
    }

    // Set initial selections
    selections.forEach((selection, index) => {
      this.selectedOptionsMap[rowKey][index] = selection
    })
  }

  // Call this when loading data
  initializeDropdowns() {
    // Clear any existing selections
    this.selectedOptionsMap = {}

    // Check if dataSource and its data exist
    if (!this.dataSource || !this.dataSource.data || this.dataSource.data.length === 0) {
      return
    }

    // Loop through each row in the data source
    this.dataSource.data.forEach((row: any, index: number) => {
      const rowKey = index.toString()

      // Skip rows that don't have customFieldData or aren't masterList type
      if (!row.customFieldData || !Array.isArray(row.customFieldData) || row.customFieldData.length === 0 || row.type !== 'masterList') {
        return
      }

      // Initialize an empty array for this row
      this.selectedOptionsMap[rowKey] = []

      // Add first-level options to make dropdowns visible but without selection
      this.selectedOptionsMap[rowKey][0] = null
    })
  }
}
