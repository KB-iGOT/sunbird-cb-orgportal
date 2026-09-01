import { Component } from '@angular/core'
import { ConfigurationsService, ValueService } from '@sunbird-cb/utils-v2'

@Component({
    selector: 'ws-app-footer',
    templateUrl: './app-footer.component.html',
    styleUrls: ['./app-footer.component.scss'],
    standalone: false
})
export class AppFooterComponent {

  isXSmall = false
  termsOfUser = true
  // copyrightYears = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

  constructor(
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService
  ) {
    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('termsOfUser')) {
        this.termsOfUser = false
      }
    }
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }

}
