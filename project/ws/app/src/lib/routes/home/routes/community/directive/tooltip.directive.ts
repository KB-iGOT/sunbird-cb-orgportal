import { Directive, Input, ElementRef, HostListener, ComponentRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core'
import { TooltipComponent } from './tooltip/tooltip.component'

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  @Input('appTooltip') tooltipContent: string = '';
  private tooltipComponentRef: ComponentRef<TooltipComponent> | null = null;

  constructor(
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipComponentRef) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent)
      this.tooltipComponentRef = this.viewContainerRef.createComponent(factory)
      console.log(this.tooltipContent, 'tooltipContent')
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

      const top = hostRect.top - tooltipRect.height + window.scrollY
      const left = hostRect.left + (hostRect.width - tooltipRect.width) / 2 + window.scrollX
      console.log(top, left)
      tooltipElem.style.position = 'absolute'
      tooltipElem.style.top = `${0}px`
      tooltipElem.style.left = `${0}px`
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
