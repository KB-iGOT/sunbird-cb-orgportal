import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

// A custom validator to prevent HTML and Javascript
export function preventHtmlAndJs(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value
    if (typeof value === 'string' && value.match(/<[^>]*>|(function[^\s]+)|(javascript:[^\s]+)/i)) {
      return { hasHtml: true }
    }
    return null
  }
}
