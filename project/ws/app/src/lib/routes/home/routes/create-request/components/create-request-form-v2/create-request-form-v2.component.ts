import { Component, OnInit } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { CreateRequestService } from '../../services/create-request.service'
import { ConfirmationBoxComponent } from '../../../../../training-plan/components/confirmation-box/confirmation.box.component'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { ProfileV2Service } from '../../../../services/home.servive'

@Component({
  selector: 'ws-app-create-request-form-v2',
  templateUrl: './create-request-form-v2.component.html',
  styleUrls: ['./create-request-form-v2.component.scss']
})
export class CreateRequestFormV2Component implements OnInit {
  //#region (global variable declaration)
  currentStepperIndex = 0
  steppersList = ['Content Details', 'Additional Details']
  isHideData = false
  contentDetailsForm!: UntypedFormGroup
  additionalDetailsForm!: UntypedFormGroup
  dialogRefs: any
  demandId: string | null = null
  viewMode: string = 'Create'
  requestObjData: any
  formLoading: boolean = false

  //#endregion

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private createRequestSvc: CreateRequestService,
    public dialog: MatLegacyDialog,
    private snackBar: MatLegacySnackBar,
    private activatedRoute: ActivatedRoute,
    private homeService: ProfileV2Service,
  ) { }

  ngOnInit(): void {
    this.initialization()
  }
  //#region (initialization)
  initialization() {
    this.contentDetailsForm = this.fb.group({
      courseTitle: ['', [
        Validators.required,
        Validators.maxLength(70),
        Validators.minLength(10),
        Validators.pattern(/^[A-Za-z0-9.\-_' ,\$\/:\[\] !]+$/)
      ]],
      courseDescription: ['', [Validators.maxLength(500), Validators.pattern(/^[A-Za-z0-9.\-_' ,\$\/:\[\] !\r\n]+$/)]],
      userType: ['', [Validators.required]],
      proficiencyLevel: ['', [Validators.required]],
      hours: [1, [Validators.max(99)]],
      minutes: [0, [Validators.max(59), Validators.min(0)]],
      seconds: [0, [Validators.max(59), Validators.min(0)]]
    })
    this.additionalDetailsForm = this.fb.group({
      courseLanguage: [''],
      availableWithMDO: ['', [Validators.required]],
      requiredFromKB: ['', [Validators.required]],
      referenceLink: ['', [Validators.pattern(/^(https?|http):\/\/[^\s/$.?#].[^\s]*$/)]],
      authors: [''],
      requestType: [''],
      assignee: [''],
      assigneeText: [''],
      providers: [''],
      preferredProvider: [''],
      providerText: ['']
    })

    this.routeSubscription()
  }

  routeSubscription() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.demandId = params.id
        this.viewMode = params.name
        if (this.viewMode.toLocaleLowerCase() === 'view') {
          this.additionalDetailsForm.disable()
          this.contentDetailsForm.disable()
        }
        this.getRequestDataById()
      }
    })
  }

  getRequestDataById() {
    this.formLoading = true
    this.homeService.getRequestDataById(this.demandId).subscribe((data: any) => {
      if (data) {
        this.requestObjData = data
        this.setRequestData()
      }
    }
    )
  }

  setRequestData() {
    if (!this.requestObjData) {
      return
    }
    const estimatedDuration = this.requestObjData.estimatedDuration ? this.requestObjData.estimatedDuration.split(':') : []
    this.contentDetailsForm.setValue({
      courseTitle: this.requestObjData.title,
      courseDescription: this.requestObjData.objective,
      userType: this.requestObjData.typeOfUser || [],
      proficiencyLevel: this.requestObjData.proficiencyLevel || '',
      hours: estimatedDuration.length > 0 ? parseInt(estimatedDuration[0], 10) : 0,
      minutes: estimatedDuration.length > 1 ? parseInt(estimatedDuration[1], 10) : 0,
      seconds: estimatedDuration.length > 2 ? parseInt(estimatedDuration[2], 10) : 0,
    })
    this.additionalDetailsForm.setValue({
      courseLanguage: this.requestObjData.courseLanguage ? this.requestObjData.courseLanguage : [],
      availableWithMDO: this.requestObjData.sectoralSubjectMatterExpertAvailable,
      requiredFromKB: this.requestObjData.courseDigitisationAgencyRequired,
      referenceLink: this.requestObjData.referenceLink ? this.requestObjData.referenceLink : '',
      requestType: this.requestObjData.requestType || '',
      assignee: this.requestObjData.assignedProvider || [],
      assigneeText: '',
      providers: this.requestObjData.preferredProvider || [],
      preferredProvider: '',
      providerText: '',
      authors: this.requestObjData.sectoralSubjectMatterExpertDetails || []
    })
    if (this.requestObjData.courseDigitisationAgencyRequired === false) {
      const requestTypeControl = this.additionalDetailsForm.get('requestType')
      if (requestTypeControl) {
        requestTypeControl.setValidators([Validators.required])
        requestTypeControl.updateValueAndValidity()
      }
    }

    if (this.requestObjData.requestType === 'Broadcast') {
      const providersControl = this.additionalDetailsForm.get('providers')
      if (providersControl) {
        providersControl.setValidators([Validators.required])
      }
    } else if (this.requestObjData.requestType === 'Single') {
      const assigneeControl = this.additionalDetailsForm.get('assignee')
      if (assigneeControl) {
        assigneeControl.setValidators([Validators.required])
        assigneeControl.updateValueAndValidity()
      }
    }
    if (this.requestObjData.sectoralSubjectMatterExpertAvailable === true) {
      const authorsControl = this.additionalDetailsForm.get('authors')
      if (authorsControl) {
        authorsControl.setValidators([Validators.required])
        authorsControl.updateValueAndValidity()
      }
    }
    this.formLoading = false
  }
  //#endregion (initialization)

  //#region (interactions)
  navigateBack() {
    this.router.navigateByUrl('/app/home/request-list')
  }

  onStepChanged(index: number) {
    this.currentStepperIndex = index
  }

  onNext() {
    if (this.currentStepperIndex === this.steppersList.length - 1) {
      this.onSubmit()
    } else {
      this.currentStepperIndex += 1
    }
  }

  onPrevious() {
    if (this.currentStepperIndex > 0) {
      this.currentStepperIndex -= 1
    }
  }

  onSubmit() {
    this.contentDetailsForm.markAllAsTouched()
    this.contentDetailsForm.updateValueAndValidity()
    this.additionalDetailsForm.markAllAsTouched()
    this.additionalDetailsForm.updateValueAndValidity()
    if (this.contentDetailsForm.invalid || this.additionalDetailsForm.invalid) {
      return
    }
    const requestBody = this.generateRequestBody()
    this.showDialogBox('progress')
    this.createRequestSvc.createRequestForm(requestBody).subscribe({
      next: (response: any) => {
        if (response) {
          this.dialogRefs.close()
          this.showDialogBox('progress-completed')
          setTimeout(() => {
            this.dialogRefs.close()
            this.router.navigateByUrl('/app/home/request-list')
            this.snackBar.open('Request submitted successfully ')
          }, 1000)
        }
      },
      error: (error: any) => {
        if (error) {
          this.dialogRefs.close()
          this.snackBar.open('Something went wrong, please try again.')
        }
      }
    })
  }

  showDialogBox(event: any) {
    const dialogData: any = {}
    switch (event) {
      case 'progress':
        dialogData['type'] = 'progress'
        dialogData['icon'] = 'vega'
        dialogData['title'] = 'Processing your request'
        dialogData['subTitle'] = `Wait a second , your request is processing………`
        break
      case 'progress-completed':
        dialogData['type'] = 'progress-completed'
        dialogData['icon'] = 'accept_icon'
        dialogData['title'] = 'Processing your request'
        dialogData['subTitle'] = `Wait a second , your request is processing………`
        dialogData['primaryAction'] = 'Successfully created....'
        break
    }

    this.openDialoagBox(dialogData)
  }

  openDialoagBox(dialogData: any) {
    this.dialogRefs = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: {
        type: dialogData.type,
        icon: dialogData.icon,
        title: dialogData.title,
        subTitle: dialogData.subTitle,
        primaryAction: dialogData.primaryAction,
        secondaryAction: dialogData.secondaryAction,
      },
      autoFocus: false,
    })

    this.dialogRefs.afterClosed().subscribe(() => {
    })
  }


  generateRequestBody() {
    if (!this.contentDetailsForm || !this.additionalDetailsForm)
      return {}
    return {
      title: this.contentDetailsForm.get('courseTitle')?.value,
      objective: this.contentDetailsForm.get('courseDescription')?.value,
      typeOfUser: this.contentDetailsForm.get('userType')?.value,
      referenceLink: this.additionalDetailsForm.get('referenceLink')?.value,
      requestType: this.additionalDetailsForm.get('requestType')?.value,
      preferredProvider: this.providerValue,
      assignedProvider: this.assignedProviderValue,
      proficiencyLevel: this.contentDetailsForm.get('proficiencyLevel')?.value,
      estimatedDuration: this.getEstimatedDuration,
      courseLanguage: this.getCourseLanguage,
      sectoralSubjectMatterExpertAvailable: this.additionalDetailsForm.get('availableWithMDO')?.value,
      sectoralSubjectMatterExpertDetails: this.additionalDetailsForm.get('authors')?.value || [],
      courseDigitisationAgencyRequired: this.additionalDetailsForm.get('requiredFromKB')?.value,
    }
  }

  get providerValue(): any {
    if (this.additionalDetailsForm && this.additionalDetailsForm.get('providers')) {
      const providerValue = this.additionalDetailsForm.get('providers')?.value
      if (providerValue && providerValue.length > 0) {
        const formattedProvider = providerValue.map((provider: any) => {
          return {
            providerId: provider.id,
            providerName: provider.orgName
          }
        })
        return formattedProvider
      }
    }
    return undefined
  }

  get assignedProviderValue(): any {
    const assigneeControl = this.additionalDetailsForm.get('assignee')
    if (assigneeControl && assigneeControl.value) {
      const assignee = {
        providerId: assigneeControl.value.id,
        providerName: assigneeControl.value.orgName
      }
      return assignee
    }
    return undefined
  }

  get getCourseLanguage(): string[] {
    if (this.additionalDetailsForm && this.additionalDetailsForm.get('courseLanguage')) {
      return this.additionalDetailsForm.get('courseLanguage')?.value.map((lang: { displayName: string; value: string }) => lang.value)
    }
    return []
  }

  get getEstimatedDuration(): string {
    const hours = this.contentDetailsForm.get('hours')?.value || 0
    const minutes = this.contentDetailsForm.get('minutes')?.value || 0
    const seconds = this.contentDetailsForm.get('seconds')?.value || 0
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  //#endregion

}
