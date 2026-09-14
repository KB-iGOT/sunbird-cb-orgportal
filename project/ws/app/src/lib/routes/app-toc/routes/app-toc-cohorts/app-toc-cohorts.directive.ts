import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAppAppTocCohorts]',
  standalone: false,
})
export class AppTocCohortsDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
