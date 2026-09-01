import { Component, OnDestroy, OnInit } from '@angular/core'
import { ReportsVideoComponent } from '../reports-video/reports-video.component'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { IOnBoardingConfig } from './interface/onboarding.interface'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Subscription } from 'rxjs'
import { environment } from '../../../../../../../../../src/environments/environment'

@Component({
    selector: 'ws-app-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.scss'],
    standalone: false
})
export class OnboardingComponent implements OnInit, OnDestroy {
  onboardingNoteList: string[] = []
  configSvc: any
  currentRoute = 'self-registration'
  onBoardingConfig: IOnBoardingConfig | undefined
  routeSubscription: Subscription = new Subscription()
  panelOpenState = false
  constructor(
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {

    this.configSvc = this.activatedRoute.snapshot.data.configService
    this.onBoardingConfig = this.activatedRoute.snapshot.data.pageData.data

    this.onboardingNoteList = this.onBoardingConfig?.featureInformation?.notesList || []

    this.updateCurrentRoute()

    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentRoute()
      }
    })

  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html)
  }

  openVideoPopup(): void {
    const url = `${environment.karmYogiPath}${this.onBoardingConfig?.featureInformation?.onBoardingVideo}`

    this.dialog.open(ReportsVideoComponent, {
      data: {
        videoLink: url,
      },
      disableClose: true,
      width: "675px",
      height: "400px"
    })
  }

  routeTo(route: string): void {
    this.router.navigate([`/app/home/onboarding/${route}`])
  }

  updateCurrentRoute(): void {
    const urlSegments = this.router.url.split('/')
    this.currentRoute = urlSegments[urlSegments.length - 1]
  }
}
