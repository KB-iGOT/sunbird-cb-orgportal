import { Component, OnInit } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { DirectoryService } from '../../services/directory.service'
import * as _ from 'lodash'
import { DatePipe } from '@angular/common'

@Component({
  selector: 'ws-app-directory-table',
  templateUrl: './directory-table.component.html',
  styleUrls: ['./directory-table.component.scss']
})
export class DirectoryTableComponent implements OnInit {

  //#region (global variables)
  openCreateNavBar = false;
  filterSubject: BehaviorSubject<any> = new BehaviorSubject<any>('');
  moreThanTwoChar = false;

  tableData: any = [];
  formatedData: any = []
  wholeData2: any = []
  totalCount = 0

  //#region (pagination variables)
  pagination = { limit: 20, offset: 0 }
  pageIndex = 0
  //#endregion (pagination variables)

  //#endregion (global variables)


  constructor(
    private directoryService: DirectoryService,
    private datePipe: DatePipe
  ) { }

  //#region (initialization)
  ngOnInit(): void {
    this.initializetableData()
    this.getAllDepartments('')
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

  getAllDepartments(queryText: any) {
    this.tableData.loader = true
    const query = queryText ? queryText : ''
    this.directoryService.getAllDepartmentsKong(query, this.pagination).subscribe(res => {
      this.wholeData2 = res.result.response.content
      this.tableData.tableDataCount = res.result.response.count
      this.totalCount = res.result.response.count
      this.tableData.loader = false
      this.getFormatedData()
      // if (this.departmentHearders && this.departmentHearders.length) {
      //   this.getDepartDataByKey(this.currentFilter)
      // } else {
      //   this.tableData.loader = false
      // }
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
  }

  transformDate(dateString: string): string | null {
    const isoDateString = dateString
      .replace(' ', 'T')
      .replace(/:(\d{3})\+/, '.$1+')
      .replace(/(\+\d{2})(\d{2})$/, '$1:$2')

    return this.datePipe.transform(isoDateString, 'dd/MM/yyyy, hh:mm a')
  }

  //#endregion (initialization)


  //#region (interactions)
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


  //#endregion (interactions)

}
