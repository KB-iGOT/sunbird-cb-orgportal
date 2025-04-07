import { Directive, Input, ElementRef, HostListener, ComponentRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core'
import { TooltipComponent } from './tooltip/tooltip.component'

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  @Input('appTooltip') tooltipContent: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'left';
  @Input() showError: boolean = false;
  private tooltipComponentRef: ComponentRef<TooltipComponent> | null = null;

  constructor(
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipComponentRef && this.showError) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent)
      this.tooltipComponentRef = this.viewContainerRef.createComponent(factory)
      this.tooltipComponentRef.instance.tooltipContent = this.tooltipContent
      this.setPosition()
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.destroyTooltip()
  }

  private setPosition(): void {
    if (this.tooltipComponentRef) {
      const hostElem = this.elementRef.nativeElement
      const tooltipElem = this.tooltipComponentRef.location.nativeElement
      const hostRect = hostElem.getBoundingClientRect()
      const tooltipRect = tooltipElem.getBoundingClientRect()

      let top = 0
      let left = 0

      console.log('Host Rect:', hostRect)
      console.log('Tooltip Rect:', tooltipRect)
      console.log('Position:', this.tooltipPosition)

      switch (this.tooltipPosition) {
        case 'top':
          top = hostRect.top - tooltipRect.height - 5
          left = hostRect.left + (hostRect.width - tooltipRect.width) / 2
          break
        case 'bottom':
          top = hostRect.bottom + 5
          left = hostRect.left + (hostRect.width - tooltipRect.width) / 2
          break
        case 'left':
          top = hostRect.top + (hostRect.height - tooltipRect.height) / 2
          left = hostRect.left - tooltipRect.width - 5
          break
        case 'right':
          top = hostRect.top + (hostRect.height - tooltipRect.height) / 2
          left = hostRect.right + 5
          break
      }

      // Add scroll position after calculating relative positions
      top += window.scrollY
      left += window.scrollX

      console.log('Final Position:', { top, left })

      tooltipElem.style.position = 'absolute'
      tooltipElem.style.top = `${top}px`
      tooltipElem.style.left = `${left}px`
      tooltipElem.style.display = 'block'
      tooltipElem.style.zIndex = '9999'
    }
  }

  private destroyTooltip(): void {
    if (this.tooltipComponentRef) {
      this.tooltipComponentRef.destroy()
      this.tooltipComponentRef = null
    }
  }
}
