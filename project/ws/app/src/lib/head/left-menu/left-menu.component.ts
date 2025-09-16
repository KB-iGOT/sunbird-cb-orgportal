import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UploadLogoDialogComponent } from './upload-logo-dialog/upload-logo-dialog/upload-logo-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import _ from 'lodash'
// import { ConfigurationsService } from '@sunbird-cb/utils'
// import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
// import { ILeftMenu, IMenu } from './left-menu-v1.model'
// import { defaultImg } from './img.json'
@Component({
  selector: 'ws-widget-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
})
export class LeftMenuComponent implements OnInit, OnDestroy {
  @Input() widgetData!: any
  @Input() myRoles: any = []
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<
    HTMLInputElement
  >
  mdoname: any
  logo: any
  menulist: any = []
  logoUrl: string = ''
  orgData: any
  orgName = ''
  rootOrgId = ''
  channelName = ''

  constructor(private activatedRoute: ActivatedRoute, private router: Router, public dialog: MatDialog,
    private matSnackBar: MatSnackBar,

    // private configSvc: ConfigurationsService,
  ) { }
  ngOnDestroy(): void { }

  ngOnInit(): void {
    this.mdoname = this.widgetData ? this.widgetData.widgetData.name : ''
    this.orgData = this.widgetData ? this.widgetData.widgetData.logoPath : '../assets/icons/govtlogo.jpg'
    this.menulist = this.widgetData ? this.widgetData.widgetData.menusList : []
    this.orgRead()

  }
  onEditLogoClick(): void {
    this.fileInput.nativeElement.click()
  }

  orgRead() {
    const orgdata = _.get(this.activatedRoute, 'snapshot.data.configService.unMappedUser.rootOrg')
    if (orgdata) {
      const templogo = _.get(this.activatedRoute, 'snapshot.data.configService.unMappedUser.rootOrg.logo')
      this.orgData = templogo ? templogo : '../assets/icons/govtlogo.jpg'
      this.orgName = orgdata?.orgName
      this.rootOrgId = orgdata?.rootOrgId
      this.channelName = orgdata?.channel
    }

  }

  fileChangeEvent(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]
      // Allow only jpg, jpeg, png
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        this.matSnackBar.open('Only JPG, JPEG, and PNG formats are allowed.', 'X', { panelClass: ['error'] })
        return
      }
      // File size check (5 MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.matSnackBar.open(`File size exceeds 5 MB. Please select a smaller file.`, 'X', { panelClass: ['error'] })
        return
      }
      this.openCropperDialog(file)
    }
  }
  openCropperDialog(file: File): void {
    const dialogRef = this.dialog.open(UploadLogoDialogComponent, {
      width: 'auto', // Adjust as needed for better display
      height: 'auto',
      data: {
        file: file,
        orgName: this.orgName,
        rootOrgId: this.rootOrgId
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.orgData = result
      }
    })

  }
  public isLinkActive(url?: string, index?: number): boolean {
    let returnVal = false
    if (url && index) {
      returnVal = (this.activatedRoute.snapshot.fragment === url)
    } else if (index === 0) {
      returnVal = true
    } else {
      returnVal = false
    }
    return returnVal
  }
  public isLinkActive2(url?: string): boolean {
    let returnval = false
    if (url) {
      const st = this.router.url.split('?')
      if (st && st[0] && st[0] === (url)) {
        returnval = true
      }
    }
    return returnval
  }
  getLink(tab: any) {
    if (tab && tab.customRouting && this.activatedRoute.snapshot && this.activatedRoute.snapshot.firstChild && tab.paramaterName) {
      return (tab.routerLink.replace('<param>', this.activatedRoute.snapshot.firstChild.params[tab.paramaterName]))
    }
    return
  }

  isAllowed(tab: any): boolean {
    let returnValue = false
    if (tab && tab.requiredRoles && tab.requiredRoles.length > 0) {
      (tab.requiredRoles).forEach((v: any) => {
        if ((this.myRoles || new Set()).has(v)) {
          returnValue = true
        }
      })
    } else {
      returnValue = true
    }
    return returnValue
  }
}
