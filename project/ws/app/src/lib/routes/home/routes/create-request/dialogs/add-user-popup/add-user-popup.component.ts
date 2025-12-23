import { Component, OnInit } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { MatLegacyDialogRef } from '@angular/material/legacy-dialog'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { CreateRequestService } from '../../services/create-request.service'
import * as _ from 'lodash'
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators'

type Auther = {
  name: string,
  number: string,
  email: string,
}

@Component({
  selector: 'ws-app-add-user-popup',
  templateUrl: './add-user-popup.component.html',
  styleUrls: ['./add-user-popup.component.scss']
})
export class AddUserPopupComponent implements OnInit {

  authersForm!: UntypedFormGroup
  phoneNumberPattern = '^((\\+91-?)|0)?[0-9]{10}$'
  emailRegix = `^[\\w\-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`

  auhtersListMeta: any[] = []
  authersTotalCount: number = 0
  authersSearchText: string = ''
  authersOffset: number = 0
  authersLimit: number = 50
  authersLoading: boolean = false

  userProfile: any


  constructor(
    private dialogRef: MatLegacyDialogRef<AddUserPopupComponent>,
    private fb: UntypedFormBuilder,
    private configSvc: ConfigurationsService,
    private createRequestSvc: CreateRequestService
  ) { }

  ngOnInit(): void {
    this.initialization()
  }

  initialization(): void {
    this.authersForm = this.fb.group({
      name: ['', [Validators.required]],
      searchUser: [''],
      number: ['', [Validators.required, Validators.pattern(this.phoneNumberPattern)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.emailRegix)]]
    })
    this.userProfile = this.configSvc.userProfile

    let settingValueChange = true
    const searchUserControl = this.authersForm.get('searchUser')
    if (searchUserControl) {
      searchUserControl.valueChanges
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          startWith(''),
        ).subscribe((searchText: string) => {
          this.authersOffset = 0
          if (searchText && searchText.length > 1) {
            this.authersSearchText = searchText
            this.getAuthersMeta()
          } else if (!searchText) {
            if (!settingValueChange) {
              this.authersSearchText = this.authersSearchText
              this.getAuthersMeta()
            }
            this.checkCurrentAutherPresent()
          }
          settingValueChange = false
        })
    }
  }

  getAuthersMeta(): void {
    const formBody = {
      request: {
        filters: {
          'profileDetails.profileStatus': ['VERIFIED', 'NOT-VERIFIED'],
          rootOrgId: this.userProfile && this.userProfile.rootOrgId || "",
        },
        limit: this.authersLimit,
        offset: this.authersOffset * this.authersLimit,
        query: this.authersSearchText,
        sort_by: {
          firstName: "asc"
        }
      }
    }

    this.createRequestSvc.getUsers(formBody).subscribe({
      next: (response: any) => {
        this.authersLoading = false
        this.authersTotalCount = _.get(response, 'result.response.count', 0)
        const authers: Auther[] = _.get(response, 'result.response.content', []).map((auther: any) => ({
          name: auther.firstName,
          number: _.get(auther, 'profileDetails.personalDetails.mobile', ''),
          email: _.get(auther, 'profileDetails.personalDetails.primaryEmail', '')
        }))
        if (this.authersOffset === 0) {
          this.auhtersListMeta = authers
        } else {
          this.auhtersListMeta = [...this.auhtersListMeta, ...authers]
        }
        this.checkCurrentAutherPresent()
      },
      error: (error: any) => {
        this.authersLoading = false
        if (error) { }
      }
    })
  }

  setupScrollListener(opened: boolean): void {
    const searchAutherControl = this.authersForm.get('searchUser')
    if (opened && searchAutherControl) {
      searchAutherControl.setValue('')
      this.authersOffset = 0
      this.getAuthersMeta()
      const searchInput = document.querySelector('.search-input') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
      this.checkCurrentAutherPresent()
      const panel = document.querySelector('.mat-select-panel')
      if (panel) {
        panel.addEventListener('scroll', this.onAutherSelectScroll.bind(this))
      }
    }
  }

  onAutherSelectScroll(event: any): void {
    const element = event.target

    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 5) {
      if (!this.authersLoading && this.auhtersListMeta.length < this.authersTotalCount) {
        this.authersLoading = true
        this.authersOffset += 1
        this.getAuthersMeta()
      }
    }
  }

  checkCurrentAutherPresent() {

    const searchAutherControl = this.authersForm.get('name')
    const currentAuther = searchAutherControl ? searchAutherControl.value : ''
    if (currentAuther) {
      const autherExists = this.auhtersListMeta.some(
        (auther: any) => auther.name.toLowerCase() === currentAuther.toLowerCase()
      )

      if (!autherExists) {
        const newAuther = {
          name: currentAuther,
          status: 'Active'
        }
        this.auhtersListMeta.unshift(newAuther)
      }
    }
  }

  onAutherDropdownClosed(): void {
    const searchAutherControl = this.authersForm.get('searchUser')
    const nameControl = this.authersForm.get('name')
    if (searchAutherControl) {
      if (searchAutherControl.value && nameControl && (!nameControl.value || nameControl.value !== searchAutherControl.value)) {
        this.setName()
      }
      searchAutherControl.setValue('')
      this.authersSearchText = ''
    }
    this.checkCurrentAutherPresent()
  }

  setName() {
    const autherName = this.authersForm.get('searchUser')?.value
    if (autherName) {
      this.authersForm.get('name')?.setValue(autherName)
      this.setMobileAndEmail(undefined)
    }
  }

  setMobileAndEmail(selectedAuther: Auther | undefined) {
    if (selectedAuther) {
      this.authersForm.get('number')?.setValue(selectedAuther.number || '')
      this.authersForm.get('email')?.setValue(selectedAuther.email || '')
    } else {
      this.authersForm.get('number')?.setValue('')
      this.authersForm.get('email')?.setValue('')
    }
    // this.authersForm.get('number')?.markAsTouched()
    this.authersForm.get('number')?.updateValueAndValidity()
    // this.authersForm.get('email')?.markAsTouched()
    this.authersForm.get('email')?.updateValueAndValidity()
  }


  controlValidationStatus(controlName: string, errorType: string): boolean {
    const control = this.authersForm.get(controlName)
    if (!control) {
      return false
    }
    return control.touched && control.hasError(errorType)
  }

  numericOnly(event: any): boolean {
    const pattren = /^([0-9])$/
    const result = pattren.test(event.key)
    return result
  }

  submitAuthers() {
    if (this.authersForm.valid) {
      const autherData: Auther = {
        name: this.authersForm.get('name')?.value,
        number: this.authersForm.get('number')?.value,
        email: this.authersForm.get('email')?.value
      }
      this.closeDialog(autherData)
    }
  }

  closeDialog(data: Auther | undefined = undefined): void {
    this.dialogRef.close(data)
  }

}
