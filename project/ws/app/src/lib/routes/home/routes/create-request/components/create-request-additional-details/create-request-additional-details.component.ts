import { Component, Input, OnInit } from '@angular/core'
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { AddUserPopupComponent } from '../../dialogs/add-user-popup/add-user-popup.component'
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators'
import { ProfileV2Service } from '../../../../services/home.servive'

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
  requestTypeList = ['Single', 'Broadcast']
  yesNoOptions = [
    { displayName: 'Yes', value: true },
    { displayName: 'No', value: false }
  ]
  filteredAssigneeType: any[] = []
  filteredRequestType: any[] = []
  requestTypeData: any[] = []
  demandId: any
  actionBtnName: string = ''
  requestObjData: any
  //#endregion (global variable declaration)

  constructor(
    private dialog: MatLegacyDialog,
    private homeService: ProfileV2Service
  ) { }

  ngOnInit(): void {
    this.initialization()
  }

  initialization() {
    this.additionalDetailsForm.addControl('searchLanguage', new FormControl(''))
    this.getLainguagesList()
    this.getRequestTypeList()
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
        // this.getRequestDataById()
        if (this.actionBtnName === 'view') {
          this.additionalDetailsForm.disable()
        } else if (this.actionBtnName === 'reassign') {
          this.additionalDetailsForm.disable()
          this.additionalDetailsForm.controls['assigneeText'].enable()
          this.additionalDetailsForm.controls['assignee'].enable()
        }
      }

    })
  }

  // getRequestDataById() {
  //   this.homeService.getRequestDataById(this.demandId).subscribe((data: any) => {
  //     if (data) {
  //       this.requestObjData = data
  //       this.setRequestData()
  //     }
  //   })
  // }

  // setRequestData() {
  //   this.requestForm.setValue({
  //     TitleName: this.requestObjData.title,
  //     Objective: this.requestObjData.objective,
  //     userType: this.requestObjData.typeOfUser ? this.requestObjData.typeOfUser : '',
  //     learningMode: this.requestObjData.learningMode ? this.requestObjData.learningMode : '',
  //     [this.compentencyKey.vKey]: [],
  //     referenceLink: this.requestObjData.referenceLink ? this.requestObjData.referenceLink : '',
  //     providers: [],
  //     assignee: {},
  //     requestType: this.requestObjData.requestType,
  //     compArea: '',
  //     providerText: '',
  //     queryThemeControl: '',
  //     querySubThemeControl: '',
  //     assigneeText: '',
  //   })
  //   const value = this.requestForm.controls[this.compentencyKey.vKey].value || []
  //   this.requestObjData.competencies.map((comp: any) => {
  //     const obj = {
  //       competencyArea: comp.area || comp.select_area,
  //       competencyTheme: comp.theme || comp.select_theme,
  //       competencySubTheme: comp.sub_theme || comp.select_sub_theme,
  //     }
  //     value.push(obj)
  //   })

  //   this.requestForm.controls[this.compentencyKey.vKey].setValue(value)

  //   this.selectRequestType(this.requestObjData.requestType)
  //   if (this.filteredRequestType) {
  //     if (this.requestObjData.preferredProvider && this.requestObjData.preferredProvider.length) {
  //       const prefferedData = this.filteredRequestType.filter(option =>
  //         this.requestObjData.preferredProvider.some((res: any) =>
  //           res.providerId === option.id
  //         )
  //       )
  //       if (prefferedData && prefferedData.length) {
  //         this.requestForm.controls['providers'].setValue(prefferedData)
  //       }
  //     }
  //   }

  //   if (this.filteredAssigneeType) {
  //     if (this.requestObjData.assignedProvider) {
  //       const assignData = this.filteredAssigneeType.find(option =>
  //         this.requestObjData.assignedProvider.providerId === option.id
  //       )
  //       if (assignData) {
  //         this.requestForm.controls['assignee'].setValue(assignData)
  //       }
  //     }
  //   }
  // }

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

  clearSearch() {
    this.getControl('searchLanguage')?.setValue('')
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
    } else {
      this.addedAuthersList = []
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
      if (result) {
        this.addedAuthersList.push(result)
        console.log('Added Authers List:', this.addedAuthersList)
      }
    })
  }

  removeAuthor(index: number): void {
    if (this.addedAuthersList && this.addedAuthersList.length > 1) {
      this.addedAuthersList.splice(index, 1)
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
