import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils'
import { environment } from '../../../../../../../../../src/environments/environment'
import { NotificationsService } from '../../../../../../../../../src/app/services/notifications.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'ws-app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.scss']
})
export class MyNotificationsComponent {
  environment: any
  roles: string[] = []

  constructor(private router: Router, private events: EventService,
    private configSvc: ConfigurationsService, private snackBar: MatSnackBar,
    private notificationsService: NotificationsService,
  ) {
    if (this.configSvc && this.configSvc.unMappedUser && this.configSvc.unMappedUser.roles) {
      this.roles = this.configSvc.unMappedUser.roles
    }
    this.environment = environment
  }

  redirectTo(notification: any) {
    if (notification.category) {
      this.raiseTelemetryEventForNotification(notification)
      if (notification.category === 'PROFILE') {
        this.router.navigate([`app/home/approvals/approval`])
      } else if (notification.category === 'LEARN') {
        let url = `${this.environment.portalsForNotifications.portal}/app/toc/${notification.message.data.id}`
        window.open(url, '_blank')
      } else if (notification.category === 'EVENT') {
        let url = `${this.environment.portalsForNotifications.portal}/app/event-hub/home/${notification.message.data.id}`
        window.open(url, '_blank')
      } else if (notification.category === 'DISCUSSION') {
        let url = `${this.environment.portalsForNotifications.portal}/app/discussion-forum-v2/community/${notification.message.data.communityId}/${notification.message.data.discussionId}`
        window.open(url, '_blank')
      } else if (notification?.category?.includes('CONTENT')) {
        this.notificationsService.getContentData(notification.message.data.id).subscribe((res: any) => {
          let isStandaloneResource = false
          if (res.primaryCategory === 'Learning Resource' &&
            res.resourceCategory !== 'Learning Resource') {
            localStorage.setItem('isStandaloneResource', 'true')
            isStandaloneResource = true
          } else {
            localStorage.setItem('isStandaloneResource', 'false')
          }
          if (res.status === 'Live') {
            window.open(`${environment.portalsForNotifications.cbp}/author/content-detail/${notification.message.data.id}/overview-v2?isStandaloneResource=${isStandaloneResource}`, '_blank')
          } else if (res.status === 'Draft') {
            if (this.roles.includes('CONTENT_CREATOR')) {
              window.open(`${environment.portalsForNotifications.cbp}/author/editor/${notification.message.data.id}/collectionV2?isStandaloneResource=${isStandaloneResource}`, '_blank')
            } else {
              this.snackBar.open('You are not authorized to view this content.')
            }
          } else if (res.status === 'Review') {
            switch (res.reviewStatus) {
              case 'InReview': {
                if (this.roles.includes('CONTENT_REVIEWER')) {
                  window.open(`${environment.portalsForNotifications.cbp}/author/editor/${notification.message.data.id}/collectionV2?isStandaloneResource=${isStandaloneResource}&preview=true&editMode=true&status=Review&reviewStatus=${res.reviewStatus}`, '_blank')
                } else {
                  this.snackBar.open("You are not authorized to view this content.")
                }
                break
              } case 'Reviewed': {
                if (this.roles.includes('CONTENT_PUBLISHER')) {
                  window.open(`${environment.portalsForNotifications.cbp}/author/editor/${notification.message.data.id}/collectionV2?isStandaloneResource=${isStandaloneResource}`, '_blank')
                } else {
                  this.snackBar.open("You are not authorized to view this content.")
                }
                break
              }
            }
          } else if (res.status === 'Retired') {
            this.snackBar.open('This content is retired.')
          }
        })
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
