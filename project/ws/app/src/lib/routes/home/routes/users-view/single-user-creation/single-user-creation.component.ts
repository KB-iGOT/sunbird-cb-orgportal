import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core'
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms'
import { MomentDateAdapter } from '@angular/material-moment-adapter'
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox'
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { HttpErrorResponse } from '@angular/common/http'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators'
/* tslint:disable */
import * as _ from 'lodash'
/* tslint:enable */
import { UsersService } from '../../../../users/services/users.service'
import { RolesService } from '../../../../users/services/roles.service'
import { ActivatedRoute } from '@angular/router'

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
}

// const EMAIL_PATTERN = /^[a-zA-Z0-9](\.?[a-zA-Z0-9_]+)*@[a-zA-Z0-9]*.[a-zA-Z]{2,}$/
// const EMAIL_PATTERN = /^[a-zA-Z0-9]+[a-zA-Z0-9._-]*[a-zA-Z0-9]+@[a-zA-Z0-9]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,4}$/
const EMAIL_PATTERN = /^[a-zA-Z0-9]+[a-zA-Z0-9._-]*[a-zA-Z0-9]+@[a-zA-Z0-9]+([-a-zA-Z0-9]*[a-zA-Z0-9]+)?(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,4}$/
const MOBILE_PATTERN = /^[0]?[6789]\d{9}$/
const PIN_CODE_PATTERN = /^[1-9][0-9]{5}$/

@Component({
  selector: 'ws-single-user-creation',
  templateUrl: './single-user-creation.component.html',
  styleUrls: ['./single-user-creation.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SingleUserCreationComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() selectedOrgData: any
  @Output() closeCreateuser = new EventEmitter<void>()

  @ViewChildren('rolesCheckbox') checkboxes!: QueryList<ElementRef>
  defaultRole = ['PUBLIC']
  private destroySubject$ = new Subject()
  separatorKeysCodes: number[] = [ENTER, COMMA]
  masterData: any = {}
  rolesArr: string[] = []
  fullProfile: any
  namePatern = `^[a-zA-Z\\s\\']{1,50}$`

  designationListLoadCount = 50
  designationDefaultLoadCount = 50
  isLoadingMoreDesignations = false;
  desigantionFilterEnable = false

  displayLoader = false
  isMdoLeader = false
  filteredRoles: string[] = []
  // emailRegix = `^[\\w\-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`
  userCreationForm = this.formBuilder.group({
    email: new UntypedFormControl('', [Validators.required, Validators.pattern(EMAIL_PATTERN)]),
    firstName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.namePatern)]),
    phone: new UntypedFormControl('', [Validators.required, Validators.pattern(MOBILE_PATTERN), Validators.minLength(10)]),
    channel: new UntypedFormControl(''),
    designation: new UntypedFormControl('', [Validators.required]),
    group: new UntypedFormControl('', [Validators.required]),
    dob: new UntypedFormControl(''),
    domicileMedium: new UntypedFormControl(''),
    gender: new UntypedFormControl(''),
    pincode: new UntypedFormControl('', [Validators.pattern(PIN_CODE_PATTERN)]),
    category: new UntypedFormControl(''),
    tags: new UntypedFormControl([]),
    roles: new UntypedFormControl([], [Validators.required]),
    searchDesignation: new UntypedFormControl('', [])
  })
  today = new Date()

  constructor(
    private formBuilder: UntypedFormBuilder,
    private usersService: UsersService,
    private matSnackBar: MatSnackBar,
    private rolesService: RolesService,
    private activatedRouter: ActivatedRoute
  ) {

    this.fullProfile = _.get(this.activatedRouter.snapshot, 'data.configService')

    if (this.userCreationForm.get('searchDesignation')) {
      // tslint:disable-next-line
      this.userCreationForm.get('searchDesignation')!.valueChanges
        .pipe(
          debounceTime(100),
          distinctUntilChanged(),
          startWith(''),
        )
        .subscribe(res => {
          if (res && res.length) {
            this.desigantionFilterEnable = true
            if (this.masterData && this.masterData.designation) {
              this.masterData.designation = this.masterData.designationBackup.filter((item: any) =>
                item.name.toLowerCase().includes(res && res.toLowerCase()))
            }
          } else {
            if (this.masterData && this.masterData.designationBackup) {
              this.masterData.designation = this.masterData.designationBackup.slice(0, this.designationDefaultLoadCount)
              this.desigantionFilterEnable = false
              this.checkCurrentDesignationPresent()
            }
          }
        })
    }

    if (this.userCreationForm.get('domicileMedium')) {
      // tslint:disable-next-line
      this.userCreationForm.get('domicileMedium')!.valueChanges
        .pipe(
          debounceTime(100),
          distinctUntilChanged(),
          startWith(''),
        )
        .subscribe(res => {
          if (this.masterData && this.masterData.language) {
            this.masterData.language = this.masterData.languageBackup.filter((item: any) =>
              item.name.toLowerCase().includes(res && res.toLowerCase()))
          }
        })
    }
  }

  ngOnInit() {
    if (this.selectedOrgData && this.selectedOrgData.roleId && !this.userCreationForm.contains('department')) {
      this.userCreationForm.addControl('department', new UntypedFormControl({ value: this.selectedOrgData.depatName, disabled: true }))
    }
    this.getDesignation()
    this.getMasterLanguages()
    this.getGroups()
    this.getOrgRolesList()
    const fullProfile = _.get(this.activatedRouter?.snapshot, 'data.configService')
    if (fullProfile?.unMappedUser && fullProfile?.unMappedUser?.roles) {
      this.isMdoLeader = fullProfile?.unMappedUser?.roles.includes('MDO_LEADER')
    }
  }

  ngAfterViewInit(): void {
    this.setDefaultValue()

  }

  setDefaultValue(): void {
    if (this.userCreationForm.get('roles')) {
      // tslint:disable-next-line
      this.userCreationForm.get('roles')!.patchValue(this.defaultRole)
    }
    this.userCreationForm.patchValue({
      channel: (this.fullProfile && this.fullProfile.unMappedUser.channel) || '',
    })
  }

  getDesignation(): void {
    this.usersService.getDesignations()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((_res: any) => {
        this.masterData['designation'] = _res.responseData.slice(0, this.designationDefaultLoadCount)
        this.masterData['designationBackup'] = _res.responseData
        // tslint:disable-next-line
      }, (_err: HttpErrorResponse) => {
        if (!_err.ok) {
          this.matSnackBar.open('Unable to fetch designation details, please try again later!')
        }
      })
  }

  getMasterLanguages(): void {
    this.usersService.getMasterLanguages()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((res: any) => {
        this.masterData['language'] = res.languages
        this.masterData['languageBackup'] = res.languages
        // tslint:disable-next-line
      }, (_err: HttpErrorResponse) => {
        if (!_err.ok) {
          this.matSnackBar.open('Unable to fetch master language details, please try again later!')
        }
      })
  }

  getGroups(): void {
    this.usersService.getGroups()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((res: any) => {
        this.masterData['group'] = res.result.response.filter((ele: any) => ele !== 'Others')
        // tslint:disable-next-line
      }, (_err: HttpErrorResponse) => {
        if (!_err.ok) {
          this.matSnackBar.open('Unable to fetch group data, please try again later!')
        }
      })
  }

  getOrgRolesList(): void {
    this.rolesService.getAllRoles()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((res: any) => {
        if (res && res.result && res.result.response.value) {
          this.masterData['rolesList'] = JSON.parse(res.result.response.value)
          if (Array.isArray(this.masterData.rolesList.orgTypeList)) {
            const mdoArray = this.masterData.rolesList.orgTypeList.find((elem: any) => elem.name === 'MDO')
            this.masterData['mdoRoles'] = mdoArray.roles || []
            // Filter based on isMdoLeader flag
            if (this.isMdoLeader) {
              this.filteredRoles = this.masterData?.mdoRoles  // show all roles
            } else {
              this.filteredRoles = this.masterData?.mdoRoles.filter((role: any) => role === 'PUBLIC')  // show only PUBLIC
            }
          }
        }
        // tslint:disable-next-line
      }, (_err: HttpErrorResponse) => {
        if (!_err.ok) {
          this.matSnackBar.open('Unable to fetch roles list, please try again later!')
        }
      })
  }

  handleRolesCheck(event: MatCheckboxChange, role: string): void {
    if (event.checked) {
      this.rolesArr.push(role)
    } else {
      if (this.rolesArr.indexOf(role) > -1) {
        this.rolesArr.splice(this.rolesArr.indexOf(role), 1)
      }
    }
    // tslint:disable-next-line
    this.userCreationForm.get('roles')!.patchValue([...this.defaultRole, ...this.rolesArr])
  }

  handleAddTags(event: MatChipInputEvent): void {
    const value = event.value as string
    // tslint:disable-next-line
    if (!this.userCreationForm.get('tags')!.value) {
      // tslint:disable-next-line
      this.userCreationForm.get('tags')!.patchValue([])
    }

    if ((value && value.trim()) && this.userCreationForm.get('tags')) {
      // tslint:disable-next-line
      this.userCreationForm.get('tags')!.value.push(value)
    }

    if (event.input) {
      event.input.value = ''
    }
  }

  handleValidTags(event: any): any {
    const charCode = event.charCode
    // tslint:disable-next-line
    return ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode == 8 || charCode == 32)
  }

  handleRemoveTag(tag: any): void {
    if (this.userCreationForm.get('roles')) {
      // tslint:disable-next-line
      const indexValue = this.userCreationForm.get('tags')!.value.indexOf(tag)
      if (indexValue > -1) {
        // tslint:disable-next-line
        this.userCreationForm.get('tags')!.value.splice(indexValue, 1)
      }
    }
  }

  handleFormClear(): void {
    this.userCreationForm.reset()
    this.checkboxes.forEach((elem: any) => {
      if (elem.value !== 'PUBLIC') {
        elem.checked = false
      }
    })
    // this.initForm()
    this.rolesArr = []
    this.setDefaultValue()
  }

  handleUserCreation(): void {
    this.displayLoader = true
    const dataToSubmit = { ...this.userCreationForm.value }
    if (dataToSubmit.dob) {
      // tslint:disable-next-line
      dataToSubmit.dob = `${new Date(dataToSubmit.dob).getDate()}-${new Date(dataToSubmit.dob).getMonth() + 1}-${new Date(dataToSubmit.dob).getFullYear()}`
    }

    if (this.selectedOrgData && this.selectedOrgData.roleId) {
      dataToSubmit.channel = this.selectedOrgData.depatName
    }

    if (!this.userCreationForm.value.channel) {
      this.matSnackBar.open('Channel info is empty! So unable to create user')
      return
    }

    const postData = {
      personalDetails: '',
    }
    postData.personalDetails = dataToSubmit
    this.usersService.createUser(postData)
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((_res: any) => {
        this.displayLoader = false
        this.matSnackBar.open('User created successfully!')
        this.handleFormClear()
        if (this.selectedOrgData && this.selectedOrgData.roleId) {
          this.closeCreateuser.emit()
        }
        // tslint:disable-next-line
      }, (_err: HttpErrorResponse) => {
        if (!_err.ok) {
          this.displayLoader = false
          this.matSnackBar.open(_.get(_err, 'error.params.errmsg') || 'Unable to create user, please try again later!')
        }
      })
  }

  updateUserData(): void {
    this.displayLoader = true
    const dataToSubmit = { ...this.userCreationForm.value }
    if (dataToSubmit.dob) {
      // tslint:disable-next-line
      dataToSubmit.dob = `${new Date(dataToSubmit.dob).getDate()}-${new Date(dataToSubmit.dob).getMonth() + 1}-${new Date(dataToSubmit.dob).getFullYear()}`
    }

    if (this.selectedOrgData && this.selectedOrgData.roleId) {
      dataToSubmit.channel = this.selectedOrgData.depatName
    }

    if (!this.userCreationForm.value.channel) {
      this.matSnackBar.open('Channel info is empty! So unable to create user')
      return
    }

    const postData = {
      personalDetails: '',
    }
    postData.personalDetails = dataToSubmit
    this.usersService.updateUserDetails(postData)
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((_res: any) => {
        this.displayLoader = false
        this.matSnackBar.open('User updated successfully!')
        this.handleFormClear()
        if (this.selectedOrgData && this.selectedOrgData.roleId) {
          this.closeCreateuser.emit()
        }
        // tslint:disable-next-line
      }, (_err: HttpErrorResponse) => {
        if (!_err.ok) {
          this.displayLoader = false
          this.matSnackBar.open(_.get(_err, 'error.params.errmsg') || 'Unable to update user, please try again later!')
        }
      })
  }

  ngOnDestroy(): void {
    this.destroySubject$.unsubscribe()
  }


  setupScrollListener(opened: boolean): void {
    if (opened) {
      this.desigantionFilterEnable = false
      this.designationListLoadCount = this.designationDefaultLoadCount // Reset the load count
      this.masterData.designation = this.masterData.designationBackup.slice(0, this.designationListLoadCount)
      this.checkCurrentDesignationPresent()
      if (this.userCreationForm.get('searchDesignation')) {
        this.userCreationForm.get('searchDesignation')!.setValue('')
      }
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }, 100)
      // Wait for the panel to be rendered in the DOM
      setTimeout(() => {
        // Find the panel element
        const panel = document.querySelector('.mat-select-panel')
        if (panel) {
          // Add scroll event listener to the panel
          panel.addEventListener('scroll', this.onDesignationSelectScroll.bind(this))
        }
      }, 100)
    }
  }

  onDesignationSelectScroll(event: any): void {
    const element = event.target
    if (!this.desigantionFilterEnable) {
      // Check if user has scrolled to the bottom (with a small threshold)
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 5) {
        // Only load more if not already loading and if there are potentially more items
        if (!this.isLoadingMoreDesignations && this.masterData.designationBackup.length > this.masterData.designation.length) {
          this.isLoadingMoreDesignations = true

          // Increase the load count by designationDefaultLoadCount
          this.designationListLoadCount += this.designationDefaultLoadCount

          // Update the filtered list with more items
          setTimeout(() => {
            this.masterData.designation = this.masterData.designationBackup.slice(0, this.designationListLoadCount)
            this.checkCurrentDesignationPresent()
            this.isLoadingMoreDesignations = false
          }, 500) // Small timeout to simulate loading and prevent multiple triggers
        }
      }
    }
  }


  checkCurrentDesignationPresent() {
    // Get the current designation value
    const currentDesignation = this.userCreationForm.get('designation')!.value
    // Check if current designation exists in the list
    if (currentDesignation) {
      const designationExists = this.masterData.designation.some(
        (designation: any) => designation.name.toLowerCase() === currentDesignation.toLowerCase()
      )

      // If designation doesn't exist in the list, add it
      if (!designationExists) {
        // Create a new designation object to match the structure of other items
        const newDesignation = {
          name: currentDesignation,
          // Add any other required properties matching your data structure
          id: 'custom-' + Date.now(),
          description: currentDesignation
        }
        // Make sure the custom designation appears in the filtered list
        if (this.masterData.designation.length >= this.designationListLoadCount) {
          // Replace the last item with the new one to maintain the same number of items
          this.masterData.designation.pop()
        }
        this.masterData.designation.unshift(newDesignation)
        this.isLoadingMoreDesignations = false
      }
    }
  }

  onDesignationDropdownClosed(): void {
    // Keep the designation value but clear the search input
    const currentDesignation = this.userCreationForm.get('designation')!.value
    setTimeout(() => {
      if (this.userCreationForm.get('searchDesignation')) {
        this.userCreationForm.get('searchDesignation')!.setValue('')
      }
      // Ensure the designation value remains selected
      if (currentDesignation) {
        const designationControl = this.userCreationForm.get('designation')
        if (designationControl) {
          designationControl.setValue(currentDesignation)
        }
      }
    }, 100)
  }

}
