import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import * as _ from 'lodash'

interface TabDetails {
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
      { name: 'Users', value: 'users' },
      { name: 'Roles and access', value: 'rolesAndAccess' },
      { name: 'Mentor Management', value: 'mentorManagement' },
      { name: 'Designation Master', value: 'designationMaster' },
      { name: 'User Onboarding', value: 'userOnboarding' },
      // { name: 'User Transfer', value: 'userTransfer' }
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

  onCreateUser(_event: any) {
    if (_event) {
      this.onTabChange(this.tabs.findIndex(tab => tab.value === 'userOnboarding'))
    }
  }

  showDesTab(event: any) {
    if (event) {
      this.onTabChange(this.tabs.findIndex(tab => tab.value === 'designationMaster'))
    }
  }

  onUserCreated(_event: any) {
    if (_event) {
      this.onTabChange(this.tabs.findIndex(tab => tab.value === 'users'))
    }
  }
}
