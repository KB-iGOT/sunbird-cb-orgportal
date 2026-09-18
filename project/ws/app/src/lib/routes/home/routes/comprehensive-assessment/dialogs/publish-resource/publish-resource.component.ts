import { Component, Inject, OnInit } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { HttpErrorResponse } from '@angular/common/http'
import { forkJoin, timer } from 'rxjs'
import { take } from 'rxjs/operators'
import * as _ from 'lodash'
import { aparPlan, comprehensiveAssessment, comprehensiveAssessmentList } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { PlanPickerComponent } from '../plan-picker/plan-picker.component'

/** Seconds the platform is given to finish publishing before the status is read. */
const STATUS_CHECK_SECONDS = 10

/** Said when the plan is gone and another has to be picked before the publish can go on. */
const PLAN_TAKEN_MESSAGE =
  'The linked APAR plan is no longer available - another assessment has taken it, or its cycle ' +
  'has closed. Choose another plan to publish this assessment against.'

/**
 * What the dialog is offering at each point of the publish:
 *  `resource`   - the resources are listed and the publish is open, nothing has been sent
 *                 from here, or what was sent came back an error and can be sent again
 *  `waiting`    - the publish landed: the seconds before the status is read, and the read
 *  `recheck`    - the publish landed but the resource is not Live yet, so it is read again
 *                 rather than published again - the platform is still working on the one
 *                 publish it was given
 *  `live`       - every resource is Live and the plan is still free, the assessment
 *                 publish is open
 *  `planTaken`  - the resources are ready but the linked plan is not: another assessment
 *                 has taken it, or it is no longer Live. Another plan is picked from here
 *                 rather than by leaving for the Basic Details step and coming back
 *  `linkingPlan`- a plan has just been picked and is being written onto the assessment
 *  `publishing` - the assessment itself is being published
 *  `linking`    - the assessment is Live, the plan is being told which assessment holds it
 *  `linkFailed` - the assessment is Live but the plan was not told, so only that last call
 *                 is left to retry; publishing again would be wrong, it is already done
 */
export type PublishStage =
  'resource' | 'waiting' | 'recheck' | 'live' | 'planTaken' | 'linkingPlan' |
  'publishing' | 'linking' | 'linkFailed'

/**
 * Publishing a comprehensive assessment is two publishes, and the second only works once
 * the first has finished on the platform. Rather than hide that behind one button that
 * sometimes fails, the dialog names the resources the assessment holds and walks the admin
 * through them: publish the resource, watch out the seconds the platform needs, check
 * again while it is still working, and publish the assessment once it is Live.
 */
@Component({
  selector: 'ws-app-publish-resource',
  templateUrl: './publish-resource.component.html',
  styleUrls: ['./publish-resource.component.scss'],
  standalone: false,
})
export class PublishResourceComponent implements OnInit {

  //#region (global variables)
  /** The question sets the assessment holds, each named and carrying its own status. */
  resources: comprehensiveAssessment.ILinkedResource[] = []
  stage: PublishStage = 'resource'
  message = ''
  /** Set when the message is a failure rather than progress. */
  isError = false
  /** Seconds left before the status is read, 0 whenever nothing is being waited out. */
  countdown = 0
  /** The plan the assessment holds, named so the admin sees which one is being checked. */
  planName = ''
  /** null until the plan has been checked, which is only done once the resources are Live. */
  isPlanFree: boolean | null = null
  /**
   * A publish the platform took and is still working on. It is what tells a resource that
   * is on its way Live from one that was never published - only the first is left to
   * Refresh, the second still has its publish to make.
   */
  private publishAccepted = false

  private readonly contentId: string = ''
  private readonly userId: string = ''
  /** The plan the assessment holds, changed from here whenever the one it had is gone. */
  private planId = ''
  /** Every content update answers with a new one, and a stale one fails the next update. */
  private versionKey = ''
  /** Handed to the picker, which reads the org off it the way the builder's picker does. */
  private readonly userProfile: any
  /** The org the publish is made for, sent as a header the `ca` routes answer against. */
  private readonly rootOrgId: string = ''
  //#endregion

  constructor(
    public dialogRef: MatDialogRef<PublishResourceComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private assessmentSvc: ComprehensiveAssessmentService,
    private dialog: MatDialog
  ) {
    const collection = _.get(data, 'collection')
    this.contentId = _.get(collection, 'identifier', '')
    this.versionKey = _.get(collection, 'versionKey', '')
    this.userProfile = _.get(data, 'userProfile')
    this.userId = _.get(data, 'userProfile.userId', '')
    this.rootOrgId = _.get(data, 'userProfile.rootOrgId', '')
    this.resources = this.assessmentSvc.getLinkedResources(collection)
    // the plan is read off the linkage the assessment carries, which is where it is kept
    const plan: aparPlan.ILinkedPlan | null = this.assessmentSvc.readPlanMetadata(collection)
    this.planId = _.get(plan, 'id', '')
    this.planName = _.get(plan, 'name', '')
    // a reopened assessment can already carry a Live question set, nothing to publish again
    if (this.resources.length && this.everyResourceLive()) {
      this.stage = 'live'
    }
  }

  /**
   * The plan is only worth checking once there is a publish to gate on it, so an assessment
   * that opens with its resources already Live is checked here rather than left to Refresh.
   */
  ngOnInit(): void {
    if (this.stage === 'live') {
      this.checkPlan()
    }
  }

  //#region (template helpers)
  get isBusy(): boolean {
    return this.stage === 'waiting' || this.stage === 'publishing' ||
      this.stage === 'linking' || this.stage === 'linkingPlan'
  }

  get canPublishAssessment(): boolean {
    return this.stage === 'live'
  }

  /**
   * Which of the two publishes the dialog is on, read off the resources rather than off the
   * stage: the plan check sits between them, and the offer should not fall back to the
   * resource publish while it runs or while it is what is holding the publish up.
   */
  get resourcesLive(): boolean {
    return !!this.resources.length && this.everyResourceLive()
  }

  /** The plan is taken, so picking another one is what the dialog offers instead of a publish. */
  get isPlanTaken(): boolean {
    return this.stage === 'planTaken'
  }

  /**
   * The plan can be changed from the moment it has been checked and found gone, and while
   * the assessment is not already being published against the one it has.
   */
  get canChangePlan(): boolean {
    return this.isPlanTaken && !this.isBusy
  }

  /** The assessment is Live and only the linkage back to the plan is left to make. */
  get isLinkFailed(): boolean {
    return this.stage === 'linkFailed'
  }

  /** The publish landed, so what is left to do is look again rather than send it again. */
  get isRecheck(): boolean {
    return this.stage === 'recheck'
  }

  /**
   * A publish the platform took is not offered again - it is working on it, and Refresh is
   * the way on. Only a publish that never landed, or one not yet made, is open.
   */
  get isPublishResourceDisabled(): boolean {
    return this.isBusy || this.isRecheck || !this.resources.length
  }

  isLive(resource: comprehensiveAssessment.ILinkedResource): boolean {
    return resource.status === comprehensiveAssessmentList.STATUS_LIVE
  }

  /** The plan is only checked once there is a publish to gate on it, so it reads as three. */
  get planStatusText(): string {
    if (this.isPlanFree === null) {
      return 'Not checked yet'
    }
    return this.isPlanFree ? 'Available' : 'Not available'
  }
  //#endregion

  //#region (publishing the resource)
  /**
   * The first publish. A failure here is the admin's to see straight away - there is
   * nothing to wait for, and the resource can be published again once whatever the platform
   * objected to is fixed. Only a publish the platform accepted is waited out.
   */
  publishResource(): void {
    if (!this.resources.length) {
      return
    }
    this.stage = 'waiting'
    this.setMessage('Publishing the resource')
    forkJoin(this.resources.map((resource: comprehensiveAssessment.ILinkedResource) =>
      this.assessmentSvc.publishQuestionSet(resource.identifier, this.rootOrgId)
    )).subscribe({
      next: () => {
        this.publishAccepted = true
        this.waitAndReadStatus()
      },
      error: (error: HttpErrorResponse) => {
        // nothing was published, so the publish stays the offer rather than a recheck
        this.publishAccepted = false
        this.countdown = 0
        this.stage = 'resource'
        this.setMessage(this.readError(error, 'Unable to publish the resource, please try again'), true)
      },
    })
  }

  /** Reads the status again on the publish already accepted, without sending another. */
  recheckStatus(): void {
    this.readStatus()
  }

  /**
   * The platform publishes asynchronously, so the status is only worth reading once it has
   * had its seconds. They are counted down in the dialog rather than spent behind a
   * spinner, so the wait reads as the platform working rather than the dialog hanging.
   */
  private waitAndReadStatus(): void {
    this.stage = 'waiting'
    this.countdown = STATUS_CHECK_SECONDS
    this.setMessage('Published, checking whether the resource is live')
    timer(1000, 1000).pipe(take(STATUS_CHECK_SECONDS)).subscribe({
      next: () => this.countdown = this.countdown - 1,
      complete: () => this.readStatus(),
    })
  }

  /**
   * Anything short of Live leaves the resource to be read again rather than published
   * again: the platform has the publish, it is simply not through with it yet.
   */
  private readStatus(): void {
    this.stage = 'waiting'
    this.countdown = 0
    this.setMessage('Checking whether the resource is live')
    forkJoin(this.resources.map((resource: comprehensiveAssessment.ILinkedResource) =>
      this.assessmentSvc.getQuestionSetStatus(resource.identifier, this.rootOrgId)
    )).subscribe((statuses: string[]) => {
      this.resources = this.resources.map(
        (resource: comprehensiveAssessment.ILinkedResource, index: number) => ({
          ...resource,
          status: statuses[index] || resource.status,
        })
      )
      const live = this.everyResourceLive()
      if (live) {
        this.checkPlan()
        return
      }
      // only a publish that landed is waited on, anything else still has its publish to make
      this.stage = this.publishAccepted ? 'recheck' : 'resource'
      this.setMessage(this.publishAccepted
        ? 'The resource is not live yet, publishing can take a little longer - check again'
        : 'The resource is not live yet, publish it to take it live')
    })
  }
  //#endregion

  //#region (the linked plan)
  /**
   * The last thing between the assessment and going Live. A plan is linked in the builder
   * and published from here, and the two can be days apart - by then another assessment may
   * have taken the plan, or its own cycle may have moved on. The search answers with the
   * plan while it is still free, and with nothing once it is not.
   *
   * A check that cannot be made is not treated as a plan that is taken: the publish is the
   * api's to refuse then, rather than this dialog's to block on a lookup that failed.
   */
  private checkPlan(): void {
    this.stage = 'waiting'
    this.countdown = 0
    this.setMessage('Checking the linked APAR plan')
    this.assessmentSvc.isPlanAvailable(this.planId).subscribe({
      next: (isFree: boolean) => {
        this.isPlanFree = isFree
        if (isFree) {
          this.stage = 'live'
          this.setMessage('The resource is live and the plan is free, the assessment can now be published')
          return
        }
        this.stage = 'planTaken'
        this.setMessage(PLAN_TAKEN_MESSAGE, true)
      },
      error: () => {
        // the lookup is a courtesy, the publish itself still answers for the plan
        this.isPlanFree = null
        this.stage = 'live'
        this.setMessage('The linked plan could not be checked, publishing will answer for it')
      },
    })
  }
  /**
   * The same picker the builder links a plan with, opened from here so a plan that has gone
   * while the assessment sat in draft does not send the admin back through the builder. The
   * picker only ever offers plans no assessment holds, so what it hands back is free.
   */
  changePlan(): void {
    if (!this.canChangePlan) {
      return
    }
    const dialogRef = this.dialog.open(PlanPickerComponent, {
      panelClass: 'apar-plan-picker-dialog',
      width: '840px',
      maxWidth: '92vw',
      autoFocus: false,
      data: {
        userProfile: this.userProfile,
        selectedPlanId: this.planId,
      },
    })

    dialogRef.afterClosed().subscribe((plan: aparPlan.ILinkedPlan) => {
      if (!plan) {
        return
      }
      this.saveLinkedPlan(plan)
    })
  }

  /**
   * The picked plan is written onto the assessment before anything else happens: the publish
   * goes off what the content holds, not off what this dialog was handed when it opened.
   */
  private saveLinkedPlan(plan: aparPlan.ILinkedPlan): void {
    this.stage = 'linkingPlan'
    this.setMessage('Linking the plan to the assessment')
    this.assessmentSvc.updateLinkedPlan(this.contentId, this.versionKey, plan).subscribe({
      next: (res: any) => {
        this.versionKey = _.get(res, 'result.versionKey', '') || this.versionKey
        this.planId = plan.id
        this.planName = plan.name
        // checked rather than taken on trust: the same guard answers for every plan
        this.checkPlan()
      },
      error: (error: HttpErrorResponse) => {
        this.stage = 'planTaken'
        this.setMessage(this.readError(error, 'Unable to link the plan, please try again'), true)
      },
    })
  }
  //#endregion

  //#region (publishing the assessment)
  /** The second publish, open only once every resource has answered Live. */
  publishAssessment(): void {
    if (!this.canPublishAssessment) {
      return
    }
    this.stage = 'publishing'
    this.setMessage('Publishing the assessment')
    this.assessmentSvc.publishAssessment(this.contentId, this.userId, this.rootOrgId).subscribe({
      next: () => this.linkPlan(),
      error: (error: HttpErrorResponse) => {
        // the resources stay Live, so the assessment publish is still the open offer
        this.stage = 'live'
        this.setMessage(this.readError(error, 'Unable to publish the assessment, please try again'), true)
      },
    })
  }

  /**
   * The assessment is Live, so the plan is told which assessment holds it and stops being
   * offered to any other. This is the only thing left to do, which is why a failure here
   * retries the linkage alone - the publish behind it has already happened.
   */
  linkPlan(): void {
    if (!this.planId) {
      this.dialogRef.close(true)
      return
    }
    this.stage = 'linking'
    this.setMessage('Linking the APAR plan to the assessment')
    this.assessmentSvc.linkPlanToAssessment(this.planId, this.contentId).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error: HttpErrorResponse) => {
        this.stage = 'linkFailed'
        this.setMessage(
          this.readError(error, 'The assessment is published, but the APAR plan was not linked to it'),
          true
        )
      },
    })
  }

  /** The publish is what the caller is told about, and by `linkFailed` it has happened. */
  close(): void {
    this.dialogRef.close(this.isLinkFailed)
  }
  //#endregion

  private setMessage(message: string, isError: boolean = false): void {
    this.message = message
    this.isError = isError
  }

  /** The content apis answer under `params.errmsg`, the proxy under `message`. */
  private readError(error: HttpErrorResponse, fallback: string): string {
    return _.get(error, 'error.params.errmsg', '') ||
      _.get(error, 'error.message', '') ||
      fallback
  }

  private everyResourceLive(): boolean {
    return this.resources.every((resource: comprehensiveAssessment.ILinkedResource) => this.isLive(resource))
  }
}
