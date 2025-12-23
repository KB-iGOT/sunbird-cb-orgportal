import { Component, OnInit } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'

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

  //#endregion

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder
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
        Validators.minLength(5),
        Validators.pattern(/^[A-Za-z0-9.\-_$/:\[\] !]+$/)
      ]],
      courseDescription: ['', [Validators.maxLength(500), Validators.pattern(/^[A-Za-z0-9.\-_$/:\[\] !]+$/)]],
      userType: ['', [Validators.required]],
      proficiencyLevel: ['', [Validators.required]],
      hours: ['', [Validators.max(99)]],
      minutes: ['', [Validators.max(59), Validators.min(0)]],
      seconds: ['', [Validators.max(59), Validators.min(0)]]
    })
    this.additionalDetailsForm = this.fb.group({
      courseLanguage: [''],
      availableWithMDO: ['', [Validators.required]],
      requiredFromKB: ['', [Validators.required]],
      referenceLink: ['']
    })
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
  }
  //#endregion

}
