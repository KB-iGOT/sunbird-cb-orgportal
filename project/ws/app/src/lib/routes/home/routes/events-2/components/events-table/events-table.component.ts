import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { PageEvent } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import _ from 'lodash'
import { debounceTime } from 'rxjs/operators'
import { events } from '../../models/events.model'
import { MatSort } from '@angular/material/sort'

@Component({
  selector: 'ws-app-events-table',
  templateUrl: './events-table.component.html',
  styleUrls: ['./events-table.component.scss']
})
export class EventsTableComponent implements OnInit, OnChanges {
  @ViewChild(MatSort, { static: false }) sort!: MatSort
  @Input() tableData!: events.tableData
  @Input() data?: []
  @Input() paginationDetails: events.pagination = {
    startIndex: 0,
    lastIndex: 20,
    pageSize: 20,
    pageIndex: 0,
    totalCount: 20,
  }
  @Input() menuItems: events.menuItems[] = []
  @Input() showLoader = false
  @Output() actionsClick = new EventEmitter<any>()
  @Output() searchKey = new EventEmitter<string>()
  @Output() pageChange = new EventEmitter<any>()

  searchControl = new FormControl()
  showSearchBox = true
  displayedColumns: any
  dataSource!: any
  pageSizeOptions = [20, 50, 100]
  columnsList: any = []
  tableColumns = []
  noDataMessage = 'No data found'
  showPagination = true

  constructor() {
    this.dataSource = new MatTableDataSource<any>()
  }

  ngOnInit() {
    if (this.tableData) {
      this.displayedColumns = this.tableData.columns
      this.showSearchBox = _.get(this.tableData, 'showSearchBox', true)
      this.noDataMessage = _.get(this.tableData, 'noDataMessage', 'No data found')
      this.showPagination = _.get(this.tableData, 'showPagination', true)
    }

    this.searchControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(value => this.searchKey.emit(value))
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tableData) {
      this.getFinalColumns()
    }
    if (changes.data && this.dataSource) {
      this.dataSource.data = this.data
      setTimeout(() => {
        this.dataSource.sort = this.sort
        this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
          // find column definition if available
          const col: any = this.tableColumns && this.tableColumns.find((c: any) => c.key === sortHeaderId)
          if (col && col.cellType === 'date') {
            const val = data[sortHeaderId]
            const ts = this.parseDisplayDateToTimestamp(val)
            // return numeric timestamp for correct chronological sorting; fallback to original value
            return ts !== null ? ts : (val ?? '')
          }
          // default behaviour
          const v = data[sortHeaderId]
          // make string sorts case-insensitive
          return typeof v === 'string' ? v.toLowerCase() : v
        }
      }, 10)
    }
  }

  parseDisplayDateToTimestamp(dateStr: string | null | undefined): number | null {
    if (!dateStr) {
      return null
    }
    // normalize and remove commas
    const s = dateStr.trim().replace(',', '')
    // expected formats: "19 Jun 2025", "19 June 2025", "2025-06-19", etc.
    const parts = s.split(/\s+/)
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const monthStr = parts[1].toLowerCase()
      const year = parseInt(parts[2], 10)
      const monthMap: Record<string, number> = {
        jan: 0, january: 0,
        feb: 1, february: 1,
        mar: 2, march: 2,
        apr: 3, april: 3,
        may: 4,
        jun: 5, june: 5,
        jul: 6, july: 6,
        aug: 7, august: 7,
        sep: 8, sept: 8, september: 8,
        oct: 9, october: 9,
        nov: 10, november: 10,
        dec: 11, december: 11,
      }
      const month = monthMap[monthStr]
      if (!Number.isNaN(day) && !Number.isNaN(year) && month !== undefined) {
        return new Date(year, month, day).getTime()
      }
    }
    // fallback: try Date.parse
    const parsed = Date.parse(dateStr)
    return Number.isNaN(parsed) ? null : parsed
  }

  getFinalColumns() {
    this.columnsList = []
    const columns = JSON.parse(JSON.stringify(this.tableData.columns))
    if (this.menuItems.length > 0) {
      const selectColumn = { displayName: 'Actions', key: 'menu', cellType: 'menu' }
      columns.push(selectColumn)
    }
    this.tableColumns = columns
    this.columnsList = _.map(columns, c => c.key)
  }

  getButtonsToShow(rowData: any): events.menuItems[] {
    if (rowData['buttonsToHide']) {
      // const buttonsToShow: events.menuItems[] = this.menuItems.filter((menuItem: events.menuItems) => { !(rowData['buttonsToHide'].includes(menuItem.action)) })
      const buttonsToShow: events.menuItems[] = []
      this.menuItems.forEach((menuItem) => {
        if (!(rowData['buttonsToHide'].includes(menuItem.action))) {
          buttonsToShow.push(menuItem)
        }
      })
      return buttonsToShow
    }
    return this.menuItems
  }

  buttonClick(action: string, rows: any) {
    if (this.tableData) {
      this.actionsClick.emit({ action, rows })
    }
  }

  onChangePage(pe: PageEvent) {
    this.paginationDetails.startIndex = pe.pageIndex * pe.pageSize
    this.paginationDetails.lastIndex = (pe.pageIndex + 1) * pe.pageSize
    this.paginationDetails.pageSize = pe.pageSize
    this.paginationDetails.pageIndex = pe.pageIndex

    this.pageChange.emit(this.paginationDetails)
  }
}
