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

  //#region (global variables)
  selectedTabIndex: number = 0;
  //#endregion (global variables)

  tabs: any = [
    { name: 'Organisation', value: 'organisation' },
    { name: 'Organisation Hierarchies', value: 'organisationHierarchies' }
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
      }
      return tab
    })
  }

  setOrganisationTabVisibility() {
    const ministryOrStateType = _.get(this.configSvc, 'orgReadData.ministryOrStateType', '')
    this.orgHieService.setUserRoles(_.get(this.configSvc, 'userRoles', []))
    switch (ministryOrStateType?.toLowerCase()) {
      case 'ministry':
      case 'state':
        this.tabs = this.tabs.filter((tab: any) => tab.value !== 'organisation')
        break
      case 'spv':
        const userRoles = this.orgHieService.getUserRoles()
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
