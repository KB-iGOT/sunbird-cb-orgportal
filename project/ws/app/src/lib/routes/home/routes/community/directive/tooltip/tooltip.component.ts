import { Component, Input, ElementRef, ChangeDetectorRef, HostBinding } from '@angular/core'


@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent {
  @Input() content: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @HostBinding('style.opacity') opacity: number = 0;

  constructor(private elementRef: ElementRef, private cd: ChangeDetectorRef) { }

  setPosition(hostEl: ElementRef): void {
    const hostRect = hostEl.nativeElement.getBoundingClientRect()
    const tooltipRect = this.elementRef.nativeElement.getBoundingClientRect()

    let top: number
    let left: number

    switch (this.position) {
      case 'top':
        top = hostRect.top - tooltipRect.height - 10
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = hostRect.bottom + 10
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2
        left = hostRect.left - tooltipRect.width - 10
        break
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2
        left = hostRect.right + 10
        break
    }

    // Ensure tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Adjust horizontal position if needed
    if (left < 0) {
      left = 0
    } else if (left + tooltipRect.width > viewport.width) {
      left = viewport.width - tooltipRect.width
    }

    // Adjust vertical position if needed
    if (top < 0) {
      top = 0
    } else if (top + tooltipRect.height > viewport.height) {
      top = viewport.height - tooltipRect.height
    }

    this.elementRef.nativeElement.style.top = `${top}px`
    this.elementRef.nativeElement.style.left = `${left}px`
    this.opacity = 1
    this.cd.detectChanges()
  }
}
