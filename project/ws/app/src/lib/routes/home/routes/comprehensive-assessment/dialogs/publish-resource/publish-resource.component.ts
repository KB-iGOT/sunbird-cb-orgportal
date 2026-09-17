import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { HttpErrorResponse } from '@angular/common/http'
import { forkJoin, timer } from 'rxjs'
import { take } from 'rxjs/operators'
import * as _ from 'lodash'
import { comprehensiveAssessment, comprehensiveAssessmentList } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'

/** Seconds the platform is given to finish publishing before the status is read. */
const STATUS_CHECK_SECONDS = 10

/**
 * What the dialog is offering at each point of the publish:
 *  `resource`   - the resources are listed and the publish is open, nothing has been sent
 *                 from here, or what was sent came back an error and can be sent again
 *  `waiting`    - the publish landed: the seconds before the status is read, and the read
 *  `recheck`    - the publish landed but the resource is not Live yet, so it is read again
 *                 rather than published again - the platform is still working on the one
 *                 publish it was given
 *  `live`       - every resource is Live, the assessment publish is open
 *  `publishing` - the assessment itself is being published
 */
export type PublishStage = 'resource' | 'waiting' | 'recheck' | 'live' | 'publishing'

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
export class PublishResourceComponent {

  //#region (global variables)
  /** The question sets the assessment holds, each named and carrying its own status. */
  resources: comprehensiveAssessment.ILinkedResource[] = []
  stage: PublishStage = 'resource'
  message = ''
  /** Set when the message is a failure rather than progress. */
  isError = false
  /** Seconds left before the status is read, 0 whenever nothing is being waited out. */
  countdown = 0
  /**
   * A publish the platform took and is still working on. It is what tells a resource that
   * is on its way Live from one that was never published - only the first is left to
   * Refresh, the second still has its publish to make.
   */
  private publishAccepted = false

  private readonly contentId: string = ''
  private readonly userId: string = ''
  /** The org the publish is made for, sent as a header the `ca` routes answer against. */
  private readonly rootOrgId: string = ''
  //#endregion

  constructor(
    public dialogRef: MatDialogRef<PublishResourceComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private assessmentSvc: ComprehensiveAssessmentService
  ) {
    const collection = _.get(data, 'collection')
    this.contentId = _.get(collection, 'identifier', '')
    this.userId = _.get(data, 'userProfile.userId', '')
    this.rootOrgId = _.get(data, 'userProfile.rootOrgId', '')
    this.resources = this.assessmentSvc.getLinkedResources(collection)
    // a reopened assessment can already carry a Live question set, nothing to publish again
    if (this.resources.length && this.everyResourceLive()) {
      this.stage = 'live'
    }
  }

  //#region (template helpers)
  get isBusy(): boolean {
    return this.stage === 'waiting' || this.stage === 'publishing'
  }

  get canPublishAssessment(): boolean {
    return this.stage === 'live'
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
        this.stage = 'live'
        this.setMessage('The resource is live, the assessment can now be published')
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

  //#region (publishing the assessment)
  /** The second publish, open only once every resource has answered Live. */
  publishAssessment(): void {
    if (!this.canPublishAssessment) {
      return
    }
    this.stage = 'publishing'
    this.setMessage('Publishing the assessment')
    this.assessmentSvc.publishAssessment(this.contentId, this.userId, this.rootOrgId).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error: HttpErrorResponse) => {
        // the resources stay Live, so the assessment publish is still the open offer
        this.stage = 'live'
        this.setMessage(this.readError(error, 'Unable to publish the assessment, please try again'), true)
      },
    })
  }

  close(): void {
    this.dialogRef.close(false)
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
