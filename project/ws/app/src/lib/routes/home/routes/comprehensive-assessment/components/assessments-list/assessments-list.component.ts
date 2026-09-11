import { HttpErrorResponse } from '@angular/common/http'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import * as _ from 'lodash'
import { comprehensiveAssessmentList } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { ConfirmDialogComponent } from '../../../../../workallocation-v2/components/confirm-dialog/confirm-dialog.component'

const TAB_LIVE = 'live'
const TAB_DRAFT = 'draft'

@Component({
  selector: 'ws-app-assessments-list',
  templateUrl: './assessments-list.component.html',
  styleUrls: ['./assessments-list.component.scss'],
  standalone: false,
})
export class AssessmentsListComponent implements OnInit, OnDestroy {

  //#region (global variables)
  tableData!: comprehensiveAssessmentList.tableData
  menuItems: comprehensiveAssessmentList.menuItems[] = []
  paginationDetails!: comprehensiveAssessmentList.pagination
  assessmentsList: any[] = []
  showLoader = false
  searchKey = ''
  /** `live` or `draft`, taken from the child route the tab links to. */
  pathUrl = TAB_LIVE
  userProfile: any
  private searchSubscription!: Subscription
  //#endregion

  constructor(
    private assessmentSvc: ComprehensiveAssessmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private matSnackBar: MatSnackBar,
    private loaderService: LoaderService
  ) { }

  //#region (onInit)
  ngOnInit(): void {
    this.pathUrl = _.get(this.activatedRoute, 'snapshot.url[0].path', TAB_LIVE)
    this.userProfile = _.get(this.activatedRoute, 'snapshot.data.configService.userProfile')
    this.configureTab()
    this.paginationDetails = {
      startIndex: 0,
      lastIndex: comprehensiveAssessmentList.DEFAULT_PAGE_SIZE,
      pageSize: comprehensiveAssessmentList.DEFAULT_PAGE_SIZE,
      pageIndex: 0,
      totalCount: 0,
    }
    this.getAssessments()
  }

  private configureTab() {
    const nameColumn: comprehensiveAssessmentList.columnData = {
      displayName: 'Assessment Name',
      key: 'name',
      cellType: 'textImage',
      imageKey: 'appIcon',
      cellClass: 'text-overflow-elipse',
    }

    /**
     * The linked plan and the three values derived from it. The assessment owns none of
     * them — they are read back off the plan metadata written when the plan was linked —
     * but the dashboard is where an admin tells two assessments of the same name apart.
     */
    const planColumns: comprehensiveAssessmentList.columnData[] = [
      { displayName: 'Linked APAR Plan', key: 'planName', cellType: 'text', cellClass: 'text-overflow-elipse' },
      { displayName: 'Reporting Year', key: 'reportingYear', cellType: 'text' },
      { displayName: 'Assessment Window', key: 'assessmentWindow', cellType: 'text' },
      { displayName: 'Status', key: 'status', cellType: 'status' },
    ]

    if (this.pathUrl === TAB_DRAFT) {
      this.tableData = {
        columns: [
          nameColumn,
          ...planColumns,
          { displayName: 'Created By', key: 'creator', cellType: 'text' },
          { displayName: 'Duration', key: 'durationDisplay', cellType: 'text' },
          { displayName: 'Created On', key: 'createdOn', cellType: 'date' },
          { displayName: 'Last Updated On', key: 'lastUpdatedOn', cellType: 'date' },
        ],
        showSearchBox: true,
        showPagination: true,
        noDataMessage: 'There are no draft assessments.',
      }
      this.menuItems = [
        { btnText: 'Edit', action: 'edit', icon: 'edit' },
        { btnText: 'Publish', action: 'publish', icon: 'publish' },
        { btnText: 'Delete', action: 'delete', icon: 'delete_outline' },
      ]
      return
    }

    this.tableData = {
      columns: [
        nameColumn,
        ...planColumns,
        { displayName: 'Created By', key: 'creator', cellType: 'text' },
        { displayName: 'Duration', key: 'durationDisplay', cellType: 'text' },
        { displayName: 'Published On', key: 'lastPublishedOn', cellType: 'date' },
      ],
      showSearchBox: true,
      showPagination: true,
      noDataMessage: 'There are no live assessments.',
    }
    this.menuItems = [
      { btnText: 'View', action: 'view', icon: 'visibility' },
      { btnText: 'Edit', action: 'edit', icon: 'edit' },
      { btnText: 'Delete', action: 'delete', icon: 'delete_outline' },
    ]
  }

  getAssessments() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe()
    }
    this.showLoader = true
    this.searchSubscription = this.assessmentSvc.searchAssessments({
      status: this.pathUrl === TAB_DRAFT
        ? comprehensiveAssessmentList.STATUS_DRAFT
        : comprehensiveAssessmentList.STATUS_LIVE,
      rootOrgId: _.get(this.userProfile, 'rootOrgId', ''),
      query: this.searchKey,
      pageSize: _.get(this.paginationDetails, 'pageSize', comprehensiveAssessmentList.DEFAULT_PAGE_SIZE),
      pageIndex: _.get(this.paginationDetails, 'pageIndex', 0),
    }).subscribe({
      next: (res: { content: any[], count: number }) => {
        this.showLoader = false
        this.assessmentsList = res.content
        this.paginationDetails = { ...this.paginationDetails, totalCount: res.count }
      },
      error: (error: HttpErrorResponse) => {
        this.showLoader = false
        this.assessmentsList = []
        this.openSnackBar(_.get(error, 'error.message', 'Unable to load the assessments, please try again'))
      },
    })
  }
  //#endregion

  //#region (ui interactions)
  onSearch(searchKey: string) {
    this.searchKey = searchKey
    this.paginationDetails = { ...this.paginationDetails, pageIndex: 0 }
    this.getAssessments()
  }

  onPageChange(paginationDetails: comprehensiveAssessmentList.pagination) {
    this.paginationDetails = paginationDetails
    this.getAssessments()
  }

  onActionClick(event: any) {
    const rowData = _.get(event, 'rows')
    if (!rowData) {
      return
    }
    switch (_.get(event, 'action')) {
      case 'view':
        this.navigateToAssessment(rowData, 'view')
        break
      case 'edit':
        this.navigateToAssessment(rowData, 'edit')
        break
      case 'publish':
        this.confirmAndRun(
          'Are you sure you want to publish this assessment?',
          () => this.publishAssessment(rowData)
        )
        break
      case 'delete':
        this.confirmAndRun(
          'Are you sure you want to delete this assessment? This cannot be undone.',
          () => this.deleteAssessment(rowData)
        )
        break
    }
  }

  navigateToAssessment(rowData: any, openMode: string) {
    // preview/editMode are read by @sunbird-cb/toc off the url to pick its draft aware
    // hierarchy endpoint, mode stays first so its `&preview=true` check matches
    this.router.navigate(['/app/home/comprehensive-assessment/edit', _.get(rowData, 'identifier')], {
      queryParams: { mode: openMode, preview: 'true', editMode: 'true', pathUrl: this.pathUrl },
    })
  }

  private confirmAndRun(message: string, onConfirm: () => void) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      minHeight: '210px',
      height: 'auto',
      autoFocus: false,
      data: {
        message,
        dialogType: 'warning',
        icon: { iconName: 'error_outline', iconClass: 'warning-icon' },
        buttonsList: [
          { btnAction: false, displayText: 'No', btnClass: 'btn-outline-primary' },
          { btnAction: true, displayText: 'Yes', btnClass: 'successBtn' },
        ],
      },
    })
    dialogRef.afterClosed().subscribe((btnAction: any) => {
      if (btnAction) {
        onConfirm()
      }
    })
  }

  publishAssessment(rowData: any) {
    if (!this.assessmentSvc.isWindowOpen(_.get(rowData, comprehensiveAssessmentList.WINDOW_END_KEY))) {
      this.openSnackBar(comprehensiveAssessmentList.WINDOW_CLOSED_MESSAGE)
      return
    }
    this.loaderService.changeLoaderState(true)
    this.assessmentSvc.publishAssessment(
      _.get(rowData, 'identifier', ''),
      _.get(this.userProfile, 'userId', '')
    ).subscribe({
      next: () => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar('Assessment published successfully')
        // publishing moves the row out of the Draft tab, so the current list is reloaded
        this.getAssessments()
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Unable to publish the assessment, please try again'))
      },
    })
  }

  deleteAssessment(rowData: any) {
    this.loaderService.changeLoaderState(true)
    this.assessmentSvc.retireAssessment(_.get(rowData, 'identifier', '')).subscribe({
      next: () => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar('Assessment deleted successfully')
        this.getAssessments()
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Unable to delete the assessment, please try again'))
      },
    })
  }
  //#endregion

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe()
    }
  }
}
