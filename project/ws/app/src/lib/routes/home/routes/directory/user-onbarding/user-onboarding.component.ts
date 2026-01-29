import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import * as _ from 'lodash'
import { OrgHierarchyService } from '../../../services/org-hierarchy.service'

interface TabDetails {
  name: string
  value: string
}

@Component({
    selector: 'ws-app-user-onboarding',
    templateUrl: './user-onboarding.component.html',
    styleUrls: ['./user-onboarding.component.scss'],
    standalone: false
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
      this.frameworkOrgData = this.orgHieService.getOrgData()
    }
    this.selectedTab = item
  }



  navigateToDesignation(event: any) {
    this.showDesignationTab.emit(event)
  }

  onUserCreated(event: boolean) {
    this.userCreated.emit(event)
  }

}
