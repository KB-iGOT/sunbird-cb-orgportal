//#region (imports)
import { Component, OnInit } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import * as _ from 'lodash'
//#endregion (imports)

@Component({
  selector: 'ws-app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})

export class DirectoryComponent implements OnInit {

  //#region (global variables)
  selectedTabIndex: number = 0;
  showOrganisationTab: boolean = false;
  //#endregion (global variables)

  constructor(
    private configSvc: ConfigurationsService
  ) { }

  ngOnInit(): void {
    this.setOrganisationTabVisibility()
  }

  setOrganisationTabVisibility() {
    const sbOrgType = _.get(this.configSvc, 'orgReadData.sbOrgType', '')
    if (sbOrgType === 'ministry') {
      this.showOrganisationTab = true
    } else {
      this.showOrganisationTab = false
    }
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index
  }

}
