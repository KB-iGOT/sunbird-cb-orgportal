import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core'
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { MatStepper } from '@angular/material/stepper'
import { StepperSelectionEvent } from '@angular/cdk/stepper'
import { HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'
import * as _ from 'lodash'
import {
  comprehensiveAssessment,
  comprehensiveAssessmentList,
  noSpecialCharAssessment,
} from '../../models/comprehensive-assessment.model'
import { richTextValidator } from '../../models/rich-text.validator'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { ConfirmDialogComponent } from '../../../../../workallocation-v2/components/confirm-dialog/confirm-dialog.component'

const STEP_BASIC_DETAILS = 'Basic Details'
const STEP_ASSESSMENT = 'Assessment'
const STEP_PREVIEW = 'Preview'

@Component({
  selector: 'ws-app-create-assessment',
  templateUrl: './create-assessment.component.html',
  styleUrls: ['./create-assessment.component.scss'],
  standalone: false,
})
export class CreateAssessmentComponent implements OnInit {

  //#region (global variables)
  private readonly locationService = inject(Location)
  @ViewChild(MatStepper) stepper: MatStepper | undefined

  contentId = ''
  contentDetails: any
  previewContent: any
  previewReady = false
  assessmentDetailsForm!: FormGroup
  linkedAssessmentId = ''
  /** Duration in seconds, mirrored from the question set built in step 2. */
  duration = 0
  currentStepperIndex = 0
  selectedStepperLable = STEP_BASIC_DETAILS
  openMode = 'edit'
  /** Tab the listing was on when this assessment was opened, so Back returns to it. */
  pathUrl = 'live'
  userProfile: any
  //#endregion

  constructor(
    private assessmentSvc: ComprehensiveAssessmentService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private matSnackBar: MatSnackBar,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  //#region (onInit)
  ngOnInit(): void {
    this.initializeForm()
    this.getDetailsFromResolver()
  }

  initializeForm() {
    this.assessmentDetailsForm = this.formBuilder.group({
      // the plan is held as one object, changing it recomputes every derived value together
      linkedPlan: new FormControl(null, [Validators.required]),
      assessmentName: new FormControl('', [
        Validators.required,
        Validators.minLength(comprehensiveAssessment.NAME_MIN_LENGTH),
        Validators.maxLength(comprehensiveAssessment.NAME_MAX_LENGTH),
        Validators.pattern(noSpecialCharAssessment),
      ]),
      description: new FormControl('', [
        richTextValidator(comprehensiveAssessment.DESCRIPTION_MIN_LENGTH, comprehensiveAssessment.DESCRIPTION_MAX_LENGTH),
      ]),
      learningOutcome: new FormControl('', [
        richTextValidator(0, comprehensiveAssessment.LEARNING_OUTCOME_MAX_LENGTH),
      ]),
      // the thumbnail is optional, an assessment can go live without one
      appIcon: new FormControl(''),
    })

    // any edit invalidates the saved copy the preview step renders
    this.assessmentDetailsForm.valueChanges.subscribe(() => {
      this.previewReady = false
    })
  }

  getDetailsFromResolver() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.openMode = params['mode'] || 'edit'
      this.pathUrl = params['pathUrl'] || this.pathUrl
      if (this.openMode === 'view') {
        this.assessmentDetailsForm.disable()
      }
      this.ensurePreviewQueryParams(params)
    })
    this.userProfile = _.get(this.activatedRoute, 'snapshot.data.configService.userProfile')
    const resolved = _.get(this.activatedRoute, 'snapshot.data.assessmentDetails')
    if (_.get(resolved, 'data')) {
      this.contentDetails = _.get(resolved, 'data')
      this.patchAssessmentDetails()
    } else if (_.get(resolved, 'error')) {
      this.openSnackBar('Unable to load the assessment, please try again')
    }
  }

  /**
   * `@sunbird-cb/toc` picks its hierarchy endpoint by sniffing `window.location.href`:
   * without `&preview=true` it calls the live `course/v1/hierarchy` which returns nothing
   * for a draft, and with `editMode=true` it calls the draft aware `?mode=edit` variant.
   * Both markers are therefore kept on the builder url so the preview can read the draft.
   */
  ensurePreviewQueryParams(params: any) {
    if (params['preview'] === 'true' && params['editMode'] === 'true') {
      return
    }
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { preview: 'true', editMode: 'true' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }

  patchAssessmentDetails() {
    this.contentId = _.get(this.contentDetails, 'identifier', '')
    this.assessmentDetailsForm.patchValue({
      linkedPlan: this.assessmentSvc.readPlanMetadata(this.contentDetails),
      assessmentName: _.get(this.contentDetails, 'name', ''),
      description: _.get(this.contentDetails, 'description', ''),
      learningOutcome: _.get(this.contentDetails, 'purpose', ''),
      appIcon: _.get(this.contentDetails, 'appIcon', ''),
    })
    this.assessmentDetailsForm.updateValueAndValidity()

    this.duration = Number(_.get(this.contentDetails, 'duration', 0)) || 0
    this.linkedAssessmentId = this.assessmentSvc.getLinkedAssessmentId(this.contentDetails)
    if (this.linkedAssessmentId) {
      this.refreshDuration()
    }
  }
  //#endregion

  //#region (stepper interactions)
  onSelectionChange(event: StepperSelectionEvent) {
    const steps = this.stepper?.steps?.toArray() || []
    const previousLabel = _.get(steps, `[${event.previouslySelectedIndex}].label`, '')
    const selectedLabel = _.get(steps, `[${event.selectedIndex}].label`, '')

    if (event.selectedIndex > event.previouslySelectedIndex &&
      !this.canMoveToStep(steps, event.previouslySelectedIndex, event.selectedIndex)) {
      this.currentStepperIndex = event.previouslySelectedIndex
      this.selectedStepperLable = previousLabel || this.selectedStepperLable
      setTimeout(() => {
        if (this.stepper) {
          this.stepper.selectedIndex = event.previouslySelectedIndex
        }
      })
      return
    }

    if (previousLabel === STEP_BASIC_DETAILS) {
      this.assessmentDetailsForm.markAllAsTouched()
      this.assessmentDetailsForm.updateValueAndValidity()
    }

    this.currentStepperIndex = event.selectedIndex
    this.selectedStepperLable = selectedLabel || ''
    if (this.selectedStepperLable === STEP_PREVIEW && !this.previewReady) {
      this.saveBeforePreview()
    }
    this.cdr.detectChanges()
  }

  /** Every Next persists the current step and carries the saved content to the next one. */
  moveToNextForm() {
    this.assessmentDetailsForm.markAllAsTouched()
    this.assessmentDetailsForm.updateValueAndValidity()
    if (!this.canMoveToNext) {
      return
    }
    if (!this.contentId) {
      this.goToNextStep()
      return
    }
    this.loaderService.changeLoaderState(true)
    this.persistContent().subscribe({
      next: () => {
        this.loaderService.changeLoaderState(false)
        this.goToNextStep()
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Something went wrong while saving, please try again'))
      },
    })
  }

  private goToNextStep() {
    if (this.stepper && this.currentStepperIndex < this.stepper.steps.length - 1) {
      this.currentStepperIndex = this.currentStepperIndex + 1
    }
  }

  /**
   * Saves the authored fields and reads the hierarchy back, so whatever the next step
   * renders is the content the api actually holds rather than a local copy.
   */
  private persistContent(): Observable<any> {
    return this.assessmentSvc.updateContent(this.contentId, this.getContentUpdateBody()).pipe(
      tap((res: any) => this.syncVersionKey(res)),
      switchMap(() => this.assessmentSvc.getContentHierarchy(this.contentId)),
      tap((res: any) => {
        const content = _.get(res, 'result.content')
        if (content) {
          this.contentDetails = content
          this.previewContent = content
          this.previewReady = true
        }
      })
    )
  }

  moveToPreviousForm() {
    this.currentStepperIndex = this.currentStepperIndex - 1
  }

  get canMoveToNext(): boolean {
    if (this.selectedStepperLable === STEP_BASIC_DETAILS) {
      return this.validateBasicDetails()
    }
    if (this.selectedStepperLable === STEP_ASSESSMENT) {
      return this.validateAssessment()
    }
    return true
  }

  private canMoveToStep(steps: any[], fromIndex: number, toIndex: number): boolean {
    if (this.openMode === 'view' || toIndex <= fromIndex) {
      return true
    }
    for (let index = fromIndex; index < toIndex; index += 1) {
      if (!this.validateStep(_.get(steps, `[${index}].label`, ''))) {
        return false
      }
    }
    return true
  }

  private validateStep(stepLabel: string): boolean {
    if (stepLabel === STEP_BASIC_DETAILS) {
      return this.validateBasicDetails()
    }
    if (stepLabel === STEP_ASSESSMENT) {
      return this.validateAssessment()
    }
    return true
  }

  private validateBasicDetails(): boolean {
    this.assessmentDetailsForm.markAllAsTouched()
    this.assessmentDetailsForm.updateValueAndValidity()
    if (!_.get(this.assessmentDetailsForm, 'controls.linkedPlan.value')) {
      this.openSnackBar('Link an APAR plan, the reporting year and access criteria are read from it')
      return false
    }
    if (this.assessmentDetailsForm.invalid) {
      this.openSnackBar('Please fill mandatory fields')
      return false
    }
    return true
  }

  private validateAssessment(): boolean {
    if (!this.linkedAssessmentId) {
      this.openSnackBar('Please create the assessment before moving ahead')
      return false
    }
    return true
  }
  //#endregion

  //#region (assessment linking and duration)
  /**
   * `sb-uic-assessment-main` creates the question set on its own. Once it hands back the
   * identifier we link it to this collection and pull the duration it was configured with.
   */
  onAssessmentSaved(assessmentId: string) {
    this.linkedAssessmentId = assessmentId
    this.linkAssessment(assessmentId)
    this.refreshDuration()
  }

  linkAssessment(assessmentId: string) {
    if (!this.contentDetails || !assessmentId) {
      return
    }
    this.assessmentSvc.linkAssessmentToCollection(this.contentDetails, assessmentId).subscribe({
      next: () => this.reloadContentHierarchy(),
      error: (error: HttpErrorResponse) => {
        // linking is not fatal for authoring, the question set itself is already saved
        this.openSnackBar(_.get(error, 'error.message', 'Unable to attach the assessment to this collection'))
      },
    })
  }

  refreshDuration() {
    if (!this.linkedAssessmentId) {
      return
    }
    this.assessmentSvc.getQuestionSetHierarchy(this.linkedAssessmentId).subscribe({
      next: (questionSet: any) => {
        this.duration = Number(_.get(questionSet, 'expectedDuration', 0)) || 0
        this.cdr.detectChanges()
      },
      error: () => {
        // duration stays at whatever is already stored on the content
      },
    })
  }

  reloadContentHierarchy() {
    if (!this.contentId) {
      return
    }
    this.assessmentSvc.getContentHierarchy(this.contentId).subscribe({
      next: (res: any) => {
        const content = _.get(res, 'result.content')
        if (content) {
          this.contentDetails = content
        }
      },
      error: () => {
        // keep the currently loaded hierarchy
      },
    })
  }
  //#endregion

  //#region (save and preview)
  /**
   * The toc preview renders whatever content object it is handed, so the draft is saved and
   * read back first, otherwise the preview would show stale description / learning outcome.
   */
  saveBeforePreview() {
    if (!this.contentId) {
      return
    }
    this.loaderService.changeLoaderState(true)
    this.persistContent().subscribe({
      next: () => {
        this.loaderService.changeLoaderState(false)
        this.cdr.detectChanges()
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Unable to refresh the preview, please try again'))
      },
    })
  }

  /** Every content update returns a new versionKey, a stale one fails the next save. */
  syncVersionKey(res: any) {
    const versionKey = _.get(res, 'result.versionKey')
    if (versionKey && this.contentDetails) {
      this.contentDetails.versionKey = versionKey
    }
  }

  getContentUpdateBody() {
    const formValues = this.assessmentDetailsForm.getRawValue()
    return {
      versionKey: _.get(this.contentDetails, 'versionKey', ''),
      name: (formValues.assessmentName || '').trim(),
      description: formValues.description || '',
      purpose: formValues.learningOutcome || '',
      appIcon: formValues.appIcon,
      posterImage: formValues.appIcon,
      // the content schema types duration as a String, a number fails validation
      duration: String(this.duration || 0),
      ...this.assessmentSvc.buildPlanMetadata(formValues.linkedPlan),
    }
  }

  saveAndExit() {
    if (!this.validateBasicDetails()) {
      return
    }
    this.loaderService.changeLoaderState(true)
    this.assessmentSvc.updateContent(this.contentId, this.getContentUpdateBody()).subscribe({
      next: (res: any) => {
        this.syncVersionKey(res)
        this.openSnackBar('Assessment details saved successfully')
        setTimeout(() => {
          this.loaderService.changeLoaderState(false)
          this.navigateBack()
        },         1000)
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Something went wrong while saving, please try again'))
      },
    })
  }

  preview() {
    if (!this.validateBasicDetails() || !this.validateAssessment()) {
      return
    }
    const steps = this.stepper?.steps?.toArray() || []
    const previewIndex = steps.findIndex((step: any) => step.label === STEP_PREVIEW)
    if (previewIndex !== -1) {
      this.currentStepperIndex = previewIndex
    }
  }
  //#endregion

  /**
   * Publishing is offered on the preview step, once the admin has seen what the officer
   * will. The window is the linked plan's, and only the plan can correct it, so a window
   * that has already ended blocks the publish rather than asking for a date to be changed
   * here. The server validates all of this again, this is only the near check.
   */
  get canPublish(): boolean {
    return this.openMode === 'edit' && !!this.contentId && !!this.linkedAssessmentId
  }

  publishAssessment() {
    if (!this.validateBasicDetails() || !this.validateAssessment()) {
      return
    }
    const linkedPlan = _.get(this.assessmentDetailsForm, 'controls.linkedPlan.value')
    if (!this.assessmentSvc.isWindowOpen(_.get(linkedPlan, 'endDate'))) {
      this.openSnackBar(comprehensiveAssessmentList.WINDOW_CLOSED_MESSAGE)
      return
    }
    this.confirmPublish()
  }

  private confirmPublish() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: 'auto',
      autoFocus: false,
      data: {
        dialogType: 'warning',
        icon: { iconName: 'error_outline', iconClass: 'warning-icon' },
        message: 'Are you sure you want to publish this assessment?',
        buttonsList: [
          { btnAction: false, displayText: 'No', btnClass: 'btn-outline-primary' },
          { btnAction: true, displayText: 'Yes', btnClass: 'successBtn' },
        ],
      },
    })
    dialogRef.afterClosed().subscribe((btnAction: any) => {
      if (btnAction) {
        this.runPublish()
      }
    })
  }

  /** The draft is saved first, so what goes Live is what the preview just showed. */
  private runPublish() {
    this.loaderService.changeLoaderState(true)
    this.persistContent().pipe(
      switchMap(() => this.assessmentSvc.publishAssessment(
        this.contentId,
        _.get(this.userProfile, 'userId', '')
      ))
    ).subscribe({
      next: () => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar('Assessment published successfully')
        // a published assessment belongs to the Live tab, whichever tab it was opened from
        this.pathUrl = 'live'
        this.navigateBack()
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Unable to publish the assessment, please try again'))
      },
    })
  }
  //#endregion

  //#region (navigation)
  openConfirmationPopup() {
    if (this.openMode !== 'edit') {
      this.navigateBack()
      return
    }
    const dialogData = {
      dialogType: 'warning',
      icon: {
        iconName: 'error_outline',
        iconClass: 'warning-icon',
      },
      message: 'Are you sure you want to exit without saving?',
      buttonsList: [
        { btnAction: false, displayText: 'No', btnClass: 'btn-outline-primary' },
        { btnAction: true, displayText: 'Yes', btnClass: 'successBtn' },
      ],
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: 'auto',
      data: dialogData,
      autoFocus: false,
      disableClose: true,
    })
    dialogRef.afterClosed().subscribe((btnAction: any) => {
      if (btnAction) {
        this.navigateBack()
      }
    })
  }

  navigateBack() {
    if (this.router.url.includes('/app/home/comprehensive-assessment')) {
      this.router.navigate(['/app/home/comprehensive-assessment', this.pathUrl])
    } else {
      this.locationService.back()
    }
  }
  //#endregion

  //#region (helpers)
  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }
  //#endregion
}
