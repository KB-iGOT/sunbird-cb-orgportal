import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[wsAppAppTocHome]',
  standalone: false,
})
export class AppTocHomeDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

}
