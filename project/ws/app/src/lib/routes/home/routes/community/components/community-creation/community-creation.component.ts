import { ChangeDetectorRef, Component, ViewChild } from '@angular/core'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmDialogComponent } from '../../../../../workallocation-v2/components/confirm-dialog/confirm-dialog.component'
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import { StepperSelectionEvent } from '@angular/cdk/stepper'
import { MatStepper } from '@angular/material/stepper'
import { noSpecialChar } from '../../../events-2/models/events.model'
import { CommunityService } from '../../services/community.service'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { HttpErrorResponse } from '@angular/common/http'
import * as _ from 'lodash'
import { Subscription } from 'rxjs'
import { environment } from '../../../../../../../../../../../src/environments/environment'

@Component({
  selector: 'ws-app-community-creation',
  templateUrl: './community-creation.component.html',
  styleUrls: ['./community-creation.component.scss']
})


export class CommunityCreationComponent {
  openMode = 'edit'
  pathUrl = ''
  userProfile: any
  showPreview = false
  selectedStepperLable = 'Basic Details'
  eventStatus = 'draft'
  @ViewChild(MatStepper) stepper: MatStepper | undefined
  communityDetailsForm!: FormGroup
  currentStepperIndex = 0
  communityDetailsObject: any = {}
  routeSubscription: Subscription = new Subscription()

  topicDataList: any[] = []
  competencies: any = []
  originalFormValues: any = {}; // Add this to store original values
  isEdit = false;
  communityId: any

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatLegacyDialog,
    private matSnackBar: MatLegacySnackBar,
    private communitySvc: CommunityService,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute
  ) {
    this.getTopicData()
    this.initializeFormAndParams()
    this.getRouteSubscription()
  }

  openConforamtionPopup() {
    if (this.openMode === 'edit') {
      const dialgData = {
        dialogType: 'warning',
        icon: {
          iconName: 'error_outline',
          iconClass: 'warning-icon'
        },
        message: 'Are you sure you want to exit without saving?',
        buttonsList: [
          {
            btnAction: false,
            displayText: 'No',
            btnClass: 'btn-outline-primary'
          },
          {
            btnAction: true,
            displayText: 'Yes',
            btnClass: 'successBtn'
          },
        ]
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        height: '210px',
        data: dialgData,
        autoFocus: false
      })

      dialogRef.afterClosed().subscribe((btnAction: any) => {
        if (btnAction) {
          this.navigateBack()
        }
      })
    } else {
      this.navigateBack()
    }
  }

  getRouteSubscription() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.openMode = params['communityId'] ? 'edit' : 'create'
      this.communityId = params['communityId']
    })
    if (_.get(this.activatedRoute, 'snapshot.data.configService.unMappedUser')) {

      this.userProfile = _.get(this.activatedRoute, 'snapshot.data.configService.unMappedUser')
    }
    if (_.get(this.activatedRoute, 'snapshot.data.communityDetails.data')) {

      this.communityDetailsObject = _.get(this.activatedRoute, 'snapshot.data.communityDetails.data')
      if (this.openMode === 'edit' && this.communityDetailsObject) {
        this.patchFormValues()
      }
    }
    this.pathUrl = _.get(this.activatedRoute, 'snapshot.url[0].path', 'pending-approval')
  }

  patchFormValues() {
    const data = this.communityDetailsObject

    if (data && Object.keys(data).length) {
      // Find the matching topic from topicDataList
      const selectedTopic = this.topicDataList.find(topic =>
        topic.categoryId === data.topicId || topic.categoryName === data.topicName)
      this.communityDetailsForm.patchValue({
        communityName: data.communityName || '',
        topicName: selectedTopic || null,
        posterImageUrl: data.posterImageUrl || '',
        description: data.description || '',
        communityGuideLines: data.communityGuideLines || '',
        moderators: data.moderators || [],
        imageUrl: data.imageUrl || '',
        competencies_v6: data.competencies_v6 || []
      })

      // Load competencies if available
      if (data.competencies_v6 && data.competencies_v6.length) {
        this.competencies = data.competencies_v6
      }
    }

    // Update original form values for comparison
    this.originalFormValues = { ...this.communityDetailsObject }
  }

  navigateBack() {
    this.router.navigate([`/app/home/community`])
  }

  moveToNextForm() {

    this.communityDetailsForm.markAllAsTouched()
    this.communityDetailsForm.updateValueAndValidity()
    if (this.canMoveToNext) {
      this.currentStepperIndex = this.currentStepperIndex + 1
    }
  }
  onSelectionChange(event: StepperSelectionEvent) {
    this.currentStepperIndex = event.selectedIndex
    if (this.stepper) {
      const selectedStep = this.stepper.steps.toArray()[this.currentStepperIndex]
      this.selectedStepperLable = selectedStep.label
      this.cdr.detectChanges()
    }
    if (this.selectedStepperLable === 'Preview') {
      // this.updatedEventDetails = this.getFormBodyOfEvent(this.eventDetails['status'])
    }
  }


  initializeFormAndParams() {
    this.communityDetailsForm = this.formBuilder.group({
      communityName: new FormControl('', [Validators.required, Validators.minLength(10),
      Validators.maxLength(70), Validators.pattern(noSpecialChar)]),
      topicName: new FormControl(null, [Validators.required]),
      posterImageUrl: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.minLength(100), Validators.maxLength(500)]),
      communityGuideLines: new FormControl('', [Validators.required, Validators.minLength(100), Validators.maxLength(500)]),
      moderators: new FormControl([], [Validators.required]),
      imageUrl: new FormControl('', [Validators.required]),
      competencies_v6: new FormControl([], [Validators.required]),
    })
    // Store initial values to compare against later
    this.originalFormValues = this.communityDetailsForm.value

    // Check if we're in edit mode and load existing data
    if (this.openMode === 'edit' && this.communityDetailsObject.id) {
      this.isEdit = true
      // Store the original values for comparison
      this.originalFormValues = { ...this.communityDetailsObject }
    }
  }

  getTopicData() {
    let req = {
      "filterCriteriaMap": {
        "status": "active"
      },
      "requestedFields": [
        "categoryId",
        "categoryName"
      ],
      "pageNumber": 0,
      "pageSize": 1000
    }
    this.communitySvc.getTopicDetails(req).subscribe((res: any) => {

      if (res && res.result && res.result.search_results && res.result.search_results.data && res.result.search_results.data.length > 0) {
        this.topicDataList = res.result.search_results.data
        this.patchFormValues()
      }
    })
  }



  get canPublish(): boolean {
    if (this.communityDetailsForm.invalid) {
      this.openSnackBar('Please fill all mandatory fields')
      return false
    } else {
      if (this.selectedStepperLable === 'Add Competency' || this.selectedStepperLable === 'Preview') {
        if (this.communityDetailsForm.invalid) {
          this.openSnackBar('Please fill mandatory fields in Basic Details')
          return false
        }
        if (!(this.competencies && this.competencies.length)) {
          this.openSnackBar('Please add atleast one competency in Add Competency')
          return false
        }
        return true
      }
      return false

    }
  }
  get canMoveToNext() {
    let currentFormIsValid = false
    if (this.selectedStepperLable === 'Basic Details') {
      let allRequiredControlsValid = true
      const controls = this.communityDetailsForm.controls

      // Loop through all controls and check validity (except moderators)
      Object.keys(controls).forEach(controlName => {
        if (controlName !== 'moderators') {
          const control = controls[controlName]
          if (control.invalid) {
            allRequiredControlsValid = false
          }
        }
      })

      if (allRequiredControlsValid) {
        currentFormIsValid = true
      } else {
        this.openSnackBar('Please fill mandatory fields')
      }
    } else if (this.selectedStepperLable === 'Add Competency') {

      if (!(this.competencies && this.competencies.length)) {
        this.openSnackBar('Please add atleast one competency in Add Competency')
        currentFormIsValid = false

      } else {
        currentFormIsValid = true
      }
    } else if (this.selectedStepperLable === 'Add Moderator') {
      if (this.communityDetailsForm
        && this.communityDetailsForm.value
        && this.communityDetailsForm.value.moderators
        && this.communityDetailsForm.value.moderators.length) {
        currentFormIsValid = true
      } else {
        this.openSnackBar('Please add atleast one speaker')
      }
    }
    return currentFormIsValid
  }

  addCompetencies(competencies: any) {
    this.competencies = competencies
  }


  saveAndExit(status = 'Draft') {
    if (this.openMode === 'edit') {
      this.updateCommunity(status)
    } else {
      const formBody = this.getFormBodyOfEvent(status)
      this.loaderService.changeLoaderState(true)
      this.communitySvc.createCommunity(formBody).subscribe({
        next: (res: any) => {
          if (res) {
            const communityId = res.result.communityId
            this.uploadCommunityImage(communityId)
            // Success message will be shown in uploadCommunityImage's success callback
          } else {
            this.loaderService.changeLoaderState(false)
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loaderService.changeLoaderState(false)
          const errorMessage = _.get(error, 'error.message', 'Something went wrong while creating community, please try again')
          this.openSnackBar(errorMessage)
        }
      })
    }
  }



  getFormBodyOfEvent(status: string) {
    let rootOrgName = this.userProfile.rootOrg.orgName
    let rootOrgId = this.userProfile.rootOrgId
    const communityDetails: any = JSON.parse(JSON.stringify(this.communityDetailsObject))
    const communityFormDetails = this.communityDetailsForm.value
    let topicDetails: any = {}
    if (communityFormDetails.topicName && Object.keys(communityFormDetails.topicName).length) {
      topicDetails = communityFormDetails.topicName
    }
    communityDetails['communityName'] = communityFormDetails.communityName
    communityDetails['description'] = communityFormDetails.description
    communityDetails['topicName'] = topicDetails.categoryName || ''
    communityDetails['topicId'] = topicDetails.categoryId || ''
    communityDetails['communityAccessLevel'] = 'public'
    communityDetails["countOfPeopleJoined"] = 0
    communityDetails["countOfPeopleLiked"] = 0
    communityDetails['communityGuideLines'] = communityFormDetails.communityGuideLines
    communityDetails['competencies_v6'] = this.competencies
    communityDetails['orgId'] = rootOrgId
    communityDetails['tags'] = []
    communityDetails['orgName'] = rootOrgName
    communityDetails['createdUserId'] = this.userProfile.id
    if (this.competencies && this.competencies.length) {
      communityDetails['competencyArea'] = []
      communityDetails['competencyTheme'] = []
      communityDetails['competencySubTheme'] = []
      this.competencies.forEach((competency: any) => {
        if (!communityDetails['competencyArea'].includes(competency.competencyAreaName)) {
          communityDetails['competencyArea'].push(competency.competencyAreaName)
        }
        if (!communityDetails['competencyTheme'].includes(competency.competencyThemeName)) {
          communityDetails['competencyTheme'].push(competency.competencyThemeName)
        }
        if (!communityDetails['competencySubTheme'].includes(competency.competencySubThemeName)) {
          communityDetails['competencySubTheme'].push(competency.competencySubThemeName)
        }
      })
    }

    if (status === 'Published') {
      const propertiesToDelete = [
        'createdOn',
        'createdByUserId',
        'createdUserId',
        'countOfModerators',
        'id',
        'searchTags',
        'updatedOn',
        'status',
        'publishedBy',
        'publishedOn',
        'communityGuidelines' // Note: check if this should be 'communityGuideLines' instead
      ]

      // Remove properties in a single loop
      propertiesToDelete.forEach(prop => {
        if (communityDetails[prop]) {
          delete communityDetails[prop]
        }
      })
    }

    return communityDetails
  }
  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  getChangedFields(): any {
    const currentValues = this.communityDetailsForm.value
    const changedFields: any = {}
    Object.keys(currentValues).forEach(key => {
      // For arrays, check if they're different (like moderators)
      if (Array.isArray(currentValues[key])) {
        if (JSON.stringify(currentValues[key]) !== JSON.stringify(this.originalFormValues[key])) {
          changedFields[key] = currentValues[key]
        }
      }
      // For objects (like topicName)
      else if (typeof currentValues[key] === 'object' && currentValues[key] !== null) {
        if (JSON.stringify(currentValues[key]) !== JSON.stringify(this.originalFormValues[key])) {
          changedFields[key] = currentValues[key]
        }
      }
      // For primitive types
      else if (currentValues[key] !== this.originalFormValues[key]) {
        changedFields[key] = currentValues[key]
      }
    })
    if (this.communityId) {
      changedFields['communityId'] = this.communityId
    }
    // Always check if competencies have changed by comparing the arrays
    if (JSON.stringify(this.competencies) !== JSON.stringify(this.originalFormValues.competencies_v6 || [])) {
      changedFields['competencies_v6'] = this.competencies
    }

    return changedFields
  }




  uploadCommunityImage(communityId: string) {
    const formData = new FormData()

    // Check if posterImageUrl is a File object (selected file)
    if (this.communityDetailsForm.value.posterImageUrl instanceof File) {
      formData.append('file', this.communityDetailsForm.value.posterImageUrl)

      this.communitySvc.fileUpload(formData, communityId).subscribe({
        next: (response: any) => {
          if (response && response.result && response.result.url) {
            let url = response.result.url.split('igot/discussionhub')[1]
            let finalUrl = `${this.getEnvironmentBaseUrl()}${url}`

            // Check if imageUrl also needs to be uploaded
            if (this.communityDetailsForm.value.imageUrl instanceof File) {
              this.uploadImageUrl(communityId, finalUrl)
            } else {
              // Update with just the poster image
              const updateData = {
                communityId: communityId,
                posterImageUrl: finalUrl
              }
              this.updateCommunityWithImage(updateData)
            }
          } else {
            this.loaderService.changeLoaderState(false)
            const successMessage = 'Community created successfully, but failed to upload image'
            this.openSnackBar(successMessage)
            setTimeout(() => {
              this.navigateBack()
            }, 1000)
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loaderService.changeLoaderState(false)
          const errorMessage = _.get(error, 'error.message', 'Community created but failed to upload image')
          this.openSnackBar(errorMessage)
          setTimeout(() => {
            this.navigateBack()
          }, 1000)
        }
      })
    } else if (this.communityDetailsForm.value.imageUrl instanceof File) {
      // If only imageUrl needs to be uploaded
      this.uploadImageUrl(communityId, this.communityDetailsForm.value.posterImageUrl)
    } else {
      // No files to upload, just update community
      const updateData = {
        communityId: communityId,
        posterImageUrl: this.communityDetailsForm.value.posterImageUrl
      }
      this.updateCommunityWithImage(updateData)
    }
  }

  uploadImageUrl(communityId: string, posterImageUrl?: string) {
    const formData = new FormData()
    formData.append('file', this.communityDetailsForm.value.imageUrl)

    this.communitySvc.fileUpload(formData, communityId).subscribe({
      next: (response: any) => {
        if (response && response.result && response.result.url) {

          let url = response.result.url.split('igot/discussionhub')[1]
          let finalUrl = `${this.getEnvironmentBaseUrl()}${url}`

          const updateData: any = {
            communityId: communityId,
            imageUrl: finalUrl
          }

          // Add posterImageUrl if it was provided
          if (posterImageUrl) {
            updateData.posterImageUrl = posterImageUrl
          }

          this.updateCommunityWithImage(updateData)
        } else {
          this.loaderService.changeLoaderState(false)
          const successMessage = 'Community created successfully, but failed to upload image'
          this.openSnackBar(successMessage)
          setTimeout(() => {
            this.navigateBack()
          }, 1000)
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message', 'Community created but failed to upload image')
        this.openSnackBar(errorMessage)
        setTimeout(() => {
          this.navigateBack()
        }, 1000)
      }
    })
  }

  updateCommunityWithImage(updateData: any) {
    this.communitySvc.updateCommunity(updateData).subscribe({
      next: (_res: any) => {
        const successMessage = 'Community created/updated successfully'
        this.openSnackBar(successMessage)
        setTimeout(() => {
          this.navigateBack()
          this.loaderService.changeLoaderState(false)
        }, 1000)
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message', 'Community created but failed to update with image URL')
        this.openSnackBar(errorMessage)
        setTimeout(() => {
          this.navigateBack()
        }, 1000)
      }
    })
  }




  updateCommunity(status = 'Draft') {
    // Get only the changed fields
    const changedFields = this.getChangedFields()

    // // Add status to the update
    // // changedFields.status = status

    // // Add the competencies if they've changed
    // const originalCompetencies = this.originalFormValues.competencies_v6 || []
    // if (JSON.stringify(this.competencies) !== JSON.stringify(originalCompetencies)) {
    //   changedFields.competencies_v6 = this.competencies
    // }

    // // Add communityId for the update API
    // changedFields.communityId = this.communityId

    // Process topicName field if it has changed
    if (changedFields.topicName && Object.keys(changedFields.topicName).length) {
      changedFields.topicId = changedFields.topicName.categoryId || ''
      changedFields.topicName = changedFields.topicName.categoryName || ''
    }

    // Check if we need to upload images first
    if (changedFields.posterImageUrl instanceof File || changedFields.imageUrl instanceof File) {
      this.loaderService.changeLoaderState(true)
      // Create a copy of changedFields without the file objects for later update
      const updatedFields = { ...changedFields }
      if (changedFields.posterImageUrl instanceof File) {
        delete updatedFields.posterImageUrl
      }
      if (changedFields.imageUrl instanceof File) {
        delete updatedFields.imageUrl
      }

      // Upload the files first
      if (changedFields.posterImageUrl instanceof File) {
        const formData = new FormData()
        formData.append('file', changedFields.posterImageUrl)
        this.communitySvc.fileUpload(formData, this.communityId).subscribe({
          next: (response: any) => {
            if (response && response.result && response.result.url) {
              let url = response.result.url.split('igot/discussionhub')[1]
              let finalUrl = `${this.getEnvironmentBaseUrl()}${url}`
              updatedFields.posterImageUrl = finalUrl

              // Check if we also need to upload imageUrl
              if (changedFields.imageUrl instanceof File) {
                this.uploadSecondImageAndUpdate(changedFields.imageUrl, updatedFields, status)
              } else {
                // Just update with the poster image
                this.finalizeUpdate(updatedFields, status)
              }
            } else {
              this.loaderService.changeLoaderState(false)
              this.openSnackBar('Failed to upload poster image')
            }
          },
          error: (error: HttpErrorResponse) => {
            this.loaderService.changeLoaderState(false)
            const errorMessage = _.get(error, 'error.message', 'Failed to upload poster image')
            this.openSnackBar(errorMessage)
          }
        })
      } else if (changedFields.imageUrl instanceof File) {
        // Only imageUrl needs to be uploaded
        this.uploadSecondImageAndUpdate(changedFields.imageUrl, updatedFields, status)
      }
    } else {
      // No files to upload, proceed with regular update
      this.loaderService.changeLoaderState(true)
      this.communitySvc.updateCommunity(changedFields).subscribe({
        next: (res: any) => {
          if (res) {
            if (status === 'Published') {
              this.publishCommunityMethod()
            } else {
              const successMessage = status === 'Published' ?
                'Community published successfully' : 'Community updated successfully'
              this.openSnackBar(successMessage)
              setTimeout(() => {
                this.navigateBack()
                this.loaderService.changeLoaderState(false)
              }, 1000)
            }
          } else {
            this.loaderService.changeLoaderState(false)
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loaderService.changeLoaderState(false)
          const errorMessage = _.get(error, 'error.message', 'Something went wrong while updating community, please try again')
          this.openSnackBar(errorMessage)
        }
      })
    }
  }

  uploadSecondImageAndUpdate(imageFile: File, updatedFields: any, status: string) {
    const formData = new FormData()
    formData.append('file', imageFile)

    this.communitySvc.fileUpload(formData, this.communityId).subscribe({
      next: (response: any) => {
        if (response && response.result && response.result.url) {

          let url = response.result.url.split('igot/discussionhub')[1]
          let finalUrl = `${this.getEnvironmentBaseUrl()}${url}`
          updatedFields.imageUrl = finalUrl
          this.finalizeUpdate(updatedFields, status)
        } else {
          this.loaderService.changeLoaderState(false)
          this.openSnackBar('Failed to upload image')
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message', 'Failed to upload image')
        this.openSnackBar(errorMessage)
      }
    })
  }

  finalizeUpdate(updatedFields: any, status: string) {
    this.communitySvc.updateCommunity(updatedFields).subscribe({
      next: (res: any) => {
        if (res) {
          this.openSnackBar('Community updated successfully')
          if (status === 'Published') {
            this.publishCommunityMethod()
          } else {
            setTimeout(() => {
              this.navigateBack()
              this.loaderService.changeLoaderState(false)
            }, 1000)
          }
        } else {
          this.loaderService.changeLoaderState(false)
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message', 'Something went wrong while updating community, please try again')
        this.openSnackBar(errorMessage)
      }
    })
  }

  publishCommunity() {
    // Validate that all required data is present
    if (!this.canPublish) {
      return
    }

    // If on Add Competency step, call the direct publish method
    if (this.selectedStepperLable === 'Add Competency') {
      let changedFields = this.getChangedFields()
      if (changedFields && Object.keys(changedFields).length > 2) {
        this.updateCommunity('Published')
      } else {
        this.publishCommunityMethod()
        return
      }
    }
  }

  publishCommunityMethod() {
    // Show loader
    this.loaderService.changeLoaderState(true)

    // Get complete form data with Published status
    const request = this.getFormBodyOfEvent('Published')

    this.communitySvc.publishCommunity(request).subscribe({
      next: (response: any) => {
        if (response && response.result) {
          this.openSnackBar('Community published successfully')
          setTimeout(() => {
            this.navigateBack()
            this.loaderService.changeLoaderState(false)
          }, 1000)
        } else {
          this.loaderService.changeLoaderState(false)
          this.openSnackBar('Failed to publish community')
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message', 'Something went wrong while publishing community, please try again')
        this.openSnackBar(errorMessage)
      }
    })
  }
  getEnvironmentBaseUrl() {
    if (environment.karmYogiPath && environment.dicussV2Bucket) {
      return `${environment.karmYogiPath}/${environment.dicussV2Bucket}`
    }
    return ''
  }
}


