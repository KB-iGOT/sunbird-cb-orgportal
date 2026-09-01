import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAppAppTocSinglePage]',
  standalone: false,
})
export class AppTocSinglePageDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
