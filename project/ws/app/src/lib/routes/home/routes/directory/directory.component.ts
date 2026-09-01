//#region (imports)
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import * as _ from 'lodash'
import { OrgHierarchyService } from '../../services/org-hierarchy.service'
//#endregion (imports)

@Component({
  selector: 'ws-app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss'],
  standalone: false
})

export class DirectoryComponent implements OnInit, AfterViewInit {

  @ViewChild('organisationTabContent') organisationTabContent!: TemplateRef<any>
  @ViewChild('organisationHierarchiesTabContent') organisationHierarchiesTabContent!: TemplateRef<any>
  @ViewChild('volunteerTabContent') volunteerTabContent!: TemplateRef<any>

  //#region (global variables)
  selectedTabIndex: number = 0;
  //#endregion (global variables)

  tabs: any = [
    { name: 'Organisation', value: 'organisation' },
    { name: 'Organisation Hierarchies', value: 'organisationHierarchies' },
    { name: 'Volunteer Organisations', value: 'volunteer' }
  ]

  constructor(
    private configSvc: ConfigurationsService,
    private orgHieService: OrgHierarchyService,
  ) { }

  ngOnInit(): void {
    this.setOrganisationTabVisibility()
  }

  ngAfterViewInit() {
    this.tabs?.map((tab: any) => {
      if (tab.value === 'organisation') {
        tab.temp = this.organisationTabContent
      } else if (tab.value === 'organisationHierarchies') {
        tab.temp = this.organisationHierarchiesTabContent
      } else if (tab.value === 'volunteer') {
        tab.temp = this.volunteerTabContent
      }
      return tab
    })
  }

  setOrganisationTabVisibility() {
    const ministryOrStateType = _.get(this.configSvc, 'orgReadData.ministryOrStateType', '')
    this.orgHieService.setUserRoles(_.get(this.configSvc, 'userRoles', []))
    const userRoles = this.orgHieService.getUserRoles()
    switch (ministryOrStateType?.toLowerCase()) {
      case 'ministry':
      case 'state':
        if (userRoles && (userRoles.has('mdo_leader') || userRoles.has('mdo_admin'))) {
          this.tabs = this.tabs.filter((tab: any) => tab.value !== 'organisation')
        } else {
          this.tabs = this.tabs.filter((tab: any) => tab.value !== 'organisation' && tab.value !== 'volunteer')
        }
        break
      case 'spv':
        if (userRoles && userRoles.has('mdo_admin')) {
          this.tabs = this.tabs.filter((tab: any) => tab.value !== 'organisation')
        }
        break
    }
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index
  }

}
