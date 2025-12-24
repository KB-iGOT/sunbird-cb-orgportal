import { Component, Input, OnInit } from '@angular/core'
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { AddUserPopupComponent } from '../../dialogs/add-user-popup/add-user-popup.component'
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators'
import { ProfileV2Service } from '../../../../services/home.servive'
import { CreateRequestService } from '../../services/create-request.service'
import * as _ from 'lodash'

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
  @Input() viewMode: string = ''
  @Input() demandId: string | null = null

  languagesList: any[] = []
  filteredLanguages: any[] = []
  searchText: string = ''
  addedAuthersList: Auther[] = []
  requestTypeList = ['Single', 'Broadcast']
  yesNoOptions = [
    { displayName: 'Yes', value: true },
    { displayName: 'No', value: false }
  ]
  filteredAssigneeType: any[] = []
  filteredRequestType: any[] = []
  requestTypeData: any[] = []
  requestObjData: any
  //#endregion (global variable declaration)

  constructor(
    private dialog: MatLegacyDialog,
    private homeService: ProfileV2Service,
    private createRequestSvc: CreateRequestService
  ) { }

  ngOnInit(): void {
    this.initialization()
  }

  initialization() {
    this.additionalDetailsForm.addControl('searchLanguage', new FormControl(''))
    this.getLanguagesList()
    this.getRequestTypeList()
    const autherControl = this.getControl('authors')
    if (autherControl && autherControl.value && autherControl.value.length > 0) {
      this.addedAuthersList = autherControl.value
    }
  }

  getLanguagesList(): void {
    const req = {
      request: {
        type: "cbp-portal",
        subType: "cbp-v1",
        action: "cbp-configuration",
        component: "cbp",
        rootOrgId: "*"
      }
    }
    this.createRequestSvc.getLanguages(req).subscribe((res: any) => {
      this.languagesList = _.get(res, 'result.form.data.languages', [])
      this.filteredLanguages = [...this.languagesList]
      if (this.demandId) {
        const courseLanguageControl = this.getControl('courseLanguage')
        if (courseLanguageControl && courseLanguageControl.value && courseLanguageControl.value.length > 0) {
          const selectedLanguages = this.languagesList.filter((lang: any) => courseLanguageControl.value.some((cl: any) => cl === lang.value))
          courseLanguageControl.setValue(selectedLanguages)
          courseLanguageControl.updateValueAndValidity()
        }
      }
    })
  }

  getRequestTypeList() {
    const requestObj = {
      request: {
        filters: {
          isCbp: true,
        },
        limit: 1000,
      },
    }
    this.homeService.getRequestTypeList(requestObj).subscribe(data => {
      this.requestTypeData = data
      this.filteredRequestType = [...this.requestTypeData]
      this.filteredAssigneeType = [...this.requestTypeData]
      if (this.demandId) {
        const providersControl = this.getControl('providers')
        const assigneeControl = this.getControl('assignee')
        if (providersControl && providersControl.value && providersControl.value.length > 0) {
          const selcetdProvidersList = this.requestTypeData.filter((provider: any) => providersControl.value.some((p: any) => p.providerId === provider.id))
          providersControl.setValue(selcetdProvidersList)
          providersControl.updateValueAndValidity()
        }
        if (assigneeControl && assigneeControl.value && assigneeControl.value.providerId) {
          const selcetdAssignee = this.requestTypeData.filter((assignee: any) => assigneeControl.value.providerId === assignee.id)
          assigneeControl.setValue(selcetdAssignee ? selcetdAssignee[0] : null)
          assigneeControl.updateValueAndValidity()
        }
        // if (this.viewMode.toLocaleLowerCase() === 'reassign') {
        //   this.additionalDetailsForm.controls['assigneeText'].enable()
        //   this.additionalDetailsForm.controls['assignee'].enable()
        // }
      }

    })
  }

  valueChangeFunctions() {
    const assigneeTextControl = this.getControl('assigneeText')
    if (assigneeTextControl) {
      assigneeTextControl.valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        startWith(''),
      ).subscribe((newValue: any) => {
        this.filteredAssigneeType = this.filterOrgValues(newValue, this.requestTypeData)
      })
    }
  }

  filterOrgValues(searchValue: string, array: any) {
    return array.filter((value: any) =>
      value.orgName.toLowerCase().includes(searchValue.toLowerCase()))
  }

  clearSearch() {
    this.getControl('searchLanguage')?.setValue('')
    this.filteredLanguages = [...this.languagesList]
  }

  onSearchChange(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase()
    this.filteredLanguages = this.languagesList.filter(lang =>
      lang.name.toLowerCase().includes(searchValue)
    )
  }

  getFilteredLanguagesWithSelected(): any[] {
    const selectedLanguages = this.getControl('courseLanguage')?.value || []

    // Create a unique list combining filtered languages and selected languages
    const uniqueLanguages = new Map()

    // Add filtered languages
    this.filteredLanguages.forEach(lang => {
      uniqueLanguages.set(lang.value || lang.name, lang)
    })

    // Add selected languages (even if they don't match the current filter)
    selectedLanguages.forEach((selectedLang: any) => {
      if (selectedLang && (selectedLang.value || selectedLang.name)) {
        uniqueLanguages.set(selectedLang.value || selectedLang.name, selectedLang)
      }
    })

    // Convert back to array and sort by name
    return Array.from(uniqueLanguages.values()).sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    )
  }

  onLanguageRemoved(languageValue: { displayName: string; value: string }): void {
    const control = this.getControl('courseLanguage')
    if (control) {
      const currentValues = Array.isArray(control.value) ? [...control.value] : []
      control.setValue(currentValues.filter((val: { displayName: string; value: string }) => val.value !== languageValue.value))
    }

  }

  onDropdownToggle(isOpen: boolean): void {
    if (isOpen) {
      this.getControl('searchLanguage')?.setValue('')
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

  onAvailableWithMDOChange(event: any): void {
    const selectedValue = event.value
    if (selectedValue === true) {
      this.openAddAuthorDialog()
      const authorsControl = this.getControl('authors')
      if (authorsControl) {
        authorsControl.setValidators([Validators.required])
        authorsControl.updateValueAndValidity()
      }
    } else {
      this.addedAuthersList = []
      this.resetControlAndClearValidators('authors')
    }
  }

  openAddAuthorDialog(): void {
    const dialogRef = this.dialog.open(AddUserPopupComponent, {
      maxHeight: '90vh',
      width: '400px',
      maxWidth: '90%',
      disableClose: true
    })

    dialogRef.afterClosed().subscribe((result: Auther | undefined) => {
      const authorsControl = this.getControl('authors')
      if (result) {
        this.addedAuthersList.push(result)
        if (authorsControl) {
          authorsControl.setValue(this.addedAuthersList)
          authorsControl.updateValueAndValidity()
        }
      }
      authorsControl?.markAsDirty()
      authorsControl?.markAsTouched()
    })
  }

  removeAuthor(index: number): void {
    if (this.addedAuthersList && this.addedAuthersList.length > 1) {
      this.addedAuthersList.splice(index, 1)
      const authorsControl = this.getControl('authors')
      if (authorsControl) {
        authorsControl.setValue(this.addedAuthersList)
        authorsControl.updateValueAndValidity()
      }
    }
  }

  controlValidationStatus(controlName: string, errorType: string): boolean {
    const control = this.getControl(controlName)
    if (!control) {
      return false
    }
    return control.touched && control.hasError(errorType)
  }

  onRequiredFromKBChange(event: any): void {
    this.resetControlAndClearValidators('providers')
    this.resetControlAndClearValidators('assignee')
    this.resetControlAndClearValidators('requestType')
    if (event.value === false) {
      const requestTypeControl = this.getControl('requestType')
      if (requestTypeControl) {
        requestTypeControl.setValidators([Validators.required])
        requestTypeControl.updateValueAndValidity()
      }
    } else { }

  }

  selectRequestType(item: any) {
    this.resetControlAndClearValidators('assignee')
    this.resetControlAndClearValidators('providers')
    if (item === 'Single') {
      const assigneeControl = this.getControl('assignee')
      if (assigneeControl) {
        assigneeControl.setValidators([Validators.required])
        assigneeControl.updateValueAndValidity()
      }
    } else if (item === 'Broadcast') {
      const providersControl = this.getControl('providers')
      if (providersControl) {
        providersControl.setValidators([Validators.required])
        providersControl.updateValueAndValidity()
      }
    }

  }

  getControl(controlName: string): FormControl {
    return this.additionalDetailsForm.get(controlName) as FormControl
  }

  resetControlAndClearValidators(controlName: string) {
    const control = this.getControl(controlName)
    if (control) {
      control.reset()
      control.clearValidators()
      control.updateValueAndValidity()
    }
  }

  providersOpenedChange(e: any, searchControl: any) {
    this.getControl(searchControl).patchValue('')
    if (e === true) {
    }
  }

  onProviderRemoved(provider: any) {
    const compThemeControl = this.getControl('providers') as UntypedFormControl | null
    if (compThemeControl) {
      const themes = compThemeControl.value
      if (themes) {
        const index = themes.indexOf(provider)
        if (index >= 0) {
          themes.splice(index, 1)
          compThemeControl.setValue(themes)
        }
      }
    }
  }

  clearProviderSearch(event: any, searchControl: any) {
    event.stopPropagation()
    this.additionalDetailsForm.controls[searchControl].patchValue('')
  }

  isOptionDisabled(option: any): boolean {
    const control = this.getControl('providers')
    if (control && control.value) {
      const selectedProviders = control.value
      return selectedProviders.length >= 5 && !selectedProviders.includes(option)
    }
    return false
  }

}
