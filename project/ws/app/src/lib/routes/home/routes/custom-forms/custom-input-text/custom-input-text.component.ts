import { Component, EventEmitter, Input, Output } from '@angular/core'
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
  @Output() removeRow: EventEmitter<any> = new EventEmitter()
  @Output() customRegex: EventEmitter<any> = new EventEmitter()

  fieldValidationTypes = [
    { key: 'Numbers only', value: "^[0-9]+$" },
    { key: 'Text only', value: "^[A-Za-z]+$" },
    { key: 'Alphanumeric', value: "^[A-Za-z0-9]+$" },
    { key: 'Email', value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" },
    { key: 'Phone number', value: "^[6-9]\d{9}$" },
    { key: 'Regex', value: "regex" }
  ]

  constructor() { }

  removeItem() {
    this.removeRow.emit(this.index)
  }

  onFieldValidationChange(event: any) {
    this.customRegex.emit({ selected: event.value, index: this.index })
  }
}
