import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, NavigationExtras } from '@angular/router'
import { ConfigurationsService, NsPage, ValueService } from '@sunbird-cb/utils'
import { Subscription } from 'rxjs'
import { environment } from '../../../../../../../src/environments/environment'
import { ViewerDataService } from '../../viewer-data.service'

@Component({
  selector: 'viewer-viewer-top-bar',
  templateUrl: './viewer-top-bar.component.html',
  styleUrls: ['./viewer-top-bar.component.scss'],
  standalone: false,
})
export class ViewerTopBarComponent implements OnInit, OnDestroy {
  @Input() frameReference: any
  @Input() forPreview = false
  @Output() toggle = new EventEmitter()
  private viewerDataServiceSubscription: Subscription | null = null
  private paramSubscription: Subscription | null = null
  private viewerDataServiceResourceSubscription: Subscription | null = null
  appIcon: SafeUrl | null = null
  isTypeOfCollection = false
  collectionType: string | null = null
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  prevResourceUrlParams!: NavigationExtras
  nextResourceUrlParams!: NavigationExtras
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  resourceId: string = (this.viewerDataSvc.resourceId as string) || ''
  resourceName: string | null = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
  resourcePrimaryCategory: string | null = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.primaryCategory : ''
  collectionId = ''
  logo = true
  isPreview = false
  forChannel = false
  courseName = ''
  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private configSvc: ConfigurationsService,
    private viewerDataSvc: ViewerDataService,
    private valueSvc: ValueService,
  ) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.logo = !isXSmall
    })
  }

  ngOnInit() {
    if (window.location.href.includes('/channel/')) {
      this.forChannel = true
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    // if (this.configSvc.rootOrg === EInstance.INSTANCE) {
    // this.logo = false
    // }
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl( // NOSONAR
        // this.generateUrl(this.configSvc.instanceConfig.logos.app),
        this.configSvc.instanceConfig.logos.app,
      ) // NOSONAR
    }
    this.viewerDataServiceSubscription = this.viewerDataSvc.tocChangeSubject.subscribe(data => {
      if (data.prevResource) {
        this.prevResourceUrl = data.prevResource.viewerUrl
        // this.previousResourcePrimaryCategory = data.prevResource.primaryCategory
        this.prevResourceUrlParams = {
          queryParams: {
            primaryCategory: data.prevResource.primaryCategory,
            collectionId: data.prevResource.collectionId,
            collectionType: data.prevResource.collectionType,
            batchId: data.prevResource.batchId,
            viewMode: data.prevResource.viewMode,
            ...(window.location.href.includes('preview=true') ? { preview: true } : {}),
            ...(window.location.href.includes('editMode=true') ? { editMode: true } : {}),
            ...(window.location.href.includes('preAssessment=true') ? { preAssessment: true } : {}),
          },
          fragment: '',
        }
      } else {
        this.prevResourceUrl = null
      }
      if (data.nextResource) {
        this.nextResourceUrl = data.nextResource.viewerUrl
        // this.nextResourcePrimaryCategory = data.nextResource.primaryCategory
        this.nextResourceUrlParams = {
          queryParams: {
            primaryCategory: data.nextResource.primaryCategory,
            collectionId: data.nextResource.collectionId,
            collectionType: data.nextResource.collectionType,
            batchId: data.nextResource.batchId,
            viewMode: data.nextResource.viewMode,
            courseName: this.courseName,
            ...(window.location.href.includes('preview=true') ? { preview: true } : {}),
            ...(window.location.href.includes('editMode=true') ? { editMode: true } : {}),
            ...(window.location.href.includes('preAssessment=true') ? { preAssessment: true } : {}),
          },
          fragment: '',
        }
      } else {
        this.nextResourceUrl = null
      }
      if (this.resourceId !== this.viewerDataSvc.resourceId) {
        this.resourceId = this.viewerDataSvc.resourceId as string
        this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
        this.resourcePrimaryCategory = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.primaryCategory : ''
      }
    })
    this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
      this.collectionId = params.get('collectionId') as string
      this.isPreview = params.get('preview') === 'true' ? true : false
    })
    this.viewerDataServiceResourceSubscription = this.viewerDataSvc.changedSubject.subscribe(
      _data => {
        this.resourceId = this.viewerDataSvc.resourceId as string
        this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
      },
    )
    this.courseName = this.activatedRoute.snapshot.queryParams.courseName
  }
  generateUrl(oldUrl: string) {
    const chunk = oldUrl ? oldUrl.split('/') : []
    const newChunk = environment.azureHost.split('/')
    const newLink = []
    for (let i = 0; i < chunk.length; i += 1) {
      if (i === 2) {
        newLink.push(newChunk[i])
      } else if (i === 3) {
        newLink.push(environment.azureBucket)
      } else {
        newLink.push(chunk[i])
      }
    }
    const newUrl = newLink.join('/')
    return newUrl
  }

  ngOnDestroy() {
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceResourceSubscription) {
      this.viewerDataServiceResourceSubscription.unsubscribe()
    }
  }

  toggleSideBar() {
    this.toggle.emit()
  }

  back() {
    try {
      if (window.self !== window.top) {
        return
      }
      window.history.back()
    } catch (_ex) {
      window.history.back()
    }

  }
}
