import { Directive, Input, ElementRef, HostListener, ComponentRef, OnDestroy, TemplateRef, NgZone } from '@angular/core'
import { Overlay, OverlayRef, OverlayPositionBuilder } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { LangToolTipComponent } from '../routes/lang-tool-tip/lang-tool-tip.component'

@Directive({
  selector: '[wsAuthWsCustomTooltip]'
})
export class WsCustomTooltipDirective implements OnDestroy {
  @Input('wsAuthWsCustomTooltip') tooltipData: any
  @Input() tooltipTemplate: TemplateRef<any> | undefined

  private overlayRef: OverlayRef | undefined
  private hideTimeoutId: any = null

  constructor(
    private overlay: Overlay,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private elementRef: ElementRef,
    private ngZone: NgZone
  ) { }

  @HostListener('mouseenter')
  show() {
    // Clear any existing hide timeout
    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId)
      this.hideTimeoutId = null
    }

    if (this.overlayRef?.hasAttached()) {
      return
    }

    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          // Primary position - below the element
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: 5,
        },
        {
          // Fallback position - above the element
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -5,
        },
        {
          // Second fallback - right side
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: 5,
        },
        {
          // Third fallback - left side
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -5,
        }
      ])

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false
    })

    const tooltipRef: ComponentRef<LangToolTipComponent> = this.overlayRef.attach(new ComponentPortal(LangToolTipComponent))
    tooltipRef.instance.tooltipData = this.tooltipData
    tooltipRef.instance.tooltipTemplate = this.tooltipTemplate
  }

  @HostListener('mouseleave')
  hide() {
    // Add a small delay before closing to prevent flickering
    this.ngZone.runOutsideAngular(() => {
      this.hideTimeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.closeTooltip()
          this.hideTimeoutId = null
        })
      }, 100) // 100ms delay
    })
  }

  ngOnDestroy() {
    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId)
    }
    this.closeTooltip()
  }

  private closeTooltip() {
    if (this.overlayRef) {
      this.overlayRef.detach()
    }
  }
}