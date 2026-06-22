import { Directive, TemplateRef } from '@angular/core'

@Directive({
    selector: '[wsAppAutocompleteContent]',
    standalone: false
})
export class AutocompleteContentDirective {
  constructor(public tpl: TemplateRef<any>) {
  }
}
