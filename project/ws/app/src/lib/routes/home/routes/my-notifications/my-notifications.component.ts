import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.scss']
})
export class MyNotificationsComponent {

  constructor(private router: Router,) { }

  redirectTo(notification: any) {
    if (notification.category) {
      if (notification.category === 'PROFILE') {
        this.router.navigate([`app/home/approvals/approval`])
      } else {
        this.router.navigate(['/app/home/notifications'])
      }
    } else {
      this.router.navigate(['/app/home/notifications'], { queryParams: { tab: notification } })
    }
  }

}
