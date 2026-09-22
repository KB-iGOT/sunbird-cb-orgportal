import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { PageEvent } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { debounceTime } from 'rxjs/operators'
import * as _ from 'lodash'
import { comprehensiveAssessmentList } from '../../models/comprehensive-assessment.model'

@Component({
  selector: 'ws-app-assessments-table',
  templateUrl: './assessments-table.component.html',
  styleUrls: ['./assessments-table.component.scss'],
  standalone: false,
})
export class AssessmentsTableComponent implements OnInit, OnChanges {

  @ViewChild(MatSort, { static: false }) sort!: MatSort

  @Input() tableData!: comprehensiveAssessmentList.tableData
  @Input() data: any[] = []
  @Input() menuItems: comprehensiveAssessmentList.menuItems[] = []
  @Input() showLoader = false
  @Input() paginationDetails: comprehensiveAssessmentList.pagination = {
    startIndex: 0,
    lastIndex: comprehensiveAssessmentList.DEFAULT_PAGE_SIZE,
    pageSize: comprehensiveAssessmentList.DEFAULT_PAGE_SIZE,
    pageIndex: 0,
    totalCount: 0,
  }

  @Output() actionsClick = new EventEmitter<any>()
  @Output() searchKey = new EventEmitter<string>()
  @Output() pageChange = new EventEmitter<comprehensiveAssessmentList.pagination>()

  searchControl = new FormControl('')
  dataSource = new MatTableDataSource<any>()
  pageSizeOptions = [20, 50, 100]
  tableColumns: comprehensiveAssessmentList.columnData[] = []
  columnsList: string[] = []
  showSearchBox = true
  showPagination = true
  noDataMessage = 'No data found'

  /** Thumbnail urls that failed to load, so their rows keep the placeholder instead. */
  private brokenThumbnails = new Set<string>()

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value: string | null) => this.searchKey.emit(value || ''))
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tableData && this.tableData) {
      this.showSearchBox = _.get(this.tableData, 'showSearchBox', true)
      this.showPagination = _.get(this.tableData, 'showPagination', true)
      this.noDataMessage = _.get(this.tableData, 'noDataMessage', 'No data found')
      this.buildColumns()
    }
    if (changes.menuItems) {
      this.buildColumns()
    }
    if (changes.data) {
      this.dataSource.data = this.data || []
      this.brokenThumbnails.clear()
      // MatSort only exists once the table has rendered, which is a tick after the data lands
      setTimeout(() => this.attachSort(), 0)
    }
  }

  /** The actions column is appended by the table, callers only describe their data columns. */
  private buildColumns() {
    if (!this.tableData) {
      return
    }
    const columns: comprehensiveAssessmentList.columnData[] = [...this.tableData.columns]
    if (this.menuItems.length > 0) {
      columns.push({ displayName: 'Actions', key: 'menu', cellType: 'menu' })
    }
    this.tableColumns = columns
    this.columnsList = _.map(columns, (column: comprehensiveAssessmentList.columnData) => column.key)
  }

  private attachSort() {
    if (!this.sort) {
      return
    }
    this.dataSource.sort = this.sort
    this.dataSource.sortingDataAccessor = (row: any, sortHeaderId: string) => {
      const column = _.find(this.tableColumns, { key: sortHeaderId })
      // dates are already formatted for display, so they sort on the raw value behind them
      if (column && column.cellType === 'date') {
        const parsed = Date.parse(_.get(row, sortHeaderId, ''))
        return Number.isNaN(parsed) ? 0 : parsed
      }
      const value = _.get(row, sortHeaderId, '')
      return typeof value === 'string' ? value.toLowerCase() : value
    }
  }

  /**
   * Whether the cell had to clip what it holds, which is the only case a tooltip says
   * anything the row is not already showing. The clamped columns run out of room downwards
   * - two lines, then the ellipsis - and the plain ones sideways, so both are measured.
   *
   * Asked per change detection rather than once, so the answer follows the column as the
   * window is resized or the page zoomed. It only reads layout, never writes it, so the
   * measurements come off the same clean layout pass the table has already had.
   */
  isTextTruncated(cell: HTMLElement): boolean {
    if (!cell) {
      return false
    }
    // sub-pixel rounding puts these a fraction apart on a zoomed page, which is not a clip
    return (cell.scrollHeight - cell.clientHeight) > 1 || (cell.scrollWidth - cell.clientWidth) > 1
  }

  /**
   * The url this row's thumbnail is drawn from. The column names the key it prefers and the
   * one to fall back to - the two tabs keep the image under different keys - and the first
   * that holds a url which has not already failed wins. An empty answer is the placeholder.
   *
   * A url that fails is remembered, so the next pass through here moves on to the fallback:
   * the img re-renders against the other key rather than the row going straight to the
   * placeholder because one of its two images happened to be unreadable.
   */
  thumbnailUrl(row: any, column: comprehensiveAssessmentList.columnData): string {
    const keys = _.compact([_.get(column, 'imageKey'), _.get(column, 'fallbackImageKey')])
    const usable = _.find(keys, (key: string) => {
      const url = _.get(row, key, '')
      return !!url && !this.brokenThumbnails.has(url)
    })
    return usable ? _.get(row, usable, '') : ''
  }

  /** The url that could not be loaded, so the row moves on to its other key. */
  onThumbnailError(url: string) {
    if (url) {
      this.brokenThumbnails.add(url)
    }
  }

  /** A row can suppress individual actions by listing them on `buttonsToHide`. */
  getButtonsToShow(row: any): comprehensiveAssessmentList.menuItems[] {
    const buttonsToHide = _.get(row, 'buttonsToHide', [])
    if (!buttonsToHide.length) {
      return this.menuItems
    }
    return _.filter(this.menuItems, (item: comprehensiveAssessmentList.menuItems) =>
      !_.includes(buttonsToHide, item.action))
  }

  buttonClick(action: string, rows: any) {
    this.actionsClick.emit({ action, rows })
  }

  onChangePage(pageEvent: PageEvent) {
    this.paginationDetails = {
      startIndex: pageEvent.pageIndex * pageEvent.pageSize,
      lastIndex: (pageEvent.pageIndex + 1) * pageEvent.pageSize,
      pageSize: pageEvent.pageSize,
      pageIndex: pageEvent.pageIndex,
      totalCount: this.paginationDetails.totalCount,
    }
    this.pageChange.emit(this.paginationDetails)
  }
}
