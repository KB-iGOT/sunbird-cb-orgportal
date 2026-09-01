import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { AparYearService, IAparYear } from './apar-year.service'

let uniqueId = 0

@Component({
  selector: 'ws-app-apar-year-select',
  templateUrl: './apar-year-select.component.html',
  styleUrls: ['./apar-year-select.component.scss'],
  standalone: false
})
export class AparYearSelectComponent implements OnInit, OnChanges {
  @Input() label = 'Select APAR Year'
  // 'inline' keeps the label beside the field (toolbars), 'stacked' puts it above (forms)
  @Input() layout: 'inline' | 'stacked' = 'stacked'
  @Input() required = true
  @Input() disabled = false
  // Set by the plan stepper: a year the config closes cannot be picked on a plan. The dashboard
  // leaves it off, every year has to stay pickable there to filter the plans of that year
  @Input() editableOnly = false
  @Input() width = '200px'
  @Input() yearCount = 5
  @Input() value = ''
  @Output() valueChange = new EventEmitter<string>()

  years: IAparYear[] = []
  fieldId = `apar-year-select-${uniqueId += 1}`

  constructor(private aparYearSvc: AparYearService) { }

  ngOnInit() {
    this.years = this.aparYearSvc.getAparYears(this.yearCount)
    this.keepValueOnList()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && this.years.length) {
      this.keepValueOnList()
    }
  }

  /**
   * A plan can hold a year the config no longer lists, an older plan being edited or previewed.
   * That year is added to the list so the field shows it instead of coming up empty, and it is
   * never editable, only the years the config lists can be picked.
   */
  private keepValueOnList() {
    if (!this.value || this.years.some((year: IAparYear) => year.value === this.value)) {
      return
    }
    this.years = [...this.years, { label: this.value, value: this.value, editable: false }]
  }

  onSelectionChange(value: string) {
    this.value = value
    this.valueChange.emit(value)
  }
}
