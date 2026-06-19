import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { OrgHierarchyService } from '../../../services/org-hierarchy.service'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'

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
    const resolvedData = this.activatedRoute.snapshot.data['orgUsersData']
    if (resolvedData && !resolvedData.error) {
      this.orgData = this.activatedRoute.snapshot.queryParams
      this.orgDataLoaded = true
    }

    const parentOrgData = this.orgHieService.getParentOrgData()
    if (parentOrgData && parentOrgData.isNgo) {
      this.tabs = [
        { name: 'Users', value: 'users' },
        { name: 'User Onboarding', value: 'userOnboarding' },
      ]
    } else {
      this.tabs = [
        { name: 'Users', value: 'users' },
        { name: 'Roles and access', value: 'rolesAndAccess' },
        { name: 'Mentor Management', value: 'mentorManagement' },
        { name: 'Designation Master', value: 'designationMaster' },
        { name: 'User Onboarding', value: 'userOnboarding' },
        { name: 'User Transfer', value: 'userTransfer' }
      ]
    }
    // this.checkAndGetOrgData()

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

  // async checkAndGetOrgData() {
  //   const orgReadPromise: Promise<any>[] = []
  //   orgReadPromise.push(this.getOrgData())
  //   await Promise.all(orgReadPromise)
  // }

  getCurrentTabDetails(): TabDetails | null {
    if (this.tabs && this.tabs.length > this.selectedTabIndex) {
      return this.tabs[this.selectedTabIndex]
    }
    return null
  }

  onTabChange(tabIndex: number): void {
    this.selectedTabIndex = tabIndex
    this.loaderService.changeLoaderState(false)
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

  // getOrgData() {
  //   return new Promise<boolean>((resolve) => {
  //     const requestBody = {
  //       request: {
  //         organisationId: this.orgData.roleId,
  //       }
  //     }
  //     this.loaderService.changeLoaderState(true)
  //     this.orgHieService.getOrgReadData(requestBody).pipe(
  //       switchMap((data: any) => {
  //         if (data?.result?.response?.ministryOrStateType === 'ministry') {
  //           const parentReqBody = {
  //             request: {
  //               organisationId: data?.result?.response?.ministryOrStateId,
  //             }
  //           }
  //           return this.orgHieService.getOrgReadData(parentReqBody).pipe(
  //             map((ministryData: any) => {
  //               return {
  //                 orgData: data.result.response,
  //                 parentOrgData: ministryData.result.response
  //               }
  //             })
  //           )
  //         }
  //         return of(null)
  //       })
  //     ).subscribe((_res) => {
  //       this.orgHieService.setOrgData(_res?.orgData)
  //       this.orgHieService.setParentOrgData(_res?.parentOrgData)
  //       this.orgDataLoaded = true
  //       resolve(true)
  //       this.loaderService.changeLoaderState(false)
  //     })
  //   })
  // }
}
