import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { EventService } from '@sunbird-cb/utils'

@Component({
  selector: 'ws-app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.scss']
})
export class MyNotificationsComponent {

  constructor(private router: Router, private events: EventService) { }

  redirectTo(notification: any) {
    if (notification.category) {
      this.raiseTelemetryEventForNotification(notification)
      if (notification.category === 'PROFILE') {
        this.router.navigate([`app/home/approvals/approval`])
      } else {
        this.router.navigate(['/app/home/notifications'])
      }
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
