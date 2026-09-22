import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { MatCheckboxChange } from '@angular/material/checkbox'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationBoxComponent } from '../confirmation-box/confirmation.box.component'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */

/** Past this many gating courses the author is told what the plan is asking of a Karmayogi */
const MANDATORY_WARNING_THRESHOLD = 25

@Component({
  selector: 'ws-app-gating-courses',
  templateUrl: './gating-courses.component.html',
  styleUrls: ['./gating-courses.component.scss'],
  standalone: false
})
export class GatingCoursesComponent implements OnChanges {
  // Every content selected on the plan, whichever page it was picked from
  @Input() contentData: any[] = []
  @Output() mandatoryChanged = new EventEmitter<any>()

  /* tslint:disable */
  infoText = 'Tick the courses a Karmayogi has to complete for the CA. The rest of the plan stays optional.'
  // What is at stake, then what to do about it: the box reads as two paragraphs
  manyMandatoryWarning = 'These contents will be required for learners to consume before they can unlock the Comprehensive Assessment.'
  manyMandatoryHint = 'Please review your selection and ensure that only relevant contents are included.'
  /* tslint:enable */
  selectedCourses: any[] = []
  mandatoryCount = 0
  // The warning is said once, when the count crosses the threshold, and not again on every tick
  // past it. Taking courses back off the list arms it again.
  private manyMandatoryWarningShown = false

  constructor(private tpdsSvc: TrainingPlanDataSharingService, private dialog: MatDialog) { }

  ngOnChanges() {
    this.buildSelectedCourses()
  }

  /**
   * The courses of the plan, in the order they were added. Read from the plan content list and not
   * from the search results, so a course picked on an earlier page is still listed here.
   */
  private buildSelectedCourses() {
    const contentById = _.keyBy(this.contentData || [], 'identifier')
    this.selectedCourses = this.tpdsSvc.getContentIdentifiers()
      .map((identifier: string) => contentById[identifier])
      .filter((content: any) => !!content)
    this.mandatoryCount = this.tpdsSvc.getMandatoryContentCount()
    if (this.mandatoryCount < MANDATORY_WARNING_THRESHOLD) {
      this.manyMandatoryWarningShown = false
    }
  }

  trackByIdentifier(_index: number, course: any): string {
    return course?.identifier
  }

  isMandatory(course: any): boolean {
    return this.tpdsSvc.isContentMandatory(course?.identifier)
  }

  onMandatoryChange(event: MatCheckboxChange, course: any) {
    if (!course || !course.identifier) {
      return
    }
    this.tpdsSvc.setContentMandatory(course.identifier, event.checked)
    this.mandatoryCount = this.tpdsSvc.getMandatoryContentCount()
    if (this.tpdsSvc.trainingPlanStepperData.status === 'Live') {
      this.tpdsSvc.isContentChanged = true
    }
    this.mandatoryChanged.emit(true)
    this.warnOnManyMandatoryCourses()
  }

  /**
   * Every gating course has to be completed before the comprehensive assessment unlocks, so a long
   * list is worth pointing out. The box only informs, the tick that raised the count stands either
   * way, and dropping back under the threshold arms the warning again.
   */
  private warnOnManyMandatoryCourses() {
    if (this.mandatoryCount < MANDATORY_WARNING_THRESHOLD) {
      this.manyMandatoryWarningShown = false
      return
    }
    if (this.manyMandatoryWarningShown) {
      return
    }
    this.manyMandatoryWarningShown = true
    this.dialog.open(ConfirmationBoxComponent, {
      data: {
        type: 'warning',
        icon: 'warning_amber',
        title: `${this.mandatoryCount} Mandatory contents selected`,
        subTitle: this.manyMandatoryWarning,
        subTitle2: this.manyMandatoryHint,
        primaryAction: 'Got it',
      },
      autoFocus: false,
    })
  }
}
