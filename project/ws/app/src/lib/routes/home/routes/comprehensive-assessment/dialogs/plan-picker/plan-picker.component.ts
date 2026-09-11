import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatRadioChange } from '@angular/material/radio'
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpErrorResponse } from '@angular/common/http'
import { Subject, Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import * as _ from 'lodash'
import { AparYearService, IAparYear } from '../../../../../../common/apar-year-select/apar-year.service'
import { aparPlan } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'

/**
 * The APAR plan picker of step 1. The plan list grows every cycle and two plans of the same
 * year are told apart by their timeline and owning organisation, which is why this is a
 * searchable table rather than a dropdown.
 */
@Component({
  selector: 'ws-app-plan-picker',
  templateUrl: './plan-picker.component.html',
  styleUrls: ['./plan-picker.component.scss'],
  standalone: false,
})
export class PlanPickerComponent implements OnInit, OnDestroy {

  //#region (global variables)
  displayedColumns = ['select', 'reportingYear', 'timeline', 'planTitle']
  years: IAparYear[] = []
  allYears = aparPlan.ALL_YEARS
  currentYear = ''
  selectedYear = aparPlan.ALL_YEARS
  searchKey = ''
  plans: aparPlan.IPlanRow[] = []
  totalCount = 0
  pageIndex = 0
  pageSize = aparPlan.PAGE_SIZE
  selectedPlanId = ''
  selectedPlan: aparPlan.IPlanRow | null = null
  showLoader = false

  private rootOrgId = ''
  /** Plans a Live assessment already points at, read once before the first page. */
  private linkedPlanIds: string[] = []
  private searchChange = new Subject<string>()
  private searchSubscription = new Subscription()
  private planSubscription!: Subscription
  //#endregion

  constructor(
    public dialogRef: MatDialogRef<PlanPickerComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private assessmentSvc: ComprehensiveAssessmentService,
    private aparYearSvc: AparYearService,
    private matSnackBar: MatSnackBar
  ) {
    this.rootOrgId = _.get(data, 'userProfile.rootOrgId', '')
    // reopening the picker on a linked assessment comes back with its plan already picked
    this.selectedPlanId = _.get(data, 'selectedPlanId', '')
  }

  //#region (onInit)
  ngOnInit(): void {
    this.years = this.aparYearSvc.getAparYears()
    this.currentYear = this.aparYearSvc.getCurrentAparYear()
    this.searchSubscription = this.searchChange.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchKey: string) => {
      this.searchKey = searchKey
      this.pageIndex = 0
      this.getPlans()
    })
    this.loadLinkedPlanIds()
  }

  /** The flag never fails the picker, an unresolved lookup only leaves the rows unflagged. */
  private loadLinkedPlanIds() {
    this.assessmentSvc.getPlanIdsWithLiveAssessment(this.rootOrgId).subscribe((planIds: string[]) => {
      this.linkedPlanIds = planIds
      this.getPlans()
    })
  }

  getPlans() {
    if (this.planSubscription) {
      this.planSubscription.unsubscribe()
    }
    this.showLoader = true
    this.planSubscription = this.assessmentSvc.searchAparPlans({
      rootOrgId: this.rootOrgId,
      planYear: this.selectedYear,
      searchString: this.searchKey,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    }).subscribe({
      next: (res: { plans: aparPlan.IPlanRow[], count: number }) => {
        this.showLoader = false
        this.plans = _.map(res.plans, (plan: aparPlan.IPlanRow) => ({
          ...plan,
          // the plan this assessment is already on stays selectable, it is its own plan
          hasActiveAssessment: _.includes(this.linkedPlanIds, plan.id) && plan.id !== this.selectedPlanId,
          isYearClosed: !this.isYearOpen(plan.planYear) && plan.id !== this.selectedPlanId,
        }))
        this.totalCount = res.count
        this.restoreSelection()
      },
      error: (error: HttpErrorResponse) => {
        this.showLoader = false
        this.plans = []
        this.totalCount = 0
        this.openSnackBar(_.get(error, 'error.message', 'Unable to load the APAR plans, please try again'))
      },
    })
  }

  /** The picked plan stays picked when the list is filtered or paged back onto it. */
  private restoreSelection() {
    if (!this.selectedPlanId) {
      return
    }
    const match = _.find(this.plans, (plan: aparPlan.IPlanRow) => plan.id === this.selectedPlanId)
    if (match) {
      this.selectedPlan = match
    }
  }
  //#endregion

  //#region (ui interactions)
  onSearch(searchKey: string) {
    this.searchChange.next((searchKey || '').trim())
  }

  onYearChange(year: string) {
    this.selectedYear = year
    this.pageIndex = 0
    this.getPlans()
  }

  onPageChange(event: any) {
    this.pageIndex = _.get(event, 'pageIndex', 0)
    this.pageSize = _.get(event, 'pageSize', this.pageSize)
    this.getPlans()
  }

  onPlanSelected(event: MatRadioChange) {
    this.selectPlan(event.value)
  }

  /**
   * A plan can be linked only while its reporting year is still open and no other Live
   * assessment holds it. Both kinds of plan stay listed so the user can see why they are
   * there, they are only not pickable.
   */
  isPlanSelectable(plan: aparPlan.IPlanRow): boolean {
    return !_.get(plan, 'hasActiveAssessment', false) && !_.get(plan, 'isYearClosed', false)
  }

  /** The whole row is a hit area, the radio is only the marker of what is picked. */
  selectPlan(planId: string) {
    const plan = _.find(this.plans, (row: aparPlan.IPlanRow) => row.id === planId)
    if (!plan || !this.isPlanSelectable(plan)) {
      return
    }
    this.selectedPlan = plan
    this.selectedPlanId = plan.id
  }

  /** The picker hands the plan itself back, every derived value is read off it. */
  linkPlan() {
    if (!this.selectedPlan) {
      return
    }
    const plan = this.selectedPlan
    const linkedPlan: aparPlan.ILinkedPlan = {
      id: plan.id,
      name: plan.name,
      planYear: plan.planYear,
      endDate: plan.endDate,
      orgName: plan.orgName,
      gatingCourseCount: plan.gatingCourseCount,
    }
    this.dialogRef.close(linkedPlan)
  }

  isCurrentYear(planYear: string): boolean {
    return !!planYear && planYear === this.currentYear
  }

  /**
   * Open years come off the same list the filter is built from, so a year the config closes
   * and a year it no longer lists at all are both closed here.
   */
  private isYearOpen(planYear: string): boolean {
    const match = _.find(this.years, (year: IAparYear) => year.value === planYear)
    return Boolean(match && match.editable)
  }

  trackByPlanId(_index: number, plan: aparPlan.IPlanRow): string {
    return _.get(plan, 'id', '')
  }
  //#endregion

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe()
    }
    if (this.planSubscription) {
      this.planSubscription.unsubscribe()
    }
  }
}
