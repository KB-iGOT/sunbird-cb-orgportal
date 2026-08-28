import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { AparYearService, IAparYear } from './apar-year.service'

let uniqueId = 0

@Component({
  selector: 'ws-app-apar-year-select',
  templateUrl: './apar-year-select.component.html',
  styleUrls: ['./apar-year-select.component.scss'],
  standalone: false
})
export class AparYearSelectComponent implements OnInit {
  @Input() label = 'Select APAR Year'
  // 'inline' keeps the label beside the field (toolbars), 'stacked' puts it above (forms)
  @Input() layout: 'inline' | 'stacked' = 'stacked'
  @Input() required = true
  @Input() disabled = false
  @Input() width = '200px'
  @Input() yearCount = 5
  @Input() value = ''
  @Output() valueChange = new EventEmitter<string>()

  years: IAparYear[] = []
  fieldId = `apar-year-select-${uniqueId += 1}`

  constructor(private aparYearSvc: AparYearService) { }

  ngOnInit() {
    this.years = this.aparYearSvc.getAparYears(this.yearCount)
  }

  onSelectionChange(value: string) {
    this.value = value
    this.valueChange.emit(value)
  }
}
