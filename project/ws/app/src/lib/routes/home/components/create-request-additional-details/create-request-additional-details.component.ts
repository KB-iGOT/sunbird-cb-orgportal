import { Component, Input } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'

@Component({
  selector: 'ws-app-create-request-additional-details',
  templateUrl: './create-request-additional-details.component.html',
  styleUrls: ['./create-request-additional-details.component.scss']
})
export class CreateRequestAdditionalDetailsComponent {
  //#region (global variable declaration)
  @Input() additionalDetailsForm!: UntypedFormGroup

  languagesList = []
  //#endregion (global variable declaration)

  constructor() { }

  controlValidationStatus(controlName: string, errorType: string): boolean {
    const control = this.additionalDetailsForm.get(controlName)
    if (!control) {
      return false
    }
    return control.touched && control.hasError(errorType)
  }

}
