import { Component } from '@angular/core'
import { FormControl } from '@angular/forms'

@Component({
  selector: 'ws-app-community-manage',
  templateUrl: './community-manage.component.html',
  styleUrls: ['./community-manage.component.scss']
})
export class CommunityManageComponent {
  selectedTabIndex = 0
  pageNumber = 0;
  searchControl = new FormControl('');

  currentStatus = 'active'
  tabs = [
    {
      label: 'Active Reports',
      status: 'active',
      icon: '' // Optional: Add Material icons
    },
    {
      label: 'Action History',
      status: 'history',
      icon: ''
    }
    // {
    //   label: 'Archived',
    //   status: 'inactive',
    //   icon: 'archive'
    // }
  ]

  onTabChange(event: any) {
    this.selectedTabIndex = event.index
    this.currentStatus = this.tabs[event.index].status
    this.pageNumber = 0 // Reset to first page on tab change


  }

}
