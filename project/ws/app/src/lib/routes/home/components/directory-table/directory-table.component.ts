import { Component, OnInit, ViewChild } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { DirectoryService } from '../../services/directory.service'
import * as _ from 'lodash'
import { DatePipe } from '@angular/common'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { InfoModalComponent } from '../info-modal/info-modal.component'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'ws-app-directory-table',
  templateUrl: './directory-table.component.html',
  styleUrls: ['./directory-table.component.scss']
})
export class DirectoryTableComponent implements OnInit {

  //#region (global variables)
  @ViewChild(MatPaginator) private paginator!: MatPaginator
  @ViewChild(MatSort, { static: true }) sort: MatSort | null = null;

  openCreateNavBar = false;
  filterSubject: BehaviorSubject<any> = new BehaviorSubject<any>('');
  moreThanTwoChar = false;
  searchValue: string = '';
  dialogRef: any
  customSelfRegistration = false
  selfRegistrationData: any = {}
  openMode = ''
  rowData: any
  dropdownList: {
    statesList: any[],
    ministriesList: any[]
  } = {
      statesList: [],
      ministriesList: [],
    }

  dataSource!: MatTableDataSource<any>
  tableData: any = [];
  formatedData: any = []
  wholeData2: any = []
  totalCount = 0

  //#region (pagination variables)
  pagination = { limit: 20, offset: 0 }
  pageIndex = 0
  length!: number
  pageSize = 20
  pageSizeOptions = [20, 30, 40]
  configData: any
  //#endregion (pagination variables)

  //#endregion (global variables)


  constructor(
    private directoryService: DirectoryService,
    private datePipe: DatePipe,
    private dialog: MatLegacyDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource<any>()
  }

  //#region (initialization)
  ngOnInit(): void {
    this.configData = _.get(this.activatedRoute, 'snapshot.data.configService', {})
    this.initializetableData()
    this.getAllDepartments('')
    this.initializeValuesAndAPIs()
  }

  initializetableData() {
    this.tableData = {
      columns: [
        { displayName: 'Organisation', key: 'organisation' },
        { displayName: 'Type', key: 'type' },
        { displayName: 'State/Center', key: 'stateOrMinistry' },
        { displayName: 'Created On', key: 'createdOn' },
      ],
      actions: [{ name: '', label: '', icon: 'remove_red_eye', type: 'menu' }],
      link: { name: 'generate_link', generateLabel: 'Generate Link', column: 'Custom Registration', viewLabel: 'View Link' },
      needCheckBox: false,
      needHash: false,
      sortColumn: '',
      sortState: 'asc',
      showNewNoContent: true,
      loader: true,
      tableDataCount: 0
    }
  }

  //#region (get all departments and formate the data for table)
  async getAllDepartments(queryText: any) {
    this.tableData.loader = true
    const query = queryText ? queryText : ''
    this.directoryService.getAllDepartmentsKong(query, this.pagination, this.configData?.orgReadData).subscribe(res => {
      this.wholeData2 = res.result.response.content
      this.tableData.tableDataCount = res.result.response.count
      this.totalCount = res.result.response.count
      this.tableData.loader = false
      this.getFormatedData()
    }, () => {
      this.tableData.loader = false
    })
  }

  getFormatedData() {
    const filteredData2: any[] = []
    this.wholeData2.forEach((element: any) => {
      let department = 'organisation'
      let orgType = element?.ministryorstatetype ? element?.ministryorstatetype.charAt(0).toUpperCase() + element?.ministryorstatetype.slice(1) :
        element?.ministryOrStateType ? element?.ministryOrStateType.charAt(0).toUpperCase() + element?.ministryOrStateType.slice(1) : ''
      const obj = {
        id: element.id,
        currentDepartment: department,
        type: orgType,
        user: element.noOfMembers || 0,
        head: department,
        typeid: element.organisationSubType,
        organisation: element.orgName,
        createdBy: element.createdBy,
        createdOn: this.transformDate(element.createdDate),
        channel: element.channel,
        logo: element.logo,
        description: element.description,
        qrRegistrationLink: element?.qrRegistrationLink || null,
        registrationLink: element?.registrationLink || null,
        startDateRegistration: element?.startDateRegistration || null,
        endDateRegistration: element?.endDateRegistration || null,
        stateOrMinistry: element?.ministryOrStateName || element?.ministryorstatename || null,

      }
      filteredData2.push(obj)
    })

    if (filteredData2.length > 0) {
      this.formatedData = filteredData2.map((dept: any) => {
        return {
          id: dept.id,
          mdo: dept.mdo,
          channel: dept.channel,
          type: dept.type,
          user: dept.user,
          head: dept.head,
          typeid: dept.typeid,
          createdBy: dept.createdBy,
          createdOn: dept.createdOn,
          organisation: dept.organisation,
          logo: dept.logo,
          description: dept.description,
          qrRegistrationLink: dept.qrRegistrationLink,
          registrationLink: dept.registrationLink,
          startDateRegistration: dept.startDateRegistration,
          endDateRegistration: dept.endDateRegistration,
          stateOrMinistry: dept.stateOrMinistry,
        }
      })
      this.formatedData = [...this.formatedData]
    }
    this.tableData.loader = false
    this.setDataSource()
  }

  setDataSource() {
    this.dataSource.data = this.formatedData
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
    this.length = this.tableData.tableDataCount
  }

  transformDate(dateString: string): string | null {
    const isoDateString = dateString
      .replace(' ', 'T')
      .replace(/:(\d{3})\+/, '.$1+')
      .replace(/(\+\d{2})(\d{2})$/, '$1:$2')

    return this.datePipe.transform(isoDateString, 'dd/MM/yyyy, hh:mm a')
  }
  //#endregion (get all departments and formate the data for table)

  initializeValuesAndAPIs() {
    // this.directoryService.getStatesOrMinisteries('state').subscribe(res => {
    //   if (res && res.result && res.result && res.result.response && res.result.response.content) {
    //     this.dropdownList.statesList = _.orderBy(res.result.response.content, ['orgName'], ['asc'])
    //   }
    // })

    this.directoryService.getStatesOrMinisteries('ministry').subscribe(res => {
      if (res && res.result && res.result && res.result.response && res.result.response.content) {
        this.dropdownList.ministriesList = _.orderBy(res.result.response.content, ['orgName'], ['asc'])
      }
    })
  }

  //#endregion (initialization)


  //#region (interactions)
  gotoCreateNew() {
    this.openCreateNavBar = true
    this.openMode = 'createNew'
    this.toggleOverlay(true)
    this.rowData = {}
  }

  editOrganization(data: any) {
    this.openCreateNavBar = true
    this.openMode = 'editMode'
    this.rowData = data
    this.toggleOverlay(true)
  }

  buttonClickAction() {
    this.openCreateNavBar = false
    this.customSelfRegistration = false
    this.toggleOverlay(false)
  }

  organizationCreatedEmit(_event: any) {
    setTimeout(() => {
      this.pageIndex = 0
      this.searchValue = ''
      this.getAllDepartments(this.searchValue)
    }, 1000)

  }

  getFinalColumns() {
    if (this.tableData !== undefined) {
      const columns = _.map(this.tableData.columns, c => c.key)
      if (this.tableData.needCheckBox) {
        columns.splice(0, 0, 'select')
      }
      if (this.tableData.needHash) {
        columns.splice(0, 0, 'SR')
      }
      if (this.tableData.actions && this.tableData.actions.length > 0) {
        columns.push('Actions')
      }
      if (this.tableData.link) {
        columns.push(this.tableData?.link?.column)
      }
      return columns
    }
    return ''
  }

  applyFilter(filterValue: any) {
    if (filterValue?.length === 0) {
      this.onSearchEnter('')
      this.filterSubject.next('')
    }
    if (filterValue?.length > 2) {
      this.moreThanTwoChar = true
    } else {
      this.moreThanTwoChar = false
    }
  }

  onEnterkySearch(enterValue: any) {
    this.pagination.offset = 0
    this.getAllDepartments(enterValue)
  }

  onSearchEnter(filterValue: any) {
    this.pageIndex = 0
    if (filterValue === '') {
      this.onEnterkySearch('')
    } else if (filterValue?.length > 2) {
      this.onEnterkySearch(filterValue)
    }
  }

  onRowClick(e: any) {
    this.goToRoute('users', e)
    // this.raiseTelemetryForRow('row', e)
  }

  generateCustRegistrationLink(row: any) {
    this.directoryService.getOrgReadData(row.id).subscribe((res: any) => {
      const frameworkId = _.get(res, 'frameworkid')

      if (frameworkId) {
        this.directoryService.getFrameworkInfo(frameworkId).subscribe({
          next: res => {
            const frameworkDetails = _.get(res, 'result.framework')
            if (frameworkDetails && Array.isArray(frameworkDetails.categories) && frameworkDetails.categories.length > 0) {
              const categoryDesignation = frameworkDetails.categories[0]

              if (
                categoryDesignation?.terms &&
                Array.isArray(categoryDesignation.terms) &&
                categoryDesignation.terms.length > 0 &&
                Array.isArray(categoryDesignation.terms[0]?.associations) &&
                categoryDesignation.terms[0].associations.length > 0
              ) {
                this.dialogRef = this.dialog.open(InfoModalComponent, {
                  panelClass: 'info-dialog',
                  data: { type: 'import-igot-master-review' }
                })
              } else {
                this.dialogRef = this.dialog.open(InfoModalComponent, {
                  panelClass: 'info-dialog',
                  data: { type: 'import-igot-master-create' }
                })
              }
              this.subscribeToAfterClosedModal(row)

            }

          },
          error: () => {
          },
        })

      } else {
        this.dialogRef = this.dialog.open(InfoModalComponent, {
          panelClass: 'info-dialog',
          data: { type: 'import-igot-master-create' }
        })
        this.subscribeToAfterClosedModal(row)
      }

    })

  }

  subscribeToAfterClosedModal(row: any) {
    this.dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.hasOwnProperty('reviewImporting') && !result.reviewImporting) {
        this.customSelfRegistration = true
        this.selfRegistrationData.title = 'Custom Self Registration'
        this.selfRegistrationData.QRGenerated = false
        this.selfRegistrationData.openMode = 'edit'
        this.selfRegistrationData.orgId = row.id
        this.selfRegistrationData.qrRegistrationLink = row.qrRegistrationLink
        this.selfRegistrationData.registrationLink = row.registrationLink
        this.selfRegistrationData.startDateRegistration = row.startDateRegistration
        this.selfRegistrationData.endDateRegistration = row.endDateRegistration
        this.selfRegistrationData.orgName = row.organisation

        this.toggleOverlay(true)
      }
      else if (result && result.reviewImporting || result.startImporting) {
        this.goToRoute('designation_master/import-designation', row)
      }
      else return

    })
  }

  toggleOverlay(showOverlay: boolean): void {
    const sidenav = document.querySelector('ws-app-home mat-sidenav') as HTMLElement
    if (sidenav) {
      sidenav.style.zIndex = showOverlay ? '0' : '2'
    }
  }

  goToRoute(type: string, data: any) {
    this.router.navigate([`app/home/roles/${data.id}/users`], {
      queryParams:
      {
        currentDept: 'organisation',
        roleId: data.id,
        depatName: data.channel,
        orgName: data.mdo || data.organisation,
        tab: type,
        subOrgType: 'ministry'
      }
    })
  }

  onOrgPageChange(event: any) {
    if (event) {
      this.pageIndex = event.pageIndex
      this.pagination.limit = event.pageSize
      this.pagination.offset = (event.pageIndex) * event.pageSize
      this.getAllDepartments(this.searchValue)
    }
  }


  //#endregion (interactions)

}
