import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import * as _ from 'lodash'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'
import { OrgHierarchyService } from '../../../services/org-hierarchy.service'
import { map } from 'rxjs/operators'

interface TabDetails {
  name: string
  value: string
}

@Component({
  selector: 'ws-app-user-onboarding',
  templateUrl: './user-onboarding.component.html',
  styleUrls: ['./user-onboarding.component.scss']
})
export class UserOnboardingComponent implements OnInit {

  createUserTabs: TabDetails[] = [];
  selectedTab: any
  orgData: any
  frameworkOrgData: any

  @Output() userCreated = new EventEmitter<boolean>()
  @Output() showDesignationTab = new EventEmitter<boolean>()

  constructor(
    private activeRouter: ActivatedRoute,
    private loaderService: LoaderService,
    private orgHieService: OrgHierarchyService,
  ) { }

  ngOnInit(): void {
    const queryParam = _.get(this.activeRouter, 'snapshot.queryParams')
    if (queryParam) {
      this.orgData = queryParam
    }
    this.createUserTabs = [
      { name: 'Bulk Creation', value: 'bulkCreation' },
      { name: 'Custom Registration Link', value: 'customRegLink' },
      { name: 'Individual Creation', value: 'individualCreation' }
    ]

    this.selectedTab = this.createUserTabs.find(tab => tab.value === 'individualCreation')
  }

  async onTabChange(item: any) {
    if (item.value === 'customRegLink') {
      const orgReadPromise: Promise<any>[] = []
      orgReadPromise.push(this.getOrgData())
      await Promise.all(orgReadPromise)
    }
    this.selectedTab = item
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
        map((data: any) => {
          return data.result.response
        })
      ).subscribe((_res) => {
        this.frameworkOrgData = _res
        resolve(true)
        this.loaderService.changeLoaderState(false)
      })
    })
  }

  navigateToDesignation(event: any) {
    this.showDesignationTab.emit(event)
  }

  onUserCreated(event: boolean) {
    this.userCreated.emit(event)
  }

}
