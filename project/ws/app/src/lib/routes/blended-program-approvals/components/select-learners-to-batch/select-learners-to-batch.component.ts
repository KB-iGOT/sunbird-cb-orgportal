import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'
import { SelectionModel } from '@angular/cdk/collections'
import { OrgUserService } from '../../services/org-user.service'
import { ContentBatchService } from '../../services/content-batch.service'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'

import { SPACE, ENTER } from '@angular/cdk/keycodes'
import { SelectedUserDialogComponent } from '../selected-user-dialog/selected-user-dialog.component'
import * as _ from 'lodash'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator'

@Component({
  selector: 'ws-app-select-learners-to-batch',
  templateUrl: './select-learners-to-batch.component.html',
  styleUrls: ['./select-learners-to-batch.component.scss']
})
export class SelectLearnersToBatchComponent implements OnInit {
  filterForm!: UntypedFormGroup
  organisationList: any[] = []
  departmentList: string[] = []
  filterOrgList = this.organisationList
  filterDeptList = this.departmentList
  selectedOrgData: any = []
  selectedDeptData: any = []
  globalSearchText: any = ''
  selectedLearnersList: any = []
  globalSearchData: any = []
  displayedColumns: string[] = ['select', 'fullName', 'email', 'ministry', 'mobile']
  dataSource = new MatTableDataSource<any>([])
  selection = new SelectionModel<any>(true, [])
  filterCount: any
  showTable = false
  @Output() successUserData = new EventEmitter<any>()
  @Input() contentMeta: any
  @ViewChild(MatPaginator)
  paginator!: MatPaginator
  constructor(private orgSvc: OrgUserService,
    private dialog: MatDialog, private contentSvc: ContentBatchService) { }
  // ngAfterViewChecked(): void {
  //   throw new Error('Method not implemented.')
  // }

  @ViewChild('selectOrgg', { static: true }) selectOrgg: any
  @ViewChild('selectDeptt', { static: true }) selectDeptt: any

  @ViewChild('searchTextBox', { static: true }) searchTextBox: any
  @ViewChild('searchDeptTextBox', { static: true }) searchDeptTextBox: any

  ngOnInit() {
    this.successUserData.emit([])
    this.filterForm = new UntypedFormGroup({
      selectedOrg: new UntypedFormControl([], [Validators.required]),
      selectedDept: new UntypedFormControl([], [Validators.required]),
      userType: new UntypedFormControl(false, [Validators.required]),
    })
    this.getOrganisations()
    this.selectOrgg._handleKeydown = (event: any) => {
      if (event.keyCode === SPACE || event.keyCode === ENTER) {
        return
      }
      if (!this.selectOrgg.disabled) {
        this.selectOrgg.panelOpen
          ? this.selectOrgg._handleOpenKeydown(event)
          : this.selectOrgg._handleClosedKeydown(event)
      }
    }
    this.selectDeptt._handleKeydown = (event: any) => {
      if (event.keyCode === SPACE || event.keyCode === ENTER) {
        return
      }
      if (!this.selectDeptt.disabled) {
        this.selectDeptt.panelOpen
          ? this.selectDeptt._handleOpenKeydown(event)
          : this.selectDeptt._handleClosedKeydown(event)
      }
    }
  }

  onFilterOrg(event: any) {
    if (event.keyCode !== ENTER) {
      this.filterOrgList = this.searchOrg(event.target.value)
    }
  }

  searchOrg(value: string) {
    const filter = value.toLowerCase()
    return this.organisationList.filter(option => option.channel.toLowerCase().startsWith(filter))
  }

  onFilterDept(event: any) {
    if (event.keyCode !== ENTER) {
      this.filterDeptList = this.searchDept(event.target.value)
    }
  }

  searchDept(value: string) {
    const filter = value.toLowerCase()
    return this.departmentList.filter((option: any) => option.name.toLowerCase().startsWith(filter))
  }

  globalSearch(event: any) {
    if (this.filterForm) {
      this.filterForm.reset()
      this.filterForm.controls['userType'].setValue(false)
      this.filterForm.controls['userType'].updateValueAndValidity()
    }
    const text = event.target.value
    this.globalSearchData = []
    this.orgSvc.getUserSearchList(text).subscribe((res: any) => {
      if (res.count) {
        this.userDataToTable(res)
      }
    })
    this.selectedDeptData = []
    this.selectedOrgData = []
  }

  userDataToTable(userData: any) {
    this.globalSearchData = []
    // this.selection = new SelectionModel<any>(true, [])
    this.filterCount = userData.count
    userData.content.forEach((ele: any) => {
      const localData = {
        fullName: ele.firstName || ele.firstname,
        email: ele.profileDetails.personalDetails.primaryEmail,
        mobile: ele.profileDetails.personalDetails && ele.profileDetails.personalDetails.mobile || '-',
        ministry: ele.rootOrgName,
        status: 'Success',
        userId: ele.userId,
      }
      this.globalSearchData.push(localData)
    })
    this.dataSource.data = this.globalSearchData
    this.showTable = true
  }

  /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length
  //   const numRows = this.dataSource.data.length
  //   return numSelected === numRows
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  // toggleAllRows() {
  //   if (this.isAllSelected()) {
  //     this.selection.clear()
  //     return
  //   }
  //   this.selection.select(...this.dataSource.data)
  // }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: any): string {
  //   let returnValue: any
  //   if (!row) {
  //     returnValue = `${this.isAllSelected() ? 'deselect' : 'select'} all`
  //     return returnValue
  //   }
  //   returnValue = `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.fullName + 1}`
  //   return returnValue
  // }

  applyTableFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  // departments
  getOrganisations() {
    this.contentSvc.getOrgs().subscribe((res: any) => {
      this.organisationList = res
      this.filterOrgList = res
    })
  }
  getDepartments(orgId: any) {
    const request = {
      request: {
        orgIdList: orgId,
      },
    }
    this.contentSvc.getDepartments(request).subscribe((res: any) => {
      if (res && res.result && res.result.response && res.result.response.count) {
        this.departmentList = res.result.response.content
        this.filterDeptList = res.result.response.content
      } else {
        this.departmentList = []
        this.filterDeptList = []
      }
    }, (_err: any) => {
      this.departmentList = []
      this.filterDeptList = []
    })
  }
  selectOrg(event: any) {
    this.globalSearchText = ''
    if (event.isUserInput && event.source.selected === false) {
      const index = this.selectedOrgData.findIndex((list: any) => list.orgId === event.source.value.orgId)
      this.selectedOrgData.splice(index, 1)
      this.filterForm.controls['selectedOrg'].setValue(this.selectedOrgData)
      this.filterForm.controls['selectedOrg'].updateValueAndValidity()
    } else if (event.isUserInput && event.source.selected) {
      this.selectedOrgData.push(event.source.value)
      this.filterForm.controls['selectedOrg'].setValue(this.selectedOrgData)
      this.filterForm.controls['selectedOrg'].updateValueAndValidity()
    }
  }
  selectDepartment(event: any) {
    this.globalSearchText = ''
    if (event.isUserInput && event.source.selected === false) {
      const index = this.selectedDeptData.findIndex((list: any) => list.name === event.source.value.name)
      this.selectedDeptData.splice(index, 1)
      this.filterForm.controls['selectedDept'].setValue(this.selectedDeptData)
      this.filterForm.controls['selectedDept'].updateValueAndValidity()
    } else if (event.isUserInput && event.source.selected) {
      this.selectedDeptData.push(event.source.value)
      this.filterForm.controls['selectedDept'].setValue(this.selectedDeptData)
      this.filterForm.controls['selectedDept'].updateValueAndValidity()
    }
  }

  applyUserFilter(offset?: number) {
    this.globalSearchText = ''
    // this.selectedLearnersList = this.selection

    const deptNames: any = []
    this.filterForm.value.selectedDept.forEach((ele: any) => {
      deptNames.push(ele.name)
    })
    const orgNames: any = []
    this.filterForm.value.selectedOrg.forEach((ele: any) => {
      orgNames.push(ele.orgId)
    })
    const request: any = {
      request: {
        filters: {
          rootOrgId: orgNames,
          status: 1,
          'profileDetails.professionalDetails.designation': deptNames,
          ...(this.filterForm.value.userType ? { 'profileDetails.verifiedKarmayogi': this.filterForm.value.userType } : null),
        },
        fields: [
        ],
        limit: 10,
        offset: offset || 1,
      },
    }
    this.contentSvc.validateUser(request).subscribe((res: any) => {
      const response = res.result.response
      this.userDataToTable(response)
    })
  }
  checkData() {
    const data = this.selectedLearnersList
    this.dialog.open(SelectedUserDialogComponent, {
      width: '80vw',
      height: '90vh',
      data: {
        userData: data,
      },
    })
  }
  getNext(event: any) {
    this.applyUserFilter((event.pageIndex * event.pageSize))
  }
  openedChange(e: any) {
    if (e === true) {
      this.searchDeptTextBox.nativeElement.focus()
      this.searchDeptTextBox.nativeElement.value = ''
      const event = {
        target: {
          value: '',
        },
      }
      this.onFilterDept(event)
      if (this.selectedDeptData.length) {
        const filteredDeptLocalData: any = _.differenceBy(this.departmentList, this.selectedDeptData, 'name')
        this.departmentList = [...this.selectedDeptData, ...filteredDeptLocalData]
        this.filterDeptList = [...this.selectedDeptData, ...filteredDeptLocalData]
      }
    } else {

    }
  }
  openedChangeOrg(e: any) {
    if (e === true) {
      this.searchTextBox.nativeElement.focus()
      this.searchTextBox.nativeElement.value = ''
      const event = {
        target: {
          value: '',
        },
      }
      this.onFilterOrg(event)
      if (this.selectedOrgData.length) {
        const filteredData: any = _.differenceBy(this.organisationList, this.selectedOrgData, 'orgId')
        this.organisationList = [...this.selectedOrgData, ...filteredData]
        this.filterOrgList = [...this.selectedOrgData, ...filteredData]
      }
    } else {
      const orgId: any = []
      this.filterForm.value.selectedOrg.forEach((ele: any) => {
        orgId.push(ele.orgId)
      })
      this.selectedDeptData = []
      this.getDepartments(orgId)
    }
  }

  singleSelectUser() {
    // if (this.successUserData) {
    //   this.successUserData.emit(this.selectedLearnersList)
    // }
    return this.selection.selected
  }
  checkForSelectedUsers(rowData: any) {
    if (this.selectedLearnersList.length && this.selectedLearnersList.filter((ele: any) => ele.userId === rowData.userId).length) {
      return true
    }
    return false
  }

  // ngAfterViewChecked() {
  //   const show = this.singleSelectUser()
  //   if (show !== this.selectedLearnersList) { // check if it change, tell CD update view
  //     const uniqueData = _.uniqBy(show, 'userId')
  //     this.selectedLearnersList = uniqueData || []
  //     this.successUserData.emit(this.selectedLearnersList)
  //     this.cdRef.detectChanges()
  //   }
  // }
  changeFunc(event: any, rowData: any) {
    if (event.checked) {
      this.selectedLearnersList.push(rowData)
    } else {
      const index = this.selectedLearnersList.findIndex((list: any) => list.userId === rowData.userId)
      this.selectedLearnersList.splice(index, 1)
    }
    this.successUserData.emit(this.selectedLearnersList)
  }
  toggleAllRows(event: any) {
    const numRows = this.dataSource.data
    if (event.checked) {
      const results: any = numRows.filter(({ userId: id1 }) => !this.selectedLearnersList.some(({ userId: idd }: any) => idd === id1))
      this.selectedLearnersList = [...this.selectedLearnersList, ...results]
    } else {
      const results: any = this.selectedLearnersList.filter(({ userId: id1 }: any) => !numRows.some(({ userId: idd }: any) => idd === id1))
      this.selectedLearnersList = results
    }
    this.successUserData.emit(this.selectedLearnersList)
  }
  checkForSelectedUsersAll() {
    const numRows = this.dataSource.data
    let results: any = []
    if (this.selectedLearnersList.length) {
      results = this.selectedLearnersList.filter(({ userId: id1 }: any) => numRows.some(({ userId: idd }: any) => idd === id1))
    }
    return results.length === numRows.length
  }
}
