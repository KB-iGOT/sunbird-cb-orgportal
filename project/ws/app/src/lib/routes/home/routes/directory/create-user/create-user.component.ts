import { Component, OnInit, ViewChild } from '@angular/core'
import { OrgHierarchyService } from '../../../services/org-hierarchy.service'
import { map } from 'rxjs/operators'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'
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

interface TabDetails {
  id: number
  name: string
  value: string
}

@Component({
  selector: 'ws-app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'roles', 'actions'];
  dataSource = new MatTableDataSource<UserData>([]);
  createUserTabs: TabDetails[] = [];
  createUser = false;
  orgData: any = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort
  selectedTab: any
  selectedUserData: any

  constructor(
    private orgSvc: OrgHierarchyService,
    private activeRouter: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const queryParam = _.get(this.activeRouter, 'snapshot.queryParams')
    if (queryParam) {
      this.orgData = queryParam
    }
    this.orgSvc.setConfigService(_.get(this.activeRouter, 'snapshot.data.configService'))
    this.getUserList('')
    this.createUserTabs = [
      // { id: 0, name: 'Bulk Creation', value: 'bulkCreation' },
      // { id: 1, name: 'Custom Registration Link', value: 'customRegLink' },
      { id: 2, name: 'Individual Creation', value: 'individualCreation' }
    ]
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  onSearchEnter(query: string) {
    this.getUserList(query)
  }

  getUserList(query: string) {
    return new Promise<boolean>((resolve) => {
      const payload = {
        request: {
          filters: {
            rootOrgId: this.orgData.roleId,
            status: 1
          },
          sort_by: {
            createdDate: "desc"
          },
          limit: 20,
          offset: 0,
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
          }
          resolve(true)
        },
        error: (err: any) => {
          console.error(err)
          resolve(false)
        },
        complete: () => {
          console.log('Request complete')
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }

  createNewUser() {
    this.createUser = !this.createUser
    this.selectedTab = this.createUserTabs.find(tab => tab.value === 'individualCreation')
    this.selectedUserData = ''
  }

  editUser(user: UserData) {
    this.selectedUserData = user
    this.createUser = true
    this.selectedTab = this.createUserTabs.find(tab => tab.value === 'individualCreation')
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
    this.createUser = false
  }
}
