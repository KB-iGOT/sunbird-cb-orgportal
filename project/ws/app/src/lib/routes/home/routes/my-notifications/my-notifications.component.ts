import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils-v2'
import { environment } from '../../../../../../../../../src/environments/environment'
import { NotificationsService } from '../../../../../../../../../src/app/services/notifications.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
    selector: 'ws-app-my-notifications',
    templateUrl: './my-notifications.component.html',
    styleUrls: ['./my-notifications.component.scss'],
    standalone: false
})
export class MyNotificationsComponent {
  environment: any
  roles: string[] = []

  constructor(private router: Router, private events: EventService,
    private configSvc: ConfigurationsService,
    private notificationsService: NotificationsService,
    private snackBar: MatSnackBar,
  ) {
    if (this.configSvc && this.configSvc.unMappedUser && this.configSvc.unMappedUser.roles) {
      this.roles = this.configSvc.unMappedUser.roles
    }
    this.environment = environment
  }

  redirectTo(notification: any) {
    if (notification.category) {
      this.raiseTelemetryEventForNotification(notification)
      this.notificationsService.handleRedirection(notification, this.environment, this.roles, this.snackBar)
    } else {
      this.router.navigate(['/app/home/notifications'], { queryParams: { tab: notification } })
    }
  }

  raiseTelemetryEventForNotification(notification: any) {
    this.events.raiseInteractTelemetry(
      {
        type: 'click',
        subType: 'notification-engine',
        id: notification.notification_id,
      },
      {},
      {
        module: 'Home',
      }
    )
  }

}
