import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { OrgHierarchyService } from '../../../services/org-hierarchy.service'
import { UsersService } from '../../../../users/services/users.service'
import { map } from 'rxjs/operators'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import * as _ from 'lodash'
import { ActivatedRoute } from '@angular/router'

interface UserData {
  firstName?: string
  lastName?: string
  email?: string
  roles?: string[]
  id?: string
}

@Component({
  selector: 'ws-app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  providers: [MatPaginatorIntl],
  standalone: false
})
export class CreateUserComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'roles', 'actions'];
  dataSource = new MatTableDataSource<UserData>([]);
  orgData: any = {};
  editUser: boolean = false
  isNgo: boolean = false
  totalUsersCount = 0
  actualUsersCount = 0
  pageIndex = 0
  pageSize = 5
  currentQuery = ''
  searchValue = ''
  totalUsersLimit: number

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort
  selectedTab: any
  selectedUserData: any

  @Output() createUser = new EventEmitter<any>()

  constructor(
    private orgSvc: OrgHierarchyService,
    private activeRouter: ActivatedRoute,
    private usersSvc: UsersService,
    private paginatorIntl: MatPaginatorIntl
  ) {
    this.totalUsersLimit = this.usersSvc.TOTAL_USERS_LIMIT
    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 of ${this.actualUsersCount || length}`
      }
      const start = page * pageSize + 1
      const end = Math.min((page + 1) * pageSize, length)
      return `${start} – ${end} of ${this.actualUsersCount || length}`
    }
  }

  ngOnInit(): void {
    const queryParam = _.get(this.activeRouter, 'snapshot.queryParams')
    if (queryParam) {
      this.orgData = queryParam
    }
    this.orgSvc.setConfigService(_.get(this.activeRouter, 'snapshot.data.configService'))
    this.getUserList('')
    const parentOrgData = this.orgSvc.getOrgData()
    this.isNgo = parentOrgData?.isNgo || false
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  onSearchEnter(query: string) {
    this.currentQuery = query || ''
    this.getUserList(this.currentQuery, 0, this.pageSize)
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    this.getUserList(this.currentQuery, event.pageIndex, event.pageSize)
  }

  getUserList(query: string, pageIndex: number = 0, pageSize: number = this.pageSize) {
    return new Promise<boolean>((resolve) => {
      this.pageIndex = pageIndex
      if (this.paginator) {
        this.paginator.pageIndex = pageIndex
      }
      const payload = {
        request: {
          filters: {
            rootOrgId: this.orgData.roleId,
            status: 1
          },
          sort_by: {
            createdDate: 'desc'
          },
          limit: pageSize,
          offset: pageIndex * pageSize,
          query: query || ''
        }
      }

      this.orgSvc.getOrgUserListV1(payload).pipe(
        map((data: any) => {
          return data.result.response
        })
      ).subscribe({
        next: (res: any) => {
          if (res && res.content) {
            res.content = this.getRoles(res.content)
            this.dataSource.data = res.content
            this.actualUsersCount = res.count || res.content.length
            // Navigation is restricted to the API's reachable window
            this.totalUsersCount = Math.min(this.actualUsersCount, this.totalUsersLimit)
          }
          resolve(true)
        },
        error: (err: any) => {
          console.error(err)
          resolve(false)
        },
        complete: () => {
        }
      })
    })
  }

  getRoles(data: any) {
    if (data && data.length > 0) {
      data.forEach((ele: any) => {
        if (ele.organisations && ele.organisations.length) {
          ele.roles = ele.organisations[0].roles
        }
      })
    }
    return data
  }

  getFullName(user: UserData): string {
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    return `${firstName} ${lastName}`.trim()
  }

  createNewUser() {
    this.createUser.emit(true)
  }

  showEditUser(user: UserData) {
    this.selectedUserData = user
    this.editUser = true
  }

  deleteUser(user: UserData) {
    console.log('Delete user:', user)
    // Implement delete functionality
  }

  onTabChange(item: any) {
    this.selectedTab = item
  }

  closeCreate() {
    this.getUserList('')
  }

  emailTransform(value: any): any {
    // return value.split('.').join('[dot]').replace('@', '[at]')
    if (value !== undefined) {
      return value?.profileDetails?.personalDetails?.primaryEmail?.replace(/\./g, '[dot]').replace('@', '[at]')
    }

  }

  getRoleList(roles: any) {
    if (roles && roles.length > 0) {
      // tslint:disable-next-line
      return _.join(_.map(roles, role => `<li>${role}</li>`), '')
    }
    return []
  }

  updateUserStatus(_event: any) {
    switch (_event?.toLowerCase()) {
      case 'cancel':
      case 'updated':
        this.selectedUserData = ''
        this.editUser = false
        this.getUserList('')
        break
    }
  }

}
