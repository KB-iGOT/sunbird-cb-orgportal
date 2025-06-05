import { Component, Input } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'

@Component({
  selector: 'ws-app-custom-input-text',
  templateUrl: './custom-input-text.component.html',
  styleUrls: ['./custom-input-text.component.scss']
})
export class CustomInputTextComponent {
  @Input() question: UntypedFormGroup | undefined
  @Input() customForm: UntypedFormGroup | undefined
  @Input() index: UntypedFormGroup | undefined

  constructor() { }
}
