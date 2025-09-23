import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import * as _ from 'lodash'

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

  @Output() userCreated = new EventEmitter<boolean>()

  constructor(
    private activeRouter: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const queryParam = _.get(this.activeRouter, 'snapshot.queryParams')
    if (queryParam) {
      this.orgData = queryParam
    }
    this.createUserTabs = [
      { name: 'Bulk Creation', value: 'bulkCreation' },
      // { name: 'Custom Registration Link', value: 'customRegLink' },
      { name: 'Individual Creation', value: 'individualCreation' }
    ]

    this.selectedTab = this.createUserTabs.find(tab => tab.value === 'individualCreation')
  }

  onTabChange(item: any) {
    this.selectedTab = item
  }

  onUserCreated(event: boolean) {
    this.userCreated.emit(event)
  }

}
