//#region (imports)
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import * as _ from 'lodash'
//#endregion (imports)

@Component({
  selector: 'ws-app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
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
    private configSvc: ConfigurationsService
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
    switch (ministryOrStateType) {
      case 'ministry':
        this.tabs = this.tabs.filter((tab: any) => tab.value !== 'organisation')
        break
    }
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index
  }

}
