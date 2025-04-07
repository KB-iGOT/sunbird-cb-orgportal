import { Component, Input } from '@angular/core'

@Component({
  selector: 'ws-app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  @Input() tooltipContent: string = '';
}
