import {
  Directive,
  Input,
  ElementRef,
  ComponentRef,
  HostListener,
  ViewContainerRef,
  OnDestroy,
  NgZone
} from '@angular/core'
import { TooltipComponent } from './tooltip/tooltip.component'

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') content: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipRef: ComponentRef<TooltipComponent> | null = null;
  private showTimeout: any
  private hideTimeout: any

  constructor(
    private el: ElementRef,
    private vcr: ViewContainerRef,
    private ngZone: NgZone
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.ngZone.run(() => {
      clearTimeout(this.hideTimeout)
      this.showTimeout = setTimeout(() => {
        if (this.tooltipRef === null) {
          this.tooltipRef = this.vcr.createComponent(TooltipComponent)
          this.tooltipRef.instance.content = this.content
          this.tooltipRef.instance.position = this.position

          // Use requestAnimationFrame to ensure the component is rendered before positioning
          requestAnimationFrame(() => {
            if (this.tooltipRef) {
              this.tooltipRef.instance.setPosition(this.el)
            }
          })
        }
      }, 100) // Small delay to prevent accidental triggers
    })
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.ngZone.run(() => {
      clearTimeout(this.showTimeout)
      this.hideTimeout = setTimeout(() => {
        this.destroyTooltip()
      }, 100) // Small delay before hiding
    })
  }

  private destroyTooltip(): void {
    if (this.tooltipRef !== null) {
      this.tooltipRef.destroy()
      this.tooltipRef = null
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.showTimeout)
    clearTimeout(this.hideTimeout)
    this.destroyTooltip()
  }
}