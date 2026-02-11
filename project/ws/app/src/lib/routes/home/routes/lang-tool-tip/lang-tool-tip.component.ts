import { Component, Input, TemplateRef } from '@angular/core'

@Component({
  selector: 'ws-auth-lang-tool-tip',
  templateUrl: './lang-tool-tip.component.html',
  styleUrls: ['./lang-tool-tip.component.scss']
})
export class LangToolTipComponent {

  @Input() tooltipTemplate: TemplateRef<any> | undefined
  @Input() tooltipData: any

  getStatusClass(status: string): string {
    if (!status) return ''
    const lowerStatus = status.toLowerCase()
    if (lowerStatus === 'live') return 'live'
    if (lowerStatus.includes('review')) return 'under-review'
    return 'draft'
  }

}
