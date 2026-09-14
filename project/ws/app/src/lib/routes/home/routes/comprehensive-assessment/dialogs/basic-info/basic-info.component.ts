import { Component, Inject, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpErrorResponse } from '@angular/common/http'
import { of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import * as _ from 'lodash'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { comprehensiveAssessment, noSpecialCharAssessment } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'

@Component({
  selector: 'ws-app-comprehensive-assessment-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
  standalone: false,
})
export class BasicInfoComponent implements OnInit {

  assessmentForm!: FormGroup
  imgURL: string | ArrayBuffer | null = null
  imagePath: any
  userProfile: any
  userEmail = ''
  orgData: any
  nameMaxLength = comprehensiveAssessment.NAME_MAX_LENGTH
  nameMinLength = comprehensiveAssessment.NAME_MIN_LENGTH
  /** `create` builds a new collection, `edit` only hands the updated values back. */
  mode = 'create'
  appIcon = ''
  existingName = ''

  constructor(
    public dialogRef: MatDialogRef<BasicInfoComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private assessmentSvc: ComprehensiveAssessmentService,
    private loaderService: LoaderService,
    private configSvc: ConfigurationsService
  ) {
    this.userProfile = _.get(data, 'userProfile')
    this.userEmail = _.get(data, 'userEmail', '')
    this.mode = _.get(data, 'mode', 'create')
    this.appIcon = _.get(data, 'appIcon', '')
    this.existingName = _.get(data, 'assessmentName', '')
  }

  ngOnInit(): void {
    this.createForm()
    this.orgData = _.get(this.configSvc, 'orgReadData', {})
    if (this.isEditMode) {
      this.assessmentForm.patchValue({ assessmentName: this.existingName })
      // the stored appIcon is already an artifact url, it previews without a re-upload
      this.imgURL = this.appIcon
    }
  }

  get isEditMode(): boolean {
    return this.mode === 'edit'
  }

  createForm() {
    this.assessmentForm = this.formBuilder.group({
      assessmentName: new FormControl('', [
        Validators.required,
        Validators.minLength(this.nameMinLength),
        Validators.maxLength(this.nameMaxLength),
        Validators.pattern(noSpecialCharAssessment),
      ]),
    })
  }

  onFileSelected(files: any) {
    if (!files || files.length === 0) {
      return
    }
    const mimeType = files[0].type
    if (!mimeType || !mimeType.startsWith('image/')) {
      this.openSnackBar('Only JPG and PNG files are supported')
      return
    }
    this.imagePath = files[0]
    if (this.imagePath.size > comprehensiveAssessment.IMAGE_MAX_SIZE) {
      this.openSnackBar('Please select an image with a size of less than 500KB.')
      this.imagePath = ''
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(files[0])
    reader.onload = () => {
      this.imgURL = reader.result
    }
  }

  onSave() {
    if (!this.assessmentForm.valid) {
      this.assessmentForm.markAllAsTouched()
      return
    }
    if (this.isEditMode) {
      this.updateBasicInfo()
      return
    }
    this.createAssessment()
  }

  /**
   * Edit mode never touches the content api, it returns the updated name and appIcon so the
   * caller can patch its form and persist them along with the rest of the basic details.
   * A newly picked image still has to be uploaded here, appIcon must be an artifact url.
   */
  updateBasicInfo() {
    const assessmentName = _.get(this.assessmentForm, 'controls.assessmentName.value', '').trim()
    if (!this.imagePath) {
      this.dialogRef.close({ assessmentName, appIcon: this.appIcon })
      return
    }
    this.loaderService.changeLoaderState(true)
    this.assessmentSvc.uploadImageAsset(this.imagePath, this.userProfile).subscribe({
      next: (appIcon: string) => {
        this.loaderService.changeLoaderState(false)
        this.dialogRef.close({ assessmentName, appIcon: appIcon || this.appIcon })
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        this.openSnackBar(_.get(error, 'error.message', 'Something went wrong please try again'))
      },
    })
  }

  /**
   * Creates the image asset, uploads the picked file against it and then creates the
   * assessment collection with the resulting artifact url as appIcon / posterImage.
   * The thumbnail is optional, so an assessment with no image is created without one
   * and picks the default up from the content api.
   */
  createAssessment() {
    this.loaderService.changeLoaderState(true)
    const appIcon$ = this.imagePath
      ? this.assessmentSvc.uploadImageAsset(this.imagePath, this.userProfile)
      : of('')
    appIcon$.pipe(
      mergeMap((appIcon: string) => this.assessmentSvc.createAssessmentCollection(
        _.get(this.assessmentForm, 'controls.assessmentName.value', '').trim(),
        appIcon,
        this.userProfile,
        this.userEmail
      ))
    ).subscribe({
      next: (res: any) => {
        this.loaderService.changeLoaderState(false)
        const identifier = _.get(res, 'result.identifier', '')
        if (identifier) {
          this.openSnackBar('Comprehensive assessment created successfully')
          this.dialogRef.close(identifier)
        } else {
          this.openSnackBar('Something went wrong please try again')
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message',
                                   'Something went wrong while creating the assessment, please try again')
        this.openSnackBar(errorMessage)
      },
    })
  }

  get assessmentName() {
    return this.assessmentForm.get('assessmentName')
  }

  get assessmentNameLength(): number {
    return _.get(this.assessmentForm, 'controls.assessmentName.value.length', 0)
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

}
