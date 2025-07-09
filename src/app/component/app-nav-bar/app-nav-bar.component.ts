import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { IBtnAppsConfig, CustomTourService } from '@sunbird-cb/collection'
import { NsWidgetResolver } from '@sunbird-cb/resolver'
import { ConfigurationsService, EventService, NsInstanceConfig, NsPage } from '@sunbird-cb/utils'
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router'
import { LibNotificationsService } from '@sunbird-cb/notification'
import { NotificationsService } from '../../services/notifications.service'
import * as _ from 'lodash'
import { Subscription } from 'rxjs'
import { environment } from '../../../environments/environment'
import { MatSnackBar } from '@angular/material/snack-bar'
@Component({
  selector: 'ws-app-nav-bar',
  templateUrl: './app-nav-bar.component.html',
  styleUrls: ['./app-nav-bar.component.scss'],
})
export class AppNavBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode: 'top' | 'bottom' = 'top'
  @Input() notificationsCount: any = 0
  // @Input()
  // @HostBinding('id')
  // public id!: string
  basicBtnAppsConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonApps',
    widgetData: { allListingUrl: '/app/features' },
  }
  instanceVal = ''
  btnAppsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  appIcon: SafeUrl | null = null
  appBottomIcon?: SafeUrl
  primaryNavbarBackground: Partial<NsPage.INavBackground> | null = null
  primaryNavbarConfig: NsInstanceConfig.IPrimaryNavbarConfig | null = null
  pageNavbar: Partial<NsPage.INavBackground> | null = null
  featureApps: string[] = []
  isHelpMenuRestricted = false
  isTourGuideAvailable = false
  isTourGuideClosed = false
  showAppNavBar = false
  isSetUpPage = false
  popupTour: any
  showDropdown: boolean = false
  private myNotificationsSubscription!: Subscription
  environment: any
  roles: string[] = []
  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private tourService: CustomTourService,
    private router: Router,
    private libNotificationsService: LibNotificationsService,
    private notificationsService: NotificationsService,
    private events: EventService,
    private snackBar: MatSnackBar,
  ) {
    this.environment = environment
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    if (this.configSvc.restrictedFeatures) {
      this.isHelpMenuRestricted = this.configSvc.restrictedFeatures.has('helpNavBarMenu')
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.cancelTour()
      } else if (event instanceof NavigationEnd) {
        this.routeSubs(event)
        this.cancelTour()
      }
    })
    if (this.configSvc && this.configSvc.unMappedUser && this.configSvc.unMappedUser.roles) {
      this.roles = this.configSvc.unMappedUser.roles
    }
  }

  ngOnInit() {
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        if (e.url.includes('/public/logout')) {
          this.showAppNavBar = false
        } else if ((e.url.includes('/app/setup') && this.configSvc.instanceConfig && !this.configSvc.instanceConfig.showNavBarInSetup)) {
          this.showAppNavBar = false
        } else {
          this.showAppNavBar = true
        }
      }
    })

    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
      this.instanceVal = this.configSvc.rootOrg || ''
      if (this.configSvc.instanceConfig.logos.appBottomNav) {
        this.appBottomIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.appBottomNav,
        )
      }
      this.primaryNavbarBackground = this.configSvc.primaryNavBar
      this.pageNavbar = this.configSvc.pageNavBar
      this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
    }
    if (this.configSvc.appsConfig) {
      this.featureApps = Object.keys(this.configSvc.appsConfig.features)
    }
    this.configSvc.tourGuideNotifier.subscribe(canShow => {
      if (
        this.configSvc.restrictedFeatures &&
        !this.configSvc.restrictedFeatures.has('tourGuide')
      ) {
        this.isTourGuideAvailable = canShow
        this.popupTour = this.tourService.createPopupTour()
      }
    })
    if (this.configSvc.unMappedUser && this.configSvc.unMappedUser.identifier) {
      //this.getMyCount()
    }

    this.myNotificationsSubscription = this.libNotificationsService._unreadCount.subscribe((res: boolean) => {
      if (res === true) {
        //this.getMyCount()
      }
    })
  }

  routeSubs(e: NavigationEnd) {
    // this.router.events.subscribe((e: Event) => {
    //   if (e instanceof NavigationEnd) {
    if (e.url.includes('/app/setup')) {
      this.isSetUpPage = true
    } else {
      this.isSetUpPage = false
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'mode') {
        if (this.mode === 'bottom') {
          this.btnAppsConfig = {
            ...this.basicBtnAppsConfig,
            widgetData: {
              ...this.basicBtnAppsConfig.widgetData,
              showTitle: true,
            },
          }
        } else {
          this.btnAppsConfig = {
            ...this.basicBtnAppsConfig,
          }
        }
      }
    }
  }

  startTour() {
    this.tourService.startTour()
    this.tourService.isTourComplete.subscribe((result: boolean) => {
      if ((result)) {
        this.tourService.startPopupTour()
        this.configSvc.completedTour = true
        this.configSvc.prefChangeNotifier.next({ completedTour: this.configSvc.completedTour })
        // this.tour = tour
        setTimeout(
          () => {
            this.tourService.cancelPopupTour()
          },
          3000,
        )
      }
    })
  }
  cancelTour() {
    if (this.popupTour) {
      this.tourService.cancelPopupTour()
      this.isTourGuideClosed = false
    }

  }

  showDashboard() {
    this.router.navigateByUrl('app/my-dashboard-temp/temp')
  }

  onBellClick() {
    this.showDropdown = false
    setTimeout(() => {
      this.showDropdown = true
    })
  }
  onMenuClosed() {
    this.showDropdown = false
  }

  viewAllClick(event: any) {
    if (event.category) {
      this.raiseTelemetryEventForNotification(event)
      if (event.category === 'PROFILE') {
        this.router.navigate([`app/home/approvals/approval`])
      } else if (event.category === 'LEARN') {
        let url = `${this.environment.portalsForNotifications.portal}/app/toc/${event.message.data.id}`
        window.open(url, '_blank')
      } else if (event.category === 'EVENT') {
        let url = `${this.environment.portalsForNotifications.portal}/app/event-hub/home/${event.message.data.id}`
        window.open(url, '_blank')
      } else if (event.category === 'DISCUSSION') {
        let url = `${this.environment.portalsForNotifications.portal}/app/discussion-forum-v2/community/${event.message.data.communityId}/${event.message.data.discussionId}`
        window.open(url, '_blank')
      } else if (event?.category?.includes('CONTENT')) {
        this.notificationsService.getContentData(event.message.data.id).subscribe((res: any) => {
          let isStandaloneResource = false
          if (res.primaryCategory === 'Learning Resource' &&
            res.resourceCategory !== 'Learning Resource') {
            localStorage.setItem('isStandaloneResource', 'true')
            isStandaloneResource = true
          } else {
            localStorage.setItem('isStandaloneResource', 'false')
          }
          if (res.status === 'Live') {
            window.open(`${environment.portalsForNotifications.cbp}/author/content-detail/${event.message.data.id}/overview-v2?isStandaloneResource=${isStandaloneResource}`, '_blank')
          } else if (res.status === 'Draft') {
            if (this.roles.includes('CONTENT_CREATOR')) {
              window.open(`${environment.portalsForNotifications.cbp}/author/editor/${event.message.data.id}/collectionV2?isStandaloneResource=${isStandaloneResource}`, '_blank')
            } else {
              this.snackBar.open('You are not authorized to view this content.')
            }
          } else if (res.status === 'Review') {
            switch (res.reviewStatus) {
              case 'InReview': {
                if (this.roles.includes('CONTENT_REVIEWER')) {
                  window.open(`${environment.portalsForNotifications.cbp}/author/editor/${event.message.data.id}/collectionV2?isStandaloneResource=${isStandaloneResource}&preview=true&editMode=true&status=Review&reviewStatus=${res.reviewStatus}`, '_blank')
                } else {
                  this.snackBar.open("You are not authorized to view this content.")
                }
                break
              } case 'Reviewed': {
                if (this.roles.includes('CONTENT_PUBLISHER')) {
                  window.open(`${environment.portalsForNotifications.cbp}/author/editor/${event.message.data.id}/collectionV2?isStandaloneResource=${isStandaloneResource}`, '_blank')
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
      this.router.navigate(['/app/home/notifications'], { queryParams: { tab: event } })
    }
  }

  getMyCount() {
    this.notificationsService.getNotificationsData().subscribe((res: any) => {
      this.notificationsCount = _.get(res, 'result.unread', 0)
    }, error => {
      console.error('Error while fetching notifications count', error)
      this.notificationsCount = 0
    })
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

  ngOnDestroy() {
    if (this.myNotificationsSubscription) {
      this.myNotificationsSubscription.unsubscribe()
    }
  }
}
