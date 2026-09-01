import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAppAppTocOverview]',
  standalone: false,
})
export class AppTocOverviewDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
