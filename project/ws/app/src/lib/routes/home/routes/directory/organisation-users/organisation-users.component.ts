import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import * as _ from 'lodash'

interface TabDetails {
  id: number
  name: string
  content?: any
  value?: string
}

@Component({
  selector: 'ws-app-organisation-users',
  templateUrl: './organisation-users.component.html',
  styleUrls: ['./organisation-users.component.scss']
})
export class OrganisationUsersComponent implements OnInit {
  selectedTabIndex = 0;
  tabs: TabDetails[] = [];
  orgData: any

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const queryParam = _.get(this.activatedRoute, 'snapshot.queryParams')
    if (queryParam) {
      this.orgData = queryParam
    }
    this.tabs = [
      { id: 0, name: 'Users', value: 'users' },
      { id: 1, name: 'Roles and access', value: 'rolesAndAccess' },
      { id: 2, name: 'Mentor Management', value: 'mentorManagement' },
      { id: 3, name: 'Designation Master', value: 'designationMaster' }
    ]

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['tab']) {
        const tabValue = params['tab']
        const tabIndex = this.tabs.findIndex(tab => tab.value === tabValue)
        if (tabIndex >= 0) {
          this.selectedTabIndex = tabIndex
        }
      }
    })
  }

  getCurrentTabDetails(): TabDetails | null {
    if (this.tabs && this.tabs.length > this.selectedTabIndex) {
      return this.tabs[this.selectedTabIndex]
    }
    return null
  }

  onTabChange(tabIndex: number): void {
    this.selectedTabIndex = tabIndex
    const selectedTab = this.tabs[tabIndex]
    if (selectedTab && selectedTab.value) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { tab: selectedTab.value },
        queryParamsHandling: 'merge'
      })
    }
  }
}
