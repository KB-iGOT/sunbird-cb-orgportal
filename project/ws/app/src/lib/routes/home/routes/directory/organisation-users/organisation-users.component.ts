import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import * as _ from 'lodash'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'
import { OrgHierarchyService } from '../../../services/org-hierarchy.service'
import { map, switchMap } from 'rxjs/operators'
import { of } from 'rxjs'

interface TabDetails {
  name: string
  content?: any
  value?: string
}

@Component({
    selector: 'ws-app-organisation-users',
    templateUrl: './organisation-users.component.html',
    styleUrls: ['./organisation-users.component.scss'],
    standalone: false
})
export class OrganisationUsersComponent implements OnInit {
  selectedTabIndex = 0;
  tabs: TabDetails[] = [];
  orgData: any
  orgDataLoaded: boolean = false

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService,
    private orgHieService: OrgHierarchyService,
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
      { name: 'User Transfer', value: 'userTransfer' }
    ]

    this.checkAndGetOrgData()

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

  async checkAndGetOrgData() {
    const orgReadPromise: Promise<any>[] = []
    orgReadPromise.push(this.getOrgData())
    await Promise.all(orgReadPromise)
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

  getOrgData() {
    return new Promise<boolean>((resolve) => {
      const requestBody = {
        request: {
          organisationId: this.orgData.roleId,
        }
      }
      this.loaderService.changeLoaderState(true)
      this.orgHieService.getOrgReadData(requestBody).pipe(
        switchMap((data: any) => {
          if (data?.result?.response?.ministryOrStateType === 'ministry') {
            const parentReqBody = {
              request: {
                organisationId: data?.result?.response?.ministryOrStateId,
              }
            }
            return this.orgHieService.getOrgReadData(parentReqBody).pipe(
              map((ministryData: any) => {
                return {
                  orgData: data.result.response,
                  parentOrgData: ministryData.result.response
                }
              })
            )
          }
          return of(null)
        })
      ).subscribe((_res) => {
        this.orgHieService.setOrgData(_res?.orgData)
        this.orgHieService.setParentOrgData(_res?.parentOrgData)
        this.orgDataLoaded = true
        resolve(true)
        this.loaderService.changeLoaderState(false)
      })
    })
  }
}
