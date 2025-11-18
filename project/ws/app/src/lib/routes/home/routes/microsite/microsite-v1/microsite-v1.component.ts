import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

@Component({
  selector: 'ws-app-microsite-v1',
  templateUrl: './microsite-v1.component.html',
  styleUrls: ['./microsite-v1.component.scss']
})
export class MicrositeV1Component {
  slwConfig = {}
  sectionList = []
  channelName = '';
  orgId = '';
  isDefault = false;
  userRedirData: any = {}
  constructor(private route: ActivatedRoute, private configSvc: ConfigurationsService) {
    console.log('MicrositeV1Component initialized', this.configSvc)
    if (this.configSvc && this.configSvc.unMappedUser && this.configSvc.unMappedUser.channel) {
      this.channelName = this.configSvc.unMappedUser.channel
      this.orgId = this.configSvc.unMappedUser.rootOrgId
    }
    this.isDefault = this.route?.snapshot?.data?.formData?.default || false
    if (this.route.snapshot.data && this.route.snapshot.data.formData
      && this.route.snapshot.data.formData.data
      && this.route.snapshot.data.formData.data.sectionList
    ) {
      this.sectionList = this.route.snapshot.data.formData.data.sectionList
    }
    if (this.route.snapshot.data && this.route.snapshot.data.formData
      && this.route.snapshot.data.formData.data
      && this.route.snapshot.data.formData.data.stateLearningWeekConfig
    ) {
      this.slwConfig = this.route.snapshot.data.formData.data.stateLearningWeekConfig
    }
    if (this.route.snapshot.data && this.route.snapshot.data.formData
      && this.route.snapshot.data.formData.data
      && this.route.snapshot.data.formData.data.userRedirectionData
    ) {
      this.userRedirData = this.route.snapshot.data.formData.data.userRedirectionData
    }
  }
}
