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
import { PublishResourceComponent } from '../../dialogs/publish-resource/publish-resource.component'
import { ProgressDialogComponent } from '../../dialogs/progress-dialog/progress-dialog.component'

const TAB_LIVE = 'live'
const TAB_DRAFT = 'draft'
const TAB_RETIRED = 'retired'
/**
 * Roles the dashboard offers Edit to. Every other action is open to anyone who can reach
 * the dashboard at all, which is what the requirement holds behind a role and what it does
 * not. `configService.userRoles` is the lowercased set the init service builds on login.
 */
const EDIT_ROLES = ['mdo_leader']
/**
 * Roles that are offered the authoring actions on their own assessments only. The menu
 * carries them and the rows they did not author drop them, so an MDO admin works on what
 * they created and can do no more than read the rest of the org's assessments. Holding an
 * `EDIT_ROLES` role as well wins - that one is not owner bound.
 */
const EDIT_OWN_ROLES = ['mdo_admin']
/**
 * What an owner bound role keeps only on the assessments it authored. View is deliberately
 * not among them: someone else's assessment stays readable, it just cannot be worked on.
 */
const OWNER_BOUND_ACTIONS = ['edit', 'publish', 'delete']

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
  /** `live`, `draft` or `retired`, taken from the child route the tab links to. */
  pathUrl = TAB_LIVE
  userProfile: any
  /** Every action on every row of the org, resolved off the roles once the config is in. */
  private canEditAny = false
  /** The authoring actions on the rows this user wrote, and View alone on the others. */
  private canEditOwn = false
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
    this.resolveEditAccess()
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

  /** Deny by default: an unresolved role set is not a reason to offer Edit. */
  private resolveEditAccess() {
    const roles: Set<string> | null = _.get(this.activatedRoute, 'snapshot.data.configService.userRoles', null)
    const hasRole = (role: string) => !!roles && roles.has(role)
    this.canEditAny = _.some(EDIT_ROLES, hasRole)
    // an owner bound role adds nothing to a user who can already edit every row
    this.canEditOwn = !this.canEditAny && _.some(EDIT_OWN_ROLES, hasRole)
  }

  /**
   * The thumbnail is read off a different key depending on the tab. Both are written at
   * creation, but publishing copies the assessment's `appIcon` under `/collection`, where the
   * object is not publicly readable - so a Live row is drawn from `posterImage`, which keeps
   * the url it was uploaded with, and a draft from the `appIcon` it has always had.
   *
   * Each names the other as its fallback rather than trusting one of them: an assessment
   * created before the poster was written carries only an icon, and the table falls through
   * to whichever key actually answers.
   */
  private buildNameColumn(): comprehensiveAssessmentList.columnData {
    const isDraft = this.pathUrl === TAB_DRAFT
    return {
      displayName: 'Assessment Name',
      key: 'name',
      cellType: 'textImage',
      imageKey: isDraft ? 'appIcon' : 'posterImage',
      // the other key, never the same one - the fallback is what a row carrying only one of
      // them is drawn from
      fallbackImageKey: isDraft ? 'posterImage' : 'appIcon',
      cellClass: 'text-overflow-elipse',
    }
  }

  private configureTab() {
    const canEdit = this.canEditAny || this.canEditOwn
    const nameColumn = this.buildNameColumn()

    /**
     * The linked plan and the two values derived from it. The assessment owns none of
     * them — they are read back off the plan metadata written when the plan was linked —
     * but the dashboard is where an admin tells two assessments of the same name apart.
     * Status is not among them: the tab the row is listed on is its status.
     */
    const planColumns: comprehensiveAssessmentList.columnData[] = [
      { displayName: 'Linked APAR Plan', key: 'planName', cellType: 'text', cellClass: 'text-overflow-elipse' },
      { displayName: 'Reporting Year', key: 'reportingYear', cellType: 'text' },
      { displayName: 'Assessment Window', key: 'assessmentWindow', cellType: 'text' },
    ]

    /**
     * A retired assessment is what a delete leaves behind, kept for the record. It is read
     * and nothing more - no role opens it for editing, publishing or deleting again - so the
     * menu is built without consulting `canEdit` at all.
     */
    if (this.pathUrl === TAB_RETIRED) {
      this.tableData = {
        columns: [
          nameColumn,
          ...planColumns,
          { displayName: 'Created By', key: 'creator', cellType: 'text' },
          // the retire is the last thing that can happen to an assessment, so the last
          // update it carries is when it was retired
          { displayName: 'Retired On', key: 'lastUpdatedOn', cellType: 'date' },
        ],
        showSearchBox: true,
        showPagination: true,
        noDataMessage: 'There are no retired assessments.',
      }
      this.menuItems = [{ btnText: 'View', action: 'view', icon: 'visibility' }]
      return
    }

    if (this.pathUrl === TAB_DRAFT) {
      this.tableData = {
        columns: [
          nameColumn,
          ...planColumns,
          { displayName: 'Created By', key: 'creator', cellType: 'text' },
          { displayName: 'Created On', key: 'createdOn', cellType: 'date' },
        ],
        showSearchBox: true,
        showPagination: true,
        noDataMessage: 'There are no draft assessments.',
      }
      this.menuItems = _.compact([
        { btnText: 'View', action: 'view', icon: 'visibility' },
        canEdit ? { btnText: 'Edit', action: 'edit', icon: 'edit' } : null,
        { btnText: 'Publish', action: 'publish', icon: 'publish' },
        { btnText: 'Delete', action: 'delete', icon: 'delete_outline' },
      ])
      return
    }

    this.tableData = {
      columns: [
        nameColumn,
        ...planColumns,
        { displayName: 'Created By', key: 'creator', cellType: 'text' },
        { displayName: 'Published On', key: 'lastPublishedOn', cellType: 'date' },
      ],
      showSearchBox: true,
      showPagination: true,
      noDataMessage: 'There are no live assessments.',
    }
    this.menuItems = _.compact([
      { btnText: 'View', action: 'view', icon: 'visibility' },
      canEdit ? { btnText: 'Edit', action: 'edit', icon: 'edit' } : null,
      { btnText: 'Delete', action: 'delete', icon: 'delete_outline' },
    ])
  }

  /** The content status the tab lists, the tab path being the only thing that says which. */
  private statusForTab(): string {
    switch (this.pathUrl) {
      case TAB_DRAFT:
        return comprehensiveAssessmentList.STATUS_DRAFT
      case TAB_RETIRED:
        return comprehensiveAssessmentList.STATUS_RETIRED
      default:
        return comprehensiveAssessmentList.STATUS_LIVE
    }
  }

  getAssessments() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe()
    }
    this.showLoader = true
    this.searchSubscription = this.assessmentSvc.searchAssessments({
      status: this.statusForTab(),
      rootOrgId: _.get(this.userProfile, 'rootOrgId', ''),
      query: this.searchKey,
      pageSize: _.get(this.paginationDetails, 'pageSize', comprehensiveAssessmentList.DEFAULT_PAGE_SIZE),
      pageIndex: _.get(this.paginationDetails, 'pageIndex', 0),
    }).subscribe({
      next: (res: { content: any[], count: number }) => {
        this.showLoader = false
        this.assessmentsList = _.map(res.content,
                                     (assessment: any) => this.applyRowAccess(this.nameOwnRow(assessment)))
        this.paginationDetails = { ...this.paginationDetails, totalCount: res.count }
      },
      error: (error: HttpErrorResponse) => {
        this.showLoader = false
        this.assessmentsList = []
        this.openSnackBar(_.get(error, 'error.message', 'Unable to load the assessments, please try again'))
      },
    })
  }

  /**
   * An owner bound author keeps the whole menu on the assessments they wrote - on the draft
   * tab that is View, Edit, Publish and Delete - and every other row of the org is left with
   * View. `buttonsToHide` is what the table reads to drop actions for one row, so the menu
   * stays configured once for the tab rather than per row.
   */
  /**
   * The Created By column names the author, and an author reading a row they wrote is told so
   * rather than shown their own name back. Kept apart from the access rules below: whether the
   * row is the user's own decides what it is called here and what can be done to it there, and
   * a user who may work on every row still reads `You` against their own.
   */
  private nameOwnRow(assessment: any): any {
    if (!this.isOwner(assessment)) {
      return assessment
    }
    return { ...assessment, creator: 'You' }
  }

  private applyRowAccess(assessment: any): any {
    if (!this.canEditOwn || this.isOwner(assessment)) {
      return assessment
    }
    return {
      ...assessment,
      buttonsToHide: _.union(_.get(assessment, 'buttonsToHide', []), OWNER_BOUND_ACTIONS),
    }
  }

  /** `createdBy` is the user id the assessment was authored by, as the search answers it. */
  private isOwner(assessment: any): boolean {
    const userId = _.get(this.userProfile, 'userId', '')
    return !!userId && _.get(assessment, 'createdBy', '') === userId
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
        this.publishAssessment(rowData)
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

  /**
   * Publishing is two publishes - the question set the assessment holds goes Live first,
   * and only then the assessment itself. The dialog walks both of them, and it lists what
   * it is about to publish, so the hierarchy is read for the children the row does not
   * carry: the listing is served by a search, which only answers the fields it projects.
   */
  publishAssessment(rowData: any) {
    if (!this.assessmentSvc.isWindowOpen(_.get(rowData, comprehensiveAssessmentList.WINDOW_END_KEY))) {
      this.openSnackBar(comprehensiveAssessmentList.WINDOW_CLOSED_MESSAGE)
      return
    }
    this.loaderService.changeLoaderState(true)
    this.assessmentSvc.getContentHierarchy(_.get(rowData, 'identifier', '')).subscribe({
      next: (res: any) => {
        this.loaderService.changeLoaderState(false)
        this.openPublishDialog(_.get(res, 'result.content', rowData))
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Unable to publish the assessment, please try again'))
      },
    })
  }

  private openPublishDialog(collection: any) {
    const dialogRef = this.dialog.open(PublishResourceComponent, {
      width: '600px',
      height: 'auto',
      autoFocus: false,
      disableClose: true,
      panelClass: 'publish-resource-dialog',
      data: { collection, userProfile: this.userProfile },
    })
    dialogRef.afterClosed().subscribe((published: boolean) => {
      if (published) {
        this.openSnackBar('Assessment published successfully')
        // the assessment has left this tab for the Live one, and the platform is still
        // finishing the publish - so the Live tab is opened once it has had its seconds
        this.loaderService.changeLoaderState(true)
        setTimeout(() => {
          this.loaderService.changeLoaderState(false)
          this.router.navigate(['/app/home/comprehensive-assessment', TAB_LIVE])
        },         comprehensiveAssessmentList.PUBLISH_SETTLE_MS)
      }
    })
  }

  deleteAssessment(rowData: any) {
    this.loaderService.changeLoaderState(true)
    this.assessmentSvc.retireAssessment(_.get(rowData, 'identifier', '')).subscribe({
      next: () => {
        this.loaderService.changeLoaderState(false)
        this.waitForDeleteToSettle()
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Unable to delete the assessment, please try again'))
      },
    })
  }
  //#endregion

  /**
   * Retiring answers as soon as it is taken, but the search drops the assessment a moment
   * later - listing a tab straight away still answers with the row that was just deleted,
   * which reads as the delete having failed. So the screen is held for as long as the
   * platform needs, saying what is happening, and the Retired tab is opened on it after:
   * the assessment has not gone anywhere, it has moved there.
   */
  private waitForDeleteToSettle() {
    const dialogRef = this.dialog.open(ProgressDialogComponent, {
      width: '440px',
      disableClose: true,
      autoFocus: false,
      data: {
        title: 'Deleting the assessment',
        subTitle: 'This takes a few seconds. The Retired tab opens on it once it is done.',
      },
    })
    setTimeout(() => {
      dialogRef.close()
      this.openSnackBar('Assessment deleted successfully')
      this.router.navigate(['/app/home/comprehensive-assessment', TAB_RETIRED])
    },         comprehensiveAssessmentList.DELETE_SETTLE_MS)
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe()
    }
  }
}
