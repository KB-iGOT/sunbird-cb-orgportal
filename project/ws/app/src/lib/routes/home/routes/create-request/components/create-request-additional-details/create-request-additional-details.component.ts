import { Component, Input, OnInit } from '@angular/core'
import { FormControl, UntypedFormGroup } from '@angular/forms'

type Auther = {
  name: string,
  number: string,
  email: string,
}

@Component({
  selector: 'ws-app-create-request-additional-details',
  templateUrl: './create-request-additional-details.component.html',
  styleUrls: ['./create-request-additional-details.component.scss']
})
export class CreateRequestAdditionalDetailsComponent implements OnInit {
  //#region (global variable declaration)
  @Input() additionalDetailsForm!: UntypedFormGroup

  languagesList: any[] = []
  filteredLanguages: any[] = []
  searchText: string = ''
  addedAuthersList: Auther[] = []
  //#endregion (global variable declaration)

  constructor() { }

  ngOnInit(): void {
    this.initialization()
  }

  initialization() {
    this.additionalDetailsForm.addControl('searchLanguage', new FormControl(''))
    this.getLainguagesList()
  }

  getLainguagesList(): void {
    this.languagesList = [
      { displayName: 'English', value: 'English' },
      { displayName: 'Hindi', value: 'Hindi' },
      { displayName: 'Marathi', value: 'Marathi' },
      { displayName: 'Tamil', value: 'Tamil' },
      { displayName: 'Telugu', value: 'Telugu' },
      { displayName: 'Kannada', value: 'Kannada' },
      { displayName: 'Malayalam', value: 'Malayalam' },
      { displayName: 'Bengali', value: 'Bengali' },
      { displayName: 'Gujarati', value: 'Gujarati' },
      { displayName: 'Punjabi', value: 'Punjabi' }
    ]
    this.filteredLanguages = [...this.languagesList]
  }

  onSearchChange(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase()
    this.filteredLanguages = this.languagesList.filter(lang =>
      lang.displayName.toLowerCase().includes(searchValue)
    )
  }

  onLanguageRemoved(languageValue: { displayName: string; value: string }): void {
    const control = this.additionalDetailsForm.get('courseLanguage')
    if (control) {
      const currentValues = Array.isArray(control.value) ? [...control.value] : []
      control.setValue(currentValues.filter((val: { displayName: string; value: string }) => val.value !== languageValue.value))
    }

  }

  onDropdownToggle(isOpen: boolean): void {
    if (isOpen) {
      this.additionalDetailsForm.get('searchLanguage')?.setValue('')
      this.filteredLanguages = [...this.languagesList]
    }
  }

  compareByValue(v1: any, v2: any): boolean {
    // Comparison function for mat-select with object values
    if (typeof v1 === 'string' && typeof v2 === 'string') {
      return v1 === v2
    }
    return v1 && v2 ? v1.value === v2.value : v1 === v2
  }

  trackByValue(index: number, item: any): any {
    console.log('Tracking item:', item, 'at index:', index)
    return item.value
  }

  onAvailableWithMDOChange(event: any): void {
    const selectedValue = event.value
    if (selectedValue === true) {
      this.openAddAutherDialog()
    } else {
      this.addedAuthersList = []
    }
  }

  openAddAutherDialog(): void {

  }

  controlValidationStatus(controlName: string, errorType: string): boolean {
    const control = this.additionalDetailsForm.get(controlName)
    if (!control) {
      return false
    }
    return control.touched && control.hasError(errorType)
  }
}
