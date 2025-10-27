import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatSelect } from '@angular/material/select'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import _ from 'lodash'
import { Subject, of } from 'rxjs'
import { switchMap, finalize } from 'rxjs/operators'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { BulkUploadOrgComponent } from '../../bulk-upload-org/bulk-upload-org.component'
import { OrgHierarchyService } from '../../../../services/org-hierarchy.service'
import { environment } from '../../../../../../../../../../../src/environments/environment'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'

@Component({
  selector: 'ws-app-org-hierarchy-mapping',
  templateUrl: './org-hierarchy-mapping.component.html',
  styleUrls: ['./org-hierarchy-mapping.component.scss']
})
export class OrgHierarchyMappingComponent implements OnInit, AfterViewInit {
  @ViewChild('singleSelect') singleSelect!: MatSelect
  @ViewChild('searchInput') searchInput!: ElementRef
  @ViewChild('fileInput') fileInput!: ElementRef

  orgTypeList = [
    { name: 'Center', value: 'ministry' },
    { name: 'State', value: 'state' },
  ]
  private destroy$ = new Subject<void>();
  bulkUploadRefresh: boolean = false
  orgSearchData: any
  orgReadData: any
  allOrganizations = [];

  defaultOrgConfig = {
    config: [{
      index: 1,
      category: 'competencyarea',
      icon: 'person',
      color: '#F8B861',
      createBtnEnabled: false,
      iconEnabled: false,
      levelNameEdit: true,
      // categoryDisplayName: 'Competency Area',
      // labelName: 'Competency Area',
      enableManageOrganization: true,
      enableUpdateHierarchy: true,
      enabaleRemoveConnection: true,
      enableThreeDot: true,
      showSearch: true,
      addOrgEnabled: true,
      enableInfoIcon: true
    }]
  }

  environmentVal: any = environment

  filteredOrganizations: any[] = [];
  selectedOrgType: string = 'state'; // Default selected organization type

  // Form controls
  public organizationCtrl: FormControl = new FormControl();
  public searchControl: FormControl = new FormControl();
  parentOrgReadData: any

  constructor(
    private snackbar: MatSnackBar,
    private orgHieService: OrgHierarchyService,
    private loaderService: LoaderService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  get userRoles() {
    return _.get(this.activeRoute, 'snapshot.parent.data.configService.userRoles')
  }
  get orgId() {
    return _.get(this.activeRoute, 'snapshot.parent.data.configService.userProfile.rootOrgId')
  }

  ngOnInit() {
    // Initialize with all organizations
    this.filteredOrganizations = [...this.allOrganizations]
    this.getOrgReadAndDetails()
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  ngAfterViewInit() {
    // When the dropdown is opened, focus on the search input
    this.singleSelect?.openedChange.subscribe(opened => {
      if (opened) {
        setTimeout(() => {
          this.searchInput.nativeElement.focus()
        })
      } else {
        // Optional: Reset search when dropdown closes
        this.searchControl.setValue('')
      }
    })
  }

  filterOrganizations(value: string) {
    if (!value) {
      this.filteredOrganizations = [...this.allOrganizations]
      return
    }

    const filterValue = value.toLowerCase()
    this.filteredOrganizations = this.allOrganizations.filter((org: any) =>
      org.orgName.toLowerCase().includes(filterValue)
    )
  }

  orgSelected(event: any) {
    this.organizationCtrl.reset()
    if (event !== this.selectedOrgType) {
      this.selectedOrgType = event
      this.getCentenrOrStateList(this.selectedOrgType)
    }
  }

  async getCentenrOrStateList(orgType: string, value?: string) {
    let requestBody = {
      request: {
        filters: {
          status: 1,
          sbOrgType: '',
        },
        sort_by: {
          createdDate: "desc"
        },
        query: value || '',
        limit: 200,
        offset: 0,
        fields: [
          'identifier',
          'orgName',
          'description',
          'parentOrgName',
          'orgHierarchyFrameworkId',
          'orgHierarchyFrameworkStatus',
          'sbOrgType',
          'sbOrgSubType'
        ]
      }
    }
    if (orgType === 'ministry') {
      requestBody.request.filters.sbOrgType = 'ministry'
    } else if (orgType === 'state') {
      requestBody.request.filters.sbOrgType = 'state'
    }
    this.loaderService.changeLoaderState(true)
    const listRes = await this.orgHieService.getCenterOrStateList(requestBody).toPromise().catch(_err => {
      this.loaderService.changeLoaderState(false)
    })
    if (listRes && listRes.result && listRes.result.response &&
      listRes.result.response.content && listRes.result.response.content.length > 0
    ) {
      this.loaderService.changeLoaderState(false)
      this.allOrganizations = listRes.result.response.content
      this.filteredOrganizations = [...this.allOrganizations]
    } else {
      this.loaderService.changeLoaderState(false)
      this.allOrganizations = []
      this.filteredOrganizations = []
      // this.snackbar.open(`No organizations found for ${orgType}`)

    }
  }

  getOrgDetails(): any {
    if (!this.organizationCtrl.value ||
      (!this.checkIfMdoL0() &&
        !this.checkIfParentIsMdoL0() &&
        !this.filteredOrganizations?.length && !this.checkIfMdoL0Admin())) {
      return null
    }
    let selectedOrg: any
    if (this.checkIfMdoL0()) {
      selectedOrg = this.orgReadData
    } else if (!this.checkIfMdoL0() && this.checkIfMdoL0Admin()) {
      selectedOrg = this.orgReadData
    } else if (!this.checkIfMdoL0() && this.checkIfParentIsMdoL0()) {
      selectedOrg = this.parentOrgReadData
    } else {
      selectedOrg = this.filteredOrganizations.find(organization =>
        organization.identifier === this.organizationCtrl.value
      ) || null
    }
    return selectedOrg
  }

  hasOrgHierarchyFrameworkId(): boolean {
    if (!this.organizationCtrl?.value) {
      return false
    }
    let selectedOrg: any
    if (this.checkIfMdoL0()) {
      selectedOrg = this.orgReadData
    } else if (!this.checkIfMdoL0() && this.checkIfMdoL0Admin()) {
      selectedOrg = this.orgReadData
    } else if (!this.checkIfMdoL0() && this.checkIfParentIsMdoL0()) {
      selectedOrg = this.parentOrgReadData
    } else {
      selectedOrg = this.filteredOrganizations.find(org => org.identifier === this.organizationCtrl.value)
    }
    return !!selectedOrg && !!selectedOrg.orgHierarchyFrameworkId
  }

  cancelHierarchyCreation() {
    this.organizationCtrl.reset()
    this.filteredOrganizations = [...this.allOrganizations]
    this.singleSelect?.close()
  }

  async createNewHierarchy() {
    const selectedOrg = (this.checkIfMdoL0()) ? this.orgReadData : this.getOrgDetails()
    if (selectedOrg) {
      const requestBody = {
        frameworkName: `org_hierarchy`,
        identifier: (this.checkIfMdoL0()) ? selectedOrg.id : selectedOrg.identifier
      }
      this.loaderService.changeLoaderState(true)
      const createFrameworkData = await this.orgHieService.createMasterFrameWork(requestBody).toPromise().catch(_err => {
        this.loaderService.changeLoaderState(false)
        if (_err && _err.error && _err.error.params && _err.error.params.errMsg) {
          this.snackbar.open(`${_err.error.params.errMsg}`)
          this.cancelHierarchyCreation()
        }
      })
      if (createFrameworkData && createFrameworkData.result && createFrameworkData.result.framework) {
        this.cancelHierarchyCreation()
        setTimeout(() => {
          this.loaderService.changeLoaderState(false)
          if (!this.checkIfMdoL0()) {
            this.getCentenrOrStateList(this.selectedOrgType)
            this.organizationCtrl.setValue(selectedOrg.identifier)
          }
          this.snackbar.open(`Framework created successfully for ${selectedOrg.orgName}`)
        }, 2000)
      } else {
        this.loaderService.changeLoaderState(false)
        this.snackbar.open(`Failed to create framework for ${selectedOrg.orgName}`)
      }
    }
  }

  checkloader($event: boolean) {
    this.loaderService.changeLoaderState($event)
  }

  redirectOrg(event: any) {
    this.router.navigate([`/app/home/roles/${event.additionalProperties.orgId}/users`], {
      queryParams:
      {
        currentDept: 'organisation',
        roleId: event.additionalProperties.orgId,
        depatName: event.name,
        orgName: event.name,
        tab: 'users',
        // subOrgType: !this.isAllowed(this.allowedCreateRoles) ? 'ministry' : role.data.type ? role.data.type : 'cbp-providers'
        // subOrgType: !this.isAllowed(this.allowedCreateRoles) ? 'ministry' : role.data.type ? role.data.type : 'ministry'
        subOrgType: (this.checkIfMdoL0()) ? 'state' : this.selectedOrgType
      }
    })
  }

  async downloadTemplate() {
    const frameworkData: any = this.getselectedOrgData()
    if (frameworkData && frameworkData.orgHierarchyFrameworkId) {
      this.loaderService.changeLoaderState(true)
      const fileData: any = await this.orgHieService.downloadSampleTemplate(frameworkData.orgHierarchyFrameworkId).toPromise().catch(_err => {
        this.loaderService.changeLoaderState(false)
        if (_err && _err.error && _err.error.params && _err.error.params.errMsg) {
          this.snackbar.open(`${_err.error.params.errMsg}`)
        }
      })
      if (fileData) {
        this.snackbar.open(`Download successfully`)
      }
    }
  }

  async exportData() {
    const frameworkData: any = this.getselectedOrgData()
    if (frameworkData && frameworkData.orgHierarchyFrameworkId) {
      this.loaderService.changeLoaderState(true)
      const fileData: any = await this.orgHieService.exportFramework(frameworkData.orgHierarchyFrameworkId).toPromise().catch(_err => {
        this.loaderService.changeLoaderState(false)
        if (_err && _err.error && _err.error.params && _err.error.params.errMsg) {
          this.snackbar.open(`${_err.error.params.errMsg}`)
        }
      })
      if (fileData) {
        this.snackbar.open(`Exported successfully for ${frameworkData.orgName}`)
      }
    }
  }

  getselectedOrgData() {
    if (this.checkIfMdoL0()) {
      return this.orgReadData
    } else {
      if (this.allOrganizations.filter((v: any) => v.identifier === this.organizationCtrl.value).length) {
        return this.allOrganizations.filter((v: any) => v.identifier === this.organizationCtrl.value)[0]
      }
    }
    return null
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!this.isValidExcelFile(file)) {
        this.showMessage('Please select a valid Excel file (.xlsx)')
        this.clearFileInput()
        return
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('File size should not exceed 5MB')
        this.clearFileInput()
        return
      }
      this.uploadExcelFile(file)
    }
  }

  isValidExcelFile(file: File): boolean {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    console.log('File type: ', allowedTypes)
    return allowedTypes.includes(file.type)
  }

  async uploadExcelFile(file: File) {
    // Create form data
    const formData = new FormData()
    formData.append('file', file)
    this.loaderService.changeLoaderState(true)
    this.bulkUploadRefresh = true
    const uploadFileRes = await this.orgHieService.uploadFreameworkTemplate(formData, this.getselectedOrgData()).toPromise().catch((_err: any) => {
      this.loaderService.changeLoaderState(false)
      this.bulkUploadRefresh = false
      if (_err && _err.error && _err.error.params && _err.error.params.errMsg) {
        this.snackbar.open(`${_err.error.params.errMsg}`)
      }
    })

    if (uploadFileRes && uploadFileRes.result && uploadFileRes.result.fileName) {
      this.loaderService.changeLoaderState(false)
      this.snackbar.open(`File uploaded successfully. Please check after 5 minutes for the results.`)
    }
  }

  clearFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''
    }
  }

  showMessage(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: 5000,
    })
  }

  checkIfMdoL0() {
    const userRoles = this.orgHieService.getUserRoles()
    return ((this.parentOrgReadData?.sbOrgType?.toLowerCase() === 'ministry' ||
      this.parentOrgReadData?.sbOrgType?.toLowerCase() === 'state') && userRoles.has('mdo_leader'))
  }

  checkIfMdoL0Admin() {
    const userRoles = this.orgHieService.getUserRoles()
    return ((this.parentOrgReadData?.sbOrgType?.toLowerCase() === 'ministry' ||
      this.parentOrgReadData?.sbOrgType?.toLowerCase() === 'state') && userRoles.has('mdo_admin'))
  }

  checkIfParentIsMdoL0() {
    return (this.parentOrgReadData?.sbOrgType?.toLowerCase() === 'ministry' ||
      this.parentOrgReadData?.sbOrgType?.toLowerCase() === 'state')
  }

  getOrgReadAndDetails() {
    const requestBody = {
      request: {
        organisationId: this.orgId,
      }
    }
    this.loaderService.changeLoaderState(true)
    this.orgHieService.getOrgReadData(requestBody).pipe(
      switchMap((res: any) => {
        if (res && res.params && res.params.status.toLowerCase() === 'success') {
          this.orgReadData = res.result?.response || null
          if (res.result?.response && res.result?.response?.ministryOrStateType?.toLowerCase() === 'ministry') {
            const reqBody = {
              request: {
                organisationId: res.result?.response?.ministryOrStateId || '',
              }
            }
            return this.orgHieService.getOrgReadData(reqBody).pipe(
              switchMap((parentRes: any) => {
                this.parentOrgReadData = parentRes.result?.response || null
                if (this.parentOrgReadData) {
                  const secondRequestBody = {
                    request: {
                      filters: {
                        status: 1,
                        ministryOrStateType: this.parentOrgReadData.sbOrgType,
                        ministryOrStateId: this.parentOrgReadData.ministryOrStateId
                      }
                    }
                  }
                  this.organizationCtrl.setValue(this.parentOrgReadData.ministryOrStateId)
                  return this.orgHieService.getOrganizationDetails(secondRequestBody)
                } else {
                  return of(null)
                }
              })
            )
          } else {
            this.orgReadData = res.result?.response || null
            if (this.orgReadData) {
              const secondRequestBody = {
                request: {
                  filters: {
                    status: 1,
                    ministryOrStateType: this.orgReadData.sbOrgType,
                    ministryOrStateId: this.orgReadData.rootOrgId
                  }
                }
              }
              this.organizationCtrl.setValue(this.orgReadData.rootOrgId)
              return this.orgHieService.getOrganizationDetails(secondRequestBody)
            }
          }
        }
        this.loaderService.changeLoaderState(false)
        if (res?.error?.params?.errMsg) {
          this.snackbar.open(`${res.error.params.errMsg}`)
        }
        return of(null)
      }),
      finalize(() => this.loaderService.changeLoaderState(false))
    ).subscribe({
      next: (detailsRes: any) => {
        if (detailsRes && detailsRes.result && detailsRes.result.content) {
          this.orgSearchData = detailsRes.result.content
        }
      },
      error: (err: any) => {
        console.error('Error in API chain:', err)
        if (err?.error?.params?.errMsg) {
          this.snackbar.open(`${err.error.params.errMsg}`)
        }
      }
    })
  }

  openBulkUploadDialog() {
    const bulkUploadConfig = {
      mainHeading: '',
      sampleFileDownloadInstructuons: {
        title: 'Open & follow these instruction',
        instructions: [
          'Keep the row of the items you wish to process',
          'Keep the row of the items you wish to process',
          'Delete the entire row you donot intend to process'
        ],
      },
      sampleFileDownloadText: 'Download Sample File',
      supportedFileTypeText2: '',
      supportedFileTypeText: 'XLSX',
      maxFileSizeText: '100 MB',
      frameworkData: this.getselectedOrgData(),
    }
    this.bulkUploadRefresh = true
    const dialogRef = this.dialog.open(BulkUploadOrgComponent, {
      data: { bulkUploadConfig },
      position: { top: '60px' },
      height: '80%',
      width: '65%',
      panelClass: 'org-bulk-upload-dialog',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    })
    dialogRef.afterClosed().subscribe(async result => {
      if (this.checkIfMdoL0()) {
        await this.getOrgReadAndDetails()
      } else {
        await this.getCentenrOrStateList(this.selectedOrgType)
      }
      this.bulkUploadRefresh = false
      console.log('The dialog was closed', result)
    })
  }

}