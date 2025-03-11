import { ChangeDetectorRef, Component, ViewChild } from '@angular/core'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { Router } from '@angular/router'
import { ConfirmDialogComponent } from '../../../../../workallocation-v2/components/confirm-dialog/confirm-dialog.component'
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import { StepperSelectionEvent } from '@angular/cdk/stepper'
import { MatStepper } from '@angular/material/stepper'
import { noSpecialChar } from '../../../events-2/models/events.model'
import { CommunityService } from '../../services/community.service'
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
  canMoveToNext = false
  eventDetails: any


  topicDataList: any[] = []

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatLegacyDialog,
    private communitySvc: CommunityService
  ) {
    this.getTopicData()
    this.initializeFormAndParams()
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

  navigateBack() {
    this.router.navigate([`/app/home/community`])
  }

  moveToNextForm() {
    this.communityDetailsForm.markAllAsTouched()
    this.communityDetailsForm.updateValueAndValidity()
    if (this.openMode === 'view' || this.canMoveToNext) {
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
      topicName: new FormControl('', [Validators.required])

    })
  }

  getTopicData() {
    this.communitySvc.getTopicDetails().subscribe((res: any) => {
      if (res && res.result && res.result.sectors && res.result.sectors.length > 0) {
        this.topicDataList = res.result.sectors
      }
    })
  }


}
