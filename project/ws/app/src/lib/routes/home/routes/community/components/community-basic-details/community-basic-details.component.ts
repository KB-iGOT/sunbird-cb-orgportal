import { Component, Input } from '@angular/core'
import { FormGroup } from '@angular/forms'

import * as _ from 'lodash'
@Component({
  selector: 'ws-app-community-basic-details',
  templateUrl: './community-basic-details.component.html',
  styleUrls: ['./community-basic-details.component.scss']
})
export class CommunityBasicDetailsComponent {
  @Input() communityDetailsForm!: FormGroup
  @Input() openMode!: string
  @Input() topicDataList: any[] = []
  communityStatus = 'draft'




  showValidationMsg(controlName: string, validationType: string): Boolean {
    let showMsg = false
    const control = _.get(this.communityDetailsForm, `controls.${controlName}`)
    if (control && control.touched && control.invalid && control.hasError(validationType)) {
      showMsg = true
    }
    return showMsg
  }

}
